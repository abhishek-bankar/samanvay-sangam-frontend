import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useActionees } from "@/features/assignment/hooks/useActionees";
import { autoAssignSupports } from "@/features/assignment/utils/auto-assign";
import { Checkbox } from "@/components/ui/checkbox";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

function getDistribution(supportCount: number, actioneeCount: number): number[] {
  if (actioneeCount === 0) return [];
  const base = Math.floor(supportCount / actioneeCount);
  const extra = supportCount % actioneeCount;
  return Array.from({ length: actioneeCount }, (_, i) => base + (i < extra ? 1 : 0));
}

interface AutoAssignDialogProps {
  supports: Support[];
  batchFolderPath: string;
  open: boolean;
  onClose: () => void;
}

export function AutoAssignDialog({ supports, batchFolderPath, open, onClose }: AutoAssignDialogProps) {
  const { data: actioneesResponse, isPending: loadingActionees } = useActionees();
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const queryClient = useQueryClient();

  const allActionees: Actionee[] = actioneesResponse?.data ?? [];
  const selectedActionees = allActionees.filter((a) => !excluded.has(a.name));

  function toggleActionee(name: string) {
    const next = new Set(excluded);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setExcluded(next);
  }

  async function handleAutoAssign() {
    if (selectedActionees.length === 0) return;

    setAssigning(true);
    try {
      const result = await autoAssignSupports(supports, selectedActionees, batchFolderPath);
      queryClient.invalidateQueries({ queryKey: ["supports"] });

      const summary = result.assignments
        .filter((a) => a.count > 0)
        .map((a) => `${a.actionee}: ${a.count}`)
        .join(", ");

      if (result.failed.length > 0) {
        toast.error(`Assigned (${summary}). ${result.failed.length} failed.`);
      } else {
        toast.success(`Auto-assigned: ${summary}`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setAssigning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auto Assign {supports.length} Supports</DialogTitle>
        </DialogHeader>

        <AutoAssignBody
          loadingActionees={loadingActionees}
          allActionees={allActionees}
          excluded={excluded}
          onToggle={toggleActionee}
          distribution={getDistribution(supports.length, selectedActionees.length)}
          selectedActionees={selectedActionees}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
          <Button
            onClick={handleAutoAssign}
            disabled={selectedActionees.length === 0 || assigning}
            className="cursor-pointer"
          >
            {assigning ? "Assigning..." : `Assign to ${selectedActionees.length} Actionees`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AutoAssignBody({
  loadingActionees,
  allActionees,
  excluded,
  onToggle,
  distribution,
  selectedActionees,
}: {
  loadingActionees: boolean;
  allActionees: Actionee[];
  excluded: Set<string>;
  onToggle: (name: string) => void;
  distribution: number[];
  selectedActionees: Actionee[];
}) {
  if (loadingActionees) {
    return <p className="py-4 text-sm text-muted-foreground">Loading actionees...</p>;
  }
  if (allActionees.length === 0) {
    return <p className="py-4 text-sm text-destructive">No actionees found.</p>;
  }

  // Build a map of actionee name → assigned count
  const countMap = new Map<string, number>();
  for (const [i, actionee] of selectedActionees.entries()) {
    countMap.set(actionee.name, distribution[i] ?? 0);
  }

  return (
    <div className="py-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Uncheck actionees to exclude them. Supports will be distributed equally.
      </p>
      <div className="space-y-2">
        {allActionees.map((a) => {
          const isSelected = !excluded.has(a.name);
          const count = countMap.get(a.name);
          return (
            <label key={a.name} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(a.name)}
                className="cursor-pointer"
              />
              <span className="text-sm">{a.fullName}</span>
              {isSelected && count !== undefined && (
                <span className="text-xs text-muted-foreground">({count} supports)</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
