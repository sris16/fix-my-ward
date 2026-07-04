import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SearchInput } from "../../components/ui/SearchInput";
import { Table } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { SkeletonTable } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

const API_BASE_URL = "http://localhost:5000/api/admin/issues";

export default function Issues() {
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  // State
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch issues from Backend API
  const fetchIssues = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          department: departmentFilter,
          sortBy: sortBy,
        },
      });

      if (response.data.success) {
        setIssues(response.data.data || []);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            pages: response.data.pagination.pages,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching admin issues:", err);
      setError(err.response?.data?.message || "Failed to load issues registry");
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, debouncedSearch, statusFilter, priorityFilter, categoryFilter, departmentFilter, sortBy]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setDepartmentFilter("All");
    setSortBy("newest");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <PageHeader 
        title="Issue Management Workstation" 
        subtitle="Operational triage console for civic tickets across Coimbatore corporation wards"
        actions={
          <button
            onClick={fetchIssues}
            className="px-4 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-gray-250 dark:border-gray-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh Data</span>
          </button>
        }
      />

      {/* 2. Control Bar (Search, Filters, Sort) */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Top Row: Global Search & Sort */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <SearchInput 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Title, ID, Location, Category, or Department..."
            className="w-full md:w-96"
          />

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 shrink-0">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_priority">Highest Priority</option>
              <option value="most_upvoted">Most Upvoted</option>
              <option value="recently_updated">Recently Updated</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition"
              title="Reset search & filters"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-150 dark:border-gray-800/60">
          
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Garbage">Garbage</option>
              <option value="Street Light">Street Light</option>
              <option value="Drainage">Drainage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Departments</option>
              <option value="Road">Roads & Infrastructure</option>
              <option value="Water">Water Supply</option>
              <option value="Electricity">Electricity Works</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Public Health">Public Health</option>
              <option value="Parks">Parks & Greenery</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Issue Registry Data Table */}
      <div className="bg-white dark:bg-gray-900/60 backdrop-blur-sm border border-gray-250 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <SectionTitle 
            title="Active Ticket Registry" 
            subtitle={`Showing ${startRecord}-${endRecord} of ${pagination.total} registered civic complaints`} 
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchIssues} className="underline font-bold hover:text-red-500">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="mt-4">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : issues.length === 0 ? (
          <EmptyState 
            title="No Matching Tickets Found"
            description="No municipal issues match your selected filters or search query. Try adjusting your search keywords or resetting filters."
            action={
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-500 text-gray-950 text-xs font-bold rounded-xl shadow hover:bg-emerald-600 transition"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <>
            <Table
              headers={[
                "ID",
                "Thumbnail",
                "Issue Title",
                "Category",
                "Citizen Name",
                "Ward / Location",
                "Priority",
                "Department",
                "Status",
                "Upvotes",
                "Date",
                "Action"
              ]}
              data={issues}
              renderRow={(row) => (
                <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                  
                  {/* ID */}
                  <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
                    <Link to={`/admin/issues/${row._id}`} className="hover:text-emerald-500 transition">
                      #FMW-{row._id.slice(-5).toUpperCase()}
                    </Link>
                  </td>

                  {/* Thumbnail */}
                  <td className="px-6 py-4">
                    {row.images && row.images.length > 0 ? (
                      <img 
                        src={row.images[0]} 
                        alt={row.title} 
                        className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-600 shrink-0 border border-gray-200 dark:border-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4 min-w-[200px]">
                    <Link to={`/admin/issues/${row._id}`} className="text-xs font-bold text-slate-800 dark:text-gray-150 leading-tight hover:text-emerald-500 transition block">
                      {row.title}
                    </Link>
                    <div className="text-[10px] text-gray-500 font-light truncate max-w-xs mt-0.5">
                      {row.description}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-xs text-slate-650 dark:text-gray-300 font-medium whitespace-nowrap">
                    {row.category}
                  </td>

                  {/* Citizen Name */}
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-gray-200 whitespace-nowrap">
                    {row.reportedBy?.name || "Civic Resident"}
                  </td>

                  {/* Ward / Location */}
                  <td className="px-6 py-4 text-[10.5px] text-gray-500 dark:text-gray-400 font-light max-w-xs truncate">
                    {row.locationText || "Coimbatore Ward Zone"}
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={row.priority} />
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-xs text-slate-700 dark:text-gray-300 font-medium whitespace-nowrap">
                    {row.department || "Unassigned"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={row.status} />
                  </td>

                  {/* Upvotes */}
                  <td className="px-6 py-4 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    ▲ {row.upvotes ? row.upvotes.length : 0}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-[10.5px] text-gray-500 font-medium whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/issues/${row._id}`)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-emerald-500 hover:text-gray-950 text-slate-700 dark:text-gray-300 font-extrabold text-[11px] rounded-lg transition"
                    >
                      View Details
                    </button>
                  </td>

                </tr>
              )}
            />

            {/* 4. Pagination Controls Bar (Phase 6) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-150 dark:border-gray-800/60">
              
              {/* Left: Records info & Rows Per Page */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Showing <strong className="text-slate-800 dark:text-gray-200">{startRecord}</strong> to{" "}
                  <strong className="text-slate-800 dark:text-gray-200">{endRecord}</strong> of{" "}
                  <strong className="text-slate-800 dark:text-gray-200">{pagination.total}</strong> tickets
                </span>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold">Rows per page:</label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                    className="bg-slate-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Numbers & Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:pointer-events-none text-slate-800 dark:text-white font-bold text-xs rounded-xl transition"
                >
                  Previous
                </button>

                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 px-2">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:pointer-events-none text-slate-800 dark:text-white font-bold text-xs rounded-xl transition"
                >
                  Next
                </button>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
