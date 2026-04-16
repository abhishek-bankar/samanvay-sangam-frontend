import { useQuery } from "@tanstack/react-query";
import { frappe } from "@/lib/api/frappe-client";
import type { Support } from "@/features/batches/types";

export function useBatchSupports(batchId: string) {
  return useQuery({
    queryKey: ["supports", batchId],
    queryFn: () =>
      frappe.getList<Support>("Support", {
        filters: [["batch_id", "=", batchId]],
        fields: [
          "name", "support_tag_id", "batch_id", "drawing_no", "revision",
          "level", "present_status", "remarks", "status", "assigned_to",
          "revision_number", "revision_type", "file_path", "markup_pdf_path",
          "assigned_at", "submitted_at", "reviewed_at", "tat_hours",
        ],
        limit: 500,
      }),
    enabled: !!batchId,
  });
}
