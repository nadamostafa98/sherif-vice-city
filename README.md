# Sherif (DEEPBLUE) — Vice City Weekend Countdown

A personalized, synthwave-style countdown to **Thursday 19 November 2026, 7:00 PM London time**, then a four-day "freedom remaining" clock that runs until he's back at work on Monday.

## What it does

- **Before 7 PM:** countdown, a sunset that sinks as the day goes on, a 5-star "wanted level" that fills up, rotating status lines ("WORK MODE: DISENGAGING", "SNACK SUPPLY: SECURED"...), and the four-day weekend itinerary.
- **Final 10 seconds:** a full-screen countdown with screen shake, then a white flash, fireworks and confetti.
- **After 7 PM:** "WELCOME TO VICE CITY, DEEPBLUE", a days/hours/minutes clock counting down to Monday 9 AM, and the itinerary marks each day as now playing or complete.
- **Sound:** off by default (browsers block it until someone clicks). Click the flashing **TAP FOR RADIO** button in the top right to start a looping synthwave track, plus the countdown beeps, fanfare and fireworks sounds.
- **Radio ticker:** joke headlines at the bottom. You can edit them in `script.js` (`TICKER`).
- **Live chat:** the CHAT button (bottom right) opens a group chat. Everyone with the page open sees every message, with names and times. New messages pop up as a phone-style text when the chat is closed, and the button shows how many are unread. Messages go through the same public ntfy.sh room as "who's online", so don't send anything private.
- **Gaming permission slip:** an "APPROVED" permission slip with terms & conditions, in `index.html`.
- **Stream panel (optional):** see below.
- **London ♡ Alexandria clocks** in the header.
- **Arcade game, ESCAPE THE OFFICE:** dodge emails, deadlines and new shows (edit `WORK` in `script.js`), and gobble up the friends on the road (the car's bonnet chomps them). Edit who appears in `script.js` (`PICKUPS`). Arrow keys or A/D on a computer, tap the sides or the ◀ ▶ buttons on a phone.
- **MOST WANTED loading screen:** shows `photo.jpg` (his Vice City portrait) with a loading bar that fills up as 7 PM gets closer. Remove the file and the card hides itself.
- **Cheat codes:** type them in the CHEAT CODES console next to the game (works on phones), or anywhere on the page with a keyboard: `NADZ` (hearts and a secret text), `DEEPBLUE` (blue mode), `MONEY` (makes it rain), `WANTED` (police lights), `BOOM` (fireworks), `ALEXANDRIA` (seaside rain).
- **Who's online + send a heart:** the first visit asks "WHO'S PLAYING?" (DEEPBLUE, NADZ, or type a name). A bar under PLAYER 1 shows who has the page open right now, and **SEND ♡** rains hearts and pops a message on everyone else's screen. Hearts sent while someone was away show up as a summary when they come back (up to ~12 hours). Tap the bar to change your name. This uses [ntfy.sh](https://ntfy.sh), a free public relay with no account; the room name is `ROOM` in `script.js`. Add `?room=test` to the address to try it without the real room. It only works on the live site, not from a file on your computer.
- **Link preview:** `og-image.png` is the picture WhatsApp/iMessage show when you send the link. Upload it with the other files.

## Preview the finale

Add `?test=15` to the address to run the final countdown and reveal 15 seconds from now, e.g. `index.html?test=15`.

## Settings (top of `script.js`)

- `TARGET_ISO`: when the countdown ends (`2026-11-19T19:00:00Z` = 7 PM London; London is on UTC in November).
- `END_ISO`: when the weekend ends (Monday 23 Nov, 9 AM).
- `STREAM`: set `twitch: 'channelname'` to embed his Twitch stream after 7 PM, or `url: 'https://...'` for any other platform (shows a "watch live" button). To try it without editing, add `?twitch=channelname` to the address.
- `TICKER`: the radio headlines.

The Twitch embed only works once the site is online (e.g. GitHub Pages), not when you open the file directly from your computer. The button link works everywhere.

## Publish with GitHub Pages

1. Create a **public** GitHub repository, e.g. `sherif-vice-city`.
2. Upload `index.html`, `style.css` and `script.js` to the **root** of the repository and commit.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**, and save.
4. After a few minutes, open `https://YOUR-USERNAME.github.io/sherif-vice-city/`.

This is an unofficial fan-made page and does not use any Rockstar artwork or logos.
