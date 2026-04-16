import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, useUpdateProject } from "@/features/projects/hooks/useProjects";
import { useProject } from "@/features/projects/project-context";
import { DeleteProjectDialog } from "@/features/projects/components/DeleteProjectDialog";
import { PROJECT_STATUSES } from "@/features/projects/types";
import type { Project, ProjectStatus } from "@/features/projects/types";

export function ProjectListPage() {
  const { data, isPending, isError, error } = useProjects();
  const { setProject } = useProject();
  const navigate = useNavigate();
  const updateProject = useUpdateProject();

  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("Active");
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  function handleSelect(project: Project) {
    setProject(project);
    navigate("/batches");
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setEditName(project.projectName);
    setEditClient(project.client);
    setEditStatus(project.status);
  }

  async function handleEdit() {
    if (!editingProject) return;
    await updateProject.mutateAsync({
      name: editingProject.name,
      data: { projectName: editName, client: editClient, status: editStatus },
    });
    setEditingProject(null);
  }

  if (isPending) return <p className="py-8 text-center text-muted-foreground">Loading projects...</p>;
  if (isError) return <p className="py-8 text-center text-destructive">{error.message}</p>;
  if (!data) return null;

  const filtered = data.data.filter(
    (p) =>
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link to="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {data.data.length === 0 ? "No projects yet. Create your first project." : "No matching projects."}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow
                  key={project.name}
                  className="cursor-pointer"
                  onClick={() => handleSelect(project)}
                >
                  <TableCell className="font-medium">{project.projectName}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(project);
                        }}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Project Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClient">Client</Label>
              <Input
                id="editClient"
                value={editClient}
                onChange={(e) => setEditClient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ProjectStatus)}>
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
            {updateProject.error && (
              <p className="text-sm text-destructive">{updateProject.error.message}</p>
            )}
            <Button
              onClick={handleEdit}
              disabled={updateProject.isPending}
              className="w-full"
            >
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProjectDialog
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
      />
    </div>
  );
}
