// assets/js/citizen.js

window.API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {

const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

if (!profile) {
window.location.href = "../index.html";
return;
}

/* ================= HEADER ================= */

const nameDisplay = document.getElementById("citizen-name-display");
const emailDisplay = document.getElementById("citizen-email-display");
const greetingText = document.getElementById("greeting-text");

if (nameDisplay) nameDisplay.textContent = profile.name;
if (emailDisplay) emailDisplay.textContent = profile.mobile;
if (greetingText) greetingText.textContent = `Hello ${profile.name}!`;

/* ================= CATEGORY ================= */

const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get("category") || "General";

const categoryDisplay = document.getElementById("selected-category-display");

if (categoryDisplay) {
categoryDisplay.textContent = selectedCategory;
}

/* ================= PLACEHOLDERS ================= */

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
"Describe the surroundings issue. Example: Garbage pile not cleared.";

}

}

/* ================= PHOTO UPLOAD ================= */

const photoInput = document.getElementById("issue-photo");
const previewContainer = document.getElementById("photo-preview");

let photoBase64Array = [];

if (photoInput && previewContainer) {

photoInput.addEventListener("change", () => {

const files = Array.from(photoInput.files);

if (files.length > 4) {
alert("Maximum 4 photos allowed.");
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

/* ================= ISSUE SUBMIT ================= */

const issueForm = document.getElementById("issue-form");

if (issueForm) {

issueForm.addEventListener("submit", async function (event) {

event.preventDefault();

const title = titleInput?.value.trim();
const description = descInput?.value.trim();

const locationText =
document.getElementById("issue-location-text")?.value.trim();

/* FIXED LOCATION FETCH */

const lat = parseFloat(document.getElementById("issue-lat")?.value);
const lng = parseFloat(document.getElementById("issue-lng")?.value);

if (!title || !description) {
alert("Please fill all required fields.");
return;
}

if (!lat || !lng) {
alert("Please select a location on the map.");
return;
}

try {

/* ================= LOAD ISSUES ================= */

const response = await fetch(`${API}/issues`);
const issues = await response.json();

/* ================= DUPLICATE DETECTION ================= */

const duplicate = issues.find(issue => {

const distance = getDistance(lat, lng, issue.lat, issue.lng);

return distance < 0.3 && issue.category === selectedCategory;

});

if (duplicate) {

const confirmUpvote = confirm(
"A similar issue already exists nearby.\n\nPress OK to upvote it.\nPress Cancel to submit your own report."
);

if (confirmUpvote) {

await fetch(`${API}/issues/upvote`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
issueId: duplicate._id,
mobile: profile.mobile
})
});

alert("You upvoted the existing issue.");

window.location.href = "public-reports.html";

return;

}

}

/* ================= CREATE ISSUE ================= */

const newIssue = {

title,
category: selectedCategory,
description,

locationText,
lat,
lng,

photos: photoBase64Array,

citizen: {
name: profile.name,
mobile: profile.mobile
}

};

await fetch(`${API}/issues`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(newIssue)
});

window.location.href = "track.html";

} catch (error) {

console.error(error);
alert("Something went wrong while submitting the issue.");

}

});

}

});

/* ================= DISTANCE ================= */

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