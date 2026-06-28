import React from "react";

export const Badge = ({ children, variant = "primary", className = "" }) => {
  const styles = {
    primary: "bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/20",
    secondary: "bg-slate-500/10 text-slate-700 dark:text-gray-300 border-slate-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    danger: "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    info: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
