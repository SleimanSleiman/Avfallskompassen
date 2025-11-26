/**
 * BlockedZones Component
 * Renders semi-transparent blocked zones on a Konva canvas.
 */

import { Group, Rect } from "react-konva"

function BlockedZones({ zones }: { zones: { x: number; y: number; width: number; height: number }[] }) {
    return (
        <>
            {zones.map((zone, i) => (
                <Group key={i} x={zone.x} y={zone.y} listening={false}>
                    {/* Semi-transparent fill */}
                    <Rect
                        x={0}
                        y={0}
                        width={zone.width}
                        height={zone.height}
                        fill="red"
                        opacity={0.15}
                        cornerRadius={4}
                    />
                    {/* Dashed outline */}
                    <Rect
                        x={0}
                        y={0}
                        width={zone.width}
                        height={zone.height}
                        stroke="red"
                        strokeWidth={2}
                        dash={[6, 4]}
                        cornerRadius={4}
                    />
                </Group>
            ))}
        </>
    );
}

export default BlockedZones;