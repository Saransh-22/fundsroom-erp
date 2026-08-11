# Project Development Log

This document serves as an ongoing audit trail of implementation phases, completed milestones, and verification checks during the construction of the Fundsroom Mini ERP + CRM Portal.

---

## Log Entries

### [2026-08-11] - Phase 1: Planning, Requirement Mapping & Architectural Blueprinting
- **Status**: Completed & Locked
- **Activities**:
  - Extracted full case study requirements from official Fundsroom assignment PDF.
  - Locked technology stack:
    - Frontend: React (Vite), JavaScript (No TS), Tailwind CSS, React Router, Axios.
    - Backend: Node.js, TypeScript, Express.js, JWT, bcryptjs, native `pg`.
    - Database: PostgreSQL (Neon PostgreSQL, raw parameterized SQL, No ORM).
    - Deployment Targets: Frontend on Vercel, Backend on AWS, Database on Neon.
  - Authored & updated primary project documentation:
    - `README.md`: Master project overview, stack list, test user credentials table, setup instructions.
    - `docs/architecture.md`: Detailed client-server topology, data pipeline, and RBAC authentication flow.
    - `docs/database.md`: Complete relational schema (DDL), primary/foreign key constraints, and performance indexes.
    - `docs/decisions.md`: Key architectural decisions, interview preparation defense guide with precise `SELECT FOR UPDATE` locking and raw SQL reasoning.
    - `docs/development-log.md`: Implementation milestone tracking.
### [2026-08-11] - Phase 2: Database Initialization, Express Backend & Authentication
- **Status**: Completed & Verified
- **What Was Built**:
  - Initialized Node.js + TypeScript backend project under `backend/`.
  - Configured PostgreSQL connection pool (`pg.Pool`) in `src/config/database.ts` with startup health check.
  - Implemented SQL schema migration script `src/db/schema.sql` (creating `users`, `customers`, `customer_notes`, `products`, `stock_movements`, `sales_challans`, `sales_challan_items` with constraints and indexes) and `src/db/init.ts`.
  - Built database seed script `src/db/seed.ts` inserting 4 role-based test users with `bcryptjs` hashed passwords (`Admin@123`, `Sales@123`, `Warehouse@123`, `Accounts@123`) and initial customer/product catalog records.
  - Created Express foundation app (`src/app.ts` & `src/server.ts`) with `cors`, `express.json()`, and `/api/health` endpoint.
  - Implemented JWT authentication service (`src/services/authService.ts`) and controller (`src/controllers/authController.ts`) supporting `POST /api/auth/login` and `GET /api/auth/me`.
  - Created reusable `authMiddleware` (Bearer JWT validation) and `roleMiddleware` (RBAC access control).
  - Built centralized error handling middleware (`src/middleware/error.ts`).
  - Created Postman collection `docs/Fundsroom_ERP_API_Collection.json`.
- **Files Created**:
  - `backend/package.json`, `backend/tsconfig.json`, `backend/.env.example`, `backend/.env`, `backend/.gitignore`
  - `backend/src/config/env.ts`, `backend/src/config/database.ts`
  - `backend/src/types/index.ts`
  - `backend/src/db/schema.sql`, `backend/src/db/init.ts`, `backend/src/db/seed.ts`
  - `backend/src/utils/jwt.ts`
  - `backend/src/middleware/auth.ts`, `backend/src/middleware/role.ts`, `backend/src/middleware/error.ts`
  - `backend/src/services/authService.ts`
  - `backend/src/controllers/authController.ts`
  - `backend/src/routes/authRoutes.ts`
  - `backend/src/app.ts`, `backend/src/server.ts`
  - `docs/authentication.md`, `docs/testing.md`, `docs/Fundsroom_ERP_API_Collection.json`
- **Commands Used**:
  - `npm run build`
  - `npm run db:init`
  - `npm run db:seed`
  - `npm run dev`
- **Tests Performed & Results**:
  - Database schema & seed execution: Passed.
  - `GET /api/health`: Passed (200 OK, database connected).
  - Login for Admin, Sales, Warehouse, Accounts: Passed (200 OK + JWT issued).
  - Wrong password & unknown email: Passed (401 Unauthorized).
  - `GET /api/auth/me` with/without token: Passed (200 OK with token, 401 without).
  - Role-based authorization check: Passed (Admin 200 OK, Sales 403 Forbidden on Admin endpoint).
- **Problems Encountered & Fixed**:
  - Initial `db:init` failed due to default password mismatch on local PostgreSQL service. Fixed by creating target `fundsroom_db` database and updating `.env` database connection credentials.
### [2026-08-11] - Phase 3: Core Business APIs (CRM, Products, Inventory, Sales Challans)
- **Status**: Completed & Verified
- **What Was Built**:
  - Implemented Customer CRM service, controller, and routes (CRUD, search, pagination, follow-up notes).
  - Implemented Product & Inventory service, controller, and routes (Product CRUD, low-stock threshold detection, audit log queries).
  - Implemented transactional Stock Adjustment API (`POST /api/inventory/:productId/adjust`) logging `IN`/`OUT` movements.
  - Implemented Sales Challan Transaction Engine supporting `Draft` and `Confirmed` workflows.
  - Configured `SELECT FOR UPDATE` row locking to prevent race conditions during concurrent stock verification.
  - Implemented Product Snapshot Pattern storing `snapshot_product_name`, `snapshot_sku`, and `snapshot_unit_price` in `sales_challan_items`.
  - Configured collision-safe `CHLN-YYYYMMDD-XXXX` auto-numbering.
  - Configured full RBAC access permissions for Admin, Sales, Warehouse, and Accounts roles.
  - Updated Postman collection `docs/Fundsroom_ERP_API_Collection.json`.
- **Files Created**:
  - `backend/src/types/domain.ts`
  - `backend/src/services/customerService.ts`, `backend/src/controllers/customerController.ts`, `backend/src/routes/customerRoutes.ts`
  - `backend/src/services/productService.ts`, `backend/src/controllers/productController.ts`, `backend/src/routes/productRoutes.ts`
  - `backend/src/services/challanService.ts`, `backend/src/controllers/challanController.ts`, `backend/src/routes/challanRoutes.ts`
  - `docs/business-logic.md`
- **Commands Used**:
  - `npm run build`
  - `npm run dev`
- **Tests Performed & Results**:
  - All 18 automated/manual REST API & Database transaction tests passed (100% success rate).
