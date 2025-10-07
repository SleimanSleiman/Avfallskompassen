import { useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';

//Scale factor: 1 pixel = 0.05 meter in real life
const SCALE = 0.05;

//Clamp function to restrict values within min and max bounds
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export default function PlanningTool() {
    const MIN_WIDTH = 50;
    const MIN_HEIGHT = 50;
    const MARGIN = 30;
    const STAGE_WIDTH = 800;
    const STAGE_HEIGHT = 600;

    //Room state containing room's position and dimensions in pixels
    const [room, setRoom] = useState({
        x: 100,
        y: 100,
        width: 400,
        height: 300
    });

    //Handles dragging of corners to resize the room dynamically
    const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
        let { x, y, width, height } = room;

         switch (index) {
             case 0: // top-left corner
                x = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                y = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = room.x + room.width - x;
                height = room.y + room.height - y;
                break;

             case 1: // top-right corner
                const trX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const trY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
                width = trX - x;
                height = room.y + room.height - trY;
                y = trY;
                break;

             case 2: // bottom-right corner
                const brX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                const brY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                width = brX - x;
                height = brY - y;
                break;

             case 3: // bottom-left corner
                const blX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
                const blY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                x = blX;
                width = room.x + room.width - x;
                height = blY - y;
                break;
         }

         setRoom({ x, y, width, height });
    };

    //Calculates corner positions based on current room state
    const corners = [
        { x: room.x, y: room.y }, //top-left corner
        { x: room.x + room.width, y: room.y }, //top-right corner
        { x: room.x + room.width, y: room.y + room.height }, //bottom-right corner
        { x: room.x, y: room.y + room.height } //bottom-left corner
    ];

    //Convert dimensions to meters for display (rounded to 2 decimal places)
    const widthMeters = (room.width * SCALE).toFixed(2);
    const heightMeters = (room.height * SCALE).toFixed(2);

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-2xl font-semibold mb-4">Planeringsverktyg</h1>
            <Stage width={800} height={600} className="border border-gray-300 bg-gray-50 rounded">
                <Layer>
                    {/* Room */}
                    <Rect
                        x={room.x}
                        y={room.y}
                        width={room.width}
                        height={room.height}
                        fill="#bde0fe"
                        stroke="#1e6091"
                        strokeWidth={2}
                    />

                    {/* Measurement labels*/}
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

                    {/* Corner-circles */}
                    {corners.map((corner, index) => (
                        <Circle
                            key={index}
                            x={corner.x}
                            y={corner.y}
                            radius={8}
                            fill="#11e6091"
                            draggable
                            dragBoundFunc={(pos) => {
                                //Use same logic as handleDragCorner to constrain movement for corner-circles
                                let newPos = { x: pos.x, y: pos.y };
                                switch (index) {
                                    case 0:
                                        newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                        newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                        break;
                                    case 1:
                                        newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                        newPos.y = clamp(pos.y, MARGIN, room.y + room.height - MIN_HEIGHT);
                                        break;
                                    case 2:
                                        newPos.x = clamp(pos.x, room.x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
                                        newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                        break;
                                    case 3:
                                        newPos.x = clamp(pos.x, MARGIN, room.x + room.width - MIN_WIDTH);
                                        newPos.y = clamp(pos.y, room.y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
                                        break;
                                }
                                return newPos;
                            }}
                            onDragMove={(e) => handleDragCorner(index, e.target.position())}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}