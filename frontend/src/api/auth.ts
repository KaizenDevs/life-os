// Auth API calls — login, registration, and password reset

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch("/users/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!response.ok) {
    throw new AuthError("Invalid email or password", response.status);
  }

  const token = response.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new AuthError("No token received", response.status);

  return token;
}

export async function register(
  email: string,
  password: string
): Promise<string> {
  const response = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: { email, password, password_confirmation: password },
    }),
  });

  if (!response.ok) {
    throw new AuthError("Registration failed", response.status);
  }

  const token = response.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new AuthError("No token received", response.status);

  return token;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch("/users/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email } }),
  });

  if (!response.ok) {
    throw new AuthError("Request failed", response.status);
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await fetch("/users/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: {
        reset_password_token: token,
        password,
        password_confirmation: password,
      },
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new AuthError(data.errors?.join(", ") ?? "Reset failed", response.status);
  }
}
