# Business Logic & Transaction Architecture

This document provides a comprehensive guide to the core business domain logic, database transaction workflows, concurrency locking, snapshot auditing, and role authorization matrix in the Fundsroom ERP system.

---

## 1. Role-Based Access Control (RBAC) Permission Matrix

| Resource / Action | Endpoint | Admin | Sales | Warehouse | Accounts |
|---|---|---|---|---|---|
| **Auth Profile** | `GET /api/auth/me` | ✅ | ✅ | ✅ | ✅ |
| **List/View Customers** | `GET /api/customers` | ✅ | ✅ | ❌ | ✅ |
| **Create/Edit Customers** | `POST, PUT /api/customers` | ✅ | ✅ | ❌ | ❌ |
| **Add Customer Notes** | `POST /api/customers/:id/notes` | ✅ | ✅ | ❌ | ❌ |
| **List/View Products** | `GET /api/products` | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit Products** | `POST, PUT /api/products` | ✅ | ❌ | ✅ | ❌ |
| **List Inventory & Log** | `GET /api/inventory` | ✅ | ✅ | ✅ | ✅ |
| **Stock Adjustments** | `POST /api/inventory/:id/adjust` | ✅ | ❌ | ✅ | ❌ |
| **List/View Challans** | `GET /api/challans` | ✅ | ✅ | ❌ | ✅ |
| **Create/Confirm Challan**| `POST /api/challans` | ✅ | ✅ | ❌ | ❌ |

---

## 2. Sales Challan Workflow & Transaction Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         Sales Challan Creation (Draft/Confirmed)                │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
            [ Status = Draft ]                         [ Status = Confirmed ]
                   │                                           │
  - Validates customer & products             - Begins SQL Transaction (`BEGIN;`)
  - Calculates backend totals                 - Obtains Row Locks (`SELECT ... FOR UPDATE`)
  - Generates `CHLN-YYYYMMDD-XXXX`            - Validates stock >= requested qty
  - Inserts line item snapshots               - Decrements stock in `products`
  - Stock unchanged; 0 movements logged       - Inserts 'OUT' records in `stock_movements`
                                              - Sets `confirmed_at` timestamp
                                              - Commits Transaction (`COMMIT;`)
```

---

## 3. Key Concepts for Technical Interview Defense

### Concept 1: Atomic Database Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`)
- **What it is**: An atomic unit of database execution where all operational steps either complete successfully together or none take effect.
- **Why we use it here**: Confirming a sales challan modifies `sales_challans`, `products`, and `stock_movements`. Partial execution (e.g. deducting stock without updating status) corrupts system state.
- **How it works in this project**: Wrapped inside `try { await client.query('BEGIN;'); ... await client.query('COMMIT;'); } catch { await client.query('ROLLBACK;'); throw error; } finally { client.release(); }`.
- **How to explain in an interview**:
  > *"We use explicit PostgreSQL transaction blocks. If any step fails during challan confirmation, such as stock insufficiency for a single line item, the entire batch is rolled back atomically so the database remains consistent."*

---

### Concept 2: Row-Level Concurrency Locking (`SELECT ... FOR UPDATE`)
- **What it is**: A PostgreSQL lock mode that locks selected rows during a transaction, preventing concurrent transactions from updating or locking the same rows until the current transaction finishes.
- **Why we use it here**: Prevents race conditions when two sales reps confirm challans for the same product at the exact same millisecond.
- **How it works in this project**: Executed during stock validation: `SELECT * FROM products WHERE id = ANY($1::int[]) FOR UPDATE;`.
- **How to explain in an interview**:
  > *"SELECT FOR UPDATE locks the selected product rows during the transaction so concurrent stock-changing operations cannot modify those same rows until the transaction completes. This helps keep stock validation and deduction consistent."*

---

### Concept 3: Product Snapshot Pattern
- **What it is**: Storing copies of volatile reference data (product name, SKU, unit price) directly inside order line items at creation time.
- **Why we use it here**: Guarantees historical financial audit compliance. If product prices change next year, historical challans retain their original pricing.
- **How it works in this project**: `sales_challan_items` stores `snapshot_product_name`, `snapshot_sku`, and `snapshot_unit_price` populated directly from the database at insertion.
- **How to explain in an interview**:
  > *"We store product pricing and naming snapshots inside `sales_challan_items` at the moment of order creation. This prevents future product price updates from altering historical financial records."*

---

### Concept 4: Auto-Generated Challan Numbering
- **What it is**: Sequence-based challan identifier formatting (`CHLN-YYYYMMDD-XXXX`).
- **Why we use it here**: Standardized, unique, collision-safe business tracking.
- **How it works in this project**: Uses `SELECT challan_number FROM sales_challans WHERE challan_number LIKE 'CHLN-YYYYMMDD-%' ORDER BY id DESC LIMIT 1 FOR UPDATE` within the transaction to assign sequence numbers safely.
- **How to explain in an interview**:
  > *"Challan numbers are generated backend-side using a transaction-locked sequence lookup per day (`CHLN-YYYYMMDD-0001`), ensuring uniqueness and preventing race-condition collisions."*
