import User from "../../models/User.js";
import Issue from "../../models/Issue.js";
import IssueHistory from "../../models/IssueHistory.js";
import Notification from "../../models/Notification.js";
import mongoose from "mongoose";

// Deterministic Coimbatore Ward assignment helper for rich intelligence
const COIMBATORE_WARDS = [
  "Ward 04 - RS Puram",
  "Ward 12 - Gandhipuram",
  "Ward 18 - Peelamedu",
  "Ward 24 - Saravanampatti",
  "Ward 32 - Race Course",
  "Ward 45 - Singanallur",
  "Ward 52 - Ramanathapuram",
  "Ward 60 - Ukkadam"
];

const getDeterministicWard = (userId, customWard) => {
  if (customWard && customWard.trim() !== "") return customWard.trim();
  if (!userId) return COIMBATORE_WARDS[0];
  const str = userId.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return COIMBATORE_WARDS[Math.abs(hash) % COIMBATORE_WARDS.length];
};

const getDeterministicPhone = (userId, customPhone) => {
  if (customPhone && customPhone.trim() !== "") return customPhone.trim();
  if (!userId) return "+91 98422 10001";
  const str = userId.toString();
  const digits = str.replace(/[^0-9]/g, "").padEnd(5, "0").slice(0, 5);
  return `+91 98422 ${digits}`;
};

// Phase 6 & Phase 9: Compute comprehensive engagement metrics
export const computeCitizenMetrics = (citizen, issues = [], notifications = []) => {
  const reportsSubmitted = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === "Resolved");
  const resolvedReports = resolvedIssues.length;
  const openReports = issues.filter((i) => ["Pending", "Verified", "Assigned", "In Progress"].includes(i.status)).length;
  const rejectedCount = issues.filter((i) => i.status === "Rejected").length;

  // Total and average upvotes
  const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvotes?.length || 0), 0);
  const averageUpvotes = reportsSubmitted > 0 ? Number((totalUpvotes / reportsSubmitted).toFixed(1)) : 0;

  // Average resolution time across resolved issues
  let totalResolutionHours = 0;
  resolvedIssues.forEach((i) => {
    const created = new Date(i.createdAt).getTime();
    const resolved = new Date(i.updatedAt || i.createdAt).getTime();
    const hours = Math.max(0.5, (resolved - created) / (1000 * 60 * 60));
    totalResolutionHours += hours;
  });
  const avgHours = resolvedReports > 0 ? Number((totalResolutionHours / resolvedReports).toFixed(1)) : 0;
  const averageResolutionTime = resolvedReports === 0 ? "N/A" : avgHours < 24 ? `${avgHours} hrs` : `${Number((avgHours / 24).toFixed(1))} days`;

  // Response rate (% not stuck in initial Pending indefinitely if older than 24h, or transitioned)
  const respondedCount = issues.filter((i) => ["Verified", "Assigned", "In Progress", "Resolved"].includes(i.status)).length;
  const responseRate = reportsSubmitted > 0 ? Math.round((respondedCount / reportsSubmitted) * 100) + "%" : "100%";

  // Citizen reliability (% not rejected as spam or invalid)
  const citizenReliability = reportsSubmitted > 0 ? Math.round(((reportsSubmitted - rejectedCount) / reportsSubmitted) * 100) + "%" : "100%";

  // Repeat reports (count duplicate categories)
  const categories = issues.map((i) => i.category);
  const uniqueCategories = new Set(categories);
  const repeatReports = Math.max(0, reportsSubmitted - uniqueCategories.size);

  // Contribution score formula
  const contributionScore = Math.round((reportsSubmitted * 20) + (resolvedReports * 35) + (totalUpvotes * 5) + (rejectedCount === 0 && reportsSubmitted > 0 ? 15 : 0) + 10);

  // Participation Badge / Citizen Level
  let participationBadge = "Bronze Contributor";
  if (contributionScore >= 300) participationBadge = "Community Champion";
  else if (contributionScore >= 150) participationBadge = "Gold Contributor";
  else if (contributionScore >= 60) participationBadge = "Silver Contributor";

  // Trust Level
  let trustLevel = "Moderate";
  if (reportsSubmitted === 0) trustLevel = "New";
  else if (resolvedReports >= 3 && rejectedCount === 0) trustLevel = "High";
  else if (resolvedReports >= 1 || reportsSubmitted >= 2) trustLevel = "Verified";

  return {
    _id: citizen._id,
    name: citizen.name || "Citizen Resident",
    email: citizen.email || "citizen@fixmyward.gov.in",
    phone: getDeterministicPhone(citizen._id, citizen.phone),
    ward: getDeterministicWard(citizen._id, citizen.ward),
    avatar: citizen.avatar || "",
    status: citizen.status || "Active",
    joinedDate: citizen.createdAt,
    reportsSubmitted,
    resolvedReports,
    openReports,
    rejectedCount,
    totalUpvotes,
    averageUpvotes,
    averageResolutionTime,
    responseRate,
    citizenReliability,
    repeatReports,
    contributionScore,
    participationBadge,
    trustLevel
  };
};

// Phase 1, 2, 3, 6, 9: Get paginated and filtered citizens directory
export const getAdminCitizensService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 15));
  const searchTerm = (query.search || "").trim().toLowerCase();
  const wardFilter = query.ward && query.ward !== "ALL" ? query.ward : null;
  const contributionFilter = query.contributionLevel && query.contributionLevel !== "ALL" ? query.contributionLevel : null;
  const statusFilter = query.status && query.status !== "ALL" ? query.status : null;
  const trustFilter = query.trustLevel && query.trustLevel !== "ALL" ? query.trustLevel : null;
  const sortBy = query.sort || "Highest Contribution";

  // 1. Fetch all citizens from DB
  let dbUsers = await User.find({ role: "citizen" }).sort({ createdAt: -1 }).lean();

  // If search includes issue ID or #FMW, check reportedBy matching that issue
  let matchedIssueCitizenIds = new Set();
  if (searchTerm !== "") {
    let issueQuery = {};
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      issueQuery._id = searchTerm;
    } else if (searchTerm.startsWith("#fmw-") || searchTerm.startsWith("fmw-")) {
      // Find issues with ID ending in the hex suffix
      const hexPart = searchTerm.replace(/^#?fmw-/i, "").toLowerCase();
      const allIssuesForSearch = await Issue.find({}, { _id: 1, reportedBy: 1 }).lean();
      allIssuesForSearch.forEach((iss) => {
        if (iss._id.toString().toLowerCase().endsWith(hexPart)) {
          if (iss.reportedBy) matchedIssueCitizenIds.add(iss.reportedBy.toString());
        }
      });
    }
  }

  // 2. Fetch all issues reported by all citizens in batch
  const citizenIds = dbUsers.map((u) => u._id);
  const allIssues = await Issue.find({ reportedBy: { $in: citizenIds } }).lean();

  // Group issues by citizen ID
  const issuesByCitizen = new Map();
  allIssues.forEach((iss) => {
    const cid = iss.reportedBy?.toString();
    if (cid) {
      if (!issuesByCitizen.has(cid)) issuesByCitizen.set(cid, []);
      issuesByCitizen.get(cid).push(iss);
    }
  });

  // 3. Compute enriched profiles for all citizens
  let enrichedCitizens = dbUsers.map((u) => {
    const userIssues = issuesByCitizen.get(u._id.toString()) || [];
    return computeCitizenMetrics(u, userIssues, []);
  });

  // 4. Apply Filters & Global Search
  enrichedCitizens = enrichedCitizens.filter((c) => {
    // Global search matching name, email, phone, ward, or matched issue author
    if (searchTerm !== "") {
      const nameMatch = c.name.toLowerCase().includes(searchTerm);
      const emailMatch = c.email.toLowerCase().includes(searchTerm);
      const phoneMatch = c.phone.toLowerCase().includes(searchTerm);
      const wardMatch = c.ward.toLowerCase().includes(searchTerm);
      const issueAuthorMatch = matchedIssueCitizenIds.has(c._id.toString());
      if (!nameMatch && !emailMatch && !phoneMatch && !wardMatch && !issueAuthorMatch) {
        return false;
      }
    }

    // Ward filter
    if (wardFilter && !c.ward.toLowerCase().includes(wardFilter.toLowerCase())) {
      return false;
    }

    // Contribution / Level filter
    if (contributionFilter && c.participationBadge !== contributionFilter) {
      return false;
    }

    // Account Status filter
    if (statusFilter && c.status !== statusFilter) {
      return false;
    }

    // Trust Level / Activity Level filter
    if (trustFilter && c.trustLevel !== trustFilter) {
      return false;
    }

    return true;
  });

  // 5. Apply Sorting
  enrichedCitizens.sort((a, b) => {
    if (sortBy === "Most Reports") return b.reportsSubmitted - a.reportsSubmitted;
    if (sortBy === "Highest Contribution") return b.contributionScore - a.contributionScore;
    if (sortBy === "Newest Citizen") return new Date(b.joinedDate) - new Date(a.joinedDate);
    if (sortBy === "Oldest Citizen") return new Date(a.joinedDate) - new Date(b.joinedDate);
    return b.contributionScore - a.contributionScore;
  });

  // Summary KPIs across filtered or all citizens
  const totalCitizens = enrichedCitizens.length;
  const activeContributors = enrichedCitizens.filter((c) => c.reportsSubmitted > 0).length;
  const communityChampions = enrichedCitizens.filter((c) => c.participationBadge === "Community Champion" || c.participationBadge === "Gold Contributor").length;
  const totalReportsSum = enrichedCitizens.reduce((acc, c) => acc + c.reportsSubmitted, 0);

  // 6. Paginate
  const totalPages = Math.ceil(totalCitizens / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedCitizens = enrichedCitizens.slice(startIndex, startIndex + limit);

  return {
    citizens: paginatedCitizens,
    summary: {
      totalCitizens,
      activeContributors,
      communityChampions,
      totalReportsSubmitted: totalReportsSum
    },
    pagination: {
      page,
      limit,
      totalCount: totalCitizens,
      totalPages
    }
  };
};

// Phase 4, 5, 7, 8: Get complete, rich, read-only Citizen Profile
export const getAdminCitizenProfileService = async (citizenId) => {
  if (!mongoose.Types.ObjectId.isValid(citizenId)) {
    throw new Error("Invalid citizen identifier format");
  }

  const citizen = await User.findById(citizenId).lean();
  if (!citizen) {
    throw new Error("Citizen profile not found");
  }

  // Fetch all issues submitted by this citizen
  const issues = await Issue.find({ reportedBy: citizenId }).sort({ createdAt: -1 }).lean();

  // Fetch issue history / audit logs for these issues
  const issueIds = issues.map((i) => i._id);
  const issueHistories = await IssueHistory.find({ issueId: { $in: issueIds } }).sort({ timestamp: -1 }).lean();

  // Fetch all communication & notifications dispatched/received by this citizen
  const notifications = await Notification.find({
    $or: [{ userId: citizenId }, { recipient: citizenId }]
  }).sort({ createdAt: -1 }).lean();

  // Compute comprehensive metrics
  const profile = computeCitizenMetrics(citizen, issues, notifications);

  // Phase 7: Build chronological Citizen Activity Timeline
  let timeline = [];

  // Account creation event
  timeline.push({
    id: `joined-${citizen._id}`,
    type: "ACCOUNT_CREATED",
    title: "Citizen Account Registered",
    description: `${profile.name} registered on Fix My Ward municipal portal (${profile.ward}).`,
    timestamp: citizen.createdAt,
    icon: "User",
    badgeColor: "emerald"
  });

  // Issue submission events
  issues.forEach((iss) => {
    timeline.push({
      id: `issue-${iss._id}`,
      type: "ISSUE_SUBMITTED",
      title: `Submitted Complaint: #${iss._id.toString().slice(-6).toUpperCase()}`,
      description: `${iss.title} (${iss.category}) reported with ${iss.priority} priority.`,
      timestamp: iss.createdAt,
      issueId: iss._id,
      status: iss.status,
      icon: "Issue",
      badgeColor: "blue"
    });

    if (iss.status === "Resolved") {
      timeline.push({
        id: `resolved-${iss._id}`,
        type: "ISSUE_RESOLVED",
        title: `Complaint Resolved: #${iss._id.toString().slice(-6).toUpperCase()}`,
        description: `Department resolved complaint: "${iss.title}".`,
        timestamp: iss.updatedAt || iss.createdAt,
        issueId: iss._id,
        icon: "Check",
        badgeColor: "emerald"
      });
    }
  });

  // Issue audit log events (Verifications, Assignments)
  issueHistories.forEach((hist) => {
    timeline.push({
      id: `history-${hist._id}`,
      type: `AUDIT_${hist.action.replace(/\s+/g, "_").toUpperCase()}`,
      title: `${hist.action} on Complaint #${hist.issueId.toString().slice(-6).toUpperCase()}`,
      description: hist.notes || `State changed by ${hist.actorName || "Municipal Command"}`,
      timestamp: hist.timestamp,
      issueId: hist.issueId,
      icon: "Audit",
      badgeColor: "purple"
    });
  });

  // Notification events
  notifications.forEach((notif) => {
    timeline.push({
      id: `notif-${notif._id}`,
      type: "NOTIFICATION_RECEIVED",
      title: `Notification: ${notif.title}`,
      description: notif.message,
      timestamp: notif.createdAt,
      channel: notif.deliveryChannel || "In-App",
      icon: "Bell",
      badgeColor: "amber"
    });
  });

  // Sort timeline descending (newest first)
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    profile,
    reportHistory: issues,
    communicationHistory: notifications,
    timeline
  };
};
