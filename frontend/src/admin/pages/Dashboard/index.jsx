import React, { useState } from "react";
import { Link } from "react-router-dom";
import { dashboardStats } from "../../data/dashboard";
import { dummyIssues } from "../../data/issues";
import { dummyDepartments } from "../../data/departments";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";

export default function Dashboard() {
  const [issuesData] = useState(dummyIssues.slice(0, 4));

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <PageHeader 
        title="Command Operations" 
        subtitle="Real-time municipal complaints monitoring and dispatch control (Version 1)"
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
            System Online - V1 Foundation
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
            <span className="text-lg font-black text-emerald-650 dark:text-emerald-450">{dashboardStats.averageResolutionTime}</span>
            <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">Resolution SLA</p>
          </div>
        </div>
      </div>

      {/* 3. Statistics Grid (4 KPI Cards) */}
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
        
        {/* Left Column: Recent Reports Table & Department Oversight */}
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
              renderRow={(row) => (
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
                  className="p-5 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-2xl shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-gray-700 transition"
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

        {/* Right Column: Chart Placeholder & Map Placeholder */}
        <div className="space-y-6">
          
          {/* Chart Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm dark:shadow-md min-h-[220px] flex flex-col justify-between">
            <SectionTitle title="Weekly Trends" subtitle="Daily Reported vs. Resolved complaints" />
            
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl p-6 my-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5M21 19.5H3.75M6.75 15h2.25V6.75H6.75V15zm4 0h2.25V10.5h-2.25v4.5zm4 0h2.25V8.25h-2.25v6.75zm4 0H21V12h-2.25v3z" />
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-gray-350">[ Chart Placeholder ]</span>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1 leading-normal">
                Chart integration will be implemented in Version 2.
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm dark:shadow-md min-h-[220px] flex flex-col justify-between">
            <SectionTitle title="Command Dispatch Grid" subtitle="Tactical mapping overlay of complaints" />
            
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl p-6 my-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.684A1.125 1.125 0 003 6.69v11.22c0 .425.24.815.622 1.006l4.875 2.437a1.125 1.125 0 001.006 0l5.375-2.688a1.125 1.125 0 011.006 0z" />
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-gray-350">[ Map Placeholder ]</span>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1 leading-normal">
                Real-time GIS mapping will be implemented in a future version.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
