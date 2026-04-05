import { useState, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
  Search,
  MessageCircle,
} from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { useProviders } from "../hooks/useProviders";
import { archiveProvider, unarchiveProvider, deleteProvider } from "../api/providers";
import { fetchGroupModules } from "../api/modules";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../api/client";
import type { Provider } from "../types";

type Tab = "active" | "archived";

/** International number as digits only for https://wa.me/ */
function whatsappUrlFromPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function ProvidersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gId = Number(groupId);

  // All hooks must be declared before any conditional returns
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const letterBarRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.system_role === "super_admin";
  const { showToast } = useToast();

  const { data: modulesData } = useQuery({
    queryKey: ["group_modules", gId],
    queryFn: () => fetchGroupModules(gId),
  });
  const { data: groupsData } = useGroups();

  // Derive module state before passing to hooks so providers only fetch once access is confirmed
  const contactsModule = modulesData?.data.find((gm) => gm.module.key === "contacts_book");
  // Default to false (not true) while modulesData is still loading — prevents a premature fetch
  const moduleEnabled = modulesData
    ? !!(contactsModule?.enabled && contactsModule.module.enabled)
    : false;

  const { data, isLoading } = useProviders(gId, moduleEnabled);
  const { data: archivedData, isLoading: isLoadingArchived } = useQuery({
    queryKey: ["providers", gId, "archived"],
    queryFn: () => apiFetch<{ data: Provider[] }>(`/groups/${gId}/providers?archived=true`),
    enabled: tab === "archived" && moduleEnabled,
  });

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function handleLetterSlide(e: React.TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const l = el?.getAttribute("data-letter");
    if (l) { setLetter(l); setQuery(""); }
  }

  const invalidateProviders = () => {
    queryClient.invalidateQueries({ queryKey: ["providers", gId] });
    queryClient.invalidateQueries({ queryKey: ["providers", gId, "archived"] });
  };

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveProvider(gId, id),
    onSuccess: () => { invalidateProviders(); showToast("Provider archived", "success"); },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not archive provider", "error"),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: number) => unarchiveProvider(gId, id),
    onSuccess: () => { invalidateProviders(); showToast("Provider restored", "success"); },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not restore provider", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProvider(gId, id),
    onSuccess: () => { invalidateProviders(); showToast("Provider deleted", "success"); },
    onError: (err: any) => showToast(err.errors?.[0] ?? "Could not delete provider", "error"),
  });

  if (modulesData && !moduleEnabled) {
    return <Navigate to="/" replace />;
  }

  const group = groupsData?.data.find((g) => g.id === gId);
  const canWrite = group?.my_role === "admin" || group?.my_role === "member";
  const active = data?.data ?? [];
  const archived = archivedData?.data ?? [];

  function ProviderCard({
    provider,
    isArchived,
  }: {
    provider: Provider;
    isArchived: boolean;
  }) {
    const whatsappHref = provider.phone
      ? whatsappUrlFromPhone(provider.phone)
      : null;

    return (
      <li className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{provider.name}</p>
            <p className="text-sm text-gray-400 capitalize">
              {provider.category.name}
            </p>
          </div>
          <div className="flex gap-2">
            {canWrite && (<>
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
                {isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              </button>
            </>)}
            {isArchived && isSuperAdmin && (
              <button
                onClick={() => { if (confirm("Permanently delete this provider?")) deleteMutation.mutate(provider.id); }}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete permanently"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          {provider.phone && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Phone size={13} />
                {provider.phone}
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline"
                  title="Open WhatsApp chat"
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
              )}
            </div>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`} className="flex items-center gap-2 text-sm text-blue-600">
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

  const loading = tab === "active" ? isLoading : isLoadingArchived;
  const providers = (tab === "active" ? active : archived)
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .filter((p) => !letter || p.name.toUpperCase().startsWith(letter));

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
        {tab === "active" && canWrite && (
          <button
            onClick={() => navigate(`/groups/${groupId}/providers/new`)}
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        )}
      </div>

      {/* Tabs */}
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

      <div className="flex gap-3">
        {/* Search + list */}
        <div className="flex-1 min-w-0">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setLetter(null); }}
              placeholder="Search providers…"
              className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading && <p className="text-gray-400 text-sm">Loading…</p>}

          {!loading && providers.length === 0 && (
            <p className="text-gray-400 text-sm">
              {tab === "active" ? "No providers yet." : "No archived providers."}
            </p>
          )}

          <ul className="space-y-2">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} isArchived={tab === "archived"} />
            ))}
          </ul>
        </div>

        {/* A–Z letter bar */}
        <div
          ref={letterBarRef}
          className="flex flex-col gap-0.5 touch-none select-none"
          onTouchMove={handleLetterSlide}
        >
          {ALPHABET.map((l) => (
            <button
              key={l}
              data-letter={l}
              onClick={() => { setLetter(letter === l ? null : l); setQuery(""); }}
              className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                letter === l
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
