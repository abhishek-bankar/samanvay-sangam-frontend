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
