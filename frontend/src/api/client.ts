// Base fetch wrapper — adds the auth token to every request automatically

const API_BASE = "/api/v1";

function getToken() {
  return sessionStorage.getItem("token");
}

interface ApiError {
  status: number;
  errors?: string[];
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error: ApiError = { status: response.status, ...body };
    throw error;
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return undefined as T;

  return response.json();
}
