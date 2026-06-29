# Piano Coach

Learn to play your baby grand piano using your iPhone or iPad. Piano Coach listens through the microphone, shows which keys to press on an on-screen keyboard, and guides you through songs one note at a time — including simplified Muse piano intros.

## Features

- **Microphone note detection** — hears which key you press and confirms you're on the right note
- **Guided practice** — highlights the next key and tells you which finger to use
- **Song library** — beginner classics plus Muse piano intros (Madness, Space Dementia)
- **Camera view** — optional overhead camera to watch your hands while you play
- **Installable PWA** — add to your iPhone/iPad home screen for a full-screen app experience

## Quick start

```bash
npm install
npm run dev
```

Open the local URL on your iPhone or iPad (same Wi‑Fi network). For microphone and camera access, use **HTTPS** in production or Safari on a local network during development.

### Install on iPhone/iPad

1. Open the app in **Safari**
2. Tap the Share button → **Add to Home Screen**
3. Launch from your home screen like a native app

## How to practice

1. Place your iPad or iPhone where the microphone can hear the piano (on the music desk works well)
2. Choose a song — start with *Twinkle Twinkle* if you're brand new
3. Tap **Start practice**
4. Play each highlighted note; the app turns green when you're correct
5. Optionally enable the camera (📷) to see your hands from above

## Tech stack

- React 19 + TypeScript + Vite
- Web Audio API for real-time pitch detection (autocorrelation)
- MediaDevices API for microphone and rear camera
- PWA via vite-plugin-pwa

## Limitations (v0.1)

- **Microphone-based detection** works best in a quiet room, close to the piano
- **Camera finger tracking** is not yet implemented — the camera is a visual aid only; v2 could add ML-based key detection
- **Song catalog** is hand-authored simplified arrangements, not full transcriptions
- **iOS requires HTTPS** for mic/camera in production (localhost works for dev)

## Roadmap ideas

- [ ] Import MIDI files for any song
- [ ] Left-hand / both-hands modes
- [ ] Metronome and tempo control
- [ ] ML camera overlay to detect which physical key is pressed
- [ ] Spaced repetition for tricky passages

## License

MIT
