import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import type { Group } from "../types";

const mockUseGroups = mock();
const mockFetchGroupModules = mock();

mock.module("../hooks/useGroups", () => ({ useGroups: mockUseGroups }));
mock.module("../api/modules", () => ({ fetchGroupModules: mockFetchGroupModules }));

import { HomePage } from "../pages/HomePage";
import { renderWithProviders } from "./helpers";

const activeGroup: Group = {
  id: 1, name: "My Home", group_type: "household",
  archived_at: null, created_at: "", updated_at: "",
  created_by: { id: 1, email: "user@example.com" }, my_role: "admin",
};

const archivedGroup: Group = {
  ...activeGroup, id: 2, name: "Old Home",
  archived_at: "2024-06-01T00:00:00Z",
};

const stubModules = {
  data: [
    { id: 1, enabled: true, module: { id: 1, name: "Contacts Book", key: "contacts_book", enabled: true } },
  ],
};

describe("HomePage", () => {
  beforeEach(() => {
    mockFetchGroupModules.mockClear();
    mockFetchGroupModules.mockResolvedValue(stubModules);
  });

  it("renders active groups only (excludes archived)", async () => {
    mockUseGroups.mockReturnValue({ data: { data: [activeGroup, archivedGroup] }, isLoading: false });
    renderWithProviders(<HomePage />);
    await waitFor(() => screen.getByText("My Home"));
    expect(screen.queryByText("Old Home")).toBeNull();
    await waitFor(() => expect(mockFetchGroupModules).toHaveBeenCalledWith(1));
  });

  it("shows empty state when no active groups", async () => {
    mockUseGroups.mockReturnValue({ data: { data: [] }, isLoading: false });
    renderWithProviders(<HomePage />);
    await waitFor(() => screen.getByText(/no groups yet/i));
  });

  it("shows loading state", () => {
    mockUseGroups.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders enabled modules inside group cards", async () => {
    mockUseGroups.mockReturnValue({ data: { data: [activeGroup] }, isLoading: false });
    renderWithProviders(<HomePage />);
    await waitFor(() => screen.getByText("Contacts Book"));
  });

  it("shows 'No modules enabled' when group has no active modules", async () => {
    mockFetchGroupModules.mockResolvedValue({ data: [] });
    mockUseGroups.mockReturnValue({ data: { data: [activeGroup] }, isLoading: false });
    renderWithProviders(<HomePage />);
    await waitFor(() => screen.getByText("No modules enabled."));
    await waitFor(() => expect(mockFetchGroupModules).toHaveBeenCalledWith(1));
  });
});
