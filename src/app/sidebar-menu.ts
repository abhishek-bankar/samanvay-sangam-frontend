import type { SangamRole } from "@/features/auth/types";

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiredRoles: SangamRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    requiredRoles: ["SANGAM PM", "SANGAM SME", "SANGAM QC", "SANGAM Actionee"],
  },
  {
    label: "My Work",
    path: "/my-work",
    icon: "ClipboardList",
    requiredRoles: ["SANGAM PM", "SANGAM SME", "SANGAM QC", "SANGAM Actionee"],
  },
  {
    label: "Support Register",
    path: "/supports",
    icon: "FileText",
    requiredRoles: ["SANGAM PM", "SANGAM SME"],
  },
  {
    label: "Assignment",
    path: "/assignment",
    icon: "UserPlus",
    requiredRoles: ["SANGAM PM", "SANGAM SME"],
  },
  {
    label: "Review Queue",
    path: "/review",
    icon: "CheckSquare",
    requiredRoles: ["SANGAM PM", "SANGAM SME"],
  },
  {
    label: "Rejected Pool",
    path: "/rejected-pool",
    icon: "AlertTriangle",
    requiredRoles: ["SANGAM PM", "SANGAM SME", "SANGAM QC"],
  },
  {
    label: "Send to Client",
    path: "/send-to-client",
    icon: "Send",
    requiredRoles: ["SANGAM PM"],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: "BarChart3",
    requiredRoles: ["SANGAM PM", "SANGAM SME"],
  },
  {
    label: "Batch Management",
    path: "/batches",
    icon: "FolderOpen",
    requiredRoles: ["SANGAM PM"],
  },
];

export function getVisibleMenuItems(userRoles: SangamRole[]): MenuItem[] {
  return MENU_ITEMS.filter((item) =>
    item.requiredRoles.some((role) => userRoles.includes(role)),
  );
}
