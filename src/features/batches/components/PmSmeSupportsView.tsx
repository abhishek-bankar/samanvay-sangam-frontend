import { useState } from "react";
import { SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";
import type { TabDefinition } from "@/features/assignment/components/StatusTabs";
import { StatusTabs } from "@/features/assignment/components/StatusTabs";
import { SupportTable } from "@/features/assignment/components/SupportTable";
import { SupportsToolbar } from "@/features/batches/components/SupportsToolbar";
import { SupportsDialogs } from "@/features/batches/components/SupportsDialogs";

function filterSupports(supports: Support[], tab: string, search: string, assignee: string) {
  let result = tab === "all" ? supports : supports.filter((s) => s.status === tab);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((s) => s.supportTagId.toLowerCase().includes(q));
  }
  if (assignee !== "all") {
    result = result.filter((s) => s.assignedTo === assignee);
  }
  return result;
}

function countByStatus(supports: Support[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of supports) {
    counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
  }
  return counts;
}

interface PmSmeSupportsViewProps {
  allSupports: Support[];
  tabs: TabDefinition[];
  defaultTab: string;
  batchFolderPath: string;
  userNameMap: Map<string, string>;
}

export function PmSmeSupportsView({ allSupports, tabs, defaultTab, batchFolderPath, userNameMap }: PmSmeSupportsViewProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openDialog, setOpenDialog] = useState<"assign" | "autoAssign" | "reassign" | "reassignAll" | null>(null);

  const filtered = filterSupports(allSupports, activeTab, search, assigneeFilter);
  const statusCounts = countByStatus(allSupports);
  const isReadyTab = activeTab === SUPPORT_STATUS.READY_TO_ASSIGN;
  const isInProgressTab = activeTab === SUPPORT_STATUS.IN_PROGRESS;
  const showCheckboxes = isReadyTab || isInProgressTab;
  const selectedSupports = filtered.filter((s) => selected.has(s.name));

  const tabSupports = activeTab === "all" ? allSupports : allSupports.filter((s) => s.status === activeTab);
  const assigneesInTab = [...new Set(tabSupports.map((s) => s.assignedTo).filter(Boolean))]
    .map((email) => ({ email, fullName: userNameMap.get(email) ?? email }));

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setSelected(new Set());
    setAssigneeFilter("all");
  }

  function handleClose() {
    setOpenDialog(null);
    setSelected(new Set());
  }

  return (
    <div className="space-y-4">
      <StatusTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        statusCounts={statusCounts}
        totalCount={allSupports.length}
      />

      <SupportsToolbar
        search={search}
        onSearchChange={setSearch}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        assignees={assigneesInTab}
        showAssignActions={isReadyTab}
        showReassignActions={isInProgressTab}
        showReassignAll={isInProgressTab && assigneeFilter !== "all"}
        selectedCount={selected.size}
        totalCount={filtered.length}
        onAssign={() => setOpenDialog("assign")}
        onAutoAssign={() => setOpenDialog("autoAssign")}
        onReassign={() => setOpenDialog("reassign")}
        onReassignAll={() => setOpenDialog("reassignAll")}
      />

      <SupportTable
        supports={filtered}
        showCheckboxes={showCheckboxes}
        selected={selected}
        onSelectionChange={setSelected}
        userNameMap={userNameMap}
      />

      <SupportsDialogs
        openDialog={openDialog}
        onClose={handleClose}
        selectedSupports={selectedSupports}
        filteredSupports={filtered}
        batchFolderPath={batchFolderPath}
      />
    </div>
  );
}
