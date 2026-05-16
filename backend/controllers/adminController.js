import Issue from "../models/Issue.js";
import Notification from "../models/Notification.js";

// 📋 Get all issues (admin)
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get single issue
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name email");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔄 Update issue (status, priority, etc.)
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const { status, priority, department, verified } = req.body;

    // ✅ Status update (validated)
    if (status !== undefined) {
      const validStatuses = ["Pending", "In Progress", "Resolved"];

      if (!validStatuses.includes(status.trim())) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      issue.status = status.trim();
    }

    // ✅ Other updates
    if (priority !== undefined) issue.priority = priority;
    if (department !== undefined) issue.department = department;
    if (verified !== undefined) issue.verified = verified;

    const updatedIssue = await issue.save();

    // 🔔 Create notification
    await Notification.create({
      userId: issue.reportedBy,
      message: `Your issue "${issue.title}" has been updated to ${issue.status}`,
      issueId: issue._id,
    });

    res.json(updatedIssue);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};