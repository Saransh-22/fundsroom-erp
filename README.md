# Mini ERP + CRM Operations Portal

A modern, full-stack Mini ERP and CRM Operations Portal designed for wholesale and distribution enterprises. Built with Node.js, Express, PostgreSQL (no ORM), React, and Tailwind CSS.

---

## Current Project Status: Phase 3 Completed & Verified

- **Phase 1**: Architecture, Schema, and Stack Specifications locked.
- **Phase 2**: Backend Express foundation, PostgreSQL pool connection, Schema migrations, JWT Auth, and RBAC middleware.
- **Phase 3**: Core Business APIs fully implemented and verified:
  - Customer CRM APIs (CRUD, Search, Pagination, Follow-up notes).
  - Product & Inventory APIs (Catalog, Stock adjustment logs, Low-stock tracking).
  - Transaction-safe Sales Challan Engine (Draft vs Confirmed, `SELECT FOR UPDATE` row locking, Snapshot pricing, Stock reduction, Rollback protection, Duplicate confirmation prevention).

---

## Technical Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, React Router, Axios *(Phase 4)*
- **Backend**: Node.js, TypeScript, Express.js, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), `pg` (PostgreSQL driver)
- **Database**: PostgreSQL (Neon PostgreSQL), Native SQL queries (No ORM)
- **Deployment**: Vercel (Frontend), AWS (Backend), Neon PostgreSQL (Database)
- **Bonus Features**: Docker setup, GitHub Actions CI/CD, PDF export, AWS S3 upload *(Phase 6)*

---

## Active REST API Endpoints (Phase 3 Complete)

### Authentication & Health
- `GET /api/health` - Public health & DB connection status
- `POST /api/auth/login` - User login & JWT generation
- `GET /api/auth/me` - Authenticated user profile

### Customer CRM
- `GET /api/customers` - List & search customers (`q`, `type`, `status`, `page`, `limit`)
- `GET /api/customers/:id` - Get customer detail
- `POST /api/customers` - Create customer (Sales / Admin)
- `PUT /api/customers/:id` - Update customer (Sales / Admin)
- `GET /api/customers/:id/notes` - List customer follow-up notes
- `POST /api/customers/:id/notes` - Add follow-up note (Sales / Admin)

### Products & Inventory
- `GET /api/products` - List products (`search`, `category`, `lowStock`, `page`, `limit`)
- `GET /api/products/:id` - Get product detail
- `POST /api/products` - Create product (Warehouse / Admin)
- `PUT /api/products/:id` - Update product (Warehouse / Admin)
- `GET /api/inventory` - Inventory overview & low-stock alerts
- `GET /api/inventory/:productId` - Product inventory detail & stock logs
- `GET /api/inventory/:productId/movements` - Stock movement log history
- `POST /api/inventory/:productId/adjust` - Manual stock adjustment IN/OUT (Warehouse / Admin)

### Sales Challans
- `GET /api/challans` - List sales challans (`search`, `status`, `page`, `limit`)
- `GET /api/challans/:id` - Get sales challan detail with snapshots
- `POST /api/challans` - Create sales challan (Draft / Confirmed) (Sales / Admin)
- `POST /api/challans/:id/confirm` - Confirm a Draft challan with atomic stock reduction & row locking (Sales / Admin)

---

## Quick Start & Local Backend Setup

```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm run build
npm run dev
```

---

## Documentation Sitemap

- [Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/architecture.md)
- [Database Schema & ERD Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/database.md)
- [Authentication & RBAC Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/authentication.md)
- [Business Logic & Transaction Specs](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/business-logic.md)
- [Testing & QA Suite Log](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/testing.md)
- [Design Decisions & Interview Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/decisions.md)
- [Development Log](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/development-log.md)

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database instance (Local or Neon)
- npm or yarn package manager

### 1. Database Setup
Execute the SQL schema migration script provided in `backend/src/db/schema.sql` on your PostgreSQL database.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Test Credentials

| Persona | Email | Password | Role Permissions |
|---|---|---|---|
| Admin | admin@fundsroom.com | Admin@123 | Complete System Access |
| Sales User | sales@fundsroom.com | Sales@123 | Customer CRM & Sales Challans |
| Warehouse Mgr | warehouse@fundsroom.com | Warehouse@123 | Product Catalog & Inventory Logs |
| Accounts User | accounts@fundsroom.com | Accounts@123 | Financial Audit & Read-only Views |

---

## Documentation Sitemap

- [Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/architecture.md)
- [Database Schema & ERD Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/database.md)
- [Design Decisions & Technical Interview Preparation](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/decisions.md)
- [Development Log](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/development-log.md)
