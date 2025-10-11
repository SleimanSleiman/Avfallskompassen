import { useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';

const SCALE = 0.05; //Scale factor: 1 pixel = 0.05 meter in real life
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;
const MARGIN = 30;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;
const OFFSET = 20;

//TODO: Replace with subscription types from database
const abonTypes = [
    'Restavfall',
    'Matavfall',
    'Tidningar',
    'Pappersförpackningar',
    'Plast',
    'Metallförpackningar',
    'Färgat glas',
    'Ofärgat glas',
    'Småelspaket'
];

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

//Clamp function to restrict values within min and max bounds
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

//Calculate distance in meters between two points
const distanceMeters = (p1: {x:number,y:number}, p2:{x:number,y:number}) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) * SCALE;

//Calculate midpoint between two points
const midpoint = (p1: {x:number,y:number}, p2:{x:number,y:number}) => ({
    x: (p1.x + p2.x) /2,
    y: (p1.y + p2.y) /2
});

//Check if two line segments intersect to prevent self-intersecting polygons
const doLinesIntersect = (p1, p2, q1, q2) => {
    const det = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
    if (det === 0) return false; //if lines are parallel

    //Using Cramer's rule to find intersection point
    const lambda =
        ((q2.y - q1.y) * (q2.x - p1.x) + (q1.x - q2.x) * (q2.y - p1.y)) / det;
    const gamma =
        ((p1.y - p2.y) * (q2.x - p1.x) + (p2.x - p1.x) * (q2.y - p1.y)) / det;

    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
};

export default function PlanningTool() {

    //Room corners state as array of points
    const [points, setPoints] = useState([
        { x: 100, y: 100 }, //top-left corner
        { x: 500, y: 100 }, //top-right corner
        { x: 500, y: 400 }, //bottom-right corner
        { x: 100, y: 400 }, //bottom-left corner
    ]);

    //State to track which tab is active in the sidebar
    const [activeTab, setActiveTab] = useState<'addBins' | 'costs' | null>(null);

    //State to control visibility of "Add Bins" and "Costs" sections
    const [isAddBinsOpen, setIsAddBinsOpen] = useState(false);
    const [showCosts, setShowCosts] = useState(false);

    //State to track selected subscription type
    const [selectedType, setSelectedType] = useState<string | null>(null);

    //Handles dragging of corners to resize the room dynamically
    const handleDragCorner = (index, pos) => {
        const newPoints = [...points];

        //Clamp position within stage bounds
        const clampedPos = {
            x: Math.max(MARGIN, Math.min(pos.x, STAGE_WIDTH - MARGIN)),
            y: Math.max(MARGIN, Math.min(pos.y, STAGE_HEIGHT - MARGIN)),
        };
        newPoints[index] = clampedPos;

        //Check for self-intersections
        let valid = true;
        for (let i = 0; i < newPoints.length; i++) {
          const nextI = (i + 1) % newPoints.length;
          for (let j = 0; j < newPoints.length; j++) {
            const nextJ = (j + 1) % newPoints.length;
            if (Math.abs(i - j) <= 1 || Math.abs(i - j) === newPoints.length - 1) continue;
            if (doLinesIntersect(newPoints[i], newPoints[nextI], newPoints[j], newPoints[nextJ])) {
              valid = false;
              break;
            }
          }
          if (!valid) break;
        }

        if (valid) setPoints(newPoints);
    };

    //Calculate side lengths and positions for text labels
    const sideTexts = points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const mid = midpoint(p, next);
        const length = distanceMeters(p, next).toFixed(2);
        const angle = Math.atan2(next.y - p.y, next.x - p.x) * (180 / Math.PI);

        let offsetX = 0;
        let offsetY = 0;

        switch (i) {
            case 0: offsetY = -OFFSET; break; //top side
            case 1: offsetX = OFFSET; break;  //right side
            case 2: offsetY = OFFSET; break;  //bottom side
            case 3: offsetX = -OFFSET; break; //left side
        }

        return { x: mid.x + offsetX, y: mid.y + offsetY, text: `${length} m`, rotation: angle };
    });

    //Calculate area using shoelace formula
    const areaMeters = (() => {
        let sum = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            sum += p1.x * p2.y - p2.x * p1.y;
        }
        const areaPx = Math.abs(sum) / 2;
        return (areaPx * SCALE * SCALE).toFixed(2);
    })();

    return (
        <div className="flex w-full h-full p-6">
            <div className="flex flex-col items-center w-3/5">
                <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} className="border border-gray-300 bg-gray-50 rounded">
                    <Layer>
                        {/* Room polygon */}
                        <Line
                            points={points.flatMap(p => [p.x, p.y])}
                            stroke="#1e6091"
                            strokeWidth={2}
                            closed
                            fill="#bde0fe"
                        />

                        {/* Draggable corners */}
                        {points.map((point, i) => (
                            <Circle
                                key={i}
                                x={point.x}
                                y={point.y}
                                radius={8}
                                fill="#11e6091"
                                draggable
                                onDragMove={(e) => handleDragCorner(i, e.target.position())}
                                dragBoundFunc={(pos) => {
                                    let x = pos.x;
                                    let y = pos.y;

                                    switch(i) {
                                        case 0: x = clamp(pos.x, MARGIN, points[1].x - MIN_WIDTH); y = clamp(pos.y, MARGIN, points[3].y - MIN_HEIGHT); break;
                                        case 1: x = clamp(pos.x, points[0].x + MIN_WIDTH, STAGE_WIDTH - MARGIN); y = clamp(pos.y, MARGIN, points[2].y - MIN_HEIGHT); break;
                                        case 2: x = clamp(pos.x, points[3].x + MIN_WIDTH, STAGE_WIDTH - MARGIN); y = clamp(pos.y, points[1].y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN); break;
                                        case 3: x = clamp(pos.x, MARGIN, points[2].x - MIN_WIDTH); y = clamp(pos.y, points[0].y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN); break;
                                    }
                                    return { x, y };
                                }}
                            />
                       ))}

                        {/* Side length labels */}
                         {sideTexts.map((t, i) => (
                             <Text key={i} x={t.x} y={t.y} text={t.text} rotation={t.rotation} fontSize={14} fill="#333" />
                         ))}
                    </Layer>
                </Stage>

                {/* Display area below the stage */}
                <p className="mt-4 text-gray-700">
                    <strong>Area:</strong> {areaMeters} m²
                </p>
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
                                {abonTypes.map((type) => (
                                    <motion.div key={type} layout>
                                        <button
                                            onClick={() => setSelectedType(type)}
                                            className="w-full text-left p-2 border rounded bg-white hover:bg-blue-50 transition"
                                        >
                                            {type}
                                        </button>

                                        {/* List with bins */}
                                        {selectedType === type && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 pl-4 space-y-2"
                                            >
                                                <ul className="space-y-2">
                                                    {binsPerType[type].map((bin, i) => (
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