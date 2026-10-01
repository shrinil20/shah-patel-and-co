# Shah Patel & Co. — scroll-film website

Apple-style scroll site for **Shah Patel & Co.** (શાહ પટેલ & કો.), tyre shop in
Naranpura, Ahmedabad. A blueprint-to-tyre film is scrubbed frame by frame as you
scroll, followed by the full homepage: services, sidewall-size decoder, reviews,
WhatsApp enquiry builder and visit details.

## Run locally

```bash
node server.js 4317
```

Then open http://localhost:4317. No build step or dependencies.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Page markup and styles |
| `main.js` | Canvas frame-scrub engine and caption timing |
| `brand.js` | Reveals, nav, sidewall decoder, WhatsApp enquiry builder |
| `frames/` | 210 WebP frames + `frames.json` manifest sliced from the film |
| `assets/film.mp4` | Source film (10 s, 1920×1080) |
| `assets/still_*.webp` | Blueprint and tyre stills used in the page sections |
| `tools/extract.html` | In-browser frame slicer (writes to `frames/` via `server.js`) |
| `server.js` | Static server with a local-only `POST /_write` endpoint for the slicer |

## Re-slicing the film

Replace `assets/film.mp4`, start the server, open `/tools/extract.html` and run
in the console:

```js
await extract(0, 210, { count: 210, width: 1400, quality: 0.74 });
await writeManifest(210, "webp");
```

Then re-time the `data-in` / `data-hold` / `data-out` caption fractions in
`index.html`.
