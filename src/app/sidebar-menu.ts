import { ROLE, SANGAM_ROLES } from "@/features/auth/types";
import type { SangamRole } from "@/features/auth/types";

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiredRoles: SangamRole[];
}

const ALL_ROLES: SangamRole[] = [...SANGAM_ROLES];
const PM_SME: SangamRole[] = [ROLE.PM, ROLE.SME];

export const GLOBAL_MENU_ITEMS: MenuItem[] = [
  { label: "Projects", path: "/projects", icon: "Briefcase", requiredRoles: ALL_ROLES },
];

export const PROJECT_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard", requiredRoles: ALL_ROLES },
  { label: "Review Queue", path: "/review", icon: "CheckSquare", requiredRoles: PM_SME },
  { label: "Rejected Pool", path: "/rejected-pool", icon: "AlertTriangle", requiredRoles: [ROLE.PM, ROLE.SME, ROLE.QC] },
  { label: "Send to Client", path: "/send-to-client", icon: "Send", requiredRoles: [ROLE.PM] },
  { label: "Analytics", path: "/analytics", icon: "BarChart3", requiredRoles: PM_SME },
  { label: "Batch Management", path: "/batches", icon: "FolderOpen", requiredRoles: [ROLE.PM] },
];

export function getVisibleMenuItems(userRoles: SangamRole[], items: MenuItem[]): MenuItem[] {
  return items.filter((item) =>
    item.requiredRoles.some((role) => userRoles.includes(role)),
  );
}
