/**
 * Fetch wrapper with automatic access-token refresh.
 *
 * A 401 triggers a single refresh attempt, and every request that 401s while a
 * refresh is already in flight waits on that same promise instead of starting
 * its own - otherwise a dashboard with eight parallel queries would fire eight
 * refreshes and the rotation defence on the server would burn the token family.
 */

const BASE = '/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const ACCESS_KEY = 'ea-access-token';
const REFRESH_KEY = 'ea-refresh-token';

export const tokens = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();
export function onUnauthorized(fn: Listener): () => void {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

let refreshInFlight: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const refreshToken = tokens.refresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
    tokens.set(body.data.accessToken, body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function ensureRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = runRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  raw?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function send<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { body, query, raw, headers, ...rest } = options;
  const token = tokens.access();

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && retry) {
    const ok = await ensureRefresh();
    if (ok) return send<T>(path, options, false);
    tokens.clear();
    unauthorizedListeners.forEach((fn) => fn());
    throw new ApiError('Your session expired - please sign in again', 401, 'UNAUTHORIZED');
  }

  if (raw) {
    if (!res.ok) throw new ApiError(await res.text(), res.status);
    return (await res.text()) as T;
  }

  const payload = (await res.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string; code?: string; details?: unknown }
    | null;

  if (!res.ok) {
    const err = payload as { message?: string; code?: string; details?: unknown } | null;
    throw new ApiError(err?.message ?? 'Request failed', res.status, err?.code, err?.details);
  }

  return (payload as ApiEnvelope<T>).data;
}

/** Same as `send`, but keeps the envelope so paginated meta survives. */
async function sendWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const token = tokens.access();
  const { body, query, headers, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401) {
    const ok = await ensureRefresh();
    if (ok) return sendWithMeta<T>(path, options);
    tokens.clear();
    unauthorizedListeners.forEach((fn) => fn());
    throw new ApiError('Your session expired - please sign in again', 401, 'UNAUTHORIZED');
  }

  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !payload) {
    throw new ApiError(
      (payload as unknown as { message?: string })?.message ?? 'Request failed',
      res.status,
    );
  }
  return payload;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => send<T>(path, { method: 'GET', query }),
  getWithMeta: <T>(path: string, query?: RequestOptions['query']) =>
    sendWithMeta<T>(path, { method: 'GET', query }),
  getText: (path: string, query?: RequestOptions['query']) =>
    send<string>(path, { method: 'GET', query, raw: true }),
  post: <T>(path: string, body?: unknown) => send<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => send<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string, query?: RequestOptions['query']) =>
    send<T>(path, { method: 'DELETE', query }),
};
