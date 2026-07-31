import dotenv from "dotenv";
import { runAuthTests } from "../tests/auth.test.js";
import { runIssueTests } from "../tests/issues.test.js";
import { runAdminTests } from "../tests/admin.test.js";

dotenv.config();

/**
 * 🧪 Centralized Master Test Runner
 */
async function runMasterTestSuite() {
  console.log("==========================================");
  console.log("🧪 FIX MY WARD — VERSION 11 TEST SUITE");
  console.log("==========================================\n");

  const baseUrl = "http://localhost:5000";

  try {
    // 1. Health Check Endpoint Test
    console.log("  Running System Health Check...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    if (healthRes.status !== 200) throw new Error(`Health check returned HTTP ${healthRes.status}`);
    const healthData = await healthRes.json();
    console.log(`  ✅ Health Status: ${healthData.status} (Uptime: ${healthData.uptime}, DB: ${healthData.database})\n`);

    // 2. Authentication Tests
    const { citizenToken, adminToken } = await runAuthTests(baseUrl);

    // 3. Issue Management Tests
    await runIssueTests(baseUrl);

    // 4. Admin Operations Tests
    await runAdminTests(baseUrl, adminToken);

    console.log("\n==========================================");
    console.log("🎉 ALL VERSION 11 TEST SUITES PASSED SUCCESSFULLY!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILURE:", error.message);
    process.exit(1);
  }
}

runMasterTestSuite();
