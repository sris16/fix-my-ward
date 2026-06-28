export const dashboardStats = {
  totalIssues: 1248,
  resolvedIssues: 812,
  inProgressIssues: 284,
  pendingIssues: 152,
  activeCitizens: 3420,
  averageResolutionTime: "4.2 Days",
  satisfactionScore: "92.4%",
  criticalIssues: 18
};

export const weeklyTrends = [
  { day: "Mon", reported: 45, resolved: 38 },
  { day: "Tue", reported: 52, resolved: 42 },
  { day: "Wed", reported: 68, resolved: 50 },
  { day: "Thu", reported: 58, resolved: 55 },
  { day: "Fri", reported: 72, resolved: 60 },
  { day: "Sat", reported: 35, resolved: 40 },
  { day: "Sun", reported: 28, resolved: 30 }
];

export const departmentDistribution = [
  { name: "Public Works & Roads", value: 42, color: "bg-orange-500", text: "text-orange-500" },
  { name: "Water Supply & Sewage", value: 28, color: "bg-blue-500", text: "text-blue-500" },
  { name: "Sanitation & Garbage", value: 20, color: "bg-emerald-500", text: "text-emerald-500" },
  { name: "Streetlights & Grid", value: 10, color: "bg-amber-500", text: "text-amber-500" }
];

export const recentActivities = [
  {
    id: "act-1",
    type: "issue_resolved",
    message: "Water supply pipeline leakage near Race Course Road has been resolved.",
    timestamp: "10 mins ago",
    user: "Water Authority Team B",
    avatar: "WA"
  },
  {
    id: "act-2",
    type: "issue_reported",
    message: "New Garbage Accumulation reported near Gandhipuram Bus Stand.",
    timestamp: "24 mins ago",
    user: "Rajesh Kumar (Citizen)",
    avatar: "RK"
  },
  {
    id: "act-3",
    type: "status_changed",
    message: "Pothole repair at Avinashi Road status changed to 'In Progress'.",
    timestamp: "45 mins ago",
    user: "Public Works Dept",
    avatar: "PW"
  },
  {
    id: "act-4",
    type: "citizen_joined",
    message: "New citizen Priya Dharshini registered in Ward 12.",
    timestamp: "1 hour ago",
    user: "Priya D. (Citizen)",
    avatar: "PD"
  }
];
