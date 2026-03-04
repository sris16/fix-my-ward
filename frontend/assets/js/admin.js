document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

const STORAGE_KEY = "fmw_issues";

function getIssues() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function loadDashboard() {
  const issues = getIssues();
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
        <select onchange="updateField('${issue.id}', 'status', this.value)"
          class="border rounded p-1">
          <option ${issue.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </td>
      <td class="p-2">
        <select onchange="updateField('${issue.id}', 'priority', this.value)"
          class="border rounded p-1">
          <option ${issue.priority === "Low" ? "selected" : ""}>Low</option>
          <option ${issue.priority === "Medium" ? "selected" : ""}>Medium</option>
          <option ${issue.priority === "High" ? "selected" : ""}>High</option>
        </select>
      </td>
      <td class="p-2">
        <input type="checkbox"
          ${issue.verified ? "checked" : ""}
          onchange="updateField('${issue.id}', 'verified', this.checked)">
      </td>
      <td class="p-2 text-sm text-gray-500">
        ${new Date(issue.createdAt).toLocaleDateString()}
      </td>
    `;

    table.appendChild(row);
  });
}

function updateField(id, field, value) {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id == id);

  if (index !== -1) {
    issues[index][field] = value;
    issues[index].updatedAt = new Date().toISOString();
    saveIssues(issues);
    loadDashboard();
  }
}

function applyFilters() {
  const issues = getIssues();

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
