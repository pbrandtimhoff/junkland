/*
  Animation Gallery
  ------------------
  Every animation appears exactly once — no repeats. Tiles are placed
  starting from the center and spiral outward: the first animation sits in
  the middle, then left, right, top, bottom, then the next ring out (again
  left, right, top, bottom, then the corners in between), and so on. The
  grid auto-sizes to however many files are listed.

  To use your own art:
  1. Drop your exported .json animation files into the /animations folder.
  2. List their filenames in ANIMATION_FILES below, in the order you want
     them to appear outward from the center.
  Add more any time and the spiral grows to fit, still with no repeats.
*/

const ANIMATION_FILES = [
  "enterwithpoints.json",
  "beehive-looping.json",
  "doublepoints.json",
  "rewards.json",
  "takeaction.json",
  "thisbetterwork.json",
  "bee-flower.json",
  "heart-arrow-looping.json",
];

const CELL = 300; // tile size in px
const GAP = 24; // space between tiles
const PITCH = CELL + GAP; // distance between tile origins

const N = ANIMATION_FILES.length;

// Returns the (dx, dy) offsets of every point at Manhattan distance `r`
// from the center, ordered left, right, top, bottom, then the remaining
// points on that diamond-shaped ring. r = 0 is just the center point.
function ringOffsets(r) {
  if (r === 0) return [[0, 0]];
  const pts = [
    [-r, 0], // left
    [r, 0], // right
    [0, -r], // top
    [0, r], // bottom
  ];
  for (let i = 1; i < r; i++) {
    pts.push([-r + i, -i]); // left→top edge
    pts.push([i, -r + i]); // top→right edge
    pts.push([r - i, i]); // right→bottom edge
    pts.push([-i, r - i]); // bottom→left edge
  }
  return pts;
}

// Build enough rings to place all N animations, spiraling out from center.
const SPIRAL_OFFSETS = [];
for (let r = 0; SPIRAL_OFFSETS.length < N; r++) {
  SPIRAL_OFFSETS.push(...ringOffsets(r));
}
SPIRAL_OFFSETS.length = N;

const maxRadius = SPIRAL_OFFSETS.reduce(
  (m, [dx, dy]) => Math.max(m, Math.abs(dx), Math.abs(dy)),
  0
);
const COLS = maxRadius * 2 + 1;
const ROWS = maxRadius * 2 + 1;
const CENTER = maxRadius;

// Lookup from "col_row" -> index into ANIMATION_FILES, and the reverse.
const positionForIndex = SPIRAL_OFFSETS.map(([dx, dy]) => ({
  col: CENTER + dx,
  row: CENTER + dy,
}));
const indexForPosition = new Map();
positionForIndex.forEach(({ col, row }, index) => {
  indexForPosition.set(`${col}_${row}`, index);
});

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");

// Browsers block loading local .json files when a page is opened directly
// as a file:// URL (double-clicked). Warn instead of showing a blank page.
if (location.protocol === "file:") {
  const banner = document.createElement("div");
  banner.textContent =
    "Animations can't load from a double-clicked file. Run a local server " +
    "(see README.md) or deploy the site, then reload.";
  banner.style.cssText =
    "position:fixed;top:48px;left:0;right:0;z-index:10;padding:12px 20px;" +
    "background:#5b2333;color:#ffd8e0;font:14px/1.4 system-ui,sans-serif;" +
    "text-align:center;";
  document.body.appendChild(banner);
}

const worldWidth = COLS * PITCH - GAP;
const worldHeight = ROWS * PITCH - GAP;
world.style.width = `${worldWidth}px`;
world.style.height = `${worldHeight}px`;

const activeCells = new Map(); // "col_row" -> { el, anim }

function createCell(col, row, index) {
  const key = `${col}_${row}`;
  const el = document.createElement("div");
  el.className = "cell";
  el.style.left = `${col * PITCH}px`;
  el.style.top = `${row * PITCH}px`;

  const animDiv = document.createElement("div");
  animDiv.className = "anim";
  el.appendChild(animDiv);
  world.appendChild(el);

  const anim = lottie.loadAnimation({
    container: animDiv,
    // Canvas renderer: each tile draws to its own independent canvas.
    // (The SVG renderer can have multiple instances collide on shared
    // internal IDs for gradients/clip-paths, which was making all but the
    // most recently loaded animation render blank.)
    renderer:
