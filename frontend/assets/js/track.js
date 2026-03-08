const API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {

const storedProfile = localStorage.getItem("fmw_citizen_profile");

if (!storedProfile) {
alert("Please register first.");
window.location.href = "../index.html";
return;
}

const profile = JSON.parse(storedProfile);

const issuesList = document.getElementById("issues-list");
const noIssues = document.getElementById("no-issues");
const issueCount = document.getElementById("issue-count");
const filterStatus = document.getElementById("filter-status");

try {

const response = await fetch(`${API}/issues`);
const allIssues = await response.json();

/* ================= SAFE FILTER ================= */

const myIssues = allIssues.filter(issue => {

if (!issue.citizen) return false;

const issueMobile = String(issue.citizen.mobile).trim();
const userMobile = String(profile.mobile).trim();

return issueMobile === userMobile;

});

renderIssues(myIssues);

} catch (error) {

console.error(error);
alert("Failed to load reports");

}


/* ================= RENDER FUNCTION ================= */

function renderIssues(issues) {

issuesList.innerHTML = "";

if (!issues.length) {
noIssues.classList.remove("hidden");
issueCount.textContent = 0;
return;
}

noIssues.classList.add("hidden");
issueCount.textContent = issues.length;

issues.forEach(issue => {

const card = document.createElement("div");

card.className =
"bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2";

card.innerHTML = `

<div class="flex justify-between">

<div>
<p class="text-sm font-semibold">${issue.title}</p>

<p class="text-xs text-slate-400">
${issue.category} • ${new Date(issue.createdAt).toLocaleString()}
</p>

</div>

<span class="text-[10px] px-2 py-1 rounded-lg border border-slate-700">
${issue.status}
</span>

</div>

<p class="text-xs text-slate-300">
${issue.description}
</p>

<div class="text-[11px] text-slate-400 flex justify-between">

<span>📍 ${issue.locationText || "Not specified"}</span>

<span>🖼️ ${issue.photos?.length || 0} photo(s)</span>

</div>

`;

issuesList.appendChild(card);

});

}

});