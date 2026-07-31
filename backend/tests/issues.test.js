/**
 * 🧪 Issue Management Unit & API Tests
 */
export const runIssueTests = async (baseUrl) => {
  console.log("  Running Issues API Tests...");

  // 1. Fetch Public Issues Test
  const publicRes = await fetch(`${baseUrl}/api/issues`);
  if (publicRes.status !== 200) throw new Error(`Public issues API returned HTTP ${publicRes.status}`);
  const publicData = await publicRes.json();
  if (!Array.isArray(publicData.data || publicData.issues || publicData)) {
    throw new Error("Public issues API did not return an array");
  }

  console.log("  ✅ Issues API Tests Passed!");
};
