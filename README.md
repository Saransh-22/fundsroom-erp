# Mini ERP + CRM Operations Portal

A modern, full-stack Mini ERP and CRM Operations Portal designed for wholesale and distribution enterprises. Built with Node.js, Express, PostgreSQL (no ORM), React, and Tailwind CSS.

---

## Current Project Status: Phase 2 Completed & Verified

- **Phase 1**: Architecture, Schema, and Stack Specifications locked.
- **Phase 2**: Backend Express initialization, PostgreSQL pool connection, Schema migrations, Password hashing (`bcryptjs`), JWT Authentication, Role-based authorization middleware (RBAC), and `/api/health` & `/api/auth/me` endpoints fully implemented and verified.

---

## Technical Stack

- **Frontend**: React (Vite), JavaScript, Tailwind CSS, React Router, Axios *(Phase 4)*
- **Backend**: Node.js, TypeScript, Express.js, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), `pg` (PostgreSQL driver)
- **Database**: PostgreSQL (Neon PostgreSQL), Native SQL queries (No ORM)
- **Deployment**: Vercel (Frontend), AWS (Backend), Neon PostgreSQL (Database)
- **Bonus Features**: Docker setup, GitHub Actions CI/CD, PDF export, AWS S3 upload *(Phase 6)*

---

## Environment Variables Documentation

Set up in `backend/.env`:

| Environment Variable | Description | Example / Default Value |
|---|---|---|
| `PORT` | Port number for Express server | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fundsroom_db` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `super_secret_jwt_key_fundsroom_2026` |
| `FRONTEND_URL` | Allowed origin URL for CORS policy | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |

---

## Quick Start & Local Backend Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database instance

### Backend Installation & Setup Commands
```bash
cd backend

# Install dependencies
npm install

# Initialize PostgreSQL Schema (Creates tables, indexes, constraints)
npm run db:init

# Seed initial Users, Customers, and Products
npm run db:seed

# Build TypeScript code
npm run build

# Start Express Server in Development Mode
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

## Active API Endpoints (Phase 2)

- `GET /api/health` - System health check & database connectivity verification
- `POST /api/auth/login` - User authentication, password verification, & JWT issuance
- `GET /api/auth/me` - Authenticated profile retrieval (requires `Authorization: Bearer <token>`)

---

## Documentation Sitemap

- [Architecture Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/architecture.md)
- [Database Schema & ERD Spec](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/database.md)
- [Authentication & RBAC Guide](file:///c:/Users/saran/OneDrive/Documents/project_fundsroom/docs/authentication.md)
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
