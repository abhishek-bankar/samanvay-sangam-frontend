export const SANGAM_ROLES = [
  "SANGAM PM",
  "SANGAM SME",
  "SANGAM QC",
  "SANGAM Actionee",
] as const;

export type SangamRole = (typeof SANGAM_ROLES)[number];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  fullName: string | null;
  roles: SangamRole[];
}
