import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ContainersLayer from "../../../../src/pages/PlanningTool/RoomCanvas/ContainersLayer";
import { vi, describe, it, afterEach, expect } from "vitest";
import "@testing-library/jest-dom";

// ─────────────── Mock react-konva ───────────────
vi.mock("react-konva", () => ({
    Group: ({ children, ...props }: any) => (
        <div data-testid={props["data-testid"] ?? "group"} {...props}>{children}</div>
    ),
    Rect: (props: any) => <div data-testid="rect" {...props} />,
    Image: (props: any) => <div data-testid="image" {...props} />,
    Text: (props: any) => <div data-testid="text" {...props} />,
}));

// ─────────────── Mock use-image ───────────────
vi.mock("use-image", () => ({
  default: () => [{}, "loaded"],
}));

afterEach(cleanup);

// ─────────────── Default props ───────────────
const defaultRoom = { x: 0, y: 0, width: 500, height: 400 };
const defaultContainers = [
    { id: 1, x: 50, y: 50, width: 40, height: 40, rotation: 0, container: { imageTopViewUrl: "/images/test.png" } },
    { id: 2, x: 200, y: 100, width: 60, height: 60, rotation: 90, container: { imageTopViewUrl: "/images/test.png" } },
];
const defaultDoorZones = [{ x: 100, y: 0, width: 100, height: 100 }];

// ─────────────── Helper function ───────────────
const renderContainersLayer = (overrideProps: Partial<React.ComponentProps<typeof ContainersLayer>> = {}) =>
    render(
        <ContainersLayer
            containersInRoom={defaultContainers}
            selectedContainerId={null}
            handleDragContainer={() => {}}
            handleSelectContainer={() => {}}
            room={defaultRoom}
            doorZones={defaultDoorZones}
            getContainerZones={() => []}
            setIsDraggingContainer={() => {}}
            isContainerInsideRoom={() => true}
            {...overrideProps}
        />
    );

// ─────────────── Tests ───────────────
describe("ContainersLayer", () => {
    it("renders all containers", () => {
        renderContainersLayer();

        defaultContainers.forEach((c) => {
            expect(screen.getByTestId(c.id.toString())).toBeInTheDocument();
        });
    });

    it("marks selected container correctly", () => {
        renderContainersLayer({ selectedContainerId: 2 });

        const selectedImage = screen.getAllByTestId("image").find(
            (img) => img.getAttribute("shadowcolor") === "#256029"
        );

        expect(selectedImage).toBeInTheDocument();
        expect(selectedImage).toHaveAttribute("opacity", "0.9");
    });

    it("calls handleSelectContainer when container clicked", () => {
        const mockSelect = vi.fn();
        renderContainersLayer({ handleSelectContainer: mockSelect });

        fireEvent.click(screen.getByTestId("1"));
        expect(mockSelect).toHaveBeenCalledWith(1);
    });

    it("calls handleDragContainer on drag end", () => {
        const mockDrag = vi.fn();
        renderContainersLayer({ handleDragContainer: mockDrag });

        const group1 = screen.getByTestId("1");
        fireEvent.dragEnd(group1, {
            target: { x: () => 100, y: () => 100, position: vi.fn() },
        });

        expect(mockDrag).toHaveBeenCalled();
    });

    it("does not allow container to go outside room boundaries", () => {
        const mockDrag = vi.fn();
        renderContainersLayer({ handleDragContainer: mockDrag });

        const group1 = screen.getByTestId("1");
        const mockEvent = { target: { x: () => -100, y: () => -100, position: vi.fn() } };
        fireEvent.dragEnd(group1, mockEvent);

        expect(mockDrag).toHaveBeenCalled();
    });

    it("sets opacity to 0.5 when container is outside the room", async () => {
        const mockImg = {};
        const useImage = await import("use-image");
        vi.spyOn(useImage, "default").mockReturnValueOnce([mockImg, "loaded"]);

        const outsideContainer = [
            { id: 3, x: 480, y: 50, width: 40, height: 40, rotation: 0, container: { imageTopViewUrl: "/images/test.png" } },
        ];

        renderContainersLayer({
            containersInRoom: outsideContainer,
            isContainerInsideRoom: () => false,
        });

        const image = screen.getByTestId("image");
        expect(image).toHaveAttribute("opacity", "0.5");
    });
});
