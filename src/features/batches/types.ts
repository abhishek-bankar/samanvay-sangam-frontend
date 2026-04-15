export const BATCH_STATUS = {
  NEW: "New",
  PARTIALLY_SYNCED: "Partially Synced",
  SYNCED: "Synced",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

export type BatchStatus = (typeof BATCH_STATUS)[keyof typeof BATCH_STATUS];

export interface Batch {
  name: string;
  batchName: string;
  projectId: string;
  modelFilePath: string;
  excelFilePath: string;
  folderPath: string;
  supportCount: number;
  syncedCount: number;
  unsyncedCount: number;
  lastSyncedAt: string;
  status: BatchStatus;
}

export const SUPPORT_STATUS = {
  NEW: "New",
  READY_TO_ASSIGN: "Ready to Assign",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  NEEDS_REWORK: "Needs Rework",
  CLIENT_RETURNED: "Client Returned",
  WITH_CLIENT: "With Client",
  COMPLETED: "Completed",
} as const;

export type SupportStatus = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS];

export const REVISION_TYPES = ["IFR", "RIFR", "IFC"] as const;

export type RevisionType = (typeof REVISION_TYPES)[number];

export interface Support {
  name: string;
  supportTagId: string;
  batchId: string;
  drawingNo: string;
  revision: string;
  level: string;
  presentStatus: string;
  remarks: string;
  status: SupportStatus;
  assignedTo: string;
  revisionNumber: number;
  revisionType: RevisionType;
  filePath: string;
  markupPdfPath: string;
  assignedAt: string;
  submittedAt: string;
  reviewedAt: string;
  tatHours: number;
}

export interface ParsedSupportRow {
  supportTagId: string;
  drawingNo: string;
  revision: string;
  level: string;
  presentStatus: string;
  remarks: string;
}
