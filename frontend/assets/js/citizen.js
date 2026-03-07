// assets/js/citizen.js

document.addEventListener("DOMContentLoaded", () => {

/* ======================================================
   PROFILE CHECK
====================================================== */

const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

if (!profile) {
window.location.href = "../index.html";
return;
}


/* ======================================================
   HEADER INFO
====================================================== */

const nameDisplay = document.getElementById("citizen-name-display");
const emailDisplay = document.getElementById("citizen-email-display");
const greetingText = document.getElementById("greeting-text");

if (nameDisplay) nameDisplay.textContent = profile.name;
if (emailDisplay) emailDisplay.textContent = profile.email;
if (greetingText) greetingText.textContent = `Hello ${profile.name}!`;



/* ======================================================
   CATEGORY FROM URL
====================================================== */

const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get("category") || "General";

const categoryDisplay = document.getElementById("selected-category-display");

if (categoryDisplay) categoryDisplay.textContent = selectedCategory;



/* ======================================================
   CATEGORY BASED PLACEHOLDER
====================================================== */

const titleInput = document.getElementById("issue-title");
const descInput = document.getElementById("issue-description");

if (titleInput && descInput) {

if (selectedCategory === "Water") {

titleInput.placeholder = "e.g. Water leakage near main pipeline";

descInput.placeholder =
"Describe the water issue. Example: Drainage overflow causing water stagnation.";

}

if (selectedCategory === "Surroundings") {

titleInput.placeholder = "e.g. Streetlight not working";

descInput.placeholder =
"Describe the surroundings issue. Example: Garbage pile not cleared for 3 days.";

}

}



/* ======================================================
   PHOTO UPLOAD
====================================================== */

const photoInput = document.getElementById("issue-photo");
const previewContainer = document.getElementById("photo-preview");

let photoBase64Array = [];

if (photoInput) {

photoInput.addEventListener("change", () => {

const files = Array.from(photoInput.files);

if (files.length > 4) {
alert("Maximum 4 photos allowed.");
photoInput.value = "";
return;
}

previewContainer.innerHTML = "";
photoBase64Array = [];

files.forEach(file => {

const reader = new FileReader();

reader.onload = function(e) {

photoBase64Array.push(e.target.result);

const img = document.createElement("img");

img.src = e.target.result;
img.className =
"w-20 h-20 object-cover rounded-lg border border-slate-700";

previewContainer.appendChild(img);

};

reader.readAsDataURL(file);

});

});

}



/* ======================================================
   ISSUE SUBMIT
====================================================== */

const issueForm = document.getElementById("issue-form");

if (!issueForm) return;

issueForm.addEventListener("submit", function (event) {

event.preventDefault();

const title = titleInput.value.trim();
const description = descInput.value.trim();

const locationText =
document.getElementById("issue-location-text").value.trim();

const lat = window.fmwMapState?.selectedLat;
const lng = window.fmwMapState?.selectedLng;

if (!title || !description) {
alert("Please fill all required fields.");
return;
}

if (!lat || !lng) {
alert("Please select a location on the map.");
return;
}


let issues = JSON.parse(localStorage.getItem("fmw_issues")) || [];


/* ======================================================
   STEP 7 — DUPLICATE DETECTION
====================================================== */

const duplicate = issues.find(issue => {

const distance = getDistance(lat, lng, issue.lat, issue.lng);

const sameCategory = issue.category === selectedCategory;

return distance < 0.3 && sameCategory;

});

if (duplicate) {

const confirmUpvote = confirm(
"A similar issue already exists nearby.\n\nPress OK to upvote it.\nPress Cancel to submit your own report."
);

if (confirmUpvote) {

const email = profile.email;

if (!duplicate.upvotes) duplicate.upvotes = [];

if (!duplicate.upvotes.includes(email)) {
duplicate.upvotes.push(email);
}

localStorage.setItem("fmw_issues", JSON.stringify(issues));

alert("You have upvoted the existing issue.");

window.location.href = "public-reports.html";

return;

}

}



/* ======================================================
   STEP 8 — PRIORITY ENGINE
====================================================== */

const priority = calculatePriority(issues, lat, lng);


/* ======================================================
   CREATE NEW ISSUE
====================================================== */

const newIssue = {

id: "ISSUE-" + Date.now(),

citizen: {
name: profile.name,
mobile: profile.mobile,
},

title,
category: selectedCategory,
description,

locationText,
lat,
lng,

photos: photoBase64Array,

status: "Pending",
priority: priority,

department: null,
verified: false,

upvotes: [],

createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString()

};

issues.push(newIssue);

localStorage.setItem("fmw_issues", JSON.stringify(issues));

window.location.href = "track.html";

});

});



/* ======================================================
   DISTANCE FUNCTION
====================================================== */

function getDistance(lat1, lon1, lat2, lon2) {

const R = 6371;

const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;

const a =
Math.sin(dLat/2) * Math.sin(dLat/2) +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2) *
Math.sin(dLon/2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

return R * c;

}



/* ======================================================
   STEP 8 — PRIORITY CALCULATOR
====================================================== */

function calculatePriority(issues, lat, lng) {

let nearbyVotes = 0;

issues.forEach(issue => {

const distance = getDistance(lat, lng, issue.lat, issue.lng);

if (distance < 1) {
nearbyVotes += issue.upvotes?.length || 0;
}

});

if (nearbyVotes > 20) return "Critical";

if (nearbyVotes > 10) return "High";

if (nearbyVotes > 5) return "Medium";

return "Normal";

}