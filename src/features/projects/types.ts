export const PROJECT_STATUSES = ["Active", "Archived"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  name: string;
  projectName: string;
  client: string;
  folderPath: string;
  status: ProjectStatus;
}
