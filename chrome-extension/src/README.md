# 7-Point GEO Audit Engine

Complete TypeScript implementation of AnswerEngineer.AI's GEO scoring system.

## What's Built

✅ **7 Independent Auditors** - Each analyzes one dimension:
1. **Website Structure** - Sitemap, robots.txt, H1, heading hierarchy, canonicals
2. **Schema Markup** - JSON-LD, microdata, Open Graph, Twitter Cards
3. **Content Freshness** - Publication date, modification date, content age
4. **JavaScript Handling** - Client vs. server rendering, render-blocking scripts
5. **Authority** - HTTPS, SSL, contact info, privacy policy, social links
6. **CTR Signals** - Meta titles/descriptions, readability, images, CTAs
7. **Coverage** - robots meta, sitemap, internal links, pagination, mobile viewport

## Output

Each audit produces:
- **Individual Scores** (0-100 per point)
- **Weighted Overall Score** (final GEO score)
- **Findings** per point (with emojis: ✓, ⚠, ✗)
- **Recommendations** (prioritized action items)

## Quick Start

### 1. Copy files to your project
```bash
cp -r src/ /path/to/chrome-extension/src/
```

### 2. In your content script, run the audit:
```typescript
import { GEOAudit } from './src/geo-audit';

const result = await GEOAudit.run();
console.log(`GEO Score: ${result.overallScore}/100`);
console.log(GEOAudit.format(result)); // Pretty print
```

### 3. Send result to background/popup:
```typescript
chrome.runtime.sendMessage({
  action: 'auditComplete',
  result: result
});
```

## Architecture

```
GEOAudit (orchestrator)
├── PageCollector (extracts page data)
└── 7 Auditors (each runs independently)
    ├── WebsiteStructureAuditor
    ├── SchemaAuditor
    ├── ContentFreshnessAuditor
    ├── JsHandlingAuditor
    ├── AuthorityAuditor
    ├── CTRSignalsAuditor
    └── CoverageAuditor
```

All auditors:
- Run in parallel (fast)
- Return consistent `AuditPoint` objects
- Include findings + score + status
- Generate recommendations

## Weights & Importance

Higher weight = more impact on final score:
- **Authority (1.3)** - Most critical
- **Website Structure (1.2)** - Site health foundation
- **JS Handling (1.1)** - Crawlability impact
- **Coverage (1.1)** - Indexation
- Others **(1.0 or 0.9)** - Supporting factors

## Example Result

```json
{
  "url": "https://example.com",
  "timestamp": 1718044800000,
  "overallScore": 72,
  "points": {
    "websiteStructure": {
      "id": "website-structure",
      "name": "Website Structure",
      "score": 85,
      "weight": 1.2,
      "status": "pass",
      "findings": [
        "✓ Canonical tag present and correct",
        "✓ Single H1 heading present",
        "⚠ No sitemap.xml found"
      ]
    },
    ...
  },
  "recommendations": [
    "[Website Structure] Create and submit sitemap.xml",
    "[Authority] Add privacy policy page",
    ...
  ]
}
```

## Next Steps

1. **Integrate into popup UI** - Show real-time scores
2. **Add background service** - Store audit history
3. **Connect to Google Search Console** - Validate with real indexing data
4. **Build remediation flows** - WordPress/Shopify specific fixes
5. **Add "30-second Aha"** - Display GEO score in popup within 30s of install
6. **Weekly digest** - Email improvements + new issues

## Files

- `types.ts` - TypeScript interfaces
- `page-collector.ts` - DOM data extraction
- `geo-audit.ts` - Main orchestrator
- `auditors/*.ts` - Individual auditors (7 files)
- `INTEGRATION_GUIDE.md` - Detailed integration instructions
- `README.md` - This file

## Testing

```typescript
// Test individual auditor
import { PageCollector } from './src/page-collector';
import { SchemaAuditor } from './src/auditors/schema';

const pageData = PageCollector.collect();
const result = SchemaAuditor.audit(pageData);
console.log(result);

// Test full audit
import { GEOAudit } from './src/geo-audit';
GEOAudit.run().then(result => {
  console.log(GEOAudit.format(result));
});
```

## Limitations

- Authority: Domain age requires external API
- Coverage: HTTP headers (X-Robots-Tag) need backend check
- CTR data: Google Search Console integration needed for real CTR correlation
- Historical: Only analyzes current state, not indexing history

## Notes

- ✅ Runs entirely in browser (no backend required)
- ✅ Content script compatible (DOM access)
- ✅ Parallel auditor execution (fast)
- ✅ Weighted scoring (Authority > Structure > JS Handling > Coverage)
- ⚠️ Some features need API integration (listed above)

---

**Created for AnswerEngineer.AI MVP**  
7-Point GEO Audit Engine - Core scoring logic for the AI Simulator
