import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../../src/pages/RegisterPage";
import { register } from "../../src/lib/Auth";
import { BrowserRouter } from "react-router-dom";

// Mock register()
vi.mock("../../src/lib/Auth", () => ({
  register: vi.fn(),
}));

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the registration form", () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByRole("heading", { name: "Skapa konto" })).toBeInTheDocument();
    expect(screen.getByLabelText("Användarnamn")).toBeInTheDocument();
    expect(screen.getByLabelText("Lösenord")).toBeInTheDocument();
    expect(screen.getByLabelText("Bekräfta lösenord")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skapa konto" })).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    renderWithRouter(<RegisterPage />);

    const pwInput = screen.getByLabelText("Lösenord") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: "Visa lösenord" });

    expect(pwInput.type).toBe("password");

    fireEvent.click(toggleButton);

    expect(screen.getByRole("button", { name: "Dölj lösenord" })).toBeInTheDocument();
    expect(pwInput.type).toBe("text");
  });

  it("shows error if passwords do not match", async () => {
    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText("Lösenord"), { target: { value: "abcdef" } });
    fireEvent.change(screen.getByLabelText("Bekräfta lösenord"), { target: { value: "abc123" } });

    // Accept terms
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Skapa konto" }));

    expect(await screen.findByText("Lösenorden matchar inte")).toBeInTheDocument();
  });

  it("shows error if password is too short", async () => {
    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText("Lösenord"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Bekräfta lösenord"), { target: { value: "123" } });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Skapa konto" }));

    const errors = await screen.findAllByText("Lösenordet måste vara minst 6 tecken långt");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("shows loading state when submitting", async () => {
    vi.mocked(register).mockResolvedValue({ success: false, message: "error" });

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText("Lösenord"), { target: { value: "abcdef" } });
    fireEvent.change(screen.getByLabelText("Bekräfta lösenord"), { target: { value: "abcdef" } });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Skapa konto" }));

    expect(screen.getByRole("button", { name: "Skapar konto…" })).toBeInTheDocument();
  });

  it("shows error message when registration fails", async () => {
    vi.mocked(register).mockResolvedValue({
      success: false,
      message: "Username already exists",
    });

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText("Lösenord"), { target: { value: "abcdef" } });
    fireEvent.change(screen.getByLabelText("Bekräfta lösenord"), { target: { value: "abcdef" } });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Skapa konto" }));

    expect(await screen.findByText("Username already exists")).toBeInTheDocument();
  });

  it("shows success message after successful registration and clears form", async () => {
    vi.mocked(register).mockResolvedValue({
      success: true,
      message: "Kontot har skapats!",
    });

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText("Lösenord"), { target: { value: "abcdef" } });
    fireEvent.change(screen.getByLabelText("Bekräfta lösenord"), { target: { value: "abcdef" } });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Skapa konto" }));

expect(await screen.findByText("Kontot har skapats!")).toBeInTheDocument();

    // Form should reset
    await waitFor(() => {
      expect(screen.getByLabelText("Användarnamn")).toHaveValue("");
      expect(screen.getByLabelText("Lösenord")).toHaveValue("");
      expect(screen.getByLabelText("Bekräfta lösenord")).toHaveValue("");
    });
  });
});
