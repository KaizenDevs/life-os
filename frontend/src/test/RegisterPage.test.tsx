import { describe, it, expect, mock, beforeEach } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRegister = mock<(email: string, password: string) => Promise<string>>();

mock.module("../api/auth", () => ({
  register: mockRegister,
}));

import { RegisterPage } from "../pages/RegisterPage";
import { renderWithProviders } from "./helpers";

describe("RegisterPage", () => {
  beforeEach(() => {
    mockRegister.mockClear();
  });

  it("renders all fields", () => {
    renderWithProviders(<RegisterPage />, { authToken: null });
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderWithProviders(<RegisterPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass1");
    await userEvent.type(
      screen.getByPlaceholderText("Confirm password"),
      "pass2"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register when passwords match", async () => {
    mockRegister.mockResolvedValueOnce("new-token");
    renderWithProviders(<RegisterPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");
    await userEvent.type(
      screen.getByPlaceholderText("Confirm password"),
      "secret"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith("u@test.com", "secret")
    );
  });

  it("shows error on registration failure", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Taken"));
    renderWithProviders(<RegisterPage />, { authToken: null });

    await userEvent.type(screen.getByPlaceholderText("Email"), "u@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");
    await userEvent.type(
      screen.getByPlaceholderText("Confirm password"),
      "secret"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
    );
  });
});
