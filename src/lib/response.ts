type WrappedListPayload = {
  items?: unknown;
  data?: unknown;
  results?: unknown;
};

function isObject(payload: unknown): payload is Record<string, unknown> {
  return Boolean(payload) && typeof payload === "object";
}

export function normalizeArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!isObject(payload)) return [];

  const wrapped = payload as WrappedListPayload;
  if (Array.isArray(wrapped.items)) return wrapped.items as T[];
  if (Array.isArray(wrapped.data)) return wrapped.data as T[];
  if (Array.isArray(wrapped.results)) return wrapped.results as T[];

  return [];
}

export function normalizeObjectPayload<T extends Record<string, unknown>>(
  payload: unknown
): T | null {
  if (!isObject(payload)) return null;

  const wrapped = payload as { data?: unknown; item?: unknown; result?: unknown };
  if (isObject(wrapped.data)) return wrapped.data as T;
  if (isObject(wrapped.item)) return wrapped.item as T;
  if (isObject(wrapped.result)) return wrapped.result as T;

  return payload as T;
}