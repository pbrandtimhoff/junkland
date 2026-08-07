
# Animation Gallery

A single page with a sticky "Say hello" contact bar at the top, and below it a grid of `.json` animations you can scroll up, down, left, and right through. Every animation appears exactly once — the grid sizes itself to fit however many files you list, no repeats. Uses [lottie-web](https://github.com/airbnb/lottie-web) to render Lottie/Bodymovin JSON files directly in the browser — no build step, no server.

Only the tiles near your current view are rendered (virtualized), so it stays smooth even as you add more art.

Right now it shows 7 of your animations: `enterwithpoints`, `beehive-looping`, `doublepoints`, `rewards`, `takeaction`, `thisbetterwork`, and `bee-flower`.

## Using your own animations

1. Export your art as Lottie JSON (After Effects + Bodymovin, or any tool that outputs `.json` in the Lottie format).
2. Drop the `.json` files into the `animations/` folder.
3. Open `script.js` and list your filenames in `ANIMATION_FILES`. The grid automatically resizes to fit however many you list, arranged close to a square, with each animation shown exactly once.
4. `CELL` and `GAP` in `script.js` control tile size and spacing.

No other code changes are needed.

## Contact bar

The "Say hello" bar at the top is set in `index.html` — search for `mailto:` and change the email address or wording there directly.

## Previewing locally

Don't just double-click `index.html` — browsers block a page from loading local `.json` files that way, so the animations won't appear (the page will show a warning banner if this happens). Instead, serve the folder with a quick local server:
