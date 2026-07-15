import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useLiveTelemetryRefresh } from "../../hooks/useLiveTelemetryRefresh";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { QuickActionsPanel } from "../../components/live/QuickActionsPanel";
import { WardMonitoringPanel } from "../../components/live/WardMonitoringPanel";

const API_OVERVIEW_URL = "http://localhost:5000/api/admin/live/overview";
const API_ACTIVITY_URL = "http://localhost:5000/api/admin/live/activity";
const API_ISSUES_URL = "http://localhost:5000/api/admin/live/issues";
const API_DEPARTMENTS_URL = "http://localhost:5000/api/admin/departments";
const API_WARDS_URL = "http://localhost:5000/api/admin/live/wards";

// Coimbatore Center coordinates for default GIS map view
const COIMBATORE_CENTER = [11.0168, 76.9558];

/**
 * Helper to generate custom colored glowing Leaflet divIcon for pins
 */
const createCustomPin = (status, priority) => {
  let color = "#3b82f6"; // default Blue
  if (priority === "Critical") {
    color = "#ef4444"; // Red
  } else if (status === "Pending") {
    color = "#f59e0b"; // Yellow
  } else if (status === "Verified") {
    color = "#3b82f6"; // Blue
  } else if (status === "Assigned") {
    color = "#6366f1"; // Purple
  } else if (status === "In Progress") {
    color = "#f97316"; // Orange
  } else if (status === "Resolved") {
    color = "#10b981"; // Green
  }

  const isCritical = priority === "Critical";
  const pulseRing = isCritical
    ? `<div style="position: absolute; top: -6px; left: -6px; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
    : "";

  return L.divIcon({
    className: "custom-leaflet-marker",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
    html: `
      <div style="position: relative; width: 26px; height: 26px;">
        ${pulseRing}
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
        </div>
      </div>
    `
  });
};

/**
 * Helper component to programmatically pan/zoom map when a marker or ward is clicked
 */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0])) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LiveMonitor() {
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Phase 1-7: Data states
  const [overview, setOverview] = useState({});
  const [issues, setIssues] = useState([]);
  const [activity, setActivity] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);

  // Map and filter states
  const [mapCenter, setMapCenter] = useState(COIMBATORE_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("ALL");
  const [selectedWardId, setSelectedWardId] = useState(null);

  // Phase 1-9 Fetch function with memoized callback
  const fetchLiveTelemetry = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(false);

    try {
      const [ovRes, actRes, issRes, deptRes, wardRes] = await Promise.all([
        axios.get(API_OVERVIEW_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_ACTIVITY_URL}?limit=25`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_ISSUES_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_DEPARTMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_WARDS_URL, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ovRes.data.success) setOverview(ovRes.data);
      if (actRes.data.success) setActivity(actRes.data.activity || []);
      if (issRes.data.success) setIssues(issRes.data.issues || []);
      if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
      if (wardRes.data.success) setWards(wardRes.data.wards || []);
    } catch (err) {
      console.error("Failed to fetch live command center telemetry:", err);
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Phase 6: Real-Time Refresh Hook (with Socket.IO readiness)
  const {
    isPolling,
    intervalMs,
    lastUpdated,
    changeInterval,
    triggerImmediateRefresh
  } = useLiveTelemetryRefresh(fetchLiveTelemetry, 20000);

  useEffect(() => {
    fetchLiveTelemetry(false);
  }, [fetchLiveTelemetry]);

  // Phase 5: Filter emergencies and critical issues
  const emergencyList = useMemo(() => {
    return issues.filter((item) => {
      return (
        item.priority === "Critical" ||
        item.category === "Water Leakage & Supply" ||
        item.category === "Drainage & Stormwater" ||
        item.category === "Public Health"
      );
    });
  }, [issues]);

  // Map display filtered issues
  const filteredMapIssues = useMemo(() => {
    return issues.filter((item) => {
      const matchStatus = selectedStatusFilter === "ALL" || item.status === selectedStatusFilter;
      const matchPriority = selectedPriorityFilter === "ALL" || item.priority === selectedPriorityFilter;
      return matchStatus && matchPriority;
    });
  }, [issues, selectedStatusFilter, selectedPriorityFilter]);

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Action badge formatting helper
  const getActionBadgeColor = (action) => {
    switch (action) {
      case "VERIFY_ISSUE":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "ASSIGN_DEPARTMENT":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "CHANGE_PRIORITY":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "CHANGE_STATUS":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "REJECT_ISSUE":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  // Phase 7 Ward Click Zoom Handler
  const handleSelectWard = useCallback((ward) => {
    if (selectedWardId === ward.id) {
      // Toggle off and reset map to city center
      setSelectedWardId(null);
      setMapCenter(COIMBATORE_CENTER);
      setMapZoom(13);
    } else {
      setSelectedWardId(ward.id);
      if (ward.center && ward.center.length === 2) {
        setMapCenter(ward.center);
        setMapZoom(14);
      }
    }
  }, [selectedWardId]);

  // Phase 8 Quick Actions Reset Handlers
  const handleResetAllFilters = useCallback(() => {
    setSelectedStatusFilter("ALL");
    setSelectedPriorityFilter("ALL");
    setSelectedWardId(null);
    setMapCenter(COIMBATORE_CENTER);
    setMapZoom(13);
  }, []);

  const activeFiltersCount = (selectedStatusFilter !== "ALL" ? 1 : 0) +
                             (selectedPriorityFilter !== "ALL" ? 1 : 0) +
                             (selectedWardId ? 1 : 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
        <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Connecting to Live Command Center"
        description="Unable to retrieve real-time GIS coordinates, active department streams, or emergency telemetry."
        action={
          <button
            onClick={() => fetchLiveTelemetry(false)}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
          >
            Retry Connection
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header & Phase 6 Real-Time Pulse Status Bar */}
      <PageHeader 
        title="Municipal Live Command Center" 
        subtitle="Real-time GIS tracking, emergency triage queue, ward zone monitoring, and operational telemetry across Coimbatore"
        actions={
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 px-3.5 py-2 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPolling ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                {isPolling ? "LIVE STREAM ACTIVE" : "STREAM PAUSED"}
              </span>
            </div>

            <span className="text-gray-300 dark:text-gray-700 font-light">|</span>

            {/* Interval dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-gray-400 font-black">Refresh:</span>
              <select
                value={intervalMs}
                onChange={(e) => changeInterval(Number(e.target.value))}
                className="bg-slate-50 dark:bg-gray-950 px-2 py-1 rounded-lg border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white font-black cursor-pointer focus:outline-none"
              >
                <option value={15000}>Every 15s</option>
                <option value={20000}>Every 20s</option>
                <option value={30000}>Every 30s</option>
                <option value={60000}>Every 60s</option>
                <option value={0}>Paused (Manual)</option>
              </select>
            </div>

            <button
              onClick={() => triggerImmediateRefresh(false)}
              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
              title={`Last synced at ${lastUpdated.toLocaleTimeString()}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Sync Now</span>
            </button>
          </div>
        }
      />

      {/* 2. Phase 5 Emergency Monitoring Banner (Always Visible) */}
      {emergencyList.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white rounded-3xl p-5 shadow-xl border border-red-500/40 relative overflow-hidden animate-pulse-subtle">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7 text-white animate-bounce">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                    RED ALERT STATUS
                  </span>
                  <span className="text-xs font-bold text-red-100">
                    {emergencyList.length} Active High-Hazard / Emergency Cases Detected
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                  Immediate Dispatch & Triage Required
                </h3>
                <p className="text-xs text-red-100 font-light mt-0.5">
                  Critical hazard priorities or municipal emergency lines (`Water`, `Stormwater`, `Public Health`) requiring immediate field allocation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {emergencyList.slice(0, 3).map((em) => (
                <Link
                  key={em.id}
                  to={`/admin/issues/${em.id}`}
                  className="px-3.5 py-2 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-xl shadow transition shrink-0 flex items-center gap-1.5"
                >
                  <span>{em.ticketId}</span>
                  <span className="text-[10px] font-medium text-gray-500">({em.category})</span>
                  <span>&rarr;</span>
                </Link>
              ))}
              {emergencyList.length > 3 && (
                <span className="text-xs font-bold bg-white/20 px-3 py-2 rounded-xl shrink-0">
                  +{emergencyList.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Phase 1 Executive Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Issues in City"
          value={overview.activeIssues || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
          trend={`${overview.pendingVerification || 0} pending verification`}
          color="blue"
        />

        <StatCard
          title="Critical / Emergency Count"
          value={overview.criticalIssues || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
          trend="Immediate attention"
          color="red"
        />

        <StatCard
          title="Issues In Progress"
          value={overview.issuesInProgress || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          trend="Dispatched field officers"
          color="yellow"
        />

        <StatCard
          title="Resolved Today"
          value={overview.resolvedToday || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={`${overview.activeDepartments || 7} active departments`}
          color="green"
        />
      </div>

      {/* 4. Phase 8 Operational Quick Actions Panel */}
      <QuickActionsPanel
        onFilterCritical={() => {
          setSelectedPriorityFilter("Critical");
          setSelectedStatusFilter("ALL");
        }}
        onFilterPending={() => {
          setSelectedStatusFilter("Pending");
          setSelectedPriorityFilter("ALL");
        }}
        onResetFilters={handleResetAllFilters}
        activeFilterCount={activeFiltersCount}
      />

      {/* 5. Phase 2 Interactive GIS Map & Command Center Controls */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
          <div>
            <SectionTitle title="Live GIS Operations Map" subtitle="Geographic telemetry overlay of active civic complaints citywide" />
          </div>

          {/* Map Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-800">
              <span className="text-[10px] uppercase text-gray-400 font-black">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-black text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Active Statuses ({issues.length})</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-800">
              <span className="text-[10px] uppercase text-gray-400 font-black">Severity:</span>
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="bg-transparent font-black text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button
              onClick={handleResetAllFilters}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
            >
              Reset Map View
            </button>
          </div>
        </div>

        {/* Map Marker Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-slate-50/70 dark:bg-gray-950/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
          <span className="text-gray-400 uppercase font-black tracking-wider">Map Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white"></span> Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block border border-white"></span> Verified</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block border border-white"></span> Assigned</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-white"></span> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white"></span> Resolved</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block border border-white animate-pulse"></span> Critical / Emergency</span>
        </div>

        {/* Leaflet GIS Map Container */}
        <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-gray-250 dark:border-gray-800 shadow-inner relative z-0">
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredMapIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={issue.coordinates}
                icon={createCustomPin(issue.status, issue.priority)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-2 max-w-xs text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-150 pb-1.5">
                      <span className="font-mono font-black text-blue-600">{issue.ticketId}</span>
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <h4 className="font-black text-slate-900 leading-tight">{issue.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{issue.description || "No description provided."}</p>
                    <div className="space-y-1 text-[10px] bg-slate-50 p-2 rounded-lg border border-gray-150">
                      <div><strong>Category:</strong> {issue.category}</div>
                      <div><strong>Department:</strong> {issue.department || "Unassigned"}</div>
                      <div><strong>Officer:</strong> {issue.assignedOfficer || "Unassigned"}</div>
                      <div><strong>Location:</strong> {issue.locationText}</div>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <StatusBadge status={issue.status} />
                      <Link
                        to={`/admin/issues/${issue.id}`}
                        className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] rounded-lg hover:bg-slate-800 transition block text-center"
                      >
                        Inspect Issue &rarr;
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 6. Phase 7 Ward / Zone Monitoring Panel */}
      <WardMonitoringPanel
        wards={wards}
        onSelectWard={handleSelectWard}
        selectedWardId={selectedWardId}
      />

      {/* 7. Phase 3 & 4 Stream Feed & Department Status Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Phase 3 Live Activity Feed (IssueHistory Stream) */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[540px]">
          <div>
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3 mb-4">
              <SectionTitle title="Live Activity Feed" subtitle="Real-time IssueHistory events stream" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[410px] pr-1">
              {activity.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  No recent operational activity recorded in the audit trail.
                </div>
              ) : (
                activity.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 bg-slate-50/80 dark:bg-gray-950/60 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-1.5 transition hover:border-blue-500/40"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{event.ticketId}</span>
                      <span className="text-gray-400 font-medium">{formatTimeAgo(event.timestamp)}</span>
                    </div>

                    <div className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                      {event.title}
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border ${getActionBadgeColor(event.action)}`}>
                        {event.action.replace(/_/g, " ")}
                      </span>
                      {event.oldValue && event.newValue && (
                        <span className="text-[10px] text-gray-500 truncate max-w-[130px]">
                          {typeof event.oldValue === "string" ? event.oldValue : ""} &rarr; {typeof event.newValue === "string" ? event.newValue : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-150/60 dark:border-gray-800/60">
                      <span>By: <strong className="text-slate-700 dark:text-gray-300">{event.operator}</strong></span>
                      <span className="truncate max-w-[110px]">Dep: {event.department || "General"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-150 dark:border-gray-800 text-center text-[11px] text-gray-400 font-bold">
            Displaying latest {activity.length} operational actions
          </div>
        </div>

        {/* Phase 4 Department Live Status Board */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[540px]">
          <div>
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3 mb-4">
              <SectionTitle title="Department Live Workload Board" subtitle="Real-time caseload saturation & division readiness" />
              <Link
                to="/admin/departments"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                All Departments &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[420px] pr-1">
              {departments.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-xs text-gray-400">
                  No department telemetry available.
                </div>
              ) : (
                departments.map((dept) => {
                  const assigned = dept.totalAssigned || 0;
                  const resolved = dept.resolved || 0;
                  const activeCount = assigned - resolved;
                  const workloadPct = assigned > 0 ? Math.round((activeCount / assigned) * 100) : 0;
                  const isHighLoad = activeCount >= 8 || workloadPct >= 65;

                  return (
                    <div
                      key={dept.id || dept.name}
                      className="p-4 bg-slate-50/80 dark:bg-gray-950/60 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{dept.name}</h4>
                          <span className="text-[10px] text-gray-500 block font-medium mt-0.5">
                            {dept.activeOfficers || 1} field officers allocated
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border shrink-0 ${
                            isHighLoad
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isHighLoad ? "HIGH LOAD" : "OPERATIONAL"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-150 dark:border-gray-800 text-center text-xs">
                        <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800/80">
                          <span className="text-sm font-black text-blue-600 block">{assigned}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Assigned</span>
                        </div>
                        <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800/80">
                          <span className="text-sm font-black text-amber-600 block">{activeCount}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Active</span>
                        </div>
                        <div className="p-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800/80">
                          <span className="text-sm font-black text-emerald-600 block">{dept.averageResolutionTime || "24h"}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Avg SLA</span>
                        </div>
                      </div>

                      {/* Workload Load Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>Caseload Saturation</span>
                          <span className="text-slate-800 dark:text-white">{workloadPct}% Active</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHighLoad ? "bg-amber-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, workloadPct))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-150 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-500">
            <span>Citywide SLA Index: <strong className="text-emerald-600 dark:text-emerald-400 font-black">Optimal Status</strong></span>
            <span>Departments: <strong className="text-slate-800 dark:text-white font-black">{departments.length} Divisions</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
