import { createContext, useContext, useState } from "react";
import type { Project } from "@/features/projects/types";

const PROJECT_STORAGE_KEY = "sangam_selected_project";

interface ProjectContextValue {
  selectedProject: Project | null;
  setProject: (project: Project) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function loadStoredProject(): Project | null {
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Project;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(loadStoredProject);

  function setProject(project: Project) {
    setSelectedProject(project);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
  }

  function clearProject() {
    setSelectedProject(null);
    localStorage.removeItem(PROJECT_STORAGE_KEY);
  }

  return (
    <ProjectContext value={{ selectedProject, setProject, clearProject }}>
      {children}
    </ProjectContext>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}
