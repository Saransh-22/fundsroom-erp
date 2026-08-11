# Mini ERP + CRM Operations Portal

A modern, full-stack Mini ERP and CRM Operations Portal designed for wholesale and distribution enterprises. Built with Node.js, Express, PostgreSQL (no ORM), React, and Tailwind CSS.

---

## 1. Project Overview & Core Problem Solved

Wholesale and distribution companies struggle with fragmented operations when customer CRM interactions, product pricing, inventory tracking, and delivery challans exist in separate systems. 

**Fundsroom ERP** unifies these operations into a single platform featuring:
- **Role-Based Workflows**: Tailored permissions for Admin, Sales, Warehouse, and Accounts staff.
- **Customer CRM**: Client profiles, status tracking (Lead/Active/Inactive), and call note feeds.
- **Products Catalog**: SKU management, positive unit pricing enforcement, and low-stock alerts.
- **Inventory Control**: Live stock tracking, manual adjustments (IN/OUT), and immutable audit movement logs.
- **Sales Challans Engine**: Transaction-safe order processing featuring a two-stage lifecycle (Draft vs. Confirmed), historical pricing snapshots, atomic stock deduction, and concurrency locking.

---

## 2. Technology Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, TypeScript, Express.js, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), `pg` (Native PostgreSQL driver)
- **Database**: PostgreSQL (Neon PostgreSQL), Native SQL queries (No ORM)
- **Deployment Target**: Vercel (Frontend), AWS EC2 Ubuntu + Nginx (Backend), Neon PostgreSQL (Database)
- **Bonus Roadmap**: Docker setup, GitHub Actions CI/CD, PDF Export, AWS S3 Upload *(Planned)*

---

## 3. System Architecture & Request Lifecycle

```
[ Web Browser Client ]
         │
         │ HTTPS (Vercel SPA Frontend)
         ▼
[ Express REST API ] (AWS EC2 / Nginx Reverse Proxy)
         │
         ├──► 1. CORS Middleware (Origin restriction via FRONTEND_URL)
         ├──► 2. Auth Middleware (JWT Bearer Token verification)
         ├──► 3. Role Middleware (RBAC verification: Admin / Sales / Warehouse / Accounts)
         ├──► 4. Controller Layer (Request validation & parameters extraction)
         ├──► 5. Service Layer (Domain logic & atomic SQL transactions)
         │
         ▼
[ Neon PostgreSQL Database ]
  (7 Tables: users, customers, customer_notes, products, stock_movements, sales_challans, sales_challan_items)
```

---

## 4. Role & Permission Matrix

| Operational Role | Customer CRM | Products Catalog | Inventory Adjust | Sales Challans | Permission Level |
|---|---|---|---|---|---|
| **Admin** | Read / Write | Read / Write | Read / Write | Read / Write / Confirm | Full System Access |
| **Sales** | Read / Write | Read Only | Read Only | Read / Write / Confirm | Sales & CRM Access |
| **Warehouse** | Hidden / Blocked | Read / Write | Read / Write | Hidden / Blocked | Warehouse Control |
| **Accounts** | Read Only | Read Only | Read Only | Read Only | Financial Audit |

---

## 5. Repository Directory Tree

```
project_fundsroom/
├── backend/
│   ├── src/
│   │   ├── config/          # env.ts, database.ts
│   │   ├── controllers/     # auth, customer, product, challan
│   │   ├── db/              # init.ts (schema), seed.ts (seed data)
│   │   ├── middleware/      # auth, role, error
│   │   ├── routes/          # auth, customer, product, challan
│   │   ├── services/        # customer, product, challan
│   │   ├── app.ts           # Express application & CORS setup
│   │   └── server.ts        # Server entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── public/              # favicon.svg, icons.svg
│   ├── src/
│   │   ├── components/      # ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── layouts/         # MainLayout (Sidebar & Top Header)
│   │   ├── pages/           # Login, Dashboard, Customers, CustomerDetail, Products, Inventory, Challans, CreateChallan, ChallanDetail
│   │   ├── services/        # api.js (Axios client with Bearer JWT interceptor)
│   │   ├── App.jsx          # React Router setup
│   │   └── main.jsx
│   ├── vercel.json          # Vercel SPA route rewrite rules
│   ├── .env.example
│   ├── .gitignore
│   ├── vite.config.js
│   └── package.json
├── docs/                    # Architectural & Evaluator Documentation
└── README.md
```

---

## 6. Quick Start & Local Development Setup

### Step A: Prerequisites & Database Initialization
Ensure local PostgreSQL is running on port `5432` with database `fundsroom_db`.

```bash
cd backend

# Install dependencies
npm install

# Initialize Database Schema (creates all 7 tables)
npm run db:init

# Seed Demo Credentials & Default Catalog
npm run db:seed

# Start Express Backend (Runs on http://localhost:5000)
npm run dev
```

### Step B: Start Frontend SPA Application
Open a second terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite Frontend (Runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Demo Accounts & Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@fundsroom.com` | `Admin@123` |
| **Sales** | `sales@fundsroom.com` | `Sales@123` |
| **Warehouse** | `warehouse@fundsroom.com` | `Warehouse@123` |
| **Accounts** | `accounts@fundsroom.com` | `Accounts@123` |

---

## 8. Key REST API Summary

- `GET /api/health` — Public health check & PostgreSQL connection status
- `POST /api/auth/login` — User login & JWT issuance
- `GET /api/auth/me` — Active session profile restore
- `GET, POST /api/customers` — List customers & create customer
- `GET, POST /api/customers/:id/notes` — Customer profile & follow-up notes feed
- `GET, POST /api/products` — Catalog items list & product creation
- `GET /api/inventory` — Warehouse inventory overview & low-stock alerts
- `POST /api/inventory/:productId/adjust` — Manual stock adjustment (IN/OUT) & audit log
- `GET, POST /api/challans` — Sales challans listing & Draft creation
- `POST /api/challans/:id/confirm` — Atomic order confirmation, `SELECT FOR UPDATE` row lock, stock deduction & `OUT` movement creation

---

## 9. Testing & Quality Assurance

Run TypeScript compilation and Vite build checks:
```bash
# Verify Backend Build
cd backend && npm run build

# Verify Frontend Build
cd frontend && npm run build
```
Postman collection is available in [`docs/Fundsroom_ERP_API_Collection.json`](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/Fundsroom_ERP_API_Collection.json).

---

## 10. Security & Production Environment Setup

### Environment Variables Matrix

#### Backend (`backend/.env`)
- `PORT`: `5000` (Assigned by container environment)
- `DATABASE_URL`: `postgresql://user:password@host/neondb?sslmode=require` (**Secret**)
- `JWT_SECRET`: Cryptographically signed 256-bit key (**Secret**)
- `FRONTEND_URL`: `https://your-app.vercel.app` (CORS restriction origin)
- `NODE_ENV`: `production`

#### Frontend (`frontend/.env`)
- `VITE_API_URL`: `http://<EC2-IP>/api` (or `https://api.yourdomain.com/api`)

---

## 11. Evaluator Documentation Index

- [Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/architecture.md)
- [Database Schema & ERD Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/database.md)
- [Authentication & RBAC Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/authentication.md)
- [Business Logic & Transactions](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/business-logic.md)
- [Frontend Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/frontend.md)
- [Testing & QA Log](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/testing.md)
- [Production Deployment Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/deployment.md)
- [Design Decisions & Interview Defense](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/decisions.md)
- [Development Log](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/development-log.md)

---

## 12. Final Project Status: Complete & Production-Ready

Phases 1 through 5, including all core CRM, Products, Inventory, Sales Challans, RBAC, Database transactions, and visual UI polish are **completed, tested, and ready for deployment**.
