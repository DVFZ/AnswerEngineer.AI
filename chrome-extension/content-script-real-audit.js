/**
 * Content Script with Real 7-Point GEO Audit Logic
 */

console.log('[AnswerEngineer.AI] ✅ CONTENT SCRIPT INJECTED');

// ============================================================================
// PAGE DATA COLLECTOR
// ============================================================================

function collectPageData() {
  const url = window.location.href;
  const title = document.title;
  const description = getMetaTag('description') || '';

  return {
    url,
    title,
    description,
    headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent || ''),
    canonicalUrl: getCanonical(),
    schemaMarkup: getSchemaMarkup(),
    lastModified: getLastModified(),
    isClientRendered: detectClientRendering(),
    htmlSize: document.documentElement.outerHTML.length,
    cssCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
    jsCount: document.querySelectorAll('script').length,
    imageCount: document.querySelectorAll('img').length,
    externalLinks: countExternalLinks(),
    internalLinks: countInternalLinks(),
    metaTitle: getMetaTag('og:title') || title,
    metaDescription: getMetaTag('og:description') || description,
  };
}

function getMetaTag(name) {
  const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
  return meta?.getAttribute('content') || '';
}

function getCanonical() {
  const canonical = document.querySelector('link[rel="canonical"]');
  return canonical?.getAttribute('href') || window.location.href;
}

function getSchemaMarkup() {
  const schemas = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      schemas.push(JSON.parse(script.textContent || ''));
    } catch (e) {}
  });
  return schemas;
}

function getLastModified() {
  const modified = getMetaTag('last-modified');
  return modified || null;
}

function detectClientRendering() {
  return !!(
    document.querySelector('[data-react-root]') ||
    document.querySelector('#__next') ||
    document.querySelector('#__nuxt') ||
    document.querySelector('[ng-app]')
  );
}

function countExternalLinks() {
  const hostname = new URL(window.location.href).hostname;
  return Array.from(document.querySelectorAll('a[href]')).filter(a => {
    try {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('http')) {
        const linkHostname = new URL(href).hostname;
        return linkHostname !== hostname;
      }
    } catch (e) {}
    return false;
  }).length;
}

function countInternalLinks() {
  const hostname = new URL(window.location.href).hostname;
  return Array.from(document.querySelectorAll('a[href]')).filter(a => {
    try {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('/') || href.startsWith('http')) {
        if (href.startsWith('/')) return true;
        const linkHostname = new URL(href).hostname;
        return linkHostname === hostname;
      }
    } catch (e) {}
    return false;
  }).length;
}

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

function auditWebsiteStructure(pageData) {
  const findings = [];
  let score = 100;

  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count === 0) {
    findings.push('✗ Missing H1 heading');
    score -= 20;
  } else if (h1Count > 1) {
    findings.push(`⚠ Multiple H1 tags (${h1Count})`);
    score -= 10;
  } else {
    findings.push('✓ Single H1 heading');
  }

  if (pageData.canonicalUrl === pageData.url) {
    findings.push('✓ Canonical tag present');
  } else {
    findings.push('⚠ Canonical differs from current URL');
    score -= 10;
  }

  return {
    id: 'website-structure',
    name: 'Website Structure',
    score: Math.max(0, score),
    weight: 1.2,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditSchema(pageData) {
  const findings = [];
  let score = 100;

  if (pageData.schemaMarkup.length === 0) {
    findings.push('✗ No JSON-LD schema found');
    score -= 40;
  } else {
    findings.push(`✓ ${pageData.schemaMarkup.length} schema(s) found`);
  }

  const ogTitle = !!document.querySelector('meta[property="og:title"]');
  const ogDesc = !!document.querySelector('meta[property="og:description"]');

  if (ogTitle && ogDesc) {
    findings.push('✓ Open Graph tags present');
  } else {
    findings.push('⚠ Missing Open Graph tags');
    score -= 10;
  }

  return {
    id: 'schema',
    name: 'Schema Markup',
    score: Math.max(0, score),
    weight: 1.0,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditContentFreshness(pageData) {
  const findings = [];
  let score = 100;

  if (pageData.lastModified) {
    findings.push(`✓ Modification date found`);
  } else {
    findings.push('⚠ No modification date');
    score -= 15;
  }

  const currentYear = new Date().getFullYear();
  const yearRegex = new RegExp(`\\b(${currentYear}|${currentYear - 1})\\b`);
  if (yearRegex.test(document.body.innerText)) {
    findings.push('✓ Recent date references in content');
  } else {
    findings.push('⚠ No recent date references');
    score -= 10;
  }

  return {
    id: 'content-freshness',
    name: 'Content Freshness',
    score: Math.max(0, score),
    weight: 0.9,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditJsHandling(pageData) {
  const findings = [];
  let score = 100;

  if (pageData.isClientRendered) {
    findings.push('⚠ Client-side rendering detected (SPA)');
    score -= 20;
  } else {
    findings.push('✓ Server-side rendered');
  }

  const renderBlocking = document.querySelectorAll('head script:not([async]):not([defer])').length;
  if (renderBlocking > 2) {
    findings.push(`⚠ ${renderBlocking} render-blocking scripts`);
    score -= 10;
  } else if (renderBlocking > 0) {
    findings.push(`${renderBlocking} render-blocking script(s)`);
    score -= 5;
  } else {
    findings.push('✓ No render-blocking scripts');
  }

  return {
    id: 'js-handling',
    name: 'JavaScript Handling',
    score: Math.max(0, score),
    weight: 1.1,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditAuthority(pageData) {
  const findings = [];
  let score = 100;

  const isHttps = new URL(pageData.url).protocol === 'https:';
  if (isHttps) {
    findings.push('✓ HTTPS enabled');
  } else {
    findings.push('✗ Not using HTTPS');
    score -= 30;
  }

  const hasPrivacy = Array.from(document.querySelectorAll('a')).some(a =>
    a.href.toLowerCase().includes('privacy') || a.textContent.toLowerCase().includes('privacy')
  );
  if (hasPrivacy) {
    findings.push('✓ Privacy policy linked');
  } else {
    findings.push('⚠ No privacy policy found');
    score -= 10;
  }

  return {
    id: 'authority',
    name: 'Authority & Trustworthiness',
    score: Math.max(0, score),
    weight: 1.3,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditCtrSignals(pageData) {
  const findings = [];
  let score = 100;

  const titleLen = document.title.length;
  if (titleLen < 30) {
    findings.push(`⚠ Title too short (${titleLen})`);
    score -= 10;
  } else if (titleLen > 60) {
    findings.push(`⚠ Title too long (${titleLen})`);
    score -= 5;
  } else {
    findings.push(`✓ Good title length (${titleLen})`);
  }

  const descLen = pageData.metaDescription.length;
  if (descLen === 0) {
    findings.push('✗ Missing meta description');
    score -= 15;
  } else if (descLen < 120) {
    findings.push(`⚠ Description too short (${descLen})`);
    score -= 5;
  } else if (descLen > 160) {
    findings.push(`⚠ Description too long (${descLen})`);
    score -= 5;
  } else {
    findings.push(`✓ Good description (${descLen})`);
  }

  const imagesWithAlt = Array.from(document.querySelectorAll('img')).filter(img => img.alt).length;
  const totalImages = document.querySelectorAll('img').length;
  if (totalImages > 0) {
    const altRatio = Math.round((imagesWithAlt / totalImages) * 100);
    if (altRatio >= 80) {
      findings.push(`✓ Most images have alt text (${altRatio}%)`);
    } else {
      findings.push(`⚠ Missing alt text (${100 - altRatio}%)`);
      score -= 10;
    }
  }

  return {
    id: 'ctr-signals',
    name: 'CTR Signals (Titles & Descriptions)',
    score: Math.max(0, score),
    weight: 1.0,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function auditCoverage(pageData) {
  const findings = [];
  let score = 100;

  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) {
    const robots = robotsMeta.getAttribute('content') || '';
    if (robots.includes('noindex')) {
      findings.push('✗ Page marked with noindex');
      score -= 40;
    } else {
      findings.push('✓ Page allows indexing');
    }
  } else {
    findings.push('✓ No restrictive robots meta');
  }

  if (pageData.internalLinks > 0) {
    findings.push(`✓ ${pageData.internalLinks} crawlable internal links`);
  } else {
    findings.push('⚠ No internal links found');
    score -= 10;
  }

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    findings.push('✓ Mobile viewport declared');
  } else {
    findings.push('⚠ No mobile viewport');
    score -= 5;
  }

  return {
    id: 'coverage',
    name: 'Coverage & Crawlability',
    score: Math.max(0, score),
    weight: 1.1,
    findings,
    status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
  };
}

function calculateWeightedScore(points) {
  const totalWeight = points.reduce((sum, p) => sum + p.weight, 0);
  const weightedSum = points.reduce((sum, p) => sum + p.score * p.weight, 0);
  const score = Math.round((weightedSum / totalWeight) * 100) / 100;
  return Math.min(100, Math.max(0, score));
}

// ============================================================================
// MESSAGE LISTENER
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[AnswerEngineer.AI] 📨 Message received:', request);

  if (request.action === 'runAudit') {
    console.log('[AnswerEngineer.AI] 🔍 AUDIT STARTED');

    try {
      const pageData = collectPageData();
      console.log('[AnswerEngineer.AI] 📊 Page data collected:', pageData);

      // Run all 7 audits
      const websiteStructure = auditWebsiteStructure(pageData);
      const schema = auditSchema(pageData);
      const contentFreshness = auditContentFreshness(pageData);
      const jsHandling = auditJsHandling(pageData);
      const authority = auditAuthority(pageData);
      const ctrSignals = auditCtrSignals(pageData);
      const coverage = auditCoverage(pageData);

      const points = [websiteStructure, schema, contentFreshness, jsHandling, authority, ctrSignals, coverage];
      const overallScore = calculateWeightedScore(points);

      const result = {
        url: pageData.url,
        timestamp: Date.now(),
        overallScore,
        points: {
          websiteStructure,
          schema,
          contentFreshness,
          jsHandling,
          authority,
          ctrSignals,
          coverage,
        },
        recommendations: [],
      };

      console.log('[AnswerEngineer.AI] ✅ AUDIT COMPLETE:', result);
      sendResponse({
        success: true,
        result: result,
        error: null,
      });
    } catch (error) {
      console.error('[AnswerEngineer.AI] ❌ AUDIT FAILED:', error);
      sendResponse({
        success: false,
        result: null,
        error: error.message,
      });
    }
  }
});

console.log('[AnswerEngineer.AI] ✅ LISTENER REGISTERED');
