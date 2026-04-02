import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterPage } from "../pages/RegisterPage";
import { renderWithProviders } from "./helpers";

vi.mock("../api/auth", () => ({
  register: vi.fn(),
}));

import { register } from "../api/auth";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(
      screen.getByText(/passwords do not match/i)
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("calls register when passwords match", async () => {
    vi.mocked(register).mockResolvedValueOnce("new-token");
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
      expect(register).toHaveBeenCalledWith("u@test.com", "secret")
    );
  });

  it("shows error on registration failure", async () => {
    vi.mocked(register).mockRejectedValueOnce(new Error("Taken"));
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
      expect(
        screen.getByText(/registration failed/i)
      ).toBeInTheDocument()
    );
  });
});
