# The website

The landing page for Headcam Studio: what the app does, and where to download it. Plain HTML, CSS
and one script; nothing to build. It lives in the same repository as the app's releases, and
`README.md` is what visitors of the repository see.

## Look at it

```sh
python3 -m http.server 8123   # then open http://localhost:8123
```

## Online

GitHub Pages serves the `main` branch of this repository from its root (Settings → Pages); a push
is all it takes. `.nojekyll` makes Pages serve the files as they are.

Once the page has its own domain, make the `og:image` in `index.html` a full URL
(`https://…/assets/og.jpg`); link previews in chat apps and on social media need that.

## Versions of the app

Nothing to do here when the app gets a new version. The app's release workflow publishes the
installers as releases of this repository (the app's own repository stays private), and `main.js`
asks GitHub for the latest release each time the page is opened. If GitHub does not answer, the download buttons lead to the releases page instead.

What the page says under "Installing and updating" has to match how the app is released: the Mac
app is signed and notarized, the Windows installer is not signed, and the app updates itself.

## Files

| File                          | What it is                                                    |
| ----------------------------- | ------------------------------------------------------------- |
| `index.html`, `styles.css`    | The page. Colours and type follow the app                     |
| `main.js`                     | Download links from the latest release, and which installer suits the visitor |
| `#price` in `index.html`      | Free (the one shown as the choice) and the licence side by side; "Buy a licence" goes straight to Checkout on the licence server. The price is written out here and in the app (`SHOP.price` in `src/core/licence/shop.ts`): change both with the Stripe price |
| `licence/`                    | After checkout, the licence key that was bought (`?session=`); otherwise a form that emails a lost key again. Both ask the licence server (`tajga-licensing`), whose addresses are at the top of `licence.js`: the live one, or with `&sandbox` (a checkout in Stripe's sandbox) the sandbox one |
| `assets/hero.webp`            | The illustration on the app's start page                      |
| `assets/step-*.webp`          | Screenshots of the app with a real race (Kvarnsvedsträffen)   |
| `assets/inter.woff2`          | Inter, under the SIL Open Font Licence (`inter-LICENSE.txt`)  |
| `assets/tajga-logo-white.svg` | Tajga Studio's supplied white logo, used for the creator credit |

To retake the screenshots, in the app's directory (needs the race in `samples/kvarnsveden/`; they
are 1440 × 900 at twice the size):

```sh
pnpm tsx scripts/site-shots.ts   # map.png, sync.png and layout.png in tmp/site/
for step in map sync layout; do
  cwebp -q 84 -resize 2400 0 tmp/site/$step.png -o ../headcam-studio-releases/assets/step-$step.webp
done
```

`--map`, `--sync` and `--layout` take the moment of the video to show, in seconds.
