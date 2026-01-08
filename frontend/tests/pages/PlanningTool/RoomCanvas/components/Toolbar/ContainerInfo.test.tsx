import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContainerInfo from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Toolbar/ContainerInfo";
import type { ContainerDTO } from "../../../../../../src/lib/Container";

describe("ContainerInfo component", () => {
    const mockOnClose = vi.fn();
    const mockSetPos = vi.fn();

    const containerInRoom = {
        container: {
            id: 1,
            name: "Test Container",
            size: 190,
            cost: 1200,
            width: 1000,
            height: 2000,
            depth: 500,
            emptyingFrequencyPerYear: 2,
            serviceTypeName: "Standard",
            imageFrontViewUrl: "/test.png",
        },
        lockILock: false,
    };

    const mockContainer: ContainerDTO = {
        id: 1,
        name: "Test Container",
        size: 190,
        cost: 1200,
        width: 1000,
        height: 2000,
        depth: 500,
        emptyingFrequencyPerYear: 2,
        serviceTypeId: 1,
        serviceTypeName: "Standard",
        imageFrontViewUrl: "/test.png",
        imageTopViewUrl: "/test-top.png",
    };

    const pos = { left: 150, top: 200 };

    it("renders container info correctly", () => {
        const { getByText } = render(
            <ContainerInfo
                container={mockContainer}
                lockILock={false}
                onClose={mockOnClose}
                pos={pos}
                setPos={mockSetPos}
            />
        );

        expect(getByText("Test Container")).toBeTruthy();
        expect(getByText("190 L · 1200 kr/år")).toBeTruthy();
        expect(getByText("Mått: 1000 × 2000 × 500 mm")).toBeTruthy();
        expect(getByText("Tömningsfrekvens: 2/år")).toBeTruthy();
        expect(getByText(/Kompatibel med lock-i-lock/i)).toBeTruthy();
    });

    it("calls onClose when close button is clicked", () => {
        const { getByLabelText } = render(
            <ContainerInfo
                container={mockContainer}
                lockILock={false}
                onClose={mockOnClose}
                pos={pos}
                setPos={mockSetPos}
            />
        );

        const closeButton = getByLabelText("Stäng information");
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("applies correct position from pos prop", () => {
        const { container: rendered } = render(
            <ContainerInfo
                container={mockContainer}
                lockILock={false}
                onClose={mockOnClose}
                pos={pos}
                setPos={mockSetPos}
            />
        );

        const panel = rendered.querySelector(".selected-container-panel") as HTMLElement;
        expect(panel.style.left).toBe(`${pos.left}px`);
        expect(panel.style.top).toBe(`${pos.top}px`);
    });

    it("renders default position if pos is null", () => {
        const { container: rendered } = render(
            <ContainerInfo
                container={mockContainer}
                lockILock={false}
                onClose={mockOnClose}
                pos={null}
                setPos={mockSetPos}
            />
        );

        const panel = rendered.querySelector(".selected-container-panel") as HTMLElement;
        expect(panel.style.left).toBe("100px");
        expect(panel.style.top).toBe("100px");
    });
});
