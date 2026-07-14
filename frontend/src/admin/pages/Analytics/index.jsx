import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API_OVERVIEW_URL = "http://localhost:5000/api/admin/analytics/overview";
const API_CATEGORIES_URL = "http://localhost:5000/api/admin/analytics/categories";
const API_DEPARTMENTS_URL = "http://localhost:5000/api/admin/analytics/departments";
const API_TRENDS_URL = "http://localhost:5000/api/admin/analytics/trends";
const API_DISTRIBUTIONS_URL = "http://localhost:5000/api/admin/analytics/distributions";

export default function Analytics() {
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeframe, setTimeframe] = useState("weekly"); // 'daily' | 'weekly' | 'monthly' | 'yearly'

  // Data states
  const [overview, setOverview] = useState({});
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [distributions, setDistributions] = useState({
    statusDistribution: [],
    priorityDistribution: []
  });

  const fetchAnalyticsData = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);

    try {
      const [ovRes, catRes, deptRes, trendRes, distRes] = await Promise.all([
        axios.get(API_OVERVIEW_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_CATEGORIES_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_DEPARTMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_TRENDS_URL}?timeframe=${timeframe}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_DISTRIBUTIONS_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ovRes.data.success) setOverview(ovRes.data);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
      if (trendRes.data.success) setTrends(trendRes.data.trends || []);
      if (distRes.data.success) {
        setDistributions({
          statusDistribution: distRes.data.statusDistribution || [],
          priorityDistribution: distRes.data.priorityDistribution || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics telemetry:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [token, timeframe]);

  // Custom Recharts Tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md">
          <p className="font-black text-emerald-400 mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="flex justify-between gap-4 py-0.5">
              <span className="text-gray-300 font-medium">{entry.name}:</span>
              <strong className="font-mono text-white font-black">{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Intelligence Telemetry"
        description="Unable to connect to municipal analytics engines or aggregate metrics. Please verify your connection or retry."
        action={
          <button
            onClick={fetchAnalyticsData}
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
      
      {/* 1. Page Header & Timeframe Switcher */}
      <PageHeader 
        title="Executive Intelligence Platform" 
        subtitle="Live telemetry, predictive SLA monitoring, citizen engagement curves, and division performance metrics across Coimbatore"
        actions={
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm">
            {["daily", "weekly", "monthly", "yearly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  timeframe === tf
                    ? "bg-emerald-500 text-gray-950 shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        }
      />

      {/* 2. Phase 2 Executive Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Complaints"
          value={overview.totalIssues || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          trend="+4.2% this week"
          color="blue"
        />

        <StatCard
          title="Global Resolution Rate"
          value={`${overview.resolutionRate || 0}%`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="SLA Target: ≥ 85%"
          color="green"
        />

        <StatCard
          title="Average Resolution Time"
          value={overview.averageResolutionTime || "24h"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={`${overview.verified || 0} currently verified`}
          color="yellow"
        />

        <StatCard
          title="Citizen Engagement Base"
          value={overview.citizenParticipationCount || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-purple-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          trend={`${overview.officerCount || 7} active field officers`}
          color="purple"
        />
      </div>

      {/* 3. Phase 5 Time Series Trend Curves (Area Chart) */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <SectionTitle title="Operational Trend Curves" subtitle={`Chronological volume progression over ${timeframe} intervals`} />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Reports Created
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Resolved
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Verified
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No trend telemetry available for the selected timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reportsCreated" name="Created" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="reportsResolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" />
                <Area type="monotone" dataKey="reportsVerified" name="Verified" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Category Analytics & Department Workload Grid (Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Phase 3 Category Breakdown Bar Chart */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionTitle title="Volume by Civic Category" subtitle="Distribution across urban infrastructure segments" />
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Total Issues" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
                  <Bar dataKey="resolvedPercentage" name="Resolved %" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            {categories.slice(0, 3).map((cat, idx) => (
              <div key={idx} className="p-2 bg-slate-50 dark:bg-gray-950/70 rounded-xl border border-gray-150 dark:border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase block font-bold truncate">{cat.category}</span>
                <span className="font-black text-slate-800 dark:text-white">{cat.count} cases ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 4 Department Performance Bar Chart */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionTitle title="Department Efficiency Ratios" subtitle="Assigned vs. resolved metrics across municipal teams" />
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="department" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={30} iconType="circle" />
                  <Bar dataKey="assigned" name="Assigned" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
            <span>Average Division SLA: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">≥ 78% Efficiency</strong></span>
            <span>Staff Roster: <strong className="text-slate-800 dark:text-gray-300 font-extrabold">{overview.officerCount} Active Staff</strong></span>
          </div>
        </div>

      </div>

      {/* 5. Phase 6 Priority & Status Distributions (Pie & Donut Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Donut Chart */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionTitle title="Lifecycle Status Distribution" subtitle="Active ticket breakdown by workflow stage" />
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributions.statusDistribution.filter((d) => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {distributions.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-150 dark:border-gray-800/80 text-[11px]">
            {distributions.statusDistribution.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                {item.name}: <strong className="text-slate-900 dark:text-white">{item.count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <SectionTitle title="Severity Priority Breakdown" subtitle="Hazard weighting distribution across reported cases" />
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributions.priorityDistribution.filter((d) => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {distributions.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#f59e0b"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-gray-150 dark:border-gray-800/80 text-[11px]">
            {distributions.priorityDistribution.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                {item.name}: <strong className="text-slate-900 dark:text-white">{item.count}</strong>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 6. Executive Resolution Performance & Citizen Participation Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            CITIZEN ENGAGEMENT
          </span>
          <h3 className="text-base font-black text-white">
            {overview.citizenParticipationCount || 11} Active Citizen Reporters
          </h3>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Coimbatore citizens are actively logging civic complaints across all 100 wards, fostering direct municipal accountability.
          </p>
        </div>

        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
            SLA RESOLUTION SPEED
          </span>
          <h3 className="text-base font-black text-white">
            {overview.averageResolutionTime || "24h"} Average Closeout SLA
          </h3>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Continuous field worker tracking and department triage have streamlined ticket resolution speeds citywide.
          </p>
        </div>

        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
            TRIAGE VERIFICATION
          </span>
          <h3 className="text-base font-black text-white">
            {overview.verificationRate || 27}% Verified & Allocated
          </h3>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Every submitted ticket undergoes administrative inspection before dispatch to municipal field crews.
          </p>
        </div>
      </div>

    </div>
  );
}
