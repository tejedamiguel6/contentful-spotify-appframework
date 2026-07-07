export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // non-JSON error body; fall back to the status message
    }
    throw new Error(message);
  }

  return response.json();
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
