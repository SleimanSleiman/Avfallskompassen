import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import InfoTooltip from "../../src/pages/PlanningTool/components/InfoTooltip";
import { vi, describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom";

vi.stubGlobal("requestAnimationFrame", (cb: any) => cb());


// Clean up between tests
afterEach(() => {
cleanup();
vi.clearAllMocks();
});

    // Mock createPortal to render normally in the DOM (instead of a detached portal)
vi.mock("react-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-dom")>();
    return {
        ...actual,
        createPortal: (node: any) => node,
    };
});

describe("InfoTooltip", () => {
    it("renders the info button", () => {
        render(<InfoTooltip text="Helpful tooltip text" />);
        const button = screen.getByRole("button", { name: /visa hjälp/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("i");
});

    it("shows tooltip on hover", () => {
        render(<InfoTooltip text="Helpful tooltip text" />);

        const button = screen.getByRole("button");
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        // Trigger hover
        act(() => {
        fireEvent.mouseEnter(button);
        });

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent("Helpful tooltip text");
    });

    it("hides tooltip on mouse leave", () => {
        vi.useFakeTimers();

        render(<InfoTooltip text="Hidden tooltip text" />);
        const button = screen.getByRole("button");

        act(() => {
        fireEvent.mouseEnter(button);
        });

        let tooltip: HTMLElement | null = screen.queryByRole("tooltip");
        expect(tooltip).toBeInTheDocument();

        act(() => {
        fireEvent.mouseLeave(button);
        vi.advanceTimersByTime(300);
        });

        tooltip = screen.queryByRole("tooltip");
        expect(tooltip).not.toBeInTheDocument();

        vi.useRealTimers();
    });

    it("toggles tooltip on click", () => {
        vi.useFakeTimers();

        render(<InfoTooltip text="Click tooltip text" />);
        const button = screen.getByRole("button");

        // open
        act(() => fireEvent.click(button));
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("closes tooltip when clicking again", () => {
        render(<InfoTooltip text="Click tooltip text" />);
        const button = screen.getByRole("button");

        // First click: open
        act(() => {
            fireEvent.click(button);
        });
        expect(screen.getByRole("tooltip")).toBeInTheDocument();

        // Second click: close immediately
        act(() => {
            fireEvent.click(button);
        });

        const hiddenTooltip = screen.getByRole("tooltip");
        expect(hiddenTooltip).toHaveClass("opacity-0");
    });
});
