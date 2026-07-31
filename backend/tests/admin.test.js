/**
 * 🧪 Admin Operations & RBAC Unit Tests
 */
export const runAdminTests = async (baseUrl, adminToken) => {
  console.log("  Running Admin Operations API Tests...");

  // 1. Protected Admin Profile Test
  const profileRes = await fetch(`${baseUrl}/api/admin/profile`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (profileRes.status !== 200) throw new Error(`Admin profile returned HTTP ${profileRes.status}`);

  // 2. Admin Issues Listing Test
  const issuesRes = await fetch(`${baseUrl}/api/admin/issues`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (issuesRes.status !== 200) throw new Error(`Admin issues returned HTTP ${issuesRes.status}`);

  console.log("  ✅ Admin Operations API Tests Passed!");
};
