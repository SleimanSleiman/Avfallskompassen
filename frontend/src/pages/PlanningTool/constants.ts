/**
 * Constants used in the Planning Tool page.
 */

//Clamps a value between a minimum and maximum range
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

//Scale factor: 1 pixel = 0.05 meter in real life
export const SCALE = 0.05;

//Minimum room dimensions in pixels
export const MIN_WIDTH = 50;
export const MIN_HEIGHT = 50;

//Canvas dimensions and margins
export const MARGIN = 30;
export const STAGE_WIDTH = 700;
export const STAGE_HEIGHT = 600;