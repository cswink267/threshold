/**
 * Server-side calls to the FastAPI service. Import this only from server code
 * (frontmatter, server islands, endpoints): API_URL is the internal address.
 * Code running in the browser should use PUBLIC_API_URL from 'astro:env/client'.
 */
import { API_URL } from 'astro:env/server';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('accept')) headers.set('accept', 'application/json');

  const response = await fetch(new URL(path, API_URL), {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(3000),
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} answered ${response.status}`);
  }
  return (await response.json()) as T;
}
