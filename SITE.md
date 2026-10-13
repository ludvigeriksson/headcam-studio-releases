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
| `assets/hero.webp`            | The illustration on the app's start page                      |
| `assets/step-*.webp`          | Screenshots of the app's demo project                         |
| `assets/inter.woff2`          | Inter, under the SIL Open Font Licence (`inter-LICENSE.txt`)  |
| `assets/tajga-logo-white.svg` | Tajga Studio's supplied white logo, used for the creator credit |

To retake the screenshots, in the app's directory (they are 1440 × 900 at `--scale 2`):

```sh
pnpm shot --scale 2 --out tmp/site/layout.png --run "await page.waitForFunction(() => window.__hcs); \
  await page.evaluate(() => window.__hcs.loadDemo({ prefill: true })); \
  await page.getByRole('button', { name: /Layout/ }).click(); \
  await page.evaluate(() => window.__hcs.playback.seek(200)); await page.waitForTimeout(1500)"
cwebp -q 84 -resize 2400 0 tmp/site/layout.png -o ../headcam-studio-site/assets/step-layout.webp
```
