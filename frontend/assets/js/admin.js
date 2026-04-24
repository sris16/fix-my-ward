
// 🔐 AUTH CHECK
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "login.html";
}



let allIssues = [];

const API_URL = "http://localhost:5000/api/issues";

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname;

  if (page.includes("dashboard.html")) {
    loadDashboard();
  }

  if (page.includes("issues.html")) {
    loadIssuesPage();
  }

  if (page.includes("analytics.html")) {
    loadAnalyticsPage(); // Charts are on dashboard, so we can reuse that function
  }
});

// ================= FETCH =================
async function getIssues() {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(API_URL, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Fetch failed");

    return await res.json();

  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

// ================= LOAD =================
async function loadDashboard() {
  try {
    showLoader();

    allIssues = await getIssues();

    updateView(allIssues);
    populateCategoryFilter(allIssues);

  } catch (err) {
    showToast("Failed to load data", "error");
  } finally {
    hideLoader();
  }
}

// ================= VIEW UPDATE =================
function updateView(data) {
  renderStats(data);
  renderTable(data);
  renderCharts(data);
}

// ================= STATS =================
function renderStats(issues) {

  const totalEl = document.getElementById("totalCount");
  const pendingEl = document.getElementById("pendingCount");
  const progressEl = document.getElementById("progressCount");
  const resolvedEl = document.getElementById("resolvedCount");

  // ✅ STOP if elements not present (like in issues page)
  if (!totalEl || !pendingEl || !progressEl || !resolvedEl) return;

  totalEl.textContent = issues.length;

  pendingEl.textContent =
    issues.filter(i => i.status === "Pending").length;

  progressEl.textContent =
    issues.filter(i => i.status === "In Progress").length;

  resolvedEl.textContent =
    issues.filter(i => i.status === "Resolved").length;
}

// ================= CATEGORY FILTER =================
function populateCategoryFilter(issues) {
  const categorySelect = document.getElementById("categoryFilter");

  const categories = [...new Set(issues.map(i => i.category))];

  categorySelect.innerHTML = `<option value="">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ================= TABLE =================
function renderTable(issues) {
  const table = document.getElementById("issuesTable");
  table.innerHTML = "";

  if (issues.length === 0) {
    table.innerHTML = `
    <tr>
      <td colspan="8" class="text-center p-6 text-gray-500">
        📭 No issues found
      </td>
    </tr>
  `;
    return;
  }

  issues.forEach(issue => {
    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";
    row.style.cursor = "pointer";
    row.onclick = () => openModal(issue);

    // 🎨 STATUS BADGE
    let statusBadge = "";
    if (issue.status === "Pending") {
      statusBadge = `<span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Pending</span>`;
    } else if (issue.status === "In Progress") {
      statusBadge = `<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">In Progress</span>`;
    } else {
      statusBadge = `<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Resolved</span>`;
    }

    // 🎨 PRIORITY BADGE
    let priorityBadge = "";
    if (issue.priority === "High") {
      priorityBadge = `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700">High</span>`;
    } else if (issue.priority === "Normal") {
      priorityBadge = `<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Normal</span>`;
    } else {
      priorityBadge = `<span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Low</span>`;
    }

    // 🎨 VERIFIED BADGE
    const verifiedBadge = issue.verified
      ? `<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Verified</span>`
      : `<span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">Not Verified</span>`;

    row.innerHTML = `
      <td class="p-3">${issue.title}</td>
      <td class="p-3">${issue.citizen?.name || "N/A"}</td>
      <td class="p-3">${issue.category}</td>

      <!-- Department -->
      <td class="p-3">
        <select onclick="event.stopPropagation()"
          onchange="updateField('${issue._id}', 'department', this.value)"
          class="border rounded p-1">
          <option value="">Unassigned</option>
          <option ${issue.department === "Road Maintenance" ? "selected" : ""}>Road Maintenance</option>
          <option ${issue.department === "Water Supply" ? "selected" : ""}>Water Supply</option>
          <option ${issue.department === "Sanitation" ? "selected" : ""}>Sanitation</option>
          <option ${issue.department === "Electrical" ? "selected" : ""}>Electrical</option>
          <option ${issue.department === "Public Works" ? "selected" : ""}>Public Works</option>
        </select>
      </td>

      <!-- STATUS -->
      <td class="p-3">
        <div class="flex items-center gap-2">
          ${statusBadge}
          <select onclick="event.stopPropagation()"
            onchange="updateField('${issue._id}', 'status', this.value)"
            class="border rounded p-1 text-sm">
            <option ${issue.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
        </div>
      </td>

      <!-- PRIORITY -->
      <td class="p-3">
        <div class="flex items-center gap-2">
          ${priorityBadge}
          <select onclick="event.stopPropagation()"
            onchange="updateField('${issue._id}', 'priority', this.value)"
            class="border rounded p-1 text-sm">
            <option ${issue.priority === "Low" ? "selected" : ""}>Low</option>
            <option ${issue.priority === "Normal" ? "selected" : ""}>Normal</option>
            <option ${issue.priority === "High" ? "selected" : ""}>High</option>
          </select>
        </div>
      </td>

      <!-- VERIFIED -->
      <td class="p-3">
        <div class="flex items-center gap-2">
          ${verifiedBadge}
          <input type="checkbox"
            onclick="event.stopPropagation()"
            ${issue.verified ? "checked" : ""}
            onchange="updateField('${issue._id}', 'verified', this.checked)">
        </div>
      </td>

      <td class="p-3 text-sm text-gray-500">
        ${new Date(issue.createdAt).toLocaleDateString()}
      </td>
    `;

    table.appendChild(row);
  });
}

// ================= UPDATE =================
async function updateField(id, field, value) {
  try {
    const token = localStorage.getItem("adminToken");

    showLoader();

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ [field]: value })
    });

    if (!res.ok) throw new Error();

    showToast("Updated successfully");

    loadDashboard();

  } catch (err) {
    showToast("Update failed", "error");
  } finally {
    hideLoader();
  }
}

// ================= SEARCH =================
function applySearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allIssues.filter(i =>
    i.title?.toLowerCase().includes(q) ||
    i.description?.toLowerCase().includes(q) ||
    i.locationText?.toLowerCase().includes(q) ||
    i.citizen?.name?.toLowerCase().includes(q) ||
    i.citizen?.mobile?.includes(q)
  );

  updateView(filtered);
}

// ================= FILTER =================
function applyFilters() {
  const status = document.getElementById("statusFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const priority = document.getElementById("priorityFilter").value;

  const filtered = allIssues.filter(i =>
    (!status || i.status === status) &&
    (!category || i.category === category) &&
    (!priority || i.priority === priority)
  );

  updateView(filtered);
}

// ================= CHARTS =================
let statusChart, categoryChart;

function renderCharts(issues) {

  // ✅ ADD THIS BLOCK (VERY IMPORTANT)
  const statusCanvas = document.getElementById("statusChart");
  const categoryCanvas = document.getElementById("categoryChart");

  if (!statusCanvas || !categoryCanvas) return;

  // ================= EXISTING CODE =================
  if (statusChart) statusChart.destroy();
  if (categoryChart) categoryChart.destroy();

  // STATUS
  const statusCounts = {
    Pending: 0,
    "In Progress": 0,
    Resolved: 0
  };

  issues.forEach(i => statusCounts[i.status]++);

  const statusCtx = statusCanvas.getContext("2d");

  statusChart = new Chart(statusCtx, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ["#facc15", "#3b82f6", "#22c55e"]
      }]
    }
  });

  // CATEGORY
  const categoryCounts = {};
  issues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const categoryCtx = categoryCanvas.getContext("2d");

  categoryChart = new Chart(categoryCtx, {
    type: "bar",
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{
        label: "Issues",
        data: Object.values(categoryCounts),
        backgroundColor: "#6366f1"
      }]
    }
  });
}

// ================= MODAL =================
function openModal(issue) {
  const modal = document.getElementById("issueModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <div>
        <h2 class="text-xl font-semibold">${issue.title}</h2>
        <p class="text-sm text-gray-500">${issue.category} • ${new Date(issue.createdAt).toLocaleString()}</p>
      </div>
      <button onclick="closeModal()" class="text-red-500 text-lg font-bold hover:text-red-700">✕</button>
    </div>

    <!-- MAIN GRID -->
    <div class="grid md:grid-cols-2 gap-4">

      <!-- LEFT: DETAILS -->
      <div class="space-y-3">

        <div class="bg-gray-50 p-3 rounded">
          <p class="text-sm text-gray-500">Description</p>
          <p class="text-gray-800">${issue.description}</p>
        </div>

        <div class="bg-gray-50 p-3 rounded">
          <p class="text-sm text-gray-500">Location</p>
          <p class="text-gray-800">${issue.locationText || "N/A"}</p>
        </div>

        <div class="bg-gray-50 p-3 rounded">
          <p class="text-sm text-gray-500">Citizen</p>
          <p class="text-gray-800">
            ${issue.citizen?.name || "N/A"} 
            <span class="text-gray-500">(${issue.citizen?.mobile || "-"})</span>
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">

          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-500">Status</p>
            <p class="font-medium">${issue.status}</p>
          </div>

          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-500">Priority</p>
            <p class="font-medium">${issue.priority}</p>
          </div>

          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-500">Department</p>
            <p class="font-medium">${issue.department || "Unassigned"}</p>
          </div>

          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-500">Verified</p>
            <p class="font-medium">${issue.verified ? "Yes" : "No"}</p>
          </div>

        </div>

      </div>

      <!-- RIGHT: MAP -->
      <div>
        <p class="text-sm text-gray-500 mb-2">Location Map</p>
        <div id="modalMap" class="h-64 rounded border shadow-sm"></div>
      </div>

    </div>

    <!-- IMAGES -->
    <div class="mt-5">
      <p class="text-sm text-gray-500 mb-2">Photos</p>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        ${issue.photos?.length
      ? issue.photos.map(img => `
                <img 
                  src="${img}" 
                  class="rounded border h-32 w-full object-cover hover:scale-105 transition cursor-pointer"
                >
              `).join("")
      : "<p class='text-gray-500'>No images available</p>"
    }
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Map render
  setTimeout(() => {
    if (window.modalMapInstance) {
      window.modalMapInstance.remove();
    }

    window.modalMapInstance = L.map("modalMap").setView(
      [issue.lat, issue.lng],
      15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(window.modalMapInstance);

    L.marker([issue.lat, issue.lng]).addTo(window.modalMapInstance);

  }, 200);
}

// ================= CLOSE MODAL =================
function closeModal() {
  document.getElementById("issueModal").classList.add("hidden");

  if (window.modalMapInstance) {
    window.modalMapInstance.remove();
    window.modalMapInstance = null;
  }
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

// ================= TOAST =================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.className =
    "fixed top-5 right-5 px-4 py-2 rounded shadow-lg z-50 text-white " +
    (type === "success" ? "bg-green-600" : "bg-red-600");

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// ================= LOADER =================
function showLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("hidden");
}

async function loadIssuesPage() {
  try {
    showLoader();

    allIssues = await getIssues();

    updateView(allIssues);
    populateCategoryFilter(allIssues);

  } catch (err) {
    console.error(err);
    showToast("Failed to load issues", "error");
  } finally {
    hideLoader();
  }
}

async function loadAnalyticsPage() {
  try {
    showLoader();

    allIssues = await getIssues();

    renderCharts(allIssues);

  } catch (err) {
    showToast("Failed to load analytics", "error");
  } finally {
    hideLoader();
  }
}

async function changePassword() {
  const password = document.getElementById("newPassword").value;

  if (!password) {
    showToast("Enter password", "error");
    return;
  }

  showToast("Password updated (demo)", "success");
}