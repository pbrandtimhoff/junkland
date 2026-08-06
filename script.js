/*
  Animation Gallery — vast scrollable world
  ------------------------------------------
  The page opens centered on the middle tile of a huge grid of animations.
  You can scroll up, down, left, and right and keep going for thousands of
  tiles in every direction. Only the tiles near your current view are ever
  rendered (virtualized), so it stays smooth no matter how far you roam.

  To use your own art:
  1. Drop your exported .json animation files into the /animations folder.
  2. List their filenames in ANIMATION_FILES below (any order, repeats allowed).
  That's it — no other code changes needed. Which file appears on which tile
  is decided by a deterministic hash of its (col, row) position, so the
  layout looks varied but doesn't reshuffle every time you reload.
*/

const ANIMATION_FILES = [
  "pulse_circle.json",
  "rotate_square.json",
  "bounce_dot.json",
  "color_shift.json",
  "spin_triangle.json",
  "wiggle_bar.json",
];

const CELL = 300; // tile size in px
const GAP = 24; // space between tiles
const PITCH = CELL + GAP; // distance between tile origins

// How far the world extends from the center tile, in tiles, in every
// direction. 5000 gives a ~10,001 x 10,001 grid (~100 million tiles) —
// far more than anyone will scroll through, while staying well within
// browsers' max element size.
const GRID_RADIUS = 5000;
const TOTAL = GRID_RADIUS * 2 + 1;
const CENTER = GRID_RADIUS;

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");

const worldSize = TOTAL * PITCH;
world.style.width = `${worldSize}px`;
world.style.height = `${worldSize}px`;

// Deterministic pseudo-random pick so the same tile always shows the same
// animation across reloads, without storing anything.
function fileForTile(col, row) {
  let h = (col * 374761393 + row * 668265263) ^ (col * row * 2246822519);
  h = Math.abs(h);
  return ANIMATION_FILES[h % ANIMATION_FILES.length];
}

const activeCells = new Map(); // "col_row" -> { el, anim }

function createCell(col, row, key) {
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
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: `animations/${fileForTile(col, row)}`,
  });

  activeCells.set(key, { el, anim });
}

function destroyCell(key) {
  const data = activeCells.get(key);
  if (!data) return;
  data.anim.destroy();
  data.el.remove();
  activeCells.delete(key);
}

let ticking = false;

function updateVisibleTiles() {
  ticking = false;

  const scrollLeft = viewport.scrollLeft;
  const scrollTop = viewport.scrollTop;
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const buffer = 1; // extra ring of tiles rendered just outside the viewport

  const colStart = Math.max(0, Math.floor(scrollLeft / PITCH) - buffer);
  const colEnd = Math.min(TOTAL - 1, Math.ceil((scrollLeft + vw) / PITCH) + buffer);
  const rowStart = Math.max(0, Math.floor(scrollTop / PITCH) - buffer);
  const rowEnd = Math.min(TOTAL - 1, Math.ceil((scrollTop + vh) / PITCH) + buffer);

  const needed = new Set();

  for (let col = colStart; col <= colEnd; col++) {
    for (let row = rowStart; row <= rowEnd; row++) {
      const key = `${col}_${row}`;
      needed.add(key);
      if (!activeCells.has(key)) {
        createCell(col, row, key);
      }
    }
  }

  for (const key of Array.from(activeCells.keys())) {
    if (!needed.has(key)) {
      destroyCell(key);
    }
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateVisibleTiles);
  }
}

viewport.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateVisibleTiles);

// Start centered on the middle tile of the world.
function centerView() {
  viewport.scrollLeft = CENTER * PITCH - viewport.clientWidth / 2 + CELL / 2;
  viewport.scrollTop = CENTER * PITCH - viewport.clientHeight / 2 + CELL / 2;
  updateVisibleTiles();
}

centerView();
