import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const sampleIssuesData = [
  {
    title: "Large Pothole near Avinashi Road Signal",
    description: "A huge pothole has formed right after the Avinashi Road traffic signal causing severe traffic bottleneck during peak morning hours.",
    category: "Road",
    locationText: "Avinashi Road Signal, Ward 12, Coimbatore",
    location: { type: "Point", coordinates: [76.9616, 11.0168] },
    images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop"],
    status: "Pending",
    priority: "Critical",
    department: "Roads & Infrastructure",
  },
  {
    title: "Water Leakage from Main Supply Line",
    description: "Potable water is gushing out from the main valve control unit on Race Course Road, wasting thousands of liters.",
    category: "Water",
    locationText: "Race Course Scheme Road, Ward 24, Coimbatore",
    location: { type: "Point", coordinates: [76.9723, 11.0021] },
    images: ["https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop"],
    status: "In Progress",
    priority: "High",
    department: "Water Supply Board",
  },
  {
    title: "Overflowing Garbage Container in Gandhipuram",
    description: "The community garbage dump bin in Gandhipuram 4th street has not been cleared for 3 days and attracts stray animals.",
    category: "Garbage",
    locationText: "Cross Cut Road, Gandhipuram, Ward 15",
    location: { type: "Point", coordinates: [76.9642, 11.0181] },
    images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop"],
    status: "Resolved",
    priority: "Medium",
    department: "Sanitation & Solid Waste",
  },
  {
    title: "Broken Streetlight Pole near Brookefields",
    description: "Streetlight #ST-402 is flickering and the pole base is rusted, posing potential danger during high winds.",
    category: "Electricity",
    locationText: "Krishnaswamy Road, Ward 9, Coimbatore",
    location: { type: "Point", coordinates: [76.9531, 11.0084] },
    images: ["https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop"],
    status: "Pending",
    priority: "Low",
    department: "Electrical Works",
  },
  {
    title: "Open Stormwater Drain without Concrete Slab",
    description: "Dangerously exposed drainage trench near school zone. Children and pedestrians are at risk during rainy days.",
    category: "Surroundings",
    locationText: "RS Puram West, Ward 18, Coimbatore",
    location: { type: "Point", coordinates: [76.9482, 11.0045] },
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500&auto=format&fit=crop"],
    status: "In Progress",
    priority: "Critical",
    department: "Stormwater Drainage",
  },
  {
    title: "Uncollected Tree Trimming Debris",
    description: "Pruned branches from municipal tree trimming left blocking the sidewalk for over a week.",
    category: "Other",
    locationText: "TNP Nagar, Ward 31, Coimbatore",
    location: { type: "Point", coordinates: [76.9810, 11.0250] },
    images: [],
    status: "Pending",
    priority: "Low",
    department: "Parks & Forestry",
  }
];

const seedIssues = async () => {
  try {
    await connectDB();

    // Get or create a sample citizen reporter user
    let user = await User.findOne({ email: "citizen@fixmyward.gov.in" });
    if (!user) {
      user = await User.create({
        name: "Senthil Kumar",
        email: "citizen@fixmyward.gov.in",
        password: "password123",
        role: "citizen",
      });
    }

    const count = await Issue.countDocuments();
    if (count < 5) {
      const docs = sampleIssuesData.map((iss) => ({
        ...iss,
        reportedBy: user._id,
        upvotes: [user._id],
      }));
      await Issue.insertMany(docs);
      console.log(`✅ Seeded ${docs.length} sample civic issues successfully.`);
    } else {
      console.log(`ℹ️ Issue collection already has ${count} records.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding issues:", error.message);
    process.exit(1);
  }
};

seedIssues();
