import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { syncCleaned } from "@/features/batches/utils/sync-cleaned";
import { useQueryClient } from "@tanstack/react-query";

interface SyncCleanedButtonProps {
  batchFolderPath: string;
  batchId: string;
}

export function SyncCleanedButton({ batchFolderPath, batchId }: SyncCleanedButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  async function handleSync() {
    setIsSyncing(true);
    try {
      const result = await syncCleaned(batchFolderPath, batchId);
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["supports"] });

      const parts = [`${result.matched.length} matched`];
      if (result.unmatched.length > 0) {
        parts.push(`${result.unmatched.length} unmatched`);
      }
      toast.success(`Sync complete: ${parts.join(", ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleSync();
      }}
      disabled={isSyncing}
    >
      <RefreshCw className={`mr-1 h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Cleaned"}
    </Button>
  );
}
