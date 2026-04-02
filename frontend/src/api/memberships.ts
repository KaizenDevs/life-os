import { apiFetch } from "./client";
import type { Membership } from "../types";

export const fetchMemberships = (groupId: number) =>
  apiFetch<{ data: Membership[] }>(`/groups/${groupId}/memberships`);

export const createMembership = (
  groupId: number,
  userId: number,
  role: string
) =>
  apiFetch<{ data: Membership }>(`/groups/${groupId}/memberships`, {
    method: "POST",
    body: JSON.stringify({ membership: { user_id: userId, role } }),
  });

export const updateMembership = (
  groupId: number,
  id: number,
  role: string
) =>
  apiFetch<{ data: Membership }>(`/groups/${groupId}/memberships/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ membership: { role } }),
  });

export const acceptMembership = (groupId: number, id: number) =>
  apiFetch<{ data: Membership }>(
    `/groups/${groupId}/memberships/${id}/accept`,
    { method: "POST" }
  );

export const deleteMembership = (groupId: number, id: number) =>
  apiFetch<void>(`/groups/${groupId}/memberships/${id}`, {
    method: "DELETE",
  });
