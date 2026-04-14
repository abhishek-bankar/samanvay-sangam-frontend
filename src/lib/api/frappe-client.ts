import { config } from "@/lib/config";
import { keysToCamel, keysToSnake } from "@/lib/utils";

interface FrappeListParams {
  fields?: string[];
  filters?: Record<string, unknown>;
  orderBy?: string;
  start?: number;
  limit?: number;
}

interface FrappeListResponse<T> {
  data: T[];
  hasNextPage: boolean;
}

interface FrappeDocResponse<T> {
  data: T;
}

function getStoredToken(): string {
  const token = localStorage.getItem("frappe_token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
}

async function frappeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const response = await fetch(`${config.frappeUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMessage = errorBody.errors?.[0]?.message || response.statusText;
    throw new Error(errorMessage);
  }

  const json = await response.json();
  return keysToCamel(json) as T;
}

async function getList<T>(
  doctype: string,
  params?: FrappeListParams,
): Promise<FrappeListResponse<T>> {
  const searchParams = new URLSearchParams();
  if (params?.fields) searchParams.set("fields", JSON.stringify(params.fields));
  if (params?.filters) searchParams.set("filters", JSON.stringify(keysToSnake(params.filters)));
  if (params?.orderBy) searchParams.set("order_by", params.orderBy);
  if (params?.start !== undefined) searchParams.set("start", String(params.start));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return frappeRequest(`/api/v2/document/${doctype}${query ? `?${query}` : ""}`);
}

async function getDoc<T>(doctype: string, name: string): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}`);
}

async function createDoc<T>(doctype: string, data: Partial<T>): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}`, {
    method: "POST",
    body: JSON.stringify(keysToSnake(data)),
  });
}

async function updateDoc<T>(
  doctype: string,
  name: string,
  data: Partial<T>,
): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}`, {
    method: "PATCH",
    body: JSON.stringify(keysToSnake(data)),
  });
}

async function deleteDoc(doctype: string, name: string): Promise<void> {
  await frappeRequest(`/api/v2/document/${doctype}/${name}`, {
    method: "DELETE",
  });
}

async function call<T>(method: string, args?: Record<string, unknown>): Promise<{ data: T }> {
  return frappeRequest(`/api/v2/method/${method}`, {
    method: "POST",
    body: args ? JSON.stringify(keysToSnake(args)) : undefined,
  });
}

async function callDocMethod<T>(
  doctype: string,
  name: string,
  method: string,
  args?: Record<string, unknown>,
): Promise<{ data: T }> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}/method/${method}`, {
    method: "POST",
    body: args ? JSON.stringify(keysToSnake(args)) : undefined,
  });
}

export const frappe = { getList, getDoc, createDoc, updateDoc, deleteDoc, call, callDocMethod };
