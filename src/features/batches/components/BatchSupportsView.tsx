import type { Support } from "@/features/batches/types";
import { useBatchSupports } from "@/features/assignment/hooks/useSupports";
import { useActionees } from "@/features/assignment/hooks/useActionees";
import { useAuth } from "@/features/auth/auth-context";
import { getTabsForRole } from "@/features/assignment/components/StatusTabs";
import { PmSmeSupportsView } from "@/features/batches/components/PmSmeSupportsView";
import { ActioneeSupportsView } from "@/features/batches/components/ActioneeSupportsView";

interface BatchSupportsViewProps {
  batchId: string;
  batchFolderPath: string;
}

export function BatchSupportsView({ batchId, batchFolderPath }: BatchSupportsViewProps) {
  const { data, isPending, isError, error } = useBatchSupports(batchId);
  const { data: actioneesData } = useActionees();
  const { user, fullName, roles } = useAuth();

  const { tabs, defaultTab } = getTabsForRole(roles);
  const isActioneeView = defaultTab === "my-work";

  const userNameMap = new Map(
    (actioneesData?.data ?? []).map((a) => [a.name, a.fullName]),
  );

  if (isPending) return <p className="py-4 text-center text-muted-foreground">Loading supports...</p>;
  if (isError) return <p className="py-4 text-center text-destructive">{error.message}</p>;

  const allSupports: Support[] = data?.data ?? [];

  if (isActioneeView) {
    return (
      <ActioneeSupportsView
        allSupports={allSupports}
        tabs={tabs}
        defaultTab={defaultTab}
        currentUser={user ?? ""}
        userFullName={fullName ?? ""}
        batchFolderPath={batchFolderPath}
      />
    );
  }

  return (
    <PmSmeSupportsView
      allSupports={allSupports}
      tabs={tabs}
      defaultTab={defaultTab}
      batchFolderPath={batchFolderPath}
      userNameMap={userNameMap}
    />
  );
}
