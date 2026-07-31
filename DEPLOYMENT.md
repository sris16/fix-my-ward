# 🚀 Fix My Ward — Deployment & Operations Guide

This guide details how to run, test, containerize, and deploy the **Fix My Ward** platform in Development and Production environments.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- MongoDB URI (Atlas or Local MongoDB)

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will boot on `http://localhost:5000`.

### 3. Database Seeding (Admin & Issues)
```bash
cd backend
node utils/seedAdmin.js
node utils/seedIssues.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will boot on `http://localhost:5173`.

---

## 🛡️ Running Automated Test Suite
Run the automated production verification test suite to ensure API health, rate limiting, and RBAC authentication:
```bash
cd backend
node utils/testSuite.js
```

---

## 🐳 Production Containerization (Docker & Docker Compose)

The project includes production-ready Docker containers for both backend and frontend.

### 1. Build and Run Full Stack with Docker Compose
```bash
docker compose up --build -d
```

### 2. Verify Container Status
```bash
docker compose ps
```

### 3. Access Services
- **Frontend SPA (Nginx)**: `http://localhost:80`
- **Backend API (Node.js)**: `http://localhost:5000`

### 4. View Container Logs
```bash
docker compose logs -f
```

---

## 🔒 Production Hardening Features Implemented

1. **HTTP Security Headers**: Powered by `helmet` middleware protecting against XSS, clickjacking, and MIME sniffing.
2. **Rate Limiting**: `express-rate-limit` restricting excessive requests and brute force authentication attacks.
3. **Route Lazy Loading**: Code-splitting React routes with `React.lazy` and `Suspense` fallback.
4. **Vite Bundle Optimization**: Custom Rollup `manualChunks` vendor splitting separating React, Recharts, Leaflet, and utilities into cached chunks.
5. **Centralized Error Handling**: Standardized 404 and global error formatting eliminating internal stack trace exposure in production.
