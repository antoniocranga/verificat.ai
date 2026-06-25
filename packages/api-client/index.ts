import type { Verdict, Claim, CheckSession, ApiError } from '@verificat/types';

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

export function getVerdict(id: string, token?: string): Promise<Verdict> {
  return request<Verdict>(`/fact-checks/verdicts/${id}`, {}, token);
}

export function getClaim(id: string, token?: string): Promise<Claim> {
  return request<Claim>(`/fact-checks/claims/${id}`, {}, token);
}

export function getSession(id: string, token?: string): Promise<CheckSession> {
  return request<CheckSession>(`/fact-checks/sessions/${id}`, {}, token);
}

export function submitAudio(
  blob: Blob,
  sessionId: string,
  token?: string,
): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append('audio', blob);
  formData.append('sessionId', sessionId);
  return request<{ jobId: string }>('/jobs/audio', {
    method: 'POST',
    body: formData,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  }, token);
}
