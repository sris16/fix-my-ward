import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { EmptyState } from "../../components/ui/EmptyState";

const API_DEPARTMENTS_URL = "http://localhost:5000/api/admin/departments";

export default function Departments() {
  const { token, admin } = useAdminAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDepartments = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(API_DEPARTMENTS_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  // Filter departments by search term
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute aggregate totals across all departments
  const totalAssignedAll = departments.reduce((acc, curr) => acc + curr.totalAssigned, 0);
  const totalResolvedAll = departments.reduce((acc, curr) => acc + curr.resolved, 0);
  const totalCriticalAll = departments.reduce((acc, curr) => acc + curr.critical, 0);
  const totalOfficersAll = departments.reduce((acc, curr) => acc + curr.activeOfficers, 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Department Operations"
        description="Unable to connect to municipal department telemetry services. Please verify your connection or retry."
        action={
          <button
            onClick={fetchDepartments}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
          >
            Retry Request
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Page Header */}
      <PageHeader 
        title="Department Operations Center" 
        subtitle="Monitor municipal division workloads, SLA efficiency indices, active field officers, and issue queues across Coimbatore"
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm w-60"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 absolute left-3 top-2.5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <button
              onClick={fetchDepartments}
              className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-500 transition shadow-sm flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh Data
            </button>
          </div>
        }
      />

      {/* 2. Citywide Department Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              OPERATIONAL COMMAND &middot; ALL DIVISIONS
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight pt-1">
            Municipal Workload Summary across {departments.length} Active Divisions
          </h2>
          <p className="text-xs text-gray-400 font-light max-w-xl leading-relaxed">
            Real-time monitoring of department issue queues, field worker allocations, and resolution SLAs. Click any department card below to enter its specialized operational dashboard and officer work queue.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 relative z-10 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-base font-black text-white">{totalAssignedAll}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Total Assigned</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-base font-black text-emerald-400">{totalResolvedAll}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Resolved</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-base font-black text-red-400">{totalCriticalAll}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Critical Cases</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-base font-black text-blue-400">{totalOfficersAll}</span>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-0.5">Active Officers</p>
          </div>
        </div>
      </div>

      {/* 3. Department Cards Grid (Clickable) */}
      <div className="space-y-4">
        <SectionTitle title="Municipal Divisions" subtitle="Click any division to open its operational workspace and work queue" />

        {filteredDepartments.length === 0 ? (
          <div className="p-12 bg-white dark:bg-gray-900/60 border border-gray-250 dark:border-gray-800 rounded-3xl text-center text-xs text-gray-500">
            No departments match your search criteria "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept, index) => (
              <div
                key={index}
                onClick={() => navigate(`/admin/departments/${encodeURIComponent(dept.name)}`)}
                className="group bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/60 dark:hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent Top Border based on efficiency / workload */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
                  dept.critical > 0 
                    ? "bg-red-500" 
                    : dept.efficiency >= 50 
                    ? "bg-emerald-500" 
                    : "bg-amber-500"
                }`}></div>

                <div>
                  {/* Card Header: Dept Name & SLA Efficiency Badge */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div className="min-w-0 pr-1">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                        {dept.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        Municipal Operations Division
                      </p>
                    </div>

                    <span className={`shrink-0 text-[11px] font-black px-2.5 py-1 rounded-xl border ${
                      dept.efficiency >= 60
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : dept.efficiency >= 30
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    }`}>
                      {dept.efficiency}% SLA
                    </span>
                  </div>

                  {/* 4-Column Mini Workload Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-gray-950/70 rounded-2xl border border-gray-150 dark:border-gray-800/80 mb-4 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Assigned</span>
                      <span className="font-black text-slate-800 dark:text-white text-sm">{dept.totalAssigned}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Pending / Vrf.</span>
                      <span className="font-black text-amber-500 text-sm">{dept.pending}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">In Progress</span>
                      <span className="font-black text-blue-500 text-sm">{dept.inProgress}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/60">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Resolved</span>
                      <span className="font-black text-emerald-500 text-sm">{dept.resolved}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Metrics & Action Trigger */}
                <div className="pt-3 border-t border-gray-150 dark:border-gray-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase font-black block">Avg. Resolution</span>
                      <span className="font-extrabold text-slate-700 dark:text-gray-300 text-[11px] font-mono">
                        ⏱️ {dept.averageResolutionTime}
                      </span>
                    </div>
                    <div className="border-l border-gray-200 dark:border-gray-800 pl-3">
                      <span className="text-[9px] text-gray-400 uppercase font-black block">Active Officers</span>
                      <span className="font-extrabold text-slate-700 dark:text-gray-300 text-[11px]">
                        👷 {dept.activeOfficers}
                      </span>
                    </div>
                  </div>

                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 group-hover:bg-emerald-500 group-hover:text-gray-950 flex items-center justify-center transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
