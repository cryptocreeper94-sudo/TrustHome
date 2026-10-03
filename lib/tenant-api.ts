/**
 * Tenant data helpers — every agent sees only their own rows.
 * The server scopes by session; the client just calls the endpoint.
 *
 * Screens use `useTenantList(path)`:
 *   - real signed-in agent  → live data from the API (isLive = true)
 *   - demo / browse / guest → no request; the screen shows its sample data
 */
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn, getApiUrl } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

export function useTenantList<T extends { id: string }>(path: string, opts?: { refetchInterval?: number }) {
  const { isRealAgent } = useApp();
  const qc = useQueryClient();

  const query = useQuery<T[] | null>({
    queryKey: [path],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isRealAgent,
    staleTime: 15_000,
    refetchInterval: opts?.refetchInterval,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [path] });

  const create = useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await apiRequest('POST', path, body)).json() as Promise<T>,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await apiRequest('PATCH', `${path}/${id}`, body)).json() as Promise<T>,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiRequest('DELETE', `${path}/${id}`); },
    onSuccess: invalidate,
  });

  return {
    isLive: isRealAgent,
    items: Array.isArray(query.data) ? query.data : ([] as T[]),
    isLoading: isRealAgent && query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    create,
    update,
    remove,
  };
}

/** Turns "400: {"error":"..."}" from apiRequest into a readable message. */
export function apiErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.';
  const body = err.message.replace(/^\d+:\s*/, '');
  try {
    const parsed = JSON.parse(body);
    return parsed.error || parsed.message || body;
  } catch {
    return body || 'Something went wrong. Please try again.';
  }
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return '';
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'TBD';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// ─── Documents ────────────────────────────────────────────────────────

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export interface PickedFile {
  name: string;
  type: string;
  size: number;
  blob: Blob;
}

/** Opens the OS file picker (web). Resolves null if the user cancels. */
export function pickFile(accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.heic,.txt'): Promise<PickedFile | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.reject(new Error('File upload is available on the web app.'));
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      resolve(file ? { name: file.name, type: file.type || 'application/octet-stream', size: file.size, blob: file } : null);
    };
    document.body.appendChild(input);
    input.click();
  });
}

export async function uploadDocument(file: PickedFile, transactionLabel?: string) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File is larger than 25 MB.');
  const headers: Record<string, string> = {
    'Content-Type': file.type || 'application/octet-stream',
    'X-File-Name': encodeURIComponent(file.name),
  };
  if (transactionLabel) headers['X-Transaction-Label'] = encodeURIComponent(transactionLabel);
  const res = await globalThis.fetch(new URL('/api/documents', getApiUrl()).toString(), {
    method: 'POST',
    headers,
    body: file.blob,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export function documentDownloadUrl(id: string, inline = false): string {
  return new URL(`/api/documents/${id}/download${inline ? '?inline=1' : ''}`, getApiUrl()).toString();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
