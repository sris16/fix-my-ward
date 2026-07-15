import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { EmptyState } from "../../components/ui/EmptyState";

const API_NOTIFICATIONS_URL = "http://localhost:5000/api/admin/notifications";
const API_BROADCAST_URL = "http://localhost:5000/api/admin/notifications/broadcast";
const API_BROADCASTS_HISTORY_URL = "http://localhost:5000/api/admin/notifications/broadcasts";
const API_TEMPLATES_URL = "http://localhost:5000/api/admin/notifications/templates";
const API_PREFERENCES_URL = "http://localhost:5000/api/admin/notifications/preferences";

export default function Notifications() {
  const { token } = useAdminAuth();

  // Active Tab: "inbox" | "broadcast" | "templates"
  const [activeTab, setActiveTab] = useState("inbox");

  // Inbox State
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Inbox Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL"); // "ALL" | "false" (Unread) | "true" (Read)
  const [searchTerm, setSearchTerm] = useState("");

  // Broadcast Center State
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    target: "ALL_CITIZENS",
    type: "Information",
    priority: "High",
    department: "Municipal Core"
  });
  const [broadcastSuccess, setBroadcastSuccess] = useState("");
  const [broadcastError, setBroadcastError] = useState("");

  // Phase 6 & Phase 7: Templates and Preferences State
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, template: null, rendered: null, placeholders: {} });
  const [preferences, setPreferences] = useState({
    inApp: true,
    emailAlerts: false,
    smsAlerts: false,
    pushNotifications: false,
    minimumPriority: "Low",
    channels: {
      citizenReports: true,
      departmentEscalations: true,
      emergencyBroadcasts: true,
      systemAuditNotes: true
    }
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState("");

  // Phase 3: Fetch Notifications Inbox
  const fetchNotifications = useCallback(async (page = 1, silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      if (readFilter !== "ALL") params.append("read", readFilter);
      if (searchTerm.trim() !== "") params.append("search", searchTerm.trim());

      const res = await axios.get(`${API_NOTIFICATIONS_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setPagination(res.data.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, typeFilter, priorityFilter, readFilter, searchTerm]);

  // Phase 4: Fetch Broadcast History
  const fetchBroadcastHistory = useCallback(async () => {
    if (!token) return;
    setBroadcastLoading(true);
    try {
      const res = await axios.get(API_BROADCASTS_HISTORY_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBroadcastHistory(res.data.broadcasts || []);
      }
    } catch (err) {
      console.error("Failed to fetch broadcast history:", err);
    } finally {
      setBroadcastLoading(false);
    }
  }, [token]);

  // Phase 6 & 7: Fetch Templates & Preferences
  const fetchTemplatesAndPreferences = useCallback(async () => {
    if (!token) return;
    setTemplatesLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        axios.get(API_TEMPLATES_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_PREFERENCES_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tRes.data.success) setTemplates(tRes.data.templates || []);
      if (pRes.data.success) setPreferences(pRes.data.preferences || {
        inApp: true,
        emailAlerts: false,
        smsAlerts: false,
        pushNotifications: false,
        minimumPriority: "Low",
        channels: { citizenReports: true, departmentEscalations: true, emergencyBroadcasts: true, systemAuditNotes: true }
      });
    } catch (err) {
      console.error("Failed to fetch templates or preferences:", err);
    } finally {
      setTemplatesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "inbox") {
      fetchNotifications(1);
    } else if (activeTab === "broadcast") {
      fetchBroadcastHistory();
    } else if (activeTab === "templates") {
      fetchTemplatesAndPreferences();
    }
  }, [activeTab, fetchNotifications, fetchBroadcastHistory, fetchTemplatesAndPreferences]);

  // Phase 3 & Phase 8 Actions: Mark as Read / Read All / Delete
  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_NOTIFICATIONS_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_NOTIFICATIONS_URL}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${API_NOTIFICATIONS_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (pagination.totalCount > 0) {
        setPagination((prev) => ({ ...prev, totalCount: prev.totalCount - 1 }));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Phase 4: Submit Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setSubmittingBroadcast(true);
    setBroadcastSuccess("");
    setBroadcastError("");

    try {
      const res = await axios.post(API_BROADCAST_URL, broadcastForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setBroadcastSuccess("Broadcast dispatched across all designated channels successfully!");
        setBroadcastForm({
          title: "",
          message: "",
          target: "ALL_CITIZENS",
          type: "Information",
          priority: "High",
          department: "Municipal Core"
        });
        fetchBroadcastHistory();
        if (activeTab === "inbox") fetchNotifications(1, true);
      }
    } catch (err) {
      console.error("Broadcast dispatch failed:", err);
      setBroadcastError(err.response?.data?.message || "Failed to dispatch broadcast announcement.");
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  // Phase 6: Preview Template
  const handlePreviewTemplate = async (template) => {
    const mockData = {
      citizenName: "Srisakthi Raman",
      ticketId: "#FMW-8D3A1B",
      issueTitle: "Severe Water Main Rupture on North Avenue",
      department: "Water Leakage & Supply Division",
      newValue: "Critical",
      adminName: "Chief Municipal Command",
      title: "Monsoon Emergency Standby Order",
      target: "Roads & Infrastructure Division",
      message: "Immediate heavy machinery deployment required along East Ward flood zone.",
      timeText: "Tonight at 11:30 PM"
    };

    try {
      const res = await axios.post(`${API_TEMPLATES_URL}/preview`, {
        templateKey: template.key,
        placeholders: mockData
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        setPreviewModal({
          open: true,
          template,
          rendered: res.data.rendered,
          placeholders: mockData
        });
      }
    } catch (err) {
      console.error("Failed to preview template:", err);
    }
  };

  // Phase 7: Save Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsSuccess("");
    try {
      const res = await axios.put(API_PREFERENCES_URL, preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPrefsSuccess("Communication channels and notification preferences synchronized successfully!");
        setTimeout(() => setPrefsSuccess(""), 5000);
      }
    } catch (err) {
      console.error("Failed to update preferences:", err);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Helper for notification type visual colors
  const getTypeColorBadge = (type) => {
    switch (type) {
      case "Emergency":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "Warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Maintenance":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Page Header */}
      <PageHeader
        title="Notification & Communication Center"
        subtitle="Centralized municipal operational alerts, citizen status updates, and citywide broadcast dispatches"
        actions={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="px-3 py-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-black text-xs rounded-xl border border-amber-500/20 animate-pulse">
                {unreadCount} Unread Alerts
              </span>
            )}
            <button
              onClick={() => {
                if (activeTab === "inbox") fetchNotifications(pagination.page, false);
                else if (activeTab === "broadcast") fetchBroadcastHistory();
                else fetchTemplatesAndPreferences();
              }}
              className="px-3.5 py-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-200 font-bold text-xs rounded-xl border border-gray-250 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-750 transition flex items-center gap-1.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Refresh Feed</span>
            </button>
          </div>
        }
      />

      {/* Workspace Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
            activeTab === "inbox"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "bg-white dark:bg-gray-900/60 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span>Operational Inbox ({unreadCount > 0 ? `${unreadCount} Unread` : "All Read"})</span>
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
            activeTab === "broadcast"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "bg-white dark:bg-gray-900/60 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
          <span>Broadcast Center & Announcements</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
            activeTab === "templates"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "bg-white dark:bg-gray-900/60 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-purple-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span>Templates & Channels Console</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* WORKSTATION 1: OPERATIONAL INBOX (PHASE 3) */}
      {/* ========================================================= */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          
          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All Alerts", val: "ALL", key: "read" },
                { label: "Unread Only", val: "false", key: "read" },
                { label: "Emergency / Warning", val: "Emergency", key: "type" },
                { label: "Critical Priority", val: "Critical", key: "priority" }
              ].map((pill, idx) => {
                const isActive = (pill.key === "read" && readFilter === pill.val) ||
                                 (pill.key === "type" && typeFilter === pill.val) ||
                                 (pill.key === "priority" && priorityFilter === pill.val);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (pill.key === "read") {
                        setReadFilter(pill.val);
                        if (pill.val !== "ALL") { setTypeFilter("ALL"); setPriorityFilter("ALL"); }
                      } else if (pill.key === "type") {
                        setTypeFilter(pill.val);
                        setReadFilter("ALL"); setPriorityFilter("ALL");
                      } else if (pill.key === "priority") {
                        setPriorityFilter(pill.val);
                        setReadFilter("ALL"); setTypeFilter("ALL");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Mark All Read */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search alerts or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2 rounded-xl text-xs font-medium border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3.5 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition shrink-0"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Notifications Feed */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Error retrieving operational alerts"
              description="Could not connect to the centralized notification engine."
              action={
                <button onClick={() => fetchNotifications(1)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
                  Retry Connection
                </button>
              }
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications found in inbox"
              description="There are no operational or citizen communication alerts matching your active filter selection."
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !notif.read
                      ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700/60 shadow-sm"
                      : "bg-white dark:bg-gray-900/60 border-gray-250 dark:border-gray-800/80 hover:border-gray-400 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getTypeColorBadge(notif.type)}`}>
                        {notif.type}
                      </span>
                      <PriorityBadge priority={notif.priority} />
                      
                      {notif.ticketId && (
                        <Link
                          to={`/admin/issues/${notif.relatedIssue?._id || notif.relatedIssue}`}
                          className="px-2 py-0.5 bg-slate-900 text-white dark:bg-gray-800 text-[10px] font-mono font-black rounded-lg hover:underline"
                        >
                          {notif.ticketId}
                        </Link>
                      )}

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span>Received: <strong className="text-slate-700 dark:text-gray-300 font-bold">{formatTimeAgo(notif.createdAt)}</strong></span>
                      <span>Department: <strong className="text-slate-700 dark:text-gray-300 font-bold">{notif.department}</strong></span>
                      <span>Channel: <strong className="text-blue-500 font-bold">{notif.deliveryChannel}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-750 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-sm transition"
                      >
                        Mark Read
                      </button>
                    )}

                    {notif.ticketId && (
                      <Link
                        to={`/admin/issues/${notif.relatedIssue?._id || notif.relatedIssue}`}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                      >
                        Inspect Issue &rarr;
                      </Link>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                      title="Remove alert"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500">
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total alerts)</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchNotifications(pagination.page - 1)}
                  className="px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-250 dark:border-gray-700 disabled:opacity-40 hover:bg-slate-50 transition text-slate-800 dark:text-white"
                >
                  &larr; Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchNotifications(pagination.page + 1)}
                  className="px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-250 dark:border-gray-700 disabled:opacity-40 hover:bg-slate-50 transition text-slate-800 dark:text-white"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* WORKSTATION 2: BROADCAST CENTER (PHASE 4) */}
      {/* ========================================================= */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dispatch New Broadcast Form */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Dispatch Broadcast" subtitle="Send citywide or departmental advisory notices" />

            {broadcastSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs rounded-2xl border border-emerald-200">
                ✅ {broadcastSuccess}
              </div>
            )}

            {broadcastError && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs rounded-2xl border border-red-200">
                ❌ {broadcastError}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select
                  value={broadcastForm.target}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL_CITIZENS">📢 All Registered Citizens (App Inbox Broadcast)</option>
                  <option value="ALL_DEPARTMENTS">🏢 All Municipal Departments & Officers</option>
                  <option value="Roads & Infrastructure">🚧 Roads & Infrastructure Division Only</option>
                  <option value="Water Leakage & Supply">💧 Water Leakage & Supply Division Only</option>
                  <option value="Drainage & Stormwater">🌊 Drainage & Stormwater Division Only</option>
                  <option value="Public Health">🏥 Public Health Division Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 dark:text-gray-300 mb-1">Notice Type</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Information">Information</option>
                    <option value="Warning">Warning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 dark:text-gray-300 mb-1">Priority Level</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-gray-950 px-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-gray-300 mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Monsoon Standby Advisory..."
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-gray-300 mb-1">Advisory Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide complete details, preventive guidelines, or department standby instructions..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl font-medium border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingBroadcast}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                {submittingBroadcast ? (
                  <span>Dispatching Broadcast...</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    <span>Transmit Broadcast Announcement</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Broadcast History Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
              <SectionTitle title="Broadcast Transmission History" subtitle="Audit log of all sent citywide and division advisories" />
              <span className="text-xs font-bold text-gray-500">{broadcastHistory.length} Transmissions</span>
            </div>

            {broadcastLoading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                ))}
              </div>
            ) : broadcastHistory.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400">
                No broadcast announcements have been dispatched from this command console yet.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {broadcastHistory.map((bc) => (
                  <div
                    key={bc.id}
                    className="p-4 bg-slate-50/80 dark:bg-gray-950/60 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 dark:border-gray-800 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400">Target: {bc.target}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getTypeColorBadge(bc.type)}`}>
                          {bc.type}
                        </span>
                        <PriorityBadge priority={bc.priority} />
                      </div>
                      <span className="text-gray-400 font-medium">{formatTimeAgo(bc.createdAt)}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {bc.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      {bc.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-150/60 dark:border-gray-800/60">
                      <span>Transmitted By: <strong className="text-slate-700 dark:text-gray-300">{bc.senderName}</strong></span>
                      <span className="text-emerald-600 font-bold">● Status: {bc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* WORKSTATION 3: TEMPLATES & CHANNELS CONSOLE (PHASE 6 & 7) */}
      {/* ========================================================= */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Phase 7: Extensible Notification Preferences Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Communication Channels" subtitle="Extensible delivery and operational alert thresholds" />

            {prefsSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs rounded-2xl border border-emerald-200 animate-fade-in">
                ✅ {prefsSuccess}
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-5 text-xs">
              <div className="space-y-3">
                <label className="block font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Active Delivery Channels</label>
                
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-black block">In-App Dashboard Feed</strong>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Mandatory real-time workstation alerts</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded-lg">LOCKED ACTIVE</span>
                </div>

                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-950/60 rounded-2xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-gray-300 transition">
                  <div>
                    <strong className="text-slate-800 dark:text-gray-200 font-bold block">Email Advisory Alerts</strong>
                    <span className="text-[10px] text-gray-500">Hourly digest or instant emergency summaries</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-950/60 rounded-2xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-gray-300 transition">
                  <div>
                    <strong className="text-slate-800 dark:text-gray-200 font-bold block">SMS / Field Telemetry</strong>
                    <span className="text-[10px] text-gray-500">Critical hazard dispatches to field officers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsAlerts}
                    onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <label className="block font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Minimum Priority Threshold</label>
                <select
                  value={preferences.minimumPriority}
                  onChange={(e) => setPreferences({ ...preferences, minimumPriority: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Low">Low (Receive all operational alerts & notes)</option>
                  <option value="Medium">Medium (Verified issues, assignments, status changes)</option>
                  <option value="High">High (Urgent escalations & critical hazards only)</option>
                  <option value="Critical">Critical (Emergency standby alerts strictly)</option>
                </select>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <label className="block font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">Category Subscription Filters</label>
                
                <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={preferences.channels?.citizenReports}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      channels: { ...preferences.channels, citizenReports: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Citizen Complaint Verifications & Intake</span>
                </label>

                <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={preferences.channels?.departmentEscalations}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      channels: { ...preferences.channels, departmentEscalations: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Department Caseload Assignments & Updates</span>
                </label>

                <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={preferences.channels?.emergencyBroadcasts}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      channels: { ...preferences.channels, emergencyBroadcasts: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Citywide Emergency Broadcast Transmissions</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingPrefs}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-md transition hover:opacity-90 flex items-center justify-center gap-2"
              >
                {savingPrefs ? "Synchronizing..." : "Save Communication Settings"}
              </button>
            </form>
          </div>

          {/* Phase 6: Reusable Notification Templates Catalog */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
              <SectionTitle title="Lifecycle Notification Templates" subtitle="Standardized operational & citizen communication patterns with dynamic placeholders" />
              <span className="text-xs font-bold text-gray-500">{templates.length} Active Templates</span>
            </div>

            {templatesLoading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400">
                No notification templates registered in command engine.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[550px] pr-1">
                {templates.map((tpl) => (
                  <div
                    key={tpl.key}
                    className="p-5 bg-slate-50/80 dark:bg-gray-950/60 rounded-3xl border border-gray-200/80 dark:border-gray-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider border border-purple-500/20">
                          {tpl.category}
                        </span>
                        <span className="font-mono font-bold text-gray-400">{tpl.key}</span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {tpl.name}
                      </h4>

                      <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 text-xs space-y-1">
                        <strong className="text-slate-800 dark:text-gray-200 block font-black">{tpl.titleTemplate}</strong>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px] font-medium leading-relaxed">
                          {tpl.messageTemplate}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {tpl.placeholders?.map((ph, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-200 dark:bg-gray-800 text-[9px] font-mono font-black text-slate-700 dark:text-gray-300 rounded">
                            {"{{" + ph + "}}"}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePreviewTemplate(tpl)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shrink-0 shadow-sm"
                      >
                        Test Preview &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Phase 6: Template Live Preview Modal */}
      {previewModal.open && previewModal.template && previewModal.rendered && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">Live Render Test</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{previewModal.template.name}</h3>
              </div>
              <button
                onClick={() => setPreviewModal({ open: false, template: null, rendered: null, placeholders: {} })}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 text-gray-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 block">Simulated Telemetry Output (as received by recipient):</span>
              
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/25 border border-blue-300 dark:border-blue-800/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                    {previewModal.template.category}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">● Just now (Channel: In-App)</span>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {previewModal.rendered.title}
                </h4>

                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                  {previewModal.rendered.message}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-950/60 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1 text-[11px]">
                <strong className="text-slate-700 dark:text-gray-300 font-bold block">Injected Placeholder Telemetry:</strong>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-gray-600 dark:text-gray-400">
                  {Object.entries(previewModal.placeholders).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{k}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewModal({ open: false, template: null, rendered: null, placeholders: {} })}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs rounded-2xl shadow transition"
            >
              Close Preview Panel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
