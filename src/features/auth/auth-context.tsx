import { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/lib/config";
import {
  getStoredToken,
  getStoredUser,
  getStoredFullName,
  clearAuth,
} from "@/features/auth/auth-storage";
import { SANGAM_ROLES } from "@/features/auth/types";
import type { AuthState, SangamRole } from "@/features/auth/types";

interface AuthContextValue extends AuthState {
  login: (user: string, fullName: string, roles: SangamRole[]) => void;
  logout: () => void;
  setRoles: (roles: SangamRole[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserRoles(): Promise<SangamRole[]> {
  const res = await fetch(
    `${config.frappeUrl}/api/method/frappe.utils.user.get_roles`,
    { credentials: "include" },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user roles");
  }

  const data: { message: string[] } = await res.json();
  return data.message.filter((r): r is SangamRole =>
    (SANGAM_ROLES as readonly string[]).includes(r),
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    const fullName = getStoredFullName();
    return {
      isAuthenticated: !!token && !!user,
      user,
      fullName,
      roles: [],
    };
  });

  // Fetch roles on mount if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.roles.length === 0) {
      fetchUserRoles().then((roles) => {
        setAuthState((prev) => ({ ...prev, roles }));
      });
    }
  }, [authState.isAuthenticated, authState.roles.length]);

  function login(user: string, fullName: string, roles: SangamRole[]) {
    setAuthState({ isAuthenticated: true, user, fullName, roles });
  }

  function logout() {
    clearAuth();
    setAuthState({ isAuthenticated: false, user: null, fullName: null, roles: [] });
  }

  function setRoles(roles: SangamRole[]) {
    setAuthState((prev) => ({ ...prev, roles }));
  }

  return (
    <AuthContext value={{ ...authState, login, logout, setRoles }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
