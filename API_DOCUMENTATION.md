# 📖 Fix My Ward — API Documentation

This document provides a comprehensive overview of all RESTful API endpoints available in the **Fix My Ward** platform backend.

---

## 🔐 Authentication & Base Configuration

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token passed via HTTP Header:
  `Authorization: Bearer <your_jwt_token>`

---

## 👥 Citizen Authentication APIs (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new citizen account | No |
| `POST` | `/api/auth/login` | Authenticate citizen & return JWT | No (Rate Limited) |
| `GET` | `/api/auth/profile` | Retrieve current citizen profile | Yes (`protect`) |
| `PUT` | `/api/auth/profile` | Update citizen profile details | Yes (`protect`) |

---

## 📋 Issue Management APIs (`/api/issues`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/issues` | Fetch public civic issue complaints | No |
| `GET` | `/api/issues/:id` | Get detailed issue by ID | No |
| `POST` | `/api/issues` | Report a new civic complaint | Yes (`protect`) |
| `PUT` | `/api/issues/:id` | Update reported issue | Yes (`protect`) |
| `POST` | `/api/issues/:id/upvote` | Upvote/endorse a civic issue | Yes (`protect`) |

---

## 🛡️ Admin Portal APIs (`/api/admin`)

### 1. Admin Authentication (`/api/admin/login`, `/profile`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate administrator & return JWT | No (Rate Limited) |
| `GET` | `/api/admin/profile` | Fetch authenticated admin details | Yes (`protectAdmin`) |

### 2. Issue Operations (`/api/admin/issues`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/issues` | Search, filter, and paginate issues | `admin` |
| `GET` | `/api/admin/issues/:id` | Fetch full issue details | `admin` |
| `PATCH` | `/api/admin/issues/:id/verify` | Verify citizen reported complaint | `admin` |
| `PATCH` | `/api/admin/issues/:id/reject` | Reject invalid complaint with reason | `admin` |
| `PATCH` | `/api/admin/issues/:id/assign` | Assign issue to municipal department | `admin` |
| `PATCH` | `/api/admin/issues/:id/priority` | Update issue priority (`Low`, `Medium`, `High`, `Critical`)| `admin` |
| `PATCH` | `/api/admin/issues/:id/status` | Update resolution status (`Pending`, `In Progress`, `Resolved`, `Closed`) | `admin` |
| `POST` | `/api/admin/issues/:id/notes` | Add internal administrative note | `admin` |

### 3. Department Operations (`/api/admin/departments`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/departments` | Get department workload overview | `admin` |
| `GET` | `/api/admin/departments/:departmentName` | Get department work queue & assigned officers | `admin` |

### 4. Executive Analytics (`/api/admin/analytics`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/analytics/overview` | Executive SLA & resolution metrics | `admin` |
| `GET` | `/api/admin/analytics/categories` | Category complaint distribution | `admin` |
| `GET` | `/api/admin/analytics/departments` | Department response time analytics | `admin` |

### 5. Live Command Center (`/api/admin/live`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/live/overview` | Real-time GIS ward telemetry | `admin` |
| `GET` | `/api/admin/live/activity` | Live municipal activity stream | `admin` |

### 6. Notifications & Broadcasts (`/api/admin/notifications`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/notifications` | Fetch admin notification inbox | `admin` |
| `POST` | `/api/admin/notifications/broadcast` | Broadcast announcement to citizens or departments | `admin` |

### 7. Citizen Management (`/api/admin/citizens`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/citizens` | Citizen directory & engagement scores | `admin` |
| `GET` | `/api/admin/citizens/:id` | Citizen profile timeline & trust tier | `admin` |

---

## 🚨 Standard HTTP Response Format

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response (HTTP 400 / 401 / 403 / 404 / 429 / 500)
```json
{
  "success": false,
  "message": "Detailed error message"
}
```
