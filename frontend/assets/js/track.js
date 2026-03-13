const API = "http://localhost:5000/api";

let allIssues = [];

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
allIssues = await response.json();

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


/* STATUS FILTER */

filterStatus.addEventListener("change", () => {

let filtered = [...allIssues];

if (filterStatus.value !== "all") {

filtered = filtered.filter(issue =>
issue.status === filterStatus.value
);

}

const storedProfile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

filtered = filtered.filter(issue =>
issue.citizen &&
String(issue.citizen.mobile).trim() === String(storedProfile.mobile).trim()
);

renderIssues(filtered);

});


/* RENDER ISSUES */

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
"bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4";


/* PHOTO GALLERY */

let photosHTML = "";

if (issue.photos && issue.photos.length > 0) {

photosHTML = `<div class="grid grid-cols-2 gap-2 pt-2">`;

issue.photos.forEach(photo => {

photosHTML += `
<img
src="${photo}"
class="w-full h-32 object-cover rounded-lg border border-slate-800"
/>
`;

});

photosHTML += `</div>`;

}


/* STATUS TRACKER */

const stages = ["Pending","Verified","In Progress","Resolved"];

let currentStage = 0;

if(issue.status === "Pending") currentStage = 0;
if(issue.verified) currentStage = 1;
if(issue.status === "In Progress") currentStage = 2;
if(issue.status === "Resolved") currentStage = 3;

let trackerCircles = "";

stages.forEach((stage, index) => {

const filled = index <= currentStage ? "bg-emerald-500" : "bg-slate-700";

trackerCircles += `
<div class="flex flex-col items-center flex-1">
<div class="w-3 h-3 rounded-full ${filled}"></div>
<p class="text-[10px] text-slate-400 mt-1">${stage}</p>
</div>
`;

});

const trackerHTML = `
<div class="pt-2">
<div class="flex items-center gap-1">
${trackerCircles}
</div>
</div>
`;


card.innerHTML = `

<div class="flex justify-between items-start">

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

<div class="text-[11px] text-slate-400">
📍 ${issue.locationText || "GPS Location"}
</div>

${trackerHTML}

${photosHTML}

<div class="flex gap-2 pt-3">

<button
class="download-btn text-[11px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700"
data-id="${issue._id}">
Download PDF
</button>

${
issue.status === "Resolved"
? `<button
class="delete-btn text-[11px] px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700"
data-id="${issue._id}">
Delete
</button>`
: ""
}

</div>

`;

issuesList.appendChild(card);

});

}

});



/* PDF GENERATOR */

function generatePDF(issue) {

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

doc.setFontSize(18);
doc.text("Fix My Ward", 20, 20);

doc.setFontSize(12);
doc.text("Citizen Issue Report", 20, 30);

doc.line(20, 35, 190, 35);

doc.text(`Citizen Name: ${issue.citizen.name}`, 20, 50);
doc.text(`Mobile: ${issue.citizen.mobile}`, 20, 60);

doc.text(`Issue Title: ${issue.title}`, 20, 75);
doc.text(`Category: ${issue.category}`, 20, 85);
doc.text(`Status: ${issue.status}`, 20, 95);

doc.text(`Location: ${issue.locationText || "N/A"}`, 20, 105);

doc.text(
`Reported: ${new Date(issue.createdAt).toLocaleString()}`,
20,
115
);

doc.text("Description:", 20, 130);

doc.setFontSize(11);
doc.text(issue.description || "N/A", 20, 140, { maxWidth: 170 });


if (issue.photos && issue.photos.length > 0) {

issue.photos.forEach((photo, index) => {

doc.addPage();

doc.setFontSize(16);
doc.text(`Evidence Photo ${index + 1}`, 20, 20);

doc.addImage(
photo,
"JPEG",
20,
40,
160,
100
);

});

}

doc.save(`issue-${issue._id}.pdf`);

}


/* BUTTON EVENTS */

document.addEventListener("click", async (e) => {

if (e.target.classList.contains("download-btn")) {

const id = e.target.dataset.id;

const response = await fetch(`${API}/issues`);
const issues = await response.json();

const issue = issues.find(i => i._id === id);

if (issue) {
generatePDF(issue);
}

}


if (e.target.classList.contains("delete-btn")) {

const id = e.target.dataset.id;

if (!confirm("Delete this resolved issue?")) return;

try {

const response = await fetch(`${API}/issues/${id}`, {
method: "DELETE",
headers: {
"Content-Type": "application/json"
}
});

const result = await response.json();

if (!response.ok) {
throw new Error(result.message);
}

alert("Issue deleted successfully");

location.reload();

} catch (error) {

console.error("Delete error:", error);
alert("Failed to delete issue");

}

}

});