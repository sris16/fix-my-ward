import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SkeletonLine } from "../../components/ui/LoadingSkeleton";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage command permissions, API tokens, and municipality parameters"
      />
      
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <SectionTitle title="General System Configurations" subtitle="Core municipality timing parameters" />
          <div className="mt-4 space-y-3">
            <SkeletonLine className="h-8 w-full" />
            <SkeletonLine className="h-8 w-2/3" />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800/60">
          <SectionTitle title="GIS Map Overlays" subtitle="Map layers and leaflet basemap provider configurations" />
          <div className="mt-4 space-y-3">
            <SkeletonLine className="h-8 w-3/4" />
            <SkeletonLine className="h-8 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
