import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Primary Version 8 Recipient identifier (can be Admin/User ObjectId, or Broadcast string e.g. "ALL_CITIZENS", "ALL_DEPARTMENTS", or department name)
    recipient: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    // Backward compatibility for existing Citizen Portal queries (`userId`)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["Admin", "Citizen", "Department", "Broadcast", "User"],
      default: "Admin",
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Information", "Warning", "Maintenance", "Emergency", "Success", "System"],
      default: "Information",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    // Primary Version 8 related issue reference
    relatedIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    // Backward compatibility for existing Citizen Portal queries (`issueId`)
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Delivered", "Failed", "Pending"],
      default: "Delivered",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveryChannel: {
      type: String,
      enum: ["In-App", "Email", "SMS", "Push"],
      default: "In-App",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Pre-save hook to synchronize `recipient <-> userId` and `relatedIssue <-> issueId` for total backward compatibility
notificationSchema.pre("save", function () {
  if (this.recipient && mongoose.Types.ObjectId.isValid(this.recipient) && !this.userId) {
    this.userId = this.recipient;
  } else if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  }

  if (this.relatedIssue && !this.issueId) {
    this.issueId = this.relatedIssue;
  } else if (this.issueId && !this.relatedIssue) {
    this.relatedIssue = this.issueId;
  }
});

// Phase 9: Optimized compound indexes for high-speed pagination and unread counts
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;