# Architectural Decisions & Interview Preparation Guide

This document captures key technical decisions, architectural trade-offs, and interview preparation defense strategies for the Fundsroom Mini ERP + CRM assignment.

---

## Technical Interview Preparation & Defense Notes

### 1. Database Access Strategy: Raw SQL (`pg`) vs ORM (Prisma/TypeORM/Sequelize)
- **Question**: *"Why did you use native `pg` queries with raw SQL instead of an ORM like Prisma or TypeORM?"*
- **Answer**: 
  - *"We chose the native pg driver and parameterized SQL because this project is small enough for direct SQL, it keeps database operations transparent, and it gives us explicit control over PostgreSQL transactions and row locking for the inventory workflow."*

### 2. Inventory & Concurrency Strategy: Database Transactions & Row Locking (`SELECT ... FOR UPDATE`)
- **Question**: *"How do you handle concurrent stock modifications during sales challan confirmation?"*
- **Answer**:
  - *"SELECT FOR UPDATE locks the selected product rows during the transaction so concurrent stock-changing operations cannot modify those same rows until the transaction completes. This helps keep stock validation and deduction consistent."*

### 3. Historical Financial Auditing: Snapshot Pattern in `sales_challan_items`
- **Question**: *"Why do you duplicate `product_name`, `sku`, and `unit_price` inside the `sales_challan_items` table instead of just referencing `product_id`?"*
- **Answer**:
  - *"This is the **Product Snapshot Pattern**, an essential architectural requirement for ERP systems."*
  - *"If a product's price or description changes next month, historical sales challans and invoices generated today must retain their original historical pricing and product description."*
  - *"Referencing only `product_id` would corrupt past financial records whenever a catalog update occurs."*

### 4. Authentication Architecture: Stateless JWT vs Stateful Express Sessions
- **Question**: *"Why did you choose JWT over server-side session cookies?"*
- **Answer**:
  - *"JWTs provide a lightweight, stateless authentication model ideally suited for RESTful APIs."*
  - *"The server verifies incoming Bearer tokens using a cryptographic secret key without needing a server-side session cache like Redis. It enables seamless horizontal scaling of our API across multiple instances on AWS cloud hosting."*

### 5. Codebase Maintenance: Comments Policy & Self-Documenting Architecture
- **Question**: *"Why are there no code comments in your source files?"*
- **Answer**:
  - *"We adhere to clean code principles where module boundaries, domain-driven naming conventions, explicit TypeScript types, and intuitive function names make the code self-documenting."*
  - *"High-level architectural rationale, sequence flows, database schemas, and setup procedures belong in dedicated markdown documentation (`docs/`), while source code remains concise, maintainable, and free of redundant or outdated comments."*

---

## Phase 2 Implementation Decisions

1. **Centralized PostgreSQL Pool (`pg.Pool`)**: Instead of creating database connections per route, `src/config/database.ts` exports a single global pool instance. This reduces connection handshake overhead and manages max client limits efficiently.
2. **Stateless Middleware Hierarchy**: Placed `authMiddleware` prior to `roleMiddleware`. `authMiddleware` acts as the single source of identity decoding (`req.user`), preventing unauthenticated requests from hitting authorization logic.
3. **Structured Response Objects**: All API endpoints return a uniform envelope: `{ success: true, data: ... }` for success and `{ success: false, error: ... }` for failures, making client integration clean and predictable.
