import { useState } from "react";
import { SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";
import type { TabDefinition } from "@/features/assignment/components/StatusTabs";
import { StatusTabs } from "@/features/assignment/components/StatusTabs";
import { MyWorkTable } from "@/features/my-work/components/MyWorkTable";

function filterMyWork(supports: Support[], tab: string, currentUser: string): Support[] {
  if (tab === "my-work") {
    return supports.filter((s) => s.assignedTo === currentUser && s.status === SUPPORT_STATUS.IN_PROGRESS);
  }
  if (tab === "submitted") {
    return supports.filter((s) => s.assignedTo === currentUser && s.status === SUPPORT_STATUS.UNDER_REVIEW);
  }
  return [];
}

function countMyWork(supports: Support[], currentUser: string): Map<string, number> {
  const counts = new Map<string, number>();
  let myWork = 0;
  let submitted = 0;
  for (const s of supports) {
    if (s.assignedTo !== currentUser) continue;
    if (s.status === SUPPORT_STATUS.IN_PROGRESS) myWork++;
    if (s.status === SUPPORT_STATUS.UNDER_REVIEW) submitted++;
  }
  counts.set("my-work", myWork);
  counts.set("submitted", submitted);
  return counts;
}

interface ActioneeSupportsViewProps {
  allSupports: Support[];
  tabs: TabDefinition[];
  defaultTab: string;
  currentUser: string;
  userFullName: string;
  batchFolderPath: string;
}

export function ActioneeSupportsView({
  allSupports, tabs, defaultTab, currentUser, userFullName, batchFolderPath,
}: ActioneeSupportsViewProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const filtered = filterMyWork(allSupports, activeTab, currentUser);
  const statusCounts = countMyWork(allSupports, currentUser);
  const totalCount = (statusCounts.get("my-work") ?? 0) + (statusCounts.get("submitted") ?? 0);

  return (
    <div className="space-y-4">
      <StatusTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        statusCounts={statusCounts}
        totalCount={totalCount}
      />

      <MyWorkTable supports={filtered} userFullName={userFullName} batchFolderPath={batchFolderPath} />
    </div>
  );
}
