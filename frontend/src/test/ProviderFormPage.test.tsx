import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";

const mockCreateProvider = mock();
const mockUpdateProvider = mock();
const mockFetchProvider = mock();
const mockUseCategories = mock();

mock.module("../api/providers", () => ({
  createProvider: mockCreateProvider,
  updateProvider: mockUpdateProvider,
  fetchProvider: mockFetchProvider,
}));

mock.module("../hooks/useCategories", () => ({
  useCategories: mockUseCategories,
}));

import { ProviderFormPage } from "../pages/ProviderFormPage";
import { renderWithProviders } from "./helpers";

const stubCategories = {
  data: [
    { id: 1, name: "plumbing" },
    { id: 2, name: "electrical" },
  ],
};

const stubProvider = {
  id: 10,
  name: "John Plumber",
  category: { id: 1, name: "plumbing" },
  phone: "555-1234",
  email: "john@plumber.com",
  address: "1 Main St",
  notes: "Reliable",
  archived_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const CreateForm = () => (
  <Routes>
    <Route path="/groups/:groupId/providers/new" element={<ProviderFormPage />} />
    {/* Form navigates here after save — avoid "No routes matched" in tests */}
    <Route path="/groups/:groupId/providers" element={null} />
  </Routes>
);

const EditForm = () => (
  <Routes>
    <Route path="/groups/:groupId/providers/:providerId/edit" element={<ProviderFormPage />} />
    <Route path="/groups/:groupId/providers" element={null} />
  </Routes>
);

describe("ProviderFormPage — create", () => {
  beforeEach(() => {
    mockCreateProvider.mockClear();
    mockUpdateProvider.mockClear();
    mockFetchProvider.mockClear();
    mockUseCategories.mockReturnValue({ data: stubCategories });
  });

  it("renders the new provider form", () => {
    renderWithProviders(<CreateForm />, {
      initialEntries: ["/groups/1/providers/new"],
    });
    expect(screen.getByText("New provider")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john's plumbing/i)).toBeInTheDocument();
  });

  it("submits form with required fields", async () => {
    mockCreateProvider.mockResolvedValueOnce({ data: stubProvider });
    renderWithProviders(<CreateForm />, {
      initialEntries: ["/groups/1/providers/new"],
    });

    await userEvent.type(screen.getByPlaceholderText(/john's plumbing/i), "Acme Plumber");
    await userEvent.click(screen.getByRole("button", { name: /add provider/i }));

    await waitFor(() =>
      expect(mockCreateProvider).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: "Acme Plumber", category_id: 1 })
      )
    );
  });

  it("shows validation error when name is blank", async () => {
    renderWithProviders(<CreateForm />, {
      initialEntries: ["/groups/1/providers/new"],
    });

    await userEvent.click(screen.getByRole("button", { name: /add provider/i }));

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockCreateProvider).not.toHaveBeenCalled();
  });

  it("shows error on API failure", async () => {
    mockCreateProvider.mockRejectedValueOnce({ errors: ["Name can't be blank"] });
    renderWithProviders(<CreateForm />, {
      initialEntries: ["/groups/1/providers/new"],
    });

    await userEvent.type(screen.getByPlaceholderText(/john's plumbing/i), "X");
    await userEvent.click(screen.getByRole("button", { name: /add provider/i }));

    await waitFor(() =>
      expect(screen.getByText("Name can't be blank")).toBeInTheDocument()
    );
  });
});

describe("ProviderFormPage — edit", () => {
  beforeEach(() => {
    mockCreateProvider.mockClear();
    mockUpdateProvider.mockClear();
    mockFetchProvider.mockResolvedValue({ data: stubProvider });
    mockUseCategories.mockReturnValue({ data: stubCategories });
  });

  it("prefills form with existing provider data", async () => {
    renderWithProviders(<EditForm />, {
      initialEntries: ["/groups/1/providers/10/edit"],
    });

    await waitFor(() =>
      expect(
        (screen.getByPlaceholderText(/john's plumbing/i) as HTMLInputElement).value
      ).toBe("John Plumber")
    );
    expect((screen.getByPlaceholderText(/555/i) as HTMLInputElement).value).toBe("555-1234");
  });

  it("submits updated provider", async () => {
    mockUpdateProvider.mockResolvedValueOnce({ data: stubProvider });
    renderWithProviders(<EditForm />, {
      initialEntries: ["/groups/1/providers/10/edit"],
    });

    await waitFor(() => screen.getByDisplayValue("John Plumber"));

    const input = screen.getByPlaceholderText(/john's plumbing/i) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "Updated Plumber");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(mockUpdateProvider).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ name: "Updated Plumber" })
      )
    );
  });
});
