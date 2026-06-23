/**
 * Auditor #1: Website Structure
 * Evaluates site hierarchy, robots.txt, sitemap.xml, canonicals, redirects
 */

import { AuditPoint, PageData } from '../types';

export class WebsiteStructureAuditor {
  static async audit(pageData: PageData): Promise<AuditPoint> {
    const findings: string[] = [];
    let score = 100;

    // Check for sitemap
    if (!pageData.sitemapUrl) {
      findings.push('No sitemap.xml found');
      score -= 15;
    }

    // Check for canonical tag
    if (pageData.canonicalUrl === pageData.url) {
      findings.push('✓ Canonical tag present and correct');
    } else {
      findings.push('Canonical URL differs from current URL');
      score -= 10;
    }

    // Check heading hierarchy
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      findings.push('Missing H1 heading');
      score -= 20;
    } else if (h1Count > 1) {
      findings.push(`Multiple H1 tags found (${h1Count})`);
      score -= 10;
    } else {
      findings.push('✓ Single H1 heading present');
    }

    // Check for proper heading hierarchy
    const headers = this.checkHeadingHierarchy();
    if (!headers.valid) {
      findings.push(`Improper heading hierarchy detected`);
      score -= 15;
    } else {
      findings.push('✓ Proper heading hierarchy');
    }

    // Check robots.txt
    const robotsTxt = await this.fetchRobotsTxt(pageData.url);
    if (robotsTxt) {
      findings.push('✓ robots.txt accessible');
      if (robotsTxt.includes('Disallow: /')) {
        findings.push('⚠ robots.txt contains restrictive rules');
        score -= 5;
      }
    } else {
      findings.push('robots.txt not found');
      score -= 10;
    }

    // Check for URL parameters issues
    if (pageData.url.includes('?') && !pageData.url.includes('utm_')) {
      findings.push('⚠ URL contains parameters (may affect tracking)');
      score -= 5;
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

  private static checkHeadingHierarchy(): { valid: boolean } {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    for (const h of headings) {
      const level = parseInt(h.tagName[1]);
      if (level - lastLevel > 1) {
        return { valid: false };
      }
      lastLevel = level;
    }
    return { valid: true };
  }

  private static async fetchRobotsTxt(url: string): Promise<string | null> {
    try {
      const origin = new URL(url).origin;
      const response = await fetch(`${origin}/robots.txt`);
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      // CORS or other fetch error
    }
    return null;
  }
}
