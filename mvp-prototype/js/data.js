// ============================================================
// SANGAM MVP Prototype — Mock Data
// ============================================================

const ROLES = {
  PM: "SANGAM PM",
  SME: "SANGAM SME",
  ACTIONEE: "SANGAM Actionee",
  QC: "SANGAM QC",
  CLIENT: "SANGAM Client",
};

const REVISION_TYPES = {
  IFR: "IFR",   // Issued For Review
  RIFR: "RIFR", // Re-Issued For Review
  IFC: "IFC",   // Issued For Construction
};

const SUPPORT_STATUS = {
  NEW: "New",
  READY_TO_ASSIGN: "Ready to Assign",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  NEEDS_REWORK: "Needs Rework",
  CLIENT_RETURNED: "Client Returned",
  WITH_CLIENT: "With Client",
  COMPLETED: "Completed",
};

const STATUS_COLORS = {
  "New": "#6b7280",
  "Ready to Assign": "#8b5cf6",
  "In Progress": "#3b82f6",
  "Under Review": "#6366f1",
  "Approved": "#10b981",
  "Needs Rework": "#ef4444",
  "Client Returned": "#f43f5e",
  "With Client": "#06b6d4",
  "Completed": "#22c55e",
};

// Role hierarchy: PM > SME > QC > Actionee
const ROLE_HIERARCHY = {
  [ROLES.PM]: 4,
  [ROLES.SME]: 3,
  [ROLES.QC]: 2,
  [ROLES.ACTIONEE]: 1,
  [ROLES.CLIENT]: 0,
};

// --- Users ---
const USERS = [
  { name: "Abhishek Bankar", email: "abhishek@inventivebiz.com", roles: [ROLES.PM] },
  { name: "Rajesh Kumar", email: "rajesh@inventivebiz.com", roles: [ROLES.SME] },
  { name: "Ramesh Patil", email: "ramesh@inventivebiz.com", roles: [ROLES.ACTIONEE] },
  { name: "Priya Sharma", email: "priya@inventivebiz.com", roles: [ROLES.ACTIONEE] },
  { name: "Amit Desai", email: "amit@inventivebiz.com", roles: [ROLES.ACTIONEE, ROLES.QC] },
  { name: "Sunil Verma", email: "sunil@inventivebiz.com", roles: [ROLES.QC] },
  { name: "Saudi Aramco", email: "client@aramco.com", roles: [ROLES.CLIENT] },
];

// --- Projects ---
const PROJECTS = [
  {
    id: "PROJ-001",
    name: "MRJNGOSP2EAP",
    description: "Marine Jacket GOSP2 EAP - Cable Tray Supports",
    client: "Saudi Aramco",
    createdBy: "Abhishek Bankar",
    createdAt: "2026-03-15",
    status: "Active",
    batchCount: 3,
    totalSupports: 285,
  },
];

// --- Batches ---
const BATCHES = [
  {
    id: "BATCH-001",
    projectId: "PROJ-001",
    name: "2026-03-20_BATCH-001_a4f2",
    folderPath: "\\\\sangam-server\\projects\\MRJNGOSP2EAP\\2026-03-20_BATCH-001_a4f2",
    createdBy: "Abhishek Bankar",
    createdAt: "2026-03-20",
    navisworksFile: "GOSP2_Model_Rev3.nwf",
    navisworksSize: "245 MB",
    excelFile: "MRJNGOSP2EAP-CTS list.xlsx",
    excelSize: "48 KB",
    supportCount: 122,
    status: "In Progress",
  },
  {
    id: "BATCH-002",
    projectId: "PROJ-001",
    name: "2026-03-28_BATCH-002_b7e1",
    folderPath: "\\\\sangam-server\\projects\\MRJNGOSP2EAP\\2026-03-28_BATCH-002_b7e1",
    createdBy: "Abhishek Bankar",
    createdAt: "2026-03-28",
    navisworksFile: "GOSP2_Model_Rev4.nwf",
    navisworksSize: "252 MB",
    excelFile: "MRJNGOSP2EAP-CTS list_v2.xlsx",
    excelSize: "52 KB",
    supportCount: 126,
    status: "In Progress",
  },
  {
    id: "BATCH-003",
    projectId: "PROJ-001",
    name: "2026-04-05_BATCH-003_c9d3",
    folderPath: "\\\\sangam-server\\projects\\MRJNGOSP2EAP\\2026-04-05_BATCH-003_c9d3",
    createdBy: "Abhishek Bankar",
    createdAt: "2026-04-05",
    navisworksFile: "GOSP2_Model_Rev5.nwf",
    navisworksSize: "260 MB",
    excelFile: "GOSP4-CTS list.xlsx",
    excelSize: "38 KB",
    supportCount: 37,
    status: "New",
  },
];

// --- Supports (sample from batches) ---
function generateSupports() {
  const supports = [];
  const actionees = ["Ramesh Patil", "Priya Sharma", "Amit Desai"];
  const levels = ["Below Cellar deck", "Cellar deck", "Main deck", "Upper deck", "Weather deck"];
  // Batch 1: 122 supports in various states
  for (let i = 1; i <= 122; i++) {
    const num = String(i).padStart(4, "0");
    const tagId = `CTS-01-${num}`;
    let status, assignedTo, revision, revisionType, submittedAt, assignedAt;

    if (i <= 15) {
      status = SUPPORT_STATUS.COMPLETED;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFC;
      assignedAt = "2026-03-21";
      submittedAt = "2026-03-23";
    } else if (i <= 30) {
      status = SUPPORT_STATUS.WITH_CLIENT;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = "2026-03-21";
      submittedAt = "2026-03-24";
    } else if (i <= 45) {
      status = SUPPORT_STATUS.APPROVED;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = "2026-03-22";
      submittedAt = "2026-03-25";
    } else if (i <= 55) {
      status = SUPPORT_STATUS.UNDER_REVIEW;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = "2026-03-22";
      submittedAt = "2026-03-26";
    } else if (i <= 65) {
      status = SUPPORT_STATUS.UNDER_REVIEW;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = "2026-03-23";
      submittedAt = "2026-04-01";
    } else if (i <= 80) {
      status = SUPPORT_STATUS.IN_PROGRESS;
      assignedTo = actionees[i % 3];
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = "2026-04-01";
      submittedAt = null;
    } else if (i <= 90) {
      status = SUPPORT_STATUS.NEEDS_REWORK;
      assignedTo = null;
      revision = "B";
      revisionType = REVISION_TYPES.RIFR;
      assignedAt = null;
      submittedAt = null;
    } else if (i <= 95) {
      status = SUPPORT_STATUS.CLIENT_RETURNED;
      assignedTo = null;
      revision = "B";
      revisionType = REVISION_TYPES.RIFR;
      assignedAt = null;
      submittedAt = null;
    } else if (i <= 110) {
      status = SUPPORT_STATUS.READY_TO_ASSIGN;
      assignedTo = null;
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = null;
      submittedAt = null;
    } else {
      status = SUPPORT_STATUS.NEW;
      assignedTo = null;
      revision = "A";
      revisionType = REVISION_TYPES.IFR;
      assignedAt = null;
      submittedAt = null;
    }

    supports.push({
      id: `SUP-${String(supports.length + 1).padStart(4, "0")}`,
      tagId,
      drawingNo: tagId,
      batchId: "BATCH-001",
      projectId: "PROJ-001",
      status,
      assignedTo,
      revision,
      revisionType,
      level: levels[i % levels.length],
      presentStatus: i <= 60 ? "Existing" : "New",
      remarks: i % 20 === 0 ? "Priority support" : "",
      assignedAt,
      submittedAt,
      approvedAt: status === SUPPORT_STATUS.APPROVED || status === SUPPORT_STATUS.WITH_CLIENT || status === SUPPORT_STATUS.COMPLETED ? "2026-03-28" : null,
      filePath: `\\\\sangam-server\\projects\\MRJNGOSP2EAP\\2026-03-20_BATCH-001_a4f2\\${getFolderForStatus(status)}\\${tagId}.dwg`,
      markupPdfPath: (status === SUPPORT_STATUS.NEEDS_REWORK || status === SUPPORT_STATUS.CLIENT_RETURNED) ? `\\\\sangam-server\\...\\${tagId}_markup.pdf` : null,
    });
  }

  // Batch 2: fewer supports, mostly early stages
  for (let i = 1; i <= 30; i++) {
    const num = String(i).padStart(4, "0");
    const tagId = `CTS-02-${num}`;
    let status = i <= 10 ? SUPPORT_STATUS.READY_TO_ASSIGN : SUPPORT_STATUS.NEW;

    supports.push({
      id: `SUP-${String(supports.length + 1).padStart(4, "0")}`,
      tagId,
      drawingNo: tagId,
      batchId: "BATCH-002",
      projectId: "PROJ-001",
      status,
      assignedTo: null,
      revision: "A",
      revisionType: REVISION_TYPES.IFR,
      level: levels[i % levels.length],
      presentStatus: "New",
      remarks: "",
      assignedAt: null,
      submittedAt: null,
      approvedAt: null,
      filePath: `\\\\sangam-server\\projects\\MRJNGOSP2EAP\\2026-03-28_BATCH-002_b7e1\\03_cleaned\\${tagId}.dwg`,
      markupPdfPath: null,
    });
  }

  return supports;
}

function getFolderForStatus(status) {
  const map = {
    "New": "01_input",
    "Ready to Assign": "03_cleaned",
    "In Progress": "04_assigned",
    "Under Review": "05_submitted",
    "Approved": "07_approved",
    "Needs Rework": "04a_rejected_pool",
    "Client Returned": "04a_rejected_pool",
    "With Client": "08_client_review",
    "Completed": "09_client_final",
  };
  return map[status] || "03_cleaned";
}

const SUPPORTS = generateSupports();

// --- Analytics helpers ---
function getStatusCounts(batchId) {
  const filtered = batchId ? SUPPORTS.filter(s => s.batchId === batchId) : SUPPORTS;
  const counts = {};
  filtered.forEach(s => {
    counts[s.status] = (counts[s.status] || 0) + 1;
  });
  return counts;
}

function getActioneeTAT() {
  const tats = {};
  SUPPORTS.filter(s => s.assignedAt && s.submittedAt).forEach(s => {
    if (!tats[s.assignedTo]) tats[s.assignedTo] = [];
    const days = Math.round((new Date(s.submittedAt) - new Date(s.assignedAt)) / (1000 * 60 * 60 * 24));
    tats[s.assignedTo].push(days);
  });
  const result = {};
  Object.keys(tats).forEach(name => {
    const arr = tats[name];
    result[name] = {
      avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1),
      count: arr.length,
    };
  });
  return result;
}

function getRejectionRates() {
  const rates = {};
  const actionees = ["Ramesh Patil", "Priya Sharma", "Amit Desai"];
  actionees.forEach(name => {
    const total = SUPPORTS.filter(s => s.assignedTo === name).length;
    const rejected = SUPPORTS.filter(s => s.assignedTo === name && s.revision !== "A").length;
    rates[name] = {
      total,
      rejected,
      rate: total > 0 ? ((rejected / total) * 100).toFixed(1) + "%" : "0%",
    };
  });
  return rates;
}
