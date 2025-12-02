/**
 * OtherObjectsLayer Component
 * Renders other objects (object blocking space in a room) within a room on the canvas.
 * Each object is rendered as a rectangle.
 */
import { Rect } from 'react-konva';
import type { OtherObjectInRoom, Room } from '../../../Types';
import OtherObjectDrag from './components/OtherObjectsDrag';

type OtherObjectsLayerProps = {
    otherObjectsInRoom: OtherObjectInRoom[];
    handleSelectOtherObject: (id: number) => void;
    room: Room;
    getOtherObjectZones: (excludeId?: number) => { x: number; y: number; width: number; height: number }[];
    containerZones: { x: number; y: number; width: number; height: number }[];
    doorZones: { x: number; y: number; width: number; height: number }[];
    selectedOtherObjectId: number | null;
    handleDragOtherObject: (id: number, pos: { x: number; y: number }) => void;
    setIsDraggingOtherObject: (val: boolean) => void;
};

export default function OtherObjectsLayer({
    otherObjectsInRoom,
    handleSelectOtherObject,
    room,
    getOtherObjectZones,
    containerZones,
    doorZones,
    selectedOtherObjectId,
    handleDragOtherObject,
    setIsDraggingOtherObject,
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
                    <OtherObjectDrag
                        key={obj.id}
                        object={obj}
                        room={room}
                        selected={isSelected}
                        doorZones={doorZones}
                        containerZones={containerZones}
                        getOtherObjectZones={getOtherObjectZones}
                        handleSelectOtherObject={handleSelectOtherObject}
                        handleDragOtherObject={handleDragOtherObject}
                        setIsDraggingOtherObject={setIsDraggingOtherObject}
                    >
                        {() => (
                            <Rect
                                x={0}
                                y={0}
                                width={obj.width}
                                height={obj.height}
                                fill={isSelected ? "#FFD700" : "#87CEFA"}
                                stroke={isSelected ? "#FFA500" : "#4682B4"}
                                strokeWidth={2}
                                cornerRadius={4}
                                opacity={isOutsideRoom ? 0.5 : 1}
                            />
                        )}
                    </OtherObjectDrag>
                );
            })}
        </>
    );
}