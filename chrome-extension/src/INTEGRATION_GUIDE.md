# 7-Point GEO Audit Integration Guide

## Overview
The audit engine is built as modular TypeScript classes designed for a Chrome extension. It can run in:
1. **Content Script** - Direct DOM analysis on the current page
2. **Background Service Worker** - Process data sent from content scripts
3. **Popup** - Trigger audits and display results

## File Structure
```
src/
├── types.ts                    # TypeScript interfaces
├── page-collector.ts           # Collects page data from DOM
├── geo-audit.ts               # Main orchestrator
├── auditors/
│   ├── website-structure.ts    # Auditor #1
│   ├── schema.ts              # Auditor #2
│   ├── content-freshness.ts   # Auditor #3
│   ├── js-handling.ts         # Auditor #4
│   ├── authority.ts           # Auditor #5
│   ├── ctr-signals.ts         # Auditor #6
│   └── coverage.ts            # Auditor #7
└── INTEGRATION_GUIDE.md        # This file
```

## Usage

### Option 1: Content Script (Quickest - for current tab)

**In content-script.ts:**
```typescript
import { GEOAudit } from './src/geo-audit';

// When user clicks extension icon or button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'runAudit') {
    GEOAudit.run().then((result) => {
      sendResponse({ success: true, result });
    });
    return true; // Required for async response
  }
});
```

**In popup.js:**
```javascript
// Trigger audit on current tab
document.getElementById('auditButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'runAudit' }, (response) => {
      if (response.success) {
        displayResults(response.result);
      }
    });
  });
});
```

### Option 2: Background Service Worker (For batch processing)

**In background.ts:**
```typescript
import { GEOAudit } from './src/geo-audit';
import { AuditResult } from './src/types';

// Store audit results
let auditResults: Map<string, AuditResult> = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'runAudit') {
    GEOAudit.run().then((result) => {
      auditResults.set(sender.tab.url, result);
      sendResponse({ success: true, result });
      
      // Send to storage or backend
      chrome.storage.local.set({ lastAudit: result });
    });
    return true;
  }
});
```

## Key Classes & Methods

### GEOAudit
Main orchestrator that runs all 7 auditors:
```typescript
// Run the complete audit
const result = await GEOAudit.run(): Promise<AuditResult>

// Format for display
const formatted = GEOAudit.format(result): string
```

### PageCollector
Extracts page data from the DOM:
```typescript
const pageData = PageCollector.collect(): PageData
```

### Individual Auditors
Each auditor validates one dimension:
```typescript
// Synchronous
const point = WebsiteStructureAuditor.audit(pageData): AuditPoint
const point = SchemaAuditor.audit(pageData): AuditPoint
const point = CTRSignalsAuditor.audit(pageData): AuditPoint
const point = CoverageAuditor.audit(pageData): AuditPoint

// Asynchronous (requires async handling)
const point = await ContentFreshnessAuditor.audit(pageData): AuditPoint
const point = await JsHandlingAuditor.audit(pageData): AuditPoint
const point = await AuthorityAuditor.audit(pageData): AuditPoint
```

## Result Structure

```typescript
{
  url: string                    // Page URL
  timestamp: number              // When audit ran
  overallScore: number          // 0-100 weighted score
  points: {
    websiteStructure: AuditPoint
    schema: AuditPoint
    contentFreshness: AuditPoint
    jsHandling: AuditPoint
    authority: AuditPoint
    ctrSignals: AuditPoint
    coverage: AuditPoint
  }
  recommendations: string[]      // Prioritized action items
}
```

## Scoring System

Each audit point:
- **Score**: 0-100 based on findings
- **Weight**: Multiplier for overall score (1.0 = 100%, 1.2 = 120% weight)
- **Status**: 'pass' (≥80), 'warning' (60-79), 'fail' (<60)

Current weights:
| Point | Weight | Importance |
|-------|--------|-----------|
| Website Structure | 1.2 | High |
| Schema | 1.0 | Medium |
| Content Freshness | 0.9 | Medium |
| JS Handling | 1.1 | High |
| Authority | 1.3 | Critical |
| CTR Signals | 1.0 | Medium |
| Coverage | 1.1 | High |

## TypeScript Setup

Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "moduleResolution": "node"
  }
}
```

## Limitations & Future Improvements

### Current Limitations
1. **Authority auditor** - Domain age check requires external API (not implemented)
2. **HTTP headers** - Can't access response headers from content script (X-Robots-Tag, etc.)
3. **Historical data** - Only analyzes current page state, not indexing history
4. **Third-party APIs** - CTR data, backlink analysis requires Google Search Console/third-party API

### Next Steps for MVP
1. Add backend API integration for:
   - Domain age/WHOIS lookups
   - HTTP header inspection
   - Backlink/authority data from external services
   
2. Store audit results in Chrome storage:
   - Track audit history
   - Generate weekly digest
   
3. Connect to Google Analytics:
   - Map audit score to CTR improvement opportunities
   - Track conversion correlations

4. Build remediation flows:
   - WordPress plugin generator
   - Shopify implementation guide
   - CMS-specific instructions

## Example Display Component (React)

```typescript
interface AuditDisplayProps {
  result: AuditResult;
}

export const AuditDisplay: React.FC<AuditDisplayProps> = ({ result }) => {
  return (
    <div className="audit-results">
      <h2>GEO Score: {result.overallScore}/100</h2>
      
      {Object.values(result.points).map((point) => (
        <div key={point.id} className={`audit-point ${point.status}`}>
          <h3>{point.name}</h3>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ width: `${point.score}%` }}
            />
          </div>
          <p>{point.score}/100</p>
          <ul>
            {point.findings.map((finding, i) => (
              <li key={i}>{finding}</li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="recommendations">
        <h3>Top Recommendations</h3>
        <ol>
          {result.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
```

## Testing

Run individual auditors:
```typescript
import { PageCollector } from './src/page-collector';
import { SchemaAuditor } from './src/auditors/schema';

const pageData = PageCollector.collect();
const schemaAudit = SchemaAuditor.audit(pageData);
console.log(schemaAudit);
```

## Questions?
See `geo-audit.ts` for the main orchestrator logic and `auditors/` for individual scoring algorithms.
