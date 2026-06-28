import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonTable } from "../../components/ui/LoadingSkeleton";

export default function Citizens() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Citizens" 
        subtitle="Manage registered citizen profiles, verify trust metrics, and monitor logs"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Citizen Register" subtitle="UI skeleton awaiting directory services integration" />
        <div className="mt-6">
          <SkeletonTable rows={3} cols={4} />
        </div>
      </div>
    </div>
  );
}
