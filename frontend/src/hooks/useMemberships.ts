import { useQuery } from "@tanstack/react-query";
import { fetchMemberships } from "../api/memberships";

export function useMemberships(groupId: number) {
  return useQuery({
    queryKey: ["memberships", groupId],
    queryFn: () => fetchMemberships(groupId),
  });
}
