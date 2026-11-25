// Typed fetch layer over the FastAPI backend. Base is the relative "/api" prefix so the
// same code works in dev (Vite proxies /api → :8001) and behind a single origin in prod.
const BASE = "/api";

// Fields are declared, not constructor parameter properties: tsconfig sets
// erasableSyntaxOnly, which rejects `constructor(readonly status: number)`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = unknown;

// `token` is only used for the admin's Clerk session token (Authorization: Bearer).
async function request<T>(
  method: string,
  path: string,
  body?: JsonBody,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {};
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function errorMessage(err: unknown, fallback = "Algo deu errado"): string {
  if (err instanceof ApiError) {
    const d = (err.body as { detail?: unknown } | null)?.detail;
    if (typeof d === "string") return d;
  }
  return fallback;
}

export const apiGet = <T>(path: string, token?: string | null) =>
  request<T>("GET", path, undefined, token);
export const apiPost = <T>(path: string, body?: JsonBody, token?: string | null) =>
  request<T>("POST", path, body ?? null, token);
export const apiPut = <T>(path: string, body?: JsonBody, token?: string | null) =>
  request<T>("PUT", path, body ?? null, token);
export const apiPatch = <T>(path: string, body?: JsonBody, token?: string | null) =>
  request<T>("PATCH", path, body ?? null, token);
export const apiDelete = <T>(path: string, token?: string | null) =>
  request<T>("DELETE", path, undefined, token);

// Server-sent events over POST (the chat stream). Calls onEvent for each `data:` JSON payload.
export async function apiStream(
  path: string,
  body: JsonBody,
  onEvent: (data: Record<string, unknown>) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            onEvent(JSON.parse(line.slice(6)) as Record<string, unknown>);
          } catch {
            /* ignore malformed line */
          }
        }
      }
    }
  }
}
