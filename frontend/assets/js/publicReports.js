document.addEventListener("DOMContentLoaded", () => {

const profile = JSON.parse(localStorage.getItem("fmw_citizen_profile"));

if (!profile) {
    window.location.href = "../index.html";
    return;
}

const userMobile = profile.mobile;

const nameDisplay = document.getElementById("citizen-name-display");
const emailDisplay = document.getElementById("citizen-email-display");

if (nameDisplay) nameDisplay.textContent = profile.name;
if (emailDisplay) emailDisplay.textContent = profile.email;

const issuesContainer = document.getElementById("public-issues-list");
const noIssuesMsg = document.getElementById("no-public-issues");

navigator.geolocation.getCurrentPosition(
    position => {

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        loadNearbyIssues(userLat, userLng);

    },
    () => {
        alert("Location permission is required.");
    }
);



function loadNearbyIssues(userLat, userLng) {

    let issues = JSON.parse(localStorage.getItem("fmw_issues")) || [];

    const now = Date.now();

    issues = issues.filter(issue => {

        if (!issue.upvotes) issue.upvotes = [];

        if (issue.status === "Resolved") {

            const updated = new Date(issue.updatedAt).getTime();
            const diffHours = (now - updated) / (1000 * 60 * 60);

            if (diffHours > 48) return false;
        }

        const distance = getDistance(
            userLat,
            userLng,
            issue.lat,
            issue.lng
        );

        issue.distance = distance;

        return distance <= 5;
    });

    renderIssues(issues);
}



function renderIssues(issues) {

    issuesContainer.innerHTML = "";

    if (!issues.length) {
        noIssuesMsg.classList.remove("hidden");
        return;
    }

    noIssuesMsg.classList.add("hidden");

    issues.forEach(issue => {

        const hasVoted = issue.upvotes.includes(userMobile);

        const card = document.createElement("div");

        card.className =
        "bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2";

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
            data-id="${issue.id}">
            ${hasVoted ? 'Remove Vote' : '👍 Upvote'}
            </button>

        </div>
        `;

        issuesContainer.appendChild(card);
    });

    attachVoteHandlers();
}



function attachVoteHandlers() {

    const buttons = document.querySelectorAll(".upvote-btn");

    buttons.forEach(btn => {

        btn.addEventListener("click", () => {

            const issueId = btn.dataset.id;

            let issues = JSON.parse(localStorage.getItem("fmw_issues")) || [];

            const issue = issues.find(i => i.id === issueId);

            if (!issue) return;

            if (!issue.upvotes) issue.upvotes = [];

            const index = issue.upvotes.indexOf(userMobile);

            if (index === -1) {
                issue.upvotes.push(userMobile);
            } else {
                issue.upvotes.splice(index, 1);
            }

            localStorage.setItem("fmw_issues", JSON.stringify(issues));

            location.reload();
        });

    });

}



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



function statusStyle(status) {

    if (status === "Pending")
        return "bg-red-500/10 text-red-300 border-red-400/40";

    if (status === "In Progress")
        return "bg-yellow-500/10 text-yellow-300 border-yellow-400/40";

    if (status === "Resolved")
        return "bg-emerald-500/10 text-emerald-300 border-emerald-400/40";

    return "border-slate-700";
}

});