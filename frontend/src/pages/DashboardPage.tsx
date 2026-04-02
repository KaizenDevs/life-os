import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Life OS</h1>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Dashboard — coming soon.</p>
      </main>
    </div>
  );
}
