import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriesPage } from "../pages/CategoriesPage";
import { renderWithProviders } from "./helpers";

vi.mock("../api/categories", () => ({
  fetchCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

const mockCategories = {
  data: [
    { id: 1, name: "plumbing" },
    { id: 2, name: "electrical" },
  ],
};

describe("CategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);
  });

  it("renders category list", async () => {
    renderWithProviders(<CategoriesPage />);
    await waitFor(() =>
      expect(screen.getByText("plumbing")).toBeInTheDocument()
    );
    expect(screen.getByText("electrical")).toBeInTheDocument();
  });

  it("creates a new category", async () => {
    vi.mocked(createCategory).mockResolvedValueOnce({ data: { id: 3, name: "hvac" } });
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    await userEvent.type(
      screen.getByPlaceholderText(/new category name/i),
      "hvac"
    );
    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() =>
      expect(createCategory).toHaveBeenCalledWith("hvac")
    );
  });

  it("enters edit mode on pencil click", async () => {
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    const editButtons = screen.getAllByTitle
      ? screen.queryAllByRole("button")
      : [];

    // click the first edit (pencil) button
    const buttons = screen.getAllByRole("button");
    // pencil buttons come before trash buttons per item; first item has buttons at index 0,1
    await userEvent.click(buttons[0]);

    expect(screen.getByDisplayValue("plumbing")).toBeInTheDocument();
  });

  it("saves edited category name", async () => {
    vi.mocked(updateCategory).mockResolvedValueOnce({ data: { id: 1, name: "plumbing fixed" } });
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]); // open edit

    const input = screen.getByDisplayValue("plumbing");
    await userEvent.clear(input);
    await userEvent.type(input, "plumbing fixed");

    // click confirm (Check icon button)
    const confirmBtn = screen.getByTitle
      ? screen.queryByTitle("confirm")
      : null;
    // fallback: find by role after pencil button was replaced by check/x
    const allButtons = screen.getAllByRole("button");
    await userEvent.click(allButtons[0]); // first is now the Check button

    await waitFor(() =>
      expect(updateCategory).toHaveBeenCalledWith(1, "plumbing fixed")
    );
  });

  it("deletes a category", async () => {
    vi.mocked(deleteCategory).mockResolvedValueOnce(undefined);
    renderWithProviders(<CategoriesPage />);
    await waitFor(() => screen.getByText("plumbing"));

    const buttons = screen.getAllByRole("button");
    // buttons per item: [edit, delete] — delete is index 1
    await userEvent.click(buttons[1]);

    await waitFor(() =>
      expect(deleteCategory).toHaveBeenCalledWith(1)
    );
  });
});
