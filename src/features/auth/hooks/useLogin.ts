import { useMutation } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { saveAuth } from "@/features/auth/auth-storage";
import type { LoginCredentials } from "@/features/auth/types";

interface LoginResponse {
  message: string;
  full_name: string;
}

async function loginToFrappe({ email, password }: LoginCredentials) {
  const loginRes = await fetch(`${config.frappeUrl}/api/method/login`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usr: email, pwd: password }),
    credentials: "include",
  });

  if (!loginRes.ok) {
    const err = await loginRes.json();
    throw new Error(err.message || "Login failed");
  }

  const loginData: LoginResponse = await loginRes.json();

  // Browser stores the sid cookie automatically via credentials: "include"
  // We only store user info in localStorage for UI purposes
  saveAuth("session", email, loginData.full_name);

  return { user: email, fullName: loginData.full_name };
}

export function useLogin() {
  return useMutation({
    mutationFn: loginToFrappe,
  });
}
