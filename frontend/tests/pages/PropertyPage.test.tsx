import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyPage from "../../src/pages/PropertyPage";
import { BrowserRouter } from "react-router-dom";

import {
  getMyProperties,
  getMunicipalities,
  getLockTypes,
  createProperty,
  deleteProperty,
  updateProperty,
  getMyPropertiesWithWasteRooms,
} from "../../src/lib/Property";
import { getWasteRoomsByPropertyId } from "../../src/lib/WasteRoom";

vi.mock("../../src/lib/Property", () => ({
  getMyPropertiesWithWasteRooms: vi.fn(),
  getMunicipalities: vi.fn(),
  getLockTypes: vi.fn(),
  createProperty: vi.fn(),
  deleteProperty: vi.fn(),
  updateProperty: vi.fn(),
}));

vi.mock("../../src/lib/WasteRoom", () => ({
  getWasteRoomsByPropertyId: vi.fn(),
}));

vi.mock("../../src/lib/auth", () => ({
  currentUser: () => ({ username: "TestUser" }),
}));

function renderPage() {
  return render(
    <BrowserRouter>
      <PropertyPage />
    </BrowserRouter>
  );
}

describe("PropertyPage", () => {
  beforeEach(() => {
  vi.clearAllMocks();

  Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

  vi.mocked(getMunicipalities).mockResolvedValue([
    { id: 1, name: "Helsingborg" },
  ]);

  vi.mocked(getLockTypes).mockResolvedValue([
    { id: 1, name: "Standard" },
  ]);

  vi.mocked(getMyPropertiesWithWasteRooms).mockResolvedValue([
    {
      id: 10,
      address: "Storgatan 1",
      municipalityId: 28,
      municipalityName: "Båstad",
      numberOfApartments: 10,
      accessPathLength: 5,
      lockName: "Kodlås",
      lockTypeDto: { id: 4, name: "Kodlås", cost: 0 },
      createdAt: new Date().toISOString(),
      createdByUsername: "Anton",
      wasteRooms: [
        {
          wasteRoomId: 16,
          propertyId: 68,
          containers: [
            { id: 1, x: 220, y: 220, angle: 5, containerDTO: {} },
          ],
          doors: [],
          length: 6,
          width: 6,
          x: 200,
          y: 200,
        },
      ],
    },
  ]);


  vi.mocked(getWasteRoomsByPropertyId).mockResolvedValue([]);
});

  it("loads and displays properties on mount", async () => {
    renderPage();

    expect(getMyPropertiesWithWasteRooms).toHaveBeenCalled();
    expect(await screen.findByText("Storgatan 1")).toBeInTheDocument();
  });

  it("shows loading state when properties are loading", () => {
    vi.mocked(getMyPropertiesWithWasteRooms).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderPage();
    expect(screen.getByText("Laddar fastigheter...")).toBeInTheDocument();
  });

  it("opens and closes the create property form", async () => {
    renderPage();
    const toggleBtn = screen.getByRole("button", { name: "Lägg till fastighet" });

    fireEvent.click(toggleBtn);
    expect(await screen.findByText("Lägg till ny fastighet")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Avbryt" })[1]);

    await waitFor(() =>
      expect(screen.queryByText("Lägg till ny fastighet")).not.toBeInTheDocument()
    );
  });

  it("validates that municipality must be chosen", async () => {
    vi.mocked(createProperty).mockResolvedValue({ success: true, message: "" });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Lägg till fastighet" }));

    fireEvent.change(screen.getByLabelText("Adress *"), {
      target: { value: "Testvägen 5" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Skapa fastighet" }));

    expect(await screen.findByText("Du måste välja kommun")).toBeInTheDocument();
  });

  it("creates a property successfully", async () => {
    vi.mocked(createProperty).mockResolvedValue({
        success: true,
        message: "Fastighet skapad framgångsrikt!",
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Lägg till fastighet/i }));
    await screen.findByText("Lägg till ny fastighet");

    fireEvent.change(screen.getByLabelText("Adress *"), {
        target: { value: "Testgatan 22" },
    });

    fireEvent.change(screen.getByLabelText("Kommun *"), {
        target: { value: "1" },
    });

    fireEvent.change(screen.getByLabelText("Antal lägenheter *"), {
        target: { value: "5" },
    });

    const lockSelect = screen.getByLabelText("Typ av lås för miljörum *");
    fireEvent.change(lockSelect, { target: { value: "1" } });

    fireEvent.change(screen.getByLabelText("Dragvägslängd (meter) *"), {
        target: { value: "3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Skapa fastighet" }));

    await waitFor(() => expect(createProperty).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Fastighet skapad framgångsrikt!")).toBeInTheDocument();
  });


  it("opens delete modal and confirms deletion", async () => {
    vi.mocked(deleteProperty).mockResolvedValue({ success: true, message: "" });

    renderPage();

    const deleteButtons = await screen.findAllByRole("button", { name: "Ta bort" });
    fireEvent.click(deleteButtons[0]); 

    const modal = await screen.findByText("Bekräfta borttagning");
    expect(modal).toBeInTheDocument();

    const confirmButton = within(modal.closest("div")!).getByRole("button", { name: "Ta bort" });

    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(deleteProperty).toHaveBeenCalledTimes(1);
        expect(deleteProperty).toHaveBeenCalledWith(10);
    });
  });

  it("filters property list by search input", async () => {
    renderPage();
    expect(await screen.findByText("Storgatan 1")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Sök på adress eller kommun"), {
      target: { value: "no-match" },
    });

    expect(await screen.findByText("Inga fastigheter ännu")).toBeInTheDocument();
  });
});
