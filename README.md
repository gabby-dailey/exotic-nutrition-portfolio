# Exotic Nutrition: Creative Review

A gated, single-page review site for the Exotic Nutrition Podcast video ad series.
Performance copy up top, then the current episode's video, dark background throughout,
minimal design. Past episodes live in an archive strip at the bottom; clicking one swaps
the video and copy above without leaving the page.

## Adding a new episode

Edit `api/_episodes.js`:

1. Flip the current episode's `current: true` to `current: false`.
2. Add a new episode object at the top of the array with `current: true`.
3. Video can be hosted two ways:
   - `{ type: 'youtube', youtubeId: '...' }`, embedded via the YouTube IFrame Player API
   - `{ type: 'file', src: '/videos/your-file.mp4' }`, a self-hosted file committed into the
     `videos/` folder and served as a plain `<video>` element (no third-party branding or
     overlay, full playback control)
4. Fill in `intro.performance`, `intro.personal`, and `intro.watch` with the real copy for
   that episode. Never fill these with placeholder text; wait for the actual copy.

## One-time setup after deploy

Add these in the Vercel project's **Settings > Environment Variables**, then redeploy:

| Variable | Required? | What it does |
|---|---|---|
| `YOUTUBE_ID_EP3` | No | Overrides Episode 3's YouTube video ID without editing code. |
| `ACCESS_CODE` | No | Defaults to `amg-exotic-creative`. Set this to rotate the password without redeploying code. |
| `SESSION_SECRET` | No | Defaults to a fallback string. Set any random value for slightly stronger session tokens. |

## How the gate works

The page always serves the same static shell, but the episode data (including revenue and
ROAS figures) is only returned by `/api/content` after a correct access code sets a session
cookie via `/api/login`, so none of that is visible in page source before login.

## Video playback

For a YouTube episode: clicking the play mark starts the video via the YouTube IFrame Player
API, so it plays with sound from a real click.

For a self-hosted file episode: it plays through the browser's own native video controls,
no custom play button needed.

Either way, once playing, an `IntersectionObserver` at `threshold: 1.0` pauses it whenever
any edge scrolls out of view and resumes it once all four edges are back on screen.

## Local structure

- `index.html`, `styles.css`, `app.js`: the static page
- `videos/`: self-hosted episode video files
- `api/login.js`: validates the access code, sets the session cookie
- `api/content.js`: returns the episodes array, gated by the session cookie
- `api/_episodes.js`: the episode data (current plus archive)
- `api/feedback.js`: unused for now (the approve/feedback section was removed); left in place in case it's wired back up later
