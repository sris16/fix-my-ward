import mongoose from "mongoose";

const issueHistorySchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        "VERIFY_ISSUE",
        "REJECT_ISSUE",
        "ASSIGN_DEPARTMENT",
        "CHANGE_PRIORITY",
        "CHANGE_STATUS",
        "ADD_NOTE",
      ],
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Performance index for fetching chronological history of a specific issue
issueHistorySchema.index({ issue: 1, createdAt: -1 });

const IssueHistory = mongoose.model("IssueHistory", issueHistorySchema);

export default IssueHistory;
