import type { ApiError } from '@verificat/types';

const BASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
  || 'https://staging.verificat.xyz/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      code: 'UNKNOWN',
      message: res.statusText,
      statusCode: res.status,
    }));
    throw err;
  }
  return res.json() as Promise<T>;
}

export function getVerdict(id: string, token?: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/fact-checks/${id}`, {}, token);
}

export function searchVerdicts(
  query = '',
  page = 1,
  limit = 20,
  token?: string,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
  return request<Record<string, unknown>>(`/fact-checks/search?${params}`, {}, token);
}

export function getLatestChecks(token?: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>('/fact-checks', {}, token);
}

export function submitAudio(
  blob: Blob,
  token?: string,
): Promise<{ jobId: string }> {
  return request<{ jobId: string }>('/jobs/upload', {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'audio/webm' },
    body: blob,
  }, token);
}
