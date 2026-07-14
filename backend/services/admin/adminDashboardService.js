import Issue from "../../models/Issue.js";
import IssueHistory from "../../models/IssueHistory.js";

/**
 * Service to aggregate dashboard KPIs, department breakdowns, and recent activity
 */
export const getDashboardKPIsService = async () => {
  // Execute parallel count and aggregation queries
  const [totalIssues, statusCounts, priorityCounts, departmentAgg, recentReports, recentActivity] = await Promise.all([
    Issue.countDocuments(),
    Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ["$department", ""] }, { $eq: ["$department", null] }] },
              "Unassigned",
              "$department"
            ]
          },
          count: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          inProgressCount: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(6),
    IssueHistory.find()
      .populate("admin", "name email role designation avatar")
      .populate("issue", "title status priority department locationText")
      .sort({ createdAt: -1 })
      .limit(8)
  ]);

  // Extract Status counts into map
  const statusMap = statusCounts.reduce((acc, curr) => {
    acc[curr._id || "Pending"] = curr.count;
    return acc;
  }, {});

  // Extract Priority counts into map
  const priorityMap = priorityCounts.reduce((acc, curr) => {
    acc[curr._id || "Low"] = curr.count;
    return acc;
  }, {});

  // Calculate resolution efficiency per department
  const departmentCounts = departmentAgg.map((dept) => ({
    name: dept._id,
    totalIssues: dept.count,
    resolvedIssues: dept.resolvedCount || 0,
    inProgressIssues: dept.inProgressCount || 0,
    efficiency: dept.count > 0 ? Math.round((dept.resolvedCount / dept.count) * 100) : 100,
  }));

  return {
    kpis: {
      totalIssues,
      pending: statusMap["Pending"] || 0,
      verified: statusMap["Verified"] || 0,
      assigned: statusMap["Assigned"] || 0,
      inProgress: statusMap["In Progress"] || 0,
      resolved: statusMap["Resolved"] || 0,
      rejected: statusMap["Rejected"] || 0,
      critical: priorityMap["Critical"] || 0,
      high: priorityMap["High"] || 0,
      medium: priorityMap["Medium"] || 0,
      low: priorityMap["Low"] || 0,
    },
    departmentCounts,
    recentReports,
    recentActivity,
  };
};
