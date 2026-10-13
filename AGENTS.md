# Demo gallery

- This repository preserves the Anatomy upstream source and MIT license. The Russian gallery uses the six existing standalone HTML examples without rebuilding or modifying their geometry. The two React-only examples are not included in the gallery.
- Start locally: `node server.mjs`, then open `http://127.0.0.1:4173`. Set `PORT` to choose another port. No dependencies or install step are required.
- Gallery files: `index.html`, `gallery.css`, `gallery.js`, `server.mjs`.
- Regression tests: `node --test scripts/gallery.test.mjs`.
- Syntax checks: `node --check gallery.js` and `node --check server.mjs`.
- Browser checks (Chrome required, server running): `node scripts/drive.mjs http://127.0.0.1:4173 --actions scripts/gallery-browser.actions.json`. Repeat with `--width 390 --height 844` to check mobile layouts. Browser checks cover all six models in both themes, navigation, reset, keyboard focus and horizontal overflow.
- Screenshot: `node scripts/capture.mjs http://127.0.0.1:4173 --select body --out shots/gallery.png --width 1440 --height 1100 --scale 1`.
- Screenshots belong in the ignored `shots/` directory. Preserve upstream examples, comments and licensing. Follow `CONTRIBUTING.md` for changes to the original kit.
