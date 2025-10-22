/**
 * Constants used in the Planning Tool page.
 */

//Clamps a value between a minimum and maximum range
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

//Convert millimeters to pixels based on SCALE
export const mmToPixels = (mm?: number): number => {
    if (!mm || mm <= 0) return DEFAULT_CONTAINER_PIXEL_SIZE;

    const pixelsPerMeter = 100;
    const pixels = (mm / 1000) * pixelsPerMeter;

    return Math.round(Math.max(MIN_CONTAINER_PIXEL_SIZE, pixels));
};


//Scale factor: 1 pixel = 0.05 meter in real life
export const SCALE = 0.05;

//Minimum room dimensions in pixels
export const MIN_WIDTH = 50;
export const MIN_HEIGHT = 50;

//Canvas dimensions and margins
export const MARGIN = 30;
export const STAGE_WIDTH = 700;
export const STAGE_HEIGHT = 600;

//Default container sizing in pixels
export const DEFAULT_CONTAINER_PIXEL_SIZE = 40;
export const MIN_CONTAINER_PIXEL_SIZE = 28;

//Drag-and-drop data format for containers
export const DRAG_DATA_FORMAT = 'application/avfallskompassen-container';