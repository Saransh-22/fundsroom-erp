# Mini ERP + CRM Operations Portal

A modern, full-stack Mini ERP and CRM Operations Portal designed for wholesale and distribution enterprises. Built with Node.js, Express, PostgreSQL (no ORM), React, and Tailwind CSS.

---

## Current Project Status: Phase 4 Completed & Verified

- **Phase 1**: Architecture, Schema, and Stack Specifications locked.
- **Phase 2**: Backend Express foundation, PostgreSQL pool connection, Schema migrations, JWT Auth, and RBAC middleware.
- **Phase 3**: Core Business REST APIs (Customer CRM, Products, Inventory, Sales Challans Engine).
- **Phase 4**: React + Tailwind CSS SPA Frontend completed & verified:
  - Centralized JWT authentication state & session restoration via `AuthContext`.
  - Protected routes & role-aware ERP sidebar navigation (`Admin`, `Sales`, `Warehouse`, `Accounts`).
  - Full UI module coverage for Dashboard, Customer CRM (with follow-up notes feed), Products Catalog, Inventory Management (with low-stock alerts & stock adjustment modal), and Sales Challans (Draft creation & transactional stock confirmation).

---

## Technical Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, TypeScript, Express.js, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), `pg` (PostgreSQL driver)
- **Database**: PostgreSQL (Neon PostgreSQL), Native SQL queries (No ORM)
- **Deployment**: Vercel (Frontend), AWS (Backend), Neon PostgreSQL (Database)
- **Bonus Features**: Docker setup, GitHub Actions CI/CD, PDF export, AWS S3 upload *(Phase 6)*

---

## Quick Start & Local Setup

### 1. Start PostgreSQL & Backend Server
```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm run dev
```

### 2. Start React Frontend SPA
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Documentation Sitemap

- [Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/architecture.md)
- [Database Schema & ERD Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/database.md)
- [Authentication & RBAC Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/authentication.md)
- [Business Logic & Transaction Specs](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/business-logic.md)
- [Frontend Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/frontend.md)
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
