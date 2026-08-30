// these represent ON DRS in the API data
export const DRS_NUMS = new Set([10, 12, 14]);
// how many PIXELS to offset lap visualizer lines on canvas
export const LINE_OFFSET = 1;
// buffer between calls to OpenF1
export const REQ_GAP_MS = 350;
// How much to saturate the brake text (higher = less)
export const SATURATION_PCT = 30;
// what speed (kmh) we should display maximum green
export const MAX_SPEED_COLOR = 200;
// how often to poll data during lap visualizer
export const POLL_INTERVAL_MS = 50;