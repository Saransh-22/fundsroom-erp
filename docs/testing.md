# Automated & Manual Test Suite Log

This document details all test procedures, execution commands, expected outputs, and actual verification results conducted during Phase 2.

---

## 1. Test Summary Matrix

| Test ID | Test Category | Target Endpoint / Action | Input Payload / Header | Expected Status | Actual Status | Result |
|---|---|---|---|---|---|---|
| T-01 | DB Connectivity | Startup check | `SELECT NOW()` via `pg.Pool` | Connected | Connected | **PASS** |
| T-02 | DB Schema Init | `npm run db:init` | Executes `schema.sql` | 7 Tables Created | 7 Tables Created | **PASS** |
| T-03 | DB Seed System | `npm run db:seed` | Password hashes & sample data | 4 Users Seeded | 4 Users Seeded | **PASS** |
| T-04 | Health Check | `GET /api/health` | None | 200 OK | 200 OK | **PASS** |
| T-05 | Admin Login | `POST /api/auth/login` | `admin@fundsroom.com` / `Admin@123` | 200 OK + JWT | 200 OK + JWT | **PASS** |
| T-06 | Sales Login | `POST /api/auth/login` | `sales@fundsroom.com` / `Sales@123` | 200 OK + JWT | 200 OK + JWT | **PASS** |
| T-07 | Warehouse Login| `POST /api/auth/login` | `warehouse@fundsroom.com` / `Warehouse@123` | 200 OK + JWT | 200 OK + JWT | **PASS** |
| T-08 | Accounts Login | `POST /api/auth/login` | `accounts@fundsroom.com` / `Accounts@123` | 200 OK + JWT | 200 OK + JWT | **PASS** |
| T-09 | Wrong Password | `POST /api/auth/login` | `admin@fundsroom.com` / `WrongPass` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| T-10 | Unknown Email | `POST /api/auth/login` | `fake@fundsroom.com` / `Admin@123` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| T-11 | Auth Me No Token| `GET /api/auth/me` | No `Authorization` header | 401 Unauthorized | 401 Unauthorized | **PASS** |
| T-12 | Auth Me Invalid | `GET /api/auth/me` | `Bearer invalid_token` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| T-13 | Auth Me Admin | `GET /api/auth/me` | Valid Admin Bearer token | 200 OK + User Data | 200 OK + User Data | **PASS** |
| T-14 | Auth Me Sales | `GET /api/auth/me` | Valid Sales Bearer token | 200 OK + User Data | 200 OK + User Data | **PASS** |
| T-15 | RBAC Authorized | `GET /api/auth/test-admin` | Admin Bearer token | 200 OK | 200 OK | **PASS** |
| T-16 | RBAC Forbidden | `GET /api/auth/test-admin` | Sales Bearer token | 403 Forbidden | 403 Forbidden | **PASS** |
| T-17 | Build Check | `npm run build` | `tsc` compile process | Exit Code 0 | Exit Code 0 | **PASS** |

---

## 2. Execution Commands & Verification Evidence

### Health Check Verification
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
# Response: { success: true, status: 'ok', message: 'Fundsroom ERP API service is running', database: 'connected' }
```

### Auth & RBAC Verification
```powershell
# Admin Login
$res = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@fundsroom.com","password":"Admin@123"}'
$token = $res.data.token

# Profile Retrieval
$me = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers @{ Authorization = "Bearer $token" }
# Response: { success: true, data: { id: 1, name: 'Admin User', email: 'admin@fundsroom.com', role: 'Admin' } }
```
