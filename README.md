# Piano Coach

Learn to play your baby grand piano using your iPhone or iPad. Piano Coach listens through the microphone, shows which keys to press on an on-screen keyboard, and guides you through songs one note at a time — including simplified Muse piano intros.

## Features

- **Microphone note detection** — hears which key you press and confirms you're on the right note
- **Piano calibration (Phase A)** — one-time audio walkthrough: play white keys then black keys; saved permanently on your device
- **Camera keyboard map (Phase B)** — photo + tap your keyboard edges; overlays show which real key to play
- **Guided practice mode** — highlights the next key, shows finger numbers, advances on correct input
- **Song library** — Twinkle Twinkle, Ode to Joy, plus simplified Muse piano intros (Madness, Space Dementia, Bliss, New Born)
- **Installable PWA** — add to iPhone/iPad home screen for a native-like experience

## Calibrate your piano (recommended)

Before your first practice session:

1. Tap **Calibrate piano** on the home screen
2. **Audio (Step 1):** Play each white key left to right, then each black key. The mic records your piano's exact pitch for each key.
3. **Camera (Step 2):** Capture a photo looking down at the keys, tap the leftmost and rightmost keys, then the front edge. Select which notes they are.
4. Tap **Save** — calibration persists in your browser's local storage on that iPad/iPhone.

After calibration, note detection uses your piano's tuning instead of generic pitch tables, and the camera view shows glowing dots on your real keys during practice.

## Use on your iPad (no Mac required)

**Live app:** [https://purchio.github.io/excursion/](https://purchio.github.io/excursion/)

1. Open that link in **Safari** on your iPad (not Chrome)
2. When prompted, allow **microphone** and **camera** access
3. Tap **Share → Add to Home Screen** for a full-screen app icon
4. Tap **Calibrate piano** before your first session

The app is hosted on GitHub Pages with HTTPS, which iOS requires for mic and camera. After the first deploy, it may take 1–2 minutes to go live.

### One-time GitHub setup (repo owner only)

If the live link shows a 404, enable Pages in the repo:

1. GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `master` or re-run the **Deploy to GitHub Pages** workflow

## Local development (Mac only)

```bash
npm install
npm run dev:local
```

Open the local URL on your iPhone or iPad (same Wi‑Fi network) for testing changes before deploy.

## How to practice

1. **Calibrate your piano** first (one-time, ~2 minutes)
2. Place your iPad or iPhone where the microphone can hear the piano (on the music desk works well)
3. Choose a song — start with *Twinkle Twinkle* if you're brand new
4. Tap **Start practice**
5. Play each highlighted note; the app turns green when you're correct
6. Enable the camera (📷) to see glowing dots on your real keys (after camera calibration)

## Tech stack

- React 19 + TypeScript + Vite
- Web Audio API for real-time pitch detection (autocorrelation)
- MediaDevices API for microphone and rear camera
- PWA via vite-plugin-pwa

## Limitations (v0.2)

- **Microphone-based detection** works best in a quiet room, close to the piano; calibration improves accuracy significantly
- **Camera map** uses geometric key layout from your taps — very accurate for overhead views, less so if the angle is steep
- **Song catalog** is hand-authored simplified arrangements, not full transcriptions
- **iOS requires HTTPS** for mic/camera in production (localhost works for dev)

## Roadmap ideas

- [ ] Import MIDI files for any song
- [ ] Left-hand / both-hands modes
- [ ] Metronome and tempo control
- [x] Audio calibration wizard
- [x] Camera keyboard map with key overlays

## License

MIT
