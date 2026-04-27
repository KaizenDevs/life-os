import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthError } from "../api/auth";

const mockLogin = mock<(email: string, password: string) => Promise<string>>();

mock.module("../api/auth", () => ({
  login: mockLogin,
  AuthError,
}));

import { LoginPage } from "../pages/LoginPage";
import { renderWithProviders } from "./helpers";

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it("renders email and password inputs", () => {
    renderWithProviders(<LoginPage />, { authToken: null });
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("calls login with entered credentials", async () => {
    mockLogin.mockResolvedValueOnce("token-123");
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("user@test.com", "secret")
    );
  });

  it("shows 'invalid credentials' on 401", async () => {
    mockLogin.mockRejectedValueOnce(new AuthError("Invalid email or password", 401));
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "bad@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    );
  });

  it("shows 'cannot reach server' on network/server error", async () => {
    mockLogin.mockRejectedValueOnce(new AuthError("Bad gateway", 502));
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/cannot reach the server/i)).toBeInTheDocument()
    );
  });

  it("renders forgot password link", () => {
    renderWithProviders(<LoginPage />, { authToken: null });
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
  });

  it("shows success notice when redirected from reset password", () => {
    renderWithProviders(<LoginPage />, {
      authToken: null,
      initialEntries: [{ pathname: "/login", state: { notice: "Password updated. Please sign in." } }],
    });
    expect(screen.getByText(/password updated/i)).toBeInTheDocument();
  });

  it("disables button while loading", async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("tok"), 500))
    );
    renderWithProviders(<LoginPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});
