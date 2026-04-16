import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function snakeToCamel(str: string): string {
  return str.replaceAll(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replaceAll(/[A-Z]/g, (c: string) => `_${c.toLowerCase()}`);
}

export function keysToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        snakeToCamel(k),
        keysToCamel(v),
      ])
    );
  }
  return obj;
}

/** Format a Date as "YYYY-MM-DD HH:MM:SS" in local timezone (matches Frappe's Asia/Kolkata). */
export function toFrappeDatetime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/** Display a Frappe datetime string in Asia/Kolkata timezone. */
export function formatDateTime(frappeDatetime: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(frappeDatetime));
}

export function keysToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        camelToSnake(k),
        keysToSnake(v),
      ])
    );
  }
  return obj;
}
