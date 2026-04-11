import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthError } from "../api/auth";

const mockResetPassword = mock<
  (token: string, password: string, passwordConfirmation: string) => Promise<void>
>();

mock.module("../api/auth", () => ({
  resetPassword: mockResetPassword,
  AuthError,
}));

import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { renderWithProviders } from "./helpers";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockResetPassword.mockClear();
  });

  it("shows error when no token in URL", () => {
    renderWithProviders(<ResetPasswordPage />, { authToken: null, initialEntries: ["/reset-password"] });
    expect(screen.getByText(/invalid or missing reset token/i)).toBeInTheDocument();
  });

  it("renders password fields when token is present", () => {
    renderWithProviders(<ResetPasswordPage />, {
      authToken: null,
      initialEntries: ["/reset-password?reset_password_token=abc123"],
    });
    expect(screen.getByPlaceholderText("New password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm new password")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderWithProviders(<ResetPasswordPage />, {
      authToken: null,
      initialEntries: ["/reset-password?reset_password_token=abc123"],
    });

    await userEvent.type(screen.getByPlaceholderText("New password"), "password1");
    await userEvent.type(screen.getByPlaceholderText("Confirm new password"), "different");
    await userEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("calls resetPassword with token and passwords", async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderWithProviders(<ResetPasswordPage />, {
      authToken: null,
      initialEntries: ["/reset-password?reset_password_token=abc123"],
    });

    await userEvent.type(screen.getByPlaceholderText("New password"), "newpassword1");
    await userEvent.type(screen.getByPlaceholderText("Confirm new password"), "newpassword1");
    await userEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() =>
      expect(mockResetPassword).toHaveBeenCalledWith("abc123", "newpassword1", "newpassword1")
    );
  });

  it("shows error message on invalid token", async () => {
    mockResetPassword.mockRejectedValueOnce(
      new AuthError("Reset password token is invalid", 422)
    );
    renderWithProviders(<ResetPasswordPage />, {
      authToken: null,
      initialEntries: ["/reset-password?reset_password_token=bad"],
    });

    await userEvent.type(screen.getByPlaceholderText("New password"), "newpassword1");
    await userEvent.type(screen.getByPlaceholderText("Confirm new password"), "newpassword1");
    await userEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() =>
      expect(screen.getByText(/reset password token is invalid/i)).toBeInTheDocument()
    );
  });

  it("disables button while loading", async () => {
    mockResetPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 500))
    );
    renderWithProviders(<ResetPasswordPage />, {
      authToken: null,
      initialEntries: ["/reset-password?reset_password_token=abc123"],
    });

    await userEvent.type(screen.getByPlaceholderText("New password"), "newpassword1");
    await userEvent.type(screen.getByPlaceholderText("Confirm new password"), "newpassword1");
    await userEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  });
});
