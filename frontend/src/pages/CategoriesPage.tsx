import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useCategories();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const categories = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => createCategory(newName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
      setError("");
    },
    onError: (err: any) => setError(err.errors?.[0] ?? "Could not create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
    onError: (err: any) => setError(err.errors?.[0] ?? "Could not update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (err: any) => setError(err.errors?.[0] ?? "Could not delete category"),
  });

  function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditingName(name);
    setError("");
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <ul className="space-y-2 mb-4">
        {categories.map((c) => (
          <li
            key={c.id}
            className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2"
          >
            {editingId === c.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() =>
                    updateMutation.mutate({ id: c.id, name: editingName.trim() })
                  }
                  className="text-green-600 hover:text-green-700"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm capitalize">{c.name}</span>
                <button
                  onClick={() => startEdit(c.id, c.name)}
                  className="text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(c.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add new category */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          onKeyDown={(e) => e.key === "Enter" && createMutation.mutate()}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!newName.trim() || createMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1 text-sm"
        >
          <Plus size={15} /> Add
        </button>
      </div>
    </div>
  );
}
