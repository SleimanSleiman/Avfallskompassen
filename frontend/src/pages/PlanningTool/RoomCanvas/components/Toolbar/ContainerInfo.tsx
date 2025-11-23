/**
 * ContainerInfo Component
 * Displays information about a selected container in a draggable panel.
 */

import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ContainerDTO } from "../../../../../lib/Container";
import './css/roomCanvasToolbar.css'

type ContainerInfoProps = {
    container: ContainerDTO;
    onClose: () => void;
    pos: { left: number; top: number } | null;
    setPos: React.Dispatch<React.SetStateAction<{ left: number; top: number } | null>>;
};

export default function ContainerInfo({ container, onClose, pos, setPos}: ContainerInfoProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const actualPos = pos || { left: 100, top: 100 };

    //Initialize position if null
    useEffect(() => {
        if (!pos) {
            const panelEl = panelRef.current;
            if (!panelEl) return;

            const defaultLeft = 100;
            const defaultTop = 100;

            setPos({ left: defaultLeft, top: defaultTop });
        }
    }, [pos, setPos]);

    //Start dragging
    const onMouseDown = (e: React.MouseEvent) => {
        if (!panelRef.current) return;
        setOffset({ x: e.clientX - actualPos.left, y: e.clientY - actualPos.top });
        setDragging(true);
    };

    //Handle dragging
    useEffect(() => {
        if (!dragging) return;

        const onMouseMove = (e: MouseEvent) => {
            if (!pos) return;
            setPos({ left: Math.max(0, e.clientX - offset.x), top: Math.max(0, e.clientY - offset.y) });
        };
        const onMouseUp = () => setDragging(false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, offset, pos, setPos]);

    return (
        <div
            ref={panelRef}
            onMouseDown={onMouseDown}
            className="selected-container-panel"
            style={{
                left: actualPos.left,
                top: actualPos.top
            }}
        >
            <div className="selected-container-header">
                <div>
                    <h3 className="selected-container-name">{container.name}</h3>
                    <p className="selected-container-subtitle">{container.size} L · {container.cost} kr/år</p>
                </div>
                <button
                    onClick={onClose}
                    className="selected-container-close-btn"
                    aria-label="Stäng information"
                >
                    <X className="selected-container-close-btn-icon" />
                </button>
            </div>
            <div className="selected-container-body">
                <img
                    src={`http://localhost:8081${container.imageFrontViewUrl}`}
                    alt={container.name}
                    className="selected-container-image"
                />
                <div className="selected-container-info">
                    <p>Mått: {container.width} × {container.height} × {container.depth} mm</p>
                    <p>Tömningsfrekvens: {container.emptyingFrequencyPerYear}/år</p>
                    <p>Service: {container.serviceTypeName}</p>
                    {[190, 240, 243, 370].includes(container.size) && (
                        <p className="selected-container-lock-i-lock">
                            Kompatibel med lock-i-lock (100 kr/år per lock)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
