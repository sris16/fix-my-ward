import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";

const API_CITIZENS_URL = "http://localhost:5000/api/admin/citizens";

export default function Citizens() {
  const { token } = useAdminAuth();

  const [citizens, setCitizens] = useState([]);
  const [summary, setSummary] = useState({
    totalCitizens: 0,
    activeContributors: 0,
    communityChampions: 0,
    totalReportsSubmitted: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [contributionFilter, setContributionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [trustFilter, setTrustFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("Highest Contribution");

  const fetchCitizens = useCallback(async (pageNo = 1) => {
    if (!token) return;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        page: pageNo.toString(),
        limit: "15",
        sort: sortOrder
      });

      if (searchTerm.trim() !== "") params.append("search", searchTerm.trim());
      if (wardFilter !== "ALL") params.append("ward", wardFilter);
      if (contributionFilter !== "ALL") params.append("contributionLevel", contributionFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (trustFilter !== "ALL") params.append("trustLevel", trustFilter);

      const res = await axios.get(`${API_CITIZENS_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setCitizens(res.data.citizens || []);
        setSummary(res.data.summary || { totalCitizens: 0, activeContributors: 0, communityChampions: 0, totalReportsSubmitted: 0 });
        setPagination(res.data.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to fetch citizen directory:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, wardFilter, contributionFilter, statusFilter, trustFilter, sortOrder]);

  useEffect(() => {
    fetchCitizens(1);
  }, [fetchCitizens]);

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

  const tableHeaders = [
    { label: "Citizen Profile", className: "min-w-[220px]" },
    { label: "Contact / Ward", className: "min-w-[180px]" },
    { label: "Reporting Caseload", className: "min-w-[170px]" },
    { label: "Engagement Score", className: "min-w-[180px]" },
    { label: "Trust Level", className: "min-w-[120px]" },
    { label: "Status", className: "min-w-[100px]" },
    { label: "Joined Date", className: "min-w-[130px]" },
    { label: "Actions", className: "text-right min-w-[110px]" }
  ];

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Citizen Intelligence & Engagement Platform"
        subtitle="Monitor community participation, reporting accuracy, ward contributors, and civic trust metrics"
        actions={
          <button
            onClick={() => fetchCitizens(pagination.page)}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow transition hover:opacity-90 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh Intelligence</span>
          </button>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Citizens"
          value={summary.totalCitizens}
          trend="+12% this month"
          trendType="up"
          description="Active citizen accounts registered across Coimbatore wards"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />

        <StatCard
          title="Active Contributors"
          value={summary.activeContributors}
          trend={`${summary.totalCitizens > 0 ? Math.round((summary.activeContributors / summary.totalCitizens) * 100) : 0}% Engagement`}
          trendType="up"
          description="Citizens who have reported at least 1 verified civic issue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Community Champions"
          value={summary.communityChampions}
          trend="Elite Tier"
          trendType="up"
          description="High-reliability gold contributors with >= 150 score"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          }
        />

        <StatCard
          title="Total Issues Reported"
          value={summary.totalReportsSubmitted}
          trend="Real-Time Feed"
          trendType="up"
          description="Cumulative civic issues generated by directory citizens"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-purple-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
      </div>

      {/* Filter & Search Toolbar (Phase 3) */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, ward, or issue ID (#FMW-...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-950 px-3.5 py-2.5 pl-10 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sorting & Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Wards</option>
              <option value="Ward 04">Ward 04 - RS Puram</option>
              <option value="Ward 12">Ward 12 - Gandhipuram</option>
              <option value="Ward 18">Ward 18 - Peelamedu</option>
              <option value="Ward 24">Ward 24 - Saravanampatti</option>
              <option value="Ward 32">Ward 32 - Race Course</option>
              <option value="Ward 45">Ward 45 - Singanallur</option>
              <option value="Ward 52">Ward 52 - Ramanathapuram</option>
              <option value="Ward 60">Ward 60 - Ukkadam</option>
            </select>

            <select
              value={contributionFilter}
              onChange={(e) => setContributionFilter(e.target.value)}
              className="bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Contribution Levels</option>
              <option value="Community Champion">Community Champion</option>
              <option value="Gold Contributor">Gold Contributor</option>
              <option value="Silver Contributor">Silver Contributor</option>
              <option value="Bronze Contributor">Bronze Contributor</option>
            </select>

            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="bg-slate-50 dark:bg-gray-950 px-3 py-2 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Trust Levels</option>
              <option value="Verified">Verified</option>
              <option value="High">High Trust</option>
              <option value="Moderate">Moderate</option>
              <option value="New">New Resident</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm focus:outline-none"
            >
              <option value="Highest Contribution">Sort: Highest Contribution</option>
              <option value="Most Reports">Sort: Most Reports</option>
              <option value="Newest Citizen">Sort: Newest Citizen</option>
              <option value="Oldest Citizen">Sort: Oldest Citizen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Citizen Directory Table (Phase 2) */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
          <SectionTitle title="Citizen Register & Intelligence Directory" subtitle="Complete record of community reporters, engagement scores, and trust verified accounts" />
          <span className="text-xs font-bold text-gray-500">{pagination.totalCount} Registered Accounts</span>
        </div>

        {error ? (
          <EmptyState
            title="Error retrieving citizen directory"
            description="Could not connect to the municipal intelligence server."
            action={
              <button onClick={() => fetchCitizens(1)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
                Retry Connection
              </button>
            }
          />
        ) : (
          <Table
            headers={tableHeaders}
            loading={loading}
            data={citizens}
            renderRow={(citizen) => (
              <tr
                key={citizen._id}
                className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition duration-150"
              >
                {/* Avatar & Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      {getInitials(citizen.name)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {citizen.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono block truncate max-w-[150px]">
                        ID: {citizen._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Contact & Ward */}
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-200 block truncate max-w-[170px]">
                      {citizen.email}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono block">
                      {citizen.phone}
                    </span>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      {citizen.ward}
                    </span>
                  </div>
                </td>

                {/* Reporting Caseload */}
                <td className="px-6 py-4">
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-gray-950/40 p-2 rounded-xl border border-gray-200/60 dark:border-gray-800/60">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">{citizen.reportsSubmitted}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Total</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-600 block">{citizen.resolvedReports}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Done</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-500 block">{citizen.openReports}</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Open</span>
                    </div>
                  </div>
                </td>

                {/* Engagement Score & Badge */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{citizen.contributionScore}</span>
                      <span className="text-[10px] text-gray-400 font-bold">pts</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border block w-fit ${getBadgeColor(citizen.participationBadge)}`}>
                      {citizen.participationBadge}
                    </span>
                  </div>
                </td>

                {/* Trust Level */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border inline-block ${getTrustColor(citizen.trustLevel)}`}>
                    {citizen.trustLevel}
                  </span>
                </td>

                {/* Account Status */}
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    citizen.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    ● {citizen.status}
                  </span>
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  {new Date(citizen.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>

                {/* Actions (Phase 4 Profile Link) */}
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/admin/citizens/${citizen._id}`}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-black text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <span>&rarr;</span>
                  </Link>
                </td>
              </tr>
            )}
          />
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500">
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total citizens)</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchCitizens(pagination.page - 1)}
                className="px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-250 dark:border-gray-700 disabled:opacity-40 hover:bg-slate-50 transition text-slate-800 dark:text-white"
              >
                &larr; Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCitizens(pagination.page + 1)}
                className="px-3.5 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-250 dark:border-gray-700 disabled:opacity-40 hover:bg-slate-50 transition text-slate-800 dark:text-white"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
