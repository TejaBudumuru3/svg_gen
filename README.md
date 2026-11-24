# Science Diagram Reviewer

A Next.js application that prompts Gemini to generate animated SVG science diagrams for GCSE topics, validates them in code, and provides a review interface.

Live app: (add link)

## How to run it

Clone the repository and install the dependencies:

```bash
npm install
```

Set up your environment variables. Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

You can get a free Gemini API key from https://aistudio.google.com/api-keys. The `.env` file is ignored by git and will never be committed.

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the review dashboard. The five saved results load immediately from `results.json` without making any API calls.

To run the offline generation script and regenerate `results.json`:

```bash
npx tsx app/scripts/generate-all-concepts.ts
```

This script processes each concept, saves the SVG files into an `output/` folder, and writes the benchmark results to `results.json`.

## Results

| Concept | Result | Cost (USD) | Retries |
|---|---|---|---|
| Pythagoras' theorem | Pass | $0.0328 | 0 validation, 0 API |
| Parts of a circle | Pass | $0.0234 | 0 validation, 0 API |
| Series circuit | Pass | $0.0356 | 0 validation, 0 API |
| Photosynthesis | Pass | $0.0272 | 0 validation, 0 API |
| States of matter | Pass | $0.0369 | 0 validation, 0 API |

Cost is estimated by multiplying token counts from the API response by the prices set in `app/lib/gemini.ts`, which are $0.30 per million input tokens and $2.50 per million output tokens (including thinking tokens).

## How it works

Concepts are defined in `app/lib/concepts.ts` with descriptive text and specific diagram guidance for each topic.

In `app/lib/prompts.ts`, the system prompt sets strict layout and structure rules for Gemini. It requires an exact 800x600 viewBox, a `<title>` tag, text labels, looping animations using SMIL or CSS keyframes, and safe coordinate boundaries.

The pipeline in `app/lib/pipeline.ts` handles generation and validation. It allows up to two attempts per concept. If the first attempt fails validation, it sends the specific failure reasons and the previous SVG back to Gemini for a targeted fix.

API requests go through `app/lib/retry.ts`, which catches transient 429 and 503 errors and retries up to 3 times with growing delays (4s, 8s, 12s).

The web page in `app/page.tsx` renders the results table directly from `results.json` on initial load. Reviewers can click any diagram thumbnail to open a full modal view.

For live testing, the page includes a button that sends requests to `app/api/generate/route.ts`. The route validates title and text lengths, runs the pipeline, and returns a 502 status with an error message if the API call fails.

## Decisions storage

I chose `localStorage` to save Approve and Reject decisions along with reviewer notes.

The app does not have user accounts or login. If I used a shared database, visitors would overwrite each other's decisions. Using `localStorage` keeps reviews isolated to each reviewer's browser.

The trade-off is persistence across devices. Decisions persist through page refreshes, but clearing browser storage removes them, and reviews do not sync across different browsers.

## What failed, and how I fixed it

The generation script failed with an ENOENT error on the first run. The script tried to write SVG files into an `output/` folder that did not exist yet. I fixed this by adding `mkdirSync("output", { recursive: true })` before the loop runs.

Gemini returned 503 high demand errors during initial runs. My first retry setup only attempted two retries with 1-second delays, which was too short for the API to recover. I increased this in `app/lib/retry.ts` to 3 retries with longer waits (4s, 8s, 12s).

The viewBox check crashed on empty or malformed model output. It tried to split the SVG string on `viewBox="` without checking whether the attribute existed first. I added an upfront existence check that returns a clean failure message instead of throwing an unhandled exception.

The animation check gave false passes. It looked for the substring "animate" anywhere in the SVG, which matched class names and text labels. I tightened the check in `app/lib/validator.ts` to look specifically for `<animate `, `<animateTransform`, `<animateMotion`, `<set `, or CSS `@keyframes` with `animation:`.

The safety check missed several dangerous patterns. I expanded `checkSafeContent` with a regex to catch all `on*=` event handler attributes like `onbegin`. I also added checks for `javascript:`, `data:`, external links, and tags like `<foreignObject>` or `<image>`. While doing this, I fixed a typo in the XML namespace filter where `http://www.w3.org` was written as `ww3.org`.

The fast-xml-parser package shows a deprecation warning for `XMLValidator` in the editor. The method still works as expected, so I kept it in place for now.

## With one more day

- Check true bounding boxes with a headless browser like Playwright and `getBBox` instead of relying on regex coordinate checks.
- Replace the banned keyword list with a strict allowlist SVG sanitizer.
- Add automated verification for concept-specific labels and required keywords in the validator.
- Store decisions on a server with login and rate-limit the Generate route.

## AI tools used

- Claude (chat): planning, explaining concepts, and writing initial code drafts that I tested, rewrote, and verified.
- Gemini (gemini-3.5-flash-lite): the model that generates the animated SVGs in the pipeline.
- Antigravity: used to inspect the codebase and write this README.
- [EDIT BEFORE SENDING: add a line for Cursor if I used it for testing, otherwise delete this line]
