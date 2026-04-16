import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useProject } from "@/features/projects/project-context";

export function Header() {
  const { fullName, roles, logout } = useAuth();
  const { selectedProject, clearProject } = useProject();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    clearProject();
    navigate("/login");
  }

  function handleSwitchProject() {
    clearProject();
    navigate("/projects");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {selectedProject && (
          <>
            <Button variant="ghost" size="icon" onClick={handleSwitchProject} title="Switch Project">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{selectedProject.projectName}</span>
            <span className="text-sm text-muted-foreground">— {selectedProject.client}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-medium">{fullName}</span>
          {roles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {roles.filter((r) => r.startsWith("SANGAM")).join(", ")}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
