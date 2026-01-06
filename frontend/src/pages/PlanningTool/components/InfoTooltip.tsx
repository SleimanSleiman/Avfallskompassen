import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
    text: string;
    className?: string;
    panelWidthClass?: string;
    style?: React.CSSProperties; 
}

/**
* Accessible tooltip used across the planning tool to offer quick guidance.
* Handles hover, focus, and keyboard interactions so the hint can be discovered by all users.
*/
export default function InfoTooltip({
    text,
    className,
    panelWidthClass = "w-56",
}: InfoTooltipProps) {
    const [isRendered, setIsRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<{top: number, left: number} | null>(null);
    const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
    const tooltipId = useId();
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const closeTimeoutRef = useRef<number | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    const wrapperClasses = ["inline-flex", className].filter(Boolean).join(" ");
    const panelClasses = [
        "pointer-events-auto relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-4 text-sm leading-relaxed text-nsr-ink shadow-[0_18px_40px_rgba(7,41,45,0.18)] ring-1 ring-white/40 backdrop-blur-md transition duration-150 ease-out", panelWidthClass,
    ].join(" ");

    const cancelScheduledClose = () => {
        if (closeTimeoutRef.current !== null) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current !== null) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        cancelScheduledClose();
        closeTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false);
            hideTimeoutRef.current = window.setTimeout(() => setIsRendered(false), 150);
        }, 120);
    };

    const openTooltip = () => {
        cancelScheduledClose();
        if (!isRendered) setIsRendered(true);
        requestAnimationFrame(() => setIsVisible(true));
    };

    const closeTooltipImmediately = () => {
        cancelScheduledClose();
        setIsVisible(false);
        setIsRendered(false);
    };

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const margin = 8;

        requestAnimationFrame(() => {
            const tooltipWidth = panelRef.current?.offsetWidth ?? 0;
            const tooltipHeight = panelRef.current?.offsetHeight ?? 0;

            let left = rect.left + rect.width / 2;
            if (tooltipWidth > 0) {
                const halfWidth = tooltipWidth / 2;
                const minLeft = halfWidth + margin;
                const maxLeft = window.innerWidth - halfWidth - margin;
                left = Math.min(Math.max(left, minLeft), maxLeft);
            }

            let top = rect.bottom + margin;
            const fitsBelow = top + tooltipHeight <= window.innerHeight - margin;
            if (!fitsBelow) {
                top = rect.top - margin - tooltipHeight;
                setPlacement("top");
            } else {
                setPlacement("bottom");
            }
            top = Math.max(margin, top);

            setPosition({ top, left });
        });
    };

    useLayoutEffect(() => {
        if (!isRendered) return;
        updatePosition();

        const handleWindowChange = () => updatePosition();

        window.addEventListener("scroll", handleWindowChange, true);
        window.addEventListener("resize", handleWindowChange);

        return () => {
            window.removeEventListener("scroll", handleWindowChange, true);
            window.removeEventListener("resize", handleWindowChange);
        };
    }, [isRendered]);

    useEffect(() => () => cancelScheduledClose(), []);

    const portalTarget = typeof window !== "undefined" ? document.body : null;

    const isActive = isRendered && isVisible;

    const tooltipBody = (
        <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            style={{ position: "fixed", top: position?.top ?? -9999, left: position?.left ?? -9999, transform: "translateX(-50%)" }}
            className={`${panelClasses} z-[1000] ${
                isVisible ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 translate-y-1"
            }`}
            onMouseEnter={openTooltip}
            onMouseLeave={scheduleClose}
        >
            <div
                className="pointer-events-none absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border bg-white/90 shadow-sm"
                style={{
                    ...(placement === "bottom" ? { top: "-8px" } : { bottom: "-8px" }),
                    background: "linear-gradient(135deg, rgba(0,119,136,0.16), rgba(255,255,255,0.96))",
                    borderColor: "rgba(13, 40, 45, 0.08)",
                }}
            />

            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-nsr-teal/12 via-white/80 to-nsr-accent/10" />
            <div className="pointer-events-none absolute -top-16 -right-12 h-32 w-32 rounded-full bg-nsr-accent/20 blur-3xl opacity-80" />
            <div className="pointer-events-none absolute -bottom-14 -left-10 h-28 w-28 rounded-full bg-nsr-teal/20 blur-3xl opacity-70" />

            <div className="relative flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-nsr-teal text-white text-[10px] font-semibold shadow-soft">i</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-nsr-teal">Tips</span>
                </div>
                <p className="text-sm leading-relaxed text-nsr-ink">{text}</p>
            </div>
        </div>
    );

    return (
        <div className={wrapperClasses}>
            <button
                ref={triggerRef}
                type="button"
                aria-label="Visa hjälp"
                aria-describedby={isActive ? tooltipId : undefined}
                aria-expanded={isActive}
                aria-pressed={isActive}
                onMouseEnter={openTooltip}
                onMouseLeave={scheduleClose}
                onFocus={openTooltip}
                onBlur={closeTooltipImmediately}
                onClick={() => (isActive ? closeTooltipImmediately() : openTooltip())}
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold shadow-soft transition focus:outline-none focus-visible:ring-2 focus-visible:ring-nsr-teal/40 ${
                    isActive
                        ? "border-nsr-teal bg-nsr-teal/10 text-nsr-teal"
                        : "border-gray-300 bg-gray-50 text-gray-600 hover:border-nsr-teal hover:text-nsr-teal hover:bg-white"
                }`}
            >
                i
            </button>

            {portalTarget && isRendered ? createPortal(tooltipBody, portalTarget) : null}
        </div>
    );
}
