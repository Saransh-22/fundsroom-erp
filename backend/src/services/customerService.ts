import { query } from '../config/database';
import { Customer, CustomerNote } from '../types/domain';

export const getCustomers = async (search?: string, type?: string, status?: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(customer_name ILIKE $${params.length} OR business_name ILIKE $${params.length} OR mobile_number ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  if (type) {
    params.push(type);
    conditions.push(`customer_type = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) FROM customers ${whereClause};`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const queryParams = [...params, limit, offset];
  const dataResult = await query<Customer>(
    `SELECT * FROM customers ${whereClause} ORDER BY id DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};`,
    queryParams
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    customers: dataResult.rows,
  };
};

export const getCustomerById = async (id: number) => {
  const result = await query<Customer>('SELECT * FROM customers WHERE id = $1;', [id]);
  const customer = result.rows[0];
  if (!customer) {
    const error: any = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }
  return customer;
};

export const createCustomer = async (data: Partial<Customer>) => {
  const { customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = data;

  if (!customer_name || !mobile_number || !email || !business_name || !customer_type || !address) {
    const error: any = new Error('Missing required customer fields');
    error.statusCode = 400;
    throw error;
  }

  if (!['Retail', 'Wholesale', 'Distributor'].includes(customer_type as string)) {
    const error: any = new Error('Invalid customer type');
    error.statusCode = 400;
    throw error;
  }

  const initialStatus = status || 'Lead';
  if (!['Lead', 'Active', 'Inactive'].includes(initialStatus as string)) {
    const error: any = new Error('Invalid customer status');
    error.statusCode = 400;
    throw error;
  }

  const result = await query<Customer>(
    `INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *;`,
    [customer_name, mobile_number, email, business_name, gst_number || null, customer_type, address, initialStatus, follow_up_date || null, notes || null]
  );

  return result.rows[0];
};

export const updateCustomer = async (id: number, data: Partial<Customer>) => {
  await getCustomerById(id);

  const { customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = data;

  if (customer_type && !['Retail', 'Wholesale', 'Distributor'].includes(customer_type as string)) {
    const error: any = new Error('Invalid customer type');
    error.statusCode = 400;
    throw error;
  }

  if (status && !['Lead', 'Active', 'Inactive'].includes(status as string)) {
    const error: any = new Error('Invalid customer status');
    error.statusCode = 400;
    throw error;
  }

  const result = await query<Customer>(
    `UPDATE customers
     SET customer_name = COALESCE($1, customer_name),
         mobile_number = COALESCE($2, mobile_number),
         email = COALESCE($3, email),
         business_name = COALESCE($4, business_name),
         gst_number = COALESCE($5, gst_number),
         customer_type = COALESCE($6, customer_type),
         address = COALESCE($7, address),
         status = COALESCE($8, status),
         follow_up_date = COALESCE($9, follow_up_date),
         notes = COALESCE($10, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING *;`,
    [customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, id]
  );

  return result.rows[0];
};

export const getCustomerNotes = async (customerId: number) => {
  await getCustomerById(customerId);
  const result = await query<CustomerNote>(
    `SELECT cn.*, u.name as created_by_name
     FROM customer_notes cn
     JOIN users u ON cn.created_by = u.id
     WHERE cn.customer_id = $1
     ORDER BY cn.id DESC;`,
    [customerId]
  );
  return result.rows;
};

export const addCustomerNote = async (customerId: number, note: string, createdBy: number) => {
  if (!note || note.trim().length === 0) {
    const error: any = new Error('Note content cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  await getCustomerById(customerId);

  const result = await query<CustomerNote>(
    `INSERT INTO customer_notes (customer_id, note, created_by)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [customerId, note, createdBy]
  );

  return result.rows[0];
};
