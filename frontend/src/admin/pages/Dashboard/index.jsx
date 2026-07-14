import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";

const API_DASHBOARD_URL = "http://localhost:5000/api/admin/dashboard/kpis";

export default function Dashboard() {
  const { admin, token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalIssues: 0,
      pending: 0,
      verified: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    departmentCounts: [],
    recentReports: [],
    recentActivity: [],
  });

  const fetchDashboardKPIs = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(API_DASHBOARD_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setDashboardData({
          kpis: response.data.kpis || dashboardData.kpis,
          departmentCounts: response.data.departmentCounts || [],
          recentReports: response.data.recentReports || [],
          recentActivity: response.data.recentActivity || [],
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard telemetry:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardKPIs();
  }, [token]);

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "First Session";
    try {
      const date = new Date(lastLogin);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (" + date.toLocaleDateString() + ")";
    } catch (e) {
      return "Active Now";
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, departmentCounts, recentReports, recentActivity } = dashboardData;

  // Calculate resolution SLA / rate
  const resolutionRate = kpis.totalIssues > 0 ? Math.round((kpis.resolved / kpis.totalIssues) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <PageHeader 
        title={`Welcome, ${admin?.name || "Admin Commander"}`} 
        subtitle={`${admin?.department || "Municipal Operations"} • Role: ${(admin?.role || "Admin").toUpperCase()} • Last Active: ${formatLastLogin(admin?.lastLogin)}`}
        actions={
          <div className="flex gap-2.5">
            <Link 
              to="/admin/live-monitor" 
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition flex items-center gap-1.5"
            >
              <span>Launch Live Monitor</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </Link>
            <Link 
              to="/admin/issues" 
              className="px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-800 dark:text-white border border-gray-250 dark:border-gray-800/80 font-bold text-xs rounded-xl transition"
            >
              Manage Issues
            </Link>
          </div>
        }
      />

      {/* 2. Hero Operational Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900/40 border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl p-6 shadow-sm dark:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02] rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">
            Authenticated Session &middot; Live API Synchronized
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight pt-1">
            Ward Dispatch Status: Optimal &middot; {kpis.totalIssues} Active Database Tickets
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-xl">
            Currently tracking civic reports across Coimbatore. Authenticated as <span className="font-semibold text-slate-800 dark:text-gray-200">{admin?.email}</span> under <span className="font-semibold text-slate-800 dark:text-gray-200">{admin?.department || "Operations Command"}</span>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 relative z-10">
          <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-lg font-black text-red-550 dark:text-red-400">{kpis.critical}</span>
            <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Critical Cases</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-lg font-black text-emerald-650 dark:text-emerald-455">{resolutionRate}%</span>
            <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Resolution Rate</p>
          </div>
        </div>
      </div>

      {/* 3. Statistics Grid (4 KPI Cards connected to Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Complaints"
          value={kpis.totalIssues}
          trend={`${kpis.verified} Verified`}
          trendType="up"
          description="Total municipal database entries"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
        <StatCard
          title="Resolved Cases"
          value={kpis.resolved}
          trend={`${resolutionRate}% SLA`}
          trendType="up"
          description="Successfully completed civic tickets"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          }
        />
        <StatCard
          title="In Progress Operations"
          value={kpis.inProgress + kpis.assigned}
          trend={`${kpis.assigned} Dispatched`}
          trendType="up"
          description="Currently active with field teams"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          }
        />
        <StatCard
          title="Pending Verification"
          value={kpis.pending}
          trend="Triage Needed"
          trendType={kpis.pending > 5 ? "down" : "up"}
          description="Unverified incoming reports"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* 4. Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Recent Reports Table & Department Oversight */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Reports */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <SectionTitle title="Recent Citizen Submissions" subtitle="Live incoming complaint tickets requiring triage" />
              <Link 
                to="/admin/issues" 
                className="text-[11px] text-emerald-600 dark:text-emerald-450 hover:underline font-black uppercase tracking-wider"
              >
                View All Submissions
              </Link>
            </div>
            
            {recentReports.length === 0 ? (
              <div className="p-8 bg-white dark:bg-gray-900/60 border border-gray-250 dark:border-gray-800 rounded-3xl text-center text-xs text-gray-500">
                No civic complaints currently logged in the municipal database.
              </div>
            ) : (
              <Table
                headers={[
                  "ID",
                  "Issue Title",
                  "Category",
                  "Priority",
                  "Status",
                  "Ward / Location"
                ]}
                data={recentReports}
                renderRow={(row) => (
                  <tr 
                    key={row._id} 
                    onClick={() => window.location.href = `/admin/issues/${row._id}`}
                    className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white font-mono">
                      #FMW-{row._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-800 dark:text-gray-150 leading-tight">
                        {row.title}
                      </div>
                      <div className="text-[10px] text-gray-500 font-light truncate max-w-xs mt-0.5">
                        {row.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-650 dark:text-gray-300 font-medium">
                      {row.category}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4 text-[10.5px] text-gray-500 dark:text-gray-400 font-light">
                      {row.locationText || "Coimbatore Zone"}
                    </td>
                  </tr>
                )}
              />
            )}
          </div>

          {/* Department Overview (Live Data) */}
          <div className="space-y-4">
            <SectionTitle title="Department Oversight" subtitle="Operational allocation and resolution efficiency indices" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departmentCounts.length === 0 ? (
                <div className="col-span-2 p-6 bg-white dark:bg-gray-900/60 border border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500">
                  No department breakdown available yet.
                </div>
              ) : (
                departmentCounts.map((dept, index) => (
                  <div 
                    key={index} 
                    className="p-5 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-2xl shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-gray-700 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{dept.name}</h4>
                        <p className="text-[10px] text-gray-500 font-light mt-0.5">Municipal Allocation</p>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        dept.efficiency >= 50 
                          ? "text-emerald-600 dark:text-emerald-450 bg-emerald-500/10" 
                          : "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      }`}>
                        {dept.efficiency}% SLA
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/60 grid grid-cols-2 gap-2 text-[10.5px] text-gray-500">
                      <div>
                        <span>Assigned Cases: </span>
                        <strong className="text-slate-800 dark:text-gray-300 font-extrabold">{dept.totalIssues}</strong>
                      </div>
                      <div className="text-right">
                        <span>Resolved: </span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{dept.resolvedIssues}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Activity Stream & Operational Triage Breakdown */}
        <div className="space-y-6">
          
          {/* Live Activity Stream (Consuming IssueHistory) */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <SectionTitle title="Live Audit Stream" subtitle="Recent administrative actions across Coimbatore" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {recentActivity.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-[11px] text-gray-500">
                  No recent administrative operations recorded in the audit trail.
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity._id}
                    onClick={() => activity.issue && (window.location.href = `/admin/issues/${activity.issue._id || activity.issue}`)}
                    className="p-3 bg-slate-50 dark:bg-gray-950/80 border border-gray-150 dark:border-gray-800 rounded-xl hover:border-emerald-500/50 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-slate-800 dark:text-gray-200 truncate">
                        {activity.admin?.name || "System Admin"}
                      </span>
                      <span className="text-gray-400 font-mono text-[9px]">
                        {formatDateShort(activity.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      {activity.action === "VERIFY_ISSUE" && "Verified ticket #FMW-" + (activity.issue?._id || "").slice(-6).toUpperCase()}
                      {activity.action === "ASSIGN_DEPARTMENT" && "Dispatched department assignment"}
                      {activity.action === "CHANGE_PRIORITY" && `Set priority to ${activity.newValue}`}
                      {activity.action === "CHANGE_STATUS" && `Transitioned status to ${activity.newValue?.status || activity.newValue}`}
                      {activity.action === "ADD_NOTE" && "Added internal triage observation"}
                      {activity.action === "REJECT_ISSUE" && "Rejected civic report"}
                    </div>

                    {activity.issue && (
                      <div className="text-[10px] text-gray-500 truncate font-light">
                        {activity.issue.title} &middot; <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activity.issue.status}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ward Operational Breakdown Card (Clean Version 4 Telemetry) */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-4">
            <SectionTitle title="Triage Priority Matrix" subtitle="Live complaint distribution by priority weighting" />
            
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Critical Level Priority
                </span>
                <span className="font-black text-red-600 dark:text-red-400 text-sm">{kpis.critical}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  High Priority Triage
                </span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{kpis.high}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Medium Priority Normal
                </span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{kpis.medium}</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="font-extrabold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Low Priority Routine
                </span>
                <span className="font-black text-slate-800 dark:text-gray-200 text-sm">{kpis.low}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-gray-500">
                All triage matrix telemetry dynamically synchronized from MongoDB.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
