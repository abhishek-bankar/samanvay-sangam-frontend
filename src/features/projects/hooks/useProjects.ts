import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frappe } from "@/lib/api/frappe-client";
import type { Project } from "@/features/projects/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      frappe.getList<Project>("Project", {
        fields: ["name", "project_name", "client", "folder_path", "status"],
        filters: [["status", "=", "Active"]],
        orderBy: "creation desc",
      }),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { project_name: string; client: string }) =>
      frappe.createDoc<Project>("Project", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
