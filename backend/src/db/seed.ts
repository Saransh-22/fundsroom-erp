import bcrypt from 'bcryptjs';
import { query, pool } from '../config/database';
import { initDb } from './init';

export const seedDb = async () => {
  try {
    await initDb();

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const salesHash = await bcrypt.hash('Sales@123', 10);
    const warehouseHash = await bcrypt.hash('Warehouse@123', 10);
    const accountsHash = await bcrypt.hash('Accounts@123', 10);

    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('Admin User', 'admin@fundsroom.com', $1, 'Admin'),
        ('Sales User', 'sales@fundsroom.com', $2, 'Sales'),
        ('Warehouse User', 'warehouse@fundsroom.com', $3, 'Warehouse'),
        ('Accounts User', 'accounts@fundsroom.com', $4, 'Accounts')
      ON CONFLICT (email) DO NOTHING;
    `, [adminHash, salesHash, warehouseHash, accountsHash]);

    await query(`
      INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
      VALUES
        ('Rahul Sharma', '9876543210', 'rahul@apexdistributors.com', 'Apex Traders', '27AAACA12341ZV', 'Wholesale', '123 Industrial Area, Mumbai', 'Active', '2026-08-20', 'Key wholesale partner'),
        ('Priya Patel', '9876543211', 'priya@retailmart.com', 'Retail Mart', '27BBBCA56781ZW', 'Retail', '45 Commercial Street, Pune', 'Lead', '2026-08-15', 'Interested in bulk electronic components'),
        ('Amit Verma', '9876543212', 'amit@globalwarehousing.com', 'Global Supplies', NULL, 'Distributor', '78 Warehouse Zone, Nagpur', 'Active', NULL, 'Regular distributor for west zone')
      ON CONFLICT DO NOTHING;
    `);

    await query(`
      INSERT INTO products (product_name, sku, category, unit_price, current_stock, min_stock_alert, location)
      VALUES
        ('Industrial Power Supply 24V', 'SKU-PWR-001', 'Electronics', 1500.00, 100, 10, 'Rack A-1'),
        ('Heavy Duty Bearing 50mm', 'SKU-BRG-002', 'Hardware', 450.50, 4, 10, 'Rack B-3'),
        ('Copper Wire Roll 100m', 'SKU-WIR-003', 'Electrical', 2800.00, 50, 5, 'Rack C-2')
      ON CONFLICT (sku) DO NOTHING;
    `);
  } catch (error) {
    throw error;
  }
};

if (require.main === module) {
  seedDb()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch(() => {
      pool.end();
      process.exit(1);
    });
}
