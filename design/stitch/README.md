# UM Calendar Stitch reference

Source project: `17809189489584837850` — UM Calendar Timetable Viewer.
Original code and screenshot assets were retrieved using the Stitch MCP and downloaded with `curl -L`.

| Screen | ID | Code | Screenshot |
| --- | --- | --- | --- |
| Selection & App States (English) | `188e3716d03c4fd086c96158f6fcf79e` | [selection.html](selection.html) | [selection.png](selection.png) |
| Week View (English) | `4c6e35c87a114d398af57fc4ada0d8d9` | [week.html](week.html) | [week.png](week.png) |
| Day View (English) | `b7fc9364d7044025a5991bf47fd073d0` | [day.html](day.html) | [day.png](day.png) |
| Month View (English) | `279676adac9945d2a275ab004b50e4e8` | [month.html](month.html) | [month.png](month.png) |
| Logo | `4fa7bd731c34412b94b6fe00778f3ecc` | [logo.svg](logo.svg) | [logo.png](logo.png) |

The Vue implementation uses the existing API, ICS parser, saved calendar, theme, and group preferences. The reference HTML remains unmodified and is not executed by the app. Programme names, dates, events, locations, and counts come from calendar data; illustrative reference content is not seeded into the application.

The language store supplies English and Slovenian UI strings and localized dates, persisting `um-calendar-language`. University-provided programme names, event titles, and descriptions retain their original language. The shared schedule store keeps dates consistent between the month preview, week agenda, and day details. The weekly agenda starts on Monday; the month grid follows the reference's Sunday-first layout.

Implemented interactions include programme search, selection restoration, group dimming and reset, individual/all-day expansion, day/week/month navigation, current-class countdowns, refresh, loading skeletons, empty states, and retryable programme/calendar errors. A stale calendar request cannot replace a newer selection. Dark mode is the default for new visitors; existing theme preferences are preserved.

Validation: production build, TypeScript, ESLint, and Chromium interaction checks with intercepted API/ICS fixtures. Browser checks cover selection/search, loading, saved language/theme/group/programme, group dimming, week expansion, month preview, day navigation, current classes, both retry paths, and 320px/390px/1440px layouts. These fixture checks do not validate availability of the live university backend.
