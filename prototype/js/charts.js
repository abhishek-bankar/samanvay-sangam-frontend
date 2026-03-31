// Samanvay SANGAM — Chart Helpers (uses Chart.js CDN)

const CHART_COLORS = ['#1d4ed8', '#ea580c', '#059669', '#8b5cf6', '#dc2626', '#0891b2', '#b45309', '#e11d48'];

function createBarChart(canvasId, labels, datasets, options = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || CHART_COLORS[i % CHART_COLORS.length],
      borderRadius: 4,
    }))},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: datasets.length > 1, position: 'top' } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } },
      },
      ...options,
    },
  });
}

function createStackedBarChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || CHART_COLORS[i % CHART_COLORS.length],
    }))},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, grid: { color: '#e2e8f0' } },
      },
    },
  });
}

function createPieChart(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors || CHART_COLORS.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } },
    },
  });
}

function createHistogram(canvasId, labels, data, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Count', data, backgroundColor: color || CHART_COLORS[0], borderRadius: 2 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Number of Supports' }, grid: { color: '#e2e8f0' } },
        x: { title: { display: true, text: 'Days' }, grid: { display: false } },
      },
    },
  });
}
