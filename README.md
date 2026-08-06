# Animation Gallery

A single page that opens centered on a middle tile and lets you scroll up, down, left, and right through a vast grid of `.json` animations — about 100 million tiles (10,001 × 10,001), so in practice it just keeps going. Uses [lottie-web](https://github.com/airbnb/lottie-web) to render Lottie/Bodymovin JSON files directly in the browser — no build step, no server.

Only the tiles near your current view are ever rendered (virtualized), so it stays smooth no matter how far you scroll.

Right now it's filled with 6 placeholder animations (`/animations`) so you can see it working. Swap in your own art whenever you're ready.

## Using your own animations

1. Export your art as Lottie JSON (After Effects + Bodymovin, or any tool that outputs `.json` in the Lottie format).
2. Drop the `.json` files into the `animations/` folder.
3. Open `script.js` and list your filenames in `ANIMATION_FILES`. Repeats are fine if you have fewer files than tiles — which animation lands on which tile is decided by a deterministic hash of its position, so the layout looks varied but doesn't reshuffle on reload.
4. `GRID_RADIUS` in `script.js` controls how far the world extends from the center tile in every direction (default 5000 tiles each way). `CELL` and `GAP` control tile size and spacing.

No other code changes are needed. Open `index.html` in a browser to preview locally.

## Hosting for free

Any static file host works since this is just HTML/CSS/JS. Two free options:

**GitHub Pages**
1. Create a new GitHub repo and push this folder's contents to it.
2. In the repo, go to Settings → Pages → set the source branch to `main` (root).
3. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

**Cloudflare Pages**
1. Create a free Cloudflare account, go to Workers & Pages → Create → Pages.
2. Connect your GitHub repo (or drag-and-drop this folder directly).
3. Deploy — no build command needed, it's already static.

Both are free with no bandwidth limits that matter at small/medium scale. A custom domain (if you want `yourname.com` instead of the default subdomain) typically costs $10–15/year from any registrar, but is optional.

## Notes

- Animations lazy-load and pause when off-screen, so the grid stays smooth even with lots of tiles.
- Tile size is fixed at 300×300px in `style.css` — change `.cell` and the `grid-template-columns` value if you want a different size.
