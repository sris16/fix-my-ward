import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";

export default function Analytics() {
  const sections = [
    {
      title: "Reports by Category",
      description: "Breakdown of registered issues (e.g. Roads, Water, Sanitation) across Coimbatore.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      )
    },
    {
      title: "Department Performance",
      description: "Closeout ratios, worker assignments, and response times of municipal staff.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      title: "Monthly Trends",
      description: "Long-term tracking of volume variations and ticket closure speeds by month.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      )
    },
    {
      title: "Resolution Time",
      description: "Field SLA efficiency parameters and averages for active civic issues.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics" 
        subtitle="Historical reporting speeds, ward distributions, and resolution trends"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="p-2.5 bg-slate-100 dark:bg-gray-800/60 rounded-xl text-slate-500 dark:text-gray-400 border border-slate-200/50 dark:border-gray-800 shrink-0">
                  {section.icon}
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-widest">
                  {section.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-4 pl-1">
                {section.description}
              </p>
            </div>
            
            <div className="border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl p-6 text-center bg-slate-50/30 dark:bg-gray-950/10">
              <span className="text-[10px] font-bold text-slate-650 dark:text-gray-400 uppercase tracking-wider block">
                [ Chart Placeholder ]
              </span>
              <span className="text-[9.5px] text-gray-500 block mt-1 leading-normal">
                Chart integration will be implemented in Version 2.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
