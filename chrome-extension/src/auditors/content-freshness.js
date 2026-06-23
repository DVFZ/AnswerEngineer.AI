/**
 * Auditor #3: Content Freshness
 * Evaluates last modified dates, publishing dates, update frequency
 */
export class ContentFreshnessAuditor {
    static audit(pageData) {
        const findings = [];
        let score = 100;
        // Check for publication date
        const pubDate = this.extractPublicationDate();
        if (pubDate) {
            const age = this.getDaysOld(pubDate);
            findings.push(`Published: ${pubDate.toLocaleDateString()}`);
            if (age > 365) {
                findings.push(`⚠ Content is ${Math.floor(age / 30)} months old`);
                score -= 20;
            }
            else if (age > 90) {
                findings.push(`Content updated ${Math.floor(age / 30)} months ago`);
                score -= 10;
            }
            else {
                findings.push('✓ Content is recently published');
            }
        }
        else {
            findings.push('No publication date found');
            score -= 15;
        }
        // Check for last modified date
        const modifiedDate = this.extractModifiedDate();
        if (modifiedDate) {
            const age = this.getDaysOld(modifiedDate);
            findings.push(`Last modified: ${modifiedDate.toLocaleDateString()}`);
            if (age > 180) {
                findings.push('⚠ Not updated in over 6 months');
                score -= 15;
            }
            else {
                findings.push('✓ Regularly updated');
            }
        }
        else {
            findings.push('No modification date found');
            score -= 10;
        }
        // Check for update frequency hints
        const updateFrequency = this.getUpdateFrequency();
        if (updateFrequency) {
            findings.push(`✓ Update frequency specified: ${updateFrequency}`);
        }
        // Check for date references in content
        const recentDates = this.findRecentDateReferences();
        if (recentDates > 0) {
            findings.push(`✓ ${recentDates} current year date(s) found in content`);
        }
        else {
            findings.push('⚠ No recent date references in content');
            score -= 5;
        }
        // Check for changelog or update history
        if (this.hasChangelogOrHistory()) {
            findings.push('✓ Changelog or update history present');
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
    static extractPublicationDate() {
        // Check meta tags
        const tags = [
            'article:published_time',
            'datePublished',
            'publish_date',
        ];
        for (const tag of tags) {
            const meta = document.querySelector(`meta[property="${tag}"]`) ||
                document.querySelector(`meta[name="${tag}"]`);
            if (meta) {
                const content = meta.getAttribute('content');
                if (content) {
                    return new Date(content);
                }
            }
        }
        // Check JSON-LD
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const data = JSON.parse(script.textContent || '');
                if (data.datePublished) {
                    return new Date(data.datePublished);
                }
            }
            catch (e) {
                // Invalid JSON
            }
        }
        return null;
    }
    static extractModifiedDate() {
        const tags = [
            'article:modified_time',
            'dateModified',
            'last-modified',
        ];
        for (const tag of tags) {
            const meta = document.querySelector(`meta[property="${tag}"]`) ||
                document.querySelector(`meta[name="${tag}"]`);
            if (meta) {
                const content = meta.getAttribute('content');
                if (content) {
                    return new Date(content);
                }
            }
        }
        return null;
    }
    static getDaysOld(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    static getUpdateFrequency() {
        // Check sitemap for updateFrequency
        const meta = document.querySelector('meta[name="updateFrequency"]');
        if (meta) {
            return meta.getAttribute('content');
        }
        return null;
    }
    static findRecentDateReferences() {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        const yearRegex = new RegExp(`\\b(${currentYear}|${lastYear})\\b`);
        const text = document.body.innerText;
        const matches = text.match(yearRegex);
        return matches ? matches.length : 0;
    }
    static hasChangelogOrHistory() {
        const text = document.body.innerText.toLowerCase();
        return (text.includes('changelog') ||
            text.includes('version history') ||
            text.includes('release notes'));
    }
}
//# sourceMappingURL=content-freshness.js.map