import React from "react";

/**
 * Phase 7: Ward & Administrative Zone Monitoring Panel
 * Displays caseload distribution and completion index by ward zone across Coimbatore.
 * Selecting any ward zooms the GIS map directly to its geographic cluster.
 */
export function WardMonitoringPanel({ wards = [], onSelectWard, selectedWardId }) {
  if (!wards || wards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm text-center py-12 text-xs text-gray-400">
        No ward zone telemetry available.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Ward & Zone Operational Telemetry
          </h3>
          <p className="text-xs text-gray-500">
            Select any zone to zoom the GIS map directly to that sector's complaint coordinates
          </p>
        </div>
        <span className="text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl border border-blue-500/20">
          5 Administrative Zones
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {wards.map((ward) => {
          const isSelected = selectedWardId === ward.id;
          const totalIssues = (ward.openIssues || 0) + (ward.resolvedIssues || 0);

          return (
            <div
              key={ward.id}
              onClick={() => onSelectWard && onSelectWard(ward)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-slate-50/80 dark:bg-gray-950/60 border-gray-200/80 dark:border-gray-800 hover:border-blue-400/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                    {ward.name}
                  </h4>
                  {ward.criticalIssues > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[9px] font-black shrink-0 animate-pulse">
                      {ward.criticalIssues} CRIT
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                  {totalIssues} Total Registered Cases
                </span>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800/80">
                  <span className="text-sm font-black text-amber-600 block">{ward.openIssues || 0}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Open</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800/80">
                  <span className="text-sm font-black text-emerald-600 block">{ward.resolvedIssues || 0}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Resolved</span>
                </div>
              </div>

              {/* Top Categories */}
              {ward.topCategories && ward.topCategories.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-gray-150/60 dark:border-gray-800/60 text-[10px]">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Top Problem Issues:</span>
                  <div className="flex flex-wrap gap-1">
                    {ward.topCategories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 font-bold rounded-md border border-gray-150 dark:border-gray-800 text-[9.5px]">
                        {cat.name} ({cat.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>Zone SLA Index</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{ward.completionPercentage}% Resolved</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${ward.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {isSelected && (
                <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 text-center uppercase tracking-wider pt-1 border-t border-blue-200 dark:border-blue-900">
                  📍 Active Zoomed Sector
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
