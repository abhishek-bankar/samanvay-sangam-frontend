// Samanvay SANGAM — Mock Data
// Single source of truth for all prototype data

// ============ CONSTANTS ============

const SUPPORT_STATUSES = [
  'Unassigned', 'Assigned', 'In Progress', 'Submitted', 'Under SME Review',
  'SME Rejected', 'SME Approved', 'Sent to Client', 'Client Approved', 'Client Rejected', 'Rework In Progress'
];

const BATCH_STATUSES = ['New', 'In Progress', 'Under Review', 'Completed'];

const ROLES = ['PM', 'SME', 'Actionee', 'Client'];

const STATUS_BADGE_CLASS = {
  'Unassigned': 'badge-unassigned',
  'Assigned': 'badge-assigned',
  'In Progress': 'badge-in-progress',
  'Submitted': 'badge-submitted',
  'Under SME Review': 'badge-under-sme-review',
  'SME Rejected': 'badge-sme-rejected',
  'SME Approved': 'badge-sme-approved',
  'Sent to Client': 'badge-sent-to-client',
  'Client Approved': 'badge-client-approved',
  'Client Rejected': 'badge-client-rejected',
  'Rework In Progress': 'badge-rework-in-progress',
};

const BATCH_STATUS_BADGE_CLASS = {
  'New': 'badge-batch-new',
  'In Progress': 'badge-batch-in-progress',
  'Under Review': 'badge-batch-under-review',
  'Completed': 'badge-batch-completed',
};

const ROLE_BADGE_CLASS = {
  'PM': 'badge-role-pm',
  'SME': 'badge-role-sme',
  'Actionee': 'badge-role-actionee',
  'Client': 'badge-role-client',
};

// Status transition rules
const STATUS_TRANSITIONS = {
  'Unassigned':        ['Assigned'],
  'Assigned':          ['In Progress'],
  'In Progress':       ['Submitted'],
  'Submitted':         ['Under SME Review'],
  'Under SME Review':  ['SME Approved', 'SME Rejected'],
  'SME Rejected':      ['Rework In Progress'],
  'Rework In Progress':['Submitted'],
  'SME Approved':      ['Sent to Client'],
  'Sent to Client':    ['Client Approved', 'Client Rejected'],
  'Client Rejected':   ['Rework In Progress'],
  'Client Approved':   [],
};

// Tab visibility per role
const TAB_VISIBILITY = {
  'PM':       ['Dashboard', 'Batches', 'Support Register', 'Assignments', 'Analytics', 'Configuration'],
  'SME':      ['Dashboard', 'Batches', 'Support Register', 'Assignments', 'Review', 'Analytics'],
  'Actionee': ['Dashboard', 'My Work'],
  'Client':   ['Dashboard', 'Batches', 'Client Review'],
};

// ============ USERS ============

const USERS = [
  // Project Managers
  { id: 'USR-001', name: 'Abhishek Bankar', email: 'abhishek@inventivebiz.com', role: 'PM' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya@inventivebiz.com', role: 'PM' },
  // SMEs
  { id: 'USR-003', name: 'Rajesh Patil', email: 'rajesh@inventivebiz.com', role: 'SME' },
  { id: 'USR-004', name: 'Sneha Deshmukh', email: 'sneha@inventivebiz.com', role: 'SME' },
  { id: 'USR-005', name: 'Vikram Singh', email: 'vikram@inventivebiz.com', role: 'SME' },
  // Actionees
  { id: 'USR-006', name: 'Amit Kumar', email: 'amit@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-007', name: 'Pooja Joshi', email: 'pooja@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-008', name: 'Suresh Nair', email: 'suresh@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-009', name: 'Kavitha Reddy', email: 'kavitha@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-010', name: 'Ravi Verma', email: 'ravi@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-011', name: 'Deepa Iyer', email: 'deepa@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-012', name: 'Manoj Gupta', email: 'manoj@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-013', name: 'Anita Pillai', email: 'anita@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-014', name: 'Sanjay Tiwari', email: 'sanjay@inventivebiz.com', role: 'Actionee' },
  { id: 'USR-015', name: 'Meera Kulkarni', email: 'meera@inventivebiz.com', role: 'Actionee' },
  // Clients
  { id: 'USR-020', name: 'James Wilson', email: 'james@technipfmc.com', role: 'Client', company: 'TechnipFMC' },
  { id: 'USR-021', name: 'Sarah Chen', email: 'sarah@woodplc.com', role: 'Client', company: 'Wood PLC' },
];

const ACTIONEES = USERS.filter(u => u.role === 'Actionee');
const SMES = USERS.filter(u => u.role === 'SME');
const PMS = USERS.filter(u => u.role === 'PM');
const CLIENTS = USERS.filter(u => u.role === 'Client');

// ============ PROJECTS ============

const PROJECTS = [
  {
    id: 'PRJ-001',
    name: 'Hassi Messaoud Gas Processing',
    client: 'TechnipFMC',
    clientUserId: 'USR-020',
    status: 'Active',
    phase: 'Detailed Engineering',
    pmId: 'USR-001',
    smeIds: ['USR-003', 'USR-004'],
    actioneeIds: ['USR-006', 'USR-007', 'USR-008', 'USR-009', 'USR-010'],
    createdAt: '2025-11-15',
  },
  {
    id: 'PRJ-002',
    name: 'Jubail Refinery Expansion',
    client: 'Wood PLC',
    clientUserId: 'USR-021',
    status: 'Active',
    phase: 'Front-End Engineering',
    pmId: 'USR-001',
    smeIds: ['USR-005'],
    actioneeIds: ['USR-011', 'USR-012', 'USR-013'],
    createdAt: '2026-01-08',
  },
  {
    id: 'PRJ-003',
    name: 'Ras Tanura Piping Retrofit',
    client: 'TechnipFMC',
    clientUserId: 'USR-020',
    status: 'Planning',
    phase: 'Concept Design',
    pmId: 'USR-002',
    smeIds: ['USR-003'],
    actioneeIds: ['USR-014', 'USR-015'],
    createdAt: '2026-03-01',
  },
];

// ============ BATCHES ============

const BATCHES = [
  { id: 'B-2025-001', projectId: 'PRJ-001', name: 'Batch 1 — Area A Pipe Rack', status: 'Completed', supportCount: 40, submittedBy: 'USR-020', submittedAt: '2025-12-01', completedAt: '2026-01-15' },
  { id: 'B-2025-002', projectId: 'PRJ-001', name: 'Batch 2 — Area B Equipment', status: 'In Progress', supportCount: 55, submittedBy: 'USR-020', submittedAt: '2026-01-10', completedAt: null },
  { id: 'B-2025-003', projectId: 'PRJ-001', name: 'Batch 3 — Area C Utilities', status: 'Under Review', supportCount: 35, submittedBy: 'USR-001', submittedAt: '2026-02-15', completedAt: null },
  { id: 'B-2026-001', projectId: 'PRJ-001', name: 'Batch 4 — Area A Revision', status: 'New', supportCount: 20, submittedBy: 'USR-020', submittedAt: '2026-03-20', completedAt: null },
  { id: 'B-2026-002', projectId: 'PRJ-002', name: 'Batch 1 — Unit 100 Supports', status: 'In Progress', supportCount: 45, submittedBy: 'USR-021', submittedAt: '2026-01-20', completedAt: null },
  { id: 'B-2026-003', projectId: 'PRJ-002', name: 'Batch 2 — Unit 200 Supports', status: 'New', supportCount: 30, submittedBy: 'USR-021', submittedAt: '2026-03-10', completedAt: null },
  { id: 'B-2026-004', projectId: 'PRJ-003', name: 'Batch 1 — Section 1 Piping', status: 'New', supportCount: 25, submittedBy: 'USR-020', submittedAt: '2026-03-15', completedAt: null },
  { id: 'B-2026-005', projectId: 'PRJ-003', name: 'Batch 2 — Section 2 Piping', status: 'New', supportCount: 15, submittedBy: 'USR-002', submittedAt: '2026-03-25', completedAt: null },
];

// ============ SUPPORTS — 150+ records ============

function generateSupports() {
  const supports = [];
  let counter = 1;

  // Distribution target per status (approximate)
  const distributions = {
    'PRJ-001': {
      'B-2025-001': { total: 40, statuses: { 'Client Approved': 38, 'Sent to Client': 2 }},
      'B-2025-002': { total: 55, statuses: { 'Unassigned': 5, 'Assigned': 8, 'In Progress': 10, 'Submitted': 3, 'Under SME Review': 7, 'SME Rejected': 3, 'SME Approved': 10, 'Sent to Client': 5, 'Client Approved': 2, 'Client Rejected': 1, 'Rework In Progress': 1 }},
      'B-2025-003': { total: 35, statuses: { 'Under SME Review': 5, 'SME Approved': 15, 'Sent to Client': 10, 'Client Approved': 3, 'Client Rejected': 2 }},
      'B-2026-001': { total: 20, statuses: { 'Unassigned': 20 }},
    },
    'PRJ-002': {
      'B-2026-002': { total: 45, statuses: { 'Unassigned': 3, 'Assigned': 6, 'In Progress': 8, 'Under SME Review': 5, 'SME Rejected': 2, 'SME Approved': 8, 'Sent to Client': 6, 'Client Approved': 5, 'Rework In Progress': 2 }},
      'B-2026-003': { total: 30, statuses: { 'Unassigned': 30 }},
    },
    'PRJ-003': {
      'B-2026-004': { total: 25, statuses: { 'Unassigned': 15, 'Assigned': 5, 'In Progress': 5 }},
      'B-2026-005': { total: 15, statuses: { 'Unassigned': 15 }},
    }
  };

  // Duplicate pairs (same Support Tag ID in different batches)
  const duplicateTags = ['SP-2025--001', 'SP-2025--015', 'SP-2025--022', 'SP-2025--010', 'SP-2026--005'];

  for (const [projectId, batches] of Object.entries(distributions)) {
    const project = PROJECTS.find(p => p.id === projectId);
    for (const [batchId, config] of Object.entries(batches)) {
      let batchCounter = 1;
      for (const [status, count] of Object.entries(config.statuses)) {
        for (let i = 0; i < count; i++) {
          const tagPrefix = batchId.replace('B-', 'SP-').substring(0, 8);
          const tagId = `${tagPrefix}-${String(batchCounter).padStart(3, '0')}`;
          const isDuplicate = duplicateTags.includes(tagId);

          // Pick actionee from project's actionee pool
          const actioneeIdx = (counter - 1) % project.actioneeIds.length;
          const actioneeId = project.actioneeIds[actioneeIdx];
          const smeIdx = (counter - 1) % project.smeIds.length;
          const smeId = project.smeIds[smeIdx];

          // Calculate dates based on status
          const baseDate = new Date('2026-01-15');
          baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 60));
          const assignedDate = new Date(baseDate);
          assignedDate.setDate(assignedDate.getDate() + Math.floor(Math.random() * 5));
          const submittedDate = new Date(assignedDate);
          submittedDate.setDate(submittedDate.getDate() + Math.floor(Math.random() * 10) + 1);

          // Revision based on status
          let revision = 'A';
          if (['SME Rejected', 'Client Rejected', 'Rework In Progress'].includes(status)) {
            revision = 'B';
          }
          if (status === 'Client Approved' && Math.random() > 0.7) {
            revision = 'B';
          }

          const needsAssignment = status !== 'Unassigned';
          const tat = needsAssignment ? Math.floor(Math.random() * 15) + 1 : null;

          supports.push({
            id: `SUP-${String(counter).padStart(4, '0')}`,
            tagId,
            projectId,
            batchId,
            status,
            revision,
            assignedTo: needsAssignment ? actioneeId : null,
            assignedBy: needsAssignment ? smeId : null,
            assignedAt: needsAssignment ? assignedDate.toISOString().split('T')[0] : null,
            submittedAt: ['Submitted', 'Under SME Review', 'SME Rejected', 'SME Approved', 'Sent to Client', 'Client Approved', 'Client Rejected', 'Rework In Progress'].includes(status) ? submittedDate.toISOString().split('T')[0] : null,
            turnaroundDays: tat,
            dwgFile: `${tagId}_Rev${revision}.dwg`,
            isDuplicate,
            duplicateOf: isDuplicate ? `B-2025-001` : null,
            createdAt: baseDate.toISOString().split('T')[0],
          });

          counter++;
          batchCounter++;
        }
      }
    }
  }
  return supports;
}

const SUPPORTS = generateSupports();

// ============ COMMENTS ============

function generateComments() {
  const comments = [];
  let commentId = 1;

  // Generate comments for supports that have been through review
  const reviewedSupports = SUPPORTS.filter(s =>
    ['Under SME Review', 'SME Rejected', 'SME Approved', 'Sent to Client', 'Client Approved', 'Client Rejected', 'Rework In Progress'].includes(s.status)
  );

  reviewedSupports.forEach(support => {
    const sme = USERS.find(u => u.id === support.assignedBy) || SMES[0];
    const actionee = USERS.find(u => u.id === support.assignedTo) || ACTIONEES[0];

    // Internal comment: SME feedback
    if (['SME Rejected', 'Rework In Progress'].includes(support.status)) {
      comments.push({
        id: `CMT-${String(commentId++).padStart(4, '0')}`,
        supportId: support.id,
        type: 'internal',
        author: sme.name,
        authorRole: 'SME',
        content: getRandomRejectionComment(),
        createdAt: support.submittedAt || '2026-03-01',
      });
      // Actionee response
      if (support.status === 'Rework In Progress') {
        comments.push({
          id: `CMT-${String(commentId++).padStart(4, '0')}`,
          supportId: support.id,
          type: 'internal',
          author: actionee.name,
          authorRole: 'Actionee',
          content: 'Understood. Working on the corrections now.',
          createdAt: support.submittedAt || '2026-03-02',
        });
      }
    }

    // SME approved comment
    if (['SME Approved', 'Sent to Client', 'Client Approved'].includes(support.status) && Math.random() > 0.5) {
      comments.push({
        id: `CMT-${String(commentId++).padStart(4, '0')}`,
        supportId: support.id,
        type: 'internal',
        author: sme.name,
        authorRole: 'SME',
        content: 'Reviewed and approved. Good work on the support detailing.',
        createdAt: support.submittedAt || '2026-03-01',
      });
    }

    // External comments for client-stage supports
    if (['Sent to Client', 'Client Approved', 'Client Rejected'].includes(support.status)) {
      const project = PROJECTS.find(p => p.id === support.projectId);
      const client = USERS.find(u => u.id === project.clientUserId) || CLIENTS[0];

      if (support.status === 'Client Rejected') {
        comments.push({
          id: `CMT-${String(commentId++).padStart(4, '0')}`,
          supportId: support.id,
          type: 'external',
          author: client.name,
          authorRole: 'Client',
          content: getRandomClientRejectionComment(),
          createdAt: '2026-03-15',
        });
      }
      if (support.status === 'Client Approved' && Math.random() > 0.6) {
        comments.push({
          id: `CMT-${String(commentId++).padStart(4, '0')}`,
          supportId: support.id,
          type: 'external',
          author: client.name,
          authorRole: 'Client',
          content: 'Looks good. Approved.',
          createdAt: '2026-03-18',
        });
      }
    }
  });

  return comments;
}

function getRandomRejectionComment() {
  const comments = [
    'Support clamp orientation is incorrect. Please rotate 90 degrees and re-verify against the isometric.',
    'Shoe plate dimensions do not match spec. Check Table 4.2 in the design standard.',
    'Missing weld symbol at the base plate connection. Please add per ASME B31.3.',
    'Bolt hole pattern incorrect — should be 4x M20, not 4x M16. Verify against vendor drawing.',
    'Support elevation is 50mm off from the pipe routing. Re-check against model.',
    'Insulation clearance not maintained. Minimum 25mm gap required per project spec.',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

function getRandomClientRejectionComment() {
  const comments = [
    'This support interferes with the cable tray routing in our latest model revision. Please coordinate with electrical discipline.',
    'Support type does not match our standard. Please use Type B spring hanger for this location.',
    'Elevation conflicts with the platform at EL+8500. Please revise.',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

const COMMENTS = generateComments();

// ============ ACTIVITY LOGS ============

function generateActivityLogs() {
  const logs = [];
  let logId = 1;

  SUPPORTS.forEach(support => {
    const sme = USERS.find(u => u.id === support.assignedBy) || SMES[0];
    const actionee = USERS.find(u => u.id === support.assignedTo) || ACTIONEES[0];
    const pm = PMS[0];
    const baseDate = new Date(support.createdAt);

    // Created
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: 'Support created',
      fromStatus: null,
      toStatus: 'Unassigned',
      user: pm.name,
      userRole: 'PM',
      timestamp: baseDate.toISOString(),
    });

    if (support.status === 'Unassigned') return;

    // Assigned
    const d1 = new Date(baseDate); d1.setDate(d1.getDate() + 1);
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: `Assigned to ${actionee.name}`,
      fromStatus: 'Unassigned',
      toStatus: 'Assigned',
      user: sme.name,
      userRole: 'SME',
      timestamp: d1.toISOString(),
    });

    if (support.status === 'Assigned') return;

    // In Progress
    const d2 = new Date(d1); d2.setDate(d2.getDate() + 1);
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: 'Work started',
      fromStatus: 'Assigned',
      toStatus: 'In Progress',
      user: actionee.name,
      userRole: 'Actionee',
      timestamp: d2.toISOString(),
    });

    if (support.status === 'In Progress') return;

    // Submitted
    const d3 = new Date(d2); d3.setDate(d3.getDate() + Math.floor(Math.random() * 5) + 1);
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: 'Work submitted for review',
      fromStatus: 'In Progress',
      toStatus: 'Under SME Review',
      user: actionee.name,
      userRole: 'Actionee',
      timestamp: d3.toISOString(),
    });

    if (['Submitted', 'Under SME Review'].includes(support.status)) return;

    // SME decision
    const d4 = new Date(d3); d4.setDate(d4.getDate() + 2);
    if (['SME Rejected', 'Rework In Progress'].includes(support.status)) {
      logs.push({
        id: `LOG-${String(logId++).padStart(4, '0')}`,
        supportId: support.id,
        action: 'Rejected by SME',
        fromStatus: 'Under SME Review',
        toStatus: 'SME Rejected',
        user: sme.name,
        userRole: 'SME',
        timestamp: d4.toISOString(),
      });
      if (support.status === 'Rework In Progress') {
        const d5 = new Date(d4); d5.setDate(d5.getDate() + 1);
        logs.push({
          id: `LOG-${String(logId++).padStart(4, '0')}`,
          supportId: support.id,
          action: 'Rework started',
          fromStatus: 'SME Rejected',
          toStatus: 'Rework In Progress',
          user: actionee.name,
          userRole: 'Actionee',
          timestamp: d5.toISOString(),
        });
      }
      return;
    }

    // SME Approved
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: 'Approved by SME',
      fromStatus: 'Under SME Review',
      toStatus: 'SME Approved',
      user: sme.name,
      userRole: 'SME',
      timestamp: d4.toISOString(),
    });

    if (support.status === 'SME Approved') return;

    // Sent to Client
    const d5 = new Date(d4); d5.setDate(d5.getDate() + 1);
    logs.push({
      id: `LOG-${String(logId++).padStart(4, '0')}`,
      supportId: support.id,
      action: 'Sent to client for review',
      fromStatus: 'SME Approved',
      toStatus: 'Sent to Client',
      user: pm.name,
      userRole: 'PM',
      timestamp: d5.toISOString(),
    });

    if (support.status === 'Sent to Client') return;

    // Client decision
    const d6 = new Date(d5); d6.setDate(d6.getDate() + 3);
    const project = PROJECTS.find(p => p.id === support.projectId);
    const client = USERS.find(u => u.id === project.clientUserId) || CLIENTS[0];

    if (support.status === 'Client Rejected') {
      logs.push({
        id: `LOG-${String(logId++).padStart(4, '0')}`,
        supportId: support.id,
        action: 'Rejected by client',
        fromStatus: 'Sent to Client',
        toStatus: 'Client Rejected',
        user: client.name,
        userRole: 'Client',
        timestamp: d6.toISOString(),
      });
    } else if (support.status === 'Client Approved') {
      logs.push({
        id: `LOG-${String(logId++).padStart(4, '0')}`,
        supportId: support.id,
        action: 'Approved by client',
        fromStatus: 'Sent to Client',
        toStatus: 'Client Approved',
        user: client.name,
        userRole: 'Client',
        timestamp: d6.toISOString(),
      });
    }
  });

  return logs;
}

const ACTIVITY_LOGS = generateActivityLogs();

// ============ REVISION HISTORY ============

function generateRevisions() {
  const revisions = [];
  SUPPORTS.forEach(support => {
    revisions.push({
      supportId: support.id,
      revision: 'A',
      trigger: 'Initial extraction',
      createdAt: support.createdAt,
      dwgFile: `${support.tagId}_RevA.dwg`,
    });
    if (['B', 'C'].includes(support.revision)) {
      const d = new Date(support.createdAt);
      d.setDate(d.getDate() + 10);
      revisions.push({
        supportId: support.id,
        revision: 'B',
        trigger: support.status === 'Client Rejected' ? 'Client rejection' : 'SME rejection',
        createdAt: d.toISOString().split('T')[0],
        dwgFile: `${support.tagId}_RevB.dwg`,
      });
    }
    if (support.revision === 'C') {
      const d = new Date(support.createdAt);
      d.setDate(d.getDate() + 20);
      revisions.push({
        supportId: support.id,
        revision: 'C',
        trigger: 'Client rejection (2nd cycle)',
        createdAt: d.toISOString().split('T')[0],
        dwgFile: `${support.tagId}_RevC.dwg`,
      });
    }
  });
  return revisions;
}

const REVISIONS = generateRevisions();

// ============ HELPER FUNCTIONS ============

function getProjectSupports(projectId) {
  return SUPPORTS.filter(s => s.projectId === projectId);
}

function getBatchSupports(batchId) {
  return SUPPORTS.filter(s => s.batchId === batchId);
}

function getProjectBatches(projectId) {
  return BATCHES.filter(b => b.projectId === projectId);
}

function getSupportComments(supportId) {
  return COMMENTS.filter(c => c.supportId === supportId);
}

function getSupportLogs(supportId) {
  return ACTIVITY_LOGS.filter(l => l.supportId === supportId);
}

function getSupportRevisions(supportId) {
  return REVISIONS.filter(r => r.supportId === supportId);
}

function getUserName(userId) {
  const user = USERS.find(u => u.id === userId);
  return user ? user.name : '—';
}

function getStatusCounts(supports) {
  const counts = {};
  SUPPORT_STATUSES.forEach(s => counts[s] = 0);
  supports.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });
  counts.total = supports.length;
  return counts;
}

function getDuplicateSupports() {
  return SUPPORTS.filter(s => s.isDuplicate);
}

function getBatchProgress(batchId) {
  const supports = getBatchSupports(batchId);
  const completed = supports.filter(s => s.status === 'Client Approved').length;
  return { total: supports.length, completed, percentage: supports.length ? Math.round((completed / supports.length) * 100) : 0 };
}

function getActioneeStats(projectId) {
  const supports = getProjectSupports(projectId);
  const stats = {};
  ACTIONEES.forEach(a => {
    const mySupports = supports.filter(s => s.assignedTo === a.id);
    if (mySupports.length > 0) {
      stats[a.id] = {
        name: a.name,
        total: mySupports.length,
        completed: mySupports.filter(s => ['SME Approved', 'Sent to Client', 'Client Approved'].includes(s.status)).length,
        rejected: mySupports.filter(s => ['SME Rejected', 'Client Rejected'].includes(s.status)).length,
        inProgress: mySupports.filter(s => ['Assigned', 'In Progress', 'Submitted', 'Under SME Review', 'Rework In Progress'].includes(s.status)).length,
        avgTat: Math.round(mySupports.filter(s => s.turnaroundDays).reduce((sum, s) => sum + s.turnaroundDays, 0) / (mySupports.filter(s => s.turnaroundDays).length || 1)),
      };
    }
  });
  return stats;
}
