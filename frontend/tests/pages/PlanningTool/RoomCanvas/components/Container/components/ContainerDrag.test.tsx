import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import ContainerDrag from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerDrag";
import { isOverlapping } from "../../../../../../../src/pages/PlanningTool/lib/Constants";

/* ─────────── MOCK Konva Group ─────────── */
let capturedProps: any;

vi.mock("react-konva", () => ({
  Group: (props: any) => {
    // Capture ONLY the outer (draggable) group
    if (!capturedProps && props.draggable) {
      capturedProps = props;
    }

    return <div>{props.children}</div>;
  },
}));

/* ─────────── MOCK Constants ─────────── */
vi.mock(
  "../../../../../../../src/pages/PlanningTool/lib/Constants",
  async () => {
    const actual = await vi.importActual<any>(
      "../../../../../../../src/pages/PlanningTool/lib/Constants"
    );
    return {
      ...actual,
      isOverlapping: vi.fn(),
    };
  }
);

/* ─────────── TEST DATA ─────────── */
const container = {
  id: 1,
  x: 10,
  y: 20,
  width: 50,
  height: 60,
  rotation: 0,
};

const room = {
  x: 0,
  y: 0,
  width: 500,
  height: 500,
};

const doorZones: any[] = [];
const otherObjectZones: any[] = [];

type Zone = { x: number; y: number; width: number; height: number };

const getContainerZones = vi.fn((): Zone[] => []);

/* REQUIRED NEW HELPERS */
const getWallInsetForContainer = vi.fn(() => 0);
const getSnappedRotationForContainer = vi.fn(() => 0);

describe("ContainerDrag component", () => {
  let setIsDraggingContainer: any;
  let handleDragContainer: any;
  let handleSelectContainer: any;
  let setLastValidPos: any;
  let setIsOverZone: any;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedProps = null;
    (isOverlapping as any).mockReturnValue(false);

    setIsDraggingContainer = vi.fn();
    handleDragContainer = vi.fn();
    handleSelectContainer = vi.fn();
    setLastValidPos = vi.fn();
    setIsOverZone = vi.fn();
  });

  function renderComponent(lastValidPos = { x: 10, y: 20 }) {
    render(
      <ContainerDrag
        container={container}
        room={room}
        doorZones={doorZones}
        otherObjectZones={otherObjectZones}
        getContainerZones={getContainerZones}

        getWallInsetForContainer={getWallInsetForContainer}
        getSnappedRotationForContainer={getSnappedRotationForContainer}

        setIsDraggingContainer={setIsDraggingContainer}
        handleDragContainer={handleDragContainer}
        handleSelectContainer={handleSelectContainer}
        lastValidPos={lastValidPos}
        setLastValidPos={setLastValidPos}
        setIsOverZone={setIsOverZone}
      >
        {() => <div data-testid="child" />}
      </ContainerDrag>
    );
  }

  it("renders children", () => {
    renderComponent();
    expect(capturedProps.children).toBeTruthy();
  });

  it("calls handleSelectContainer and setIsDraggingContainer on drag start", () => {
    renderComponent();

    capturedProps.onDragStart({
      target: {
        getStage: () => ({
          container: () => ({ style: {} }),
        }),
      },
    });

    expect(handleSelectContainer).toHaveBeenCalledWith(container.id);
    expect(setIsDraggingContainer).toHaveBeenCalledWith(true);
  });

  it("updates lastValidPos if not over a zone on drag end", () => {
    renderComponent();

    const mockTarget = {
      x: () => 150,
      y: () => 160,
      position: vi.fn(),
    };

    capturedProps.onDragEnd({ target: mockTarget });

    expect(setLastValidPos).toHaveBeenCalledWith({
      x: 150,
      y: 160,
      rotation: 0,
    });

    expect(handleDragContainer).toHaveBeenCalledWith(container.id, {
      x: 150,
      y: 160,
      rotation: 0,
    });

    expect(setIsOverZone).toHaveBeenCalledWith(false);
  });

  it("snaps back to last valid position if overlapping a zone on drag end", () => {
    (isOverlapping as any).mockReturnValue(true);

    getContainerZones.mockReturnValueOnce([
        { x: 0, y: 0, width: 100, height: 100 },
    ]);

    const lastValidPos = { x: 35, y: 50 };
    renderComponent(lastValidPos);

    const mockTarget = {
      x: () => 200,
      y: () => 300,
      position: vi.fn(),
    };

    capturedProps.onDragEnd({ target: mockTarget });

    expect(mockTarget.position).toHaveBeenCalledWith(lastValidPos);
    expect(handleDragContainer).toHaveBeenCalledWith(container.id, lastValidPos);
  });
});
