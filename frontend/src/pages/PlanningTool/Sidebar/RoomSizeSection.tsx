/**
 * RoomSizeSection component.
 * Allows users to set the dimensions of the room.
 * Opens a prompt when the button is clicked and updates the room size on confirmation.
 */
import RoomSizePrompt from "../../../components/RoomSizePrompt";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE } from "../constants";
import type { Room } from "../types";

/* ─────────────── RoomSizeSection Props ──────────────── */
type RoomSizeSectionProps = {
    isAlterRoomSizeOpen: boolean;
    setIsAlterRoomSizeOpen: (v: boolean) => void;
    setRoom: (room: Room) => void;
};

export default function RoomSizeSection({
    isAlterRoomSizeOpen,
    setIsAlterRoomSizeOpen,
    setRoom,
}: RoomSizeSectionProps) {

    //Handles confirmation from the prompt and updates the room
    const handleConfirm = (length: number, width: number) => {
        setRoom({
            x: (STAGE_WIDTH - length / SCALE) / 2,
            y: (STAGE_HEIGHT - width / SCALE) / 2,
            width: length / SCALE,
            height: width / SCALE,
        });
        setIsAlterRoomSizeOpen(false);
    };

    /* ─────────────── Render ─────────────── */
    return (
        <div>

        {/* Button to open the prompt for custom room size */}
        <button
            className="w-full p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setIsAlterRoomSizeOpen(true)}
        >
            Ange bredd och längd på rummet
        </button>

        {/* Show prompt if user wants to alter room size */}
        {isAlterRoomSizeOpen && (
            <RoomSizePrompt
                onConfirm={handleConfirm}
                onCancel={() => setIsAlterRoomSizeOpen(false)}
            />
        )}
    </div>
  );
}