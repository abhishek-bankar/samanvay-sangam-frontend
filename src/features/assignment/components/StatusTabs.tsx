import { SUPPORT_STATUS } from "@/features/batches/types";
import { ROLE } from "@/features/auth/types";
import type { SangamRole } from "@/features/auth/types";

export interface TabDefinition {
  label: string;
  value: string;
}

const PM_TABS: TabDefinition[] = [
  { label: "All", value: "all" },
  { label: "New", value: SUPPORT_STATUS.NEW },
  { label: "Ready to Assign", value: SUPPORT_STATUS.READY_TO_ASSIGN },
  { label: "In Progress", value: SUPPORT_STATUS.IN_PROGRESS },
  { label: "Under Review", value: SUPPORT_STATUS.UNDER_REVIEW },
  { label: "Approved", value: SUPPORT_STATUS.APPROVED },
  { label: "Needs Rework", value: SUPPORT_STATUS.NEEDS_REWORK },
  { label: "Client Returned", value: SUPPORT_STATUS.CLIENT_RETURNED },
  { label: "With Client", value: SUPPORT_STATUS.WITH_CLIENT },
  { label: "Completed", value: SUPPORT_STATUS.COMPLETED },
];

const SME_TABS: TabDefinition[] = [
  { label: "Ready to Assign", value: SUPPORT_STATUS.READY_TO_ASSIGN },
  { label: "In Progress", value: SUPPORT_STATUS.IN_PROGRESS },
  { label: "Under Review", value: SUPPORT_STATUS.UNDER_REVIEW },
  { label: "Approved", value: SUPPORT_STATUS.APPROVED },
  { label: "Needs Rework", value: SUPPORT_STATUS.NEEDS_REWORK },
];

const ACTIONEE_TABS: TabDefinition[] = [
  { label: "My Work", value: "my-work" },
  { label: "Submitted", value: "submitted" },
];

export function getTabsForRole(roles: SangamRole[]): { tabs: TabDefinition[]; defaultTab: string } {
  if (roles.includes(ROLE.PM)) {
    return { tabs: PM_TABS, defaultTab: SUPPORT_STATUS.READY_TO_ASSIGN };
  }
  if (roles.includes(ROLE.SME)) {
    return { tabs: SME_TABS, defaultTab: SUPPORT_STATUS.READY_TO_ASSIGN };
  }
  // Actionee or QC
  return { tabs: ACTIONEE_TABS, defaultTab: "my-work" };
}

interface StatusTabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusCounts: Map<string, number>;
  totalCount: number;
}

export function StatusTabs({ tabs, activeTab, onTabChange, statusCounts, totalCount }: StatusTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 border-b pb-1">
        {tabs.map((tab) => {
          const count = tab.value === "all" ? totalCount : (statusCounts.get(tab.value) ?? 0);
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1 py-0.5 text-xs ${
                isActive ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
