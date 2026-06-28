import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

export default function Notifications() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Broadcast Notifications" 
        subtitle="Review global broadcast system notifications and critical warning dispatches"
      />
      
      <div className="mt-4">
        <EmptyState 
          title="No notifications available" 
          description="Notification broadcast and template management will be added in Version 3."
          icon={
            <div className="p-4 bg-slate-100 dark:bg-gray-800 rounded-full text-slate-400 dark:text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
          }
        />
      </div>
    </div>
  );
}
