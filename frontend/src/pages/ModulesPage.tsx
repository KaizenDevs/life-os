import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchModules, updateModule } from "../api/modules";

export function ModulesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      updateModule(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules"] }),
  });

  const modules = data?.data ?? [];

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-lg font-semibold mb-1">Modules</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enable or disable modules globally. Disabled modules won't be available to any group.
      </p>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      <ul className="space-y-2">
        {modules.map((mod) => (
          <li
            key={mod.id}
            className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{mod.name}</p>
              <p className="text-xs text-gray-400">{mod.key}</p>
            </div>
            <button
              onClick={() => toggleMutation.mutate({ id: mod.id, enabled: !mod.enabled })}
              disabled={toggleMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mod.enabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  mod.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
