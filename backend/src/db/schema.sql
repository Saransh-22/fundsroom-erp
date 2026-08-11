CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    gst_number VARCHAR(20) NULL,
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
    address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
    follow_up_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers(customer_name, business_name, mobile_number, email);

CREATE TABLE IF NOT EXISTS customer_notes (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_id);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_alert INT NOT NULL DEFAULT 5 CHECK (min_stock_alert >= 0),
    location VARCHAR(100) NOT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_changed INT NOT NULL CHECK (quantity_changed > 0),
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    reason VARCHAR(255) NOT NULL,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

CREATE TABLE IF NOT EXISTS sales_challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id),
    total_quantity INT NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_challans_number ON sales_challans(challan_number);
CREATE INDEX IF NOT EXISTS idx_sales_challans_status ON sales_challans(status);

CREATE TABLE IF NOT EXISTS sales_challan_items (
    id SERIAL PRIMARY KEY,
    challan_id INT NOT NULL REFERENCES sales_challans(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    snapshot_product_name VARCHAR(150) NOT NULL,
    snapshot_sku VARCHAR(50) NOT NULL,
    snapshot_unit_price NUMERIC(12, 2) NOT NULL CHECK (snapshot_unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sales_challan_items_challan ON sales_challan_items(challan_id);
