import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, MapPin, Plus, Pencil, Archive, ArchiveRestore, Users } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { useProviders } from "../hooks/useProviders";
import { archiveProvider, unarchiveProvider } from "../api/providers";

export function ProvidersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gId = Number(groupId);

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useProviders(gId);

  const group = groupsData?.data.find((g) => g.id === gId);
  const providers = data?.data ?? [];
  const active = providers.filter((p) => !p.archived_at);
  const archived = providers.filter((p) => p.archived_at);

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveProvider(gId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["providers", gId] }),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: number) => unarchiveProvider(gId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["providers", gId] }),
  });

  function ProviderCard({
    provider,
    isArchived,
  }: {
    provider: (typeof providers)[0];
    isArchived: boolean;
  }) {
    return (
      <li className={`bg-white rounded-xl p-4 shadow-sm ${isArchived ? "opacity-60" : ""}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{provider.name}</p>
            <p className="text-sm text-gray-400 capitalize">
              {provider.category.name}
            </p>
          </div>
          <div className="flex gap-2">
            {!isArchived && (
              <button
                onClick={() => navigate(`/groups/${groupId}/providers/${provider.id}/edit`)}
                className="text-gray-300 hover:text-blue-500 transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              onClick={() =>
                isArchived
                  ? unarchiveMutation.mutate(provider.id)
                  : archiveMutation.mutate(provider.id)
              }
              className="text-gray-300 hover:text-orange-400 transition-colors"
              title={isArchived ? "Unarchive" : "Archive"}
            >
              {isArchived ? (
                <ArchiveRestore size={15} />
              ) : (
                <Archive size={15} />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Phone size={13} />
              {provider.phone}
            </a>
          )}
          {provider.email && (
            <a
              href={`mailto:${provider.email}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Mail size={13} />
              {provider.email}
            </a>
          )}
          {provider.address && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={13} />
              {provider.address}
            </p>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/groups")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold flex-1">
          {group?.name ?? "Providers"}
        </h2>
        <button
          onClick={() => navigate(`/groups/${groupId}/members`)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          title="Members"
        >
          <Users size={18} />
        </button>
        <button
          onClick={() => navigate(`/groups/${groupId}/providers/new`)}
          className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {/* Active providers */}
      {active.length === 0 && !isLoading && (
        <p className="text-gray-400 text-sm mb-4">No providers yet.</p>
      )}
      <ul className="space-y-2">
        {active.map((p) => (
          <ProviderCard key={p.id} provider={p} isArchived={false} />
        ))}
      </ul>

      {/* Archived section */}
      {archived.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Archived
          </p>
          <ul className="space-y-2">
            {archived.map((p) => (
              <ProviderCard key={p.id} provider={p} isArchived={true} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
