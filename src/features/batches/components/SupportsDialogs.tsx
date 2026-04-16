import { AssignDialog } from "@/features/assignment/components/AssignDialog";
import { AutoAssignDialog } from "@/features/assignment/components/AutoAssignDialog";
import { ReassignDialog } from "@/features/assignment/components/ReassignDialog";
import type { Support } from "@/features/batches/types";

interface SupportsDialogsProps {
  openDialog: "assign" | "autoAssign" | "reassign" | "reassignAll" | null;
  onClose: () => void;
  selectedSupports: Support[];
  filteredSupports: Support[];
  batchFolderPath: string;
}

export function SupportsDialogs({
  openDialog,
  onClose,
  selectedSupports,
  filteredSupports,
  batchFolderPath,
}: SupportsDialogsProps) {
  if (!openDialog) return null;

  if (openDialog === "assign") {
    return (
      <AssignDialog
        supports={selectedSupports}
        batchFolderPath={batchFolderPath}
        open
        onClose={onClose}
      />
    );
  }

  if (openDialog === "autoAssign") {
    return (
      <AutoAssignDialog
        supports={filteredSupports}
        batchFolderPath={batchFolderPath}
        open
        onClose={onClose}
      />
    );
  }

  if (openDialog === "reassign") {
    return (
      <ReassignDialog
        supports={selectedSupports}
        batchFolderPath={batchFolderPath}
        open
        onClose={onClose}
      />
    );
  }

  // reassignAll
  return (
    <ReassignDialog
      supports={filteredSupports}
      batchFolderPath={batchFolderPath}
      open
      onClose={onClose}
    />
  );
}
