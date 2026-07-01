# CampusKart — Frontend (Vite)

Phase 6 output: the CDN/Babel-in-browser frontend (`frontend/`) migrated to a
proper Vite build. Same app, same features, same visual output — different
build tool. No component logic, styling, or backend contract changed.

## What changed

- **Build tool**: CDN `<script>` tags + in-browser Babel → Vite + esbuild/Rollup.
- **Modules**: implicit globals (`window.X` via `app-loader.js`) → explicit
  ES `import`/`export` in every file.
- **Routing**: hand-rolled `window.location.hash` + `page` state in
  `AppContext` → `react-router-dom` (`HashRouter`, `<Routes>`/`<Route>`,
  `useNavigate`, `useSearchParams`, `useParams`). URLs are still hash-based
  (`#/marketplace`, `#/listing/:id`, etc.), so this is routing-library-only,
  not a URL-scheme change.
- **Socket.io**: CDN global `io()` → `socket.io-client` npm package,
  `import { io } from 'socket.io-client'` in `AppContext.jsx`.
- **Env config**: `window.CK_API_URL` / `window.CK_SOCKET_URL` →
  `import.meta.env.VITE_API_URL` / `VITE_SOCKET_URL`, set via `.env`.
- **Tailwind**: CDN `<script src="cdn.tailwindcss.com">` + runtime config →
  `tailwindcss` + `postcss` + `autoprefixer` as a real build step.
  `tailwind.config.js` is a 1:1 port of the old `js/tailwind-config.js`
  theme extension (same colors, fonts, keyframes).

**Not changed**: `api.js`'s `apiFetch` wrapper is still fetch-based — the
plan calls the Axios swap optional and says not to mix it into this step.
Swap it later, in its own commit, if you still want it.

## Setup

```bash
npm install
cp .env.example .env   # already done in this delivery; edit if your backend
                        # runs somewhere other than localhost:5000
npm run dev
```

The backend's `FRONTEND_URL` (used for CORS) currently defaults to
`http://localhost:8000` in `.env.example` — the old static-server port.
Update your backend `.env` to `FRONTEND_URL=http://localhost:5173` (Vite's
default dev port) or CORS will block requests from the new dev server.

## Verifying the migration (plan step 8)

Run `npm run dev` against your existing, unchanged backend and walk through
every flow from Phases 1–5: login/register, browse + search + filter
marketplace, create a listing, wishlist, chat (including typing indicator +
unread badges), notifications, and leaving/viewing reviews. If all of it
behaves exactly like the CDN version, the migration is done — anything
broken is a migration bug, not a feature bug, since nothing else changed.

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally to sanity-check it
```
