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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useActionees } from "@/features/assignment/hooks/useActionees";
import { reassignSupports } from "@/features/assignment/utils/reassign-supports";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

interface ReassignDialogProps {
  supports: Support[];
  batchFolderPath: string;
  open: boolean;
  onClose: () => void;
}

export function ReassignDialog({ supports, batchFolderPath, open, onClose }: ReassignDialogProps) {
  const { data: actioneesResponse, isPending: loadingActionees } = useActionees();
  const [selectedActionee, setSelectedActionee] = useState<string>("");
  const [reassigning, setReassigning] = useState(false);
  const queryClient = useQueryClient();

  const allActionees: Actionee[] = actioneesResponse?.data ?? [];

  // Exclude current assignees from the target list
  const currentAssignees = new Set(supports.map((s) => s.assignedTo).filter(Boolean));
  const availableActionees = allActionees.filter((a) => !currentAssignees.has(a.name));

  async function handleReassign() {
    const actionee = availableActionees.find((a) => a.name === selectedActionee);
    if (!actionee) return;

    setReassigning(true);
    try {
      const result = await reassignSupports(supports, actionee, batchFolderPath);
      queryClient.invalidateQueries({ queryKey: ["supports"] });

      if (result.failed.length > 0) {
        toast.error(`${result.succeeded.length} reassigned, ${result.failed.length} failed`);
      } else {
        toast.success(`${result.succeeded.length} supports reassigned to ${actionee.fullName}`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setReassigning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign {supports.length} Support{supports.length > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium">Select New Actionee</label>
          {loadingActionees ? (
            <p className="text-sm text-muted-foreground">Loading actionees...</p>
          ) : availableActionees.length === 0 ? (
            <p className="text-sm text-destructive">No other actionees available.</p>
          ) : (
            <Select value={selectedActionee} onValueChange={setSelectedActionee}>
              <SelectTrigger className="mt-1 w-full cursor-pointer">
                <SelectValue placeholder="Pick a new actionee" />
              </SelectTrigger>
              <SelectContent>
                {availableActionees.map((a) => (
                  <SelectItem key={a.name} value={a.name} className="cursor-pointer">
                    {a.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
          <Button
            onClick={handleReassign}
            disabled={!selectedActionee || reassigning}
            className="cursor-pointer"
          >
            {reassigning ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
