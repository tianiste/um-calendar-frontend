# UM Calendar
# [Link to page](https://um-calendar-frontend.pages.dev/)
A calendar viewer for University of Maribor class schedules. Browse your lectures, exams, and other events in an easy-to-use interface.

## Features

- Month, week and day views
- Dark mode support
- Responsive design that works on phones and desktops
- Color-coded event types (lectures, exams, exercises, e-learning)
- Quick navigation between dates
- Next class for your selected group, with room and start countdown
- Optional hiding of other groups across day, week, and month views
- Horizontal swipe navigation and a thumb-accessible Today button
- Saved timetable and programme list for offline use
- Multiple selected programmes with labelled events and independent group filters
- Cross-programme overlap warnings with expandable conflict details
- Refresh change highlights with previous/current times and rooms
- Daily summaries with overlap-aware class time and breaks
- Date picker in every calendar view
- Remembered programme visibility without losing selection or group settings

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend defaults to the live FOV calendar API. During development, Vite
proxies `/api/*` requests to that API so localhost is not blocked by its CORS
policy. No guest token is required by the current API.

To use another backend, set `VITE_API_URL` in `.env.local` to its origin
(for example, `http://localhost:8080`), then restart Vite. See `.env.example`.
Production requests go directly to this origin; the backend must allow the
frontend's deployed origin in its CORS configuration.

## Offline and mobile use

After a successful calendar load, the app saves that programme's timetable and
update time on the device. Each programme is cached separately. If a refresh fails,
its saved timetable remains available with a visible stale-data notice. Selected
programmes refresh automatically when the browser reports that connectivity has
returned. A programme needs a successful online load before it is available offline.

Production builds include a service worker that caches the complete app shell,
allowing the page to reopen offline after the first online visit. Test this with
`npm run build` followed by `npm run preview`; Vite development mode intentionally
does not install a service worker. Offline reopening requires HTTPS or localhost
and browser storage support. Page navigation tries the network first, then falls back
to the saved shell while offline. Saved responses are reconstructed without redirect
metadata because Cloudflare redirects `/index.html` to `/`. Cache-storage errors do
not block online browsing. Worker updates activate immediately and retain previous
shell caches for already-open tabs; programme and group preferences are unchanged.

## Install on a phone

On Android, use the browser's **Install app** / **Add to Home screen** option.
On iPhone, open the site in Safari and use **Share → Add to Home Screen**.
The manifest provides a stable root identity, name, standalone launch mode, theme
colours and matching 192/512px PNG icons. Android has a separate padded maskable icon;
iOS has an opaque 180px touch icon. Orientation is unrestricted. Existing safe-area
padding keeps navigation clear of the notch and home indicator.

These assets follow [web app manifest guidance](https://web.dev/learn/pwa/web-app-manifest)
and [maskable icon guidance](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons).
Install availability and splash-screen presentation depend on the browser/OS and
HTTPS deployment. Existing home-screen installs may cache their old icon; removing
and adding the shortcut again may be needed after deployment. A real-device iOS and
Android installation check remains part of the release checklist.

Swipe horizontally on schedule content to navigate dates. Vertical scrolling,
pinch zoom, screen-edge gestures, and touches starting on controls are excluded.
Navigation arrows remain available. The hide-groups preference is remembered,
and shared lectures and ungrouped events remain visible.

## Combining programmes

Check one or more programmes in the searchable selector, then choose **Show
timetables**. Each event has a coloured badge with its programme name. Event-type
colours remain unchanged. Programme and group selections persist between visits;
existing single-programme preferences and offline data are migrated automatically.

Classes from different programmes are shown as separate cards, even when their
times coincide. An expandable overlap warning lists the conflicting events, times,
and programmes. Month cells mark days containing conflicts with an exclamation mark;
select the date for the labelled events. Events that end exactly when another begins
are not conflicts. Other groups' dimmed/hidden exercises are excluded from conflict
warnings according to each programme's independent group selection.

Removing a programme removes its events immediately. Failed programmes have their
own retry control and do not prevent successfully loaded programmes from displaying.

Use **Hide programme** on a selected programme to temporarily hide its events without
removing it or changing its group. Visibility is remembered on this device and applies
to all views, next/current classes, summaries and overlap warnings. Hidden programmes
still refresh. **Show all programmes** is available when everything is hidden.

Tap the date heading in any view to choose a date. The day view includes total class
time, finishing time and expandable breaks. Summaries exclude other groups' dimmed
events, merge overlapping/touching intervals, and clip overnight classes to that day.

After a successful refresh, changes are compared with the previous successful load
(including a saved offline snapshot). Added, updated and removed events appear in an
expandable per-programme log; affected current cards also have badges. A failed load
never generates removal notices, and a first load without a baseline shows no changes.
The latest non-empty change batch remains until dismissed, replaced by a newer batch,
or the page is reloaded. These are on-device comparisons, not background notifications
or confirmation that a removed class was cancelled.

## Checks and Cloudflare Pages handoff

```bash
npm ci
npm test
npm run type-check
npx eslint src build tests vite.config.ts
npm run build-only
```

For the existing Cloudflare Pages project, confirm its Git repository and production
branch (`main`) before merging. Set build command `npm run build` and output directory
`dist`, as documented in the [Cloudflare Vue guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/).
Use a Node version satisfying `package.json` (Node 22.12+ within the 22.x release line).
Check that any existing `VITE_API_URL` / `VITE_API_BASE` setting points to the current
backend rather than localhost or the retired API. These values are public build-time
configuration, not secrets.

Before production, verify programme loading on the actual Pages hostname and custom
domain: the backend must permit each origin via CORS. A preview hostname may need its
own backend allowance. Also test refresh, multiple programmes, mobile navigation and
offline reopening there. Local fixture-based browser checks cannot verify production
CORS or dashboard settings. Nothing in this repository automatically pushes or deploys.

Build for production:

```bash
npm run build
```

## Tech Stack

- Vue 3 with TypeScript
- Vite
- Tailwind CSS
- Pinia for state management

## How It Works

The app fetches `.ics` calendar files from the backend API and parses them to display events. Select your calendar from the dropdown to load your schedule.
