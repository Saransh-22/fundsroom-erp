import { query, getClient } from '../config/database';
import { Product, StockMovement } from '../types/domain';

export const getProducts = async (search?: string, category?: string, lowStockOnly?: boolean, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(product_name ILIKE $${params.length} OR sku ILIKE $${params.length} OR location ILIKE $${params.length})`);
  }

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (lowStockOnly) {
    conditions.push(`current_stock <= min_stock_alert`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) FROM products ${whereClause};`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const queryParams = [...params, limit, offset];
  const dataResult = await query<Product>(
    `SELECT *, (current_stock <= min_stock_alert) as is_low_stock
     FROM products ${whereClause} ORDER BY id DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};`,
    queryParams
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    products: dataResult.rows,
  };
};

export const getProductById = async (id: number) => {
  const result = await query<Product>(
    `SELECT *, (current_stock <= min_stock_alert) as is_low_stock FROM products WHERE id = $1;`,
    [id]
  );
  const product = result.rows[0];
  if (!product) {
    const error: any = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const createProduct = async (data: Partial<Product>) => {
  const { product_name, sku, category, unit_price, current_stock, min_stock_alert, location, image_url } = data;

  if (!product_name || !sku || !category || unit_price === undefined || current_stock === undefined || min_stock_alert === undefined || !location) {
    const error: any = new Error('Missing required product fields');
    error.statusCode = 400;
    throw error;
  }

  if (unit_price < 0 || current_stock < 0 || min_stock_alert < 0) {
    const error: any = new Error('Prices and stock quantities cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  const skuCheck = await query('SELECT id FROM products WHERE sku = $1;', [sku]);
  if (skuCheck.rows.length > 0) {
    const error: any = new Error('Product with this SKU already exists');
    error.statusCode = 409;
    throw error;
  }

  const result = await query<Product>(
    `INSERT INTO products (product_name, sku, category, unit_price, current_stock, min_stock_alert, location, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *, (current_stock <= min_stock_alert) as is_low_stock;`,
    [product_name, sku, category, unit_price, current_stock, min_stock_alert, location, image_url || null]
  );

  return result.rows[0];
};

export const updateProduct = async (id: number, data: Partial<Product>) => {
  await getProductById(id);

  const { product_name, sku, category, unit_price, current_stock, min_stock_alert, location, image_url } = data;

  if (unit_price !== undefined && unit_price < 0) {
    const error: any = new Error('Unit price cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  if (current_stock !== undefined && current_stock < 0) {
    const error: any = new Error('Current stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  if (min_stock_alert !== undefined && min_stock_alert < 0) {
    const error: any = new Error('Minimum stock alert cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  if (sku) {
    const skuCheck = await query('SELECT id FROM products WHERE sku = $1 AND id != $2;', [sku, id]);
    if (skuCheck.rows.length > 0) {
      const error: any = new Error('Product with this SKU already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  const result = await query<Product>(
    `UPDATE products
     SET product_name = COALESCE($1, product_name),
         sku = COALESCE($2, sku),
         category = COALESCE($3, category),
         unit_price = COALESCE($4, unit_price),
         current_stock = COALESCE($5, current_stock),
         min_stock_alert = COALESCE($6, min_stock_alert),
         location = COALESCE($7, location),
         image_url = COALESCE($8, image_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *, (current_stock <= min_stock_alert) as is_low_stock;`,
    [product_name, sku, category, unit_price, current_stock, min_stock_alert, location, image_url, id]
  );

  return result.rows[0];
};

export const adjustStock = async (productId: number, quantityChanged: number, movementType: 'IN' | 'OUT', reason: string, createdBy: number) => {
  if (!quantityChanged || quantityChanged <= 0) {
    const error: any = new Error('Quantity changed must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  if (!['IN', 'OUT'].includes(movementType)) {
    const error: any = new Error('Movement type must be IN or OUT');
    error.statusCode = 400;
    throw error;
  }

  if (!reason || reason.trim().length === 0) {
    const error: any = new Error('Stock adjustment reason is required');
    error.statusCode = 400;
    throw error;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN;');

    const productRes = await client.query<Product>(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE;',
      [productId]
    );

    const product = productRes.rows[0];
    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    let newStock = product.current_stock;
    if (movementType === 'IN') {
      newStock += quantityChanged;
    } else {
      if (product.current_stock < quantityChanged) {
        const error: any = new Error(`Insufficient stock for ${product.product_name}. Available: ${product.current_stock}, Requested reduction: ${quantityChanged}`);
        error.statusCode = 400;
        throw error;
      }
      newStock -= quantityChanged;
    }

    const updatedProductRes = await client.query<Product>(
      `UPDATE products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *, (current_stock <= min_stock_alert) as is_low_stock;`,
      [newStock, productId]
    );

    const movementRes = await client.query<StockMovement>(
      `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [productId, quantityChanged, movementType, reason, createdBy]
    );

    await client.query('COMMIT;');

    return {
      product: updatedProductRes.rows[0],
      stock_movement: movementRes.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK;');
    throw error;
  } finally {
    client.release();
  }
};

export const getStockMovements = async (productId?: number) => {
  const params: any[] = [];
  let whereClause = '';

  if (productId) {
    params.push(productId);
    whereClause = 'WHERE sm.product_id = $1';
  }

  const result = await query<StockMovement>(
    `SELECT sm.*, p.product_name, p.sku, u.name as created_by_name
     FROM stock_movements sm
     JOIN products p ON sm.product_id = p.id
     JOIN users u ON sm.created_by = u.id
     ${whereClause}
     ORDER BY sm.id DESC;`,
    params
  );

  return result.rows;
};
