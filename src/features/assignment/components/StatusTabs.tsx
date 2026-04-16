import { SUPPORT_STATUS } from "@/features/batches/types";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Ready to Assign", value: SUPPORT_STATUS.READY_TO_ASSIGN },
  { label: "New", value: SUPPORT_STATUS.NEW },
  { label: "In Progress", value: SUPPORT_STATUS.IN_PROGRESS },
  { label: "Under Review", value: SUPPORT_STATUS.UNDER_REVIEW },
  { label: "Approved", value: SUPPORT_STATUS.APPROVED },
  { label: "Needs Rework", value: SUPPORT_STATUS.NEEDS_REWORK },
  { label: "Client Returned", value: SUPPORT_STATUS.CLIENT_RETURNED },
  { label: "With Client", value: SUPPORT_STATUS.WITH_CLIENT },
  { label: "Completed", value: SUPPORT_STATUS.COMPLETED },
] as const;

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusCounts: Map<string, number>;
  totalCount: number;
}

export function StatusTabs({ activeTab, onTabChange, statusCounts, totalCount }: StatusTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 border-b pb-1">
        {STATUS_TABS.map((tab) => {
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
