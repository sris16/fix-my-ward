import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardStats, weeklyTrends, departmentDistribution, recentActivities } from "../../data/dashboard";
import { dummyIssues } from "../../data/issues";
import { dummyDepartments } from "../../data/departments";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";

export default function Dashboard() {
  const navigate = useNavigate();
  const [issuesData, setIssuesData] = useState(dummyIssues.slice(0, 4));

  // Custom inline SVG Chart rendering (glowing vector line)
  const maxWeeklyValue = Math.max(...weeklyTrends.map(t => Math.max(t.reported, t.resolved)));
  const width = 500;
  const height = 150;
  const padding = 25;

  const reportedPoints = weeklyTrends.map((t, i) => {
    const x = padding + (i * (width - 2 * padding)) / (weeklyTrends.length - 1);
    const y = height - padding - (t.reported * (height - 2 * padding)) / maxWeeklyValue;
    return `${x},${y}`;
  }).join(" ");

  const resolvedPoints = weeklyTrends.map((t, i) => {
    const x = padding + (i * (width - 2 * padding)) / (weeklyTrends.length - 1);
    const y = height - padding - (t.resolved * (height - 2 * padding)) / maxWeeklyValue;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <PageHeader 
        title="Command Operations" 
        subtitle="Real-time municipal complaints monitoring and dispatch control"
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
              className="px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-800 dark:text-white border border-gray-250 dark:border-gray-800 font-bold text-xs rounded-xl transition"
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
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">
            System Online
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight pt-1">
            Ward Dispatch Status: Optimal
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-xl">
            Currently tracking 1,248 complaints across Coimbatore. Average resolution efficiency is 92.4% with 812 total resolved cases.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 relative z-10">
          <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-lg font-black text-red-550 dark:text-red-400">{dashboardStats.criticalIssues}</span>
            <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Critical Cases</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-lg font-black text-emerald-650 dark:text-emerald-400">{dashboardStats.averageResolutionTime}</span>
            <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Resolution SLA</p>
          </div>
        </div>
      </div>

      {/* 3. Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Complaints"
          value={dashboardStats.totalIssues}
          trend="+12.4%"
          trendType="up"
          description="Since starting civic cycle"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
        <StatCard
          title="Resolved Cases"
          value={dashboardStats.resolvedIssues}
          trend="+8.2%"
          trendType="up"
          description="Close out rate optimal"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          }
        />
        <StatCard
          title="In Progress Operations"
          value={dashboardStats.inProgressIssues}
          trend="-2.1%"
          trendType="down"
          description="Dispatched to field teams"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          }
        />
        <StatCard
          title="Pending Verification"
          value={dashboardStats.pendingIssues}
          trend="-15.4%"
          trendType="up"
          description="Unassigned citizen reports"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* 4. Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Reports Table */}
        <div className="lg:col-span-2 space-y-6">
          
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
            
            <Table
              headers={[
                "ID",
                "Issue Title",
                "Category",
                "Priority",
                "Status",
                "Ward / Location"
              ]}
              data={issuesData}
              renderRow={(row, idx) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                    {row.id}
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
                    {row.locationName}
                  </td>
                </tr>
              )}
            />
          </div>

          {/* Department Overview */}
          <div className="space-y-4">
            <SectionTitle title="Department Oversight" subtitle="Operational staff and efficiency indices" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dummyDepartments.slice(0, 4).map((dept) => (
                <div 
                  key={dept.id} 
                  className="p-5 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-2xl shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-gray-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{dept.name}</h4>
                      <p className="text-[10px] text-gray-500 font-light mt-0.5">Head: {dept.head}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {dept.efficiency} Eff.
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/60 grid grid-cols-2 gap-2 text-[10.5px] text-gray-500">
                    <div>
                      <span>Active Tickets: </span>
                      <strong className="text-slate-800 dark:text-gray-300 font-extrabold">{dept.activeIssuesCount}</strong>
                    </div>
                    <div className="text-right">
                      <span>Staff Count: </span>
                      <strong className="text-slate-800 dark:text-gray-300 font-extrabold">{dept.totalStaff}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Weekly Chart & Map Skeletons */}
        <div className="space-y-6">
          
          {/* Weekly Chart Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm dark:shadow-md">
            <SectionTitle title="Weekly Ticket Velocity" subtitle="Daily Reported vs. Resolved complaints" />
            
            {/* Custom glowing inline chart */}
            <div className="mt-4 bg-slate-50 dark:bg-gray-950/80 border border-gray-250 dark:border-gray-900 rounded-2xl p-4 flex flex-col justify-between">
              <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
                  {/* Grid Lines */}
                  <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" className="text-gray-200 dark:text-gray-900" strokeWidth="1" />
                  <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" className="text-gray-200 dark:text-gray-900" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-gray-200 dark:text-gray-900" strokeWidth="1" />

                  {/* Gradient Area Fill - Reported */}
                  <path
                    d={`M ${padding},${height - padding} L ${reportedPoints} L ${width - padding},${height - padding} Z`}
                    fill="url(#reportedGlow)"
                    className="opacity-20 dark:opacity-10"
                  />

                  {/* SVG Paths */}
                  <polyline points={reportedPoints} fill="none" stroke="#f97316" strokeWidth="2.5" className="drop-shadow-[0_2px_4px_rgba(249,115,22,0.3)]" />
                  <polyline points={resolvedPoints} fill="none" stroke="#10b981" strokeWidth="2.5" className="drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]" />

                  {/* SVG Definitions */}
                  <defs>
                    <linearGradient id="reportedGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Day Labels */}
              <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-wider px-2.5 mt-2">
                {weeklyTrends.map((t) => (
                  <span key={t.day}>{t.day}</span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-4 text-[9px] text-gray-550 font-bold uppercase tracking-wider justify-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block"></span>
                Reported Trend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                Resolved Trend
              </span>
            </div>
          </div>

          {/* Command Map Radar Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm dark:shadow-md">
            <SectionTitle title="Command Dispatch Grid" subtitle="Tactical mapping overlay of complaints" />
            
            {/* Visual Blueprint styled radar container */}
            <div className="mt-4 h-64 bg-slate-900 dark:bg-black border border-gray-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
              
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_0),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_0)] bg-[size:16px_16px] pointer-events-none"></div>
              
              {/* Radar Sweep Animation (pure CSS) */}
              <div 
                className="absolute w-full h-full border-r border-emerald-500/20 origin-center animate-spin-slow pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(45deg, rgba(16,185,129,0.15) 0%, transparent 50%)"
                }}
              ></div>

              {/* Glowing Concentric Circles */}
              <div className="absolute w-44 h-44 rounded-full border border-emerald-500/10"></div>
              <div className="absolute w-28 h-28 rounded-full border border-emerald-500/15"></div>
              <div className="absolute w-12 h-12 rounded-full border border-emerald-500/25"></div>

              {/* Radar Targets (Pins) */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-red-500 rounded-full border border-white/20"></div>

              <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 bg-orange-500 rounded-full animate-ping"></div>
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-orange-500 rounded-full border border-white/20"></div>

              <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white/20"></div>

              <div className="absolute bottom-12 left-1/4 w-2 h-2 bg-blue-500 rounded-full border border-white/20"></div>

              {/* Center Coordinate Text */}
              <div className="absolute bottom-3 left-3 bg-gray-900/90 border border-gray-800 rounded px-2 py-0.5 text-[8px] font-mono text-emerald-450 tracking-wider">
                COIMBATORE: 11.0168° N, 76.9558° E
              </div>

              {/* Offline Warning Banner */}
              <div className="absolute bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2 text-center backdrop-blur-md max-w-[200px] shadow-xl">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block mb-1">
                  Tactical Grid
                </span>
                <p className="text-[9px] text-gray-400 font-light leading-normal">
                  Dynamic GIS integration ready. Live Leaflet monitors configured in route controls.
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                to="/admin/live-monitor" 
                className="text-[10px] text-emerald-600 dark:text-emerald-450 hover:underline font-bold uppercase tracking-wider"
              >
                Open Fullscreen GIS Tracker
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
