const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";


const TOKEN_KEY = "auth_token";
const BOX_ID_KEY = "selected_box_id";

interface ApiRequestOptions extends RequestInit {
  withBoxId?: boolean;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const normalized = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === normalized);
}

function toHeadersRecord(headers?: RequestInit["headers"]): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

function buildUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredBoxId(): string | null {
  return localStorage.getItem(BOX_ID_KEY);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { withBoxId = true, ...fetchOptions } = options;
  const token = getStoredToken();
  const boxId = getStoredBoxId();
  const headers = toHeadersRecord(fetchOptions.headers);

  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  if (!isFormData && !hasHeader(headers, "Content-Type") && fetchOptions.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !hasHeader(headers, "Authorization")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (withBoxId && boxId && !hasHeader(headers, "x-box-id")) {
    headers["x-box-id"] = boxId;
  }

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const fallback = { message: "Erro desconhecido" };
    const errorPayload = (data && typeof data === "object") ? data : fallback;
    throw { status: response.status, ...errorPayload };
  }

  return data as T;
}

export const api = {
  post: <T>(path: string, body: unknown, options: ApiRequestOptions = {}) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  get: <T>(path: string, options: ApiRequestOptions = {}) =>
    request<T>(path, { ...options, method: "GET" }),
};
