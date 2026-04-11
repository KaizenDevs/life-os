import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthError } from "../api/auth";

const mockForgotPassword = mock<(email: string) => Promise<void>>();

mock.module("../api/auth", () => ({
  forgotPassword: mockForgotPassword,
  AuthError,
}));

import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { renderWithProviders } from "./helpers";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockForgotPassword.mockClear();
  });

  it("renders email input and submit button", () => {
    renderWithProviders(<ForgotPasswordPage />, { authToken: null });
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("shows success message after submit", async () => {
    mockForgotPassword.mockResolvedValueOnce(undefined);
    renderWithProviders(<ForgotPasswordPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "user@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(screen.getByText(/receive a reset link shortly/i)).toBeInTheDocument()
    );
    expect(mockForgotPassword).toHaveBeenCalledWith("user@test.com");
  });

  it("shows error on server failure", async () => {
    mockForgotPassword.mockRejectedValueOnce(new AuthError("Request failed", 500));
    renderWithProviders(<ForgotPasswordPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "user@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(screen.getByText(/cannot reach the server/i)).toBeInTheDocument()
    );
  });

  it("disables button while loading", async () => {
    mockForgotPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 500))
    );
    renderWithProviders(<ForgotPasswordPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "user@test.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
  });

  it("renders link back to sign in", () => {
    renderWithProviders(<ForgotPasswordPage />, { authToken: null });
    expect(screen.getByRole("link", { name: /back to sign in/i })).toBeInTheDocument();
  });
});
