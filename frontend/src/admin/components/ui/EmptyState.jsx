import React from "react";

export const EmptyState = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-sm dark:shadow-md py-14">
      {icon ? (
        <div className="mb-4 text-slate-400 dark:text-gray-600">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800/50 flex items-center justify-center text-slate-400 dark:text-gray-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v4.5A2.25 2.25 0 002.25 13.5zm0 0l6-6M18 13.5l-6-6" />
          </svg>
        </div>
      )}
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-450 mt-1 max-w-sm font-light leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};
