// Toolbar.tsx
import { React, useState } from "react";
import { Save, Ruler, DoorOpen, Undo, Redo, PillBottle, X } from "lucide-react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MARGIN, clamp, MIN_HEIGHT, MIN_WIDTH } from "../../../Constants"
import RoomSizePrompt from "../../../../../components/RoomSizePrompt";
import DoorWidthPrompt from "../../../../../components/DoorWidthPrompt";
import ContainerInfo from "./ContainerInfo"
import './css/roomCanvasToolbar.css'

type ToolbarProps = {
    roomName?: string;
    isContainerPanelOpen: boolean;
    toggleContainerPanel: () => void;
    handleAddDoor: (door: { width: number }) => boolean;
    handleSelectContainer: (id: number | null) => void;
    handleSelectDoor: (id: number | null) => void;
    room: Room;
    setRoom: (room: Room) => void;
    saveRoom?: () => Promise<void>;
    doorsLength: number;
    setMsg: (msg: string | null) => void;
    setError: (error: string | null) => void;
    undo?: () => void;
    redo?: () => void;
    selectedContainerInfo: ContainerDTO | null;
    setSelectedContainerInfo: (container: ContainerDTO | null) => void;
};

export default function Toolbar({
    roomName,
    isContainerPanelOpen,
    toggleContainerPanel,
    handleAddDoor,
    handleSelectContainer,
    handleSelectDoor,
    room,
    setRoom,
    saveRoom,
    doorsLength,
    setMsg,
    setError,
    undo,
    redo,
    selectedContainerInfo,
    setSelectedContainerInfo,
}: ToolbarProps) {

    const [isRoomPromptOpen, setIsRoomPromptOpen] = useState(false);
    const [isDoorPromptOpen, setIsDoorPromptOpen] = useState(false);

    const [containerInfoPos, setContainerInfoPos] = useState<{ left: number; top: number } | null>(null);

    const safeUndo = useCallback(() => {
        if (typeof undo === "function") {
            undo();
        }
    }, [undo]);

    const safeRedo = useCallback(() => {
        if (typeof redo === "function") {
            redo();
        }
    }, [redo]);

    const handleConfirmRoomSize = (name: string, length: number, width: number) => {
        // length and width are expected in mm; convert to canvas px using SCALE
        const widthPx = width / SCALE;
        const heightPx = length / SCALE;

        const maxWidthPx = STAGE_WIDTH - 2 * MARGIN;
        const maxHeightPx = STAGE_HEIGHT - 2 * MARGIN;

        const newWidth = clamp(widthPx, MIN_WIDTH, maxWidthPx);
        const newHeight = clamp(heightPx, MIN_HEIGHT, maxHeightPx);

        const newX = clamp(room.x, MARGIN, STAGE_WIDTH - MARGIN - newWidth);
        const newY = clamp(room.y, MARGIN, STAGE_HEIGHT - MARGIN - newHeight);

        setRoom({
            ...room,
            name,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        });
        setIsRoomPromptOpen(false);
    };

        const handleAddDoorWithPrompt = (width: number) => {
            const success = handleAddDoor({ width });
            if (success) setIsDoorPromptOpen(false);
        };

        const handleSaveRoom = async () => {
            setMsg("");
            setError("");
            if (typeof saveRoom === "function") {
                if (doorsLength > 0) {
                    try {
                        await saveRoom();
                        setTimeout(() => setMsg("Rummet har sparats"), 10);
                        setTimeout(() => setError(null), 10);
                    } catch {
                        setTimeout(() => setError("Rummet gick inte att spara. Vänligen försök senare igen"), 10);
                        setTimeout(() => setMsg(null), 10);
                    }
                } else {
                    setTimeout(() => setError("Det måste finnas en dörr innan du sparar rummet"), 10);
                    setTimeout(() => setMsg(null), 10);
                }
            }
        };

    return (
        <div className="toolbar-panel">
            {/* Change room size */}
            <button
                onClick={() => {
                    setIsRoomPromptOpen(true);
                    handleSelectContainer(null);
                    handleSelectDoor(null);
                }}
                className="group toolbar-btn"
            >
                <Ruler className="toolbar-icon" />
                <span className="toolbar-label">Ändra rumsdimensioner</span>
            </button>

            {/* Add door */}
            <button
                onClick={() => setIsDoorPromptOpen(true)}
                className="group toolbar-btn"
            >
                <DoorOpen className="toolbar-icon" />
                <span className="toolbar-label">Lägg till dörr</span>
            </button>

            {/* Add container */}
            <button
                onClick={toggleContainerPanel}
                className={`group toolbar-btn ${isContainerPanelOpen ? "toolbar-btn-active" : ""}`}
            >
                <PillBottle className="toolbar-icon" />
                <span className="toolbar-label">Lägg till sopkärl</span>
            </button>

            {/* Save design */}
            <button
                onClick={handleSaveRoom}
                className="group toolbar-btn"
            >
                <Save className="toolbar-icon" />
                <span className="toolbar-label">Spara design</span>
            </button>

            {/* Undo */}
            <button
                onClick={safeUndo}
                className="group toolbar-btn"
                title="Ångra (Ctrl+Z)"
            >
                <Undo className="toolbar-icon" />
                <span className="toolbar-label">Ångra</span>
            </button>

            {/* Redo */}
            <button
                onClick={safeRedo}
                className="group toolbar-btn"
                title="Gör om (Ctrl+Y)"
            >
                <Redo className="toolbar-icon" />
                <span className="toolbar-label">Gör om</span>
            </button>

            {/* Room name */}
            {roomName && (
                <div className="room-name">
                    {"Namn: " + roomName}
                </div>
            )}

            {/* Prompts */}
            {isRoomPromptOpen && (
                <RoomSizePrompt
                    onConfirm={(name, length, width) => handleConfirmRoomSize(name, length, width)}
                    onCancel={() => setIsRoomPromptOpen(false)}
                />
            )}
            {isDoorPromptOpen && (
                <DoorWidthPrompt
                    onConfirm={handleAddDoorWithPrompt}
                    onCancel={() => setIsDoorPromptOpen(false)}
                />
            )}

            {/* Selected container information */}
            {selectedContainerInfo && (
                <ContainerInfo
                    container={selectedContainerInfo}
                    onClose={() => setSelectedContainerInfo(null)}
                    pos={containerInfoPos}
                    setPos={setContainerInfoPos}
                />
            )}
        </div>
    );
}
