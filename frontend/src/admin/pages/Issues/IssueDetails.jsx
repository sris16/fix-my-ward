import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { EmptyState } from "../../components/ui/EmptyState";

const API_BASE_URL = "http://localhost:5000/api/admin/issues";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchIssueDetails = async () => {
      if (!token || !id) return;
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setIssue(response.data.issue);
        } else {
          setError("Failed to load issue details");
        }
      } catch (err) {
        console.error("Error fetching issue details:", err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || "Failed to retrieve issue ticket");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [id, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl w-1/3"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="404 — Issue Ticket Not Found"
        description="The requested civic complaint ticket ID does not exist in the municipal database or has been purged."
        action={
          <Link
            to="/admin/issues"
            className="px-4 py-2 bg-emerald-500 text-gray-950 font-bold text-xs rounded-xl hover:bg-emerald-600 transition"
          >
            Return to Issues Workstation
          </Link>
        }
      />
    );
  }

  if (error || !issue) {
    return (
      <EmptyState
        title="Error Loading Ticket"
        description={error || "An unexpected error occurred while fetching issue details."}
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition"
          >
            Retry Request
          </button>
        }
      />
    );
  }

  const coordinatesText = issue.location?.coordinates
    ? `Lat: ${issue.location.coordinates[1]}, Lng: ${issue.location.coordinates[0]}`
    : issue.latitude && issue.longitude
    ? `Lat: ${issue.latitude}, Lng: ${issue.longitude}`
    : "Coordinates Unavailable";

  return (
    <div className="space-y-6">
      
      {/* Top Action / Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/issues")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-500 transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Issues List
        </button>

        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          READ-ONLY INSPECTION MODE
        </span>
      </div>

      {/* 1. Hero Header */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                #FMW-{issue._id.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Reported on {formatDate(issue.createdAt)}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {issue.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Location: <span className="font-semibold text-slate-800 dark:text-gray-200">{issue.locationText || "Coimbatore Municipal Ward"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Issue Info & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Issue Description Card */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Issue Information" subtitle="Detailed complaint description and categorization" />
            
            <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed font-normal whitespace-pre-line bg-slate-50 dark:bg-gray-950/50 p-4 rounded-2xl border border-gray-150 dark:border-gray-800">
              {issue.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Category</span>
                <span className="font-black text-slate-800 dark:text-white">{issue.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Assigned Department</span>
                <span className="font-black text-slate-800 dark:text-white">{issue.department || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Citizen Support</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">▲ {issue.upvotes ? issue.upvotes.length : 0} Upvotes</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Verification Status</span>
                <span className={`font-black ${issue.verified ? "text-emerald-600" : "text-amber-500"}`}>
                  {issue.verified ? "Verified Ticket" : "Unverified Report"}
                </span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Photo Evidence Gallery" subtitle="Citizen photographic submissions" />
            
            {issue.images && issue.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issue.images.map((imgUrl, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-2xl border border-gray-250 dark:border-gray-800 bg-slate-100 dark:bg-gray-950">
                    <img
                      src={imgUrl}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/90 text-gray-950 font-bold text-xs rounded-xl shadow"
                      >
                        View Full Screen
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500">
                No photo evidence attached to this ticket submission.
              </div>
            )}
          </div>

          {/* Interactive Map Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Location & GIS Coordinates" subtitle="Geospatial details" />
            
            <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-xl text-xs text-slate-700 dark:text-gray-300 font-mono flex items-center justify-between border border-gray-200 dark:border-gray-800">
              <span>📍 {coordinatesText}</span>
              <span className="text-[10px] text-gray-500 font-sans">{issue.locationText || "Coimbatore Zone"}</span>
            </div>

            <div className="h-44 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.684A1.125 1.125 0 003 6.69v11.22c0 .425.24.815.622 1.006l4.875 2.437a1.125 1.125 0 001.006 0l5.375-2.688a1.125 1.125 0 011.006 0z" />
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-gray-300">[ Interactive GIS Map Placeholder ]</span>
              <p className="text-[10px] text-gray-500 mt-1 max-w-xs">
                Real-time GIS map integration will be enabled in a future version.
              </p>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Citizen Info, Placeholders for Timeline & Admin Notes */}
        <div className="space-y-6">
          
          {/* Citizen Reporter Card */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Citizen Reporter" subtitle="Reporter contact information" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-gray-950 font-black text-sm">
                {issue.reportedBy?.name ? issue.reportedBy.name.slice(0, 2).toUpperCase() : "CR"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {issue.reportedBy?.name || "Civic Resident"}
                </h4>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {issue.reportedBy?.email || "No email provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Lifecycle Timeline" subtitle="Audit trail history" />
            
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 pl-6 text-xs">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                <span className="font-extrabold text-slate-800 dark:text-white">Ticket Created</span>
                <p className="text-[10px] text-gray-500">{formatDate(issue.createdAt)}</p>
              </div>

              <div className="relative opacity-60">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                <span className="font-bold text-slate-700 dark:text-gray-300">Verification & Triage</span>
                <p className="text-[10px] text-gray-500">[ Timeline Placeholder ]</p>
              </div>

              <div className="relative opacity-60">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                <span className="font-bold text-slate-700 dark:text-gray-300">Department Dispatch</span>
                <p className="text-[10px] text-gray-500">[ Timeline Placeholder ]</p>
              </div>
            </div>
          </div>

          {/* Assignment Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-3">
            <SectionTitle title="Officer Assignment" subtitle="Field worker assignment" />
            <div className="p-4 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500">
              [ Officer Assignment Placeholder ]<br />
              <span className="text-[10px]">Department dispatch functionality is read-only in Version 3.</span>
            </div>
          </div>

          {/* Admin Notes Placeholder */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-3">
            <SectionTitle title="Admin Internal Notes" subtitle="Internal comments" />
            <div className="p-4 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500">
              [ Admin Notes Placeholder ]<br />
              <span className="text-[10px]">Internal notes will be enabled in a future version.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
