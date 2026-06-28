import React from "react";

export const SectionTitle = ({ title, subtitle, iconColor = "bg-emerald-500", className = "" }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
        <span className={`w-1.5 h-3.5 ${iconColor} rounded-full inline-block`}></span>
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] text-gray-500 dark:text-gray-450 mt-1 font-light leading-relaxed pl-3.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};
