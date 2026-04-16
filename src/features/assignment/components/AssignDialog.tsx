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
import { assignSupports } from "@/features/assignment/utils/assign-supports";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

interface AssignDialogProps {
  supports: Support[];
  batchFolderPath: string;
  open: boolean;
  onClose: () => void;
}

export function AssignDialog({ supports, batchFolderPath, open, onClose }: AssignDialogProps) {
  const { data: actioneesResponse, isPending: loadingActionees } = useActionees();
  const [selectedActionee, setSelectedActionee] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const queryClient = useQueryClient();

  const actionees: Actionee[] = actioneesResponse?.data ?? [];

  async function handleAssign() {
    const actionee = actionees.find((a) => a.name === selectedActionee);
    if (!actionee) return;

    setAssigning(true);
    try {
      const result = await assignSupports(supports, actionee, batchFolderPath);
      queryClient.invalidateQueries({ queryKey: ["supports"] });

      if (result.failed.length > 0) {
        toast.error(`${result.succeeded.length} assigned, ${result.failed.length} failed`);
      } else {
        toast.success(`${result.succeeded.length} supports assigned to ${actionee.fullName}`);
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
          <DialogTitle>Assign {supports.length} Support{supports.length > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium">Select Actionee</label>
          {loadingActionees ? (
            <p className="text-sm text-muted-foreground">Loading actionees...</p>
          ) : actionees.length === 0 ? (
            <p className="text-sm text-destructive">No actionees found. Ensure users have the SANGAM Actionee role.</p>
          ) : (
            <Select value={selectedActionee} onValueChange={setSelectedActionee}>
              <SelectTrigger className="mt-1 w-full cursor-pointer">
                <SelectValue placeholder="Pick an actionee" />
              </SelectTrigger>
              <SelectContent>
                {actionees.map((a) => (
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
            onClick={handleAssign}
            disabled={!selectedActionee || assigning}
            className="cursor-pointer"
          >
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
