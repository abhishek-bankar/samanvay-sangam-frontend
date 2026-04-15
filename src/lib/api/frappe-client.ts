import { config } from "@/lib/config";
import { getStoredToken } from "@/features/auth/auth-storage";
import { keysToCamel, keysToSnake } from "@/lib/utils";

type FrappeFilter = [string, string, unknown];

interface FrappeListParams {
  fields?: string[];
  filters?: FrappeFilter[];
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

async function frappeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

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

function setParam(sp: URLSearchParams, key: string, value: unknown) {
  if (value == null) return;
  sp.set(key, typeof value === "string" ? value : JSON.stringify(value));
}

function buildListQuery(params?: FrappeListParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  setParam(sp, "fields", params.fields);
  setParam(sp, "filters", params.filters);
  setParam(sp, "order_by", params.orderBy);
  setParam(sp, "start", params.start?.toString());
  setParam(sp, "limit", params.limit?.toString());
  return sp.toString();
}

async function getList<T>(
  doctype: string,
  params?: FrappeListParams,
): Promise<FrappeListResponse<T>> {
  const query = buildListQuery(params);
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
