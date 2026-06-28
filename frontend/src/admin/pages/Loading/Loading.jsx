import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonLine, SkeletonCard, SkeletonTable } from "../../components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Loading Operation Console" 
        subtitle="Initializing platform services and database streams..."
      />

      <div className="space-y-2">
        <SkeletonLine className="h-6 w-1/4" />
        <SkeletonLine className="h-4.5 w-1/2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <SectionTitle title="Command Queue" subtitle="Pulsing registry overlay during initialization" />
        <div className="mt-4">
          <SkeletonTable rows={3} cols={4} />
        </div>
      </div>
    </div>
  );
}
