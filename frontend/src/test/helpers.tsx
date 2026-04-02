import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface RenderOptions {
  initialEntries?: string[];
  authToken?: string | null;
}

export function renderWithProviders(
  ui: ReactNode,
  { initialEntries = ["/"], authToken = "test-token" }: RenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const signIn = vi.fn();
  const signOut = vi.fn();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          token: authToken,
          isAuthenticated: !!authToken,
          signIn,
          signOut,
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
