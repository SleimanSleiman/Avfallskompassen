/**
 * Constants used in the Planning Tool page.
 */

//Clamps a value between a minimum and maximum range
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const CONTAINER_PIXEL_SCALE = 2;

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

//Canvas dimensions and margins
export const MARGIN = 70;
export const STAGE_WIDTH = 880;
export const STAGE_HEIGHT = 695;

//Scale factor selected så att rummets maxyta motsvarar 12 m × 9 m (givet marginalerna)
export const SCALE = 12 / (STAGE_WIDTH - 2 * MARGIN);

//Minimum room dimensions in pixels
export const MIN_WIDTH = 2.5 / SCALE;
export const MIN_HEIGHT = 2.5 / SCALE;

//Convert millimeters to pixels based on SCALE
export const mmToPixels = (mm?: number): number => {
    if (mm == null) {
        return 0;
    }

    const mmToMeter = mm / 1000;
    return (mmToMeter / SCALE) * CONTAINER_PIXEL_SCALE;
};

export const ROOM_VERTICAL_OFFSET = 35;
export const ROOM_HORIZONTAL_OFFSET = 0;

//Drag-and-drop data format for containers
export const DRAG_DATA_FORMAT = 'application/avfallskompassen-container';