import { apiFetch } from "./client";
import type { Group } from "../types";

export const createGroup = (data: { name: string; group_type: string }) =>
  apiFetch<{ data: Group }>("/groups", {
    method: "POST",
    body: JSON.stringify({ group: data }),
  });

export const updateGroup = (
  id: number,
  data: { name?: string; group_type?: string }
) =>
  apiFetch<{ data: Group }>(`/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ group: data }),
  });

export const archiveGroup = (id: number) =>
  apiFetch<{ data: Group }>(`/groups/${id}/archive`, { method: "POST" });

export const unarchiveGroup = (id: number) =>
  apiFetch<{ data: Group }>(`/groups/${id}/unarchive`, { method: "POST" });

export const deleteGroup = (id: number) =>
  apiFetch<void>(`/groups/${id}`, { method: "DELETE" });
