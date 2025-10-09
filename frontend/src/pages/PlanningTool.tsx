import { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchServiceTypes } from '../lib/serviceType';

//Scale factor: 1 pixel = 0.05 meter in real life
const SCALE = 0.05;
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;
const MARGIN = 30;
const STAGE_WIDTH = 700;
const STAGE_HEIGHT = 600;

//Clamp function to restrict values within min and max bounds
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

//TODO: Replace with bins from database
const binsPerType: Record<string, string[]> = {
    'Restavfall': ['Kärl 1', 'Kärl 2', 'Kärl 3'],
    'Matavfall': ['Kärl 1', 'Kärl 2'],
    'Tidningar': ['Kärl 1', 'Kärl 2', 'Kärl 3', 'Kärl 4'],
    'Pappersförpackningar': ['Kärl 1'],
    'Plast': ['Kärl 1', 'Kärl 2'],
    'Metallförpackningar': ['Kärl 1', 'Kärl 2'],
    'Färgat glas': ['Kärl 1'],
    'Ofärgat glas': ['Kärl 1', 'Kärl 2'],
    'Småelspaket': ['Kärl 1']
};

export default function PlanningTool() {
    //Room state containing room's position and dimensions in pixels
    const [room, setRoom] = useState({
        x: 120,
        y: 120,
        width: 450,
        height: 350,
    });

    //State to track which tab is active in the sidebar
    const [activeTab, setActiveTab] = useState<'addBins' | 'costs' | null>(null);

    //State to control visibility of "Add Bins" and "Costs" sections
    const [isAddBinsOpen, setIsAddBinsOpen] = useState(false);
    const [showCosts, setShowCosts] = useState(false);

    //State to track selected subscription type
    const [selectedType, setSelectedType] = useState<string | null>(null);

    //State to hold fetched service types from backend
    const [serviceTypes, setServiceTypes] = useState<{name: string}[]>([]);

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

    //Fetch service types from backend
    useEffect(() => {
        fetchServiceTypes()
          .then(data => setServiceTypes(data))
          .catch(err => console.error('Error fetching service types:', err));
      }, []);

    return (
        <div className="flex w-full h-full p-6">
            <div className="flex justify-center items-start w-3/5">
                <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} className="border border-gray-300 bg-gray-50 rounded">
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

            {/* Right sidebar */}
            <div className="w-2/5 pl-8 flex flex-col h-[600px]">
                <div className="flex flex-col border rounded p-4 h-full overflow-y-auto">
                    {/* Button to add bins */}
                    <button
                        className="p-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick={() => setIsAddBinsOpen(!isAddBinsOpen)}
                    >
                        Lägg till nya sopkärl
                    </button>

                    {/* List with subscription types */}
                    <AnimatePresence initial={false}>
                        {isAddBinsOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                 className="mt-2 pl-4 space-y-2"
                            >
                                {serviceTypes.map((type) => (
                                    <motion.div key={type.name} layout>
                                        <button
                                            onClick={() => setSelectedType(type.name)}
                                            className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                                        >
                                            {type.name}
                                        </button>

                                        {/* List with bins */}
                                        {selectedType === type.name && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 pl-4 space-y-2"
                                            >
                                                <ul className="space-y-2">
                                                   {binsPerType[type.name]?.map((bin, i) => (
                                                     <li key={i} className="p-2 border rounded bg-white">{bin}</li>
                                                   ))}

                                                </ul>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Button to view subscription costs */}
                    <button
                        className="mt-3 p-3 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                        onClick={() => setShowCosts(!showCosts)}
                    >
                        Se abonnemangskostnader
                    </button>
                    <AnimatePresence>
                        {showCosts && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-2 border rounded bg-gray-50"
                            >
                                <p>Abonnemangskostnader kommer visas här.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}