/**
 * useContainerPanel Hook
 * Manages the open/close state of a container panel, tracks its DOM height,
 * and handles drag-related state for containers on a canvas.
 */

import {useState, useRef, useEffect, useCallback} from "react";

function useContainerPanel({
    onContainerPanelHeightChange,
    setIsStageDropActive,
    setDraggedContainer,
}: {
    onContainerPanelHeightChange?: (height: number) => void;
    setIsStageDropActive?: (v: boolean) => void;
    setDraggedContainer?: (v: any) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    //Close panel and reset drag states
    const close = useCallback(() => {
        setIsOpen(false);
        setIsStageDropActive?.(false);
        setDraggedContainer?.(null);
    }, [setIsStageDropActive, setDraggedContainer]);

    //Observe panel height changes and call callback
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            onContainerPanelHeightChange?.(0);
            return;
        }

        const updateHeight = () => {
            onContainerPanelHeightChange?.(element.getBoundingClientRect().height);
        };

        updateHeight();

        //Fallback for window and ResizeObserver
        const win = typeof window !== "undefined" ? window : undefined;
        if (!win) return;

        if (typeof (win as any).ResizeObserver === "function") {
            const observer = new (win as any).ResizeObserver(updateHeight);
            observer.observe(element);
            return () => observer.disconnect();
        }

        //Fallback resize listener
        win.addEventListener("resize", updateHeight);
        return () => win.removeEventListener("resize", updateHeight);

    }, [onContainerPanelHeightChange, isOpen]);

    return { isOpen, setIsOpen, close, ref };
}

export default useContainerPanel;