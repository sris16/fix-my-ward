import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";

export default function LiveMonitor() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Live Monitor" 
        subtitle="Real-time geographic tracking of civic complaints across wards"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-8 shadow-md">
        <SectionTitle title="Live Operations Map" subtitle="GIS coordinate tracking system overlay" />
        
        <div className="mt-6 h-[400px] border-2 border-dashed border-gray-250 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-gray-950/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4 animate-pulse">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.684A1.125 1.125 0 003 6.69v11.22c0 .425.24.815.622 1.006l4.875 2.437a1.125 1.125 0 001.006 0l5.375-2.688a1.125 1.125 0 011.006 0z" />
          </svg>
          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">[ Map Placeholder ]</span>
          <p className="text-xs text-gray-500 max-w-sm mt-2 leading-relaxed">
            Real-time issue monitoring will be implemented in a future version.
          </p>
        </div>
      </div>
    </div>
  );
}
