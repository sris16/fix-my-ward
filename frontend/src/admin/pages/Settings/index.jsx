import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";

const API_BASE = "http://localhost:5000/api/admin/system";

export default function Settings() {
  const { token, admin: currentAdmin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Overview Data State
  const [preferences, setPreferences] = useState({});
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  const [roles, setRoles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [security, setSecurity] = useState(null);
  const [maintenance, setMaintenance] = useState(null);

  // Admins Tab State
  const [adminsList, setAdminsList] = useState([]);
  const [adminsPagination, setAdminsPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [adminSearch, setAdminSearch] = useState("");
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Department Officer",
    department: "Roads & Infrastructure",
    designation: "Field Officer"
  });
  const [resetPasswordResult, setResetPasswordResult] = useState(null);
  const [inspectAdmin, setInspectAdmin] = useState(null);

  // Department / Category / Ward Creation Forms
  const [newDeptForm, setNewDeptForm] = useState({ name: "", color: "blue", description: "", contact: "", head: "" });
  const [newCatForm, setNewCatForm] = useState({ name: "", description: "" });
  const [newWardForm, setNewWardForm] = useState({ wardName: "", wardNumber: "", zone: "Central Zone" });

  // Template Editing State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", content: "", isActive: true });

  // Preferences Form State
  const [prefForm, setPrefForm] = useState({});
  const [saveSuccess, setSaveSuccess] = useState("");

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPreferences(res.data.preferences || {});
        setPrefForm(res.data.preferences || {});
        setDepartments(res.data.departments || []);
        setCategories(res.data.categories || []);
        setWards(res.data.wards || []);
        setRoles(res.data.roles || []);
        setTemplates(res.data.templates || []);
        setSecurity(res.data.security || null);
        setMaintenance(res.data.maintenance || null);
      }
    } catch (err) {
      console.error("Failed to load platform overview:", err);
      setError(err.response?.data?.message || "Failed to load Platform Administration Center");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAdmins = useCallback(async (pageNo = 1) => {
    if (!token) return;
    try {
      const params = new URLSearchParams({ page: pageNo.toString(), limit: "15" });
      if (adminSearch.trim() !== "") params.append("search", adminSearch.trim());

      const res = await axios.get(`${API_BASE}/admins?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAdminsList(res.data.admins || []);
        setAdminsPagination(res.data.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  }, [token, adminSearch]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === "admins") {
      fetchAdmins(1);
    }
  }, [activeTab, fetchAdmins]);

  const showNotificationToast = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // ================= ACTIONS =================
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admins`, newAdminForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowCreateAdminModal(false);
        setNewAdminForm({ name: "", email: "", password: "", role: "Department Officer", department: "Roads & Infrastructure", designation: "Field Officer" });
        fetchAdmins(1);
        showNotificationToast("New administrator account created successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error creating administrator account");
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const res = await axios.put(`${API_BASE}/admins/${adminId}/status`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchAdmins(adminsPagination.page);
        showNotificationToast(`Administrator status updated to ${!currentStatus ? "Active" : "Disabled"}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleResetPassword = async (adminId) => {
    if (!window.confirm("Are you sure you want to generate a temporary reset password for this administrator?")) return;
    try {
      const res = await axios.post(`${API_BASE}/admins/${adminId}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResetPasswordResult(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error resetting password");
    }
  };

  const handleToggleModulePermission = async (roleIdx, moduleName) => {
    const updatedRoles = JSON.parse(JSON.stringify(roles));
    const roleObj = updatedRoles[roleIdx];
    if (roleObj.modulesAccessible.includes(moduleName)) {
      roleObj.modulesAccessible = roleObj.modulesAccessible.filter((m) => m !== moduleName);
    } else {
      roleObj.modulesAccessible.push(moduleName);
    }
    setRoles(updatedRoles);
    try {
      await axios.put(`${API_BASE}/roles`, { roles: updatedRoles }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotificationToast("Role permission matrix updated successfully!");
    } catch (err) {
      alert("Error updating role permissions");
      fetchOverview();
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptForm.name.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/departments`, newDeptForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDepartments(res.data.departments || []);
        setNewDeptForm({ name: "", color: "blue", description: "", contact: "", head: "" });
        showNotificationToast("Department configuration added successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding department");
    }
  };

  const handleToggleDepartmentStatus = async (deptId, currentStatus) => {
    try {
      const res = await axios.put(`${API_BASE}/departments/${deptId}`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDepartments(res.data.departments || []);
        showNotificationToast(`Department status updated to ${!currentStatus ? "Active" : "Disabled"}`);
      }
    } catch (err) {
      alert("Error toggling department status");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/categories`, newCatForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCategories(res.data.categories || []);
        setNewCatForm({ name: "", description: "" });
        showNotificationToast("Issue category added successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category");
    }
  };

  const handleToggleCategoryStatus = async (catId, currentStatus) => {
    try {
      const res = await axios.put(`${API_BASE}/categories/${catId}/status`, { isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCategories(res.data.categories || []);
        showNotificationToast(`Category status updated to ${!currentStatus ? "Active" : "Disabled"}`);
      }
    } catch (err) {
      alert("Error updating category status");
    }
  };

  const handleAddWard = async (e) => {
    e.preventDefault();
    if (!newWardForm.wardName.trim() || !newWardForm.wardNumber.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/wards`, newWardForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWards(res.data.wards || []);
        setNewWardForm({ wardName: "", wardNumber: "", zone: "Central Zone" });
        showNotificationToast("Municipal ward added successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding ward");
    }
  };

  const handleToggleWardStatus = async (wardId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Disabled" : "Active";
    try {
      const res = await axios.put(`${API_BASE}/wards/${wardId}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWards(res.data.wards || []);
        showNotificationToast(`Ward status updated to ${nextStatus}`);
      }
    } catch (err) {
      alert("Error updating ward status");
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const res = await axios.put(`${API_BASE}/templates/${editingTemplate.templateKey}`, templateForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const updated = templates.map((t) => t.templateKey === editingTemplate.templateKey ? res.data.template : t);
        setTemplates(updated);
        setEditingTemplate(null);
        showNotificationToast(`Template ${editingTemplate.name} updated (v${res.data.template.version})!`);
      }
    } catch (err) {
      alert("Error updating template");
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/preferences`, prefForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPreferences(res.data.preferences || {});
        showNotificationToast("System-wide preferences and parameters saved successfully!");
      }
    } catch (err) {
      alert("Error saving preferences");
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const renderTemplatePreview = (template) => {
    if (!template) return "";
    let content = templateForm.content || template.content || "";
    content = content.replace(/\{\{citizenName\}\}/g, "Rajesh Kumar")
                     .replace(/\{\{ticketId\}\}/g, "FMW-948271")
                     .replace(/\{\{issueTitle\}\}/g, "Severe Pothole near RS Puram Signal")
                     .replace(/\{\{department\}\}/g, "Roads & Infrastructure")
                     .replace(/\{\{adminName\}\}/g, currentAdmin?.name || "Command Officer")
                     .replace(/\{\{newValue\}\}/g, "Critical")
                     .replace(/\{\{title\}\}/g, "Heavy Monsoon Alert")
                     .replace(/\{\{target\}\}/g, "Coimbatore South & West Zones")
                     .replace(/\{\{message\}\}/g, "Emergency stormwater pumps deployed across low-lying junctions")
                     .replace(/\{\{timeText\}\}/g, "02:00 AM - 05:00 AM IST");
    return content;
  };

  const allModules = ["Dashboard", "Issues", "Departments", "Analytics", "Live Monitor", "Notifications", "Citizens", "Settings"];

  return (
    <div className="space-y-6 relative pb-12">
      <PageHeader
        title="Platform Administration Center"
        subtitle="Super Administrator command console for governing administrator credentials, role matrices, departments, templates, and system oversight"
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-1.5">
                <span>✓</span>
                <span>{saveSuccess}</span>
              </span>
            )}
            <button
              onClick={fetchOverview}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow hover:opacity-90 transition flex items-center gap-2"
            >
              <span>Refresh Administration Telemetry</span>
            </button>
          </div>
        }
      />

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        {[
          { key: "overview", label: "📊 System Overview", count: null },
          { key: "admins", label: "👥 Admin Accounts", count: adminsPagination.totalCount || 1 },
          { key: "roles", label: "🔐 Roles & Permissions", count: roles.length },
          { key: "departments", label: "🏢 Departments Config", count: departments.length },
          { key: "categories", label: "📋 Categories & Wards", count: categories.length + wards.length },
          { key: "templates", label: "✉️ Notification Templates", count: templates.length },
          { key: "preferences", label: "⚙️ System Preferences", count: null },
          { key: "security", label: "🛡️ Security & Maintenance", count: null }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-gray-500 hover:bg-slate-100 dark:hover:bg-gray-800/60 dark:text-gray-400"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? "bg-white/20 dark:bg-slate-800 text-white dark:text-white" : "bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-96 bg-white dark:bg-gray-900/60 rounded-3xl animate-pulse p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider animate-bounce">
            Loading System Administration Center...
          </span>
        </div>
      ) : error ? (
        <EmptyState
          title="Access Denied / System Error"
          description={error}
          action={<button onClick={fetchOverview} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Retry Connection</button>}
        />
      ) : (
        <>
          {/* ================= TAB 1: OVERVIEW & CROSS-PLATFORM INTEGRATION ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Health Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="System High Availability"
                  value={security?.systemHealth?.uptime || "99.98%"}
                  trend="Replica Set Optimal"
                  trendType="up"
                  description="Real-time MongoDB and Node service health status across municipal zones"
                />
                <StatCard
                  title="Active Administrators"
                  value={adminsPagination.totalCount || 1}
                  trend="Super-Admin Guarded"
                  trendType="up"
                  description="Command officers configured with secure access permits"
                />
                <StatCard
                  title="Active Departments"
                  value={departments.filter((d) => d.isActive).length}
                  trend={`${departments.length} Total Configured`}
                  trendType="up"
                  description="Municipal divisions managing field resolution caseloads"
                />
                <StatCard
                  title="Storage Usage Quota"
                  value={maintenance?.storageUsage?.split(" ")[0] + " MB" || "14.8 MB"}
                  trend="500 MB Enterprise Tier"
                  trendType="up"
                  description="Database indices, audit telemetry, and citizen timelines"
                />
              </div>

              {/* Cross-Module Navigation (Phase 10) */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle
                  title="Cross-Platform Governance Modules"
                  subtitle="Unified administrative links to navigate directly across Fix My Ward Versions 1 through 9"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Dashboard Command", subtitle: "Real-time municipal KPI overview", link: "/admin/dashboard", icon: "📊", color: "blue" },
                    { title: "Issues & Caseloads", subtitle: "Report lifecycle and priority queues", link: "/admin/issues", icon: "📋", color: "emerald" },
                    { title: "Departments Console", subtitle: "Workload distribution & SLA telemetry", link: "/admin/departments", icon: "🏢", color: "purple" },
                    { title: "Executive Analytics", subtitle: "Resolution charts & ward trends", link: "/admin/analytics", icon: "📈", color: "amber" },
                    { title: "Live Command Center", subtitle: "GIS map & emergency alert triggers", link: "/admin/live-monitor", icon: "🚨", color: "red" },
                    { title: "Notification Center", subtitle: "Citywide broadcast dispatch center", link: "/admin/notifications", icon: "🔔", color: "indigo" },
                    { title: "Citizen Intelligence", subtitle: "Participation badges & trust index", link: "/admin/citizens", icon: "👥", color: "cyan" },
                    { title: "System Preferences", subtitle: "Current active governance workspace", link: "#", icon: "⚙️", color: "slate", onClick: () => setActiveTab("preferences") }
                  ].map((mod, idx) => (
                    <Link
                      key={idx}
                      to={mod.link !== "#" ? mod.link : undefined}
                      onClick={mod.onClick}
                      className="p-5 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 hover:border-blue-500 transition group flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{mod.icon}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border text-slate-600 dark:text-gray-300 group-hover:text-blue-600">
                            Version Module
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                          {mod.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {mod.subtitle}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-800/50 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                        <span>Launch Module</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ADMIN ACCOUNTS MANAGEMENT (Phase 2) ================= */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search administrators by name, email, or department..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <span>+ Create Administrator Account</span>
                </button>
              </div>

              {/* Reset Password Modal / Alert Banner */}
              {resetPasswordResult && (
                <div className="p-5 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl text-amber-900 dark:text-amber-200 space-y-2 relative">
                  <button onClick={() => setResetPasswordResult(null)} className="absolute top-4 right-4 text-xs font-black">✕ Dismiss</button>
                  <h4 className="text-sm font-black flex items-center gap-2">
                    <span>🔑 Temporary Password Generated for {resetPasswordResult.email}</span>
                  </h4>
                  <p className="text-xs">
                    Please securely communicate the following one-time reset credentials to the administrator. They will be required to update it upon next sign-in:
                  </p>
                  <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-sm rounded-xl font-bold w-fit border border-slate-700">
                    {resetPasswordResult.tempPassword}
                  </div>
                </div>
              )}

              {/* Create Admin Modal */}
              {showCreateAdminModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-scale-up">
                    <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Provision New Administrator</h3>
                      <button onClick={() => setShowCreateAdminModal(false)} className="text-gray-400 hover:text-white text-sm font-bold">✕</button>
                    </div>

                    <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs font-bold">
                      <div>
                        <label className="block text-gray-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.name}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                          placeholder="e.g. Er. S. Meenakshi"
                          className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-500 mb-1">Email (Login Identity)</label>
                          <input
                            type="email"
                            required
                            value={newAdminForm.email}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                            placeholder="meenakshi@fixmyward.gov.in"
                            className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Initial Password</label>
                          <input
                            type="text"
                            required
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                            placeholder="MunicipalAdmin@123"
                            className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-500 mb-1">Assigned Role</label>
                          <select
                            value={newAdminForm.role}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          >
                            {roles.map((r) => (
                              <option key={r.roleName} value={r.roleName}>{r.roleName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Department Jurisdiction</label>
                          <select
                            value={newAdminForm.department}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, department: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          >
                            {departments.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Designation / Title</label>
                        <input
                          type="text"
                          required
                          value={newAdminForm.designation}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, designation: e.target.value })}
                          placeholder="e.g. Chief Water Engineer"
                          className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                        <button type="button" onClick={() => setShowCreateAdminModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-xl text-xs font-bold">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md">Provision Account</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Admins Table */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle title="Registered Administrator Accounts" subtitle="Active supervisory profiles with role permissions and status flags (Strictly non-deletable for audit integrity)" />

                <Table
                  headers={[
                    { label: "Administrator Profile", className: "min-w-[220px]" },
                    { label: "Role & Designation", className: "min-w-[200px]" },
                    { label: "Department", className: "min-w-[170px]" },
                    { label: "Account Status", className: "min-w-[120px]" },
                    { label: "Last Login", className: "min-w-[140px]" },
                    { label: "Created Date", className: "min-w-[120px]" },
                    { label: "Governance Actions", className: "text-right min-w-[210px]" }
                  ]}
                  data={adminsList}
                  renderRow={(adm) => (
                    <tr key={adm._id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {getInitials(adm.name)}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{adm.name}</h5>
                            <span className="text-[10px] text-gray-400 font-mono block">{adm.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 inline-block">
                          {adm.role}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500 block mt-0.5">{adm.designation}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-gray-200">
                        {adm.department || "General Administration"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                          adm.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                        }`}>
                          <span>●</span>
                          <span>{adm.isActive ? "Active" : "Disabled"}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never Logged In"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {new Date(adm.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => setInspectAdmin(adm)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleResetPassword(adm._id)}
                          className="px-2.5 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 transition"
                        >
                          Reset Password
                        </button>
                        {adm.email !== "admin@fixmyward.gov.in" && (
                          <button
                            onClick={() => handleToggleAdminStatus(adm._id, adm.isActive)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition ${
                              adm.isActive ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            }`}
                          >
                            {adm.isActive ? "Disable" : "Enable"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                />
              </div>

              {/* View Admin Profile Modal */}
              {inspectAdmin && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Administrator Inspection Card</h3>
                      <button onClick={() => setInspectAdmin(null)} className="text-gray-400 hover:text-white text-sm font-bold">✕</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center">
                        {getInitials(inspectAdmin.name)}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{inspectAdmin.name}</h4>
                        <span className="text-xs font-mono text-gray-400">{inspectAdmin.email}</span>
                        <span className="block mt-1 px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-bold text-[10px] w-fit">
                          {inspectAdmin.role}
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-150 dark:divide-gray-800 text-xs font-bold pt-2">
                      <div className="py-2.5 flex justify-between"><span className="text-gray-500">Department</span><span>{inspectAdmin.department}</span></div>
                      <div className="py-2.5 flex justify-between"><span className="text-gray-500">Designation</span><span>{inspectAdmin.designation}</span></div>
                      <div className="py-2.5 flex justify-between"><span className="text-gray-500">System ID</span><span className="font-mono text-[11px]">{inspectAdmin._id}</span></div>
                      <div className="py-2.5 flex justify-between"><span className="text-gray-500">Account Status</span><span className="text-emerald-500">● {inspectAdmin.isActive ? "Active" : "Disabled"}</span></div>
                    </div>
                    <button onClick={() => setInspectAdmin(null)} className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black">Close Profile</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ROLES & PERMISSIONS MATRIX (Phase 3) ================= */}
          {activeTab === "roles" && (
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 dark:border-gray-800 pb-4">
                <div>
                  <SectionTitle title="Roles & Module Access Matrix" subtitle="Configure which municipal roles can access specific command workspaces. Changes take immediate effect across all session guards." />
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-xs font-black">
                  5 Default Governance Roles
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Role Title & Description</th>
                      {allModules.map((m) => (
                        <th key={m} className="px-4 py-4 text-center">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60 text-xs font-bold">
                    {roles.map((r, roleIdx) => {
                      const isSuper = r.roleName === "Super Administrator";
                      return (
                        <tr key={r.roleName} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition">
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-black text-slate-900 dark:text-white">{r.roleName}</h5>
                              {r.isSystemDefault && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400">System Default</span>}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">{r.description}</p>
                          </td>

                          {allModules.map((m) => {
                            const isChecked = r.modulesAccessible.includes(m);
                            return (
                              <td key={m} className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isSuper} // Super Administrator always has access to all modules
                                  onChange={() => handleToggleModulePermission(roleIdx, m)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: DEPARTMENT CONFIGURATION (Phase 4) ================= */}
          {activeTab === "departments" && (
            <div className="space-y-6">
              {/* Add New Department Card */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle title="Configure New Municipal Department" subtitle="Provision new operational divisions without affecting historical Issue assignment integrity" />
                <form onSubmit={handleAddDepartment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-bold">
                  <div>
                    <label className="block text-gray-500 mb-1">Department Name *</label>
                    <input
                      type="text"
                      required
                      value={newDeptForm.name}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                      placeholder="e.g. Urban Forestry Division"
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Department Head</label>
                    <input
                      type="text"
                      value={newDeptForm.head}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, head: e.target.value })}
                      placeholder="Er. R. Kumar"
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Contact Email/Phone</label>
                    <input
                      type="text"
                      value={newDeptForm.contact}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, contact: e.target.value })}
                      placeholder="forestry@fixmyward.gov.in"
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Badge Theme Color</label>
                    <select
                      value={newDeptForm.color}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, color: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="blue">Blue (Roads & General)</option>
                      <option value="cyan">Cyan (Water Supply)</option>
                      <option value="emerald">Emerald (Drainage)</option>
                      <option value="red">Red (Public Health)</option>
                      <option value="amber">Amber (Electricity)</option>
                      <option value="green">Green (Parks & Ecology)</option>
                      <option value="purple">Purple (Special Projects)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow transition">
                      + Add Department
                    </button>
                  </div>
                </form>
              </div>

              {/* Departments Table */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle title="Active Department Directory" subtitle="All municipal departments configured inside the Fix My Ward ecosystem" />
                <Table
                  headers={[
                    { label: "Department Title", className: "min-w-[200px]" },
                    { label: "Division Head", className: "min-w-[160px]" },
                    { label: "Contact Line", className: "min-w-[180px]" },
                    { label: "Color Theme", className: "min-w-[120px]" },
                    { label: "Status", className: "min-w-[110px]" },
                    { label: "Governance", className: "text-right min-w-[120px]" }
                  ]}
                  data={departments}
                  renderRow={(dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-xs">
                        {dept.name}
                        {dept.description && <span className="block text-[10px] text-gray-400 font-normal">{dept.description}</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-gray-200">{dept.head || "Unassigned"}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">{dept.contact || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">
                          ● {dept.color}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          dept.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                        }`}>
                          {dept.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleDepartmentStatus(dept._id, dept.isActive)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition ${
                            dept.isActive ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                        >
                          {dept.isActive ? "Disable Division" : "Enable Division"}
                        </button>
                      </td>
                    </tr>
                  )}
                />
              </div>
            </div>
          )}

          {/* ================= TAB 5: CATEGORIES & WARDS CONFIGURATION (Phase 5) ================= */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Categories Section */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <SectionTitle title="Issue Categories Configuration" subtitle="Report types selectable by citizens during complaint filing" />
                
                <form onSubmit={handleAddCategory} className="flex gap-2 text-xs font-bold">
                  <input
                    type="text"
                    required
                    value={newCatForm.name}
                    onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                    placeholder="New category title (e.g. Stray Cattle)..."
                    className="flex-1 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shrink-0 shadow">
                    + Add Category
                  </button>
                </form>

                <div className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-bold max-h-[420px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat._id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white">{cat.name}</h5>
                        {cat.description && <span className="text-[10px] text-gray-400 font-normal block">{cat.description}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.isActive ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"}`}>
                          ● {cat.isActive ? "Active" : "Disabled"}
                        </span>
                        <button
                          onClick={() => handleToggleCategoryStatus(cat._id, cat.isActive)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-lg text-[10px] hover:bg-slate-200"
                        >
                          {cat.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Municipal Wards Section */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <SectionTitle title="Municipal Wards & Zones Configuration" subtitle="Coimbatore administrative boundaries and verification zones" />
                
                <form onSubmit={handleAddWard} className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <input
                    type="text"
                    required
                    value={newWardForm.wardNumber}
                    onChange={(e) => setNewWardForm({ ...newWardForm, wardNumber: e.target.value })}
                    placeholder="Number (e.g. 58)"
                    className="bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    value={newWardForm.wardName}
                    onChange={(e) => setNewWardForm({ ...newWardForm, wardName: e.target.value })}
                    placeholder="Ward Title (e.g. Ward 58 - Kovaipudur)"
                    className="col-span-2 bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newWardForm.zone}
                    onChange={(e) => setNewWardForm({ ...newWardForm, zone: e.target.value })}
                    className="col-span-2 bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Central Zone">Central Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                    <option value="North Zone">North Zone</option>
                    <option value="South Zone">South Zone</option>
                  </select>
                  <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow">
                    + Add Ward
                  </button>
                </form>

                <div className="divide-y divide-gray-200 dark:divide-gray-800 text-xs font-bold max-h-[420px] overflow-y-auto pr-1">
                  {wards.map((ward) => (
                    <div key={ward._id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white">{ward.wardName}</h5>
                        <span className="text-[10px] text-indigo-500 uppercase tracking-wider block">Zone: {ward.zone} (Ward #{ward.wardNumber})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ward.status === "Active" ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"}`}>
                          ● {ward.status}
                        </span>
                        <button
                          onClick={() => handleToggleWardStatus(ward._id, ward.status)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-lg text-[10px] hover:bg-slate-200"
                        >
                          {ward.status === "Active" ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: NOTIFICATION TEMPLATES ADMINISTRATION (Phase 6) ================= */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Templates List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <SectionTitle title="Notification Templates" subtitle="Select a template to inspect variables or edit content" />
                  <div className="divide-y divide-gray-150 dark:divide-gray-800">
                    {templates.map((tmpl) => {
                      const isSelected = editingTemplate?.templateKey === tmpl.templateKey;
                      return (
                        <button
                          key={tmpl.templateKey}
                          onClick={() => {
                            setEditingTemplate(tmpl);
                            setTemplateForm({ subject: tmpl.subject, content: tmpl.content, isActive: tmpl.isActive });
                          }}
                          className={`w-full text-left py-3.5 px-3 rounded-2xl transition flex flex-col justify-between gap-1 ${
                            isSelected ? "bg-blue-500/10 border border-blue-500/40" : "hover:bg-slate-50 dark:hover:bg-gray-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{tmpl.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-gray-800 rounded">v{tmpl.version || 1}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span>Target: {tmpl.recipient}</span>
                            <span>•</span>
                            <span className={tmpl.isActive ? "text-emerald-500" : "text-red-500"}>
                              ● {tmpl.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Template Editor & Live Variable Preview */}
              <div className="lg:col-span-2 space-y-6">
                {editingTemplate ? (
                  <form onSubmit={handleSaveTemplate} className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{editingTemplate.name}</h4>
                        <span className="text-xs font-mono text-gray-400">Key: {editingTemplate.templateKey}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500">Status:</label>
                        <select
                          value={templateForm.isActive}
                          onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.value === "true" })}
                          className="bg-slate-50 dark:bg-gray-950 px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white"
                        >
                          <option value="true">Active & Dispatched</option>
                          <option value="false">Disabled (Muted)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs font-bold">
                      <div>
                        <label className="block text-gray-500 mb-1">Subject Line Template</label>
                        <input
                          type="text"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Message Content Template (Supports {{variables}})</label>
                        <textarea
                          rows={4}
                          value={templateForm.content}
                          onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-gray-950 p-3.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono text-xs leading-relaxed"
                        />
                      </div>

                      {/* Available Variables Box */}
                      <div className="p-3 bg-slate-100 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-600 dark:text-gray-400 block">Available Template Variables:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(editingTemplate.variables || ["citizenName", "ticketId", "issueTitle", "department"]).map((v) => (
                            <span key={v} className="px-2 py-0.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md font-mono text-[11px] border">
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Live Variable Preview Box */}
                      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-300 block">💡 Real-Time Rendered Preview:</span>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                          "{renderTemplatePreview(editingTemplate)}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                      <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-xl text-xs font-bold">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow">Save Template Updates (v{(editingTemplate.version || 1) + 1})</button>
                    </div>
                  </form>
                ) : (
                  <EmptyState
                    title="No template selected"
                    description="Click on any notification template from the left list to edit its content or test real-time variable rendering."
                  />
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 7: SYSTEM PREFERENCES (Phase 7) ================= */}
          {activeTab === "preferences" && (
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl">
              <SectionTitle title="Global System Configuration & Preferences" subtitle="These parameters dictate telemetry cycles, pagination defaults, and operational modes across all administrative sessions." />
              
              <form onSubmit={handleSavePreferences} className="space-y-6 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-500 mb-1">Application Name</label>
                    <input
                      type="text"
                      value={prefForm.applicationName || ""}
                      onChange={(e) => setPrefForm({ ...prefForm, applicationName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Municipality Authority Name</label>
                    <input
                      type="text"
                      value={prefForm.municipalityName || ""}
                      onChange={(e) => setPrefForm({ ...prefForm, municipalityName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Timezone Standard</label>
                    <input
                      type="text"
                      value={prefForm.timezone || ""}
                      onChange={(e) => setPrefForm({ ...prefForm, timezone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Default Date Format</label>
                    <select
                      value={prefForm.dateFormat || "DD/MM/YYYY"}
                      onChange={(e) => setPrefForm({ ...prefForm, dateFormat: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (IST Standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Default UI Theme</label>
                    <select
                      value={prefForm.themeDefault || "Dark"}
                      onChange={(e) => setPrefForm({ ...prefForm, themeDefault: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Dark">Dark Mode</option>
                      <option value="Light">Light Mode</option>
                      <option value="System">System Default</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Session Inactivity Timeout (Minutes)</label>
                    <input
                      type="number"
                      value={prefForm.sessionTimeout || 60}
                      onChange={(e) => setPrefForm({ ...prefForm, sessionTimeout: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Default Directory Pagination Size</label>
                    <input
                      type="number"
                      value={prefForm.defaultPagination || 15}
                      onChange={(e) => setPrefForm({ ...prefForm, defaultPagination: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Live Command Auto-Refresh Interval (Seconds)</label>
                    <input
                      type="number"
                      value={prefForm.autoRefreshInterval || 25}
                      onChange={(e) => setPrefForm({ ...prefForm, autoRefreshInterval: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">🚨 Emergency Platform Governance Toggles</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-950/50 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block">System Maintenance Mode</span>
                      <span className="text-[11px] text-gray-500 font-medium">When enabled, restricts citizen portal submissions while allowing emergency command login.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.maintenanceMode || false}
                      onChange={(e) => setPrefForm({ ...prefForm, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-950/50 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block">Platform Read-Only Mode</span>
                      <span className="text-[11px] text-gray-500 font-medium">Locks all state mutations during scheduled database migrations or backup routines.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm.readOnlyMode || false}
                      onChange={(e) => setPrefForm({ ...prefForm, readOnlyMode: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg">
                    Save System Preferences & Governance Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 8: AUDIT & SECURITY & MAINTENANCE CENTER (Phases 8 & 9) ================= */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* System Health Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>🛡️ Security & Maintenance Architecture Center</span>
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Live audit telemetry, SSL status, replica set metrics, and database governance architecture
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black w-fit">
                    ● ALL SYSTEMS OPTIMAL
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">MongoDB Health</span>
                    <span className="text-sm font-black text-emerald-400">{maintenance?.mongoHealth || "Optimal"}</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">App Build & Version</span>
                    <span className="text-sm font-black text-white">{maintenance?.applicationVersion || "v10.0.0-PROD"}</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">SSL & Security Scan</span>
                    <span className="text-sm font-black text-blue-400">{security?.systemHealth?.sslCertificate || "Valid RSA 4096-bit"}</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Database Quota Usage</span>
                    <span className="text-sm font-black text-purple-400">{maintenance?.storageUsage || "14.8 MB / 500 MB"}</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools Placeholders (Phase 9) */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle title="Database Architecture & Snapshot Tools" subtitle="Simulated enterprise backup, import, and maintenance triggers (Strictly architectural placeholders per Version 10 scope)" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>📦 Export Database Snapshot</span>
                      </h5>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Generate encrypted `.gz` dump of all collections (`Issues`, `Users`, `History`, `Config`).
                      </p>
                    </div>
                    <button
                      onClick={() => showNotificationToast("Simulated Snapshot Export: Backup archive fixmyward_2026-07-15.gz generated to architectural vault!")}
                      className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black shadow hover:opacity-90 transition"
                    >
                      Trigger Snapshot Export
                    </button>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🔄 Restore from Archive</span>
                      </h5>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Restore database state from verified municipal recovery checkpoints.
                      </p>
                    </div>
                    <button
                      onClick={() => showNotificationToast("Simulated Restore Action: Architecture dry-run completed successfully with zero integrity errors.")}
                      className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black shadow hover:opacity-90 transition"
                    >
                      Verify Recovery Checkpoint
                    </button>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🧹 Optimize Indices & Storage</span>
                      </h5>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Run MongoDB compact and re-index routine across `IssueHistory` and `Users` collections.
                      </p>
                    </div>
                    <button
                      onClick={() => showNotificationToast("Simulated Index Optimization: Re-indexed 5 compound indices across 6 collections in 14ms.")}
                      className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black shadow hover:opacity-90 transition"
                    >
                      Run Storage Optimization
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit Log Feed (Phase 8) */}
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <SectionTitle title="Live Administrative Audit Feed" subtitle="Recent governance actions and system transitions tracked across IssueHistory and Notification audit logs" />
                
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {security?.recentActions && security.recentActions.length > 0 ? (
                    security.recentActions.map((act) => (
                      <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-gray-800/30 px-3 rounded-2xl transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{act.action}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                              Actor: {act.actorName}
                            </span>
                            {act.issueId && <span className="text-[10px] font-mono text-gray-400">#{act.issueId.slice(-6).toUpperCase()}</span>}
                          </div>
                          {act.notes && <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{act.notes}</p>}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 shrink-0">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No recent audit logs" description="No administrative action records detected in current session telemetry." />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
