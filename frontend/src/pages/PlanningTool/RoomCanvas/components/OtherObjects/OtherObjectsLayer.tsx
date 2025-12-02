/**
 * OtherObjectsLayer Component
 * Renders other objects (object blocking space in a room) within a room on the canvas.
 * Each object is rendered as a rectangle.
 */
import { Rect } from 'react-konva';
import type { OtherObjectInRoom, Room } from '../../../Types';

type OtherObjectsLayerProps = {
    otherObjectsInRoom: OtherObjectInRoom[];
    handleSelectOtherObject: (id: number) => void;
    room: Room;
    otherObjectZones: { x: number; y: number; width: number; height: number }[];
    selectedOtherObjectId: number | null;
};

export default function OtherObjectsLayer({
    otherObjectsInRoom,
    handleSelectOtherObject,
    room,
    otherObjectZones,
    selectedOtherObjectId,
}: OtherObjectsLayerProps) {
    return (
        <>
            {otherObjectsInRoom.map((obj) => {

                const isSelected = obj.id === selectedOtherObjectId;

                //Check if the object is outside the room
                const isOutsideRoom =
                    obj.x < room.x ||
                    obj.y < room.y ||
                    obj.x + obj.width > room.x + room.width ||
                    obj.y + obj.height > room.y + room.height;

                return (
                    <Rect
                        key={obj.id}
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        fill={isSelected ? "#FFD700" : "#87CEFA"}
                        stroke={isSelected ? "#FFA500" : "#4682B4"}
                        strokeWidth={2}
                        cornerRadius={4}
                        opacity={isOutsideRoom ? 0.5 : 1}
                        onClick={() => handleSelectOtherObject(obj.id)}
                    />
                );
            })}
        </>
    );
}