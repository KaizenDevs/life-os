import { apiFetch } from "./client";
import type { LifeOsModule, GroupModule } from "../types";

export const fetchModules = () =>
  apiFetch<{ data: LifeOsModule[] }>("/modules");

export const updateModule = (id: number, enabled: boolean) =>
  apiFetch<{ data: LifeOsModule }>(`/modules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });

export const fetchGroupModules = (groupId: number) =>
  apiFetch<{ data: GroupModule[] }>(`/groups/${groupId}/group_modules`);

export const updateGroupModule = (groupId: number, id: number, enabled: boolean) =>
  apiFetch<{ data: GroupModule }>(`/groups/${groupId}/group_modules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
