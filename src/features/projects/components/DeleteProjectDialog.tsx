import { useState } from "react";
import { remove } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteProject } from "@/features/projects/hooks/useProjects";
import type { Project } from "@/features/projects/types";

interface DeleteProjectDialogProps {
  project: Project | null;
  onClose: () => void;
}

export function DeleteProjectDialog({ project, onClose }: DeleteProjectDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const deleteProject = useDeleteProject();

  async function handleDelete() {
    if (!project) return;
    const { projectName, folderPath, name: docName } = project;
    onClose();
    try {
      if (folderPath) {
        try {
          await remove(folderPath, { recursive: true });
        } catch (fsErr) {
          toast.error(`Failed to delete folder: ${fsErr}`);
          return;
        }
      }
      await deleteProject.mutateAsync(docName);
      toast.success(`Project "${projectName}" and all its data deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AlertDialog open={!!project} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all batches, supports, and the project folder on the shared drive. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label className="text-sm">
            Type <span className="font-bold">{project?.projectName}</span> to confirm
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={project?.projectName}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== project?.projectName || deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
