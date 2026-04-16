import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { remove } from "@tauri-apps/plugin-fs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useProject } from "@/features/projects/project-context";
import { useBatches, useDeleteBatch } from "@/features/batches/hooks/useBatches";
import { SyncCleanedButton } from "@/features/batches/components/SyncCleanedButton";
import type { Batch } from "@/features/batches/types";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  "Partially Synced": "bg-amber-100 text-amber-700",
  Synced: "bg-purple-100 text-purple-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export function BatchListPage() {
  const { selectedProject } = useProject();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useBatches(selectedProject?.name ?? "");
  const deleteBatch = useDeleteBatch();
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

  async function handleDelete() {
    if (!deletingBatch) return;
    const { batchName, folderPath, name: docName } = deletingBatch;
    setDeletingBatch(null);
    try {
      if (folderPath) {
        try {
          await remove(folderPath, { recursive: true });
        } catch (fsErr) {
          toast.error(`Failed to delete folder: ${fsErr}`);
          return;
        }
      }
      await deleteBatch.mutateAsync(docName);
      toast.success(`Batch "${batchName}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  if (!selectedProject) {
    return <p className="py-8 text-center text-muted-foreground">Select a project first.</p>;
  }

  if (isPending) return <p className="py-8 text-center text-muted-foreground">Loading batches...</p>;
  if (isError) return <p className="py-8 text-center text-destructive">{error.message}</p>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <Link to="/batches/new">
          <Button>New Batch</Button>
        </Link>
      </div>

      {data.data.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No batches yet. Create your first batch.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supports</TableHead>
                <TableHead>Synced</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((batch: Batch) => (
                <TableRow key={batch.name} className="cursor-pointer" onClick={() => navigate(`/batches/${batch.name}`)}>
                  <TableCell className="font-medium">{batch.batchName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[batch.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {batch.status}
                    </span>
                  </TableCell>
                  <TableCell>{batch.supportCount}</TableCell>
                  <TableCell>
                    {batch.syncedCount > 0 ? (
                      <span className="text-sm">
                        <span className="font-medium text-emerald-600">{batch.syncedCount}</span>
                        {batch.unsyncedCount > 0 && (
                          <span className="text-muted-foreground"> / {batch.unsyncedCount} pending</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {batch.lastSyncedAt ? (
                      <span className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(batch.lastSyncedAt))}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {batch.folderPath && (
                        <SyncCleanedButton
                          batchFolderPath={batch.folderPath}
                          batchId={batch.name}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingBatch(batch)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingBatch} onOpenChange={() => setDeletingBatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingBatch?.batchName}&quot;? This will delete all supports and the batch folder. This action cannot be undone.
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
    </div>
  );
}
