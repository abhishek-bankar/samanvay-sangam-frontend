import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mkdir } from "@tauri-apps/plugin-fs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { config } from "@/lib/config";
import { frappe } from "@/lib/api/frappe-client";
import { useCreateProject } from "@/features/projects/hooks/useProjects";
import { PROJECT_STATUSES } from "@/features/projects/types";
import type { ProjectStatus } from "@/features/projects/types";

export function CreateProjectPage() {
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Active");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createProject = useCreateProject();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createProject.mutateAsync({
        projectName,
        client,
        status,
      });

      const folderPath = `${config.driveRoot}\\${projectName}`;
      try {
        await mkdir(folderPath, { recursive: true });
      } catch (fsError) {
        setError(`Project created but folder creation failed: ${fsError}`);
        setIsSubmitting(false);
        return;
      }

      await frappe.updateDoc("Project", result.data.name, {
        folderPath,
      });

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. ProjectA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. ACME Corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
