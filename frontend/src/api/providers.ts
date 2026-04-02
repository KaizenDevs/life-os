import { apiFetch } from "./client";
import type { Provider } from "../types";

export interface ProviderInput {
  name: string;
  category_id: number;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const fetchProvider = (groupId: number, id: number) =>
  apiFetch<{ data: Provider }>(`/groups/${groupId}/providers/${id}`);

export const createProvider = (groupId: number, data: ProviderInput) =>
  apiFetch<{ data: Provider }>(`/groups/${groupId}/providers`, {
    method: "POST",
    body: JSON.stringify({ provider: data }),
  });

export const updateProvider = (
  groupId: number,
  id: number,
  data: Partial<ProviderInput>
) =>
  apiFetch<{ data: Provider }>(`/groups/${groupId}/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ provider: data }),
  });

export const archiveProvider = (groupId: number, id: number) =>
  apiFetch<{ data: Provider }>(
    `/groups/${groupId}/providers/${id}/archive`,
    { method: "POST" }
  );

export const unarchiveProvider = (groupId: number, id: number) =>
  apiFetch<{ data: Provider }>(
    `/groups/${groupId}/providers/${id}/unarchive`,
    { method: "POST" }
  );

export const deleteProvider = (groupId: number, id: number) =>
  apiFetch<void>(`/groups/${groupId}/providers/${id}`, { method: "DELETE" });
