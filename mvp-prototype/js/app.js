// ============================================================
// SANGAM MVP Prototype — App Logic
// ============================================================

let currentRole = ROLES.PM;
let currentView = "projects"; // start at project list
let currentProject = null;
let currentBatch = null;
let currentSupport = null;
let inProjectWorkspace = false; // are we inside a project?
let selectedSupports = new Set();
let sidebarCollapsed = false;
let tableFilters = {};
let tableSearch = "";
let tableSortCol = null;
let tableSortDir = "asc";
let activeStatusTab = "all";

// --- Init ---
function init() {
  currentRole = localStorage.getItem("sangam-role") || ROLES.PM;
  renderSidebar();
  renderTopBar();
  navigateTo("projects"); // always start at project selection
}

// --- Role Switching ---
function switchRole(role) {
  currentRole = role;
  localStorage.setItem("sangam-role", role);
  selectedSupports.clear();
  resetTableState();
  if (inProjectWorkspace) {
    // Stay in project, go to dashboard for new role
    renderSidebar();
    navigateTo("dashboard", { projectId: currentProject?.id });
  } else {
    renderSidebar();
    navigateTo("projects");
  }
}

function resetTableState() {
  selectedSupports.clear();
  tableFilters = {};
  tableSearch = "";
  tableSortCol = null;
  tableSortDir = "asc";
  activeStatusTab = "all";
}

// --- Navigation ---
function navigateTo(view, data) {
  currentView = view;
  if (data) {
    if (data.projectId) {
      currentProject = PROJECTS.find(p => p.id === data.projectId);
      inProjectWorkspace = true;
    }
    if (data.batchId) currentBatch = BATCHES.find(b => b.id === data.batchId);
    if (data.supportId) currentSupport = SUPPORTS.find(s => s.id === data.supportId);
  }
  if (view === "projects") {
    inProjectWorkspace = false;
    currentProject = null;
  }
  selectedSupports.clear();
  resetTableState();
  renderSidebar();
  renderTopBar();
  renderContent();
}

function enterProject(projectId) {
  navigateTo("dashboard", { projectId });
}

function exitProject() {
  navigateTo("projects");
}

// ============================================================
// REUSABLE DATA TABLE
// ============================================================

/**
 * DataTable config:
 * {
 *   id: string,
 *   columns: [{ key, label, width?, render?, sortable?, filterable? }],
 *   data: array,
 *   selectable: boolean,
 *   filters: [{ key, label, options: [{value, label}] }],
 *   searchKeys: [string],  // which keys to search
 *   actions: html string for top-right buttons,
 *   rowClick: function name string,
 *   emptyMessage: string,
 *   bulkActions: html string shown when items selected,
 * }
 */
function renderDataTable(config) {
  let filtered = [...config.data];

  // Apply status tabs
  if (config.statusTabs && activeStatusTab !== "all") {
    filtered = filtered.filter(row => row.status === activeStatusTab);
  }

  // Build tab counts from unfiltered data (before search/filters)
  let statusTabsHtml = "";
  if (config.statusTabs) {
    const tabCounts = { all: config.data.length };
    config.statusTabs.forEach(tab => {
      tabCounts[tab] = config.data.filter(r => r.status === tab).length;
    });
    statusTabsHtml = `
      <div class="status-tabs">
        <div class="status-tab ${activeStatusTab === 'all' ? 'active' : ''}" onclick="activeStatusTab='all';renderContent()">
          All <span class="tab-count">${tabCounts.all}</span>
        </div>
        ${config.statusTabs.map(tab => `
          <div class="status-tab ${activeStatusTab === tab ? 'active' : ''}" onclick="activeStatusTab='${tab}';renderContent()" style="--tab-color:${STATUS_COLORS[tab]}">
            <span class="status-dot" style="background:${STATUS_COLORS[tab]}"></span>
            ${tab} <span class="tab-count">${tabCounts[tab]}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Apply search
  if (tableSearch && config.searchKeys) {
    const q = tableSearch.toLowerCase();
    filtered = filtered.filter(row =>
      config.searchKeys.some(key => String(row[key] || "").toLowerCase().includes(q))
    );
  }

  // Apply filters
  Object.entries(tableFilters).forEach(([key, value]) => {
    if (value) {
      filtered = filtered.filter(row => String(row[key]) === value);
    }
  });

  // Apply sort
  if (tableSortCol) {
    filtered.sort((a, b) => {
      const av = a[tableSortCol] || "";
      const bv = b[tableSortCol] || "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return tableSortDir === "asc" ? cmp : -cmp;
    });
  }

  const allSelected = filtered.length > 0 && filtered.every(r => selectedSupports.has(r.id));
  const someSelected = selectedSupports.size > 0;

  return `
    <div class="card" id="dt-${config.id}">
      <div class="card-header">
        <h3>${config.title || ""} <span class="text-secondary text-sm" style="font-weight:400">(${filtered.length})</span></h3>
        <div class="btn-group">${config.actions || ""}</div>
      </div>

      ${statusTabsHtml}

      <!-- Search + Filters Bar -->
      <div class="dt-toolbar">
        <div class="dt-search">
          <input type="text" placeholder="Search..." value="${tableSearch}" oninput="tableSearch=this.value;renderContent()" />
        </div>
        <div class="dt-filters">
          ${(config.filters || []).map(f => `
            <select onchange="tableFilters['${f.key}']=this.value;renderContent()">
              <option value="">${f.label}</option>
              ${f.options.map(o => `<option value="${o.value}" ${tableFilters[f.key] === o.value ? 'selected' : ''}>${o.label}</option>`).join("")}
            </select>
          `).join("")}
        </div>
        <div class="dt-count text-sm text-secondary">${filtered.length} of ${config.data.length} items</div>
      </div>

      <!-- Bulk Action Bar -->
      ${someSelected && config.bulkActions ? `
        <div class="action-bar">
          <span class="selected-count">${selectedSupports.size} selected</span>
          <div class="btn-group">${config.bulkActions}</div>
        </div>
      ` : ""}

      <!-- Table -->
      ${filtered.length === 0 ? `<div class="empty-state"><h3>${config.emptyMessage || "No items"}</h3></div>` : `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                ${config.selectable ? `<th class="th-check"><input type="checkbox" ${allSelected ? 'checked' : ''} onchange="dtToggleAll(this, '${config.id}')" /></th>` : ""}
                ${config.columns.map(col => `
                  <th style="${col.width ? 'width:'+col.width : ''}" ${col.sortable !== false ? `class="th-sortable" onclick="dtSort('${col.key}')"` : ""}>
                    ${col.label}
                    ${tableSortCol === col.key ? (tableSortDir === "asc" ? " &#9650;" : " &#9660;") : ""}
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${filtered.map(row => `
                <tr class="${selectedSupports.has(row.id) ? 'selected' : ''}" ${config.rowClick ? `style="cursor:pointer"` : ""}>
                  ${config.selectable ? `<td class="td-check"><input type="checkbox" ${selectedSupports.has(row.id) ? 'checked' : ''} onchange="event.stopPropagation();toggleSupport('${row.id}')" /></td>` : ""}
                  ${config.columns.map(col => `
                    <td ${config.rowClick && !col.noRowClick ? `onclick="${config.rowClick}('${row.id}')"` : ""}>${col.render ? col.render(row) : (row[col.key] || "-")}</td>
                  `).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function dtToggleAll(checkbox, tableId) {
  // Get the current filtered data based on view
  const allData = getCurrentTableData();
  if (checkbox.checked) {
    allData.forEach(r => selectedSupports.add(r.id));
  } else {
    allData.forEach(r => selectedSupports.delete(r.id));
  }
  renderContent();
}

function getCurrentTableData() {
  // Return data based on current view
  const ps = getProjectSupports();
  const viewData = {
    assignment: () => ps.filter(s => s.status === SUPPORT_STATUS.READY_TO_ASSIGN),
    review: () => ps.filter(s => s.status === SUPPORT_STATUS.UNDER_REVIEW),
    "rejected-pool": () => ps.filter(s => s.status === SUPPORT_STATUS.NEEDS_REWORK || s.status === SUPPORT_STATUS.CLIENT_RETURNED),
    "send-to-client": () => ps.filter(s => s.status === SUPPORT_STATUS.APPROVED),
    "client-decisions": () => ps.filter(s => s.status === SUPPORT_STATUS.WITH_CLIENT),
    supports: () => ps,
  };
  return (viewData[currentView] || (() => []))();
}

function dtSort(colKey) {
  if (tableSortCol === colKey) {
    tableSortDir = tableSortDir === "asc" ? "desc" : "asc";
  } else {
    tableSortCol = colKey;
    tableSortDir = "asc";
  }
  renderContent();
}

function dtRowClick(id) {
  navigateTo("support-detail", { supportId: id });
}

// ============================================================
// HELPER RENDERERS
// ============================================================

function renderStatusBadge(row) {
  return `<span class="status-badge" style="background:${STATUS_COLORS[row.status]}">${row.status}</span>`;
}

function renderRevBadge(row) {
  return `<span class="revision-badge ${row.revisionType.toLowerCase()}">${row.revisionType}</span>`;
}

function renderFilePath(row) {
  return `<span class="file-path" onclick="event.stopPropagation();showToast('Opening ${row.tagId}.dwg in AutoCAD...','success')">${row.tagId}.dwg</span>`;
}

function renderMarkupPdf(row) {
  return row.markupPdfPath
    ? `<span class="file-path" onclick="event.stopPropagation();showToast('Opening markup PDF...','success')">View PDF</span>`
    : `<span class="text-secondary">-</span>`;
}

function renderAssignedTo(row) {
  return row.assignedTo || `<span class="text-secondary">Unassigned</span>`;
}

function getBatchLabel(row) {
  const b = BATCHES.find(b => b.id === row.batchId);
  return b ? b.name.split("_")[2] || b.name : row.batchId;
}

// All statuses for tabs
function allStatusTabs() {
  return Object.values(SUPPORT_STATUS);
}
function batchFilterOptions() {
  return BATCHES.map(b => ({ value: b.id, label: b.name.split("_").slice(1, 3).join("_") }));
}
function actioneeFilterOptions() {
  return USERS.filter(u => u.roles.includes(ROLES.ACTIONEE) || u.roles.includes(ROLES.QC))
    .map(u => ({ value: u.name, label: u.name }));
}

// --- Sidebar ---
function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isPM = currentRole === ROLES.PM;
  const isSME = currentRole === ROLES.SME;
  const isQC = currentRole === ROLES.QC;
  const isActionee = currentRole === ROLES.ACTIONEE;
  const roleLevel = ROLE_HIERARCHY[currentRole] || 0;

  let navItems = "";

  // Nav item helper with icon
  const ni = (view, icon, label, badge, views) => {
    const isActive = views ? views.includes(currentView) : currentView === view;
    return `<div class="nav-item ${isActive ? 'active' : ''}" onclick="navigateTo('${view}')"><span class="nav-icon">${icon}</span><span class="nav-label">${label}</span>${badge ? `<span class="count-badge">${badge}</span>` : ''}</div>`;
  };

  if (!inProjectWorkspace) {
    navItems = `
      <div class="nav-section">Select Project</div>
      ${ni('projects', '&#9776;', 'All Projects')}
      ${isPM ? ni('create-project', '&#43;', 'New Project') : ''}
    `;
  } else {
    const ps = getProjectSupports();
    const rejectedCount = ps.filter(s => s.status === SUPPORT_STATUS.NEEDS_REWORK || s.status === SUPPORT_STATUS.CLIENT_RETURNED).length;
    const reviewCount = ps.filter(s => s.status === SUPPORT_STATUS.UNDER_REVIEW).length;
    const readyCount = ps.filter(s => s.status === SUPPORT_STATUS.READY_TO_ASSIGN).length;
    const approvedCount = ps.filter(s => s.status === SUPPORT_STATUS.APPROVED).length;
    const sentCount = ps.filter(s => s.status === SUPPORT_STATUS.WITH_CLIENT).length;

    navItems = `
      <div class="nav-item project-back" onclick="exitProject()"><span class="nav-icon">&#8592;</span><span class="nav-label">All Projects</span></div>
      <div class="nav-project-name">${currentProject ? currentProject.name : 'Project'}</div>

      <div class="nav-section">Overview</div>
      ${ni('dashboard', '&#9632;', roleLevel <= 2 ? 'My Work' : 'Dashboard')}

      ${roleLevel >= 3 ? `
        <div class="nav-section">Manage</div>
        ${isPM ? ni('batches', '&#9744;', 'Batches', null, ['batches', 'batch-detail']) : ''}
        ${ni('supports', '&#9783;', 'Supports', null, ['supports', 'support-detail'])}
      ` : ''}

      ${roleLevel >= 3 ? `
        <div class="nav-section">Workflow</div>
        ${ni('assignment', '&#8594;', 'Assignment', readyCount || null)}
        ${ni('review', '&#10003;', 'Review', reviewCount || null)}
        ${ni('rejected-pool', '&#10007;', 'Rejected', rejectedCount || null)}
      ` : ''}

      ${isQC ? `
        <div class="nav-section">Rework</div>
        ${ni('rejected-pool', '&#10007;', 'Rejected Pool', rejectedCount || null)}
      ` : ''}

      ${isPM ? `
        <div class="nav-section">Client</div>
        ${ni('send-to-client', '&#9993;', 'Send to Client', approvedCount || null)}
        ${ni('client-decisions', '&#9998;', 'Client Decisions', sentCount || null)}
      ` : ''}

      ${roleLevel >= 3 ? `
        <div class="nav-section">Reports</div>
        ${ni('analytics', '&#9636;', 'Analytics')}
      ` : ''}
    `;
  }

  sidebar.className = `sidebar${sidebarCollapsed ? ' collapsed' : ''}`;
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h2>SANGAM</h2>
      <small>Samanvay SANGAM MVP</small>
    </div>
    <div class="sidebar-nav">${navItems}</div>
    <div class="sidebar-footer">
      <div class="text-sm text-secondary mb-2">Switch Role:</div>
      <div class="role-switcher">
        <button class="role-btn ${currentRole === ROLES.PM ? 'active' : ''}" onclick="switchRole('${ROLES.PM}')">PM</button>
        <button class="role-btn ${currentRole === ROLES.SME ? 'active' : ''}" onclick="switchRole('${ROLES.SME}')">SME</button>
        <button class="role-btn ${currentRole === ROLES.QC ? 'active' : ''}" onclick="switchRole('${ROLES.QC}')">QC</button>
        <button class="role-btn ${currentRole === ROLES.ACTIONEE ? 'active' : ''}" onclick="switchRole('${ROLES.ACTIONEE}')">Actionee</button>
      </div>
    </div>
    <div class="sidebar-toggle" onclick="toggleSidebar()" title="${sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <polyline points="15 8 12 12 15 16"/>
      </svg>
    </div>
  `;
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  renderSidebar();
}

// Get supports for current project only
function getProjectSupports() {
  if (!currentProject) return [];
  return SUPPORTS.filter(s => s.projectId === currentProject.id);
}

// --- Top Bar ---
function renderTopBar() {
  const topBar = document.getElementById("top-bar");
  const titles = {
    dashboard: (ROLE_HIERARCHY[currentRole] <= 2) ? "My Work" : "Dashboard",
    projects: "Projects",
    batches: "Batches",
    "batch-detail": currentBatch ? currentBatch.name : "Batch",
    "create-project": "Create Project",
    "create-batch": "Create Batch",
    supports: "Support Register",
    "support-detail": currentSupport ? currentSupport.tagId : "Support",
    assignment: "Work Assignment",
    review: "Review Queue",
    "rejected-pool": "Rejected Pool",
    "send-to-client": "Send to Client",
    "client-decisions": "Client Decisions",
    analytics: "Analytics",
  };

  let breadcrumb = "";
  if (inProjectWorkspace && currentProject && currentView !== "projects") {
    const parts = [`<a href="#" onclick="exitProject()">Projects</a>`, `<a href="#" onclick="navigateTo('dashboard')">${currentProject.name}</a>`];
    if (currentView === "batch-detail" && currentBatch) {
      parts.push(`<a href="#" onclick="navigateTo('batches')">Batches</a>`);
      parts.push(currentBatch.name);
    } else if (currentView === "support-detail" && currentSupport) {
      parts.push(`<a href="#" onclick="navigateTo('supports')">Supports</a>`);
      parts.push(currentSupport.tagId);
    } else if (currentView !== "dashboard") {
      parts.push(titles[currentView] || "");
    }
    breadcrumb = `<div class="breadcrumb">${parts.join(" / ")}</div>`;
  }

  topBar.innerHTML = `
    <div>
      <h1>${titles[currentView] || "SANGAM"}</h1>
      ${breadcrumb}
    </div>
    <div class="text-sm text-secondary">
      ${getUserForRole()} &middot; <strong>${currentRole}</strong>
    </div>
  `;
}

function getUserForRole() {
  const u = USERS.find(u => u.roles.includes(currentRole));
  return u ? u.name : "User";
}

// --- Content Router ---
function renderContent() {
  const area = document.getElementById("content-area");
  const renderers = {
    dashboard: () => (ROLE_HIERARCHY[currentRole] <= 2) ? renderMyWork() : renderDashboard(),
    projects: renderProjects,
    batches: renderBatches,
    "batch-detail": renderBatchDetail,
    "create-project": renderCreateProject,
    "create-batch": renderCreateBatch,
    supports: renderSupports,
    "support-detail": renderSupportDetail,
    assignment: renderAssignment,
    review: renderReview,
    "rejected-pool": renderRejectedPool,
    "send-to-client": renderSendToClient,
    "client-decisions": renderClientDecisions,
    analytics: renderAnalytics,
  };

  const renderer = renderers[currentView];
  area.innerHTML = renderer ? renderer() : "<p>View not found</p>";
}

// ============================================================
// VIEW RENDERERS
// ============================================================

// --- Dashboard (PM / SME) ---
function renderDashboard() {
  const ps = getProjectSupports();
  const counts = {};
  ps.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const total = ps.length;
  const rejected = (counts[SUPPORT_STATUS.NEEDS_REWORK] || 0) + (counts[SUPPORT_STATUS.CLIENT_RETURNED] || 0);
  const ready = counts[SUPPORT_STATUS.READY_TO_ASSIGN] || 0;
  const underReview = counts[SUPPORT_STATUS.UNDER_REVIEW] || 0;
  const approved = counts[SUPPORT_STATUS.APPROVED] || 0;
  const withClient = counts[SUPPORT_STATUS.WITH_CLIENT] || 0;
  const completed = counts[SUPPORT_STATUS.COMPLETED] || 0;

  let statCards = `
    <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total Supports</div></div>
    <div class="stat-card"><div class="stat-value">${ready}</div><div class="stat-label">Ready to Assign</div></div>
    <div class="stat-card"><div class="stat-value">${underReview}</div><div class="stat-label">Under Review</div></div>
    <div class="stat-card" style="border-left:3px solid var(--danger)"><div class="stat-value">${rejected}</div><div class="stat-label">Needs Rework</div></div>
  `;

  if (currentRole === ROLES.PM) {
    statCards += `
      <div class="stat-card"><div class="stat-value">${approved}</div><div class="stat-label">Ready to Send</div></div>
      <div class="stat-card"><div class="stat-value">${withClient}</div><div class="stat-label">With Client</div></div>
      <div class="stat-card" style="border-left:3px solid var(--success)"><div class="stat-value">${completed}</div><div class="stat-label">Completed</div></div>
    `;
  }

  return `
    <div class="stat-grid">${statCards}</div>

    <div class="card">
      <div class="card-header"><h3>Status Breakdown</h3></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Status</th><th>Count</th><th>%</th><th style="width:200px">Distribution</th></tr></thead>
          <tbody>
            ${Object.entries(counts).map(([status, count]) => `
              <tr>
                <td><span class="status-badge" style="background:${STATUS_COLORS[status]}">${status}</span></td>
                <td class="font-bold">${count}</td>
                <td>${((count/total)*100).toFixed(1)}%</td>
                <td><div class="progress-bar"><div class="progress-fill" style="width:${(count/total)*100}%;background:${STATUS_COLORS[status]}"></div></div></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Batches</h3>
        ${currentRole === ROLES.PM ? '<button class="btn btn-primary btn-sm" onclick="navigateTo(\'batches\')">View All</button>' : ''}
      </div>
      ${renderBatchTable(BATCHES.filter(b => currentProject && b.projectId === currentProject.id))}
    </div>
  `;
}

// --- My Work (Actionee / QC) ---
function renderMyWork() {
  const myName = currentRole === ROLES.QC ? "Amit Desai" : "Ramesh Patil";
  const ps = getProjectSupports();
  const myAssigned = ps.filter(s => s.assignedTo === myName && s.status === SUPPORT_STATUS.IN_PROGRESS);
  const mySubmitted = ps.filter(s => s.assignedTo === myName && s.status === SUPPORT_STATUS.UNDER_REVIEW);

  return `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${myAssigned.length}</div><div class="stat-label">Assigned to Me</div></div>
      <div class="stat-card"><div class="stat-value">${mySubmitted.length}</div><div class="stat-label">Awaiting Review</div></div>
    </div>

    ${renderDataTable({
      id: "my-work",
      title: "My Assignments",
      data: myAssigned,
      searchKeys: ["tagId", "drawingNo"],
      columns: [
        { key: "tagId", label: "Support Tag", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
        { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
        { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
        { key: "revisionType", label: "Type", render: renderRevBadge },
        { key: "level", label: "Level" },
        { key: "filePath", label: "DWG File", render: renderFilePath, noRowClick: true },
        { key: "markupPdfPath", label: "Markup PDF", render: renderMarkupPdf, noRowClick: true },
        { key: "_actions", label: "Action", sortable: false, render: r => `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();showToast('${r.tagId} submitted!','success')">Submit</button>`, noRowClick: true },
      ],
      filters: [
        { key: "revisionType", label: "All Types", options: [{value:"IFR",label:"IFR"},{value:"RIFR",label:"RIFR"}] },
      ],
      emptyMessage: "No assignments. You're all caught up!",
    })}

    ${mySubmitted.length > 0 ? renderDataTable({
      id: "my-submitted",
      title: "Submitted — Awaiting Review",
      data: mySubmitted,
      searchKeys: ["tagId"],
      columns: [
        { key: "tagId", label: "Support Tag" },
        { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
        { key: "revisionType", label: "Type", render: renderRevBadge },
        { key: "submittedAt", label: "Submitted" },
        { key: "status", label: "Status", render: renderStatusBadge },
      ],
      emptyMessage: "Nothing submitted yet.",
    }) : ""}
  `;
}

// --- Projects ---
function renderProjects() {
  return `
    <div class="flex justify-between items-center mb-4">
      <div></div>
      <button class="btn btn-primary" onclick="navigateTo('create-project')">+ New Project</button>
    </div>
    ${PROJECTS.map(p => `
      <div class="card" style="cursor:pointer" onclick="enterProject('${p.id}')">
        <div class="flex justify-between items-center">
          <div>
            <h3 style="font-size:16px">${p.name}</h3>
            <div class="text-sm text-secondary mt-2">${p.description}</div>
          </div>
          <div class="text-right">
            <div class="font-bold">${p.batchCount} batches</div>
            <div class="text-sm text-secondary">${p.totalSupports} supports</div>
          </div>
        </div>
        <div class="separator"></div>
        <div class="flex gap-4 text-sm text-secondary">
          <span>Client: ${p.client}</span>
          <span>Created: ${p.createdAt}</span>
          <span>By: ${p.createdBy}</span>
        </div>
      </div>
    `).join("")}
  `;
}

// --- Create Project ---
function renderCreateProject() {
  return `
    <div class="card" style="max-width:600px">
      <h3 class="mb-4">Create New Project</h3>
      <div class="form-group"><label>Project Name</label><input type="text" placeholder="e.g. MRJNGOSP2EAP" /></div>
      <div class="form-group"><label>Description</label><textarea rows="3" placeholder="Brief project description"></textarea></div>
      <div class="form-group">
        <label>Client</label>
        <select><option>Select client...</option>${USERS.filter(u => u.roles.includes(ROLES.CLIENT)).map(u => `<option>${u.name}</option>`).join("")}</select>
      </div>
      <div class="btn-group mt-4">
        <button class="btn btn-primary" onclick="showToast('Project created!','success');navigateTo('projects')">Create Project</button>
        <button class="btn btn-outline" onclick="navigateTo('projects')">Cancel</button>
      </div>
    </div>
  `;
}

// --- Batches (project-scoped) ---
function renderBatches() {
  if (!currentProject) return "<p>Select a project first</p>";
  const batches = BATCHES.filter(b => b.projectId === currentProject.id);
  return `
    <div class="flex justify-between items-center mb-4">
      <div>
        <div class="text-sm text-secondary">${currentProject.description}</div>
        <div class="text-sm text-secondary mt-2">Client: ${currentProject.client} &middot; Created: ${currentProject.createdAt}</div>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('create-batch')">+ New Batch</button>
    </div>
    <div class="card">
      <div class="card-header"><h3>Batches (${batches.length})</h3></div>
      ${renderBatchTable(batches)}
    </div>
  `;
}

function renderBatchTable(batches) {
  return `
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Batch</th><th>Created</th><th>Supports</th><th>Progress</th><th>Input Files</th></tr></thead>
        <tbody>
          ${batches.map(b => {
            const batchSupports = SUPPORTS.filter(s => s.batchId === b.id);
            const done = batchSupports.filter(s => s.status === SUPPORT_STATUS.CLIENT_APPROVED).length;
            const pct = b.supportCount > 0 ? ((done / b.supportCount) * 100).toFixed(0) : 0;
            return `
            <tr style="cursor:pointer" onclick="navigateTo('batch-detail',{batchId:'${b.id}'})">
              <td class="font-bold clickable">${b.name}</td>
              <td>${b.createdAt}</td>
              <td>${batchSupports.length} / ${b.supportCount}</td>
              <td style="width:160px">
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                <span class="text-sm text-secondary">${pct}% complete</span>
              </td>
              <td class="text-sm">${b.navisworksFile}<br>${b.excelFile}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// --- Create Batch ---
function renderCreateBatch() {
  return `
    <div class="card" style="max-width:640px">
      <h3 class="mb-4">Create New Batch</h3>
      <div class="form-group"><label>Project</label><select><option>${currentProject ? currentProject.name : "Select project..."}</option></select></div>
      <div class="form-group">
        <label>Navisworks Model File</label>
        <div class="file-upload" onclick="this.querySelector('.file-name').textContent='GOSP2_Model_Rev5.nwf (260 MB)'">
          <div>Click to select Navisworks model (.nwf / .nwd)</div>
          <div class="file-name"></div>
        </div>
      </div>
      <div class="form-group">
        <label>Support Excel List</label>
        <div class="file-upload" onclick="this.querySelector('.file-name').textContent='MRJNGOSP2EAP-CTS list.xlsx (48 KB)'">
          <div>Click to select Excel file (.xlsx)</div>
          <div class="file-name"></div>
        </div>
      </div>
      <div class="card" style="background:#f0fdf4;border-color:#bbf7d0">
        <h3 class="mb-2" style="font-size:13px">Excel Preview — Sheet: <strong>MRJNGOSP2EAP-CTS</strong> (auto-detected)</h3>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>SL.NO</th><th>SUPPORT No.</th><th>DRAWING No.</th><th>REVISION</th><th>LEVEL</th><th>STATUS</th><th>REMARKS</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>CTS-01-0001</td><td>CTS-01-0001</td><td>-</td><td>Below Cellar deck</td><td>-</td><td>-</td></tr>
              <tr><td>2</td><td>CTS-01-0002</td><td>CTS-01-0002</td><td>-</td><td>Below Cellar deck</td><td>-</td><td>-</td></tr>
              <tr><td>3</td><td>CTS-01-0003</td><td>CTS-01-0003</td><td>-</td><td>Cellar deck</td><td>-</td><td>-</td></tr>
              <tr><td colspan="7" class="text-secondary text-sm">... and 119 more rows</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="btn-group mt-4">
        <button class="btn btn-primary" onclick="showToast('Batch created with 122 supports!','success');navigateTo('project-detail',{projectId:'PROJ-001'})">Create Batch</button>
        <button class="btn btn-outline" onclick="navigateTo('project-detail',{projectId:'PROJ-001'})">Cancel</button>
      </div>
    </div>
  `;
}

// --- Batch Detail ---
function renderBatchDetail() {
  if (!currentBatch) return "<p>Batch not found</p>";
  const batchSupports = SUPPORTS.filter(s => s.batchId === currentBatch.id);
  const counts = {};
  batchSupports.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });

  return `
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm text-secondary">
        Created: ${currentBatch.createdAt} &middot; By: ${currentBatch.createdBy} &middot;
        Model: ${currentBatch.navisworksFile} &middot; Excel: ${currentBatch.excelFile}
      </div>
      <button class="btn btn-primary btn-sm" onclick="showToast('Syncing cleaned files...','success')">Sync Cleaned</button>
    </div>

    <div class="stat-grid">
      ${Object.entries(counts).map(([status, count]) => `
        <div class="stat-card">
          <div class="stat-value">${count}</div>
          <div class="stat-label"><span class="status-badge" style="background:${STATUS_COLORS[status]};font-size:11px">${status}</span></div>
        </div>
      `).join("")}
    </div>

    ${renderDataTable({
      id: "batch-supports",
      title: "Supports",
      data: batchSupports,
      searchKeys: ["tagId", "drawingNo", "assignedTo"],
      rowClick: "dtRowClick",
      columns: [
        { key: "tagId", label: "Tag ID", render: r => `<span class="clickable">${r.tagId}</span>` },
        { key: "drawingNo", label: "Drawing" },
        { key: "status", label: "Status", render: renderStatusBadge },
        { key: "assignedTo", label: "Assigned To", render: renderAssignedTo },
        { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
        { key: "revisionType", label: "Type", render: renderRevBadge },
        { key: "level", label: "Level" },
      ],
      statusTabs: allStatusTabs(),
      filters: [
        { key: "assignedTo", label: "All Assignees", options: actioneeFilterOptions() },
      ],
    })}
  `;
}

// --- Full Support Register (project-scoped) ---
function renderSupports() {
  return renderDataTable({
    id: "all-supports",
    title: "Supports",
    data: getProjectSupports(),
    searchKeys: ["tagId", "drawingNo", "assignedTo", "level"],
    rowClick: "dtRowClick",
    columns: [
      { key: "tagId", label: "Tag ID", render: r => `<span class="clickable">${r.tagId}</span>` },
      { key: "drawingNo", label: "Drawing" },
      { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
      { key: "status", label: "Status", render: renderStatusBadge },
      { key: "assignedTo", label: "Assigned To", render: renderAssignedTo },
      { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
      { key: "revisionType", label: "Type", render: renderRevBadge },
      { key: "level", label: "Level" },
    ],
    statusTabs: allStatusTabs(),
    filters: [
      { key: "batchId", label: "All Batches", options: batchFilterOptions() },
      { key: "assignedTo", label: "All Assignees", options: actioneeFilterOptions() },
      { key: "revisionType", label: "All Rev Types", options: [{value:"IFR",label:"IFR"},{value:"RIFR",label:"RIFR"},{value:"IFC",label:"IFC"}] },
    ],
  });
}

// --- Support Detail ---
function renderSupportDetail() {
  if (!currentSupport) return "<p>Support not found</p>";
  const s = currentSupport;
  const batch = BATCHES.find(b => b.id === s.batchId);

  return `
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <div class="flex gap-2 items-center">
          <span class="status-badge" style="background:${STATUS_COLORS[s.status]}">${s.status}</span>
          <span class="revision-badge ${s.revisionType.toLowerCase()}">Rev ${s.revision} (${s.revisionType})</span>
        </div>
        <div class="btn-group">
          ${s.status === SUPPORT_STATUS.IN_PROGRESS ? '<button class="btn btn-primary btn-sm" onclick="showToast(\'Submitted!\',\'success\')">Submit</button>' : ''}
          ${s.status === SUPPORT_STATUS.UNDER_REVIEW ? '<button class="btn btn-success btn-sm" onclick="showToast(\'Approved!\',\'success\')">Approve</button><button class="btn btn-danger btn-sm" onclick="showModal(\'reject-modal\')">Reject</button>' : ''}
          ${s.status === SUPPORT_STATUS.WITH_CLIENT ? '<button class="btn btn-success btn-sm" onclick="showToast(\'Completed (IFC)\',\'success\')">Client Approved</button><button class="btn btn-danger btn-sm" onclick="showToast(\'Client Returned → Pool\',\'error\')">Client Returned</button>' : ''}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group"><label>Support Tag ID</label><div class="font-bold">${s.tagId}</div></div>
        <div class="form-group"><label>Drawing No.</label><div>${s.drawingNo}</div></div>
        <div class="form-group"><label>Batch</label><div>${batch ? batch.name : s.batchId}</div></div>
        <div class="form-group"><label>Level</label><div>${s.level}</div></div>
        <div class="form-group"><label>Assigned To</label><div>${s.assignedTo || "Unassigned"}</div></div>
        <div class="form-group"><label>Present Status (Client)</label><div>${s.presentStatus || "-"}</div></div>
      </div>

      <div class="separator"></div>
      <h3 class="mb-2">Files</h3>
      <div class="file-path mb-2" onclick="showToast('Opening DWG in AutoCAD...','success')">${s.filePath}</div>
      ${s.markupPdfPath ? `<div class="file-path" onclick="showToast('Opening markup PDF...','success')">Markup: ${s.markupPdfPath}</div>` : ''}

      <div class="separator"></div>
      <h3 class="mb-2">Revision History</h3>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-date">${s.assignedAt || "2026-03-20"}</div>
          <div class="timeline-content"><span class="revision-badge ifr">IFR</span> Rev A — Initial submission</div>
        </div>
        ${s.revision !== "A" ? `
        <div class="timeline-item">
          <div class="timeline-date">2026-04-02</div>
          <div class="timeline-content"><span class="revision-badge rifr">RIFR</span> Rev B — Rejected. <span class="file-path" onclick="showToast('Opening markup...','success')">View markup PDF</span></div>
        </div>` : ""}
      </div>

      <div class="separator"></div>
      <div class="flex gap-4 text-sm text-secondary">
        <span>Assigned: ${s.assignedAt || "-"}</span>
        <span>Submitted: ${s.submittedAt || "-"}</span>
        <span>Approved: ${s.approvedAt || "-"}</span>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-overlay" id="reject-modal">
      <div class="modal">
        <h3>Reject Support — ${s.tagId}</h3>
        <p class="text-sm text-secondary mb-3">Ensure markup PDF is saved alongside the DWG before rejecting.</p>
        <div class="form-group">
          <label>Assign to</label>
          <select>
            ${USERS.filter(u => u.roles.includes(ROLES.QC)).map(u => `<option selected>${u.name} (QC — default)</option>`).join("")}
            <option disabled>───────────</option>
            <option value="">Send to Rejected Pool (no assignment)</option>
            <option disabled>───────────</option>
            ${USERS.filter(u => u.roles.includes(ROLES.ACTIONEE)).map(u => `<option>${u.name}</option>`).join("")}
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('reject-modal')">Cancel</button>
          <button class="btn btn-danger" onclick="showToast('${s.tagId} rejected → assigned to QC','success');hideModal('reject-modal')">Reject</button>
        </div>
      </div>
    </div>
  `;
}

// --- Assignment Queue (project-scoped) ---
function renderAssignment() {
  const cleaned = getProjectSupports().filter(s => s.status === SUPPORT_STATUS.READY_TO_ASSIGN);
  const actionees = USERS.filter(u => u.roles.includes(ROLES.ACTIONEE));

  return `
    ${renderDataTable({
      id: "assignment-queue",
      title: "Unassigned Supports",
      data: cleaned,
      selectable: true,
      searchKeys: ["tagId", "drawingNo", "level"],
      rowClick: "dtRowClick",
      columns: [
        { key: "tagId", label: "Tag ID", render: r => `<span class="clickable">${r.tagId}</span>` },
        { key: "drawingNo", label: "Drawing" },
        { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
        { key: "level", label: "Level" },
        { key: "revisionType", label: "Type", render: renderRevBadge },
      ],
      filters: [
        { key: "batchId", label: "All Batches", options: batchFilterOptions() },
      ],
      actions: `
        <button class="btn btn-primary btn-sm" onclick="showModal('auto-assign-modal')">Auto Assign</button>
        <button class="btn btn-outline btn-sm" onclick="showModal('bulk-assign-modal')">Assign Selected</button>
      `,
      bulkActions: `
        <button class="btn btn-primary btn-sm" onclick="showModal('bulk-assign-modal')">Assign ${selectedSupports.size} to...</button>
        <button class="btn btn-outline btn-sm" onclick="selectedSupports.clear();renderContent()">Clear</button>
      `,
      emptyMessage: "All supports are assigned!",
    })}

    <div class="card">
      <div class="card-header"><h3>Reassignment</h3></div>
      <p class="text-sm text-secondary mb-3">Move all supports from one Actionee to another (e.g., for leave coverage).</p>
      <div class="form-row">
        <div class="form-group"><label>From</label><select>${actionees.map(u => `<option>${u.name}</option>`).join("")}</select></div>
        <div class="form-group"><label>To</label><select>${actionees.map(u => `<option>${u.name}</option>`).join("")}</select></div>
      </div>
      <button class="btn btn-warning btn-sm" onclick="showToast('All supports reassigned!','success')">Reassign All</button>
    </div>

    <!-- Auto Assign Modal -->
    <div class="modal-overlay" id="auto-assign-modal">
      <div class="modal">
        <h3>Auto Assign — Equal Distribution</h3>
        <p class="text-sm text-secondary mb-3">${cleaned.length} supports will be distributed equally. Uncheck to exclude.</p>
        ${actionees.map(u => `<div class="checkbox-row"><input type="checkbox" checked id="aa-${u.name.replace(/ /g,'')}"><label>${u.name}</label></div>`).join("")}
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('auto-assign-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="showToast('${cleaned.length} supports auto-assigned!','success');hideModal('auto-assign-modal')">Assign</button>
        </div>
      </div>
    </div>

    <!-- Bulk Assign Modal -->
    <div class="modal-overlay" id="bulk-assign-modal">
      <div class="modal">
        <h3>Assign ${selectedSupports.size || "Selected"} Supports</h3>
        <div class="form-group"><label>Assign to</label><select><option>Select Actionee...</option>${actionees.map(u => `<option>${u.name}</option>`).join("")}</select></div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('bulk-assign-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="showToast('Assigned!','success');hideModal('bulk-assign-modal')">Assign</button>
        </div>
      </div>
    </div>
  `;
}

// --- Review Queue (project-scoped) ---
function renderReview() {
  const submitted = getProjectSupports().filter(s => s.status === SUPPORT_STATUS.UNDER_REVIEW);

  return renderDataTable({
    id: "review-queue",
    title: "Supports Awaiting Review",
    data: submitted,
    searchKeys: ["tagId", "assignedTo"],
    columns: [
      { key: "tagId", label: "Tag ID", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
      { key: "assignedTo", label: "Submitted By" },
      { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
      { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
      { key: "revisionType", label: "Type", render: renderRevBadge },
      { key: "submittedAt", label: "Submitted" },
      { key: "filePath", label: "DWG", render: renderFilePath, noRowClick: true },
      { key: "_actions", label: "Actions", sortable: false, noRowClick: true, render: r => `
        <div class="btn-group">
          <button class="btn btn-success btn-sm" onclick="event.stopPropagation();showToast('${r.tagId} approved!','success')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();showModal('reject-modal')">Reject</button>
        </div>
      ` },
    ],
    filters: [
      { key: "assignedTo", label: "All Submitters", options: actioneeFilterOptions() },
      { key: "batchId", label: "All Batches", options: batchFilterOptions() },
      { key: "revisionType", label: "All Types", options: [{value:"IFR",label:"IFR"},{value:"RIFR",label:"RIFR"}] },
    ],
    emptyMessage: "No supports awaiting review.",
  }) + `
    <!-- Reject Modal -->
    <div class="modal-overlay" id="reject-modal">
      <div class="modal">
        <h3>Reject Support</h3>
        <p class="text-sm text-secondary mb-3">Ensure markup PDF is saved alongside the DWG.</p>
        <div class="form-group">
          <label>Assign to</label>
          <select>
            ${USERS.filter(u => u.roles.includes(ROLES.QC)).map(u => `<option selected>${u.name} (QC — default)</option>`).join("")}
            <option disabled>───────────</option>
            <option value="">Send to Rejected Pool</option>
            <option disabled>───────────</option>
            ${USERS.filter(u => u.roles.includes(ROLES.ACTIONEE)).map(u => `<option>${u.name}</option>`).join("")}
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('reject-modal')">Cancel</button>
          <button class="btn btn-danger" onclick="showToast('Rejected → assigned to QC','success');hideModal('reject-modal')">Reject</button>
        </div>
      </div>
    </div>
  `;
}

// --- Rejected Pool (project-scoped) ---
function renderRejectedPool() {
  const rejected = getProjectSupports().filter(s => s.status === SUPPORT_STATUS.NEEDS_REWORK || s.status === SUPPORT_STATUS.CLIENT_RETURNED);
  const assignees = USERS.filter(u => u.roles.includes(ROLES.ACTIONEE) || u.roles.includes(ROLES.QC));

  return renderDataTable({
    id: "rejected-pool",
    title: "Rejected Pool",
    data: rejected,
    selectable: true,
    searchKeys: ["tagId", "drawingNo"],
    columns: [
      { key: "tagId", label: "Tag ID", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
      { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
      { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
      { key: "revisionType", label: "Type", render: renderRevBadge },
      { key: "status", label: "Rejected By", render: r => r.status === SUPPORT_STATUS.CLIENT_RETURNED ? `<span class="status-badge" style="background:${STATUS_COLORS[r.status]}">Client</span>` : `<span class="status-badge" style="background:${STATUS_COLORS[r.status]}">SME</span>` },
      { key: "markupPdfPath", label: "Markup PDF", render: renderMarkupPdf, noRowClick: true },
    ],
    filters: [
      { key: "status", label: "All Sources", options: [{value:SUPPORT_STATUS.NEEDS_REWORK,label:"Needs Rework (SME)"},{value:SUPPORT_STATUS.CLIENT_RETURNED,label:"Client Returned"}] },
      { key: "batchId", label: "All Batches", options: batchFilterOptions() },
    ],
    actions: `
      <button class="btn btn-primary btn-sm" onclick="showModal('pool-auto-assign-modal')">Auto Assign</button>
      <button class="btn btn-outline btn-sm" onclick="showModal('pool-assign-modal')">Assign Selected</button>
    `,
    bulkActions: `
      <button class="btn btn-primary btn-sm" onclick="showModal('pool-assign-modal')">Assign ${selectedSupports.size} to...</button>
      <button class="btn btn-outline btn-sm" onclick="selectedSupports.clear();renderContent()">Clear</button>
    `,
    emptyMessage: "Rejected pool is empty!",
  }) + `
    <!-- Auto Assign Modal -->
    <div class="modal-overlay" id="pool-auto-assign-modal">
      <div class="modal">
        <h3>Auto Assign from Pool</h3>
        <p class="text-sm text-secondary mb-3">${rejected.length} items. QC users pre-selected.</p>
        ${assignees.map(u => `<div class="checkbox-row"><input type="checkbox" ${u.roles.includes(ROLES.QC) ? 'checked' : ''}><label>${u.name} ${u.roles.includes(ROLES.QC) ? '(QC)' : ''}</label></div>`).join("")}
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('pool-auto-assign-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="showToast('Assigned from pool!','success');hideModal('pool-auto-assign-modal')">Assign</button>
        </div>
      </div>
    </div>
    <!-- Assign Selected Modal -->
    <div class="modal-overlay" id="pool-assign-modal">
      <div class="modal">
        <h3>Assign from Pool</h3>
        <div class="form-group"><label>Assign to</label><select>${assignees.map(u => `<option>${u.name} ${u.roles.includes(ROLES.QC) ? '(QC)' : ''}</option>`).join("")}</select></div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="hideModal('pool-assign-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="showToast('Assigned!','success');hideModal('pool-assign-modal')">Assign</button>
        </div>
      </div>
    </div>
  `;
}

// --- Send to Client (project-scoped) ---
function renderSendToClient() {
  const approved = getProjectSupports().filter(s => s.status === SUPPORT_STATUS.APPROVED);
  const fresh = approved.filter(s => s.revisionType === REVISION_TYPES.IFR);
  const rework = approved.filter(s => s.revisionType !== REVISION_TYPES.IFR);

  return `
    <div class="tabs" id="stc-tabs">
      <div class="tab active" onclick="dtSwitchTab('stc-tabs','stc-fresh',this)">Fresh Approvals (${fresh.length})</div>
      <div class="tab" onclick="dtSwitchTab('stc-tabs','stc-rework',this)">QC Rework (${rework.length})</div>
    </div>
    <div id="stc-fresh">
      ${renderDataTable({
        id: "send-fresh",
        title: "Fresh Approvals — Ready to Send",
        data: fresh,
        selectable: true,
        searchKeys: ["tagId"],
        columns: [
          { key: "tagId", label: "Tag ID", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
          { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
          { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
          { key: "assignedTo", label: "Completed By" },
          { key: "approvedAt", label: "Approved" },
        ],
        actions: `<button class="btn btn-primary btn-sm" onclick="showToast('${fresh.length} sent to client!','success')">Send All to Client</button>`,
        bulkActions: `<button class="btn btn-primary btn-sm" onclick="showToast('Sent selected to client!','success')">Send ${selectedSupports.size} to Client</button>`,
        emptyMessage: "No fresh approvals ready.",
      })}
    </div>
    <div id="stc-rework" class="hidden">
      ${renderDataTable({
        id: "send-rework",
        title: "QC Rework — Ready to Re-Send",
        data: rework,
        selectable: true,
        searchKeys: ["tagId"],
        columns: [
          { key: "tagId", label: "Tag ID", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
          { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
          { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
          { key: "revisionType", label: "Type", render: renderRevBadge },
          { key: "assignedTo", label: "Reworked By" },
        ],
        actions: `<button class="btn btn-warning btn-sm" onclick="showToast('${rework.length} rework sent to client!','success')">Send All to Client</button>`,
        bulkActions: `<button class="btn btn-warning btn-sm" onclick="showToast('Sent!','success')">Send ${selectedSupports.size} to Client</button>`,
        emptyMessage: "No QC rework ready.",
      })}
    </div>
  `;
}

// --- Client Decisions (project-scoped) ---
function renderClientDecisions() {
  const sent = getProjectSupports().filter(s => s.status === SUPPORT_STATUS.WITH_CLIENT);

  return renderDataTable({
    id: "client-decisions",
    title: "Awaiting Client Decision",
    data: sent,
    searchKeys: ["tagId"],
    columns: [
      { key: "tagId", label: "Tag ID", render: r => `<span class="clickable" onclick="dtRowClick('${r.id}')">${r.tagId}</span>` },
      { key: "batchId", label: "Batch", render: r => getBatchLabel(r) },
      { key: "revision", label: "Rev", render: r => `Rev ${r.revision}` },
      { key: "revisionType", label: "Type", render: renderRevBadge },
      { key: "_actions", label: "Decision", sortable: false, noRowClick: true, render: r => `
        <div class="btn-group">
          <button class="btn btn-success btn-sm" onclick="event.stopPropagation();showToast('${r.tagId} — Client Approved (IFC)','success')">Approved</button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();showToast('${r.tagId} — Rejected → Pool','error')">Rejected</button>
        </div>
      ` },
    ],
    filters: [
      { key: "batchId", label: "All Batches", options: batchFilterOptions() },
    ],
    emptyMessage: "Nothing sent to client yet.",
  });
}

// --- Analytics (project-scoped) ---
function renderAnalytics() {
  const ps = getProjectSupports();
  const counts = {};
  ps.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const total = ps.length;
  // Use project-scoped TAT and rates
  const tats = {};
  ps.filter(s => s.assignedAt && s.submittedAt).forEach(s => {
    if (!tats[s.assignedTo]) tats[s.assignedTo] = [];
    const days = Math.round((new Date(s.submittedAt) - new Date(s.assignedAt)) / (1000 * 60 * 60 * 24));
    tats[s.assignedTo].push(days);
  });
  const tatResult = {};
  Object.keys(tats).forEach(name => {
    const arr = tats[name];
    tatResult[name] = { avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1), count: arr.length };
  });
  const rates = {};
  ["Ramesh Patil", "Priya Sharma", "Amit Desai"].forEach(name => {
    const total = ps.filter(s => s.assignedTo === name).length;
    const rejected = ps.filter(s => s.assignedTo === name && s.revision !== "A").length;
    rates[name] = { total, rejected, rate: total > 0 ? ((rejected / total) * 100).toFixed(1) + "%" : "0%" };
  });

  return `
    <div class="card">
      <div class="card-header"><h3>Supports by Status</h3></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Status</th><th>Count</th><th>%</th><th style="width:200px">Distribution</th></tr></thead>
          <tbody>
            ${Object.entries(counts).map(([status, count]) => `
              <tr>
                <td><span class="status-badge" style="background:${STATUS_COLORS[status]}">${status}</span></td>
                <td class="font-bold">${count}</td>
                <td>${((count/total)*100).toFixed(1)}%</td>
                <td><div class="progress-bar"><div class="progress-fill" style="width:${(count/total)*100}%;background:${STATUS_COLORS[status]}"></div></div></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="form-row">
      <div class="card">
        <div class="card-header"><h3>Average TAT per Actionee</h3></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Actionee</th><th>Avg TAT (days)</th><th>Completed</th></tr></thead>
            <tbody>${Object.entries(tatResult).map(([name, d]) => `<tr><td>${name}</td><td class="font-bold">${d.avg}</td><td>${d.count}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Rejection Rate per Actionee</h3></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Actionee</th><th>Total</th><th>Rejected</th><th>Rate</th></tr></thead>
            <tbody>${Object.entries(rates).map(([name, d]) => `<tr><td>${name}</td><td>${d.total}</td><td>${d.rejected}</td><td class="font-bold">${d.rate}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// HELPERS
// ============================================================

function toggleSupport(id) {
  if (selectedSupports.has(id)) selectedSupports.delete(id);
  else selectedSupports.add(id);
  renderContent();
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove("show"); }, 2500);
}

function dtSwitchTab(tabGroupId, showId, clickedTab) {
  // Toggle tabs
  document.getElementById(tabGroupId).querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  clickedTab.classList.add("active");
  // Toggle content
  const parent = document.getElementById(tabGroupId).parentElement;
  parent.querySelectorAll("[id^='stc-']").forEach(el => {
    if (el.id === tabGroupId) return; // skip the tab bar itself
    el.classList.add("hidden");
  });
  document.getElementById(showId).classList.remove("hidden");
}

// Init on load
document.addEventListener("DOMContentLoaded", init);
