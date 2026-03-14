// assets/js/publicReports.js

const API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {

const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

if (!profile) {
window.location.href = "../index.html";
return;
}

const userMobile = profile.mobile;

const issuesContainer = document.getElementById("public-issues-list");
const noIssuesMsg = document.getElementById("no-public-issues");


/* ===============================
GET USER LOCATION
================================ */

navigator.geolocation.getCurrentPosition(

position => {

const userLat = parseFloat(position.coords.latitude);
const userLng = parseFloat(position.coords.longitude);

console.log("User location:", userLat, userLng);

loadNearbyIssues(userLat,userLng);

},

() => {

console.warn("Location permission denied — loading without distance");

loadNearbyIssues(null,null);

}

);



/* ===============================
LOAD ISSUES FROM BACKEND
================================ */

async function loadNearbyIssues(userLat,userLng){

const res = await fetch(`${API}/issues`);
let issues = await res.json();

console.log("Issues from API:", issues);

const now = Date.now();

/* PROCESS ISSUES */

issues.forEach(issue => {

if(!issue.upvotes) issue.upvotes=[];

/* Hide resolved issues after 48 hours */

if(issue.status==="Resolved"){

const updated = new Date(issue.updatedAt).getTime();
const diffHours = (now - updated) / (1000*60*60);

if(diffHours>48){
issue.hidden = true;
return;
}

}

/* Distance calculation */

if(userLat && userLng && issue.lat && issue.lng){

const distance = getDistance(
parseFloat(userLat),
parseFloat(userLng),
parseFloat(issue.lat),
parseFloat(issue.lng)
);

issue.distance = distance;

}else{

issue.distance = 0;

}

});


/* ===============================
FILTER BY 10 KM
================================ */

issues = issues.filter(issue => {

if(issue.hidden) return false;

return issue.distance <= 10;

});


renderIssues(issues);

}



/* ===============================
RENDER ISSUES
================================ */

function renderIssues(issues){

issuesContainer.innerHTML="";

if(!issues.length){

noIssuesMsg.classList.remove("hidden");
return;

}

noIssuesMsg.classList.add("hidden");

issues.forEach(issue=>{

const hasVoted = issue.upvotes.includes(userMobile);

const card = document.createElement("div");

card.className =
"bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3";


/* IMAGE PREVIEW */

let imageHTML = "";

if(issue.photos && issue.photos.length){

imageHTML = `
<div class="grid grid-cols-4 gap-2">
${issue.photos.map(photo => `
<img src="${photo}"
class="w-full h-20 object-cover rounded-lg border border-slate-700">
`).join("")}
</div>
`;

}


/* ADDRESS */

const addressHTML = issue.locationText ? `
<p class="text-xs text-slate-400">
📍 ${issue.locationText}
</p>
` : "";


/* CARD */

card.innerHTML = `

<div class="flex justify-between">

<div>

<p class="font-semibold text-sm">${issue.title}</p>

<p class="text-xs text-slate-400">
${issue.category} • ${issue.distance.toFixed(2)} km away
</p>

</div>

<span class="text-[11px] px-2 py-1 rounded-lg border
${statusStyle(issue.status)}">

${issue.status}

</span>

</div>

${addressHTML}

${imageHTML}

<p class="text-xs text-slate-300">
${issue.description}
</p>

<div class="flex justify-between items-center pt-2">

<span class="text-xs text-slate-400">
👍 ${issue.upvotes.length} upvotes
</span>

<button
class="upvote-btn text-xs px-3 py-1 rounded-lg font-semibold
${hasVoted ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-900'}"
data-id="${issue._id}">

${hasVoted ? 'Remove Vote' : '👍 Upvote'}

</button>

</div>

`;

issuesContainer.appendChild(card);

});

attachVoteHandlers();

}



/* ===============================
UPVOTE HANDLER
================================ */

function attachVoteHandlers(){

const buttons=document.querySelectorAll(".upvote-btn");

buttons.forEach(btn=>{

btn.addEventListener("click",async ()=>{

const issueId = btn.dataset.id;

await fetch(`${API}/issues/upvote`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
issueId,
mobile:userMobile
})

});

location.reload();

});

});

}



/* ===============================
DISTANCE CALCULATION
================================ */

function getDistance(lat1,lon1,lat2,lon2){

const R=6371;

const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;

const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*
Math.sin(dLon/2);

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}



/* ===============================
STATUS STYLE
================================ */

function statusStyle(status){

if(status==="Pending")
return "bg-red-500/10 text-red-300 border-red-400/40";

if(status==="In Progress")
return "bg-yellow-500/10 text-yellow-300 border-yellow-400/40";

if(status==="Resolved")
return "bg-emerald-500/10 text-emerald-300 border-emerald-400/40";

return "border-slate-700";

}

});