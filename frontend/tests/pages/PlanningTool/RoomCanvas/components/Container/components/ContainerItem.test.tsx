import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ContainerItem from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerItem";

// Mock child components
vi.mock(
    "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerDrag",
    () => ({
        default: ({ children, ...props }: any) => (
            <div data-testid="container-drag" {...props}>
                {children({ dragProps: "dragPropsMock" })}
            </div>
        ),
    })
);

vi.mock(
    "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerImage",
    () => ({
        default: ({ container, selected, isOverZone, isOutsideRoom, dragProps }: any) => (
            <div
                data-testid="container-image"
                data-selected={selected ? "true" : "false"}
                data-isoverzone={isOverZone ? "true" : "false"}
                data-isoutsideroom={isOutsideRoom ? "true" : "false"}
                data-dragprops={dragProps}
            >
                {container.container?.name ?? container.name}
            </div>
        ),
    })
);

afterEach(() => vi.clearAllMocks());

describe("ContainerItem component", () => {
    const container = {
        id: 1,
        name: "Test Container",
        width: 100,
        height: 100,
        x: 10,
        y: 20,
    };

    const room = { x: 0, y: 0, width: 500, height: 400 };

    const defaultProps = {
        container,
        selected: false,
        room,
        doorZones: [],
        getContainerZones: vi.fn(),
        handleDragContainer: vi.fn(),
        handleSelectContainer: vi.fn(),
        setIsDraggingContainer: vi.fn(),
        isContainerInsideRoom: vi.fn(() => true),
    };

    it("renders ContainerDrag and ContainerImage", () => {
        render(<ContainerItem {...defaultProps} />);
        expect(screen.getByTestId("container-drag")).toBeInTheDocument();
        expect(screen.getByTestId("container-image")).toBeInTheDocument();
        expect(screen.getByText("Test Container")).toBeInTheDocument();
    });

    it("passes selected and isOutsideRoom correctly to ContainerImage", () => {
        const props = {
        ...defaultProps,
        selected: true,
        isContainerInsideRoom: () => false,
    };

    render(<ContainerItem {...props} />);
        const image = screen.getByTestId("container-image");
        expect(image.dataset.selected).toBe("true");
        expect(image.dataset.isoutsideroom).toBe("true");
    });

    it("passes isOverZone state to ContainerImage", () => {
        render(<ContainerItem {...defaultProps} />);
        const image = screen.getByTestId("container-image");
        expect(image.dataset.isoverzone).toBe("false");
    });

    it("calls handleSelectContainer when needed", () => {
        const handleSelectContainer = vi.fn();
        render(<ContainerItem {...defaultProps} handleSelectContainer={handleSelectContainer} />);
        fireEvent.click(screen.getByTestId("container-drag"));
        expect(handleSelectContainer).not.toHaveBeenCalled();
    });
});
