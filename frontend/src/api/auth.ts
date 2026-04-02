// Auth API calls — login and registration

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
