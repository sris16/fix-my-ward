import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Road", "Water", "Garbage", "Electricity", "Surroundings", "Other"],
      required: true,
    },

    locationText: String,

    // 🌍 GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    images: [String],

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    department: {
      type: String,
      default: "",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 Performance Indexes for fast filtering and geospatial queries
issueSchema.index({ location: "2dsphere" });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ department: 1 });
issueSchema.index({ createdAt: -1 });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;