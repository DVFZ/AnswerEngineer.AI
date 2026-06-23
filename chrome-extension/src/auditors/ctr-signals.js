/**
 * Auditor #6: CTR Signals
 * Evaluates meta titles, descriptions, readability, headlines
 */
export class CTRSignalsAuditor {
    static audit(pageData) {
        const findings = [];
        let score = 100;
        // Check meta title
        const title = document.title;
        if (!title || title.length === 0) {
            findings.push('✗ Missing page title');
            score -= 20;
        }
        else if (title.length < 30) {
            findings.push(`⚠ Title too short (${title.length}): "${title}"`);
            score -= 10;
        }
        else if (title.length > 60) {
            findings.push(`⚠ Title too long (${title.length}): "${title}"`);
            score -= 5;
        }
        else {
            findings.push(`✓ Good title (${title.length}): "${title}"`);
        }
        // Check meta description
        const desc = pageData.metaDescription;
        if (!desc || desc.length === 0) {
            findings.push('✗ Missing meta description');
            score -= 15;
        }
        else if (desc.length < 120) {
            findings.push(`⚠ Description too short (${desc.length})`);
            score -= 5;
        }
        else if (desc.length > 160) {
            findings.push(`⚠ Description too long (${desc.length}), may be truncated`);
            score -= 5;
        }
        else {
            findings.push(`✓ Good description (${desc.length} chars)`);
        }
        // Check for CTA elements
        const ctas = this.findCTAElements();
        if (ctas.count > 0) {
            findings.push(`✓ ${ctas.count} call-to-action element(s) found`);
        }
        else {
            findings.push('⚠ No clear CTA found');
            score -= 10;
        }
        // Check headline hierarchy and engagement
        const headlines = this.analyzeHeadlines();
        if (headlines.h1Count === 1) {
            findings.push(`✓ Single H1: "${headlines.h1Text}"`);
        }
        else if (headlines.h1Count === 0) {
            findings.push('✗ Missing H1 heading');
            score -= 15;
        }
        else {
            findings.push(`⚠ Multiple H1s (${headlines.h1Count})`);
            score -= 10;
        }
        if (headlines.subHeadingCount > 2) {
            findings.push(`✓ ${headlines.subHeadingCount} subheadings (good structure)`);
        }
        else {
            findings.push(`⚠ Few subheadings (${headlines.subHeadingCount})`);
            score -= 5;
        }
        // Check content readability metrics
        const readability = this.analyzeReadability();
        if (readability.avgSentenceLength < 20) {
            findings.push('✓ Good sentence length (easy to read)');
        }
        else if (readability.avgSentenceLength < 25) {
            findings.push('⚠ Slightly complex sentences');
            score -= 3;
        }
        else {
            findings.push(`⚠ Complex sentence structure (avg ${Math.round(readability.avgSentenceLength)} words)`);
            score -= 5;
        }
        // Check for lists and formatting
        const formatting = this.analyzeFormatting();
        if (formatting.lists > 0 || formatting.bolds > 5) {
            findings.push('✓ Good use of lists and emphasis');
        }
        else {
            findings.push('⚠ Consider using lists and bold text for scannability');
            score -= 5;
        }
        // Check for image alt text
        const images = this.checkImageAltText();
        if (images.total > 0) {
            const altRatio = (images.withAlt / images.total * 100).toFixed(0);
            if (parseInt(altRatio) >= 80) {
                findings.push(`✓ Most images have alt text (${altRatio}%)`);
            }
            else {
                findings.push(`⚠ ${images.withoutAlt} images missing alt text (${100 - parseInt(altRatio)}%)`);
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
    static findCTAElements() {
        const types = [];
        let count = 0;
        // Look for buttons
        const buttons = document.querySelectorAll('button, a.btn, a[role="button"], input[type="submit"]');
        if (buttons.length > 0) {
            types.push(`${buttons.length} buttons`);
            count += buttons.length;
        }
        // Look for form elements
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
            types.push(`${forms.length} form(s)`);
            count += forms.length;
        }
        // Look for links that might be CTAs
        const ctaLinks = Array.from(document.querySelectorAll('a'))
            .filter((a) => {
            const text = (a.textContent || '').toLowerCase();
            return (text.includes('sign up') ||
                text.includes('get started') ||
                text.includes('learn more') ||
                text.includes('download') ||
                text.includes('join') ||
                text.includes('register'));
        });
        if (ctaLinks.length > 0) {
            types.push(`${ctaLinks.length} CTA link(s)`);
            count += ctaLinks.length;
        }
        return { count, types };
    }
    static analyzeHeadlines() {
        const h1s = document.querySelectorAll('h1');
        const h1Text = h1s[0]?.textContent || '';
        const subHeadings = document.querySelectorAll('h2, h3, h4');
        return {
            h1Count: h1s.length,
            h1Text,
            subHeadingCount: subHeadings.length,
        };
    }
    static analyzeReadability() {
        const text = document.body.innerText;
        // Split into sentences (simple approach)
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length === 0) {
            return { avgSentenceLength: 0 };
        }
        const totalWords = sentences.reduce((sum, sentence) => {
            return sum + sentence.trim().split(/\s+/).length;
        }, 0);
        return {
            avgSentenceLength: totalWords / sentences.length,
        };
    }
    static analyzeFormatting() {
        const lists = document.querySelectorAll('ul, ol').length;
        const bolds = document.querySelectorAll('strong, b').length;
        return { lists, bolds };
    }
    static checkImageAltText() {
        const images = document.querySelectorAll('img');
        let withAlt = 0;
        images.forEach((img) => {
            if (img.getAttribute('alt')) {
                withAlt++;
            }
        });
        return {
            total: images.length,
            withAlt,
            withoutAlt: images.length - withAlt,
        };
    }
}
//# sourceMappingURL=ctr-signals.js.map