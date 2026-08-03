# Exotic Nutrition — Episode 3 Creative Review

A gated, single-page review site for "Back to the Wild" (Episode 3, the rescued opossum episode).
Minimal poster + play reveal → YouTube embed → creative breakdown → feedback/approval widget
that emails gabrielle@adventureppc.com.

## One-time setup after deploy

Add these in the Vercel project's **Settings → Environment Variables**, then redeploy:

| Variable | Required? | What it does |
|---|---|---|
| `YOUTUBE_ID` | Yes, once the video is uploaded | The YouTube video ID from the unlisted URL (e.g. for `youtube.com/watch?v=abc123`, it's `abc123`). Until this is set, the page shows a "video coming soon" placeholder instead of an embed. |
| `RESEND_API_KEY` | Yes, to receive email notifications | Sign up free at [resend.com](https://resend.com), create an API key, paste it here. Without it, feedback/approvals still work and show "Received" to the client, but no email is sent (check the Vercel function logs instead). |
| `RESEND_FROM` | No | Defaults to `Exotic Nutrition Review <onboarding@resend.dev>`. Resend's shared `onboarding@resend.dev` sender can only deliver to the email address on your Resend account. If gabrielle@adventureppc.com isn't that address, verify a sending domain in Resend and set this to something like `Exotic Nutrition Review <review@adventureppc.com>`. |
| `ACCESS_CODE` | No | Defaults to `amg-exotic-creative`. Set this to rotate the password without redeploying code. |
| `SESSION_SECRET` | No | Defaults to a fallback string. Set any random value for slightly stronger session tokens. |

## How the gate works

The page always serves the same static shell, but the actual video ID and episode
breakdown text are only returned by `/api/content` after a correct access code sets a
session cookie via `/api/login` — so the creative details aren't visible in page source
before login.

## Local structure

- `index.html`, `styles.css`, `app.js` — the static page
- `api/login.js` — validates the access code, sets the session cookie
- `api/content.js` — returns video ID + episode breakdown, gated by the session cookie
- `api/feedback.js` — receives notes/approval, emails via Resend, always confirms to the client
