import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useGroups } from "../hooks/useGroups";

export function GroupsPage() {
  const { data, isLoading } = useGroups();
  const navigate = useNavigate();

  const groups = data?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Groups</h2>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!isLoading && groups.length === 0 && (
        <p className="text-gray-400 text-sm">No groups yet.</p>
      )}

      <ul className="space-y-2">
        {groups.map((group) => (
          <li key={group.id}>
            <button
              onClick={() => navigate(`/groups/${group.id}/providers`)}
              className="w-full bg-white rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow transition-shadow text-left"
            >
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-400 capitalize">
                  {group.group_type}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
