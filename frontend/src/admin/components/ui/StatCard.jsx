import React from "react";

export const StatCard = ({ title, value, icon, trend, trendType = "up", description, className = "" }) => {
  const trendColor = 
    trendType === "up" 
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" 
      : trendType === "down" 
      ? "text-red-650 dark:text-red-400 bg-red-500/10" 
      : "text-slate-500 dark:text-gray-400 bg-slate-500/10";

  return (
    <div className={`bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm dark:shadow-md hover:border-gray-300 dark:hover:border-gray-700/80 transition duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="p-2 bg-slate-100 dark:bg-gray-800/60 rounded-xl text-slate-700 dark:text-gray-350 border border-slate-200/50 dark:border-gray-800">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[10.5px] text-gray-500 dark:text-gray-550 mt-1 font-light leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
