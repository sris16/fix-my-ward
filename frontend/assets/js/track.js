// assets/js/track.js

document.addEventListener('DOMContentLoaded', () => {
  // ===============================
  // 1. Validate citizen profile
  // ===============================
  const storedProfile = localStorage.getItem('fmw_citizen_profile');
  if (!storedProfile) {
    alert('Please register as a citizen first.');
    window.location.href = '../index.html';
    return;
  }

  const profile = JSON.parse(storedProfile);

  // ===============================
  // 2. Header info
  // ===============================
  const badge = document.getElementById('citizen-badge');
  const nameDisplay = document.getElementById('citizen-name-display');
  const emailDisplay = document.getElementById('citizen-email-display');
  const greetingText = document.getElementById('greeting-text');

  if (badge && nameDisplay && emailDisplay) {
    badge.classList.remove('hidden');
    nameDisplay.textContent = profile.name;
    emailDisplay.textContent = profile.email;
  }

  if (greetingText) {
    greetingText.textContent = `Hello ${profile.name}, here are your reported issues`;
  }

  // ===============================
  // 3. Elements
  // ===============================
  const issuesList = document.getElementById('issues-list');
  const noIssues = document.getElementById('no-issues');
  const issueCount = document.getElementById('issue-count');
  const filterStatus = document.getElementById('filter-status');

  // ===============================
  // 4. Load issues
  // ===============================
  function loadIssues() {
    const allIssues = JSON.parse(localStorage.getItem('fmw_issues')) || [];

    // Only this citizen's issues
    const myIssues = allIssues.filter(
      issue => issue.citizen && issue.citizen.email === profile.email
    );

    renderIssues(myIssues);
  }

  // ===============================
  // 5. Render issues
  // ===============================
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

    // Latest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    filtered.forEach(issue => {
    const statusStyles = {
  'Pending': 'bg-red-500/10 text-red-300 border-red-400/40',
  'In Progress': 'bg-yellow-500/10 text-yellow-300 border-yellow-400/40',
  'Resolved': 'bg-emerald-500/10 text-emerald-300 border-emerald-400/40'
};


      const showDelete = issue.status === 'Resolved';

      const card = document.createElement('div');
      card.className = 'bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2';

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

          ${
            showDelete
              ? `<button
                   class="delete-btn px-3 py-1.5 text-[11px] rounded-lg
                          bg-red-500/10 text-red-300 border border-red-400/40
                          hover:bg-red-500/20"
                   data-id="${issue.id}">
                   🗑️ Delete
                 </button>`
              : ''
          }
        </div>
      `;

      issuesList.appendChild(card);
    });

    attachActions(filtered);
  }

  // ===============================
  // 6. Attach actions
  // ===============================
  function attachActions(issues) {
    // PDF
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const issue = issues.find(i => i.id == id);
        if (issue) generatePDF(issue);
      };
    });

    // Delete (only completed)
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const confirmDelete = confirm(
          'Are you sure you want to delete this completed issue?'
        );
        if (!confirmDelete) return;

        const allIssues = JSON.parse(localStorage.getItem('fmw_issues')) || [];
        const updated = allIssues.filter(issue => issue.id != id);
        localStorage.setItem('fmw_issues', JSON.stringify(updated));

        loadIssues();
      };
    });
  }

  // ===============================
  // 7. PDF Generator (WITH IMAGES)
  // ===============================
function generatePDF(issue) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  /* ===============================
     HEADER
  =============================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Fix My Ward", 20, y);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Civic Issue Report Document", 20, y + 6);

  pdf.line(20, y + 10, pageWidth - 20, y + 10);
  y += 18;

  /* ===============================
     REFERENCE INFO
  =============================== */

  pdf.setFontSize(11);

  pdf.text(`Reference ID: FM-${issue.id}`, 20, y); y += 6;
  pdf.text(`Citizen Name: ${issue.citizen.name}`, 20, y); y += 6;
  pdf.text(`Email: ${issue.citizen.email}`, 20, y); y += 6;
  pdf.text(`Reported On: ${new Date(issue.createdAt).toLocaleString()}`, 20, y); 
  y += 10;

  pdf.line(20, y, pageWidth - 20, y);
  y += 8;

  /* ===============================
     ISSUE SUMMARY SECTION
  =============================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Issue Summary", 20, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(`Category: ${issue.category}`, 20, y); y += 6;
  pdf.text(`Status: ${issue.status}`, 20, y); y += 6;
  pdf.text(`Priority: ${issue.priority}`, 20, y); 
  y += 10;

  /* ===============================
     DESCRIPTION SECTION
  =============================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Description", 20, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const descriptionLines = pdf.splitTextToSize(issue.description, 170);
  pdf.text(descriptionLines, 20, y);
  y += descriptionLines.length * 6 + 6;

  /* ===============================
     LOCATION SECTION
  =============================== */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Location Details", 20, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(issue.locationText || "Not specified", 20, y);
  y += 6;

  pdf.text(`Latitude: ${issue.lat}`, 20, y); y += 6;
  pdf.text(`Longitude: ${issue.lng}`, 20, y);
  y += 10;

  /* ===============================
     PHOTO SECTION
  =============================== */

  if (issue.photos && issue.photos.length) {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Submitted Evidence Photos", 20, y);
    y += 8;

    let x = 20;
    const imgSize = 40;

    issue.photos.forEach((img, index) => {

      if (y > 240) {
        pdf.addPage();
        y = 20;
        x = 20;
      }

      pdf.addImage(img, "JPEG", x, y, imgSize, imgSize);

      x += imgSize + 10;

      if (x > pageWidth - 50) {
        x = 20;
        y += imgSize + 10;
      }
    });

    y += imgSize + 10;
  }

  /* ===============================
     FOOTER
  =============================== */

  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(
    "This document was generated digitally by Fix My Ward Civic Reporting System.",
    20,
    285
  );

  pdf.save(`FixMyWard_Report_${issue.id}.pdf`);
}

  // ===============================
  // 8. Events
  // ===============================
  filterStatus.addEventListener('change', loadIssues);
  loadIssues();
});
