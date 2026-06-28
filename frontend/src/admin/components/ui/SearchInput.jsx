import React from "react";

export const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3.5 text-slate-400 dark:text-gray-500 pointer-events-none">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="2" 
          stroke="currentColor" 
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-gray-550 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition"
      />
    </div>
  );
};
