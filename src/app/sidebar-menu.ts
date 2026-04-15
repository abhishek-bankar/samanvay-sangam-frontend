import type { SangamRole } from "@/features/auth/types";

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiredRoles: SangamRole[];
}

const PM: SangamRole = "SANGAM PM";
const SME: SangamRole = "SANGAM SME";
const QC: SangamRole = "SANGAM QC";
const ACTIONEE: SangamRole = "SANGAM Actionee";

const ALL_ROLES: SangamRole[] = [PM, SME, QC, ACTIONEE];
const PM_SME: SangamRole[] = [PM, SME];

export const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard", requiredRoles: ALL_ROLES },
  { label: "My Work", path: "/my-work", icon: "ClipboardList", requiredRoles: ALL_ROLES },
  { label: "Support Register", path: "/supports", icon: "FileText", requiredRoles: PM_SME },
  { label: "Assignment", path: "/assignment", icon: "UserPlus", requiredRoles: PM_SME },
  { label: "Review Queue", path: "/review", icon: "CheckSquare", requiredRoles: PM_SME },
  { label: "Rejected Pool", path: "/rejected-pool", icon: "AlertTriangle", requiredRoles: [PM, SME, QC] },
  { label: "Send to Client", path: "/send-to-client", icon: "Send", requiredRoles: [PM] },
  { label: "Analytics", path: "/analytics", icon: "BarChart3", requiredRoles: PM_SME },
  { label: "Batch Management", path: "/batches", icon: "FolderOpen", requiredRoles: [PM] },
];

export function getVisibleMenuItems(userRoles: SangamRole[]): MenuItem[] {
  return MENU_ITEMS.filter((item) =>
    item.requiredRoles.some((role) => userRoles.includes(role)),
  );
}
