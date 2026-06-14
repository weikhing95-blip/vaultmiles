# VaultMiles

Singapore KrisFlyer miles converter — tracks balances across all major SG banks, scans screenshots via Claude Vision, and shows where your miles can take you.

## Tech stack

- React 18 + Vite
- Recharts (trend line chart)
- Anthropic Claude API (screenshot OCR)
- Persistent storage via `window.storage` (Claude.ai) or can be swapped for `localStorage`

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project structure

```
vaultmiles/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Full app (single file)
```

## Important: Claude API key

The app calls `https://api.anthropic.com/v1/messages` for screenshot scanning.
When running locally, you need to proxy this call — browsers block direct API calls due to CORS.

**Option A — Vite proxy (recommended for dev)**

Add to `vite.config.js`:

```js
server: {
  proxy: {
    '/api/anthropic': {
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api\/anthropic/, ''),
      headers: {
        'x-api-key': 'YOUR_API_KEY_HERE',
        'anthropic-version': '2023-06-01',
      }
    }
  }
}
```

Then change the fetch URL in `readScreenshot()` from:
```
https://api.anthropic.com/v1/messages
```
to:
```
/api/anthropic/v1/messages
```

**Option B — Backend proxy**

Build a small Express/FastAPI endpoint that adds the API key server-side and forwards requests.

## Storage

Currently uses `window.storage` (Claude.ai artifact storage API).
For standalone use, replace `loadKey` / `saveKey` with `localStorage`:

```js
async function loadKey(k, fb) {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : fb
  } catch { return fb }
}
async function saveKey(k, v) {
  localStorage.setItem(k, JSON.stringify(v))
}
```

## Backlog

- [ ] Kris+ routing toggle (haircut vs fee trade-off)
- [ ] Apple / Google Sign-In (replace mock login)
- [ ] Backend rates sync (so rates update without a redeploy)
- [ ] Push notifications for miles expiry
- [ ] React Native port for App Store / Play Store

## Conversion rates

Current as of June 2026. Edit via Settings tab in-app, or update `CATALOG` in `App.jsx`.
