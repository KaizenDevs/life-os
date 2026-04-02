import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { useGroups } from "../hooks/useGroups";
import { useProviders } from "../hooks/useProviders";

export function ProvidersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useProviders(Number(groupId));

  const group = groupsData?.data.find((g) => g.id === Number(groupId));
  const providers = data?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/groups")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">{group?.name ?? "Providers"}</h2>
      </div>

      {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!isLoading && providers.length === 0 && (
        <p className="text-gray-400 text-sm">No providers yet.</p>
      )}

      <ul className="space-y-2">
        {providers.map((provider) => (
          <li key={provider.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-gray-400 capitalize">
                  {provider.category.name}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="mt-3 flex flex-col gap-1">
              {provider.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-2 text-sm text-blue-600"
                >
                  <Phone size={14} />
                  {provider.phone}
                </a>
              )}
              {provider.email && (
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-2 text-sm text-blue-600"
                >
                  <Mail size={14} />
                  {provider.email}
                </a>
              )}
              {provider.address && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} />
                  {provider.address}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
