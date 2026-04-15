import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProject } from "@/features/projects/project-context";
import type { Project } from "@/features/projects/types";

export function ProjectSelector() {
  const { data, isPending, isError, error } = useProjects();
  const { setProject } = useProject();
  const navigate = useNavigate();

  function handleSelect(project: Project) {
    setProject(project);
    navigate("/dashboard");
  }

  if (isPending) return <p className="py-12 text-center text-muted-foreground">Loading projects...</p>;
  if (isError) return <p className="py-12 text-center text-destructive">{error.message}</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-2xl font-bold">Select a Project</h2>
      {data.data.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground">No projects yet.</p>
          <Link to="/projects/new" className="mt-4 inline-block">
            <Button>Create First Project</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
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
          <Link to="/projects/new">
            <Button variant="outline">Create New Project</Button>
          </Link>
        </>
      )}
    </div>
  );
}
