# React Frontend Architecture & Integration Guide

This document details the component hierarchy, authentication context, protected routes, role-based navigation, Axios API client setup, and UI state management for the Fundsroom ERP Operations Portal.

---

## 1. Component Architecture & Directory Map

```
frontend/src/
├── services/
│   └── api.js              # Centralized Axios client (Bearer JWT interceptor + 401 handler)
├── context/
│   └── AuthContext.jsx     # Centralized authentication state (user, token, login, logout)
├── components/
│   └── ProtectedRoute.jsx  # Unauthenticated redirect guard
├── layouts/
│   └── MainLayout.jsx      # ERP Shell layout (Sidebar, Top Header, Role badges, Navigation)
├── pages/
│   ├── LoginPage.jsx       # Login form with quick demo credentials
│   ├── DashboardPage.jsx   # Executive overview & metric cards
│   ├── CustomersPage.jsx   # CRM listing, search, filtering, and create/edit modal
│   ├── CustomerDetailPage.jsx # Customer profile & follow-up notes feed
│   ├── ProductsPage.jsx    # Catalog listing, search, filtering, and create/edit modal
│   ├── InventoryPage.jsx   # Warehouse stock level overview, low-stock filter, audit logs & adjust modal
│   ├── ChallansPage.jsx    # Sales challans list and status filtering
│   ├── CreateChallanPage.jsx  # Multi-product sales challan creation form
│   └── ChallanDetailPage.jsx  # Challan detail, snapshot line items & confirmation action
├── App.jsx                 # React Router (v6) route configuration
├── main.jsx                # Entry point
└── index.css               # Tailwind CSS imports
```

---

## 2. Key Educational Concepts for Technical Interview Defense

### Concept 1: Centralized Axios Client & Interceptor Pattern
- **What it is**: Configuring a single shared Axios instance (`api.js`) with request and response interceptors.
- **Why we use it here**: Eliminates code duplication by automatically appending `Authorization: Bearer <token>` to protected API calls and centrally redirecting expired sessions (401 errors) to `/login`.
- **How to explain in an interview**:
  > *"We centralized HTTP requests inside `src/services/api.js`. An Axios request interceptor automatically attaches the Bearer JWT token from `localStorage` to outgoing requests, while a response interceptor catches 401 Unauthorized responses to log out expired user sessions."*

---

### Concept 2: Authentication Context (`AuthContext`)
- **What it is**: A React Context provider that holds user identity (`id`, `name`, `email`, `role`) and token state across the application tree.
- **Why we use it here**: Prevents prop drilling and provides global `useAuth()` access to identity details and `logout()` triggers.
- **How to explain in an interview**:
  > *"We manage authentication state using React Context. On application startup, `AuthProvider` verifies the stored token via `GET /api/auth/me` to restore the active user session or clear invalid credentials."*

---

### Concept 3: Client-Side Route Protection vs Server-Side Security
- **What it is**: `ProtectedRoute` checks for token presence before rendering layout components, redirecting unauthenticated users to `/login`.
- **Why we use it here**: Improves UX by blocking unauthenticated page access in the browser.
- **How to explain in an interview**:
  > *"Frontend route guards like `ProtectedRoute` provide user experience redirection, but they are not security boundaries. Real security is enforced on the backend via Express JWT and RBAC middleware."*

---

## 3. JWT `localStorage` Security Trade-off Analysis

### Why this project uses `localStorage` for JWT
In this case-study single page application (SPA), storing the JWT token in `localStorage` under `fundsroom_token` allows persistent session authentication across browser reloads without requiring complex cookie domain setups or back-channel refresh token infrastructure.

### The Security Trade-off (XSS Risk)
- **Trade-off**: Data stored in `localStorage` is accessible to any JavaScript code executing within the same origin domain. If an attacker succeeds in injecting malicious scripts via an **XSS (Cross-Site Scripting)** vulnerability, they could read `localStorage.getItem('fundsroom_token')` and exfiltrate the user's JWT.
- **Enterprise Alternative (HTTP-Only SameSite Cookies)**: In high-security production environments, JWTs or session tokens are typically transmitted via `HttpOnly`, `Secure`, `SameSite=Strict` cookies. `HttpOnly` prevents client-side JavaScript from accessing the cookie, effectively mitigating token exfiltration via XSS.
- **How to explain in an interview**:
  > *"We store the JWT in `localStorage` for simple stateless session persistence across SPA reloads. The security trade-off is that `localStorage` can be read by JavaScript if an XSS vulnerability exists. In a production enterprise system, we would store authentication tokens in `HttpOnly` cookies to block JavaScript access."*
