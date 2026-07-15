import Issue from "../../models/Issue.js";
import IssueHistory from "../../models/IssueHistory.js";
import { getAdminDepartmentsService } from "./adminDepartmentService.js";

// Coimbatore geographic bounds fallback coordinates for issues without exact GPS coordinates
const COIMBATORE_CENTER = [11.0168, 76.9558];

/**
 * Helper: Assign stable deterministic coordinates within Coimbatore based on Issue ID or location Text
 */
const getIssueCoordinates = (issue) => {
  // If issue already has explicit valid coordinates [lat, lng], use them
  if (
    issue.location &&
    issue.location.coordinates &&
    Array.isArray(issue.location.coordinates) &&
    issue.location.coordinates.length === 2 &&
    issue.location.coordinates[0] !== 0
  ) {
    // MongoDB GeoJSON is [longitude, latitude], but Leaflet requires [latitude, longitude]
    return [issue.location.coordinates[1], issue.location.coordinates[0]];
  }

  // Generate deterministic offset around Coimbatore based on issue _id
  const idStr = issue._id ? issue._id.toString() : "default_seed";
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash1 = (hash1 * 31 + idStr.charCodeAt(i)) % 1000;
    hash2 = (hash2 * 37 + idStr.charCodeAt(i)) % 1000;
  }

  // Offset between -0.045 and +0.045 degrees (~5km spread across Coimbatore city wards)
  const latOffset = (hash1 / 1000 - 0.5) * 0.09;
  const lngOffset = (hash2 / 1000 - 0.5) * 0.09;

  return [
    Number((COIMBATORE_CENTER[0] + latOffset).toFixed(5)),
    Number((COIMBATORE_CENTER[1] + lngOffset).toFixed(5))
  ];
};

/**
 * Phase 1: Get Live Monitor Overview KPIs and situational snapshot
 */
export const getLiveOverviewService = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    statusCounts,
    resolvedTodayCount,
    emergencyCount,
    recentHistory,
    departments
  ] = await Promise.all([
    Issue.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),
    Issue.countDocuments({
      status: "Resolved",
      updatedAt: { $gte: startOfToday }
    }),
    Issue.countDocuments({
      status: { $in: ["Pending", "Verified", "Assigned", "In Progress"] },
      $or: [
        { priority: "Critical" },
        { category: { $in: ["Water Leakage & Supply", "Drainage & Stormwater", "Public Health"] } }
      ]
    }),
    IssueHistory.find()
      .populate("issue", "title status priority category department")
      .populate("admin", "name email role")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    getAdminDepartmentsService()
  ]);

  const countMap = statusCounts.reduce((acc, curr) => {
    acc[curr._id || "Pending"] = curr.count;
    return acc;
  }, {});

  const pending = countMap["Pending"] || 0;
  const verified = countMap["Verified"] || 0;
  const assigned = countMap["Assigned"] || 0;
  const inProgress = countMap["In Progress"] || 0;
  const activeIssues = pending + verified + assigned + inProgress;
  const criticalIssues = await Issue.countDocuments({
    status: { $in: ["Pending", "Verified", "Assigned", "In Progress"] },
    priority: "Critical"
  });

  // Format recent activity
  const formattedActivity = recentHistory.map((item) => ({
    id: item._id,
    issueId: item.issue?._id || null,
    ticketId: item.issue?._id ? `#FMW-${item.issue._id.toString().slice(-6).toUpperCase()}` : "#FMW-SYS",
    title: item.issue?.title || "System Notification",
    action: item.action || "UPDATE",
    oldValue: item.oldValue,
    newValue: item.newValue,
    note: item.note,
    operator: item.admin?.name || "System Admin",
    department: item.issue?.department || "Municipal Core",
    timestamp: item.createdAt
  }));

  return {
    activeIssues,
    criticalIssues,
    pendingVerification: pending,
    issuesInProgress: inProgress,
    resolvedToday: resolvedTodayCount,
    activeDepartments: departments.length,
    emergencyCount,
    recentActivity: formattedActivity
  };
};

/**
 * Phase 1: Get Live Activity Feed (IssueHistory stream)
 */
export const getLiveActivityService = async (limit = 25) => {
  const events = await IssueHistory.find()
    .populate("issue", "title status priority category department locationText")
    .populate("admin", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return events.map((item) => ({
    id: item._id,
    issueId: item.issue?._id || null,
    ticketId: item.issue?._id ? `#FMW-${item.issue._id.toString().slice(-6).toUpperCase()}` : "#FMW-SYS",
    title: item.issue?.title || "Municipal Activity",
    category: item.issue?.category || "General",
    action: item.action || "UPDATE",
    oldValue: item.oldValue,
    newValue: item.newValue,
    note: item.note,
    operator: item.admin?.name || "Administrator",
    department: item.issue?.department || "Unassigned",
    timestamp: item.createdAt
  }));
};

/**
 * Phase 1: Get Active Issues for GIS Map and Emergency Queue
 */
export const getLiveIssuesService = async (filters = {}) => {
  const query = {
    status: { $in: ["Pending", "Verified", "Assigned", "In Progress"] }
  };

  if (filters.priority && filters.priority !== "ALL") {
    query.priority = filters.priority;
  }
  if (filters.department && filters.department !== "ALL") {
    query.department = filters.department === "Unassigned" ? { $in: ["", null] } : filters.department;
  }
  if (filters.category && filters.category !== "ALL") {
    query.category = filters.category;
  }

  const issues = await Issue.find(query)
    .populate("reportedBy", "name email phone")
    .sort({ priority: 1, createdAt: -1 })
    .lean();

  // Sort custom order: Critical first, High second, Medium third, Low fourth
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  issues.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

  return issues.map((item) => ({
    id: item._id,
    ticketId: `#FMW-${item._id.toString().slice(-6).toUpperCase()}`,
    title: item.title || "Untitled Issue",
    description: item.description || "",
    category: item.category || "Other",
    department: item.department || "Unassigned",
    priority: item.priority || "Low",
    status: item.status || "Pending",
    assignedOfficer: item.assignedOfficer || "Unassigned",
    reportedBy: item.reportedBy?.name || "Citizen Reporter",
    locationText: item.locationText || "Coimbatore Ward Zone",
    coordinates: getIssueCoordinates(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
};

/**
 * Phase 7: Get Ward / Zone Grouped Monitoring Metrics
 */
export const getLiveWardsService = async () => {
  const issues = await Issue.find().lean();

  // Canonical Coimbatore municipal zones and exact GPS centers for zoom panning
  const zones = [
    {
      id: "zone-central",
      name: "Central Zone (Wards 1-20)",
      center: [11.0168, 76.9558],
      keywords: ["central", "gandhipuram", "rs puram", "town hall", "race course", "ward 1", "ward 5", "ward 10", "ward 15"],
      open: 0,
      resolved: 0,
      critical: 0,
      categoriesCount: {}
    },
    {
      id: "zone-north",
      name: "North Zone (Wards 21-40)",
      center: [11.0500, 76.9600],
      keywords: ["north", "saravanampatti", "ganapathy", "thudiyalur", "kavundampalayam", "ward 22", "ward 28", "ward 35"],
      open: 0,
      resolved: 0,
      critical: 0,
      categoriesCount: {}
    },
    {
      id: "zone-east",
      name: "East Zone (Wards 41-60)",
      center: [11.0200, 77.0100],
      keywords: ["east", "peelamedu", "singanallur", "ramnathapuram", "ondipudur", "ward 45", "ward 52", "ward 58"],
      open: 0,
      resolved: 0,
      critical: 0,
      categoriesCount: {}
    },
    {
      id: "zone-south",
      name: "South Zone (Wards 61-80)",
      center: [10.9600, 76.9650],
      keywords: ["south", "kuniamuthur", "sundarapuram", "podanur", "kurichi", "ward 63", "ward 70", "ward 76"],
      open: 0,
      resolved: 0,
      critical: 0,
      categoriesCount: {}
    },
    {
      id: "zone-west",
      name: "West Zone (Wards 81-100)",
      center: [11.0100, 76.9100],
      keywords: ["west", "vadapeelamedu", "saibaba colony", "kovaipudur", "perur", "ward 85", "ward 92", "ward 98"],
      open: 0,
      resolved: 0,
      critical: 0,
      categoriesCount: {}
    }
  ];

  for (const issue of issues) {
    const locText = (issue.locationText || "").toLowerCase();
    const titleText = (issue.title || "").toLowerCase();
    const descText = (issue.description || "").toLowerCase();
    const combinedText = `${locText} ${titleText} ${descText}`;

    // Find best matching zone or distribute across zones deterministically based on ID hash if no explicit keyword
    let matchedZone = zones.find((z) => z.keywords.some((k) => combinedText.includes(k)));
    if (!matchedZone) {
      const idStr = issue._id ? issue._id.toString() : "0";
      let hash = 0;
      for (let i = 0; i < idStr.length; i++) hash += idStr.charCodeAt(i);
      matchedZone = zones[hash % zones.length];
    }

    const isResolved = issue.status === "Resolved" || issue.status === "Rejected";
    if (isResolved) {
      matchedZone.resolved += 1;
    } else {
      matchedZone.open += 1;
      if (issue.priority === "Critical") {
        matchedZone.critical += 1;
      }
    }

    const cat = issue.category || "General";
    matchedZone.categoriesCount[cat] = (matchedZone.categoriesCount[cat] || 0) + 1;
  }

  return zones.map((z) => {
    const total = z.open + z.resolved;
    const completionPct = total > 0 ? Math.round((z.resolved / total) * 100) : 100;
    
    // Top categories sorted by count descending
    const topCategories = Object.entries(z.categoriesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      id: z.id,
      name: z.name,
      center: z.center,
      openIssues: z.open,
      resolvedIssues: z.resolved,
      criticalIssues: z.critical,
      completionPercentage: completionPct,
      topCategories
    };
  });
};
