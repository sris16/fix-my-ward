# 🏛️ Fix My Ward — Municipal Civic Infrastructure Platform

> **Production-Ready Enterprise SaaS & Citizen Reporting Platform**

Fix My Ward is a full-stack civic infrastructure management system designed for municipal corporations and urban citizens. It combines a mobile-first **Citizen Portal** for issue reporting with a high-performance **Admin SaaS Portal & GIS Live Command Center** for municipal operations.

---

## 🌟 Key Features

### 👤 Citizen Portal
- **User Authentication**: Secure registration, login, and JWT-based session persistence.
- **Issue Reporting**: Form with location tagging, category selection, and photo attachments.
- **Interactive Map**: Ward issue tracking on dynamic maps.
- **Community Upvoting & Badges**: Community engagement metrics, trust levels, and contribution scoring.

### 🛡️ Admin SaaS Portal (`/admin/*`)
- **Executive Dashboard**: Real-time operational KPIs, resolution velocity, and workload metrics.
- **Issue Lifecycle Engine**: Verification, rejection, department routing, priority adjustments, internal audit notes, and lifecycle timeline.
- **GIS Live Command Center**: Interactive Leaflet map, telemetry updates, ward monitoring, emergency queues.
- **Notification Engine**: Targeted notifications and broadcast center for municipal announcements.
- **Executive Analytics**: Interactive charts, category breakdowns, department response times, CSV & PDF report exports.
- **Platform Administration**: Admin accounts, dynamic role-based access control (RBAC), ward & department configurations, audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, React Router v7, Recharts, React Leaflet.
- **Backend**: Node.js 20, Express 5, MongoDB / Mongoose, JWT, Helmet, Express Rate Limit, Morgan, Winston Logger.
- **Containerization & Operations**: Docker, Docker Compose, Nginx, PM2 Cluster.

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- Node.js `v18+` or `v20+`
- MongoDB Atlas account or local MongoDB instance

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

### 2. Database Seeding
```bash
cd backend
node utils/seedAdmin.js
node utils/seedIssues.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit the Citizen Portal at `http://localhost:5173/` and the Admin Portal at `http://localhost:5173/admin/login`.

---

## 🐳 Docker Deployment

To launch the complete production stack using Docker Compose:
```bash
docker compose up --build -d
```

- **Frontend (Nginx)**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **Health Check Endpoint**: `http://localhost:5000/api/health`

---

## 📖 Documentation Suite

- 📜 [Architecture Overview](ARCHITECTURE.md)
- 📖 [API Documentation](API_DOCUMENTATION.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🛡️ [Admin Manual](MANUAL_ADMIN.md)
- 👤 [Citizen Manual](MANUAL_CITIZEN.md)
- 📋 [Production Readiness Audit](PRODUCTION_READINESS.md)
