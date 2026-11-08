# Volume Booster (Chrome & Edge)

Chromium extension that adjusts **page audio** from **0%** through normal **100%** up to **800%** using the Web Audio API for boost and mute.

Works in **Google Chrome**, **Microsoft Edge**, and other Chromium browsers that support **Manifest V3**.

**GitHub:** [github.com/sken130/chromium-volume-booster](https://github.com/sken130/chromium-volume-booster)

## Features

- Slider and presets: Mute, 100%, 200%, 400%, 800%
- Applies to `audio` and `video` elements on the page
- Boost above 100% via a gain node (up to 8× linear gain)
- Setting is stored in `chrome.storage.sync` and pushed to open tabs

## Install (unpacked)

1. Clone the repository:
   ```bash
   git clone https://github.com/sken130/chromium-volume-booster.git
   cd volume-booster
   ```
   Or download and extract a ZIP from GitHub.
2. Open extensions:
   - **Chrome:** `chrome://extensions`
   - **Edge:** `edge://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this project root (the folder containing `manifest.json`).
5. Open a site with sound (for example a video page), then click the extension icon and adjust volume.

If a tab was already open before install, **refresh the page** once so the content script can load.

## Usage notes

- Volume is controlled **per browser profile** (sync storage). Changing the slider updates all tabs that have the content script loaded.
- Very loud boost can **clip or distort** audio; start near 100% and increase gradually.
- Some players use custom audio pipelines; if boost does not apply, reload the page or use the site’s own volume as well.
- Muting (0%) routes silence through the gain node when possible, otherwise sets media volume to 0.

## Project layout

| Path | Role |
|------|------|
| `manifest.json` | Extension manifest (MV3) |
| `popup/` | Toolbar popup UI |
| `content/content.js` | Bridges storage/messages into the page |
| `page/page.js` | In-page Web Audio volume logic |
| `background/background.js` | Default volume on install |
| `icons/` | Toolbar icons |

## Permissions

- **storage** — remember volume level  
- **tabs** — read active tab to apply changes immediately  
- **host access (`<all_urls>`)** — inject the booster on pages you visit  

No data is sent to any server; everything runs locally in the browser.

## Development

There is no build step. After editing files, go to `chrome://extensions` and click **Reload** on the extension card, then refresh any tabs you are testing.

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE).
