import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { mock } from "bun:test";
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

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          token: authToken,
          isAuthenticated: !!authToken,
          signIn: mock(),
          signOut: mock(),
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
