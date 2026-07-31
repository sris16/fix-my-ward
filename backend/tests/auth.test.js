/**
 * 🧪 Authentication Unit & API Tests
 */
export const runAuthTests = async (baseUrl) => {
  console.log("  Running Auth API Tests...");

  // 1. Citizen Login Test
  const citRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "citizen@fixmyward.gov.in", password: "password123" }),
  });
  if (citRes.status !== 200) throw new Error(`Citizen login returned HTTP ${citRes.status}`);
  const citData = await citRes.json();
  if (!citData.token) throw new Error("Citizen login response missing JWT token");

  // 2. Admin Login Test
  const admRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@fixmyward.gov.in", password: "adminpassword123" }),
  });
  if (admRes.status !== 200) throw new Error(`Admin login returned HTTP ${admRes.status}`);
  const admData = await admRes.json();
  if (!admData.token) throw new Error("Admin login response missing JWT token");

  console.log("  ✅ Auth API Tests Passed!");
  return { citizenToken: citData.token, adminToken: admData.token };
};
