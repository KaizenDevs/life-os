import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Group } from "../types";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => apiFetch<{ data: Group[] }>("/groups"),
  });
}
