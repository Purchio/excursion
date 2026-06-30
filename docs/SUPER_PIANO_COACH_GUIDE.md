# Super Piano Coach — Your Complete Guide

*Everything we figured out together: resources, songs, apps, and how to use them on your Knabe.*

**Last updated:** June 2026  
**Your app (ours):** https://purchio.github.io/excursion/  
**GitHub repo:** https://github.com/Purchio/excursion

---

## Table of contents

1. [Two different apps (important!)](#two-different-apps-important)
2. [What our app does](#what-our-app-does)
3. [Free MIDI resources you found](#free-midi-resources-you-found)
4. [How we found and bundled Satisfaction](#how-we-found-and-bundled-satisfaction)
5. [MIDI vs MP3 / Spotify](#midi-vs-mp3--spotify)
6. [How to use the app on your iPad](#how-to-use-the-app-on-your-ipad)
7. [Practice modes](#practice-modes)
8. [Pattern practice (loop until you get it)](#pattern-practice-loop-until-you-get-it)
9. [Calibrating your piano](#calibrating-your-piano)
10. [What we built over time](#what-we-built-over-time)
11. [Quick links cheat sheet](#quick-links-cheat-sheet)

---

## Two different apps (important!)

Early on we discovered there are **two different piano coach apps**. Easy to mix them up:

| | **Our app (Super Piano Coach)** | **The other app** |
|---|---|---|
| **URL** | https://purchio.github.io/excursion/ | https://piano-coach.vercel.app/ |
| **Codebase** | GitHub: `Purchio/excursion` | Different project (not our repo) |
| **Best at** | Hearing your **real piano** via mic; camera key overlay; hand planning | BPM control, pattern picker, falling-note scroll, huge MIDI library feel |
| **You play on** | Your **Knabe** — iPad listens | Often screen keyboard or reference playback |

**You loved features from both.** We merged the best ideas into *our* app: BPM, pattern loops, hand planning, MIDI import, mic verify — without the chaotic flashing wrong-key banners.

---

## What our app does

**Super Piano Coach** helps you learn on your **real upright piano** (Wm. Knabe & Co.) using an iPhone or iPad:

- **Hand planning** — shows where left and right hands go *now* and *coming up* (like how pianists actually think, not Guitar Hero blocks falling from the sky)
- **MIDI playback** — synthesized piano audio so you can hear the song
- **BPM control** — slow songs down (try 50–60 BPM while learning)
- **Pattern practice** — pick a phrase, loop it over and over until it sticks
- **Mic verify** (optional) — iPad listens and checks keys on your real piano
- **Camera overlay** — maps highlights onto your real keyboard (after calibration)
- **MIDI import** — load `.mid` files from UCI, GitHub, or anywhere
- **Built-in songs** — Twinkle, Ode to Joy, Muse piano intros

---

## Free MIDI resources you found

These are all **legitimate open sources** for practice MIDI files. Our app can import any of them via **Load MIDI file**.

### 1. UCI Stones collection (where Satisfaction lives)

- **Index:** https://ics.uci.edu/~dhirschb/midi/stones/index.html  
- **Curator:** Dan Hirschberg, UC Irvine Computer Science  
- **What's there:** Rolling Stones songs as `.mid` files — Satisfaction, Paint It Black, Angie, Start Me Up, Brown Sugar, Ruby Tuesday, and more.

**How to use:** Open the index in Safari → tap a song link → download/save the `.mid` → in our app tap **Load MIDI file**.

### 2. UCI Rock collection

- **Index:** https://ics.uci.edu/~dhirschb/midi/rock/index.html  
- **What's there:** Rock artists beyond the Stones — same idea, free `.mid` files.

### 3. free-midi-chords (GitHub)

- **Repo:** https://github.com/ldrolez/free-midi-chords  
- **What's there:** Chord progressions as MIDI — great for practicing shapes and fingerings, not full songs.

### 4. Lakh MIDI Dataset (LMD)

- **Project:** https://colinraffel.com/projects/lmd/  
- **What's there:** 170,000+ MIDI files (~10 GB total) — too big to bundle in an app, but you can download **individual** `.mid` files and import them.

### 5. Other UCI MIDI pages (same author)

Dan Hirschberg hosts more collections at UCI. The Stones and Rock indexes are the ones we used most for your rock-piano playlist vibe.

---

## How we found and bundled Satisfaction

### Your discovery

You were looking for rock piano covers (like the Spotify "Satisfaction" instrumental vibe) and found:

> https://ics.uci.edu/~dhirschb/midi/stones/index.html

On that page, the link text is **"Satisfaction"** and the actual file is:

```
Satisfaction.mid   ← capital S (important!)
```

### The gotcha we hit

- Wrong guess: `satisfaction.mid` (lowercase) → **403 Forbidden**
- Correct file: **`Satisfaction.mid`** → real MIDI (format 1, 12 tracks, ~52 KB)

### In our app today

- **Bundled** at: `public/midi/Satisfaction.mid` in the repo  
- **In the app:** Song picker → **MIDI library** tab → **(I Can't Get No) Satisfaction**  
- **Note:** Full-band MIDI has many tracks. The app simplifies to piano-range notes and one note per hand per moment so it's learnable on a real piano.

### If you want more Stones songs

1. Open https://ics.uci.edu/~dhirschb/midi/stones/index.html on iPad  
2. Tap e.g. **Paint it Black**, **Start Me Up**, **Angie**  
3. Save the `.mid` file  
4. In Super Piano Coach → **Load MIDI file**

---

## MIDI vs MP3 / Spotify

| Format | What it is | Works in our app? |
|--------|------------|-------------------|
| **MIDI** (`.mid`) | Instructions: which notes, when, how long | ✅ Yes — playback, hand plan, patterns, fingers |
| **MP3 / Spotify** | Recorded audio only | ❌ Can't auto-extract keys. Use for **listening** while you practice from MIDI |

You **cannot** paste a Spotify playlist URL into the app. Find or download a **MIDI** version of the song instead (UCI collections are perfect for classic rock).

---

## How to use the app on your iPad

### Install / open

1. Open **Safari** (not Chrome) → https://purchio.github.io/excursion/  
2. Optional: **Share → Add to Home Screen** for an app-like icon  
3. If the app looks old: close the tab, reopen in Safari, or use a private tab (PWA cache)

### Mic permission

- Safari will ask for microphone when you start practice  
- If no popup: **Settings → Safari → Microphone → Allow**  
- Open via Safari first after adding to home screen (iOS quirk)

### iPad placement

- **12–18 inches back** from the keys on the music desk works better than right on the keys  
- Mic hears the **piano**, not the iPad speakers (speaker mutes when mic verify is on)

---

## Practice modes

### Guided mode

- **Best for:** Beginners, Twinkle, Ode to Joy  
- **How it works:** One note at a time, yellow highlight, mic checks each key  
- **No flashing "wrong key" banners** — keyboard shows what the mic heard (purple) vs target (yellow)

### Play along mode

- **Best for:** Muse intros, Satisfaction, imported MIDI  
- **How it works:** Song plays (or you follow hand plan), BPM adjustable, optional mic verify  
- **Hand plan:** "Play now" cards for each hand + "Coming up" trail

**Switch modes** anytime with **Switch to guided** / **Switch to play along**.

---

## Pattern practice (loop until you get it)

Inspired by the pattern picker on piano-coach.vercel.app — now in **our** app too.

### How to open

1. Pick a song → **Play along**  
2. Tap **Practice patterns**  
3. See **LEFT HAND** and **RIGHT HAND** grids (Pattern A, B, C…)  
4. Tap a pattern → **loop page** — that phrase repeats forever  
5. **Slow BPM** (50–60) until easy, then speed up  
6. Checkbox to mark pattern **done** (saved on your device)

### Tips

- Pick one small pattern, loop 8–20 times, then the next  
- Same workflow pros use: isolate hard measures, drill, then put the song back together

---

## Calibrating your piano

Your **Knabe** has its own sound. Calibration makes mic detection much better.

1. Tap **Calibrate** (top right)  
2. **Audio:** play middle C octave keys (C4–B4), save each key  
3. **Camera (optional):** photo of keyboard, tap key corners for overlay  

Do audio calibration first — biggest improvement for note detection.

---

## What we built over time

Rough chronology of our sessions:

| Phase | What happened |
|-------|----------------|
| **Start** | Hand-authored songs, mic + camera calibration, guided note-by-note practice |
| **Confusion** | Realized piano-coach.vercel.app was a *different* app, not ours |
| **Super Piano Coach** | MIDI import, Satisfaction bundled, falling notes (later removed) |
| **Calm UX** | Removed flashing wrong-key UI; added BPM control |
| **Hand planning** | Replaced distracting falling notes with "play now / coming up" |
| **shadcn/ui** | Cleaner cards, tabs, alerts, buttons |
| **Pattern loops** | Practice patterns picker + infinite loop per phrase |

### Tech stack (for reference)

- React + TypeScript + Vite PWA  
- Tone.js + @tonejs/midi for playback and parsing  
- Web Audio mic pitch detection  
- Deployed to GitHub Pages (`gh-pages` branch)

---

## Quick links cheat sheet

### Apps

- **Our app:** https://purchio.github.io/excursion/  
- **Other app (reference):** https://piano-coach.vercel.app/

### MIDI downloads

- **Stones (Satisfaction!):** https://ics.uci.edu/~dhirschb/midi/stones/index.html  
- **Rock:** https://ics.uci.edu/~dhirschb/midi/rock/index.html  
- **Chords:** https://github.com/ldrolez/free-midi-chords  
- **Huge library:** https://colinraffel.com/projects/lmd/

### Satisfaction file (direct)

- Page link: `Satisfaction` on Stones index  
- Filename: **`Satisfaction.mid`** (capital S)  
- Already bundled in our app under **MIDI library**

### Repo

- https://github.com/Purchio/excursion

---

## Your setup summary

| Item | Detail |
|------|--------|
| Piano | Wm. Knabe & Co. upright |
| Device | iPhone / iPad |
| Goal | Rock piano covers, Muse, Satisfaction, finger guidance |
| Best workflow | Pattern loop at low BPM → play along with hand plan → optional mic verify on real keys |

---

*Happy practicing on the Knabe. 🎹*
