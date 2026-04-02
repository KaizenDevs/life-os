// Auth API calls — login and registration

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch("/users/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!response.ok) throw new Error("Invalid email or password");

  const token = response.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No token received");

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

  if (!response.ok) throw new Error("Registration failed");

  const token = response.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No token received");

  return token;
}
