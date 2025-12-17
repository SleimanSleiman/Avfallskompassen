import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useImage from "use-image";
import ContainerImage from "../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Container/components/ContainerImage";

// Mock react-konva components
vi.mock("react-konva", () => ({
    Group: ({ children }: any) => (
        <div data-testid="group">{children}</div>
    ),
    Rect: ({ width, height, fill, stroke, strokeWidth, cornerRadius }: any) => (
        <div
            data-testid="rect"
            data-width={width}
            data-height={height}
            data-fill={fill}
            data-stroke={stroke}
            data-strokewidth={strokeWidth}
            data-cornerradius={cornerRadius}
        />
    ),
    Image: ({ image, width, height, opacity, shadowColor, perfectDrawEnabled }: any) => (
        <div
            data-testid="konva-image"
            data-width={width}
            data-height={height}
            data-opacity={opacity}
            data-shadowcolor={shadowColor}
            data-perfectdrawenabled={perfectDrawEnabled}
        />
    ),
    Text: ({ text }: any) => (
        <div data-testid="konva-text">{text}</div>
    ),
}));


// Mock use-image
vi.mock("use-image", () => ({
    default: vi.fn(),
}));

describe("ContainerImage component", () => {
    const container = {
        id: 1,
        width: 100,
        height: 80,
        container: {
            imageTopViewUrl: "/topview.png",
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders Rect when image is not loaded", () => {
        useImage.mockReturnValue([null, "loading"]);

        render(<ContainerImage container={container} selected={false} isOverZone={false} isOutsideRoom={false} />);

        const rect = screen.getByTestId("rect");
        expect(rect).toBeInTheDocument();
        expect(rect.dataset.width).toBe("100");
        expect(rect.dataset.height).toBe("80");
        expect(rect.dataset.fill).toBe("#9df29d");
    });

    it("renders Rect with correct fill when selected", () => {
        useImage.mockReturnValue([null, "loading"]);

        render(<ContainerImage container={container} selected={true} isOverZone={false} isOutsideRoom={false} />);
        const rect = screen.getByTestId("rect");
        expect(rect.dataset.fill).toBe("#7fd97f");
    });

    it("renders Rect with correct fill when over zone", () => {
        useImage.mockReturnValue([null, "loading"]);

        render(<ContainerImage container={container} selected={false} isOverZone={true} isOutsideRoom={false} />);
        const rect = screen.getByTestId("rect");
        expect(rect.dataset.fill).toBe("rgba(255,0,0,0.5)");
    });


    it("renders KonvaImage when image is loaded", () => {
        const mockImg = {} as HTMLImageElement;
        useImage.mockReturnValue([mockImg, "loaded"]);

        render(<ContainerImage container={container} selected={true} isOverZone={false} isOutsideRoom={false} />);

        const image = screen.getByTestId("konva-image");
        expect(image).toBeInTheDocument();
        expect(image.dataset.width).toBe("100");
        expect(image.dataset.height).toBe("80");
        expect(image.dataset.opacity).toBe("0.9");
        expect(image.dataset.shadowcolor).toBe("#256029");
    });

    it("applies opacity 0.5 when outside room", () => {
        const mockImg = {} as HTMLImageElement;
        useImage.mockReturnValue([mockImg, "loaded"]);

        render(<ContainerImage container={container} selected={true} isOverZone={false} isOutsideRoom={true} />);

        const image = screen.getByTestId("konva-image");
        expect(image.dataset.opacity).toBe("0.5");
    });
});
