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
    mutationFn: (data: Partial<Project>) =>
      frappe.createDoc<Project>("Project", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: Partial<Project> }) =>
      frappe.updateDoc<Project>("Project", name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => frappe.deleteDoc("Project", name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
