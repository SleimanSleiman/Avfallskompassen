import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import useContainerPanel from "../../../../../src/pages/PlanningTool/RoomCanvas/hooks/useContainerPanel";

describe("useContainerPanel hook", () => {
    let originalResizeObserver: any;
    let resizeObserverInstance: any;

    beforeAll(() => {
        originalResizeObserver = (global as any).ResizeObserver;

        class MockResizeObserver {
            callback: Function;
                constructor(cb: Function) {
                this.callback = cb;
                resizeObserverInstance = this;
            }
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
            trigger = () => this.callback();
        }

        (global as any).ResizeObserver = MockResizeObserver;
    });

    afterAll(() => {
        (global as any).ResizeObserver = originalResizeObserver;
    });

    it("should initialize with isOpen false", () => {
        const { result } = renderHook(() => useContainerPanel({}));
        expect(result.current.isOpen).toBe(false);
    });

    it("should toggle isOpen state", () => {
        const { result } = renderHook(() => useContainerPanel({}));

        act(() => {
            result.current.setIsOpen(true);
        });

        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.setIsOpen(false);
        });

        expect(result.current.isOpen).toBe(false);
    });

    it("should call close and reset states", () => {
        const setIsStageDropActive = vi.fn();
        const setDraggedContainer = vi.fn();

        const { result } = renderHook(() =>
            useContainerPanel({ setIsStageDropActive, setDraggedContainer })
        );

        act(() => {
            result.current.close();
        });

        expect(result.current.isOpen).toBe(false);
        expect(setIsStageDropActive).toHaveBeenCalledWith(false);
        expect(setDraggedContainer).toHaveBeenCalledWith(null);
    });

    it("should call onContainerPanelHeightChange with element height", () => {
        const onContainerPanelHeightChange = vi.fn();

        const { result } = renderHook(() =>
            useContainerPanel({ onContainerPanelHeightChange })
        );

        const mockDiv = {
            getBoundingClientRect: () => ({ height: 123 }),
        } as unknown as HTMLDivElement;

        act(() => {
            result.current.ref.current = mockDiv;
        });

        act(() => {
            result.current.setIsOpen(true);
        });

        expect(resizeObserverInstance).toBeDefined();

        act(() => {
            resizeObserverInstance.trigger();
        });

        expect(onContainerPanelHeightChange).toHaveBeenCalledWith(123);
    });
});
