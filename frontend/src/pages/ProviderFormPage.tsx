import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { createProvider, updateProvider, fetchProvider } from "../api/providers";
import { useToast } from "../context/ToastContext";
import { useCategories } from "../hooks/useCategories";

export function ProviderFormPage() {
  const { groupId, providerId } = useParams<{
    groupId: string;
    providerId: string;
  }>();
  const isEditing = !!providerId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categoriesData } = useCategories();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const { showToast } = useToast();
  const [error, setError] = useState("");

  // Prefill when editing
  useEffect(() => {
    if (isEditing) {
      fetchProvider(Number(groupId), Number(providerId)).then(({ data }) => {
        setName(data.name);
        setCategoryId(String(data.category.id));
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setAddress(data.address ?? "");
        setNotes(data.notes ?? "");
      });
    }
  }, [isEditing, groupId, providerId]);

  // Set default category once loaded
  useEffect(() => {
    if (!isEditing && !categoryId && categoriesData?.data.length) {
      setCategoryId(String(categoriesData.data[0].id));
    }
  }, [categoriesData, isEditing, categoryId]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        category_id: Number(categoryId),
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        notes: notes || undefined,
      };
      return isEditing
        ? updateProvider(Number(groupId), Number(providerId), payload)
        : createProvider(Number(groupId), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", Number(groupId)] });
      showToast(isEditing ? "Provider updated" : "Provider added", "success");
      navigate(`/groups/${groupId}/providers`);
    },
    onError: (err: any) => {
      const msg = err.errors?.[0] ?? "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate();
  }

  const categories = categoriesData?.data ?? [];

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/groups/${groupId}/providers`)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit provider" : "New provider"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. John's Plumbing"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="capitalize">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this provider…"
            rows={3}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Add provider"}
        </button>
      </form>
    </div>
  );
}
