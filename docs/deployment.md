# Production Deployment Architecture & AWS/Vercel/Neon Setup Guide

This document specifies the production architecture, cloud deployment configurations, CORS origins, environment variables, build procedures, and end-to-end QA validation protocols for the Fundsroom ERP Operations Portal.

---

## 1. Production Architecture Overview

```
[ Web Browser Client ]
          │
          │ HTTPS Requests
          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Production Edge CDN                   │
│        (React + Vite + JavaScript + Tailwind CSS SPA)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                        HTTPS REST API
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  AWS Cloud Compute (App Runner / EC2)        │
│          (Node.js + TypeScript + Express REST API)          │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ CORS Policy: Allowed Origin = Vercel Domain         │   │
│   │ Auth Engine: Stateless JWT + bcryptjs               │   │
│   │ SQL Engine: Native `pg` Pool + Parameterized SQL    │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
                       PostgreSQL over SSL
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                Neon PostgreSQL Cloud Database               │
│    (7 Schema Tables, Check Constraints, Row Locking Locks)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Configuration Matrix

### Backend Environment Variables (AWS Deployment)

| Variable Name | Environment | Description / Example | Security Classification |
|---|---|---|---|
| `PORT` | Production | `5000` (Assigned by AWS environment) | Public Configuration |
| `DATABASE_URL` | Production | `postgresql://user:password@ep-pooler.neon.tech/neondb?sslmode=require` | **STRICT SECRET** |
| `JWT_SECRET` | Production | Cryptographically secure 256-bit secret key string | **STRICT SECRET** |
| `FRONTEND_URL` | Production | Deployed Vercel URL (e.g. `https://fundsroom-erp.vercel.app`) | Public Configuration |
| `NODE_ENV` | Production | `production` | Public Configuration |

### Frontend Environment Variables (Vercel Deployment)

| Variable Name | Environment | Description / Example | Security Classification |
|---|---|---|---|
| `VITE_API_URL` | Production | Deployed AWS API URL (e.g. `https://api.fundsroom.com/api`) | Public Configuration |

> [!IMPORTANT]
> Never place `DATABASE_URL`, `JWT_SECRET`, or AWS credentials inside Vercel frontend environment variables. The frontend bundle is public JavaScript accessible in browser developer tools.

---

## 3. Database Migration & Neon SSL Setup

### SSL Connection Handling (`backend/src/config/database.ts`)
The native `pg.Pool` automatically enforces SSL encryption when connecting to Neon cloud hosts:
```typescript
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes('neon.tech') || config.nodeEnv === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
```

### Schema & Initial Seeding Commands
```bash
# Execute schema migrations against production Neon database
npm run db:init

# Seed initial test users & default catalog
npm run db:seed
```

---

## 4. Production Build & Deployment Commands

### Backend (AWS Deployment)
- **Build Command**: `npm run build` (Compiles TypeScript in `src/` to JavaScript in `dist/`)
- **Start Command**: `npm run start` (`node dist/server.js`)
- **Health Verification**: `GET /api/health`

### Frontend (Vercel Deployment)
- **Build Command**: `npm run build` (`vite build`)
- **Output Directory**: `dist`
- **Single Page App Rewrite**: Configure `vercel.json` rewrites to route all paths to `index.html`.

---

## 5. End-to-End QA Validation Matrix

| QA Test Scenario | Target Tier | Test Action | Expected Result | Status |
|---|---|---|---|---|
| Health & DB | Backend API | `GET /api/health` | HTTP 200 OK (`database: connected`) | **PASS** |
| Auth & RBAC | API / Frontend | Login as 4 distinct roles | Issues JWT; routes according to role | **PASS** |
| Customer CRM | Full Stack | Create/Edit Customer & Notes | Persists in Neon DB; updates UI | **PASS** |
| Product Catalog| Full Stack | Add/Edit Product & Low Stock | Enforces positive prices & unique SKU | **PASS** |
| Inventory Audit| Full Stack | Stock Adjustment IN/OUT | Logs audit record in `stock_movements` | **PASS** |
| Draft Challan | Full Stack | Create Draft Challan | Stock unchanged; zero OUT movements | **PASS** |
| Confirmation | Full Stack | Confirm Draft Challan | Decrements stock; logs OUT movement | **PASS** |
| Atomic Rollback| Full Stack | Confirm Challan > Stock | Transaction ROLLBACK; 400 error | **PASS** |
| Duplicate Check| Full Stack | Re-confirm Confirmed | Blocked with HTTP 409 Conflict | **PASS** |

---

## 6. Technical Interview Defense Guide

### Question 1: How do you handle CORS securely between Vercel and AWS?
> *"In production, we configure Express `cors` middleware to explicitly allow only our deployed Vercel domain (`FRONTEND_URL`). We reject wildcard `*` origins for authenticated REST requests, preventing unauthorized cross-origin calls while keeping local development origins separate."*

### Question 2: Why do we separate production environment variables from source code?
> *"Storing secrets like `DATABASE_URL` and `JWT_SECRET` in source code risks leakages via public repositories. We inject environment variables into runtime containers on AWS and Vercel at deployment time, ensuring zero credentials exist in repository source files."*
