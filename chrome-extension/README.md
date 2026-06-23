# AnswerEngineer.AI v1 - Hello World Chrome Extension

A minimal Chrome extension (Manifest V3) that displays a HELLO WORLD greeting from
[AnswerEngineer.AI v1](http://AnswerEngineer.Ai) as both a toolbar popup and the
browser's New Tab page.

## Project structure

```
chrome-extension/
├── manifest.json        # Extension manifest (MV3)
├── popup.html           # Toolbar popup view
├── newtab.html          # New tab override view
├── styles.css           # Shared styles for popup + new tab
├── popup.js             # Popup link handler
├── background.js        # Minimal service worker
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Load the extension in Chrome

1. Open `chrome://extensions` in Google Chrome (or any Chromium-based browser).
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder inside this project.
5. The AnswerEngineer.AI v1 icon will appear in the toolbar — click it to see the
   popup, or open a new tab to see the full-page greeting.

## Customizing

- Edit `popup.html` / `newtab.html` for content changes.
- Edit `styles.css` to change the theme. The default is a blue-to-purple gradient.
- Replace the files in `icons/` with your own 16x16 / 48x48 / 128x128 PNGs.
- Bump the `version` in `manifest.json` whenever you publish a new build.

## Packaging for the Chrome Web Store

From the project root:

```bash
cd chrome-extension
zip -r ../answerengineer-ai-v1.zip .
```

Upload the resulting zip via the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
