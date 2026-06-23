/**
 * Auditor #5: Authority & Trustworthiness
 * Evaluates HTTPS, domain age, SSL cert, contact info, privacy policy
 */

import { AuditPoint, PageData } from '../types';

export class AuthorityAuditor {
  static async audit(pageData: PageData): Promise<AuditPoint> {
    const findings: string[] = [];
    let score = 100;

    // Check HTTPS
    const isHttps = new URL(pageData.url).protocol === 'https:';
    if (isHttps) {
      findings.push('✓ HTTPS enabled');
    } else {
      findings.push('✗ Not using HTTPS (critical security issue)');
      score -= 30;
    }

    // Check SSL certificate validity
    if (isHttps) {
      const sslValid = await this.checkSSLCert(pageData.url);
      if (sslValid) {
        findings.push('✓ Valid SSL certificate');
      } else {
        findings.push('⚠ SSL certificate issues');
        score -= 15;
      }
    }

    // Check for contact information
    const contactInfo = this.findContactInfo();
    if (contactInfo.email) {
      findings.push(`✓ Contact email present: ${contactInfo.email}`);
    } else {
      findings.push('⚠ No contact email found');
      score -= 10;
    }

    if (contactInfo.phone) {
      findings.push(`✓ Phone number present`);
    }

    if (contactInfo.address) {
      findings.push(`✓ Physical address found`);
    }

    // Check for privacy policy
    if (this.hasPrivacyPolicy()) {
      findings.push('✓ Privacy policy present');
    } else {
      findings.push('⚠ No privacy policy found');
      score -= 10;
    }

    // Check for terms of service
    if (this.hasTermsOfService()) {
      findings.push('✓ Terms of service present');
    } else {
      findings.push('⚠ No terms of service found');
      score -= 5;
    }

    // Check for author information
    const authorInfo = this.findAuthorInfo();
    if (authorInfo) {
      findings.push(`✓ Author information present`);
    } else {
      findings.push('⚠ No author/organization information');
      score -= 5;
    }

    // Check for social proof
    const socialLinks = this.findSocialLinks();
    if (socialLinks.length > 0) {
      findings.push(`✓ Social media links present (${socialLinks.length})`);
    } else {
      findings.push('⚠ No social media presence linked');
      score -= 5;
    }

    // Check for About page
    if (this.hasAboutPage()) {
      findings.push('✓ About page present');
    }

    // Domain age estimation (would need external API in real implementation)
    // For now, we'll note this as a limitation
    findings.push('ℹ Domain age check requires external API');

    return {
      id: 'authority',
      name: 'Authority & Trustworthiness',
      score: Math.max(0, score),
      weight: 1.3,
      findings,
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
    };
  }

  private static async checkSSLCert(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      // If we get a successful response, SSL is valid
      return response.ok || response.status === 405; // 405 means method not allowed but SSL is valid
    } catch (e) {
      return false;
    }
  }

  private static findContactInfo(): {
    email: string | null;
    phone: string | null;
    address: string | null;
  } {
    const result = {
      email: null as string | null,
      phone: null as string | null,
      address: null as string | null,
    };

    // Look for email
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      result.email = emailLink.getAttribute('href')?.replace('mailto:', '') || null;
    }

    // Look for phone
    const phoneLink = document.querySelector('a[href^="tel:"]');
    if (phoneLink) {
      result.phone = phoneLink.getAttribute('href')?.replace('tel:', '') || null;
    }

    // Look for address in common locations
    const addressCandidates = document.querySelectorAll('[itemtype*="PostalAddress"], .address, [data-address]');
    if (addressCandidates.length > 0) {
      result.address = addressCandidates[0].textContent?.trim() || null;
    }

    return result;
  }

  private static hasPrivacyPolicy(): boolean {
    const links = document.querySelectorAll('a');
    const text = document.body.innerText.toLowerCase();

    for (const link of links) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const linkText = link.textContent?.toLowerCase() || '';

      if (
        href.includes('privacy') ||
        linkText.includes('privacy policy') ||
        linkText.includes('privacy')
      ) {
        return true;
      }
    }

    return text.includes('privacy policy');
  }

  private static hasTermsOfService(): boolean {
    const links = document.querySelectorAll('a');
    const text = document.body.innerText.toLowerCase();

    for (const link of links) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const linkText = link.textContent?.toLowerCase() || '';

      if (
        href.includes('terms') ||
        linkText.includes('terms of service') ||
        linkText.includes('terms') ||
        linkText.includes('tos')
      ) {
        return true;
      }
    }

    return text.includes('terms of service');
  }

  private static findAuthorInfo(): string | null {
    // Check for author meta tag
    const authorMeta =
      document.querySelector('meta[name="author"]') ||
      document.querySelector('meta[property="article:author"]');

    if (authorMeta) {
      return authorMeta.getAttribute('content');
    }

    // Check JSON-LD for author
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data.author) {
          return data.author.name || data.author;
        }
      } catch (e) {
        // Invalid JSON
      }
    }

    return null;
  }

  private static findSocialLinks(): string[] {
    const socials = ['twitter', 'facebook', 'linkedin', 'instagram', 'youtube', 'pinterest'];
    const found: string[] = [];

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      for (const social of socials) {
        if (href.includes(social) && !found.includes(social)) {
          found.push(social);
        }
      }
    });

    return found;
  }

  private static hasAboutPage(): boolean {
    const links = document.querySelectorAll('a[href]');

    for (const link of links) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const text = (link.textContent || '').toLowerCase();

      if (href.includes('about') || text.includes('about')) {
        return true;
      }
    }

    return false;
  }
}
