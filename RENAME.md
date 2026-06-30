# Renaming the repo to `piano-coach`

The codebase is already configured for the new name. One manual step in GitHub is required.

## 1. Rename on GitHub (you do this)

1. Open [github.com/Purchio/excursion/settings](https://github.com/Purchio/excursion/settings)
2. Under **Repository name**, change `excursion` → `piano-coach`
3. Click **Rename**

GitHub automatically redirects the old URL (`Purchio/excursion`) to the new one.

## 2. What updates automatically

After rename + the next deploy:

| Before | After |
|---|---|
| `github.com/Purchio/excursion` | `github.com/Purchio/piano-coach` |
| `purchio.github.io/excursion/` | `purchio.github.io/piano-coach/` |

## 3. GitHub Pages

If Pages is set to the `gh-pages` branch, it should keep working after rename. If the live site 404s:

1. **Settings** → **Pages**
2. **Source:** Deploy from branch → `gh-pages` → `/ (root)`
3. Save and wait 1–2 minutes

## 4. Update your local clone (optional)

```bash
git remote set-url origin https://github.com/Purchio/piano-coach.git
```

## 5. iPad home screen

If you added the old URL to your home screen, remove it and re-add from:

**https://purchio.github.io/piano-coach/**
