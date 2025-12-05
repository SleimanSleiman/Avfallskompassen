/**
 * Toolbar Component
 * Renders a toolbar for room actions including resizing the room, adding doors and containers,
 * saving the design, and performing undo/redo actions.
 */

import { React, useState } from "react";
import { Save, Ruler, DoorOpen, Undo, Redo, PillBottle, X, SquarePlus } from "lucide-react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MARGIN, clamp, MIN_HEIGHT, MIN_WIDTH } from "../../../Constants"
import RoomSizePrompt from "../../../../../components/RoomSizePrompt";
import DoorWidthPrompt from "../../../../../components/DoorWidthPrompt";
import OtherObjectSizePrompt from "../../../../../components/OtherObjectSizePrompt";
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
    saveRoom?: (thumbnailBase64: string | null) => Promise<void>;
    doorsLength: number;
    setMsg: (msg: string | null) => void;
    setError: (error: string | null) => void;
    undo?: () => void;
    redo?: () => void;
    selectedContainerInfo: ContainerDTO | null;
    setSelectedContainerInfo: (container: ContainerDTO | null) => void;
    isAdminMode?: boolean;
    generateThumbnail: () => string | null;
    handleAddOtherObject: (name: string, length: number, width: number) => boolean;
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
    isAdminMode = false,
    generateThumbnail,
    handleAddOtherObject,
}: ToolbarProps) {

    const [isRoomPromptOpen, setIsRoomPromptOpen] = useState(false);
    const [isDoorPromptOpen, setIsDoorPromptOpen] = useState(false);
    const [isOtherObjectPromptOpen, setIsOtherObjectPromptOpen] = useState(false);

    const [containerInfoPos, setContainerInfoPos] = useState<{ left: number; top: number } | null>(null);

    //Safe wrappers for optional undo/redo
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

    //Confirm new room size
    const handleConfirmRoomSize = (name: string, length: number, width: number) => {
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

    //Confirm door addition
    const handleAddDoorWithPrompt = (width: number) => {
        const success = handleAddDoor({ width });
        if (success) setIsDoorPromptOpen(false);
    };

    //Confirm other object addition
    const handleAddOtherObjectWithPrompt = (name: string, length: number, width: number) => {
        const success = handleAddOtherObject(name, length, width);
        if (success) setIsOtherObjectPromptOpen(false);
    };

    //Save room and display messages
    const handleSaveRoom = async () => {
        setMsg("");
        setError("");
        if (!saveRoom) return;
        if (doorsLength === 0) {
            setTimeout(() => setError("Det måste finnas en dörr innan du sparar rummet"), 10);
            return;
        }
        try {
            const thumbnail = generateThumbnail();
            await saveRoom(thumbnail);

            setTimeout(() => setMsg("Rummet har sparats"), 10);
        } catch (err) {
            setTimeout(() => setError("Rummet gick inte att spara. Vänligen försök senare igen"), 10);
        }
    };

    return (
        <div id="toolbar-panel" className="toolbar-panel">
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
                onClick={() => {
                    setIsDoorPromptOpen(true);
                    handleSelectContainer(null);
                    handleSelectDoor(null);
                }}
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

            {/* Add other object */}
            <button
                onClick={() => {
                    setIsOtherObjectPromptOpen(true);
                    handleSelectContainer(null);
                    handleSelectDoor(null);
                }}
                className="group toolbar-btn"
            >
                <SquarePlus className="toolbar-icon" />
                <span className="toolbar-label">Lägg till övrigt föremål</span>
            </button>

            {/* Save design - Hidden in admin mode */}
            {!isAdminMode && (
                <button
                    onClick={handleSaveRoom}
                    className="group toolbar-btn"
                >
                    <Save className="toolbar-icon" />
                    <span className="toolbar-label">Spara design</span>
                </button>
            )}

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
            {isOtherObjectPromptOpen && (
                <OtherObjectSizePrompt
                    onConfirm={(name, length, width) => handleAddOtherObjectWithPrompt(name, length, width)}
                    onCancel={() => setIsOtherObjectPromptOpen(false)}
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
