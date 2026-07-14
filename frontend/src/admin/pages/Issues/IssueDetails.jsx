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
  const { token, admin } = useAdminAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Operational State (Phases 2-5)
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State for Assignment Widget (Phase 3)
  const [assignDept, setAssignDept] = useState("");
  const [assignOfficer, setAssignOfficer] = useState("");

  // Phase 6 & 7 State: Admin Notes & Lifecycle Timeline
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  // Modal State for confirmations
  const [modal, setModal] = useState({
    isOpen: false,
    type: "", // 'verify' | 'reject' | 'assign' | 'priority' | 'status'
    title: "",
    description: "",
    note: "",
    newPriority: "Low",
    newStatus: "Pending",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchIssueDetails = async () => {
    if (!token || !id) return;
    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const [issueRes, notesRes, timelineRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/${id}/notes`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { notes: [] } })),
        axios.get(`${API_BASE_URL}/${id}/timeline`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { timeline: [] } })),
      ]);

      if (issueRes.data.success) {
        const fetchedIssue = issueRes.data.issue;
        setIssue(fetchedIssue);
        setAssignDept(fetchedIssue.department || "");
        setAssignOfficer(fetchedIssue.assignedOfficer || "");
        setNotes(notesRes.data?.notes || []);
        setTimeline(timelineRes.data?.timeline || []);
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

  const refreshTelemetry = async () => {
    if (!token || !id) return;
    try {
      const [issueRes, notesRes, timelineRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/${id}/notes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/${id}/timeline`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (issueRes.data.success) {
        const fetchedIssue = issueRes.data.issue;
        setIssue(fetchedIssue);
        setAssignDept(fetchedIssue.department || "");
        setAssignOfficer(fetchedIssue.assignedOfficer || "");
      }
      setNotes(notesRes.data?.notes || []);
      setTimeline(timelineRes.data?.timeline || []);
    } catch (e) {
      console.error("Telemetry refresh error:", e);
    }
  };

  useEffect(() => {
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

  // Phase 6: Post internal admin note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !token || !issue) return;
    setNoteLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${issue._id}/notes`,
        { note: newNoteInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewNoteInput("");
        showToast("Internal note posted to audit trail", "success");
        await refreshTelemetry();
      }
    } catch (err) {
      console.error("Failed to post internal note:", err);
      showToast(err.response?.data?.message || "Failed to add internal note", "error");
    } finally {
      setNoteLoading(false);
    }
  };

  // Open confirmation modal
  const openConfirmModal = (type, params = {}) => {
    let title = "";
    let description = "";

    if (type === "verify") {
      title = "Confirm Issue Verification";
      description = "Verifying this issue confirms it as a legitimate municipal complaint. Only Pending issues can be verified.";
    } else if (type === "reject") {
      title = "Confirm Issue Rejection";
      description = "Rejecting this issue marks it as invalid or duplicate. Rejected issues cannot be verified again.";
    } else if (type === "assign") {
      title = "Confirm Department Assignment";
      description = `Are you sure you want to assign this issue to "${assignDept || "Unassigned"}"?`;
    } else if (type === "priority") {
      title = "Update Issue Priority";
      description = `Select new priority level for ticket #${issue?._id.slice(-6).toUpperCase()}:`;
    } else if (type === "status") {
      title = "Update Issue Lifecycle Status";
      description = `Transition lifecycle status for ticket #${issue?._id.slice(-6).toUpperCase()}:`;
    }

    setModal({
      isOpen: true,
      type,
      title,
      description,
      note: "",
      newPriority: params.newPriority || issue?.priority || "Low",
      newStatus: params.newStatus || issue?.status || "Pending",
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "",
      title: "",
      description: "",
      note: "",
      newPriority: "Low",
      newStatus: "Pending",
    });
  };

  // Execute operational API call
  const handleConfirmAction = async () => {
    if (!token || !issue) return;
    setActionLoading(true);

    try {
      let endpoint = "";
      let payload = {};

      if (modal.type === "verify") {
        endpoint = `${API_BASE_URL}/${issue._id}/verify`;
        payload = { reason: modal.note };
      } else if (modal.type === "reject") {
        endpoint = `${API_BASE_URL}/${issue._id}/reject`;
        payload = { reason: modal.note };
      } else if (modal.type === "assign") {
        endpoint = `${API_BASE_URL}/${issue._id}/assign`;
        payload = { department: assignDept, assignedOfficer: assignOfficer };
      } else if (modal.type === "priority") {
        endpoint = `${API_BASE_URL}/${issue._id}/priority`;
        payload = { priority: modal.newPriority, note: modal.note };
      } else if (modal.type === "status") {
        endpoint = `${API_BASE_URL}/${issue._id}/status`;
        payload = { status: modal.newStatus, note: modal.note };
      }

      const response = await axios.patch(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        showToast(response.data.message || "Operation completed successfully", "success");
        closeModal();
        await refreshTelemetry();
      }
    } catch (err) {
      console.error("Operation failed:", err);
      const errMsg = err.response?.data?.message || "Failed to execute administrative action";
      showToast(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
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

  // State guards for Phase 2 & Phase 5 buttons
  const canVerify = issue.status === "Pending";
  const canReject = issue.status !== "Rejected" && issue.status !== "Resolved";

  // Helper icon for timeline action types
  const getTimelineBadge = (action) => {
    switch (action) {
      case "VERIFY_ISSUE":
        return { text: "VERIFIED", color: "bg-emerald-500 text-gray-950" };
      case "ASSIGN_DEPARTMENT":
        return { text: "DISPATCHED", color: "bg-teal-500 text-gray-950" };
      case "CHANGE_PRIORITY":
        return { text: "TRIAGED", color: "bg-amber-500 text-gray-950" };
      case "CHANGE_STATUS":
        return { text: "STATUS CHANGE", color: "bg-blue-500 text-white" };
      case "ADD_NOTE":
        return { text: "NOTE ADDED", color: "bg-purple-500 text-white" };
      case "REJECT_ISSUE":
        return { text: "REJECTED", color: "bg-red-500 text-white" };
      case "TICKET_CREATED":
      default:
        return { text: "CREATED", color: "bg-slate-700 text-white" };
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification Bar */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-top-2 ${
          toast.type === "error" 
            ? "bg-red-500 text-white border-red-600 font-bold" 
            : "bg-emerald-600 text-white border-emerald-700 font-bold"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white font-black text-xs ml-2">✕</button>
        </div>
      )}

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

        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
          OPERATIONAL WORKFLOW ACTIVE
        </span>
      </div>

      {/* 1. Hero Header & Triage Action Bar */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
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

        {/* Action Controls Bar (Phases 2, 4, 5) */}
        <div className="pt-4 border-t border-gray-150 dark:border-gray-800/60 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Verification & Rejection (Phase 2) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openConfirmModal("verify")}
              disabled={!canVerify || actionLoading}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                canVerify
                  ? "bg-emerald-500 hover:bg-emerald-600 text-gray-950"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Verify Ticket
            </button>

            <button
              onClick={() => openConfirmModal("reject")}
              disabled={!canReject || actionLoading}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                canReject
                  ? "bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject Ticket
            </button>
          </div>

          {/* Right: Priority & Lifecycle Status Controls (Phases 4, 5) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openConfirmModal("priority")}
              className="px-3.5 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-250 dark:border-gray-700 transition flex items-center gap-1.5"
            >
              <span>Change Priority</span>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {issue.priority}
              </span>
            </button>

            <button
              onClick={() => openConfirmModal("status")}
              className="px-3.5 py-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white dark:text-gray-950 text-xs font-black rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>Lifecycle Status:</span>
              <span className="underline">{issue.status}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Issue Info, Gallery & Internal Notes */}
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
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Assigned Officer</span>
                <span className="font-black text-slate-800 dark:text-white">{issue.assignedOfficer || "Not Assigned"}</span>
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

          {/* Phase 6: Internal Admin Notes Workstation */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <SectionTitle title="Admin Internal Notes" subtitle="Internal triage remarks & operational logs" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                🔒 Internal Only • Not Visible to Citizens
              </span>
            </div>

            {/* Note Input Form */}
            <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <textarea
                rows={3}
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Enter internal triage observations, field updates, or department coordination notes here..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400 resize-none"
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-gray-500">
                  Posting as <strong>{admin?.name || "Admin Commander"}</strong> ({admin?.designation || "Officer"})
                </span>
                <button
                  type="submit"
                  disabled={!newNoteInput.trim() || noteLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition shadow-sm ${
                    newNoteInput.trim()
                      ? "bg-emerald-500 hover:bg-emerald-600 text-gray-950"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {noteLoading ? "Posting..." : "Post Internal Note"}
                </button>
              </div>
            </form>

            {/* Notes List (Newest First) */}
            <div className="space-y-3 pt-2">
              {notes.length === 0 ? (
                <div className="p-6 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500 font-light">
                  No internal notes recorded yet for this ticket. Post the first triage observation above.
                </div>
              ) : (
                notes.map((noteItem) => (
                  <div
                    key={noteItem._id}
                    className="p-4 bg-slate-50/70 dark:bg-gray-950/60 border border-gray-200/80 dark:border-gray-800 rounded-2xl space-y-2"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-[10px]">
                          {noteItem.admin?.name ? noteItem.admin.name.slice(0, 2).toUpperCase() : "AD"}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-gray-200">
                          {noteItem.admin?.name || "Admin Officer"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ({noteItem.admin?.designation || "Administrative Command"})
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatDate(noteItem.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-gray-300 pl-8 font-normal whitespace-pre-line">
                      {noteItem.note}
                    </p>
                  </div>
                ))
              )}
            </div>
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

        {/* Right 1 Column: Citizen Info, Operational Assignment & Phase 7 Timeline */}
        <div className="space-y-6">
          
          {/* Phase 3: Officer Assignment Triage Card */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Department Assignment" subtitle="Operational dispatch & officer allocation" />
            
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Assign Municipal Department *
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Department --</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Water Supply Board">Water Supply Board</option>
                  <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                  <option value="Electrical Works">Electrical Works</option>
                  <option value="Stormwater Drainage">Stormwater Drainage</option>
                  <option value="Parks & Forestry">Parks & Forestry</option>
                  <option value="Public Health">Public Health</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Assigned Field Officer (Optional)
                </label>
                <input
                  type="text"
                  value={assignOfficer}
                  onChange={(e) => setAssignOfficer(e.target.value)}
                  placeholder="e.g. Officer K. Ramesh (AE)"
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                />
              </div>

              <button
                onClick={() => openConfirmModal("assign")}
                disabled={!assignDept || actionLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm mt-2 ${
                  assignDept
                    ? "bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white dark:text-gray-950"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                }`}
              >
                Save Department Assignment
              </button>
            </div>
          </div>

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

          {/* Phase 7: Issue Lifecycle Timeline Widget */}
          <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <SectionTitle title="Municipal Audit Timeline" subtitle="Complete chronological activity stream" />
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 pl-6 pt-1 text-xs">
              {timeline.length === 0 ? (
                <div className="text-[11px] text-gray-500 font-light">Loading timeline entries...</div>
              ) : (
                timeline.map((item, idx) => {
                  const badge = getTimelineBadge(item.action);
                  return (
                    <div key={item._id || idx} className="relative group">
                      <span className={`absolute -left-6 top-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-emerald-500/10 ${
                        idx === 0 ? "bg-emerald-500 ring-emerald-500/30" : "bg-slate-400 dark:bg-gray-600"
                      }`}></span>
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${badge.color}`}>
                          {badge.text}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="mt-1 font-extrabold text-slate-800 dark:text-gray-150 text-xs">
                        {item.action === "VERIFY_ISSUE" && "Verified by Municipal Triage"}
                        {item.action === "ASSIGN_DEPARTMENT" && `Assigned to ${item.newValue?.department || "Department"}`}
                        {item.action === "CHANGE_PRIORITY" && `Priority Triaged to ${item.newValue}`}
                        {item.action === "CHANGE_STATUS" && `Status Changed to ${item.newValue?.status || item.newValue}`}
                        {item.action === "ADD_NOTE" && "Internal Admin Observation Recorded"}
                        {item.action === "REJECT_ISSUE" && "Ticket Rejected by Triage Command"}
                        {item.action === "TICKET_CREATED" && "Ticket Submitted by Citizen"}
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-normal leading-relaxed">
                        {item.note && <span className="block italic">"{item.note}"</span>}
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          Operator: <strong>{item.admin?.name || "System Command"}</strong> ({item.admin?.designation || item.admin?.role || "Staff"})
                        </span>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation & Operational Modal (Phases 2-5) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {modal.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-650 dark:text-gray-300 font-normal leading-relaxed">
              {modal.description}
            </p>

            {/* Priority Selector inside Modal (Phase 4) */}
            {modal.type === "priority" && (
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
                  New Priority Level
                </label>
                <select
                  value={modal.newPriority}
                  onChange={(e) => setModal((prev) => ({ ...prev, newPriority: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Priority</option>
                </select>
              </div>
            )}

            {/* Status Selector inside Modal (Phase 5) */}
            {modal.type === "status" && (
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
                  New Lifecycle Status
                </label>
                <select
                  value={modal.newStatus}
                  onChange={(e) => setModal((prev) => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Pending" disabled={issue.status === "Resolved"}>Pending</option>
                  <option value="Verified" disabled={issue.status === "Rejected"}>Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress" disabled={issue.status === "Rejected"}>In Progress</option>
                  <option value="Resolved" disabled={issue.status === "Pending"}>Resolved</option>
                  <option value="Rejected" disabled={issue.status === "Resolved"}>Rejected</option>
                </select>
              </div>
            )}

            {/* Optional Note / Reason Input */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
                {modal.type === "reject" ? "Rejection Reason (Recommended)" : "Audit Log Note / Reason (Optional)"}
              </label>
              <textarea
                rows={2}
                value={modal.note}
                onChange={(e) => setModal((prev) => ({ ...prev, note: e.target.value }))}
                placeholder={modal.type === "reject" ? "Explain why this complaint is rejected..." : "Enter note for audit trail..."}
                className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-xs font-black text-white transition flex items-center gap-1.5 shadow ${
                  modal.type === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm & Execute"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
