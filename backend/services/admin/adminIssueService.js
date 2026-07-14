import Issue from "../../models/Issue.js";
import IssueHistory from "../../models/IssueHistory.js";

/**
 * Helper to record audit trail entries
 */
export const recordAuditLog = async ({ issueId, adminId, action, oldValue, newValue, note = "", metadata = {} }) => {
  try {
    await IssueHistory.create({
      issue: issueId,
      admin: adminId,
      action,
      oldValue,
      newValue,
      note,
      metadata,
    });
  } catch (error) {
    console.error("Failed to record IssueHistory audit log:", error);
  }
};

/**
 * Service to fetch paginated, filtered, searched, and sorted admin issues
 */
export const getAdminIssuesService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    priority = "",
    category = "",
    department = "",
    sortBy = "newest",
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  // Build MongoDB query filter
  const query = {};

  // 1. Status Filter
  if (status && status !== "All") {
    query.status = status;
  }

  // 2. Priority Filter
  if (priority && priority !== "All") {
    query.priority = priority;
  }

  // 3. Category Filter
  if (category && category !== "All") {
    let mappedCategory = category;
    if (category === "Road Damage") mappedCategory = "Road";
    if (category === "Water Leakage") mappedCategory = "Water";
    if (category === "Street Light") mappedCategory = "Electricity";
    if (category === "Drainage") mappedCategory = "Surroundings";
    
    query.category = { $regex: new RegExp(mappedCategory, "i") };
  }

  // 4. Department Filter
  if (department && department !== "All") {
    query.department = { $regex: new RegExp(department, "i") };
  }

  // 5. Global Search Filter
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { locationText: searchRegex },
      { category: searchRegex },
      { department: searchRegex },
      { assignedOfficer: searchRegex },
    ];
  }

  // 6. Build Sorting Option
  let sortOption = { createdAt: -1 }; // default: newest

  switch (sortBy) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "recently_updated":
      sortOption = { updatedAt: -1 };
      break;
    case "most_upvoted":
      sortOption = { createdAt: -1 };
      break;
    case "highest_priority":
      sortOption = { createdAt: -1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  // Execute Count & Query in parallel
  const total = await Issue.countDocuments(query);
  let issues = await Issue.find(query)
    .populate("reportedBy", "name email")
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // In-memory sorting for fields like upvotes count or priority weights if requested
  if (sortBy === "most_upvoted") {
    issues.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
  } else if (sortBy === "highest_priority") {
    const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    issues.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
  }

  const pages = Math.ceil(total / limitNum) || 1;

  return {
    issues,
    pagination: {
      total,
      page: pageNum,
      pages,
      limit: limitNum,
    },
  };
};

/**
 * Service to fetch single issue details by ID
 */
export const getAdminIssueByIdService = async (issueId) => {
  const issue = await Issue.findById(issueId).populate("reportedBy", "name email");

  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  return issue;
};

/**
 * Phase 2: Verify an issue
 */
export const verifyAdminIssueService = async (issueId, adminId, { reason = "" } = {}) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (issue.status === "Rejected") {
    const error = new Error("Rejected issues cannot be verified again");
    error.statusCode = 400;
    throw error;
  }

  if (issue.status !== "Pending") {
    const error = new Error("Only Pending issues can be verified");
    error.statusCode = 400;
    throw error;
  }

  const oldValue = { status: issue.status, verified: issue.verified };
  issue.verified = true;
  issue.status = "Verified";
  await issue.save();

  await recordAuditLog({
    issueId: issue._id,
    adminId,
    action: "VERIFY_ISSUE",
    oldValue,
    newValue: { status: "Verified", verified: true },
    note: reason,
  });

  return issue;
};

/**
 * Phase 2: Reject an issue
 */
export const rejectAdminIssueService = async (issueId, adminId, { reason = "" } = {}) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (issue.status === "Rejected") {
    const error = new Error("Issue is already rejected");
    error.statusCode = 400;
    throw error;
  }

  if (issue.status === "Resolved") {
    const error = new Error("Resolved issues cannot be rejected");
    error.statusCode = 400;
    throw error;
  }

  const oldValue = { status: issue.status, verified: issue.verified };
  issue.verified = false;
  issue.status = "Rejected";
  await issue.save();

  await recordAuditLog({
    issueId: issue._id,
    adminId,
    action: "REJECT_ISSUE",
    oldValue,
    newValue: { status: "Rejected", verified: false },
    note: reason,
  });

  return issue;
};

/**
 * Phase 3: Department Assignment
 */
export const assignAdminIssueService = async (issueId, adminId, { department, assignedOfficer = "" }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (!department || !department.trim()) {
    const error = new Error("Department is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanDept = department.trim();
  const cleanOfficer = (assignedOfficer || "").trim();

  if (issue.department === cleanDept && issue.assignedOfficer === cleanOfficer) {
    const error = new Error("Issue is already assigned to this department and officer");
    error.statusCode = 400;
    throw error;
  }

  const oldValue = {
    department: issue.department,
    assignedOfficer: issue.assignedOfficer,
    status: issue.status,
  };

  issue.department = cleanDept;
  issue.assignedOfficer = cleanOfficer;

  if (issue.status === "Pending" || issue.status === "Verified") {
    issue.status = "Assigned";
  }

  await issue.save();

  await recordAuditLog({
    issueId: issue._id,
    adminId,
    action: "ASSIGN_DEPARTMENT",
    oldValue,
    newValue: {
      department: issue.department,
      assignedOfficer: issue.assignedOfficer,
      status: issue.status,
    },
  });

  return issue;
};

/**
 * Phase 4: Priority Management
 */
export const updateAdminIssuePriorityService = async (issueId, adminId, { priority, note = "" }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const validPriorities = ["Low", "Medium", "High", "Critical"];
  if (!validPriorities.includes(priority)) {
    const error = new Error("Invalid priority level");
    error.statusCode = 400;
    throw error;
  }

  if (issue.priority === priority) {
    const error = new Error(`Issue priority is already set to ${priority}`);
    error.statusCode = 400;
    throw error;
  }

  const oldValue = issue.priority;
  issue.priority = priority;
  await issue.save();

  await recordAuditLog({
    issueId: issue._id,
    adminId,
    action: "CHANGE_PRIORITY",
    oldValue,
    newValue: priority,
    note,
  });

  return issue;
};

/**
 * Phase 5: Status Workflow
 */
export const updateAdminIssueStatusService = async (issueId, adminId, { status, note = "" }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    const error = new Error("Issue ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const validStatuses = ["Pending", "Verified", "Assigned", "In Progress", "Resolved", "Rejected"];
  if (!validStatuses.includes(status)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  // State transitions checks
  if (issue.status === "Resolved" && status === "Pending") {
    const error = new Error("Invalid transition: Resolved issue cannot become Pending");
    error.statusCode = 400;
    throw error;
  }

  if (issue.status === "Rejected" && status === "In Progress") {
    const error = new Error("Invalid transition: Rejected issue cannot directly become In Progress");
    error.statusCode = 400;
    throw error;
  }

  if (issue.status === "Pending" && status === "Resolved") {
    const error = new Error("Invalid transition: Pending issue cannot directly become Resolved without verification or assignment");
    error.statusCode = 400;
    throw error;
  }

  if (issue.status === status) {
    const error = new Error(`Issue is already in status: ${status}`);
    error.statusCode = 400;
    throw error;
  }

  const oldValue = { status: issue.status, verified: issue.verified };

  if (status === "Verified") {
    issue.verified = true;
  } else if (status === "Rejected") {
    issue.verified = false;
  }

  issue.status = status;
  await issue.save();

  await recordAuditLog({
    issueId: issue._id,
    adminId,
    action: "CHANGE_STATUS",
    oldValue,
    newValue: { status, verified: issue.verified },
    note,
  });

  return issue;
};
