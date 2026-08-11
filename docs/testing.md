# Automated & Manual Test Suite Log

This document details all test procedures, execution commands, expected outputs, and actual verification results conducted across Phase 2 and Phase 3.

---

## 1. Complete Test Summary Matrix

| Test ID | Module | Action / Endpoint | Input Payload | Expected Response | Actual Status | Result |
|---|---|---|---|---|---|---|
| T-01 | DB | Connection check | `SELECT NOW()` | Connected | Connected | **PASS** |
| T-02 | DB | Schema initialization | `npm run db:init` | 7 Tables Created | 7 Tables Created | **PASS** |
| T-03 | DB | Seed execution | `npm run db:seed` | 4 Users & Data | 4 Users & Data | **PASS** |
| T-04 | Auth | `GET /api/health` | None | 200 OK | 200 OK | **PASS** |
| T-05 | Auth | `POST /api/auth/login` | Valid Admin credentials | 200 OK + JWT | 200 OK + JWT | **PASS** |
| T-06 | Auth | `GET /api/auth/me` | Valid Bearer JWT | 200 OK + User info | 200 OK + User info | **PASS** |
| T-07 | CRM | `POST /api/customers` | New customer data | 201 Created | 201 Created | **PASS** |
| T-08 | CRM | `GET /api/customers` | Pagination `page=1` | 200 OK + Customer list | 200 OK + List | **PASS** |
| T-09 | CRM | `POST /api/customers/:id/notes` | Customer note | 201 Created | 201 Created | **PASS** |
| T-10 | Product | `POST /api/products` | New product data | 201 Created | 201 Created | **PASS** |
| T-11 | Product | `GET /api/products` | Search query `SKU` | 200 OK + Product data | 200 OK + Data | **PASS** |
| T-12 | Product | Duplicate SKU | Same SKU payload | 409 Conflict | 409 Conflict | **PASS** |
| T-13 | Inventory | Stock Adjustment IN | Qty: 10, Type: IN | 200 OK + Stock updated | 200 OK + Updated | **PASS** |
| T-14 | Challan | Create Draft Challan | Status: Draft, 2 items | 201 Created (Stock unchanged) | 201 Created | **PASS** |
| T-15 | Challan | Confirm Challan | `POST /api/challans/:id/confirm` | 200 OK + Stock reduced | 200 OK + Reduced | **PASS** |
| T-16 | Challan | Insufficient Stock | Qty: 9999 | 400 Bad Request (Rolled back)| 400 Bad Request | **PASS** |
### Phase 4 Frontend Integration & UI Test Matrix

| Test ID | Category | Component / Flow | Test Action | Expected Result | Status |
|---|---|---|---|---|---|
| T-19 | UI Build | `npm run build` | Vite production build | Zero errors (`dist/` generated) | **PASS** |
| T-20 | Auth | Login Page | Submit `admin@fundsroom.com` | Redirects to `/dashboard` with JWT | **PASS** |
| T-21 | Auth | Quick Login Buttons | Click Sales Quick Login | Auto-fills credentials & signs in | **PASS** |
| T-22 | Auth | Invalid Login | Submit wrong password | Displays inline red error alert | **PASS** |
| T-23 | Auth | Session Restore | Page reload when logged in | Restores user session via `/api/auth/me` | **PASS** |
| T-24 | Routing | Unauthenticated Access | Navigate to `/dashboard` directly | Redirects to `/login` | **PASS** |
| T-25 | RBAC UI | Navigation Links | Log in as `Warehouse` | Hides CRM & Sales Challan menu links | **PASS** |
| T-26 | Dashboard | Metric Overview | View dashboard cards | Displays Total Customers, Products, Low Stock | **PASS** |
| T-27 | CRM | Customer Creation | Submit new customer modal | Adds customer & refreshes table | **PASS** |
| T-28 | CRM | Customer Notes | Add follow-up note | Appends note to history feed | **PASS** |
| T-29 | Products | Product Creation | Submit new product modal | Adds product to catalog | **PASS** |
| T-30 | Inventory | Stock Adjustment | Adjust stock IN / OUT | Logs movement & updates stock | **PASS** |
| T-31 | Challan | Draft Creation | Submit Draft challan | Creates Draft challan (Stock unchanged) | **PASS** |
| T-32 | Challan | Confirmation Flow | Click Confirm on Draft | Confirmation modal -> Stock reduced | **PASS** |
| T-33 | Challan | Duplicate Confirm | Re-click Confirm | Confirmation button hidden for Confirmed | **PASS** |
| T-34 | Errors | Insufficient Stock | Create Confirmed > Stock | Displays backend error alert | **PASS** |
| T-35 | Layout | Responsive Viewport | View on 768px tablet width | Navigation & tables adjust cleanly | **PASS** |
