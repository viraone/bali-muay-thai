# 🥊 Bali Muay Thai — 30-Day Training Trip Planner

A single-page site comparing Muay Thai gyms in Bali: locations, drop-in / weekly / monthly prices, links, and notes. No build step — plain HTML/CSS/JS reading from `gyms.json`.

## Run locally

```bash
python3 -m http.server 8642
# open http://localhost:8642
```

## Update gym data

Edit `gyms.json`. Each gym entry:

```json
{
  "name": "Gym Name",
  "area": "Canggu",
  "website": "https://…",
  "instagram": "https://instagram.com/…",
  "maps": "https://maps.google.com/?q=…",
  "thaiTrainers": true,
  "accommodation": false,
  "verified": true,
  "prices": {
    "dropIn":  { "idr": 300000 },
    "tenPack": { "idr": 1300000 },
    "weekly":  { "idr": 1300000 },
    "monthly": { "idr": 2900000 }
  },
  "notes": "Free text shown on the card."
}
```

Set `verified: false` for community-estimated prices (shown with `~` and a grey badge).

## Deploy to GitHub Pages

1. Create a repo on GitHub (e.g. `bali-muay-thai`).
2. Push this folder:
   ```bash
   git init && git add -A && git commit -m "Bali Muay Thai gym comparison site"
   git branch -M main
   git remote add origin https://github.com/<you>/bali-muay-thai.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. Site goes live at `https://<you>.github.io/bali-muay-thai/`.

## Data caveats

- Verified prices scraped from official gym sites Aug 2026 (Bali MMA, Soma Fight Club, Body Factory Bali).
- Other prices are community estimates — confirm via Instagram DM/WhatsApp before your trip.
- FX rate hardcoded in `app.js` (`FX_RATE`).
