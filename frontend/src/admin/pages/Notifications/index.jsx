import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonList } from "../../components/ui/LoadingSkeleton";

export default function Notifications() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notifications" 
        subtitle="Review global broadcast system notifications and critical warning dispatches"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Broadcast & Event Logs" subtitle="UI skeleton awaiting notification hub connection" />
        <div className="mt-6">
          <SkeletonList items={4} />
        </div>
      </div>
    </div>
  );
}
