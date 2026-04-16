import { useState } from "react";
import { SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";
import { useBatchSupports } from "@/features/assignment/hooks/useSupports";
import { useActionees } from "@/features/assignment/hooks/useActionees";
import { StatusTabs } from "@/features/assignment/components/StatusTabs";
import { SupportTable } from "@/features/assignment/components/SupportTable";
import { AssignDialog } from "@/features/assignment/components/AssignDialog";
import { AutoAssignDialog } from "@/features/assignment/components/AutoAssignDialog";
import { SupportsToolbar } from "@/features/batches/components/SupportsToolbar";

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

interface BatchSupportsViewProps {
  batchId: string;
  batchFolderPath: string;
}

export function BatchSupportsView({ batchId, batchFolderPath }: BatchSupportsViewProps) {
  const { data, isPending, isError, error } = useBatchSupports(batchId);
  const { data: actioneesData } = useActionees();
  const userNameMap = new Map(
    (actioneesData?.data ?? []).map((a) => [a.name, a.fullName]),
  );
  const [activeTab, setActiveTab] = useState<string>(SUPPORT_STATUS.READY_TO_ASSIGN);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [autoAssignOpen, setAutoAssignOpen] = useState(false);

  if (isPending) return <p className="py-4 text-center text-muted-foreground">Loading supports...</p>;
  if (isError) return <p className="py-4 text-center text-destructive">{error.message}</p>;

  const allSupports: Support[] = data?.data ?? [];
  const filtered = filterSupports(allSupports, activeTab, search, assigneeFilter);
  const statusCounts = countByStatus(allSupports);
  const isReadyTab = activeTab === SUPPORT_STATUS.READY_TO_ASSIGN;
  const selectedSupports = filtered.filter((s) => selected.has(s.name));

  // Unique assignees in current tab (for filter dropdown)
  const tabSupports = activeTab === "all" ? allSupports : allSupports.filter((s) => s.status === activeTab);
  const assigneesInTab = [...new Set(tabSupports.map((s) => s.assignedTo).filter(Boolean))]
    .map((email) => ({ email, fullName: userNameMap.get(email) ?? email }));

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setSelected(new Set());
    setAssigneeFilter("all");
  }

  function handleClose() {
    setAssignOpen(false);
    setAutoAssignOpen(false);
    setSelected(new Set());
  }

  return (
    <div className="space-y-4">
      <StatusTabs
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
        selectedCount={selected.size}
        totalCount={filtered.length}
        onAssign={() => setAssignOpen(true)}
        onAutoAssign={() => setAutoAssignOpen(true)}
      />

      <SupportTable
        supports={filtered}
        showCheckboxes={isReadyTab}
        selected={selected}
        onSelectionChange={setSelected}
        userNameMap={userNameMap}
      />

      {assignOpen && (
        <AssignDialog
          supports={selectedSupports}
          batchFolderPath={batchFolderPath}
          open={assignOpen}
          onClose={handleClose}
        />
      )}
      {autoAssignOpen && (
        <AutoAssignDialog
          supports={filtered}
          batchFolderPath={batchFolderPath}
          open={autoAssignOpen}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
