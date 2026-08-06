/*
  Animation Gallery
  ------------------
  Every animation appears exactly once — no repeats. The grid is sized to
  fit however many files are listed in ANIMATION_FILES, arranged as close
  to a square as possible, and the page opens centered on the grid.

  To use your own art:
  1. Drop your exported .json animation files into the /animations folder.
  2. List their filenames in ANIMATION_FILES below (order doesn't matter).
  The grid automatically resizes to fit however many you list — add more
  any time and the layout grows to match, still with no repeats.
*/

const ANIMATION_FILES = [
  "enterwithpoints.json",
  "beehive-looping.json",
  "doublepoints.json",
  "rewards.json",
  "takeaction.json",
  "thisbetterwork.json",
  "bee-flower.json",
];

const CELL = 300; // tile size in px
const GAP = 24; // space between tiles
const PITCH = CELL + GAP; // distance between tile origins

const N = ANIMATION_FILES.length;
const COLS = Math.max(1, Math.ceil(Math.sqrt(N)));
const ROWS = Math.max(1, Math.ceil(N / COLS));

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
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: `animations/${ANIMATION_FILES[index]}`,
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
  const colEnd = Math.min(COLS - 1, Math.ceil((scrollLeft + vw) / PITCH) + buffer);
  const rowStart = Math.max(0, Math.floor(scrollTop / PITCH) - buffer);
  const rowEnd = Math.min(ROWS - 1, Math.ceil((scrollTop + vh) / PITCH) + buffer);

  const needed = new Set();

  for (let col = colStart; col <= colEnd; col++) {
    for (let row = rowStart; row <= rowEnd; row++) {
      const index = row * COLS + col;
      if (index >= N) continue; // grid has trailing empty cells if N isn't a perfect rectangle
      const key = `${col}_${row}`;
      needed.add(key);
      if (!activeCells.has(key)) {
        createCell(col, row, index);
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

// Start centered on the middle of the grid.
function centerView() {
  viewport.scrollLeft = worldWidth / 2 - viewport.clientWidth / 2;
  viewport.scrollTop = worldHeight / 2 - viewport.clientHeight / 2;
  updateVisibleTiles();
}

centerView();
