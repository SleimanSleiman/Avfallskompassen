/**
 * Constants used in the Planning Tool page.
 */
import type {ContainerInRoom} from "./Types.ts";

//Clamps a value between a minimum and maximum range
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const mmToPixels = (mm: number): number => {
    const mmToMeter = mm / 1000;
    return mmToMeter / SCALE;
};

export const cmToPixels = (cm: number): number => {
    const cmToMeter = cm / 100;
    return cmToMeter / SCALE;
};

//Check if two objects are overlapping
export const isOverlapping = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
) => {
    return !(
        a.x + a.width <= b.x ||
        a.x >= b.x + b.width ||
        a.y + a.height <= b.y ||
        a.y >= b.y + b.height
    );
};

export const SCALE = 0.02;

export const MARGIN = 150;
export const STAGE_WIDTH = 900;
export const STAGE_HEIGHT = 750;

//Minimum room dimensions in pixels
export const MIN_WIDTH = 2.5 / SCALE;
export const MIN_HEIGHT = 2.5 / SCALE;

export const ROOM_VERTICAL_OFFSET = 35;
export const ROOM_HORIZONTAL_OFFSET = 0;

//Drag-and-drop data format for containers
export const DRAG_DATA_FORMAT = 'application/avfallskompassen-container';

export const GRID_SIZE_PX = 1 / SCALE;

export const LOCK_I_LOCK_COMPATIBLE_SIZES = [190, 240, 243, 370];
export const LOCK_I_LOCK_COST = 100;

export function getContainerCost(c: ContainerInRoom) {
  return c.container.cost + (c.lockILock ? LOCK_I_LOCK_COST : 0);
}