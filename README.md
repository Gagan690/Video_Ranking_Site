# RankingTheMomentsEditor

RankingTheMomentsEditor is a web-based prototype for creating short-form ranked video edits. Users can paste video links, add titles, arrange moments in ranking order, customize the preview style, simulate an export, and download a generated project payload.

The current version is a static frontend prototype built with HTML, CSS, and JavaScript. It demonstrates the full product workflow and UI behavior, but video downloading, rendering, and MP4 generation are simulated until a backend is connected.

## Features

- Landing page with hero, CTA, features, examples, and FAQ sections.
- Ranking workspace with preview/editor on the left and video entries on the right.
- Video URL and title input.
- Multiple video entries.
- Ranking controls with drag-and-drop, move up, move down, and remove.
- Shorts-style preview layout inspired by ranked moment videos.
- Fixed black title band in the top 20% of the preview.
- Vertical numbered ranking list over the video.
- Active video title appears beside only the currently playing rank.
- Aspect ratio selector:
  - 9:16
  - 1:1
  - 4:5
  - 16:9
  - Custom
- Crop mode selector:
  - Crop-to-Fill
  - Letterbox
- Duration control.
- Typography and color controls.
- Style presets:
  - Neon
  - Minimal
  - Bold Sports
  - Cinematic
- Simulated export stages:
  - Queued
  - Processing
  - Rendering
  - Finalizing
  - Ready
- Responsive layout for desktop and mobile.

## Project Structure

```text
RM1/
+-- index.html    # Main page markup and editor layout
+-- styles.css    # Dark UI, responsive layout, preview styling
+-- app.js        # App state, ranking logic, preview behavior, export simulation
+-- README.md     # Project documentation
```

## How to Run

No installation is required.

Open `index.html` directly in a browser:

```text
C:\Users\Lenovo\OneDrive\Documents\FinalProjects\RM1\index.html
```

You can also serve the folder with any static server if you prefer.

## How to Use

1. Open the website.
2. Click `Ranking the Moments` or `Open Editor`.
3. Paste a video URL.
4. Add a title for the video.
5. Click `Import`.
6. Add more videos if needed.
7. Reorder videos using drag-and-drop or the move buttons.
8. Adjust aspect ratio, crop mode, duration, typography, colors, and preset.
9. Click `Play Preview` to cycle through the ranking list.
10. Click `Export MP4` to simulate rendering.
11. Click `Download final file` when the status becomes ready.

## Current Prototype Behavior

This prototype does not download or render real videos yet. The import flow validates that a URL looks valid, then stores the entry locally in browser memory.

The export flow is simulated. When export completes, the download link creates a JSON file containing the current `VideoEntry`, `EditorSettings`, and `ExportJob` data. This is a placeholder for a future MP4 download URL.

## Data Models

### VideoEntry

```js
{
  id,
  url,
  title,
  rank,
  trimStart,
  trimEnd,
  duration,
  overlaySettings
}
```

### EditorSettings

```js
{
  aspectRatio,
  cropMode,
  outputDuration,
  exportFormat,
  theme
}
```

### ExportJob

```js
{
  status,
  progress,
  outputUrl
}
```

## Recommended Production Architecture

The intended production architecture is:

- Frontend: Next.js and React
- Backend: API layer for imports, project saves, and export jobs
- Queue: Redis-backed render queue
- Renderer: FFmpeg or Remotion
- Database: PostgreSQL
- Storage: Cloudflare R2 or AWS S3
- Deployment:
  - Frontend on Vercel
  - Backend workers on Render, Fly.io, or Railway

## Environment Variables for Production

```env
DATABASE_URL=
REDIS_URL=
STORAGE_BUCKET=
VIDEO_RENDER_API_KEY=
```

## Production Import Pipeline

1. User submits a video URL.
2. Backend validates the URL.
3. Backend downloads or fetches the video source.
4. Video is cached in temporary storage.
5. Thumbnail and metadata are generated.
6. Video is added to the project timeline.
7. User ranks and styles the clips.
8. Export job is queued.
9. Renderer produces the final MP4.
10. Final file is stored and returned through a signed download URL.

## Known Limitations

- No real YouTube or Shorts downloading yet.
- No real video preview frames yet.
- No real FFmpeg or Remotion rendering yet.
- No persistent database or saved projects yet.
- Download currently returns a JSON project payload, not an MP4.
- Browser storage is not used, so entries reset when the page reloads.

## Next Steps

1. Convert the static prototype into a Next.js app.
2. Add persistent project state.
3. Build an API route for URL validation and video import.
4. Add FFmpeg or Remotion rendering.
5. Store imported media and exported videos in R2 or S3.
6. Add authentication and user project history.
7. Replace simulated export with real queued render jobs.
