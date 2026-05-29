import React from "react";

// Standard Spinner component
export const Spinner = ({ className = "w-8 h-8 text-emerald-400" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Pulsing Card Skeleton placeholder for lists
export const CardSkeleton = () => (
  <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-lg animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-grow">
        <div className="h-6 bg-gray-800 rounded-md w-3/4"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-800 rounded w-16"></div>
          <div className="h-4 bg-gray-800 rounded w-24"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-800 rounded-full w-20"></div>
    </div>
    
    <div className="space-y-2 pt-2">
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
    </div>

    <div className="h-4 bg-gray-800 rounded w-1/2 pt-2"></div>

    <div className="flex justify-between items-center pt-4 border-t border-gray-800/60">
      <div className="h-5 bg-gray-800 rounded w-24"></div>
      <div className="h-8 bg-gray-800 rounded-lg w-28"></div>
    </div>
  </div>
);

// Full Page loading overlay
export const FullPageSpinner = ({ message = "Processing your request..." }) => (
  <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md z-[2000] flex flex-col items-center justify-center p-4">
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
      <Spinner className="w-12 h-12 text-emerald-400 mb-4" />
      <p className="text-white font-bold text-lg mb-1">Please Wait</p>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  </div>
);

// Small inline loader
export const LineSkeleton = ({ className = "h-4 w-full" }) => (
  <div className={`bg-gray-800 animate-pulse rounded ${className}`}></div>
);
