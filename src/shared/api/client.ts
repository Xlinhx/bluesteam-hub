export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { participantToken?: string; displayToken?: string } = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const headers = new Headers(options.headers || {});
  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.participantToken) {
    headers.set('x-participant-token', options.participantToken);
  }
  if (options.displayToken) {
    headers.set('x-display-token', options.displayToken);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new ApiClientError(
      response.status,
      payload?.code || `HTTP_${response.status}`,
      payload?.message || `Yêu cầu thất bại (${response.status})`,
      payload?.details,
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { participantToken?: string; displayToken?: string } = {},
): Promise<{
  ok: boolean;
  status: number;
  data?: T;
  error?: ApiErrorPayload;
}> {
  const normalizedPath =
    path.startsWith('http') || path.startsWith('/api/')
      ? path
      : `/api/v1${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const data = await apiRequest<T>(normalizedPath, options);
    return {
      ok: true,
      status: 200,
      data,
    };
  } catch (err) {
    if (err instanceof ApiClientError) {
      return {
        ok: false,
        status: err.status,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      };
    }
    return {
      ok: false,
      status: 500,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ',
      },
    };
  }
}

export async function uploadTeacherMediaFile(file: File, signal?: AbortSignal): Promise<{
  id: string;
  kind: 'image' | 'audio' | 'video' | 'pdf';
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  sha256: string;
  status: 'ready';
  url: string;
}> {
  const form = new FormData();
  form.append('file', file, file.name);
  return apiRequest('/api/v1/teacher/media', {
    method: 'POST',
    body: form,
    signal,
  });
}
