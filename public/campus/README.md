# public/campus — Real campus imagery

This folder holds the college's **visual assets** — the imagery that the campus
map uses as its primary visual layer. All building data, routing, timetables
and services stay as separate interactive layers on top, so swapping the image
never touches feature code.

The app reads the base image through `CAMPUS_IMAGERY` in
[`src/data/campus.ts`](../../src/data/campus.ts).

---

## Files

| File | Purpose |
| --- | --- |
| `campus-aerial.svg` | Sample aerial placeholder, currently wired in. **Replace this with the real college photo.** |
| `README.md` | You are here. |

## Steps to swap in the real aerial photo

1. **Capture** a satellite / aerial view of the college (Google Earth, drone
   shot, or a floor-plan-style rendering of the campus layout).
2. **Crop to square** (roughly). The campus map canvas is square
   (`-6..106` on both axes) and renders the image with
   `preserveAspectRatio="xMidYMid slice"`, so non-square photos are
   centre-cropped to fit. A ~1600–2400 px square JPG/PNG/WebP works well.
3. **Save it here**, e.g. `campus-aerial.jpg`.
4. **Point the app at it** in `src/data/campus.ts`:

   ```ts
   export const CAMPUS_IMAGERY: { aerialImageUrl: string | null } = {
     aerialImageUrl: '/campus/campus-aerial.jpg', // ← your file
   }
   ```

   Tip: keep the same `campus-aerial` filename (any extension) and no code
   change is needed at all.

5. **Rebuild / refresh** — the photo is now the map's base layer, with the
   pins, labels, walkways and the highlighted shortest route overlaid on top.

> To revert to the generated vector scene (no image), set
> `aerialImageUrl: null`.

## Aligning building pins with the photo

Map coordinates run **0–100** (`x` → east, `y` → south) and map onto the image
like this:

```
x_coord = (pixelX / imageWidth)  * 112 - 6
y_coord = (pixelY / imageHeight) * 112 - 6
```

> This formula assumes the photo is **square**, which is why step 2 above says to
> crop. If you skip the square crop, the map centre-crops the photo instead
> (`preserveAspectRatio="xMidYMid slice"`), so compute the visible region first
> and offset the pixel values by the crop margins before using the formula.

- Open the photo in an editor and read the pixel position of each building.
- Convert to coordinates and update the node's `x`/`y` in
  `src/data/campus.ts` so its pin sits on the building.
- Zoom into the Explore page map afterwards to fine-tune.

The placeholder (`campus-aerial.svg`) was generated from the current node
positions, so all 18 pins line up with it out of the box. It can be
regenerated after coordinate edits with:

```bash
node scripts/generate-campus-aerial.mjs
```

(Only needed for the placeholder — the real photo needs no regeneration.)

## Building photographs

Every building has a `photos` array (a gallery) in `src/data/campus.ts`, shown
in the Explore building card with a lightbox, and as a thumbnail in Search
results. Sample placeholders live in `photos/` — three visually distinct
variants per building (`<id>-1.svg`, `<id>-2.svg`, `<id>-3.svg`), generated
from the footprint data.

To use the real photos:

1. Drop each photo into `photos/` with the same name as its placeholder
   (e.g. `photos/block-a-1.jpg`, `photos/block-a-2.jpg`) — **keep the
   placeholder filenames and the app picks them up with zero code changes**.
   Otherwise update the node's `photos` array in `src/data/campus.ts`.
2. A single photo per building works too — the gallery just hides the
   arrows and thumbnail strip.
3. Photos render with `object-fit: cover`, so any aspect ratio works.

Regenerate the placeholders (e.g. after adding/renaming buildings) with:

```bash
node scripts/generate-campus-photos.mjs
```
