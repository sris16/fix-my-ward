import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";

export default function CitizenProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | reports | timeline | communication

  useEffect(() => {
    if (!token || !id) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/citizens/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch citizen profile:", err);
        setError(err.response?.data?.message || "Failed to load citizen intelligence profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-white dark:bg-gray-900/60 rounded-3xl animate-pulse p-6 border border-gray-200 dark:border-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white dark:bg-gray-900/60 rounded-3xl animate-pulse" />
          <div className="h-64 bg-white dark:bg-gray-900/60 rounded-3xl animate-pulse" />
          <div className="h-64 bg-white dark:bg-gray-900/60 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Citizen Profile" subtitle={`User ID: ${id}`} />
        <EmptyState
          title="Citizen Profile Not Available"
          description={error || "The requested citizen account could not be found or has been removed."}
          action={
            <button
              onClick={() => navigate("/admin/citizens")}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              &larr; Return to Citizen Register
            </button>
          }
        />
      </div>
    );
  }

  const { profile, reportHistory = [], communicationHistory = [], timeline = [] } = data;

  const getInitials = (name) => {
    if (!name) return "CT";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Community Champion":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "Gold Contributor":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      case "Silver Contributor":
        return "bg-slate-300/40 dark:bg-gray-800 text-slate-800 dark:text-gray-300 border-slate-400/30";
      default:
        return "bg-amber-700/10 text-amber-800 dark:text-amber-500 border-amber-800/20";
    }
  };

  const getTrustColor = (trust) => {
    switch (trust) {
      case "High":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "Verified":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "New":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-gray-300/30";
    }
  };

  const reportHeaders = [
    { label: "Issue ID & Title", className: "min-w-[220px]" },
    { label: "Category / Dept", className: "min-w-[160px]" },
    { label: "Priority", className: "min-w-[110px]" },
    { label: "Status", className: "min-w-[120px]" },
    { label: "Reported / Resolved", className: "min-w-[180px]" },
    { label: "Resolution Duration", className: "min-w-[150px]" },
    { label: "Inspection", className: "text-right min-w-[100px]" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
            <Link to="/admin/citizens" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Citizens Directory
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-gray-200">{profile.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Citizen Profile & Community Intelligence
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Read-only administrative overview of community participation, reporting accuracy, and municipal logs
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/citizens")}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-gray-200 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition w-fit"
        >
          &larr; Back to Register
        </button>
      </div>

      {/* Hero Profile Banner (Phase 4) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
              {getInitials(profile.name)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">{profile.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getBadgeColor(profile.participationBadge)}`}>
                  ★ {profile.participationBadge}
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getTrustColor(profile.trustLevel)}`}>
                  {profile.trustLevel} Trust
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-3">
                <span>ID: {profile._id}</span>
                <span>●</span>
                <span className="text-emerald-400 font-bold">Status: {profile.status}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-indigo-200/80 pt-1">
                <span>📍 {profile.ward}</span>
                <span>•</span>
                <span>✉️ {profile.email}</span>
                <span>•</span>
                <span>📱 {profile.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-start md:items-end justify-between bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[200px] backdrop-blur-md">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block">Contribution Score</span>
              <span className="text-3xl font-black text-white">{profile.contributionScore}</span>
              <span className="text-xs text-indigo-200 ml-1 font-bold">pts</span>
            </div>
            <div className="text-right text-[11px] font-bold text-emerald-400 mt-1">
              Top Tier Civic Reporter
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Switcher Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition shrink-0 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"
          }`}
        >
          📊 Intelligence & Overview
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-2 ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"
          }`}
        >
          <span>📑 Report History</span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-full text-[10px]">
            {reportHistory.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-2 ${
            activeTab === "timeline"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"
          }`}
        >
          <span>⏳ Activity Timeline</span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-full text-[10px]">
            {timeline.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("communication")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-2 ${
            activeTab === "communication"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"
          }`}
        >
          <span>🔔 Communication Logs</span>
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-full text-[10px]">
            {communicationHistory.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Intelligence & Overview (Phase 4 & Phase 6) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Citizen & Contact Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <SectionTitle title="Citizen Information" subtitle="System registration and identity metadata" />
              <div className="divide-y divide-gray-150 dark:divide-gray-800 text-xs font-bold">
                <div className="py-3 flex justify-between">
                  <span className="text-gray-500">Full Name</span>
                  <span className="text-slate-900 dark:text-white">{profile.name}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-500">System Role</span>
                  <span className="uppercase text-blue-600 font-mono">Citizen Resident</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-500">Account Status</span>
                  <span className="text-emerald-600 font-black">● {profile.status}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-500">Joined Date</span>
                  <span className="text-slate-800 dark:text-gray-200">
                    {new Date(profile.joinedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-500">Account Age</span>
                  <span className="text-slate-800 dark:text-gray-200">
                    {Math.max(1, Math.round((Date.now() - new Date(profile.joinedDate).getTime()) / (1000 * 60 * 60 * 24)))} Days Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <SectionTitle title="Contact & Ward Data" subtitle="Primary municipal zone & verification coordinates" />
              <div className="divide-y divide-gray-150 dark:divide-gray-800 text-xs font-bold">
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Email Address</span>
                  <span className="text-slate-900 dark:text-white font-mono break-all">{profile.email}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Verified Mobile</span>
                  <span className="text-slate-900 dark:text-white font-mono">{profile.phone}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Assigned Ward</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{profile.ward}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Zone Jurisdiction</span>
                  <span className="text-slate-700 dark:text-gray-300">Coimbatore Municipal Corporation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle & Right Columns: Contribution & Issue Statistics (Phase 6) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
              <SectionTitle title="Community Engagement & Contribution Metrics" subtitle="Calculated scores based on reporting frequency, resolution rates, and peer upvotes" />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">{profile.responseRate}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Response Rate</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60">
                  <span className="text-2xl font-black text-emerald-600 block">{profile.citizenReliability}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Reliability Score</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60">
                  <span className="text-2xl font-black text-blue-600 block">{profile.averageUpvotes}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Avg Upvotes / Report</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60">
                  <span className="text-2xl font-black text-purple-600 block">{profile.repeatReports}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Repeat Category Issues</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-slate-700 dark:text-indigo-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-indigo-900 dark:text-indigo-300">💡 Contribution Formula Breakdown</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                    ({profile.reportsSubmitted} reports × 20 pts) + ({profile.resolvedReports} resolved × 35 pts) + ({profile.totalUpvotes} total upvotes × 5 pts) + Base Trust Bonus = <strong className="text-indigo-600 dark:text-white font-black">{profile.contributionScore} points</strong>
                  </p>
                </div>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{profile.participationBadge}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <SectionTitle title="Issue Reporting Caseload Summary" subtitle="Operational distribution of submitted complaints" />
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-4 bg-slate-900 text-white rounded-2xl">
                  <span className="text-2xl font-black block">{profile.reportsSubmitted}</span>
                  <span className="text-[10px] text-gray-300 uppercase font-bold">Total Submitted</span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="text-2xl font-black block">{profile.resolvedReports}</span>
                  <span className="text-[10px] uppercase font-bold">Resolved</span>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-2xl border border-blue-200/60 dark:border-blue-800/40">
                  <span className="text-2xl font-black block">{profile.openReports}</span>
                  <span className="text-[10px] uppercase font-bold">Open / Active</span>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 rounded-2xl border border-red-200/60 dark:border-red-800/40">
                  <span className="text-2xl font-black block">{profile.rejectedCount}</span>
                  <span className="text-[10px] uppercase font-bold">Rejected</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-xl font-black block mt-1">{profile.averageResolutionTime}</span>
                  <span className="text-[10px] uppercase font-bold">Avg Fix Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Citizen Report History Table (Phase 5) */}
      {activeTab === "reports" && (
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <SectionTitle title="Citizen Report History" subtitle="Every civic complaint submitted by this citizen account across its lifecycle" />
          
          <Table
            headers={reportHeaders}
            data={reportHistory}
            renderRow={(iss) => {
              const createdDate = new Date(iss.createdAt);
              const resolvedDate = iss.status === "Resolved" ? new Date(iss.updatedAt || iss.createdAt) : null;
              const durationHours = resolvedDate
                ? Number(Math.max(0.5, (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60)).toFixed(1))
                : null;

              return (
                <tr key={iss._id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{iss.title}</h5>
                    <span className="text-[10px] text-gray-400 font-mono block">#{iss._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200 block">{iss.category}</span>
                    {iss.department ? (
                      <Link to={`/admin/departments/${encodeURIComponent(iss.department)}`} className="text-[10px] text-blue-600 hover:underline block font-bold">
                        {iss.department}
                      </Link>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic block">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={iss.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={iss.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    <div>Created: {createdDate.toLocaleDateString()}</div>
                    {resolvedDate && <div className="text-emerald-600">Resolved: {resolvedDate.toLocaleDateString()}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {durationHours ? (
                      durationHours < 24 ? `${durationHours} hrs` : `${Number((durationHours / 24).toFixed(1))} days`
                    ) : (
                      <span className="text-gray-400 italic">In Progress</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/issues/${iss._id}`}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-black text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1"
                    >
                      <span>Open Issue</span>
                      <span>&rarr;</span>
                    </Link>
                  </td>
                </tr>
              );
            }}
          />
        </div>
      )}

      {/* Tab 3: Citizen Activity Timeline (Phase 7) */}
      {activeTab === "timeline" && (
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          <SectionTitle title="Citizen Activity Timeline" subtitle="Chronological audit log of registration, complaints, verifications, assignments, and resolutions" />

          {timeline.length === 0 ? (
            <EmptyState title="No activity recorded" description="This citizen account has no recorded events on the municipal timeline." />
          ) : (
            <div className="relative pl-6 border-l-2 border-indigo-500/30 dark:border-indigo-400/20 space-y-8 my-4 ml-3">
              {timeline.map((event) => {
                const isCreation = event.type === "ACCOUNT_CREATED";
                const isResolved = event.type === "ISSUE_RESOLVED";
                const isSubmission = event.type === "ISSUE_SUBMITTED";

                const badgeBg = isCreation
                  ? "bg-purple-500 text-white"
                  : isResolved
                  ? "bg-emerald-500 text-white"
                  : isSubmission
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-white";

                return (
                  <div key={event.id} className="relative group">
                    <span className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-gray-900 ${badgeBg}`}>
                      {isCreation ? "★" : isResolved ? "✓" : isSubmission ? "+" : "●"}
                    </span>

                    <div className="bg-slate-50 dark:bg-gray-950/60 p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-blue-500/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{event.title}</span>
                          <span className="text-[10px] font-mono text-gray-400 uppercase">({event.type})</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{event.description}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {event.issueId && (
                          <Link
                            to={`/admin/issues/${event.issueId}`}
                            className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Inspect Issue #{event.issueId.toString().slice(-6).toUpperCase()} &rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Citizen Communication History (Phase 8) */}
      {activeTab === "communication" && (
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 dark:border-gray-800 pb-3">
            <SectionTitle title="Communication & Notification Logs" subtitle="Every status advisory, broadcast, and lifecycle update received by this citizen" />
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1.5">
              <span>ℹ️ Read-Only Center</span>
              <span>•</span>
              <Link to="/admin/notifications" className="underline font-black hover:opacity-80">
                Go to Broadcast Center &rarr;
              </Link>
            </div>
          </div>

          {communicationHistory.length === 0 ? (
            <EmptyState
              title="No notifications dispatched"
              description="This citizen has not received any administrative messages, status verifications, or broadcasts yet."
            />
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {communicationHistory.map((notif) => (
                <div key={notif._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-gray-800/30 px-3 rounded-2xl transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{notif.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
                        {notif.type || "Information"}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        Channel: {notif.deliveryChannel || "In-App"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{notif.message}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                    <span className="text-[11px] font-bold text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      notif.read ? "bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-400" : "bg-blue-500/10 text-blue-600"
                    }`}>
                      {notif.read ? "● Read by Citizen" : "○ Unread Inbox"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
