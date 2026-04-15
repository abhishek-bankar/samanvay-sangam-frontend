import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frappe } from "@/lib/api/frappe-client";
import type { Batch } from "@/features/batches/types";

export function useBatches(projectId: string) {
  return useQuery({
    queryKey: ["batches", projectId],
    queryFn: () =>
      frappe.getList<Batch>("Batch", {
        fields: [
          "name", "batch_name", "project_id", "folder_path",
          "support_count", "synced_count", "unsynced_count",
          "last_synced_at", "status",
        ],
        filters: [["project_id", "=", projectId]],
        orderBy: "creation desc",
      }),
    enabled: !!projectId,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Batch>) =>
      frappe.createDoc<Batch>("Batch", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: Partial<Batch> }) =>
      frappe.updateDoc<Batch>("Batch", name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => frappe.deleteDoc("Batch", name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}
