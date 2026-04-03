import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import type { Group } from "../types";

const mockCreateGroup = mock();
const mockUpdateGroup = mock();
const mockUseGroups = mock();

mock.module("../api/groups", () => ({
  createGroup: mockCreateGroup,
  updateGroup: mockUpdateGroup,
}));

mock.module("../hooks/useGroups", () => ({
  useGroups: mockUseGroups,
}));

import { GroupFormPage } from "../pages/GroupFormPage";
import { renderWithProviders } from "./helpers";

const stubGroup: Group = {
  id: 1,
  name: "My House",
  group_type: "household",
  archived_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  created_by: { id: 1, email: "admin@example.com" },
  my_role: "admin",
};

const CreateForm = () => (
  <Routes>
    <Route path="/groups/new" element={<GroupFormPage />} />
  </Routes>
);

const EditForm = () => (
  <Routes>
    <Route path="/groups/:id/edit" element={<GroupFormPage />} />
  </Routes>
);

describe("GroupFormPage — create", () => {
  beforeEach(() => {
    mockCreateGroup.mockClear();
    mockUpdateGroup.mockClear();
    mockUseGroups.mockReturnValue({ data: undefined });
  });

  it("renders the new group form", () => {
    renderWithProviders(<CreateForm />, { initialEntries: ["/groups/new"] });
    expect(screen.getByText("New group")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/my home/i)).toBeInTheDocument();
  });

  it("submits form with name and type", async () => {
    mockCreateGroup.mockResolvedValueOnce({ data: stubGroup });
    renderWithProviders(<CreateForm />, { initialEntries: ["/groups/new"] });

    await userEvent.type(screen.getByPlaceholderText(/my home/i), "Beach House");
    await userEvent.click(screen.getByRole("button", { name: /create group/i }));

    await waitFor(() =>
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: "Beach House",
        group_type: "household",
      })
    );
  });

  it("shows error message on API failure", async () => {
    mockCreateGroup.mockRejectedValueOnce({ errors: ["Name has already been taken"] });
    renderWithProviders(<CreateForm />, { initialEntries: ["/groups/new"] });

    await userEvent.type(screen.getByPlaceholderText(/my home/i), "Taken Name");
    await userEvent.click(screen.getByRole("button", { name: /create group/i }));

    await waitFor(() =>
      expect(screen.getByText("Name has already been taken")).toBeInTheDocument()
    );
  });

  it("shows validation error when name is blank", async () => {
    renderWithProviders(<CreateForm />, { initialEntries: ["/groups/new"] });

    await userEvent.click(screen.getByRole("button", { name: /create group/i }));

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockCreateGroup).not.toHaveBeenCalled();
  });
});

describe("GroupFormPage — edit", () => {
  beforeEach(() => {
    mockCreateGroup.mockClear();
    mockUpdateGroup.mockClear();
    mockUseGroups.mockReturnValue({ data: { data: [stubGroup] } });
  });

  it("prefills existing group data", async () => {
    renderWithProviders(<EditForm />, { initialEntries: ["/groups/1/edit"] });

    await waitFor(() =>
      expect(
        (screen.getByPlaceholderText(/my home/i) as HTMLInputElement).value
      ).toBe("My House")
    );
  });

  it("submits updated name", async () => {
    mockUpdateGroup.mockResolvedValueOnce({ data: { ...stubGroup, name: "New Name" } });
    renderWithProviders(<EditForm />, { initialEntries: ["/groups/1/edit"] });

    await waitFor(() => screen.getByDisplayValue("My House"));

    const input = screen.getByPlaceholderText(/my home/i) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(mockUpdateGroup).toHaveBeenCalledWith(1, {
        name: "New Name",
        group_type: "household",
      })
    );
  });
});
