import { useState } from "react";
import { openPath } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Send, FolderOpen } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";
import { submitSupportFile } from "@/lib/file-ops/submit-support";
import { frappe } from "@/lib/api/frappe-client";
import { toFrappeDatetime, formatDateTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  "Under Review": "bg-indigo-100 text-indigo-700",
  Approved: "bg-emerald-100 text-emerald-700",
  "Needs Rework": "bg-red-100 text-red-700",
};

interface MyWorkTableProps {
  supports: Support[];
  userFullName: string;
  batchFolderPath: string;
}

export function MyWorkTable({ supports, userFullName, batchFolderPath }: MyWorkTableProps) {
  const [submittingSupport, setSubmittingSupport] = useState<Support | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function handleConfirmedSubmit() {
    if (!submittingSupport) return;
    const support = submittingSupport;
    setIsSubmitting(true);
    try {
      const newFilePath = await submitSupportFile(support.filePath, batchFolderPath, userFullName);

      const submittedAt = new Date();
      const assignedAt = new Date(support.assignedAt);
      const tatHours = Math.round(((submittedAt.getTime() - assignedAt.getTime()) / 3_600_000) * 100) / 100;
      const revisionType = support.revisionNumber === 0 ? "IFR" : support.revisionType;

      await frappe.updateDoc("Support", support.name, {
        status: SUPPORT_STATUS.UNDER_REVIEW,
        submittedAt: toFrappeDatetime(submittedAt),
        tatHours,
        filePath: newFilePath,
        revisionType,
      });

      queryClient.invalidateQueries({ queryKey: ["supports"] });
      toast.success(`${support.supportTagId} submitted for review`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("being used") || msg.includes("locked") || msg.includes("denied")) {
        toast.error("File is open in another application. Please close it and try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingSupport(null);
    }
  }

  async function handleOpenFile(filePath: string) {
    try {
      await openPath(filePath);
    } catch (err) {
      toast.error(`Failed to open file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (supports.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No assignments found.</p>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Support Tag ID</TableHead>
              <TableHead>Drawing No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supports.map((s) => (
              <MyWorkRow
                key={s.name}
                support={s}
                onSubmit={setSubmittingSupport}
                onOpenFile={handleOpenFile}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!submittingSupport} onOpenChange={() => setSubmittingSupport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit {submittingSupport?.supportTagId}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the DWG file to the submitted folder and send it for SME review.
              You will not be able to edit the file after submission. Make sure you have saved all changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RelevantTimestamp({ support }: { support: Support }) {
  const isUnderReview = support.status === SUPPORT_STATUS.UNDER_REVIEW;
  const timestamp = isUnderReview ? support.submittedAt : support.assignedAt;
  const label = isUnderReview ? "Submitted" : "Assigned";

  if (!timestamp) return <span className="text-sm text-muted-foreground">—</span>;

  return (
    <span className="text-sm text-muted-foreground">
      {label}: {formatDateTime(timestamp)}
    </span>
  );
}

function MyWorkRow({
  support,
  onSubmit,
  onOpenFile,
}: {
  support: Support;
  onSubmit: (s: Support) => void;
  onOpenFile: (path: string) => void;
}) {
  const isInProgress = support.status === SUPPORT_STATUS.IN_PROGRESS;

  return (
    <TableRow>
      <TableCell className="font-medium">{support.supportTagId}</TableCell>
      <TableCell>{support.drawingNo}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[support.status] ?? "bg-gray-100 text-gray-700"}`}>
          {support.status}
        </span>
      </TableCell>
      <TableCell>
        R{support.revisionNumber}
        {support.revisionType && (
          <span className="ml-1 text-xs text-muted-foreground">({support.revisionType})</span>
        )}
      </TableCell>
      <TableCell>
        <RelevantTimestamp support={support} />
      </TableCell>
      <TableCell className="text-right">
        {isInProgress && (
          <div className="flex justify-end gap-2">
            {support.filePath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenFile(support.filePath)}
                title="Open DWG"
                className="cursor-pointer"
              >
                <FolderOpen className="mr-1 h-3 w-3" />
                Open
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSubmit(support)}
              className="cursor-pointer"
            >
              <Send className="mr-1 h-3 w-3" />
              Submit
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
