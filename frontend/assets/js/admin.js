document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

const API_URL = "http://localhost:5000/api/issues";

async function getIssues() {
  const response = await fetch(API_URL);
  const issues = await response.json();
  return issues;
}

async function loadDashboard() {
  const issues = await getIssues();

  renderStats(issues);
  populateCategoryFilter(issues);
  renderTable(issues);
}

function renderStats(issues) {
  document.getElementById("totalCount").textContent = issues.length;

  const pending = issues.filter(i => i.status === "Pending").length;
  const progress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("progressCount").textContent = progress;
  document.getElementById("resolvedCount").textContent = resolved;
}

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

function renderTable(issues) {
  const table = document.getElementById("issuesTable");
  table.innerHTML = "";

  issues.forEach(issue => {
    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";

   row.innerHTML = `
  <td class="p-2">${issue.title}</td>
  <td class="p-2">${issue.citizen?.name || "N/A"}</td>
  <td class="p-2">${issue.category}</td>

  <td class="p-2">
    <select onchange="updateField('${issue._id}', 'department', this.value)"
      class="border rounded p-1">
      <option value="">Unassigned</option>
      <option ${issue.department === "Road Maintenance" ? "selected" : ""}>Road Maintenance</option>
      <option ${issue.department === "Water Supply" ? "selected" : ""}>Water Supply</option>
      <option ${issue.department === "Sanitation" ? "selected" : ""}>Sanitation</option>
      <option ${issue.department === "Electrical" ? "selected" : ""}>Electrical</option>
      <option ${issue.department === "Public Works" ? "selected" : ""}>Public Works</option>
    </select>
  </td>

  <td class="p-2">
    <select onchange="updateField('${issue._id}', 'status', this.value)"
      class="border rounded p-1">
      <option ${issue.status === "Pending" ? "selected" : ""}>Pending</option>
      <option ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
      <option ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
    </select>
  </td>

  <td class="p-2">
    <select onchange="updateField('${issue._id}', 'priority', this.value)"
      class="border rounded p-1">
      <option ${issue.priority === "Low" ? "selected" : ""}>Low</option>
      <option ${issue.priority === "Normal" ? "selected" : ""}>Normal</option>
      <option ${issue.priority === "High" ? "selected" : ""}>High</option>
    </select>
  </td>

  <td class="p-2">
    <input type="checkbox"
      ${issue.verified ? "checked" : ""}
      onchange="updateField('${issue._id}', 'verified', this.checked)">
  </td>

  <td class="p-2 text-sm text-gray-500">
    ${new Date(issue.createdAt).toLocaleDateString()}
  </td>
`;

    table.appendChild(row);
  });
}

async function updateField(id, field, value) {
  try {

    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        [field]: value
      })
    });

    loadDashboard();

  } catch (error) {
    console.error("Update failed:", error);
  }
}

async function applyFilters() {
  const issues = await getIssues();

  const statusValue = document.getElementById("statusFilter").value;
  const categoryValue = document.getElementById("categoryFilter").value;
  const priorityValue = document.getElementById("priorityFilter").value;

  let filtered = issues;

  if (statusValue) {
    filtered = filtered.filter(i =>
      i.status?.toLowerCase().trim() === statusValue.toLowerCase().trim()
    );
  }

  if (categoryValue) {
    filtered = filtered.filter(i =>
      i.category?.toLowerCase().trim() === categoryValue.toLowerCase().trim()
    );
  }

  if (priorityValue) {
    filtered = filtered.filter(i =>
      i.priority?.toLowerCase().trim() === priorityValue.toLowerCase().trim()
    );
  }

  renderStats(filtered);
  renderTable(filtered);
}