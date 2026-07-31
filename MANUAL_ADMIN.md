# 🛡️ Admin SaaS Portal User Manual

## 1. Login & Access
- Navigate to `http://localhost:5173/admin/login`
- Enter Administrator email and password.
- Default Admin Credentials:
  - **Email**: `admin@fixmyward.gov.in`
  - **Password**: `adminpassword123`

---

## 2. Managing Complaints (`/admin/issues`)
- **Filter & Search**: Filter issues by Status (`Pending`, `Verified`, `Assigned`, `In Progress`, `Resolved`, `Rejected`), Priority (`Low`, `Medium`, `High`, `Critical`), Category, or Department.
- **Verify / Reject Issue**: Review citizen complaints and click **Verify** or **Reject** with an administrative note.
- **Assign Department**: Route verified complaints to specific municipal departments (e.g. Roads, Water Board, Electrical).
- **Update Priority & Status**: Transition issue status through the resolution lifecycle.

---

## 3. Department Workstations (`/admin/departments`)
- Select a department to inspect officer queues, active workloads, and resolution metrics.

---

## 4. Live Command Center (`/admin/live-monitor`)
- Real-time GIS map powered by React Leaflet showing active ward incidents, emergency queues, and live activity streams.

---

## 5. Notification Center (`/admin/notifications`)
- Broadcast citywide municipal announcements or targeted notifications to specific wards or citizen groups.

---

## 6. Executive Analytics (`/admin/analytics`)
- Review resolution velocity charts, category breakdown statistics, and export detailed CSV and PDF reports.
