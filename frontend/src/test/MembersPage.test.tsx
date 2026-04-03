import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import type { Membership } from "../types";

const mockUseMemberships = mock();
const mockUseGroups = mock();
const mockCreateMembership = mock();
const mockUpdateMembership = mock();
const mockDeleteMembership = mock();
const mockAcceptMembership = mock();
const mockSearchUsers = mock();

mock.module("../hooks/useMemberships", () => ({ useMemberships: mockUseMemberships }));
mock.module("../hooks/useGroups", () => ({ useGroups: mockUseGroups }));
mock.module("../api/memberships", () => ({
  createMembership: mockCreateMembership,
  updateMembership: mockUpdateMembership,
  deleteMembership: mockDeleteMembership,
  acceptMembership: mockAcceptMembership,
}));
mock.module("../api/users", () => ({ searchUsers: mockSearchUsers }));

import { MembersPage } from "../pages/MembersPage";
import { renderWithProviders } from "./helpers";

const adminGroup = {
  id: 1, name: "My Home", group_type: "household",
  archived_at: null, created_at: "", updated_at: "",
  created_by: { id: 1, email: "admin@example.com" }, my_role: "admin" as const,
};

const viewerGroup = { ...adminGroup, my_role: "viewer" as const };

const activeMembership: Membership = {
  id: 10, role: "member", accepted_at: "2024-01-01T00:00:00Z",
  user: { id: 2, email: "alice@example.com" },
  invited_by: { id: 1, email: "admin@example.com" },
  created_at: "", updated_at: "",
};

const pendingMembership: Membership = {
  id: 11, role: "viewer", accepted_at: null,
  user: { id: 3, email: "bob@example.com" },
  invited_by: { id: 1, email: "admin@example.com" },
  created_at: "", updated_at: "",
};

const Page = () => (
  <Routes>
    <Route path="/groups/:groupId/members" element={<MembersPage />} />
  </Routes>
);

describe("MembersPage", () => {
  beforeEach(() => {
    mockCreateMembership.mockClear();
    mockUpdateMembership.mockClear();
    mockDeleteMembership.mockClear();
    mockAcceptMembership.mockClear();
    mockSearchUsers.mockClear();
    mockUseGroups.mockReturnValue({ data: { data: [adminGroup] } });
    mockUseMemberships.mockReturnValue({ data: { data: [activeMembership, pendingMembership] }, isLoading: false });
  });

  it("renders member list", async () => {
    renderWithProviders(<Page />, { initialEntries: ["/groups/1/members"] });
    await waitFor(() => screen.getByText("alice@example.com"));
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending invitation")).toBeInTheDocument();
  });

  // Regression test: accept button only visible to the invited user
  it("shows accept button only to the invited user (regression: #accept-button-visibility)", async () => {
    // Logged-in user is bob — bob has a pending invite
    renderWithProviders(<Page />, {
      initialEntries: ["/groups/1/members"],
      currentUser: { email: "bob@example.com", system_role: "user" },
    });
    await waitFor(() => screen.getByText("bob@example.com"));
    expect(screen.getByTitle("Accept invitation")).toBeInTheDocument();
  });

  it("hides accept button from a user who is not the invitee", async () => {
    // Logged-in user is alice — alice has no pending invite
    renderWithProviders(<Page />, {
      initialEntries: ["/groups/1/members"],
      currentUser: { email: "alice@example.com", system_role: "user" },
    });
    await waitFor(() => screen.getByText("bob@example.com"));
    expect(screen.queryByTitle("Accept invitation")).toBeNull();
  });

  it("shows invite form for group admins", async () => {
    renderWithProviders(<Page />, {
      initialEntries: ["/groups/1/members"],
      currentUser: { email: "admin@example.com", system_role: "user" },
    });
    await waitFor(() => screen.getByText("alice@example.com"));
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it("hides invite form for viewers", async () => {
    mockUseGroups.mockReturnValue({ data: { data: [viewerGroup] } });
    renderWithProviders(<Page />, {
      initialEntries: ["/groups/1/members"],
      currentUser: { email: "viewer@example.com", system_role: "user" },
    });
    await waitFor(() => screen.getByText("alice@example.com"));
    expect(screen.queryByPlaceholderText(/email/i)).toBeNull();
  });

  it("calls acceptMembership when accept button clicked", async () => {
    mockAcceptMembership.mockResolvedValueOnce({ data: { ...pendingMembership, accepted_at: new Date().toISOString() } });
    renderWithProviders(<Page />, {
      initialEntries: ["/groups/1/members"],
      currentUser: { email: "bob@example.com", system_role: "user" },
    });
    await waitFor(() => screen.getByTitle("Accept invitation"));
    await userEvent.click(screen.getByTitle("Accept invitation"));
    await waitFor(() => expect(mockAcceptMembership).toHaveBeenCalledWith(1, 11));
  });
});
