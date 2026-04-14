const AUTH_TOKEN_KEY = "sangam_auth_token";
const AUTH_USER_KEY = "sangam_auth_user";
const AUTH_FULL_NAME_KEY = "sangam_auth_full_name";

export function saveAuth(token: string, user: string, fullName: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, user);
  localStorage.setItem(AUTH_FULL_NAME_KEY, fullName);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return localStorage.getItem(AUTH_USER_KEY);
}

export function getStoredFullName(): string | null {
  return localStorage.getItem(AUTH_FULL_NAME_KEY);
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_FULL_NAME_KEY);
}
