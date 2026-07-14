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

  // Phase 5: Search, Filter, and Sort States
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
    setCurrentPage(1); // Reset pagination on department change
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

  // Phase 5: Filtered and Sorted Issue Queue
  const filteredAndSortedIssues = useMemo(() => {
    const { issues } = departmentData;
    if (!issues || !Array.isArray(issues)) return [];

    return issues
      .filter((item) => {
        // Search query check
        const matchesSearch =
          !searchQuery ||
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.locationText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reportedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        // Officer check
        const matchesOfficer =
          selectedOfficer === "ALL" ||
          (selectedOfficer === "UNASSIGNED" && (!item.assignedOfficer || item.assignedOfficer === "")) ||
          item.assignedOfficer === selectedOfficer;

        // Priority check
        const matchesPriority = selectedPriority === "ALL" || item.priority === selectedPriority;

        // Status check
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
          // default newest
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [departmentData.issues, searchQuery, selectedOfficer, selectedPriority, selectedStatus, sortBy]);

  // Paginated slices
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

  const { summary, assignedOfficers } = departmentData;

  // Get unique officers across issues and officers array for filtering
  const uniqueOfficers = Array.from(
    new Set([
      ...assignedOfficers.map((o) => o.name),
      ...departmentData.issues.map((i) => i.assignedOfficer).filter(Boolean),
    ])
  );

  return (
    <div className="space-y-6 relative">
      
      {/* Back navigation and Breadcrumb */}
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
          DEPARTMENT OPERATIONS WORKSPACE
        </span>
      </div>

      {/* 1. Phase 3 Hero Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              DIVISION COMMAND CENTER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight pt-1">
            {summary.name}
          </h1>
          <p className="text-xs text-gray-400 font-light max-w-xl leading-relaxed">
            Real-time operational dashboard for {summary.name}. Monitoring active triage queues, assigned field workers, and SLA resolution performance across all wards in Coimbatore.
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

      {/* 2. Operational Metrics & Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Breakdown Card */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <SectionTitle title="Lifecycle Status Distribution" subtitle="Active ticket progression across municipal workflows" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 text-center">
              <span className="text-sm font-black text-amber-500 block">{summary.pending}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mt-1">Pending / Vrf.</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 text-center">
              <span className="text-sm font-black text-blue-500 block">{summary.inProgress}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mt-1">In Progress</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 text-center">
              <span className="text-sm font-black text-emerald-500 block">{summary.resolved}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mt-1">Resolved</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 text-center">
              <span className="text-sm font-black text-red-500 block">{summary.rejected}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mt-1">Rejected</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <SectionTitle title="Priority Triage Breakdown" subtitle="Distribution by severity and hazard weighting" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
              <span className="text-sm font-black text-red-600 dark:text-red-400 block">{summary.critical}</span>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase block mt-1">Critical</span>
            </div>
            <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
              <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">{summary.high}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase block mt-1">High</span>
            </div>
            <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">{summary.medium}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase block mt-1">Medium</span>
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-sm font-black text-slate-800 dark:text-gray-200 block">{summary.low}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase block mt-1">Low Routine</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Assigned Officers Roster Card (Phase 3 overview) */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <SectionTitle title="Assigned Field Officers" subtitle="Staff roster dispatched across municipal wards" />
          <span className="text-xs font-black px-3 py-1 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700">
            {assignedOfficers.length} Active Command Staff
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {assignedOfficers.map((officer, idx) => (
            <div key={idx} className="p-4 bg-slate-50/80 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-gray-950 font-black text-xs shrink-0">
                  {officer.name ? officer.name.slice(0, 2).toUpperCase() : "FO"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{officer.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{officer.status || "Active Duty"}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">{officer.totalAssigned} Cases</span>
                <span className="text-[9.5px] text-gray-400 block mt-0.5">{officer.resolvedToday || 0} Resolved</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Phase 4 & Phase 5: Department Issue Queue with Search & Advanced Filters */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-800/80 pb-5">
          <div>
            <SectionTitle title="Department Issue Queue" subtitle="Complete chronological list of municipal complaints assigned to this division" />
            <span className="text-[11px] text-gray-500 font-medium">
              Showing <strong className="text-slate-800 dark:text-white">{filteredAndSortedIssues.length}</strong> matching tickets
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
