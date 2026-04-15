import { createContext, useContext, useState } from "react";
import {
  getStoredToken,
  getStoredUser,
  getStoredFullName,
  clearAuth,
} from "@/features/auth/auth-storage";
import type { AuthState, SangamRole } from "@/features/auth/types";

interface AuthContextValue extends AuthState {
  login: (user: string, fullName: string, roles: SangamRole[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

  function login(user: string, fullName: string, roles: SangamRole[]) {
    setAuthState({ isAuthenticated: true, user, fullName, roles });
  }

  function logout() {
    clearAuth();
    setAuthState({ isAuthenticated: false, user: null, fullName: null, roles: [] });
  }

  return (
    <AuthContext value={{ ...authState, login, logout }}>
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
