import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics" 
        subtitle="Historical reporting speeds, ward distributions, and resolution trends"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Historical Trend Analyses" subtitle="UI skeleton awaiting analytics warehouse engine" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
