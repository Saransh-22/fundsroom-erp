import { query, getClient } from '../config/database';
import { SalesChallan, SalesChallanItemInput, Product } from '../types/domain';
import { getCustomerById } from './customerService';

const generateChallanNumber = async (client?: any): Promise<string> => {
  const queryFn = client ? client.query.bind(client) : query;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `CHLN-${dateStr}-`;

  const result = await queryFn(
    `SELECT challan_number FROM sales_challans WHERE challan_number LIKE $1 ORDER BY id DESC LIMIT 1 FOR UPDATE;`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNum = result.rows[0].challan_number;
    const parts = lastNum.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
};

export const createChallan = async (
  customerId: number,
  items: SalesChallanItemInput[],
  status: 'Draft' | 'Confirmed' = 'Draft',
  createdBy: number
) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error: any = new Error('Challan must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  if (!['Draft', 'Confirmed'].includes(status)) {
    const error: any = new Error('Status must be Draft or Confirmed');
    error.statusCode = 400;
    throw error;
  }

  await getCustomerById(customerId);

  const productQuantities = new Map<number, number>();
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      const error: any = new Error('Invalid product item or quantity');
      error.statusCode = 400;
      throw error;
    }
    const existing = productQuantities.get(item.product_id) || 0;
    productQuantities.set(item.product_id, existing + item.quantity);
  }

  const client = await getClient();

  try {
    await client.query('BEGIN;');

    const challanNumber = await generateChallanNumber(client);

    let totalQuantity = 0;
    let totalAmount = 0;
    const itemSnapshots: any[] = [];

    const productIds = Array.from(productQuantities.keys());
    
    let productRows: Product[] = [];
    if (status === 'Confirmed') {
      const productRes = await client.query<Product>(
        `SELECT * FROM products WHERE id = ANY($1::int[]) FOR UPDATE;`,
        [productIds]
      );
      productRows = productRes.rows;
    } else {
      const productRes = await client.query<Product>(
        `SELECT * FROM products WHERE id = ANY($1::int[]);`,
        [productIds]
      );
      productRows = productRes.rows;
    }

    if (productRows.length !== productIds.length) {
      const error: any = new Error('One or more requested products do not exist');
      error.statusCode = 404;
      throw error;
    }

    const productMap = new Map<number, Product>();
    productRows.forEach((p) => productMap.set(p.id, p));

    for (const [productId, qty] of productQuantities.entries()) {
      const product = productMap.get(productId)!;

      if (status === 'Confirmed' && product.current_stock < qty) {
        const error: any = new Error(`Insufficient stock for product '${product.product_name}' (SKU: ${product.sku}). Available: ${product.current_stock}, Requested: ${qty}`);
        error.statusCode = 400;
        throw error;
      }

      const unitPrice = parseFloat(String(product.unit_price));
      const subtotal = unitPrice * qty;

      totalQuantity += qty;
      totalAmount += subtotal;

      itemSnapshots.push({
        product_id: product.id,
        snapshot_product_name: product.product_name,
        snapshot_sku: product.sku,
        snapshot_unit_price: unitPrice,
        quantity: qty,
        subtotal: subtotal,
      });
    }

    const challanRes = await client.query<SalesChallan>(
      `INSERT INTO sales_challans (challan_number, customer_id, total_quantity, total_amount, status, created_by, confirmed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        challanNumber,
        customerId,
        totalQuantity,
        totalAmount,
        status,
        createdBy,
        status === 'Confirmed' ? new Date() : null,
      ]
    );

    const createdChallan = challanRes.rows[0];

    for (const item of itemSnapshots) {
      await client.query(
        `INSERT INTO sales_challan_items (challan_id, product_id, snapshot_product_name, snapshot_sku, snapshot_unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [
          createdChallan.id,
          item.product_id,
          item.snapshot_product_name,
          item.snapshot_sku,
          item.snapshot_unit_price,
          item.quantity,
          item.subtotal,
        ]
      );

      if (status === 'Confirmed') {
        await client.query(
          `UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
          [item.quantity, item.product_id]
        );

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
           VALUES ($1, $2, 'OUT', $3, $4);`,
          [
            item.product_id,
            item.quantity,
            `Sales Challan Confirmation: ${createdChallan.challan_number}`,
            createdBy,
          ]
        );
      }
    }

    await client.query('COMMIT;');

    return getChallanById(createdChallan.id);
  } catch (error) {
    await client.query('ROLLBACK;');
    throw error;
  } finally {
    client.release();
  }
};

export const getChallans = async (search?: string, status?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(sc.challan_number ILIKE $${params.length} OR c.customer_name ILIKE $${params.length} OR c.business_name ILIKE $${params.length})`);
  }

  if (status) {
    params.push(status);
    conditions.push(`sc.status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) FROM sales_challans sc JOIN customers c ON sc.customer_id = c.id ${whereClause};`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const queryParams = [...params, limit, offset];
  const dataResult = await query<SalesChallan>(
    `SELECT sc.*, c.customer_name, c.business_name, u.name as created_by_name
     FROM sales_challans sc
     JOIN customers c ON sc.customer_id = c.id
     JOIN users u ON sc.created_by = u.id
     ${whereClause}
     ORDER BY sc.id DESC
     LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};`,
    queryParams
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    challans: dataResult.rows,
  };
};

export const getChallanById = async (id: number) => {
  const challanRes = await query<SalesChallan>(
    `SELECT sc.*, c.customer_name, c.business_name, u.name as created_by_name
     FROM sales_challans sc
     JOIN customers c ON sc.customer_id = c.id
     JOIN users u ON sc.created_by = u.id
     WHERE sc.id = $1;`,
    [id]
  );

  const challan = challanRes.rows[0];
  if (!challan) {
    const error: any = new Error('Sales challan not found');
    error.statusCode = 404;
    throw error;
  }

  const itemsRes = await query(
    `SELECT sci.*, p.sku as current_sku, p.current_stock
     FROM sales_challan_items sci
     JOIN products p ON sci.product_id = p.id
     WHERE sci.challan_id = $1;`,
    [id]
  );

  challan.items = itemsRes.rows;
  return challan;
};

export const confirmChallan = async (challanId: number, userId: number) => {
  const client = await getClient();

  try {
    await client.query('BEGIN;');

    const challanRes = await client.query<SalesChallan>(
      `SELECT * FROM sales_challans WHERE id = $1 FOR UPDATE;`,
      [challanId]
    );

    const challan = challanRes.rows[0];
    if (!challan) {
      const error: any = new Error('Sales challan not found');
      error.statusCode = 404;
      throw error;
    }

    if (challan.status === 'Confirmed') {
      const error: any = new Error(`Challan '${challan.challan_number}' is already Confirmed`);
      error.statusCode = 409;
      throw error;
    }

    if (challan.status === 'Cancelled') {
      const error: any = new Error(`Cancelled challan '${challan.challan_number}' cannot be confirmed`);
      error.statusCode = 400;
      throw error;
    }

    const itemsRes = await client.query(
      `SELECT * FROM sales_challan_items WHERE challan_id = $1;`,
      [challanId]
    );
    const items = itemsRes.rows;

    const productIds = items.map((i) => i.product_id);
    const productRes = await client.query<Product>(
      `SELECT * FROM products WHERE id = ANY($1::int[]) FOR UPDATE;`,
      [productIds]
    );
    const productMap = new Map<number, Product>();
    productRes.rows.forEach((p) => productMap.set(p.id, p));

    for (const item of items) {
      const product = productMap.get(item.product_id)!;
      if (product.current_stock < item.quantity) {
        const error: any = new Error(`Insufficient stock for product '${product.product_name}' (SKU: ${product.sku}). Available: ${product.current_stock}, Requested: ${item.quantity}`);
        error.statusCode = 400;
        throw error;
      }
    }

    for (const item of items) {
      await client.query(
        `UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
         VALUES ($1, $2, 'OUT', $3, $4);`,
        [
          item.product_id,
          item.quantity,
          `Sales Challan Confirmation: ${challan.challan_number}`,
          userId,
        ]
      );
    }

    await client.query(
      `UPDATE sales_challans SET status = 'Confirmed', confirmed_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [challanId]
    );

    await client.query('COMMIT;');

    return getChallanById(challanId);
  } catch (error) {
    await client.query('ROLLBACK;');
    throw error;
  } finally {
    client.release();
  }
};
