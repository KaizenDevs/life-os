import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Archive, ArchiveRestore, Pencil, Search } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { archiveGroup, unarchiveGroup } from "../api/groups";

type Tab = "active" | "archived";

export function GroupsPage() {
  const { data, isLoading } = useGroups();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("active");

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: number) => unarchiveGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const allGroups = data?.data ?? [];
  const groups = allGroups
    .filter((g) => tab === "active" ? !g.archived_at : !!g.archived_at)
    .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Groups</h2>
        {tab === "active" && (
          <button
            onClick={() => navigate("/groups/new")}
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> New group
          </button>
        )}
      </div>

      <div className="flex border-b mb-4">
        {(["active", "archived"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groups…"
          className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!isLoading && groups.length === 0 && (
        <p className="text-gray-400 text-sm">
          {tab === "active" ? "No groups yet." : "No archived groups."}
        </p>
      )}

      <ul className="space-y-2">
        {groups.map((group) => (
          <li key={group.id} className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/groups/${group.id}/providers`)}
              className="flex-1 bg-white rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow transition-shadow text-left"
            >
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-400 capitalize">
                  {group.group_type}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>

            {/* Edit / Archive / Unarchive — admin only */}
            {group.my_role === "admin" && (<>
              {tab === "active" && (
                <button
                  onClick={() => navigate(`/groups/${group.id}/edit`)}
                  className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                  title="Edit group"
                >
                  <Pencil size={16} />
                </button>
              )}
              <button
                onClick={() =>
                  tab === "active"
                    ? archiveMutation.mutate(group.id)
                    : unarchiveMutation.mutate(group.id)
                }
                className="p-2 text-gray-300 hover:text-orange-400 transition-colors"
                title={tab === "active" ? "Archive group" : "Unarchive group"}
              >
                {tab === "active" ? <Archive size={16} /> : <ArchiveRestore size={16} />}
              </button>
            </>)}
          </li>
        ))}
      </ul>
    </div>
  );
}
