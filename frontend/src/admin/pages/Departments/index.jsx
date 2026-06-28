import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonList } from "../../components/ui/LoadingSkeleton";

export default function Departments() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Departments" 
        subtitle="Manage municipal divisions, staff rosters, and resolving assignments"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Corporate Department Rosters" subtitle="UI skeleton awaiting configuration" />
        <div className="mt-6">
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  );
}
