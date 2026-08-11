# Authentication & Authorization Architecture Guide

This document explains the authentication mechanism, JWT lifecycle, password security, and Role-Based Access Control (RBAC) implementation in the Fundsroom ERP system.

---

## 1. Authentication Flow (`POST /api/auth/login`)

```
  Client (Postman / Browser)                  Backend Express Service                  PostgreSQL Database
             │                                          │                                       │
             ├─── 1. POST /api/auth/login ─────────────>│                                       │
             │    { email, password }                   │                                       │
             │                                          ├─── 2. SELECT * FROM users ───────────>│
             │                                          │       WHERE email = $1                │
             │                                          │<── 3. Return user record ─────────────┤
             │                                          │                                       │
             │                                          ├─── 4. bcrypt.compare(pass, hash)      │
             │                                          │                                       │
             │                                          ├─── 5. jwt.sign({ id, email, role })   │
             │                                          │                                       │
             │<── 6. Return { token, user } ────────────┤                                       │
             │    Status: 200 OK                        │                                       │
```

---

## 2. Mandatory Educational Concepts

### Concept A: Password Hashing with `bcryptjs`
- **What it is**: `bcrypt` is a password-hashing function designed to securely transform plain-text passwords into irreversible, salted cryptographic hashes.
- **Why we use it here**: Storing plain-text passwords in databases is an unacceptable security vulnerability. In case of data leaks, hashed passwords cannot be reversed.
- **How it works in this project**:
  - During seeding (`src/db/seed.ts`), plain passwords like `'Admin@123'` are hashed with a salt factor of 10 (`await bcrypt.hash('Admin@123', 10)`).
  - During login (`src/services/authService.ts`), `bcrypt.compare(password, user.password_hash)` evaluates whether the submitted password produces the same hash.
- **How I can explain it in an interview**:
  > *"We never store plain-text passwords. We use `bcryptjs` with salt rounds to generate a secure one-way hash. During authentication, `bcrypt.compare()` verifies the entered password against the stored hash without ever needing to decrypt it."*

---

### Concept B: JWT (JSON Web Token) Generation & Verification
- **What it is**: JWT is a compact, URL-safe standard (RFC 7519) for transmitting claims securely between two parties.
- **Why we use it here**: It enables stateless authentication. The server does not need to store user session IDs in memory or Redis.
- **How it works in this project**:
  - Upon successful login, `generateToken()` creates a token containing user identity details (`id`, `email`, `role`) signed using `JWT_SECRET` with a 24-hour expiration.
  - Clients send this token in the header: `Authorization: Bearer <token>`.
  - `authMiddleware` calls `jwt.verify(token, config.jwtSecret)` to validate signature and expiration, populating `req.user`.
- **How I can explain it in an interview**:
  > *"We use stateless JWT authentication. Upon login, the backend issues a signed JWT containing identity and role claims. For subsequent requests, `authMiddleware` verifies the token's cryptographic signature via `jwt.verify()` before granting access."*

---

### Concept C: Role-Based Access Control (RBAC Middleware)
- **What it is**: An authorization mechanism that restricts API access based on assigned user roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Why we use it here**: Different user personas have distinct business permissions (e.g. Sales creates challans, Warehouse updates stock).
- **How it works in this project**:
  - `roleMiddleware('Admin', 'Sales')` inspects `req.user.role` extracted from the verified JWT token.
  - If `req.user.role` matches allowed roles, `next()` is called. Otherwise, it immediately returns `403 Forbidden`.
- **How I can explain it in an interview**:
  > *"We enforce authorization at the router level using higher-order middleware `roleMiddleware(...allowedRoles)`. It reads the user's role from `req.user` (derived from the verified JWT) and returns HTTP 403 if the user lacks required permissions."*

---

### Concept D: 401 Unauthorized vs 403 Forbidden
- **What it is**: Two distinct HTTP standard error status codes.
- **Why we use it here**: To maintain clear API semantics regarding authentication versus authorization errors.
- **How it works in this project**:
  - **401 Unauthorized**: Missing, malformed, or invalid/expired JWT token, or incorrect login credentials.
  - **403 Forbidden**: Valid JWT token provided, but the user's role does not have permission to access the endpoint.
- **How I can explain it in an interview**:
  > *"HTTP 401 means 'You are not authenticated' (missing or invalid credentials/token), while HTTP 403 means 'You are authenticated, but you are not allowed to access this resource'."*
