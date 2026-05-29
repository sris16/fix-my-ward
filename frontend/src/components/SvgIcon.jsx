import React from "react";

// Reusable SVG Wrapper for base structure
const SvgWrapper = ({ children, className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block select-none pointer-events-none transition-colors ${className}`}
    {...props}
  >
    {children}
  </svg>
);

export const RoadIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 2v20" strokeDasharray="4 4" />
    <path d="M15 2v20" strokeDasharray="4 4" />
  </SvgWrapper>
);

export const WaterIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
  </SvgWrapper>
);

export const SurroundingsIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
    <path d="M19 2L11 10" />
  </SvgWrapper>
);

export const ReportsIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h6M9 8h4" />
  </SvgWrapper>
);

export const PublicIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </SvgWrapper>
);

export const HeatmapIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </SvgWrapper>
);

export const BellIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </SvgWrapper>
);

export const ProfileIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgWrapper>
);

export const LocationIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </SvgWrapper>
);

export const UpvoteIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </SvgWrapper>
);

export const ArrowLeftIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </SvgWrapper>
);

export const CloseIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgWrapper>
);

export const EyeIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </SvgWrapper>
);

export const EyeOffIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </SvgWrapper>
);

export const GpsIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
  </SvgWrapper>
);

export const LogoutIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </SvgWrapper>
);

export const TrashIcon = (props) => (
  <SvgWrapper viewBox="0 0 24 24" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </SvgWrapper>
);
