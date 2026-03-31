// Samanvay SANGAM — Shared App Logic

// ============ ROLE MANAGEMENT ============

function getCurrentRole() {
  return localStorage.getItem('sangam-role') || 'PM';
}

function setCurrentRole(role) {
  localStorage.setItem('sangam-role', role);
  window.location.reload();
}

function getCurrentProjectId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('project') || 'PRJ-001';
}

function getCurrentProject() {
  return PROJECTS.find(p => p.id === getCurrentProjectId()) || PROJECTS[0];
}

// ============ HEADER RENDERING ============

function renderHeader(options = {}) {
  const role = getCurrentRole();
  const { showProjectBanner = false, showTabs = false, activeTab = '' } = options;
  const project = getCurrentProject();

  const header = document.getElementById('app-header');
  if (!header) return;

  header.innerHTML = `
    <div class="header">
      <div class="header-left">
        <a href="system-overview.html" class="logo" style="text-decoration:none;color:var(--color-primary)">
          <div class="logo-icon">S</div>
          <span>SANGAM</span>
        </a>
        <span class="badge badge-lg ${ROLE_BADGE_CLASS[role]}">${role}</span>
      </div>
      <div class="header-right">
        <div class="role-switcher">
          ${ROLES.map(r => `
            <button class="${r === role ? 'active' : ''}" onclick="setCurrentRole('${r}')">${r}</button>
          `).join('')}
        </div>
        <div style="width:1px;height:24px;background:var(--color-border);margin:0 4px"></div>
        <span class="text-sm text-secondary">${getMockUserForRole(role).name}</span>
      </div>
    </div>
    ${showProjectBanner ? `
    <div class="project-name-banner">
      <h2>${project.name}</h2>
      <div class="flex items-center gap-2">
        <span class="text-xs text-secondary">${project.client}</span>
        <span class="badge badge-sm" style="background:#dbeafe;color:#1d4ed8;border-color:#93c5fd">${project.phase}</span>
      </div>
    </div>` : ''}
    ${showTabs ? renderTabs(role, activeTab) : ''}
  `;
}

function renderTabs(role, activeTab) {
  const tabs = TAB_VISIBILITY[role] || [];
  const projectId = getCurrentProjectId();
  const tabLinks = {
    'Dashboard': `dashboard.html?project=${projectId}`,
    'Batches': `batches.html?project=${projectId}`,
    'Support Register': `supports.html?project=${projectId}`,
    'Assignments': `assignments.html?project=${projectId}`,
    'My Work': `my-work.html?project=${projectId}`,
    'Review': `review.html?project=${projectId}`,
    'Client Review': `client-review.html?project=${projectId}`,
    'Analytics': `analytics.html?project=${projectId}`,
    'Configuration': `configuration.html?project=${projectId}`,
  };

  return `<nav class="tab-nav">${tabs.map(tab =>
    `<a href="${tabLinks[tab]}" class="${tab === activeTab ? 'active' : ''}">${tab}</a>`
  ).join('')}</nav>`;
}

function getMockUserForRole(role) {
  switch (role) {
    case 'PM': return PMS[0];
    case 'SME': return SMES[0];
    case 'Actionee': return ACTIONEES[0];
    case 'Client': return CLIENTS[0];
    default: return PMS[0];
  }
}

// ============ BADGE RENDERING ============

function statusBadge(status) {
  const cls = STATUS_BADGE_CLASS[status] || 'badge-unassigned';
  return `<span class="badge ${cls}">${status}</span>`;
}

function batchStatusBadge(status) {
  const cls = BATCH_STATUS_BADGE_CLASS[status] || '';
  return `<span class="badge ${cls}">${status}</span>`;
}

function roleBadge(role) {
  const cls = ROLE_BADGE_CLASS[role] || '';
  return `<span class="badge badge-sm ${cls}">${role}</span>`;
}

// ============ TABLE HELPERS ============

class DataTable {
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    this.columns = options.columns || [];
    this.data = options.data || [];
    this.filteredData = [...this.data];
    this.sortColumn = options.defaultSort || null;
    this.sortDir = options.defaultSortDir || 'asc';
    this.page = 1;
    this.pageSize = options.pageSize || 20;
    this.selectable = options.selectable || false;
    this.selectedIds = new Set();
    this.onSelectionChange = options.onSelectionChange || null;
    this.filters = {};
    this.searchTerm = '';

    this.render();
  }

  setData(data) {
    this.data = data;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let result = [...this.data];

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(row =>
        this.columns.some(col => {
          const val = col.accessor ? row[col.accessor] : '';
          return val && String(val).toLowerCase().includes(term);
        })
      );
    }

    // Filters
    Object.entries(this.filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(row => row[key] === value);
      }
    });

    // Sort
    if (this.sortColumn) {
      const col = this.columns.find(c => c.accessor === this.sortColumn);
      result.sort((a, b) => {
        let aVal = a[this.sortColumn] || '';
        let bVal = b[this.sortColumn] || '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return this.sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return this.sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = result;
    this.page = 1;
    this.render();
  }

  sort(accessor) {
    if (this.sortColumn === accessor) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = accessor;
      this.sortDir = 'asc';
    }
    this.applyFiltersAndSort();
  }

  setFilter(key, value) {
    this.filters[key] = value;
    this.applyFiltersAndSort();
  }

  setSearch(term) {
    this.searchTerm = term;
    this.applyFiltersAndSort();
  }

  toggleSelect(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.render();
    if (this.onSelectionChange) this.onSelectionChange([...this.selectedIds]);
  }

  toggleSelectAll() {
    const pageData = this.getPageData();
    const allSelected = pageData.every(row => this.selectedIds.has(row.id));
    if (allSelected) {
      pageData.forEach(row => this.selectedIds.delete(row.id));
    } else {
      pageData.forEach(row => this.selectedIds.add(row.id));
    }
    this.render();
    if (this.onSelectionChange) this.onSelectionChange([...this.selectedIds]);
  }

  getPageData() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  getTotalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  render() {
    const pageData = this.getPageData();
    const totalPages = this.getTotalPages();
    const allPageSelected = pageData.length > 0 && pageData.every(row => this.selectedIds.has(row.id));

    let html = '<div class="table-container">';

    // Table
    html += '<table class="data-table"><thead><tr>';

    if (this.selectable) {
      html += `<th style="width:40px"><input type="checkbox" ${allPageSelected ? 'checked' : ''} onchange="window._tables['${this.container.id}'].toggleSelectAll()"></th>`;
    }

    this.columns.forEach(col => {
      const isSorted = this.sortColumn === col.accessor;
      const icon = isSorted ? (this.sortDir === 'asc' ? '↑' : '↓') : '↕';
      html += `<th class="${isSorted ? 'sorted' : ''}" onclick="window._tables['${this.container.id}'].sort('${col.accessor}')" style="${col.width ? 'width:' + col.width : ''}">
        ${col.header} <span class="sort-icon">${icon}</span>
      </th>`;
    });
    html += '</tr></thead><tbody>';

    if (pageData.length === 0) {
      html += `<tr><td colspan="${this.columns.length + (this.selectable ? 1 : 0)}" class="text-center text-muted p-4">No records found</td></tr>`;
    }

    pageData.forEach(row => {
      const isSelected = this.selectedIds.has(row.id);
      html += `<tr class="${isSelected ? 'selected' : ''}">`;
      if (this.selectable) {
        html += `<td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="window._tables['${this.container.id}'].toggleSelect('${row.id}')"></td>`;
      }
      this.columns.forEach(col => {
        const value = col.accessor ? row[col.accessor] : '';
        const rendered = col.render ? col.render(value, row) : escapeHtml(String(value || '—'));
        html += `<td>${rendered}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';

    // Pagination
    html += `<div class="pagination">
      <span>Showing ${((this.page - 1) * this.pageSize) + 1}–${Math.min(this.page * this.pageSize, this.filteredData.length)} of ${this.filteredData.length}</span>
      <div class="pagination-buttons">
        <button class="btn btn-sm btn-secondary" ${this.page <= 1 ? 'disabled' : ''} onclick="window._tables['${this.container.id}'].goToPage(${this.page - 1})">← Prev</button>
        <span class="text-sm text-secondary" style="padding:0 8px">Page ${this.page} of ${totalPages || 1}</span>
        <button class="btn btn-sm btn-secondary" ${this.page >= totalPages ? 'disabled' : ''} onclick="window._tables['${this.container.id}'].goToPage(${this.page + 1})">Next →</button>
      </div>
    </div>`;

    html += '</div>';
    this.container.innerHTML = html;
  }

  goToPage(page) {
    this.page = page;
    this.render();
  }
}

// Global table registry
window._tables = {};
function createTable(containerId, options) {
  const table = new DataTable(containerId, options);
  window._tables[containerId] = table;
  return table;
}

// ============ MODAL SYSTEM ============

function showModal(title, bodyHtml, footerHtml) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${bodyHtml}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 200);
  }
}

// ============ TOAST SYSTEM ============

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-weight:700">${icons[type] || '•'}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ SEARCH BAR ============

function renderSearchBar(tableId, placeholder = 'Search...') {
  return `<input type="text" class="form-input" style="max-width:250px" placeholder="${placeholder}"
    oninput="window._tables['${tableId}'].setSearch(this.value)">`;
}

function renderFilterSelect(tableId, accessor, label, options) {
  return `<select class="form-select" style="max-width:180px" onchange="window._tables['${tableId}'].setFilter('${accessor}', this.value)">
    <option value="all">${label}</option>
    ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
  </select>`;
}

// ============ UTILITY ============

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// Navigate with project context
function navTo(page, params = {}) {
  const projectId = getCurrentProjectId();
  const searchParams = new URLSearchParams({ project: projectId, ...params });
  window.location.href = `${page}?${searchParams.toString()}`;
}

// Check role access for current page
function checkRoleAccess(allowedRoles) {
  const role = getCurrentRole();
  if (!allowedRoles.includes(role)) {
    document.getElementById('main-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <div class="empty-state-text">This page is not accessible for the <strong>${role}</strong> role.</div>
        <div class="mt-3"><a href="dashboard.html?project=${getCurrentProjectId()}" class="btn btn-primary">Go to Dashboard</a></div>
      </div>`;
    return false;
  }
  return true;
}
