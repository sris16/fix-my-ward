import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonTable } from "../../components/ui/LoadingSkeleton";

export default function Issues() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Issue Management" 
        subtitle="Review, categorize, prioritize, and assign incoming civic tickets"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Active Complaint Registry" subtitle="UI skeleton awaiting backend sync" />
        <div className="mt-6">
          <SkeletonTable rows={4} cols={5} />
        </div>
      </div>
    </div>
  );
}
