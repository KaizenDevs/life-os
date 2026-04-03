import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, Trash2, CheckCircle } from "lucide-react";
import { useMemberships } from "../hooks/useMemberships";
import { useGroups } from "../hooks/useGroups";
import {
  createMembership,
  updateMembership,
  deleteMembership,
  acceptMembership,
} from "../api/memberships";
import { searchUsers } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { UserResult } from "../api/users";

const ROLES = ["viewer", "member", "admin"];

export function MembersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gId = Number(groupId);

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useMemberships(gId);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [inviteError, setInviteError] = useState("");

  const { showToast } = useToast();
  const group = groupsData?.data.find((g) => g.id === gId);
  const { currentUser } = useAuth();
  const isAdmin = group?.my_role === "admin";
  const memberships = data?.data ?? [];

  // Search users by email
  async function handleSearch() {
    if (!inviteEmail.trim()) return;
    const res = await searchUsers(inviteEmail);
    setSearchResults(res.data);
    setSelectedUser(null);
  }

  const inviteMutation = useMutation({
    mutationFn: () => createMembership(gId, selectedUser!.id, inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", gId] });
      setInviteEmail("");
      setSearchResults([]);
      setSelectedUser(null);
      setInviteError("");
      showToast("Invitation sent", "success");
    },
    onError: (err: any) => {
      const msg = err.errors?.[0] ?? "Could not invite user";
      setInviteError(msg);
      showToast(msg, "error");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      updateMembership(gId, id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", gId] });
      showToast("Role updated", "success");
    },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not update role", "error"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteMembership(gId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", gId] });
      showToast("Member removed", "success");
    },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not remove member", "error"),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => acceptMembership(gId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", gId] });
      showToast("Invitation accepted", "success");
    },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not accept invitation", "error"),
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/groups/${groupId}/providers`)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {group?.name ?? "Group"} — Members
        </h2>
      </div>

      {/* Invite form — admin only */}
      {isAdmin && <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <UserPlus size={15} /> Invite someone
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Search by email"
            value={inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              setSelectedUser(null);
            }}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Find
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && !selectedUser && (
          <ul className="mt-2 border rounded-lg divide-y text-sm">
            {searchResults.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setSelectedUser(u)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  {u.email}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Selected user + role */}
        {selectedUser && (
          <div className="mt-2 flex gap-2 items-center">
            <span className="text-sm flex-1 text-gray-700">
              {selectedUser.email}
            </span>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Invite
            </button>
          </div>
        )}

        {inviteError && (
          <p className="text-red-500 text-sm mt-2">{inviteError}</p>
        )}
      </div>}

      {/* Members list */}
      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      <ul className="space-y-2">
        {memberships.map((m) => (
          <li
            key={m.id}
            className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{m.user.email}</p>
              <p className="text-xs text-gray-400 capitalize">
                {m.accepted_at ? "Active" : "Pending invitation"}
              </p>
            </div>

            {/* Accept own pending invite */}
            {!m.accepted_at && m.user.email === currentUser?.email && (
              <button
                onClick={() => acceptMutation.mutate(m.id)}
                className="text-green-600 hover:text-green-700"
                title="Accept invitation"
              >
                <CheckCircle size={18} />
              </button>
            )}

            {/* Role selector — admin only */}
            {isAdmin ? (
              <select
                value={m.role}
                onChange={(e) => roleMutation.mutate({ id: m.id, role: e.target.value })}
                className="border rounded-lg px-2 py-1 text-sm bg-white focus:outline-none capitalize"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-gray-400 capitalize">{m.role}</span>
            )}

            {/* Remove — admin only */}
            {isAdmin && (
              <button
                onClick={() => removeMutation.mutate(m.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Remove member"
              >
                <Trash2 size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
