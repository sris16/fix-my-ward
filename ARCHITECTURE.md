# 📐 Fix My Ward — System Architecture Document

## 1. High-Level Architecture Overview

```
                      +-----------------------------+
                      |       Web Browser           |
                      | (Citizen & Admin Portals)   |
                      +--------------+--------------+
                                     |
                                     | HTTP / REST (JWT Auth)
                                     v
                      +-----------------------------+
                      |   Nginx Web Server / Proxy  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Express Backend Service    |
                      |  (Node.js 20 Cluster / PM2) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    MongoDB Atlas Database   |
                      +-----------------------------+
```

---

## 2. Directory Structure

```
Fix My Ward/
├── backend/
│   ├── config/              # Database connection & env validation
│   ├── controllers/         # Thin Express controllers
│   │   └── admin/           # Domain controllers
│   ├── middleware/          # Auth, RBAC, Rate Limiter, Error, Sanitizer
│   ├── models/              # Mongoose schemas (Admin, User, Issue, etc.)
│   ├── routes/              # Express API routers
│   │   └── admin/           # Admin domain routes
│   ├── services/            # Core business logic layer
│   │   └── admin/           # Admin domain business services
│   ├── tests/               # Modular unit & integration test suites
│   ├── utils/               # Logger, Paginate, Seed scripts, Test runner
│   ├── Dockerfile           # Production Node.js Alpine container
│   ├── ecosystem.config.cjs # PM2 cluster configuration
│   └── server.js            # Express application entrypoint
│
└── frontend/
    ├── public/              # Static public assets
    ├── src/
    │   ├── admin/           # Admin SaaS Portal application
    │   │   ├── components/  # Layout, Live & UI components
    │   │   ├── context/     # Admin auth context
    │   │   ├── hooks/       # Custom hooks (e.g. useLiveTelemetryRefresh)
    │   │   ├── layouts/     # Admin SaaS layout
    │   │   ├── pages/       # Lazy-loaded admin pages
    │   │   └── routes/      # Guarded nested admin routes
    │   ├── components/      # Shared citizen components
    │   ├── context/         # ThemeContext (Light/Dark mode)
    │   ├── pages/           # Lazy-loaded citizen pages
    │   ├── App.jsx          # Root application router with Suspense
    │   └── main.jsx         # React application mounting point
    ├── Dockerfile           # Multi-stage Nginx Alpine container
    ├── nginx.conf           # SPA fallback & Gzip configuration
    └── vite.config.js       # Vite configuration with manualChunks vendor splitting
```

---

## 3. Core Architectural Principles

1. **Monorepo Architecture**: Dual application hosted in a single frontend client using route-based access control.
2. **Thin Controllers & Rich Services**: Controllers only validate inputs and format HTTP responses; all query filtering, audit logging, and calculations reside in `backend/services/`.
3. **Data Security & Authorization**: Role-based access control (`requireRole`) protects all sensitive endpoints.
4. **Performance & Caching**: Code-splitting via `React.lazy()`, Rollup `manualChunks` vendor splitting, and `.lean()` MongoDB queries.
