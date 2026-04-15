import { useMutation } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { saveAuth } from "@/features/auth/auth-storage";
import type { LoginCredentials, SangamRole } from "@/features/auth/types";
import { SANGAM_ROLES } from "@/features/auth/types";

interface LoginApiResponse {
  message: {
    token: string;
    user: string;
    full_name: string;
    roles: string[];
  };
}

async function loginToFrappe({ email, password }: LoginCredentials) {
  const res = await fetch(
    `${config.frappeUrl}/api/method/samanvay_sangam_backend.api.login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usr: email, pwd: password }),
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  const data: LoginApiResponse = await res.json();
  const { token, user, full_name, roles } = data.message;

  saveAuth(token, user, full_name);

  const sangamRoles = roles.filter((r): r is SangamRole =>
    (SANGAM_ROLES as readonly string[]).includes(r),
  );

  return { user, fullName: full_name, token, roles: sangamRoles };
}

export function useLogin() {
  return useMutation({
    mutationFn: loginToFrappe,
  });
}
