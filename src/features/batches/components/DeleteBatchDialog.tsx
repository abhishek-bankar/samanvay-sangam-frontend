import { toast } from "sonner";
import { remove } from "@tauri-apps/plugin-fs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteBatch } from "@/features/batches/hooks/useBatches";
import type { Batch } from "@/features/batches/types";

interface DeleteBatchDialogProps {
  batch: Batch | null;
  onClose: () => void;
}

export function DeleteBatchDialog({ batch, onClose }: DeleteBatchDialogProps) {
  const deleteBatch = useDeleteBatch();

  async function handleDelete() {
    if (!batch) return;
    const { batchName, folderPath, name: docName } = batch;
    onClose();
    try {
      if (folderPath) {
        await remove(folderPath, { recursive: true });
      }
      await deleteBatch.mutateAsync(docName);
      toast.success(`Batch "${batchName}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AlertDialog open={!!batch} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Batch</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{batch?.batchName}&quot;? This will delete all supports and the batch folder. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteBatch.isPending}>
            {deleteBatch.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
