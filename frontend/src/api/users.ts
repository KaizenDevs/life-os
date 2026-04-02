import { apiFetch } from "./client";

export interface UserResult {
  id: number;
  email: string;
}

export const searchUsers = (email: string) =>
  apiFetch<{ data: UserResult[] }>(
    `/users?email=${encodeURIComponent(email)}`
  );
