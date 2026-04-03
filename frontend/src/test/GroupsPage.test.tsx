import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Group } from "../types";

const mockArchiveGroup = mock();
const mockUnarchiveGroup = mock();
const mockDeleteGroup = mock();
const mockUseGroups = mock();

mock.module("../api/groups", () => ({
  archiveGroup: mockArchiveGroup,
  unarchiveGroup: mockUnarchiveGroup,
  deleteGroup: mockDeleteGroup,
}));

mock.module("../hooks/useGroups", () => ({
  useGroups: mockUseGroups,
}));

import { GroupsPage } from "../pages/GroupsPage";
import { renderWithProviders } from "./helpers";

const superAdmin = { email: "admin@example.com", system_role: "super_admin" };
const regularUser = { email: "user@example.com", system_role: "user" };

const activeAdminGroup: Group = {
  id: 1, name: "My Home", group_type: "household",
  archived_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  created_by: { id: 1, email: "user@example.com" }, my_role: "admin",
};

const activeViewerGroup: Group = {
  id: 2, name: "Work Team", group_type: "company",
  archived_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  created_by: { id: 99, email: "boss@example.com" }, my_role: "viewer",
};

const archivedAdminGroup: Group = {
  id: 3, name: "Old House", group_type: "household",
  archived_at: "2024-06-01T00:00:00Z", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z",
  created_by: { id: 1, email: "user@example.com" }, my_role: "admin",
};

describe("GroupsPage", () => {
  beforeEach(() => {
    mockArchiveGroup.mockClear();
    mockUnarchiveGroup.mockClear();
    mockDeleteGroup.mockClear();
  });

  describe("active tab", () => {
    beforeEach(() => {
      mockUseGroups.mockReturnValue({
        data: { data: [activeAdminGroup, activeViewerGroup, archivedAdminGroup] },
        isLoading: false,
      });
    });

    it("renders only active groups", async () => {
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("My Home"));
      expect(screen.getByText("Work Team")).toBeInTheDocument();
      expect(screen.queryByText("Old House")).toBeNull();
    });

    it("shows empty state when no active groups", async () => {
      mockUseGroups.mockReturnValue({ data: { data: [archivedAdminGroup] }, isLoading: false });
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("No groups yet."));
    });

    it("filters groups by search query", async () => {
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("My Home"));

      await userEvent.type(screen.getByPlaceholderText(/search groups/i), "Work");
      expect(screen.queryByText("My Home")).toBeNull();
      expect(screen.getByText("Work Team")).toBeInTheDocument();
    });

    it("shows edit and archive buttons only for group admins", async () => {
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("My Home"));

      // Admin group has edit + archive buttons; viewer group has none
      expect(screen.getByTitle("Edit group")).toBeInTheDocument();
      expect(screen.getByTitle("Archive group")).toBeInTheDocument();
      expect(screen.queryByTitle("Edit group (Work Team)")).toBeNull();
    });

    it("calls archiveGroup when archive button clicked", async () => {
      mockArchiveGroup.mockResolvedValueOnce({ data: { ...activeAdminGroup, archived_at: "2024-01-02T00:00:00Z" } });
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("My Home"));

      await userEvent.click(screen.getByTitle("Archive group"));
      await waitFor(() => expect(mockArchiveGroup).toHaveBeenCalledWith(1));
    });
  });

  describe("archived tab", () => {
    beforeEach(() => {
      mockUseGroups.mockReturnValue({
        data: { data: [activeAdminGroup, archivedAdminGroup] },
        isLoading: false,
      });
    });

    it("shows archived groups after switching tab", async () => {
      renderWithProviders(<GroupsPage />);
      await waitFor(() => screen.getByText("My Home"));

      await userEvent.click(screen.getByRole("button", { name: /archived/i }));
      await waitFor(() => screen.getByText("Old House"));
      expect(screen.queryByText("My Home")).toBeNull();
    });

    it("shows delete button only for super_admin on archived tab", async () => {
      renderWithProviders(<GroupsPage />, { currentUser: superAdmin });
      await userEvent.click(screen.getByRole("button", { name: /archived/i }));
      await waitFor(() => screen.getByText("Old House"));
      expect(screen.getByTitle("Delete permanently")).toBeInTheDocument();
    });

    it("hides delete button for regular admin on archived tab", async () => {
      renderWithProviders(<GroupsPage />, { currentUser: regularUser });
      await userEvent.click(screen.getByRole("button", { name: /archived/i }));
      await waitFor(() => screen.getByText("Old House"));
      expect(screen.queryByTitle("Delete permanently")).toBeNull();
    });
  });

  it("shows loading state", () => {
    mockUseGroups.mockReturnValue({ data: undefined, isLoading: true });
    renderWithProviders(<GroupsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
