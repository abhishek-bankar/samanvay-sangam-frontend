import { useQuery } from "@tanstack/react-query";
import { frappe } from "@/lib/api/frappe-client";
import type { Actionee } from "@/features/assignment/types";

export function useActionees() {
  return useQuery({
    queryKey: ["actionees"],
    queryFn: () =>
      frappe.call<Actionee[]>("samanvay_sangam_backend.api.get_users_with_role", {
        role: "SANGAM Actionee",
      }),
  });
}
