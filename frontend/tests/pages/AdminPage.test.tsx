import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AdminPage from "../../src/pages/AdminPage";
import { getUserStats } from "../../src/lib/Property";

vi.mock("../../src/lib/Property", () => ({
  getUserStats: vi.fn(),
}));

const mockGet = vi.mocked(getUserStats);

vi.mock("../../src/pages/Admin/AdminUserDetail", () => ({
  default: ({ user, onBack }: any) => (
    <div data-testid="admin-user-detail">
      <h2>Användarinformation</h2>
      <p>Detail for {user.username}</p>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
  });

  it("shows loading state initially", async () => {
    // Create a deferred promise that never resolves immediately
    let resolveMock: (value: any) => void;
    const deferred = new Promise((res) => {
      resolveMock = res;
    });

    mockGet.mockReturnValue(deferred as any);

    render(<AdminPage />);

    // The loading text should be present immediately
    expect(screen.getByText("Laddar användardata…")).toBeInTheDocument();

  });


  it("loads and displays users and properties", async () => {
    mockGet.mockResolvedValueOnce([
      { id: 1, username: "alice", createdAt: "2024-01-01", propertiesCount: 2, wasteRoomsCount: 1 },
      { id: 2, username: "bob", createdAt: "2024-02-01", propertiesCount: 0, wasteRoomsCount: 0 },
    ]);

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
      "Sök på användarnamn"
    );

    fireEvent.change(input, { target: { value: "bob" } });

    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("alice")).not.toBeInTheDocument();
  });

  it("opens user detail view when selecting a user", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, username: "alice" }]);

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText("alice")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("alice"));

    expect(screen.getByText("Användarinformation")).toBeInTheDocument();
  });

  it("returns to user list when clicking back", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, username: "alice" }]);
    mockGet.mockResolvedValueOnce([]);

    mockGet.mockResolvedValue([]); // rooms

    render(<AdminPage />);

    expect(await screen.findByText("alice")).toBeInTheDocument();

    fireEvent.click(screen.getByText("alice"));

    fireEvent.click(screen.getByText("Back"));

    expect(screen.getByText("Användare (1)")).toBeInTheDocument();
  });

});
