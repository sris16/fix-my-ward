const API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {

const list = document.getElementById("notifications-list");

const storedProfile = localStorage.getItem("fmw_citizen_profile");

if (!storedProfile) {
alert("Please register first.");
window.location.href = "../index.html";
return;
}

const profile = JSON.parse(storedProfile);

try {

const response = await fetch(`${API}/issues`);
const issues = await response.json();

/* FILTER USER ISSUES */

const myIssues = issues.filter(issue => {

if (!issue.citizen) return false;

return String(issue.citizen.mobile).trim() === String(profile.mobile).trim();

});

const notifications = [];

myIssues.forEach(issue => {

if(issue.verified){

notifications.push({
message:`Your issue "${issue.title}" has been verified by authorities.`,
time:issue.updatedAt
});

}

if(issue.status === "In Progress"){

notifications.push({
message:`Work has started on your issue "${issue.title}".`,
time:issue.updatedAt
});

}

if(issue.status === "Resolved"){

notifications.push({
message:`Your issue "${issue.title}" has been resolved.`,
time:issue.updatedAt
});

}

});


renderNotifications(notifications);

}catch(error){

console.error(error);
list.innerHTML = `<p class="text-slate-400 text-sm">Failed to load notifications</p>`;

}

});


function renderNotifications(notifications){

const list = document.getElementById("notifications-list");

if(!notifications.length){

list.innerHTML = `
<p class="text-slate-400 text-sm">
No notifications yet.
</p>
`;

return;

}

list.innerHTML = "";

notifications.sort((a,b)=> new Date(b.time)-new Date(a.time));

notifications.forEach(n=>{

const card = document.createElement("div");

card.className =
"bg-slate-900 border border-slate-800 rounded-xl p-4";

card.innerHTML = `
<p class="text-sm">${n.message}</p>
<p class="text-xs text-slate-400 mt-1">
${new Date(n.time).toLocaleString()}
</p>
`;

list.appendChild(card);

});

}