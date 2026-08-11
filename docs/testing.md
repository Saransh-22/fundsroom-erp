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
| T-17 | Challan | Duplicate Confirmation | Confirm already Confirmed | 409 Conflict | 409 Conflict | **PASS** |
| T-18 | Build | `npm run build` | `tsc` compilation | Exit Code 0 | Exit Code 0 | **PASS** |
