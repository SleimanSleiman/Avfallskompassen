import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AdminPage from "../../src/pages/AdminPage";
import { get } from "../../src/lib/api";

// Mock API
vi.mock("../../src/lib/api", () => ({
  get: vi.fn(),
}));

// Convert get → typed mock
const mockGet = vi.mocked(get);

// Mock AdminUserDetail
vi.mock("../../src/pages/Admin/AdminUserDetail", () => ({
  default: ({ user, onBack }: any) => (
    <div data-testid="admin-user-detail">
      <p>Detail for {user.username}</p>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockGet.mockResolvedValueOnce([]); // users
    mockGet.mockResolvedValueOnce([]); // properties

    render(<AdminPage />);

    expect(
      screen.getByText("Laddar användardata…")
    ).toBeInTheDocument();
  });

  it("loads and displays users and properties", async () => {
    mockGet.mockResolvedValueOnce([
      { id: 1, username: "alice", createdAt: "2024-01-01" },
      { id: 2, username: "bob", createdAt: "2024-02-01" },
    ]);

    mockGet.mockResolvedValueOnce([
      { id: 10, createdByUsername: "alice" },
      { id: 11, createdByUsername: "alice" },
    ]);

    mockGet.mockResolvedValue([]); // rooms for 10
    mockGet.mockResolvedValue([]); // rooms for 11

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText("Användare (2)")).toBeInTheDocument()
    );
  });

  it("filters users based on search input", async () => {
    mockGet.mockResolvedValueOnce([
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ]);
    mockGet.mockResolvedValueOnce([]);

    mockGet.mockResolvedValue([]); // wasterooms

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText("alice")).toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText(
      "Sök på användarnamn eller e-post..."
    );

    fireEvent.change(input, { target: { value: "bob" } });

    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("alice")).not.toBeInTheDocument();
  });

  it("opens user detail view when selecting a user", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, username: "alice" }]);
    mockGet.mockResolvedValueOnce([]);

    mockGet.mockResolvedValue([]); // wasterooms

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText("alice")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("alice"));

    expect(screen.getByTestId("admin-user-detail")).toBeInTheDocument();
    expect(screen.getByText("Detail for alice")).toBeInTheDocument();
  });

  it("returns to user list when clicking back", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, username: "alice" }]);
    mockGet.mockResolvedValueOnce([]);

    mockGet.mockResolvedValue([]); // rooms

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText("alice")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("alice"));

    fireEvent.click(screen.getByText("Back"));

    expect(screen.getByText("Användare (1)")).toBeInTheDocument();
  });
});
