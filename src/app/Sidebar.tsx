import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  FileText,
  UserPlus,
  CheckSquare,
  AlertTriangle,
  Send,
  BarChart3,
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { getVisibleMenuItems } from "@/app/sidebar-menu";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  FileText,
  UserPlus,
  CheckSquare,
  AlertTriangle,
  Send,
  BarChart3,
  FolderOpen,
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { roles } = useAuth();
  const menuItems = getVisibleMenuItems(roles);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && <span className="text-lg font-bold">SANGAM</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "justify-center px-2",
                )
              }
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
