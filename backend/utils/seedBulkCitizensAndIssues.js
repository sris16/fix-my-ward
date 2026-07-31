import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import connectDB from "../config/db.js";

dotenv.config();

// List of 5 specified citizen accounts
const citizenUsersData = [
  {
    name: "Jaisurya S",
    email: "jaisurya@fixmyward.gov.in",
    password: "jaisurya@123",
    phone: "+91 98421 10001",
    ward: "Ward 12 - Gandhipuram",
  },
  {
    name: "Nishal R",
    email: "nishal@fixmyward.gov.in",
    password: "nishal@123",
    phone: "+91 98421 10002",
    ward: "Ward 18 - RS Puram",
  },
  {
    name: "Niranjan S",
    email: "niranjan@fixmyward.gov.in",
    password: "niranjan@123",
    phone: "+91 98421 10003",
    ward: "Ward 24 - Race Course",
  },
  {
    name: "Naveen M K",
    email: "naveen@fixmyward.gov.in",
    password: "naveen@123",
    phone: "+91 98421 10004",
    ward: "Ward 31 - Peelamedu",
  },
  {
    name: "Santhosh Kumar S",
    email: "santhosh@fixmyward.gov.in",
    password: "santhosh@123",
    phone: "+91 98421 10005",
    ward: "Ward 15 - Saibaba Colony",
  },
];

// Base complaint templates across Road, Water, Surroundings, Garbage, Electricity
const issueTemplates = [
  // Road
  {
    title: "Severe Pothole Cluster near Traffic Signal",
    description: "Deep potholes have formed following recent rains, causing hazardous traffic congestion and rim damage to commuters.",
    category: "Road",
    department: "Roads & Infrastructure",
    images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop"],
  },
  {
    title: "Damaged Asphalt and Road Cave-in",
    description: "The road surface has caved in near the bus stop curb, creating an immediate hazard for two-wheelers during night hours.",
    category: "Road",
    department: "Roads & Infrastructure",
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500&auto=format&fit=crop"],
  },
  {
    title: "Missing Heavy Duty Concrete Manhole Cover",
    description: "An open manhole without a protective cover on the main lane poses a life-threatening danger to pedestrians.",
    category: "Road",
    department: "Roads & Infrastructure",
    images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop"],
  },
  {
    title: "Unmarked and Abrupt Speed Breaker",
    description: "Newly installed speed hump lacks reflective zebra painting and advance warning signs, causing abrupt vehicle braking.",
    category: "Road",
    department: "Roads & Infrastructure",
    images: [],
  },
  {
    title: "Eroded Road Shoulder near School Zone",
    description: "Soil erosion has left a 6-inch drop between the tar road edge and unpaved shoulder, endangering school buses.",
    category: "Road",
    department: "Roads & Infrastructure",
    images: [],
  },

  // Water
  {
    title: "High Pressure Municipal Pipe Leakage",
    description: "Potable drinking water pipeline burst is wasting thousands of liters daily onto the main street.",
    category: "Water",
    department: "Water Supply Board",
    images: ["https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop"],
  },
  {
    title: "Muddy and Contaminated Tap Water Supply",
    description: "Residential tap supply has turned brownish with heavy sediment odor for the past 48 hours.",
    category: "Water",
    department: "Water Supply Board",
    images: [],
  },
  {
    title: "Extremely Low Water Pressure in Public Line",
    description: "Municipal supply pressure is insufficient to reach ground floor tanks in the residential avenue.",
    category: "Water",
    department: "Water Supply Board",
    images: [],
  },
  {
    title: "Overflowing Underground Sluice Valve Chamber",
    description: "Water control valve box is submerged and leaking continuously into the storm drain.",
    category: "Water",
    department: "Water Supply Board",
    images: [],
  },
  {
    title: "Broken Public Drinking Water Hydrant Stand",
    description: "Public tap fixture base is cracked and gushing water incessantly near the park entrance.",
    category: "Water",
    department: "Water Supply Board",
    images: [],
  },

  // Surroundings / Drainage
  {
    title: "Clogged Stormwater Channel with Silt and Debris",
    description: "Heavy silt accumulation in the roadside canal is causing greywater overflow into residential gates.",
    category: "Surroundings",
    department: "Stormwater Drainage",
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500&auto=format&fit=crop"],
  },
  {
    title: "Exposed Drainage Trench without Slab Covers",
    description: "Uncovered stormwater canal running adjacent to the footpath poses severe risk during monsoon.",
    category: "Surroundings",
    department: "Stormwater Drainage",
    images: [],
  },
  {
    title: "Stagnant Water Pool Breeding Mosquitoes",
    description: "Large pool of standing water in vacant municipal plot has become a public health concern.",
    category: "Surroundings",
    department: "Sanitation & Solid Waste",
    images: [],
  },
  {
    title: "Overgrown Wild Vegetation Blocking Footpath",
    description: "Thorny bushes and weeds have completely overgrown the pedestrian walkway, forcing people onto the road.",
    category: "Surroundings",
    department: "Parks & Forestry",
    images: [],
  },
  {
    title: "Fallen Tree Branch Obstructing Lane",
    description: "Heavy tree limb snapped off during recent storm is blocking one full lane of vehicle traffic.",
    category: "Surroundings",
    department: "Parks & Forestry",
    images: [],
  },

  // Garbage
  {
    title: "Overflowing Dumper Bin in Commercial Zone",
    description: "Community waste bin has not been cleared for 3 days and is spilling garbage onto the roadway.",
    category: "Garbage",
    department: "Sanitation & Solid Waste",
    images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop"],
  },
  {
    title: "Illegal Waste Dumping along Canal Bank",
    description: "Commercial establishments are dumping plastic sacks and construction debris on the embankment.",
    category: "Garbage",
    department: "Sanitation & Solid Waste",
    images: [],
  },
  {
    title: "Irregular Door-to-Door Garbage Collection",
    description: "Sanitation vehicle has skipped morning domestic collection in this street for two consecutive days.",
    category: "Garbage",
    department: "Sanitation & Solid Waste",
    images: [],
  },
  {
    title: "Uncleaned Animal Carcass near Market Entrance",
    description: "Decomposing animal remains requiring urgent municipal sanitation team intervention.",
    category: "Garbage",
    department: "Sanitation & Solid Waste",
    images: [],
  },

  // Electricity
  {
    title: "Flickering and Non-Functional Streetlight",
    description: "Streetlight fixture #ST-892 is defective, leaving the intersection in complete darkness at night.",
    category: "Electricity",
    department: "Electrical Works",
    images: ["https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop"],
  },
  {
    title: "Rusted Electric Pole Leaning Dangerously",
    description: "Base of street lighting pole is severely corroded and tilting towards residential property.",
    category: "Electricity",
    department: "Electrical Works",
    images: [],
  },
  {
    title: "Low Hanging Power Cables across Street",
    description: "Overhead service cables are sagging below 8 feet, posing safety risk to tall vehicles.",
    category: "Electricity",
    department: "Electrical Works",
    images: [],
  },
  {
    title: "Sparking Electrical Distribution Box",
    description: "Feeder pillar box is emitting loud buzzing sounds and occasional sparks during peak load.",
    category: "Electricity",
    department: "Electrical Works",
    images: [],
  },
  {
    title: "Unbolted Live Fuse Junction Box Cover",
    description: "Ground-level street junction box door is dangling open, exposing live terminals near playground.",
    category: "Electricity",
    department: "Electrical Works",
    images: [],
  },
  {
    title: "Damaged Solar Streetlight Panel Unit",
    description: "Photovoltaic panel on public park light fixture is shattered and non-operational.",
    category: "Electricity",
    department: "Electrical Works",
    images: [],
  }
];

// Locations around Coimbatore Wards
const coimbatoreLocations = [
  { name: "Cross Cut Road, Ward 12, Gandhipuram, Coimbatore", coords: [76.9642, 11.0181] },
  { name: "Avinashi Road Signal, Ward 14, Coimbatore", coords: [76.9616, 11.0168] },
  { name: "DB Road, Ward 18, RS Puram, Coimbatore", coords: [76.9482, 11.0045] },
  { name: "Race Course Scheme Road, Ward 24, Coimbatore", coords: [76.9723, 11.0021] },
  { name: "NSR Road, Ward 15, Saibaba Colony, Coimbatore", coords: [76.9412, 11.0254] },
  { name: "Avinashi Main Road, Ward 31, Peelamedu, Coimbatore", coords: [76.9810, 11.0250] },
  { name: "Trichy Road, Ward 28, Ramanathapuram, Coimbatore", coords: [76.9954, 10.9982] },
  { name: "Sathy Road, Ward 10, Saravanampatti, Coimbatore", coords: [76.9921, 11.0789] },
  { name: "Palakkad Road, Ward 35, Ukkadam, Coimbatore", coords: [76.9588, 10.9891] },
  { name: "Mettupalayam Road, Ward 8, Thudiyalur, Coimbatore", coords: [76.9385, 11.0812] },
  { name: "Trichy Road, Ward 30, Singanallur, Coimbatore", coords: [77.0210, 10.9925] },
  { name: "Perur Main Road, Ward 20, Telungupalayam, Coimbatore", coords: [76.9312, 10.9912] },
  { name: "Vadavalli Main Road, Ward 22, Vadavalli, Coimbatore", coords: [76.9015, 11.0125] },
  { name: "Siruvani Main Road, Ward 38, Kovaipudur, Coimbatore", coords: [76.9245, 10.9412] },
  { name: "Pollachi Main Road, Ward 40, Eachanari, Coimbatore", coords: [76.9612, 10.9125] },
];

const statuses = ["Pending", "Verified", "Assigned", "In Progress", "Resolved"];
const priorities = ["Low", "Medium", "High", "Critical"];

const seedBulkData = async () => {
  try {
    await connectDB();
    console.log("🚀 Starting Bulk Citizen and Civic Complaint Seeding...\n");

    let totalUsersCreated = 0;
    let totalIssuesCreated = 0;

    for (const citizenData of citizenUsersData) {
      // 1. Create or retrieve Citizen User
      let user = await User.findOne({ email: citizenData.email });
      if (!user) {
        user = await User.create(citizenData);
        console.log(`👤 Created Citizen Account: ${user.name} (${user.email})`);
        totalUsersCreated++;
      } else {
        console.log(`ℹ️ Citizen Account Already Exists: ${user.name} (${user.email})`);
      }

      // 2. Generate exactly 25 issues for this user
      const existingUserIssueCount = await Issue.countDocuments({ reportedBy: user._id });
      const neededIssues = 25 - existingUserIssueCount;

      if (neededIssues > 0) {
        const newIssues = [];
        for (let i = 0; i < neededIssues; i++) {
          const template = issueTemplates[i % issueTemplates.length];
          const loc = coimbatoreLocations[(i + totalIssuesCreated) % coimbatoreLocations.length];
          const status = statuses[i % statuses.length];
          const priority = priorities[(i + Math.floor(i / 2)) % priorities.length];

          // Add subtle variation to location coordinates
          const lonVar = (Math.random() - 0.5) * 0.008;
          const latVar = (Math.random() - 0.5) * 0.008;

          newIssues.push({
            title: `${template.title} - Sector ${i + 1}`,
            description: `${template.description} Reported by resident ${user.name} for urgent municipal action.`,
            category: template.category,
            locationText: `${loc.name} (Ref #${i + 101})`,
            location: {
              type: "Point",
              coordinates: [loc.coords[0] + lonVar, loc.coords[1] + latVar],
            },
            images: template.images,
            status,
            priority,
            department: template.department,
            assignedOfficer: status === "Assigned" || status === "In Progress" || status === "Resolved" ? `Officer ${user.name.split(" ")[0]}` : "",
            verified: status !== "Pending",
            reportedBy: user._id,
            upvotes: [user._id],
            createdAt: new Date(Date.now() - (i * 3600 * 1000 * 4)), // spaced back in time
          });
        }

        await Issue.insertMany(newIssues);
        console.log(`  ✅ Added ${newIssues.length} civic complaint issues for ${user.name}. (Total for user: 25)`);
        totalIssuesCreated += newIssues.length;
      } else {
        console.log(`  ℹ️ User ${user.name} already has ${existingUserIssueCount} issues logged.`);
      }
    }

    // Print final database summary verification
    const finalAdminCount = await User.countDocuments({ role: "admin" });
    const finalCitizenCount = await User.countDocuments({ role: "citizen" });
    const finalIssueCount = await Issue.countDocuments();

    console.log("\n=======================================================");
    console.log("🎉 DATABASE BULK SEEDING & VERIFICATION COMPLETE!");
    console.log("=======================================================");
    console.log(`  • Total Citizens in Database : ${finalCitizenCount}`);
    console.log(`  • Total Admins in Database   : ${finalAdminCount}`);
    console.log(`  • Total Issues in Database   : ${finalIssueCount}`);
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Bulk seeding failed:", error.message);
    process.exit(1);
  }
};

seedBulkData();
