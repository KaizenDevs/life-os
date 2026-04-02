import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookUser, ChevronRight, Plus } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { fetchGroupModules } from "../api/modules";
import type { Group } from "../types";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  contacts_book: <BookUser size={20} />,
};

const MODULE_ROUTES: Record<string, (groupId: number) => string> = {
  contacts_book: (groupId) => `/groups/${groupId}/providers`,
};

function GroupCard({ group }: { group: Group }) {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["group_modules", group.id],
    queryFn: () => fetchGroupModules(group.id),
  });

  const modules = (data?.data ?? []).filter((gm) => gm.enabled);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="font-semibold text-base mb-3">{group.name}</p>
      {modules.length === 0 && (
        <p className="text-sm text-gray-400">No modules enabled.</p>
      )}
      <ul className="space-y-2">
        {modules.map((gm) => {
          const route = MODULE_ROUTES[gm.module.key]?.(group.id);
          return (
            <li key={gm.id}>
              <button
                onClick={() => route && navigate(route)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors text-left"
              >
                <span className="text-blue-500">
                  {MODULE_ICONS[gm.module.key] ?? <BookUser size={20} />}
                </span>
                <span className="flex-1 text-sm font-medium">{gm.module.name}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGroups();
  const groups = (data?.data ?? []).filter((g) => !g.archived_at);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Home</h2>
        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Plus size={15} /> New group
        </button>
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!isLoading && groups.length === 0 && (
        <p className="text-gray-400 text-sm">No groups yet. Create one to get started.</p>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
}
