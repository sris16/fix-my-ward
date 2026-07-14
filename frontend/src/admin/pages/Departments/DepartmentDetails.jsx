import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { EmptyState } from "../../components/ui/EmptyState";

const API_BASE_URL = "http://localhost:5000/api/admin/departments";

export default function DepartmentDetails() {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [departmentData, setDepartmentData] = useState({
    summary: {},
    assignedOfficers: [],
    recentResolutions: [],
    recentActivity: [],
    issues: [],
  });

  // Phase 5 & Phase 6: Search, Filter, Sort & Officer Work Queue States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'priority'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchDepartmentDetails = async () => {
    if (!token || !departmentName) return;
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(`${API_BASE_URL}/${departmentName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDepartmentData({
          summary: response.data.summary || {},
          assignedOfficers: response.data.assignedOfficers || [],
          recentResolutions: response.data.recentResolutions || [],
          recentActivity: response.data.recentActivity || [],
          issues: response.data.issues || [],
        });
      }
    } catch (err) {
      console.error("Failed to load department details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentDetails();
    setCurrentPage(1);
    setSelectedOfficer("ALL");
  }, [departmentName, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " (" + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ")";
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Phase 5 & Phase 6: Filtered and Sorted Issue Queue
  const filteredAndSortedIssues = useMemo(() => {
    const { issues } = departmentData;
    if (!issues || !Array.isArray(issues)) return [];

    return issues
      .filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.locationText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reportedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesOfficer =
          selectedOfficer === "ALL" ||
          (selectedOfficer === "UNASSIGNED" && (!item.assignedOfficer || item.assignedOfficer === "")) ||
          item.assignedOfficer === selectedOfficer;

        const matchesPriority = selectedPriority === "ALL" || item.priority === selectedPriority;
        const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

        return matchesSearch && matchesOfficer && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === "priority") {
          const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [departmentData.issues, searchQuery, selectedOfficer, selectedPriority, selectedStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedIssues.length / itemsPerPage));
  const paginatedIssues = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedIssues.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedIssues, currentPage]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !departmentData.summary?.name) {
    return (
      <EmptyState
        title="Department Not Found"
        description={`The requested municipal division "${decodeURIComponent(departmentName || "")}" could not be loaded.`}
        action={
          <button
            onClick={() => navigate("/admin/departments")}
            className="px-4 py-2 bg-emerald-500 text-gray-950 font-bold text-xs rounded-xl hover:bg-emerald-600 transition"
          >
            Back to Departments Center
          </button>
        }
      />
    );
  }

  const { summary, assignedOfficers, recentActivity } = departmentData;

  const uniqueOfficers = Array.from(
    new Set([
      ...assignedOfficers.map((o) => o.name),
      ...departmentData.issues.map((i) => i.assignedOfficer).filter(Boolean),
    ])
  );

  // Helper badge formatting for activity timeline
  const getActivityBadge = (action) => {
    switch (action) {
      case "VERIFY_ISSUE":
        return { text: "VERIFIED", color: "bg-emerald-500 text-gray-950" };
      case "ASSIGN_DEPARTMENT":
        return { text: "DISPATCHED", color: "bg-teal-500 text-gray-950" };
      case "CHANGE_PRIORITY":
        return { text: "TRIAGED", color: "bg-amber-500 text-gray-950" };
      case "CHANGE_STATUS":
        return { text: "STATUS CHANGE", color: "bg-blue-500 text-white" };
      case "ADD_NOTE":
        return { text: "NOTE ADDED", color: "bg-purple-500 text-white" };
      case "REJECT_ISSUE":
        return { text: "REJECTED", color: "bg-red-500 text-white" };
      default:
        return { text: "LOGGED", color: "bg-slate-700 text-white" };
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/departments")}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-500 transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Divisions Roster
        </button>

        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
          DEPARTMENT OPERATIONS CENTER • PHASE 6-10 ACTIVE
        </span>
      </div>

      {/* 1. Hero Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              DIVISION COMMAND WORKSPACE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight pt-1">
            {summary.name}
          </h1>
          <p className="text-xs text-gray-400 font-light max-w-xl leading-relaxed">
            Operational dashboard for {summary.name}. Monitoring triage queues, officer allocations, and resolution SLAs across Coimbatore. Click any field officer card below to isolate their active work queue.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 relative z-10 w-full lg:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <span className="text-lg font-black text-white">{summary.totalAssigned}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Total Assigned</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <span className="text-lg font-black text-emerald-400">{summary.efficiency}%</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">SLA Efficiency</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <span className="text-lg font-black text-amber-400">{summary.pending + summary.inProgress}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Active Queue</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <span className="text-lg font-black text-blue-400">{summary.activeOfficers}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Active Officers</p>
          </div>
        </div>
      </div>

      {/* 2. Operational Breakdown & Phase 7 Activity Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Status Breakdown & Phase 6 Officer Work Queue */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status & Priority Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-3">
              <SectionTitle title="Lifecycle Status Breakdown" subtitle="Current workflow progression" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-black text-amber-500 block">{summary.pending}</span>
                  <span className="text-[9.5px] text-gray-500 font-bold uppercase mt-0.5 block">Pending / Vrf.</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-black text-blue-500 block">{summary.inProgress}</span>
                  <span className="text-[9.5px] text-gray-500 font-bold uppercase mt-0.5 block">In Progress</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-black text-emerald-500 block">{summary.resolved}</span>
                  <span className="text-[9.5px] text-gray-500 font-bold uppercase mt-0.5 block">Resolved</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-black text-red-500 block">{summary.rejected}</span>
                  <span className="text-[9.5px] text-gray-500 font-bold uppercase mt-0.5 block">Rejected</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-3">
              <SectionTitle title="Priority Severity Breakdown" subtitle="Distribution by hazard weighting" />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <span className="text-sm font-black text-red-600 dark:text-red-400 block">{summary.critical}</span>
                  <span className="text-[9.5px] text-red-600 dark:text-red-400 font-extrabold uppercase mt-0.5 block">Critical</span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">{summary.high}</span>
                  <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-extrabold uppercase mt-0.5 block">High</span>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">{summary.medium}</span>
                  <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-extrabold uppercase mt-0.5 block">Medium</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-black text-slate-800 dark:text-gray-200 block">{summary.low}</span>
                  <span className="text-[9.5px] text-gray-500 font-bold uppercase mt-0.5 block">Low Routine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 6: Interactive Officer Work Queue Workstation */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <SectionTitle title="Officer Work Queue & Field Command Roster" subtitle="Click any officer card below to instantly filter the department issue queue to their active workload" />
              {selectedOfficer !== "ALL" && (
                <button
                  onClick={() => setSelectedOfficer("ALL")}
                  className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition"
                >
                  ✕ Clear Officer Filter ({selectedOfficer})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {assignedOfficers.map((officer, idx) => {
                const isSelected = selectedOfficer === officer.name;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedOfficer(isSelected ? "ALL" : officer.name);
                      setCurrentPage(1);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-slate-50/80 dark:bg-gray-950/70 border-gray-200 dark:border-gray-800/80 hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected ? "bg-emerald-500 text-gray-950" : "bg-slate-900 dark:bg-gray-800 text-white"
                      }`}>
                        {officer.name ? officer.name.slice(0, 2).toUpperCase() : "FO"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{officer.name}</h4>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          officer.inProgressCount > 0
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {officer.status || "Active Field Duty"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-center text-[10px]">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Assigned</span>
                        <strong className="text-slate-800 dark:text-white font-extrabold">{officer.totalAssigned}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Resolved</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{officer.resolvedToday || 0}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">Critical</span>
                        <strong className="text-red-600 dark:text-red-400 font-extrabold">{officer.criticalCases || 0}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Phase 7 Department Activity Feed & Audit Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <SectionTitle title="Department Activity Feed" subtitle="Real-time operational audit timeline" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 pl-7 pt-1 max-h-[580px] overflow-y-auto pr-1">
              {recentActivity.length === 0 ? (
                <div className="p-6 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500 font-light">
                  No recent operational activity recorded for this division yet.
                </div>
              ) : (
                recentActivity.map((activity, idx) => {
                  const badge = getActivityBadge(activity.action);
                  return (
                    <div key={activity._id || idx} className="relative group space-y-1">
                      <span className={`absolute -left-7 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-emerald-500/10 ${
                        idx === 0 ? "bg-emerald-500 ring-emerald-500/30" : "bg-slate-400 dark:bg-gray-600"
                      }`}></span>

                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md ${badge.color}`}>
                          {badge.text}
                        </span>
                        <span className="text-[9.5px] text-gray-400 font-mono">
                          {formatDateShort(activity.createdAt)}
                        </span>
                      </div>

                      <div className="font-extrabold text-slate-800 dark:text-gray-150 text-xs leading-tight">
                        {activity.action === "VERIFY_ISSUE" && "Ticket verified & triaged"}
                        {activity.action === "ASSIGN_DEPARTMENT" && "Department & officer allocated"}
                        {activity.action === "CHANGE_PRIORITY" && `Priority elevated to ${activity.newValue}`}
                        {activity.action === "CHANGE_STATUS" && `Status transitioned to ${activity.newValue?.status || activity.newValue}`}
                        {activity.action === "ADD_NOTE" && "Internal command note added"}
                        {activity.action === "REJECT_ISSUE" && "Report rejected by triage"}
                      </div>

                      {activity.issue && (
                        <p className="text-[10px] text-gray-500 truncate font-light">
                          <strong className="text-slate-700 dark:text-gray-300">#{activity.issue._id?.slice(-6).toUpperCase()}:</strong> {activity.issue.title}
                        </p>
                      )}

                      <div className="text-[9.5px] text-gray-400 font-sans">
                        Operator: <span className="font-semibold text-slate-700 dark:text-gray-300">{activity.admin?.name || "Command Staff"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Phase 4 & Phase 5: Department Issue Queue with Search & Advanced Filters */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-800/80 pb-5">
          <div>
            <SectionTitle title="Department Issue Queue" subtitle="Complete chronological list of municipal complaints assigned to this division" />
            <span className="text-[11px] text-gray-500 font-medium">
              Showing <strong className="text-slate-800 dark:text-white">{filteredAndSortedIssues.length}</strong> matching tickets
              {selectedOfficer !== "ALL" && <span> for officer <strong className="text-emerald-600">{selectedOfficer}</strong></span>}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by ID, title, citizen or ward..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400 shadow-inner"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 absolute left-3 top-2.5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>

        {/* Phase 5 Filters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-gray-950/60 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 text-xs">
          <div>
            <label className="block text-[9.5px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1">
              Officer Filter
            </label>
            <select
              value={selectedOfficer}
              onChange={(e) => { setSelectedOfficer(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Officers</option>
              <option value="UNASSIGNED">Unassigned Officer</option>
              {uniqueOfficers.map((off, idx) => (
                <option key={idx} value={off}>{off}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9.5px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1">
              Priority Filter
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[9.5px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[9.5px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1">
              Sorting Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority First</option>
            </select>
          </div>
        </div>

        {/* Table of Issues */}
        {paginatedIssues.length === 0 ? (
          <EmptyState
            title="No Matching Issues Found"
            description="There are no municipal tickets in this division matching your current search or filter criteria."
            action={
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedOfficer("ALL");
                  setSelectedPriority("ALL");
                  setSelectedStatus("ALL");
                }}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            <Table
              headers={[
                "Issue ID",
                "Citizen",
                "Issue Title",
                "Ward / Location",
                "Priority",
                "Status",
                "Assigned Officer",
                "Created Date",
                "Actions"
              ]}
              data={paginatedIssues}
              renderRow={(item) => (
                <tr
                  key={item._id}
                  onClick={() => navigate(`/admin/issues/${item._id}`)}
                  className="hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white font-mono">
                    #FMW-{item._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-gray-200">
                    {item.reportedBy?.name || "Resident"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate max-w-xs mt-0.5">
                      {item.category}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-650 dark:text-gray-300 font-normal">
                    {item.locationText || "Coimbatore Ward"}
                  </td>
                  <td className="px-5 py-4">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-gray-200">
                    {item.assignedOfficer ? (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded-lg text-[11px]">
                        👷 {item.assignedOfficer}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[11px] text-gray-500 font-mono">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-xs font-black text-emerald-600 hover:underline">
                    Inspect &rarr;
                  </td>
                </tr>
              )}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-150 dark:border-gray-800/80 text-xs">
                <span className="text-gray-500">
                  Page <strong className="text-slate-800 dark:text-white">{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-slate-700 dark:text-gray-300 transition"
                  >
                    &larr; Previous
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-slate-700 dark:text-gray-300 transition"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
