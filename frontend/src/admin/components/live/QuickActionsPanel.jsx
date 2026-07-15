import React from "react";
import { Link } from "react-router-dom";

/**
 * Phase 8: Quick Actions Panel
 * Provides immediate operational shortcuts and map filter triggers from the command center.
 */
export function QuickActionsPanel({
  onFilterCritical,
  onFilterPending,
  onResetFilters,
  activeFilterCount = 0
}) {
  return (
    <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Operational Quick Actions
            </h3>
            <p className="text-[10px] text-gray-500">Instant triage filters & municipal navigation shortcuts</p>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800/60"
          >
            <span>Clear Filters ({activeFilterCount}) &times;</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Shortcut 1: Isolate Critical Issues */}
        <button
          onClick={onFilterCritical}
          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 font-black text-xs rounded-2xl border border-red-500/20 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-red-600 dark:text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </span>
          <span>Critical Issues</span>
        </button>

        {/* Shortcut 2: Pending Verification */}
        <button
          onClick={onFilterPending}
          className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs rounded-2xl border border-amber-500/20 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-amber-600 dark:text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span>Pending Verify</span>
        </button>

        {/* Shortcut 3: Reset Map & View All */}
        <button
          onClick={onResetFilters}
          className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-black text-xs rounded-2xl border border-blue-500/20 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.684A1.125 1.125 0 003 6.69v11.22c0 .425.24.815.622 1.006l4.875 2.437a1.125 1.125 0 001.006 0l5.375-2.688a1.125 1.125 0 011.006 0z" />
            </svg>
          </span>
          <span>View All Map</span>
        </button>

        {/* Shortcut 4: Open Issue Queue */}
        <Link
          to="/admin/issues"
          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-slate-800 dark:text-gray-200 font-black text-xs rounded-2xl border border-gray-200 dark:border-gray-700 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-slate-200 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </span>
          <span>Issue Operations</span>
        </Link>

        {/* Shortcut 5: Department Work Queue */}
        <Link
          to="/admin/departments"
          className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-black text-xs rounded-2xl border border-purple-500/20 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-purple-600 dark:text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </span>
          <span>Departments</span>
        </Link>

        {/* Shortcut 6: Analytics Platform */}
        <Link
          to="/admin/analytics"
          className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-xs rounded-2xl border border-emerald-500/20 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-emerald-600 dark:text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C19.496 3 20 3.504 20 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </span>
          <span>Analytics & Reports</span>
        </Link>

        {/* Shortcut 7: Admin Dashboard */}
        <Link
          to="/admin/dashboard"
          className="p-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl border border-slate-700 transition flex flex-col items-center justify-center gap-1.5 text-center group"
        >
          <span className="p-1.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </span>
          <span>Executive KPIs</span>
        </Link>
      </div>
    </div>
  );
}
