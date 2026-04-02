import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "../pages/LoginPage";
import { renderWithProviders } from "./helpers";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

import { login } from "../api/auth";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    renderWithProviders(<LoginPage />, { authToken: null });
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("calls login with entered credentials", async () => {
    vi.mocked(login).mockResolvedValueOnce("token-123");
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith("user@test.com", "secret")
    );
  });

  it("shows error message on failed login", async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error("Invalid"));
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "bad@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    );
  });

  it("disables button while loading", async () => {
    vi.mocked(login).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("tok"), 500))
    );
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});
