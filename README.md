# Exotic Nutrition — Episode 3 Creative Review

A gated, single-page review site for "Back to the Wild" (Episode 3, the rescued opossum episode).
Performance copy up top → YouTube video, dark background throughout, minimal design.

## One-time setup after deploy

Add these in the Vercel project's **Settings → Environment Variables**, then redeploy:

| Variable | Required? | What it does |
|---|---|---|
| `YOUTUBE_ID` | Already set (`oBGqb1kB-i4`) | The YouTube video ID from the unlisted URL. Edit the fallback in `api/content.js` or set this env var to override. |
| `ACCESS_CODE` | No | Defaults to `amg-exotic-creative`. Set this to rotate the password without redeploying code. |
| `SESSION_SECRET` | No | Defaults to a fallback string. Set any random value for slightly stronger session tokens. |

## How the gate works

The page always serves the same static shell, but the intro copy (including revenue/ROAS
figures) and video ID are only returned by `/api/content` after a correct access code sets
a session cookie via `/api/login` — so none of that is visible in page source before login.

## Video playback

Clicking the play mark starts the video via the YouTube IFrame Player API (so it plays with
sound from a real click). Once playing, an `IntersectionObserver` at `threshold: 1.0` pauses
it whenever any edge scrolls out of view and resumes it once all four edges are back on screen.

## Local structure

- `index.html`, `styles.css`, `app.js` — the static page
- `api/login.js` — validates the access code, sets the session cookie
- `api/content.js` — returns the video ID + intro copy, gated by the session cookie
- `api/feedback.js` — unused for now (the approve/feedback section was removed); left in place in case it's wired back up later
