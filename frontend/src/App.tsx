import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { GroupsPage } from "./pages/GroupsPage";
import { GroupFormPage } from "./pages/GroupFormPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { ProviderFormPage } from "./pages/ProviderFormPage";
import { MembersPage } from "./pages/MembersPage";
import { CategoriesPage } from "./pages/CategoriesPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated — all wrapped in Layout (header + nav) */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/new" element={<GroupFormPage />} />
              <Route path="/groups/:id/edit" element={<GroupFormPage />} />
              <Route path="/groups/:groupId/providers" element={<ProvidersPage />} />
              <Route path="/groups/:groupId/providers/new" element={<ProviderFormPage />} />
              <Route path="/groups/:groupId/providers/:providerId/edit" element={<ProviderFormPage />} />
              <Route path="/groups/:groupId/members" element={<MembersPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
