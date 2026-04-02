import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { createGroup, updateGroup } from "../api/groups";
import { useGroups } from "../hooks/useGroups";

export function GroupFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: groupsData } = useGroups();

  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState("household");
  const [error, setError] = useState("");

  // Prefill when editing
  useEffect(() => {
    if (isEditing && groupsData) {
      const group = groupsData.data.find((g) => g.id === Number(id));
      if (group) {
        setName(group.name);
        setGroupType(group.group_type);
      }
    }
  }, [isEditing, id, groupsData]);

  const mutation = useMutation({
    mutationFn: () =>
      isEditing
        ? updateGroup(Number(id), { name, group_type: groupType })
        : createGroup({ name, group_type: groupType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate("/groups");
    },
    onError: (err: any) => {
      setError(err.errors?.[0] ?? "Something went wrong");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate();
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/groups")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit group" : "New group"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. My Home"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="household">Household</option>
            <option value="company">Company</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? "Saving…" : isEditing ? "Save changes" : "Create group"}
        </button>
      </form>
    </div>
  );
}
