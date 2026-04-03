import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Provider } from "../types";

export function useProviders(groupId: number, enabled = true) {
  return useQuery({
    queryKey: ["providers", groupId],
    queryFn: () =>
      apiFetch<{ data: Provider[] }>(`/groups/${groupId}/providers`),
    enabled,
  });
}
