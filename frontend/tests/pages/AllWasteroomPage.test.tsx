import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AllaMiljoRumPage from "../../src/pages/AllWasteroomPage";
import { getWasteRoomsByPropertyId } from "../../src/lib/WasteRoom";
import { deleteWasteRoom } from "../../src/lib/WasteRoomRequest";

vi.mock("../../src/lib/WasteRoom", () => ({
    getWasteRoomsByPropertyId: vi.fn(),
}));

vi.mock("../../src/lib/WasteRoomRequest", () => ({
    deleteWasteRoom: vi.fn(),
}));

// Mock RoomSizePrompt (to simplify)
vi.mock("../../src/components/RoomSizePrompt", () => ({
    default: ({ onCancel }: any) => (
        <div data-testid="room-size-prompt">
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

// Mock window.location.href
Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "" },
});

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
});

describe("AllaMiljoRumPage (Vitest)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
    });

    function renderWithRoute(id = "12") {
        return render(
            <MemoryRouter initialEntries={[`/properties/${id}/rooms`]}>
                <Routes>
                    <Route
                        path="/properties/:propertyId/rooms"
                        element={<AllaMiljoRumPage />}
                    />
                </Routes>
            </MemoryRouter>
        );
    }

    it("shows loading state", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([]);

        renderWithRoute();

        expect(screen.getByText("Laddar miljörum...")).toBeInTheDocument();
    });

    it("loads and displays rooms", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([
            { id: 1, name: "Rum A", length: 5, width: 4, thumbnailUrl: "/img" },
        ]);

        renderWithRoute();

        expect(await screen.findByText("Rum A")).toBeInTheDocument();
        expect(screen.getByText("Längd: 5")).toBeInTheDocument();
        expect(screen.getByText("Bredd: 4")).toBeInTheDocument();
    });

    it("filters rooms by search", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([
            { id: 1, name: "Alpha", length: 5, width: 4 },
            { id: 2, name: "Beta", length: 5, width: 4 },
        ]);

        renderWithRoute();

        await screen.findByText("Alpha");

        fireEvent.change(screen.getByPlaceholderText("Sök miljörum..."), {
            target: { value: "beta" },
        });

        expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
        expect(screen.getByText("Beta")).toBeInTheDocument();
    });

    it("editRoom writes to localStorage and redirects", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([
            { id: 1, name: "Room A", length: 5, width: 4, containers: [] },
        ]);

        renderWithRoute("55");

        await screen.findByText("Room A");

        fireEvent.click(screen.getByText("Redigera"));

        const stored = JSON.parse(
            localStorage.getItem("enviormentRoomData") || "{}"
        );

        expect(stored.name).toBe("Room A");
        expect(window.location.href).toBe("/planningTool");
    });

    it("removeRoom calls API and removes item", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([
            { id: 1, name: "DeleteMe", length: 5, width: 4 },
        ]);

        (deleteWasteRoom as any).mockResolvedValue(undefined);

        vi.spyOn(window, "confirm").mockReturnValue(true);

        renderWithRoute();

        await screen.findByText("DeleteMe");

        fireEvent.click(screen.getByText("Ta bort"));

        await waitFor(() =>
            expect(deleteWasteRoom).toHaveBeenCalledWith(1)
        );

        expect(screen.queryByText("DeleteMe")).not.toBeInTheDocument();
    });

    it("opens RoomSizePrompt when clicking add room", async () => {
        (getWasteRoomsByPropertyId as any).mockResolvedValue([]);

        renderWithRoute();

        fireEvent.click(screen.getByText("Lägg till miljörum"));

        expect(screen.getByTestId("room-size-prompt")).toBeInTheDocument();
    });
});