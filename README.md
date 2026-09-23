# Exotic Nutrition: Creative Review

A public, single-page review site for the Exotic Nutrition Podcast video ad series.
Performance copy up top, then the current episode's video, dark background throughout,
minimal design. Past episodes live in an archive strip at the bottom; clicking one swaps
the video and copy above without leaving the page.

Anyone with the link can view this page; there's no password.

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
   `intro.performance` can be `null` for an episode that hasn't launched yet, since there's
   no performance data to report; the paragraph hides itself when absent.

## One-time setup after deploy

Add this in the Vercel project's **Settings > Environment Variables** if needed, then redeploy:

| Variable | Required? | What it does |
|---|---|---|
| `YOUTUBE_ID_EP3` | No | Overrides Episode 3's YouTube video ID without editing code. |

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
- `api/content.js`: returns the episodes array
- `api/_episodes.js`: the episode data (current plus archive)
- `api/_auth.js`, `api/feedback.js`: unused leftovers from an earlier password-gated,
  approve/feedback version of this page; safe to ignore or delete
