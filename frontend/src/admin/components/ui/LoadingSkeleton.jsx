import React from "react";

export const SkeletonLine = ({ className = "h-4 w-full" }) => (
  <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/85 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-3 w-1/3" />
      <SkeletonLine className="h-8 w-8 rounded-xl" />
    </div>
    <div className="space-y-2">
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonLine className="h-3.5 w-3/4" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 4, cols = 5 }) => (
  <div className="w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="px-6 py-4 border-b border-gray-250 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/20 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonLine key={i} className="h-3 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-800/60 p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse">
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-3.5 w-1/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
        <SkeletonLine className="h-6 w-14 rounded-full" />
      </div>
    ))}
  </div>
);
