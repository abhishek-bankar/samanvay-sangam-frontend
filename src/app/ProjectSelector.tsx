import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProject } from "@/features/projects/project-context";

export function ProjectSelector() {
  const { data, isPending, isError, error } = useProjects();
  const { selectedProject } = useProject();

  // If a project is already selected, go straight to batches
  if (selectedProject) return <Navigate to="/batches" replace />;

  if (isPending) return <p className="py-12 text-center text-muted-foreground">Loading projects...</p>;
  if (isError) return <p className="py-12 text-center text-destructive">{error.message}</p>;
  if (!data) return null;

  // If projects exist, show the list page
  if (data.data.length > 0) return <Navigate to="/projects" replace />;

  // No projects — show create prompt
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <h2 className="text-2xl font-bold">Welcome to SANGAM</h2>
      <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
      <Link to="/projects/new">
        <Button>Create First Project</Button>
      </Link>
    </div>
  );
}
