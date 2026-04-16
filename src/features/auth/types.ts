export const SANGAM_ROLES = [
  "SANGAM PM",
  "SANGAM SME",
  "SANGAM QC",
  "SANGAM Actionee",
] as const;

export type SangamRole = (typeof SANGAM_ROLES)[number];

export const ROLE = {
  PM: "SANGAM PM" as SangamRole,
  SME: "SANGAM SME" as SangamRole,
  QC: "SANGAM QC" as SangamRole,
  ACTIONEE: "SANGAM Actionee" as SangamRole,
} as const;

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
