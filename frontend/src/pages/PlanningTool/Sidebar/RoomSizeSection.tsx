/**
 * RoomSizeSection component.
 * Allows users to set the dimensions of the room.
 * Opens a prompt when the button is clicked and updates the room size on confirmation.
 */
import RoomSizePrompt from "../../../components/RoomSizePrompt";
import InfoTooltip from "../components/InfoTooltip";
import { STAGE_WIDTH, STAGE_HEIGHT, SCALE } from "../Constants";
import type { Room } from "../Types";

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
            width: width / SCALE,
            height: length / SCALE,
        });
        setIsAlterRoomSizeOpen(false);
    };

    /* ─────────────── Render ─────────────── */
    return (
        <div>
            <div className="relative">

                {/* Button to open the prompt for custom room size */}
                <button
                    className="w-full flex items-center justify-between p-3 pr-12 rounded border border-gray-200 bg-white text-nsr-teal hover:bg-gray-50 transition text-left"
                    onClick={() => setIsAlterRoomSizeOpen(true)}
                >
                    <span className="font-medium">Ange bredd och längd på rummet</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                <InfoTooltip
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    text="Ange rummets längd och bredd i meter. Måtten används för att centrera ritningen och avgöra hur mycket plats som finns för kärl och dörrar."
                />
            </div>

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