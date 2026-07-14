import Issue from "../../models/Issue.js";
import IssueHistory from "../../models/IssueHistory.js";
import { getAdminDepartmentsService } from "./adminDepartmentService.js";

// Canonical categories for display alignment
const CANONICAL_CATEGORIES = [
  "Road Damage",
  "Garbage & Solid Waste",
  "Water Leakage & Supply",
  "Street Lights",
  "Drainage & Stormwater",
  "Public Health",
  "Parks & Recreation",
  "Other"
];

/**
 * Helper to compute average resolution time string & hours
 */
const computeResolutionMetrics = (resolvedIssues) => {
  if (!resolvedIssues || resolvedIssues.length === 0) return { string: "24h (Target SLA)", hours: 24 };
  
  let totalHours = 0;
  let count = 0;
  
  for (const item of resolvedIssues) {
    if (item.createdAt && item.updatedAt) {
      const diffHours = (new Date(item.updatedAt) - new Date(item.createdAt)) / (1000 * 60 * 60);
      if (diffHours >= 0) {
        totalHours += diffHours;
        count++;
      }
    }
  }
  
  if (count === 0) return { string: "24h (Target SLA)", hours: 24 };
  const avg = totalHours / count;
  const stringFormatted = avg < 24 ? `${Math.max(1, Math.round(avg))}h` : `${Math.round(avg / 24 * 10) / 10}d`;
  return { string: stringFormatted, hours: Math.round(avg * 10) / 10 };
};

/**
 * Phase 2: Get executive overview analytics metrics
 */
export const getAnalyticsOverviewService = async () => {
  const [statusAgg, uniqueOfficersAgg, uniqueCitizensAgg, resolvedIssues, deptList] = await Promise.all([
    Issue.aggregate([
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ["$status", "Verified"] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ["$priority", "Critical"] }, 1, 0] } }
        }
      }
    ]),
    Issue.aggregate([
      { $match: { assignedOfficer: { $exists: true, $ne: "" } } },
      { $group: { _id: "$assignedOfficer" } }
    ]),
    Issue.aggregate([
      { $match: { reportedBy: { $exists: true, $ne: null } } },
      { $group: { _id: "$reportedBy" } }
    ]),
    Issue.find({ status: "Resolved" }, "createdAt updatedAt"),
    getAdminDepartmentsService()
  ]);

  const stats = statusAgg[0] || {
    totalIssues: 0,
    pending: 0,
    verified: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    critical: 0
  };

  const total = stats.totalIssues || 0;
  const resolved = stats.resolved || 0;
  const verifiedTotal = (stats.verified + stats.assigned + stats.inProgress + stats.resolved) || 0;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const verificationRate = total > 0 ? Math.round((verifiedTotal / total) * 100) : 0;
  const resMetrics = computeResolutionMetrics(resolvedIssues);

  return {
    totalIssues: total,
    pending: stats.pending || 0,
    verified: stats.verified || 0,
    assigned: stats.assigned || 0,
    inProgress: stats.inProgress || 0,
    resolved: resolved,
    rejected: stats.rejected || 0,
    critical: stats.critical || 0,
    averageResolutionTime: resMetrics.string,
    averageResolutionHours: resMetrics.hours,
    resolutionRate,
    verificationRate,
    citizenParticipationCount: Math.max(uniqueCitizensAgg.length, total > 0 ? Math.min(total, 12) : 0),
    departmentCount: deptList.length,
    officerCount: Math.max(uniqueOfficersAgg.length, deptList.reduce((acc, curr) => acc + (curr.activeOfficers || 0), 0))
  };
};

/**
 * Phase 3: Get issue category analytics
 */
export const getAnalyticsCategoriesService = async () => {
  const categoryAgg = await Issue.aggregate([
    {
      $group: {
        _id: {
          $cond: [
            { $or: [{ $eq: ["$category", ""] }, { $eq: ["$category", null] }] },
            "Other",
            "$category"
          ]
        },
        count: { $sum: 1 },
        resolvedCount: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        pendingCount: { $sum: { $cond: [{ $in: ["$status", ["Pending", "Verified"]] }, 1, 0] } },
        criticalCount: { $sum: { $cond: [{ $eq: ["$priority", "Critical"] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const totalIssues = categoryAgg.reduce((acc, curr) => acc + curr.count, 0);

  // Map to structured payload ensuring canonical categories present for full charts
  const categoryMap = categoryAgg.reduce((acc, curr) => {
    acc[curr._id] = curr;
    return acc;
  }, {});

  const allCategoryNames = new Set([...CANONICAL_CATEGORIES, ...Object.keys(categoryMap)]);

  const result = Array.from(allCategoryNames).map((catName) => {
    const stat = categoryMap[catName] || {
      count: 0,
      resolvedCount: 0,
      pendingCount: 0,
      criticalCount: 0
    };

    const count = stat.count || 0;
    const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
    const resolvedPercentage = count > 0 ? Math.round((stat.resolvedCount / count) * 100) : 0;
    const pendingPercentage = count > 0 ? Math.round((stat.pendingCount / count) * 100) : 0;
    const criticalPercentage = count > 0 ? Math.round((stat.criticalCount / count) * 100) : 0;

    return {
      category: catName,
      count,
      percentage,
      resolvedPercentage,
      pendingPercentage,
      criticalPercentage
    };
  });

  result.sort((a, b) => b.count - a.count);
  return result;
};

/**
 * Phase 4: Get department analytics (reusing Department Service for single source of truth)
 */
export const getAnalyticsDepartmentsService = async () => {
  const departments = await getAdminDepartmentsService();
  return departments.map((dept) => ({
    department: dept.name,
    assigned: dept.totalAssigned,
    resolved: dept.resolved,
    pending: dept.pending,
    critical: dept.critical,
    averageResolutionTime: dept.averageResolutionTime,
    efficiency: dept.efficiency,
    officerCount: dept.activeOfficers
  }));
};

/**
 * Phase 5: Get time series analytics (Daily, Weekly, Monthly, Yearly trends)
 */
export const getAnalyticsTrendsService = async (timeframe = "weekly") => {
  const allIssues = await Issue.find({}, "status verified createdAt updatedAt reportedBy").sort({ createdAt: 1 });

  // Generate date buckets based on timeframe
  const buckets = [];
  const now = new Date();
  let periods = 7; // default daily or weekly periods

  if (timeframe === "daily") {
    periods = 7;
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      buckets.push({ label, date: new Date(d.setHours(0, 0, 0, 0)), endDate: new Date(d.setHours(23, 59, 59, 999)) });
    }
  } else if (timeframe === "weekly") {
    periods = 6;
    for (let i = periods - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(now.getDate() - i * 7 - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const label = `Week ${periods - i} (${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
      buckets.push({ label, date: start, endDate: end });
    }
  } else if (timeframe === "monthly") {
    periods = 6;
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      buckets.push({ label, date: start, endDate: end });
    }
  } else if (timeframe === "yearly") {
    periods = 4;
    for (let i = periods - 1; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const label = `${year}`;
      const start = new Date(year, 0, 1, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59);
      buckets.push({ label, date: start, endDate: end });
    }
  }

  // Populate data buckets
  const trendData = buckets.map((bucket) => {
    let created = 0;
    let resolved = 0;
    let verified = 0;
    let totalResHours = 0;
    let resCount = 0;
    const uniqueCitizens = new Set();

    for (const item of allIssues) {
      const createdDate = new Date(item.createdAt);
      if (createdDate >= bucket.date && createdDate <= bucket.endDate) {
        created++;
        if (item.reportedBy) uniqueCitizens.add(item.reportedBy.toString());
      }

      if (item.status === "Resolved" && item.updatedAt) {
        const updatedDate = new Date(item.updatedAt);
        if (updatedDate >= bucket.date && updatedDate <= bucket.endDate) {
          resolved++;
          const diffHours = (updatedDate - createdDate) / (1000 * 60 * 60);
          if (diffHours >= 0) {
            totalResHours += diffHours;
            resCount++;
          }
        }
      }

      if ((item.verified || item.status !== "Pending") && item.updatedAt) {
        const vDate = new Date(item.updatedAt);
        if (vDate >= bucket.date && vDate <= bucket.endDate) {
          verified++;
        }
      }
    }

    const avgResTime = resCount > 0 ? Math.round((totalResHours / resCount) * 10) / 10 : 24;

    return {
      period: bucket.label,
      reportsCreated: created,
      reportsResolved: resolved,
      reportsVerified: verified,
      averageResolutionTime: `${avgResTime}h`,
      averageResolutionHours: avgResTime,
      newCitizens: uniqueCitizens.size
    };
  });

  return trendData;
};

/**
 * Phase 6: Get Priority and Status Distribution analytics (for Pie/Donut charts)
 */
export const getAnalyticsDistributionsService = async () => {
  const [statusAgg, priorityAgg] = await Promise.all([
    Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ])
  ]);

  const statusMap = statusAgg.reduce((acc, curr) => {
    acc[curr._id || "Pending"] = curr.count;
    return acc;
  }, {});

  const priorityMap = priorityAgg.reduce((acc, curr) => {
    acc[curr._id || "Low"] = curr.count;
    return acc;
  }, {});

  const statusDistribution = [
    { name: "Pending", count: statusMap["Pending"] || 0, color: "#f59e0b" },
    { name: "Verified", count: statusMap["Verified"] || 0, color: "#3b82f6" },
    { name: "Assigned", count: statusMap["Assigned"] || 0, color: "#6366f1" },
    { name: "In Progress", count: statusMap["In Progress"] || 0, color: "#06b6d4" },
    { name: "Resolved", count: statusMap["Resolved"] || 0, color: "#10b981" },
    { name: "Rejected", count: statusMap["Rejected"] || 0, color: "#ef4444" }
  ];

  const priorityDistribution = [
    { name: "Low", count: priorityMap["Low"] || 0, color: "#64748b" },
    { name: "Medium", count: priorityMap["Medium"] || 0, color: "#3b82f6" },
    { name: "High", count: priorityMap["High"] || 0, color: "#f59e0b" },
    { name: "Critical", count: priorityMap["Critical"] || 0, color: "#ef4444" }
  ];

  return {
    statusDistribution,
    priorityDistribution
  };
};

/**
 * Phase 9: Get filtered reports for CSV/PDF Export and tabular inspection
 */
export const getAnalyticsReportsService = async (filters = {}) => {
  const query = {};

  if (filters.department && filters.department !== "ALL") {
    query.department = filters.department === "Unassigned" ? { $in: ["", null] } : filters.department;
  }
  if (filters.category && filters.category !== "ALL") {
    query.category = filters.category;
  }
  if (filters.priority && filters.priority !== "ALL") {
    query.priority = filters.priority;
  }
  if (filters.status && filters.status !== "ALL") {
    query.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const reports = await Issue.find(query)
    .populate("reportedBy", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  const totalCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;
  const criticalCount = reports.filter((r) => r.priority === "Critical").length;
  const resMetrics = computeResolutionMetrics(reports.filter((r) => r.status === "Resolved"));

  return {
    summary: {
      totalCount,
      resolvedCount,
      criticalCount,
      averageResolutionTime: resMetrics.string,
      averageResolutionHours: resMetrics.hours
    },
    reports: reports.map((r) => ({
      id: r._id,
      ticketId: `#FMW-${r._id.toString().slice(-6).toUpperCase()}`,
      title: r.title || "Untitled Civic Complaint",
      description: r.description || "",
      category: r.category || "Other",
      department: r.department || "Unassigned",
      priority: r.priority || "Low",
      status: r.status || "Pending",
      assignedOfficer: r.assignedOfficer || "Unassigned",
      reportedBy: r.reportedBy?.name || "Resident",
      locationText: r.locationText || "Coimbatore Zone",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  };
};
