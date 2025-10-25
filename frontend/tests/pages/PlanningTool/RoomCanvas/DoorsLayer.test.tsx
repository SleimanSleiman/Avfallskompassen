import { render, screen, fireEvent } from "@testing-library/react";
import DoorsLayer from "../../../../src/pages/PlanningTool/RoomCanvas/DoorsLayer";
import type { Door } from "../../../../src/types";
import { vi } from "vitest";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", async () => {
  const actual: any = await vi.importActual("react-konva");
  return {
    ...actual,
    Group: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Arc: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Line: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  };
});

describe("DoorsLayer", () => {
  // ─────────────── Room dimensions ───────────────
  const room = { x: 0, y: 0, width: 500, height: 400 };

  // ─────────────── Sample doors ───────────────
  const doors: Door[] = [
    { id: 1, width: 90, x: 100, y: 0, wall: "top", rotation: 180 },
    { id: 2, width: 90, x: 200, y: 400, wall: "bottom", rotation: 0 },
  ];

  // ─────────────── Test Rendering ───────────────
  it("renders all doors", () => {
    render(
      <DoorsLayer
        doors={doors}
        selectedDoorId={null}
        room={room}
        handleDragDoor={() => {}}
        handleSelectDoor={() => {}}
      />
    );

    // Check that Arc and Line elements exist for each door
    expect(screen.getByTestId("door-arc-1")).not.toBeNull();
    expect(screen.getByTestId("door-line-1")).not.toBeNull();
    expect(screen.getByTestId("door-arc-2")).not.toBeNull();
    expect(screen.getByTestId("door-line-2")).not.toBeNull();
  });

  // ─────────────── Test Highlighting ───────────────
  it("highlights the selected door", () => {
    render(
      <DoorsLayer
        doors={doors}
        selectedDoorId={2} // select second door
        room={room}
        handleDragDoor={() => {}}
        handleSelectDoor={() => {}}
      />
    );

    // Selected door should have orange stroke
    const arc2 = screen.getByTestId("door-arc-2");
    expect(arc2.getAttribute("stroke")).toBe("orange");

    // Non-selected door should be blue
    const arc1 = screen.getByTestId("door-arc-1");
    expect(arc1.getAttribute("stroke")).toBe("blue");
  });

  // ─────────────── Test Selection Click ───────────────
  it("calls handleSelectDoor when door is clicked", () => {
    const handleSelectDoor = vi.fn();

    render(
      <DoorsLayer
        doors={doors}
        selectedDoorId={null}
        room={room}
        handleDragDoor={() => {}}
        handleSelectDoor={handleSelectDoor} // Spy function
      />
    );

    // Click on the Group element (mocked div)
    const group1 = screen.getByTestId("door-group-1");
    fireEvent.click(group1);

    // Should call handleSelectDoor with the correct ID
    expect(handleSelectDoor).toHaveBeenCalledWith(1);
  });
});
