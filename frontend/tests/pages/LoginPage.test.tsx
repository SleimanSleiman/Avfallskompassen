 import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "../../src/pages/LoginPage";
import { login } from "../../src/lib/Auth";
import { BrowserRouter } from "react-router-dom";

vi.mock("../../src/lib/Auth", () => ({
  login: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom"); 
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Logga in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logga in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Användarnamn")).toBeInTheDocument();
    expect(screen.getByLabelText("Lösenord")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logga in" })).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    renderWithRouter(<LoginPage />);

    const pwInput = screen.getByLabelText("Lösenord") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: "Visa lösenord" });

    expect(pwInput.type).toBe("password");

    fireEvent.click(toggleButton);

    expect(screen.getByRole("button", { name: "Dölj lösenord" })).toBeInTheDocument();
    expect(pwInput.type).toBe("text");
  });

  it("shows loading state when submitting", async () => {
    vi.mocked(login).mockResolvedValue({
        success: false,
        message: "error",
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("Lösenord"), {
      target: { value: "secret" },
    });

    const button = screen.getByRole("button", { name: "Logga in" });
    fireEvent.click(button);

    expect(screen.getByRole("button", { name: "Loggar in…" })).toBeInTheDocument();
  });

  it("shows error message when login fails", async () => {
    vi.mocked(login).mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("Lösenord"), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Logga in" }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    );
  });

    it("shows success message after successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      success: true,
      message: "Välkommen!",
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Användarnamn"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("Lösenord"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Logga in" }));

    // Success message appears
    expect(await screen.findByText("Välkommen!")).toBeInTheDocument();
  });

  
});
