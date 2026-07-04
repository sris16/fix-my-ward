import Issue from "../../models/Issue.js";

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
    // Map UI category values to Schema category enums if necessary
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
      // Mongo count sorting handled or fallback
      sortOption = { createdAt: -1 };
      break;
    case "highest_priority":
      // Custom priority sort priority mapping or fallback to createdAt
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
