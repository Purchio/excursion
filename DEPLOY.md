# Deploy checklist (one-time)

Our calibration app is built automatically on every push to `master`.

## Get it live on your iPad (pick one)

### Option A — GitHub Pages (recommended, free)

1. Open https://github.com/Purchio/excursion/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` → `/ (root)` → Save
4. Wait 2 minutes, then open on iPad: **https://purchio.github.io/excursion/**

You should see **Twinkle Twinkle**, **Calibrate piano**, and Muse songs.

### Option B — Replace piano-coach.vercel.app

The current `piano-coach.vercel.app` is a **different app** (49-track MIDI library).

To put **our** app on that URL:

1. Open https://vercel.com/dashboard
2. Open the **piano-coach** project → **Settings** → **Git**
3. Connect to **Purchio/excursion** repo, branch **master**
4. Redeploy

This replaces the MIDI library app with our mic/camera calibration app.

### Option C — New Vercel URL

1. https://vercel.com/new → Import **Purchio/excursion**
2. Deploy → use the new `*.vercel.app` URL on your iPad
