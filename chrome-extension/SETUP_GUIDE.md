# AnswerEngineer.AI - Chrome Extension Setup Guide

## Quick Start

You now have a working 7-point GEO audit engine integrated into the extension. Here's how to use it.

## What's Been Built

✅ **7-Point GEO Audit Engine** (TypeScript)
- Website Structure analysis
- Schema Markup detection
- Content Freshness evaluation
- JavaScript Handling assessment
- Authority & Trustworthiness scoring
- CTR Signals analysis
- Coverage & Crawlability evaluation

✅ **Content Script** (`src/content-script.ts`)
- Runs in page context
- Listens for audit requests from popup
- Executes GEOAudit and returns results

✅ **Popup Integration** (`popup.js`)
- Triggers audit when user clicks "LET'S GO!"
- Shows "Running audit..." loading state
- Displays results within 30 seconds
- Maps 7-point audit to UI display

✅ **Updated Manifest** (`manifest.json`)
- Content script registered
- Required permissions added

## Build & Test

### 1. Compile TypeScript to JavaScript

The extension expects compiled JavaScript files. You have two options:

**Option A: Use TypeScript Compiler (recommended)**
```bash
npm install -g typescript
cd /path/to/chrome-extension
tsc --target ES2020 --module ES2020 src/*.ts --outDir .
```

**Option B: Use TypeScript in VSCode**
- Create `tsconfig.json` in the extension folder:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```
- Press `Ctrl+Shift+B` in VSCode to run the build task

### 2. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should appear in your toolbar

### 3. Test the Audit Flow

1. Visit any website (e.g., https://example.com)
2. Click the AnswerEngineer.AI extension icon
3. Enter the URL you want to audit
4. Click "ANALYZE" → "LET'S GO!"
5. Watch the "Running audit..." loading state
6. Results should appear in 2-30 seconds with:
   - Overall GEO Score (0-100)
   - 7 individual criteria scores
   - Color-coded results (green/yellow/red)

### 4. Check Browser Console

Open DevTools (F12) and check:
- **Popup console**: Shows audit flow (`[Popup] ...`)
- **Page console**: Shows content script activity (`[AnswerEngineer.AI] ...`)

Expected logs:
```
[AnswerEngineer.AI] Content script loaded
[Popup] Requesting audit for: https://example.com
[Popup] Sending audit request to tab: 123
[AnswerEngineer.AI] Audit requested from popup
[GEO Audit] Completed in 1234ms
[Popup] Audit successful: {...}
```

## File Structure

```
chrome-extension/
├── src/
│   ├── types.ts                    # TypeScript interfaces
│   ├── page-collector.ts           # Collects page data from DOM
│   ├── geo-audit.ts               # Main 7-point audit orchestrator
│   ├── content-script.ts          # Content script entry point
│   ├── auditors/                   # Individual auditors
│   │   ├── website-structure.ts
│   │   ├── schema.ts
│   │   ├── content-freshness.ts
│   │   ├── js-handling.ts
│   │   ├── authority.ts
│   │   ├── ctr-signals.ts
│   │   └── coverage.ts
│   ├── README.md                   # Audit engine docs
│   └── INTEGRATION_GUIDE.md        # Integration details
├── popup.html                      # Popup UI
├── popup.js                        # Popup logic (UPDATED)
├── styles.css                      # Popup styles (UPDATED)
├── manifest.json                   # Extension config (UPDATED)
├── background.js                   # Service worker
├── newtab.html                     # New tab page
└── icons/                          # Extension icons
```

## How It Works

### Flow: URL Entry → Audit Execution

1. **Screen 1 (URL Entry)**
   - User enters website URL
   - Clicks "ANALYZE"
   - Goes to Screen 2

2. **Screen 2 (Welcome)**
   - Shows "How This Works" explainer
   - User clicks "LET'S GO!"
   - Proceeds to Screen 3

3. **Screen 3 (Dashboard - Audit Tab)**
   - Shows "Running audit..." loading state
   - Content script runs `GEOAudit.run()` on the page
   - PageCollector extracts page data from DOM
   - 7 auditors run in parallel:
     - Website Structure
     - Schema Markup
     - Content Freshness
     - JavaScript Handling
     - Authority
     - CTR Signals
     - Coverage
   - Results are calculated with weighted scores
   - **30-second target**: Results appear within 30 seconds of page load
   - UI displays:
     - Overall score (weighted average)
     - 7 individual scores with color coding
     - Expandable details for each criterion
     - CMS-specific fix recommendations

### Score Mapping

The 7-point audit results are mapped to the UI's 7 criteria:
- Website Structure → H1 Tag
- CTR Signals → Meta Description
- Schema Markup → Schema Markup
- Coverage → Mobile Responsive
- JS Handling → Page Speed
- Content Freshness → Content Freshness
- Authority → Question Coverage

## Troubleshooting

### Extension doesn't load
- Check console for manifest errors
- Ensure all TypeScript is compiled to JavaScript
- Verify `chrome-extension` folder has all required files

### Audit doesn't run
- Check popup console: Look for `[Popup]` logs
- Check page console: Look for `[AnswerEngineer.AI]` logs
- Ensure content script has DOM access (check manifest `host_permissions`)
- Try refreshing the page and reopening the popup

### Results don't appear
- Check if audit completed (look for completion logs)
- Verify mapAuditToScores() is working (add console.log)
- Check if error was caught (look for `Audit failed` message)

### Slow audit execution
- Some pages take time to load all data
- Maximum wait is 30 seconds (configurable in popup.js)
- Check browser DevTools Network tab for slow resources

## Next Steps

After testing, you can:

1. **Add Backend Integration**
   - Send audit results to server
   - Store audit history
   - Track score improvements over time

2. **Implement AI Simulator**
   - Use results to predict AI citation likelihood
   - Show which AI engines might mention the site

3. **Build Remediation Flows**
   - Add WordPress/Shopify/Wix specific fixes
   - Auto-detect CMS and show relevant instructions

4. **Weekly Digest**
   - Send email summaries of improvements
   - Alert on new issues

5. **Premium Features**
   - Unlimited audits
   - Historical tracking
   - Advanced reports

## Files Modified

- ✏️ `manifest.json` - Added content scripts, permissions
- ✏️ `popup.js` - Added audit integration and result display
- ✏️ `styles.css` - Added loading state styles
- ✨ `src/content-script.ts` - NEW: Content script entry point

## Notes

- The audit runs in the **browser context only** (no backend required)
- TypeScript must be compiled to JavaScript before loading
- Content scripts require `<all_urls>` permission in manifest
- Some features (domain age, HTTP headers) need external APIs
- The "30-second Aha" refers to when the score appears, not guaranteed timing

---

**Next**: Compile TypeScript, load the extension, and test!
