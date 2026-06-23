/**
 * Auditor #7: Coverage & Crawlability
 * Evaluates indexing signals, crawlable pages, robots meta, noindex tags
 */
export class CoverageAuditor {
    static audit(pageData) {
        const findings = [];
        let score = 100;
        // Check robots meta tag
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
            const robots = (robotsMeta.getAttribute('content') || '').toLowerCase();
            findings.push(`Robots meta: ${robots}`);
            if (robots.includes('noindex')) {
                findings.push('✗ Page is marked with noindex');
                score -= 40;
            }
            else if (robots.includes('nofollow')) {
                findings.push('⚠ Page is marked with nofollow');
                score -= 15;
            }
            else {
                findings.push('✓ Page allows indexing');
            }
        }
        else {
            findings.push('✓ No restrictive robots meta tag');
        }
        // Check for noindex in header (would need server-side check in reality)
        findings.push('ℹ X-Robots-Tag header check requires server response');
        // Check for pagination and crawlability
        const pagination = this.checkPaginationLinks();
        if (pagination.hasNext || pagination.hasPrev) {
            findings.push(`✓ Pagination links found (next: ${pagination.hasNext}, prev: ${pagination.hasPrev})`);
            if (!pagination.rel) {
                findings.push('⚠ Missing rel="next"/"prev" pagination markup');
                score -= 5;
            }
            else {
                findings.push('✓ Has rel="next"/"prev" markup');
            }
        }
        // Check for orphaned pages
        const links = this.analyzeInternalLinkStructure();
        if (links.orphaned) {
            findings.push(`⚠ Page may be orphaned (few internal links point to it)`);
            score -= 10;
        }
        else if (links.linkedFromPages > 2) {
            findings.push(`✓ Well-linked (${links.linkedFromPages} internal links to this page)`);
        }
        else {
            findings.push(`⚠ Limited internal links to this page (${links.linkedFromPages})`);
            score -= 5;
        }
        // Check for crawlable content
        if (pageData.internalLinks > 0) {
            findings.push(`✓ ${pageData.internalLinks} crawlable internal links`);
        }
        else {
            findings.push('⚠ No internal links found');
            score -= 10;
        }
        if (pageData.externalLinks > 0) {
            findings.push(`${pageData.externalLinks} external links`);
        }
        // Check for XML sitemap reference
        if (pageData.sitemapUrl) {
            findings.push(`✓ Sitemap referenced/found`);
        }
        else {
            findings.push('⚠ No sitemap found');
            score -= 10;
        }
        // Check for structured data for breadcrumbs
        if (this.hasBreadcrumbMarkup()) {
            findings.push('✓ Breadcrumb structured data present');
        }
        else {
            findings.push('⚠ No breadcrumb markup (helpful for crawling)');
            score -= 5;
        }
        // Check page size (too large = slower crawling)
        const pageSizeKB = pageData.htmlSize / 1024;
        if (pageSizeKB > 1000) {
            findings.push(`⚠ Large page (${pageSizeKB.toFixed(0)}KB, consider splitting)`);
            score -= 5;
        }
        else if (pageSizeKB > 500) {
            findings.push(`⚠ Moderately large page (${pageSizeKB.toFixed(0)}KB)`);
            score -= 3;
        }
        else {
            findings.push(`✓ Reasonable page size (${pageSizeKB.toFixed(0)}KB)`);
        }
        // Check for mobile viewport (important for crawling)
        if (this.hasMobileViewport()) {
            findings.push('✓ Mobile viewport declared');
        }
        else {
            findings.push('⚠ No mobile viewport meta tag');
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
    static checkPaginationLinks() {
        const nextRel = document.querySelector('link[rel="next"]');
        const prevRel = document.querySelector('link[rel="prev"]');
        // Also check for common pagination patterns
        const nextLink = Array.from(document.querySelectorAll('a')).find((a) => {
            const text = (a.textContent || '').toLowerCase();
            const href = (a.getAttribute('href') || '').toLowerCase();
            return text.includes('next') || text.includes('→');
        });
        const prevLink = Array.from(document.querySelectorAll('a')).find((a) => {
            const text = (a.textContent || '').toLowerCase();
            return text.includes('prev') || text.includes('←');
        });
        return {
            hasNext: !!nextLink || !!nextRel,
            hasPrev: !!prevLink || !!prevRel,
            rel: !!nextRel || !!prevRel,
        };
    }
    static analyzeInternalLinkStructure() {
        // Simplified analysis: count breadcrumbs and navigation links
        const breadcrumbs = document.querySelectorAll('[itemtype*="BreadcrumbList"] a, nav a').length;
        const footerLinks = document.querySelectorAll('footer a').length;
        const headerLinks = document.querySelectorAll('header a').length;
        const totalInternalLinkContext = breadcrumbs + footerLinks + headerLinks;
        return {
            orphaned: totalInternalLinkContext === 0,
            linkedFromPages: Math.min(totalInternalLinkContext, 5), // Cap at 5 for scoring
        };
    }
    static hasBreadcrumbMarkup() {
        // Check for BreadcrumbList schema
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const data = JSON.parse(script.textContent || '');
                if (data['@type']?.includes('BreadcrumbList')) {
                    return true;
                }
            }
            catch (e) {
                // Invalid JSON
            }
        }
        // Check for microdata
        return !!document.querySelector('[itemtype*="BreadcrumbList"]');
    }
    static hasMobileViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport)
            return false;
        const content = viewport.getAttribute('content') || '';
        return content.includes('width=device-width') || content.includes('initial-scale');
    }
}
//# sourceMappingURL=coverage.js.map