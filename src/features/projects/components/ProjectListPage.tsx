import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProject } from "@/features/projects/project-context";
import type { Project } from "@/features/projects/types";

export function ProjectListPage() {
  const { data, isPending, isError, error } = useProjects();
  const { setProject } = useProject();
  const navigate = useNavigate();

  function handleSelect(project: Project) {
    setProject(project);
    navigate("/dashboard");
  }

  if (isPending) return <p className="py-8 text-center text-muted-foreground">Loading projects...</p>;
  if (isError) return <p className="py-8 text-center text-destructive">{error.message}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link to="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>
      {data.data.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No projects yet. Create your first project.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((project) => (
            <Card
              key={project.name}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleSelect(project)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{project.projectName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
