import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { mock } from "bun:test";
import { AuthContext } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";

interface CurrentUser {
  email: string;
  system_role: string;
}

interface RenderOptions {
  initialEntries?: string[];
  authToken?: string | null;
  currentUser?: CurrentUser | null;
}

export function renderWithProviders(
  ui: ReactNode,
  {
    initialEntries = ["/"],
    authToken = "test-token",
    currentUser = { email: "user@example.com", system_role: "user" },
  }: RenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <AuthContext.Provider
        value={{
          token: authToken,
          currentUser: authToken ? currentUser : null,
          isAuthenticated: !!authToken,
          signIn: mock(),
          signOut: mock(),
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
