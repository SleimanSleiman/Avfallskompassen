import { useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';

//Scale factor: 1 pixel = 0.05 meter in real life
const SCALE = 0.05;

export default function PlanningTool() {
    //Room state containing room's position and dimensions in pixels
    const [room, setRoom] = useState({
        x: 100,
        y: 100,
        width: 400,
        height: 300
    });

//Calculates corner positions based on current room state
const corners = [
    { x: room.x, y: room.y }, //top-left corner
    { x: room.x + room.width, y: room.y }, //top-right corner
    { x: room.x + room.width, y: room.y + room.height }, //bottom-right corner
    { x: room.x, y: room.y + room.height } //bottom-left corner
];

//Handles dragging of corners to resize the room dynamically
const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
    let { x, y, width, height } = room;

    switch (index) {
        case 0: //top-left corner
            width += x - pos.x;
            height += y - pos.y;
            x = pos.x;
            y = pos.y;
            break;
        case 1: //top-right corner
            width = pos.x - x;
            height += y - pos.y;
            y = pos.y;
            break;
        case 2: //bottom-right corner
            width = pos.x - x;
            height = pos.y - y;
            break;
        case 3: //bottom-left corner
            width += x - pos.x;
            height = pos.y - y;
            x = pos.x;
            break;
    }

    //Minimum size constraints for the room prevents it from becoming too small
    if (width < 50) width = 50;
    if (height < 50) height = 50;

    setRoom({ x, y, width, height });
};

//Convert dimensions to meters for display (rounded to 2 decimal places)
const widthMeters = (room.width * SCALE).toFixed(2);
const heightMeters = (room.height * SCALE).toFixed(2);

return (
    <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-semibold mb-4">Planeringsverktyg</h1>
        <Stage width={800} height={600} className="border border-gray-300 bg-gray-50 rounded">
            <Layer>
                <Rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill="#bde0fe"
                    stroke="#1e6091"
                    strokeWidth={2}
                />

                <Text
                    x={room.x + room.width / 2 - 30}
                    y={room.y -25}
                    text={`${widthMeters} m`}
                    fontSize={14}
                    fill="#333"
                />
                <Text
                    x={room.x + room.width + 20}
                    y={room.y + room.height / 2 - 10}
                    text={`${heightMeters} m`}
                    fontSize={14}
                    fill="#333"
                    rotation={90}
                />

                {corners.map((corner, index) => (
                    <Circle
                        key={index}
                        x={corner.x}
                        y={corner.y}
                        radius={8}
                        fill="#11e6091"
                        draggable
                        onDragMove={(e) => handleDragCorner(index, e.target.position())}
                    />
                ))}
            </Layer>
        </Stage>
    </div>
    );
}