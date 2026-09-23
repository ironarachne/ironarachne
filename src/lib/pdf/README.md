# PDF

This library builds **PDF documents** with jsPDF: a plain text document, and a science-fiction
character sheet layout that the SWN and Uncharted Worlds generators draw into.
It also publishes a project's saved artifacts as a print-friendly book.

The game-system libraries own their own sheets — `render_adnd_character_pdf` and
`render_dcc_character_pdf` live with AD&D and DCC — and use the primitives here rather than
reimplementing layout.

## Features

- **Text documents** — `buildTextPdf(title, body)` returns a `Blob`; `downloadTextPdf` saves one.
- **Project books** — `buildProjectPdfResult(projectId)` reads saved artifacts, uses each kind's
  reader-facing presentation, and renders a white-page supplement with a cover, contents, images,
  running heads, and folios. It reports incomplete entries when a saved result cannot be printed.
  `downloadProjectPdf(projectId)` saves the book and returns those warnings for the UI.
- **Sci-fi sheet layout** — a small drawing toolkit over jsPDF:
  - `createSciFiSheetPage` and `createSciFiSheetColumns` set up the page and its column geometry.
  - `drawSciFiFrame`, `drawSciFiHeader`, `drawSciFiSectionTitle`, `drawSciFiMetricStrip`,
    `drawSciFiStatRow`, `drawSciFiWrappedText`, `drawSciFiBulletList`, and
    `drawSciFiColumnSection` draw into it.
  - `remainingColumnHeight` reports how much room is left in a column, so a section can decide
    whether it still fits.
  - `buildLandscapeSciFiPdf` assembles a finished landscape sheet.

## Usage

```typescript
import { buildTextPdf, downloadTextPdf } from '$lib/pdf';

const blob = await buildTextPdf('Character', body);
await downloadTextPdf('Character', body, 'character.pdf'); // title, body, filename
```

Everything here is async and browser-only: jsPDF is loaded dynamically so the (large) library is not
pulled into pages that never export anything. Keep it that way — a static import would put the PDF
code in every bundle that touches this library.

See [`$lib/download`](../download/README.md) for saving a `Blob` the user should keep.
