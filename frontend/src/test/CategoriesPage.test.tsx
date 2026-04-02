import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchCategories = mock();
const mockCreateCategory = mock();
const mockUpdateCategory = mock();
const mockDeleteCategory = mock();

mock.module("../api/categories", () => ({
  fetchCategories: mockFetchCategories,
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
  deleteCategory: mockDeleteCategory,
}));

import { CategoriesPage } from "../pages/CategoriesPage";
import { renderWithProviders } from "./helpers";

const stubCategories = {
  data: [
    { id: 1, name: "plumbing" },
    { id: 2, name: "electrical" },
  ],
};

describe("CategoriesPage", () => {
  beforeEach(() => {
    mockFetchCategories.mockClear();
    mockCreateCategory.mockClear();
    mockUpdateCategory.mockClear();
    mockDeleteCategory.mockClear();
    mockFetchCategories.mockResolvedValue(stubCategories);
  });

  it("renders category list", async () => {
    renderWithProviders(<CategoriesPage />);
    await waitFor(() =>
      expect(screen.getByText("plumbing")).toBeInTheDocument()
    );
    expect(screen.getByText("electrical")).toBeInTheDocument();
  });

  it("creates a new category", async () => {
    mockCreateCategory.mockResolvedValueOnce({
      data: { id: 3, name: "hvac" },
    });
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    await userEvent.type(
      screen.getByPlaceholderText(/new category name/i),
      "hvac"
    );
    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() =>
      expect(mockCreateCategory).toHaveBeenCalledWith("hvac")
    );
  });

  it("enters edit mode on pencil click", async () => {
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    // Each item has [edit, delete] buttons; first item edit is index 0
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);

    expect(screen.getByDisplayValue("plumbing")).toBeInTheDocument();
  });

  it("saves edited category name", async () => {
    mockUpdateCategory.mockResolvedValueOnce({
      data: { id: 1, name: "plumbing fixed" },
    });
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    // Open edit mode
    await userEvent.click(screen.getAllByRole("button")[0]);

    const input = screen.getByDisplayValue("plumbing");
    await userEvent.clear(input);
    await userEvent.type(input, "plumbing fixed");

    // First button in edit mode is the confirm (Check) button
    await userEvent.click(screen.getAllByRole("button")[0]);

    await waitFor(() =>
      expect(mockUpdateCategory).toHaveBeenCalledWith(1, "plumbing fixed")
    );
  });

  it("deletes a category", async () => {
    mockDeleteCategory.mockResolvedValueOnce(undefined);
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    // Each item has [edit, delete]; delete for first item is index 1
    await userEvent.click(screen.getAllByRole("button")[1]);

    await waitFor(() =>
      expect(mockDeleteCategory).toHaveBeenCalledWith(1)
    );
  });
});
