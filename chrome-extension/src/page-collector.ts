/**
 * Collects page data from the DOM for audit analysis
 * Runs in content script context
 */

import { PageData } from './types';

export class PageCollector {
  static collect(): PageData {
    const url = window.location.href;
    const title = document.title;
    const description = this.getMetaTag('description') || '';
    const canonicalUrl = this.getCanonical();

    return {
      url,
      title,
      description,
      headings: this.getHeadings(),
      canonicalUrl,
      robotsTxt: null, // fetched separately
      sitemapUrl: this.findSitemap(),
      schemaMarkup: this.getSchemaMarkup(),
      lastModified: this.getLastModified(),
      isClientRendered: this.detectClientRendering(),
      htmlSize: document.documentElement.outerHTML.length,
      cssCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
      jsCount: document.querySelectorAll('script').length,
      imageCount: document.querySelectorAll('img').length,
      externalLinks: this.countExternalLinks(),
      internalLinks: this.countInternalLinks(),
      metaTitle: this.getMetaTag('og:title') || title,
      metaDescription: this.getMetaTag('og:description') || description,
    };
  }

  private static getMetaTag(name: string): string {
    const meta =
      document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(`meta[property="${name}"]`);
    return meta?.getAttribute('content') || '';
  }

  private static getCanonical(): string {
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical?.getAttribute('href') || window.location.href;
  }

  private static getHeadings(): string[] {
    return Array.from(document.querySelectorAll('h1, h2, h3')).map(
      (h) => h.textContent || ''
    );
  }

  private static findSitemap(): string | null {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const robots = robotsMeta?.getAttribute('content') || '';
    // Check common sitemap locations
    const common = [
      `${new URL(window.location.href).origin}/sitemap.xml`,
      `${new URL(window.location.href).origin}/sitemap_index.xml`,
    ];
    // In real implementation, you'd fetch robots.txt to find sitemap
    return common[0];
  }

  private static getSchemaMarkup(): any[] {
    const schemas: any[] = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try {
        schemas.push(JSON.parse(script.textContent || ''));
      } catch (e) {
        // Invalid JSON, skip
      }
    });
    return schemas;
  }

  private static getLastModified(): string | null {
    const modified = this.getMetaTag('last-modified');
    if (modified) return modified;

    // Check HTTP headers via another method if available
    return null;
  }

  private static detectClientRendering(): boolean {
    // Check for common SPA indicators
    const indicators = [
      document.querySelector('[data-react-root]'),
      document.querySelector('#__next'), // Next.js
      document.querySelector('#__nuxt'), // Nuxt
      document.querySelector('[ng-app]'), // Angular
    ];
    return indicators.some((ind) => ind !== null);
  }

  private static countExternalLinks(): number {
    const hostname = new URL(window.location.href).hostname;
    return Array.from(document.querySelectorAll('a[href]')).filter((a) => {
      try {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('http')) {
          const linkHostname = new URL(href).hostname;
          return linkHostname !== hostname;
        }
      } catch (e) {
        // Invalid URL, skip
      }
      return false;
    }).length;
  }

  private static countInternalLinks(): number {
    const hostname = new URL(window.location.href).hostname;
    return Array.from(document.querySelectorAll('a[href]')).filter((a) => {
      try {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('/') || href.startsWith('http')) {
          if (href.startsWith('/')) return true;
          const linkHostname = new URL(href).hostname;
          return linkHostname === hostname;
        }
      } catch (e) {
        // Invalid URL, skip
      }
      return false;
    }).length;
  }
}
