// assets/js/track.js

document.addEventListener('DOMContentLoaded', () => {

/* ===============================
   PROFILE VALIDATION
================================ */

const storedProfile = localStorage.getItem('fmw_citizen_profile');

if (!storedProfile) {
alert('Please register first.');
window.location.href = '../index.html';
return;
}

const profile = JSON.parse(storedProfile);


/* ===============================
   HEADER INFO
================================ */

const badge = document.getElementById('citizen-badge');
const nameDisplay = document.getElementById('citizen-name-display');
const emailDisplay = document.getElementById('citizen-email-display');
const greetingText = document.getElementById('greeting-text');

if (badge) badge.classList.remove('hidden');

if (nameDisplay) nameDisplay.textContent = profile.name;
if (emailDisplay) emailDisplay.textContent = profile.email;

if (greetingText)
greetingText.textContent = `Hello ${profile.name}, here are your reported issues`;


/* ===============================
   ELEMENTS
================================ */

const issuesList = document.getElementById('issues-list');
const noIssues = document.getElementById('no-issues');
const issueCount = document.getElementById('issue-count');
const filterStatus = document.getElementById('filter-status');


/* ===============================
   LOAD ISSUES
================================ */

function loadIssues() {

const allIssues = JSON.parse(localStorage.getItem('fmw_issues')) || [];

const myIssues = allIssues.filter(
issue => issue.citizen?.mobile === profile.mobile
);

renderIssues(myIssues);

}


/* ===============================
   RENDER ISSUES
================================ */

function renderIssues(issues) {

issuesList.innerHTML = '';

const statusFilter = filterStatus.value;

const filtered = issues.filter(issue =>
statusFilter === 'all' ? true : issue.status === statusFilter
);

issueCount.textContent = filtered.length;

if (!filtered.length) {
noIssues.classList.remove('hidden');
return;
} else {
noIssues.classList.add('hidden');
}


/* ===============================
   SORT BY PRIORITY
================================ */

const priorityOrder = {
"Critical": 4,
"High": 3,
"Medium": 2,
"Normal": 1
};

filtered.sort((a,b)=>
(priorityOrder[b.priority]||1) - (priorityOrder[a.priority]||1)
);


/* ===============================
   RENDER CARDS
================================ */

filtered.forEach(issue => {

const statusStyles = {
'Pending': 'bg-red-500/10 text-red-300 border-red-400/40',
'In Progress': 'bg-yellow-500/10 text-yellow-300 border-yellow-400/40',
'Resolved': 'bg-emerald-500/10 text-emerald-300 border-emerald-400/40'
};

const priorityStyles = {
'Critical': 'bg-red-600/20 text-red-400 border-red-500/40',
'High': 'bg-orange-500/20 text-orange-400 border-orange-400/40',
'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
'Normal': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
};

const showDelete = issue.status === 'Resolved';

const card = document.createElement('div');

card.className =
'bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2';


card.innerHTML = `

<div class="flex justify-between items-start">

<div>

<p class="text-sm font-semibold">${issue.title}</p>

<p class="text-[11px] text-slate-400">
${issue.category} • ${new Date(issue.createdAt).toLocaleString()}
</p>

</div>

<span class="px-2 py-1 text-[10px] rounded-full border ${statusStyles[issue.status]}">
${issue.status}
</span>

</div>


<div class="flex gap-2">

<span class="px-2 py-1 text-[10px] rounded-full border ${priorityStyles[issue.priority] || priorityStyles.Normal}">
${getPriorityIcon(issue.priority)} ${issue.priority || 'Normal'}
</span>

</div>


<p class="text-xs text-slate-300">${issue.description}</p>


<div class="flex justify-between text-[11px] text-slate-400">

<span>📍 ${issue.locationText || 'Not specified'}</span>

<span>🖼️ ${issue.photos?.length || 0} photo(s)</span>

</div>


<div class="flex gap-2 pt-2">

<button
class="download-btn px-3 py-1.5 text-[11px] rounded-lg
bg-slate-800 border border-slate-700 hover:bg-slate-700"
data-id="${issue.id}">
📄 Download PDF
</button>

${showDelete ? `
<button
class="delete-btn px-3 py-1.5 text-[11px] rounded-lg
bg-red-500/10 text-red-300 border border-red-400/40
hover:bg-red-500/20"
data-id="${issue.id}">
🗑️ Delete
</button>
` : ''}

</div>

`;

issuesList.appendChild(card);

});


attachActions(filtered);

}


/* ===============================
   PRIORITY ICON
================================ */

function getPriorityIcon(priority){

if(priority==="Critical") return "🔥";
if(priority==="High") return "⚠";
if(priority==="Medium") return "🟡";
return "🟢";

}


/* ===============================
   ACTION BUTTONS
================================ */

function attachActions(issues){

document.querySelectorAll('.download-btn').forEach(btn=>{

btn.onclick=()=>{

const id=btn.dataset.id;
const issue=issues.find(i=>i.id==id);

if(issue) generatePDF(issue);

};

});


document.querySelectorAll('.delete-btn').forEach(btn=>{

btn.onclick=()=>{

const id=btn.dataset.id;

if(!confirm("Delete this resolved issue?")) return;

const allIssues=JSON.parse(localStorage.getItem('fmw_issues'))||[];

const updated=allIssues.filter(issue=>issue.id!=id);

localStorage.setItem('fmw_issues',JSON.stringify(updated));

loadIssues();

};

});

}


/* ===============================
   PDF GENERATOR
================================ */

function generatePDF(issue){

const { jsPDF } = window.jspdf;

const pdf=new jsPDF();

let y=20;

pdf.setFontSize(16);
pdf.text('Fix My Ward – Civic Issue Report',20,y);
y+=12;

pdf.setFontSize(11);

pdf.text(`Reference ID: FM-${issue.id}`,20,y); y+=7;
pdf.text(`Citizen: ${issue.citizen.name}`,20,y); y+=7;
pdf.text(`Email: ${issue.citizen.email}`,20,y); y+=7;

pdf.text(`Category: ${issue.category}`,20,y); y+=7;

pdf.text(`Priority: ${issue.priority}`,20,y); y+=7;

pdf.text(`Status: ${issue.status}`,20,y); y+=7;

pdf.text(`Reported On: ${new Date(issue.createdAt).toLocaleString()}`,20,y);

y+=10;

pdf.text('Description:',20,y);
y+=6;

pdf.text(issue.description,20,y,{maxWidth:170});

pdf.save(`FixMyWard_Report_${issue.id}.pdf`);

}


/* ===============================
   INIT
================================ */

filterStatus.addEventListener('change',loadIssues);

loadIssues();

});