import React from "react";

export const Table = ({ headers, data = [], renderRow, loading = false, className = "" }) => {
  return (
    <div className={`w-full overflow-x-auto bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-sm dark:shadow-md ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/20">
            {headers.map((header, idx) => {
              const label = typeof header === "string" ? header : header.label;
              const colClassName = typeof header === "object" ? header.className : "";
              return (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider ${colClassName}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider animate-pulse">Loading Records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-xs text-gray-500 italic">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
};
