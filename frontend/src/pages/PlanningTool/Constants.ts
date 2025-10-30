/**
 * Constants used in the Planning Tool page.
 */

//Clamps a value between a minimum and maximum range
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

//Convert millimeters to pixels based on SCALE
export const mmToPixels = (mm?: number): number => {
    const mmToMeter = mm / 1000;
    return mmToMeter / SCALE;
};

//Scale factor: 1 pixel = 0.02 meter in real life
export const SCALE = 0.02;

//Minimum room dimensions in pixels
export const MIN_WIDTH = 50;
export const MIN_HEIGHT = 50;

//Canvas dimensions and margins
export const MARGIN = 150;
export const STAGE_WIDTH = 900;
export const STAGE_HEIGHT = 750;

//Drag-and-drop data format for containers
export const DRAG_DATA_FORMAT = 'application/avfallskompassen-container';