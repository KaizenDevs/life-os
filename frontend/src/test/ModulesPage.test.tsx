import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LifeOsModule } from "../types";

const mockFetchModules = mock();
const mockUpdateModule = mock();

mock.module("../api/modules", () => ({
  fetchModules: mockFetchModules,
  updateModule: mockUpdateModule,
}));

import { ModulesPage } from "../pages/ModulesPage";
import { renderWithProviders } from "./helpers";

const superAdmin = { email: "admin@example.com", system_role: "super_admin" };

const stubModules: LifeOsModule[] = [
  { id: 1, name: "Contacts Book", key: "contacts_book", enabled: true },
  { id: 2, name: "Tasks", key: "tasks", enabled: false },
];

describe("ModulesPage", () => {
  beforeEach(() => {
    mockFetchModules.mockClear();
    mockUpdateModule.mockClear();
    mockFetchModules.mockResolvedValue({ data: stubModules });
  });

  it("renders module list", async () => {
    renderWithProviders(<ModulesPage />, { currentUser: superAdmin });
    await waitFor(() => screen.getByText("Contacts Book"));
    expect(screen.getByText("contacts_book")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("toggles a module off", async () => {
    mockUpdateModule.mockResolvedValueOnce({ data: { ...stubModules[0], enabled: false } });
    renderWithProviders(<ModulesPage />, { currentUser: superAdmin });
    await waitFor(() => screen.getByText("Contacts Book"));

    const toggles = screen.getAllByRole("button");
    await userEvent.click(toggles[0]); // first module toggle

    await waitFor(() =>
      expect(mockUpdateModule).toHaveBeenCalledWith(1, false)
    );
  });

  it("toggles a disabled module on", async () => {
    mockUpdateModule.mockResolvedValueOnce({ data: { ...stubModules[1], enabled: true } });
    renderWithProviders(<ModulesPage />, { currentUser: superAdmin });
    await waitFor(() => screen.getByText("Tasks"));

    const toggles = screen.getAllByRole("button");
    await userEvent.click(toggles[1]); // second module toggle

    await waitFor(() =>
      expect(mockUpdateModule).toHaveBeenCalledWith(2, true)
    );
  });

  it("shows loading state initially", () => {
    mockFetchModules.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<ModulesPage />, { currentUser: superAdmin });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
