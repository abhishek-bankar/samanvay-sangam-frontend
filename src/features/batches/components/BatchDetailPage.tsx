import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { frappe } from "@/lib/api/frappe-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SyncCleanedButton } from "@/features/batches/components/SyncCleanedButton";
import { BatchSupportsView } from "@/features/batches/components/BatchSupportsView";
import type { Batch } from "@/features/batches/types";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  "Partially Synced": "bg-amber-100 text-amber-700",
  Synced: "bg-purple-100 text-purple-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => frappe.getDoc<Batch>("Batch", batchId!),
    enabled: !!batchId,
  });

  if (isPending) return <p className="py-8 text-center text-muted-foreground">Loading batch...</p>;
  if (isError) return <p className="py-8 text-center text-destructive">{error.message}</p>;

  const batch = data?.data;
  if (!batch) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
        <Link to="/batches">
          <Button variant="ghost" size="icon" className="mt-0.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{batch.batchName}</h1>
            <Badge className={STATUS_COLORS[batch.status] ?? "bg-gray-100 text-gray-700"}>
              {batch.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {batch.supportCount} supports
            {batch.syncedCount > 0 && ` · ${batch.syncedCount} synced`}
            {batch.unsyncedCount > 0 && ` · ${batch.unsyncedCount} pending`}
          </p>
        </div>
        {batch.folderPath && (
          <SyncCleanedButton batchFolderPath={batch.folderPath} batchId={batch.name} />
        )}
      </div>

      {/* Supports */}
      <BatchSupportsView batchId={batch.name} batchFolderPath={batch.folderPath} />
    </div>
  );
}
