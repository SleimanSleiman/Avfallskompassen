/**
 * OtherObjectsLayer Component
 * Renders other objects (object blocking space in a room) within a room on the canvas.
 * Each object is rendered as a rectangle.
 */
import { Rect } from 'react-konva';
import type { OtherObjectInRoom, Room } from '../../../lib/Types';
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
    isObjectInsideRoom: (rect: { x: number; y: number; width: number; height: number; rotation?: number },room: Room) => boolean;
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
    isObjectInsideRoom,
}: OtherObjectsLayerProps) {

    return (
        <>
            {otherObjectsInRoom.map((obj) => {
                const isSelected = obj.id === selectedOtherObjectId;

                const isOutsideRoom = !isObjectInsideRoom(
                   { x: obj.x, y: obj.y, width: obj.width, height: obj.height, rotation: obj.rotation },
                   room
                );

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