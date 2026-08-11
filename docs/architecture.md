# Architecture Specification & Data Flow

This document details the architectural design, security flow, data pipeline, and system layer breakdown for the Fundsroom Mini ERP + CRM Portal.

---

## 1. System Overview

The system is built as a decoupled Client-Server architecture:
1. **Frontend Tier**: Single Page Application (SPA) built using React, JavaScript, React Router, Vite, and Tailwind CSS.
2. **API Backend Tier**: RESTful API service built with Node.js, TypeScript, Express.js, and JWT auth deployed on AWS.
3. **Database Tier**: Relational Database Management System using PostgreSQL (Neon PostgreSQL), accessed via native parametrized SQL queries using `pg` connection pooling.

```
       ┌──────────────────────────────────────────────────────────┐
       │         Browser Client (React + Tailwind CSS SPA)        │
       └─────────────────────────────┬────────────────────────────┘
                                     │ (Axios HTTP / Bearer JWT)
                                     ▼
       ┌──────────────────────────────────────────────────────────┐
       │             Express REST API Server (AWS / TS)           │
       │ ┌──────────────────────────────────────────────────────┐ │
       │ │ HTTP Router -> CORS -> Auth / RBAC Middleware        │ │
       │ └───────────────────────────┬──────────────────────────┘ │
       │                             ▼                            │
       │ ┌──────────────────────────────────────────────────────┐ │
       │ │ Controllers (Validation & Response Standardization)  │ │
       │ └───────────────────────────┬──────────────────────────┘ │
       │                             ▼                            │
       │ ┌──────────────────────────────────────────────────────┐ │
       │ │ Services (Business Logic & SQL Transactions)          │ │
       │ └───────────────────────────┬──────────────────────────┘ │
       │                             ▼                            │
       │ ┌──────────────────────────────────────────────────────┐ │
       │ │ Database Driver (`pg` Connection Pool + Param Queries) │ │
       │ └───────────────────────────┬──────────────────────────┘ │
       └─────────────────────────────┼────────────────────────────┘
                                     │ (Native PostgreSQL TCP)
                                     ▼
       ┌──────────────────────────────────────────────────────────┐
       │               Neon PostgreSQL Cloud Server               │
       └──────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Authorization Architecture

### Authentication Flow (JWT + bcrypt)
1. The user inputs email and password at `/login`.
2. `POST /api/auth/login` receives the credentials.
3. Express controller searches `users` table via parametrized query: `SELECT * FROM users WHERE email = $1`.
4. `bcrypt.compare(plainPassword, password_hash)` validates password integrity.
5. Upon successful validation, a JWT is signed using `jsonwebtoken`:
   - Payload: `{ userId: user.id, email: user.email, role: user.role }`
   - Expiration: `24h`
6. The JWT token is returned in the response payload and stored on the client side in `localStorage`.

### Role-Based Access Control (RBAC) Middleware
Requests to protected endpoints pass through two stacked middlewares:
1. `authMiddleware`: Extracts the `Authorization: Bearer <token>` header, verifies the signature using `jwt.verify()`, and attaches `req.user` to the Express Request object.
2. `roleMiddleware(allowedRoles)`: Inspects `req.user.role`. If `req.user.role` is not present in `allowedRoles`, the request is immediately terminated with `HTTP 403 Forbidden`.

---

## 3. Data Flow & Layer Responsibilities

### Client Tier (React SPA)
- Handles user input, state management (`useState`, `useContext`), client-side route guard (`ProtectedRoute`), and API calls (`Axios`).
- Decoupled from backend database logic. Communicates solely via JSON payload schemas over HTTP.

### Express API Controller Layer
- Accepts incoming Express request payloads (`req.body`, `req.params`, `req.query`).
- Validates data types, required fields, and range constraints before calling business services.
- Translates service outcomes into standardized JSON responses (`{ success: true, data: ... }` or `{ success: false, error: ... }`) with explicit HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Error`).

### Service Layer (Business Logic & Transactions)
- Implements core business invariants (e.g. stock checking, customer follow-up updates, challan generation).
- Manages explicit database connection checkouts from `pg.Pool`.
- Controls transaction boundaries (`BEGIN`, `COMMIT`, `ROLLBACK`) for operations affecting multiple tables.

### Database Layer (`pg` Driver)
- Utilizes a shared connection pool (`pg.Pool`) configured with SSL connection parameters for Neon PostgreSQL.
- Executes parametrized queries (`$1`, `$2`, ...) to eliminate SQL Injection vectors.
