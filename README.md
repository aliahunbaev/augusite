# augusite

An artist site browsed through an iPod Classic, modelled on liim.nyc. The
iPod rests in the lap of a first-person photo and creeps up as the cursor
nears it. Clicking raises it to your face, and the whole site lives on its
screen: click wheel, menus, Cover Flow, Now Playing.

Plain HTML/CSS/JS with no build step and no dependencies.

## Files

```
index.html           page shell + backdrop picker (runs before first paint)
js/content.js        ALL content and settings — the only file you edit
js/integrations.js   YouTube / Bandsintown / Shopify / GA4, each optional
js/ipod.js           screens, click wheel, audio, pick-up animation
css/ipod.css         the iPod and its screens
assets/              backdrops, covers, music, photos (+ photos/thumb), merch
```

## Content

Edit `js/content.js`. Entries marked TODO are demo placeholders. Empty
sections are hidden from the menu, and missing artwork gets a generated
placeholder.

- **Backdrops**: first-person photos dealt from a shuffled bag, so each
  one shows before any repeats. `hand` nudges the iPod sideways so it sits
  in the lap. Tune it by eye at a couple of window shapes.
- **Photos**: shown as Cover Flow. Use small `thumb` webps for the flow
  and a `full` image for when a photo is opened.
- **Merch**: static products with buy links, or a live Shopify catalog
  and cart once `integrations.shopify` is filled in.
- **Videos / Shows**: static lists, or live from YouTube / Bandsintown.
- **Analytics**: set `googleAnalyticsId`. Visitors in Europe get a consent
  bar. Open the site once with `?internal=1` on each of your devices to
  keep your own visits out of the numbers.

## Controls

- Desktop: move toward the middle, click to pick up, click outside to put down
- Drag around the wheel to scroll; the centre button selects
- MENU = back, ⏭/⏮ = skip, ⏯ = play/pause; on Now Playing the wheel is volume
- Keyboard: arrows, Enter, Esc, Space. Trackpad scrolling also works
- Phones: the iPod is already up, ready to use
- Deep links: `/#music`, `/#photos`, `/#merch`, `/#shows`, `/#contact`...

## Run locally

```bash
python3 -m http.server 5181
```

## Deploy

It's static: drag the folder into Netlify Drop, or push to GitHub and
import on Vercel / GitHub Pages.
