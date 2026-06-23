/**
 * Auditor #4: JavaScript Handling
 * Evaluates client-side rendering, critical content visibility, JS errors
 */
export class JsHandlingAuditor {
    static audit(pageData) {
        const findings = [];
        let score = 100;
        // Check if page is client-rendered
        if (pageData.isClientRendered) {
            findings.push('⚠ Client-side rendering detected (SPA)');
            score -= 20;
            // For SPAs, check if critical content is present in initial HTML
            if (!this.hasCriticalContentInHTML()) {
                findings.push('⚠ Critical content not in initial HTML (must run JS)');
                score -= 15;
            }
            else {
                findings.push('✓ Critical content available in initial HTML');
            }
        }
        else {
            findings.push('✓ Server-side rendered (static/dynamic HTML)');
        }
        // Check for script errors that might prevent rendering
        const errorCount = this.estimateScriptErrors();
        if (errorCount > 3) {
            findings.push(`⚠ Multiple script errors detected (${errorCount}+)`);
            score -= 15;
        }
        else if (errorCount > 0) {
            findings.push(`Minor script errors detected (${errorCount})`);
            score -= 5;
        }
        else {
            findings.push('✓ No obvious script errors');
        }
        // Check for render-blocking scripts
        const renderBlocking = this.checkRenderBlockingScripts();
        if (renderBlocking.count > 2) {
            findings.push(`⚠ ${renderBlocking.count} render-blocking scripts`);
            score -= 10;
        }
        else if (renderBlocking.count > 0) {
            findings.push(`${renderBlocking.count} render-blocking script(s)`);
            score -= 5;
        }
        else {
            findings.push('✓ No render-blocking scripts detected');
        }
        // Check script count and size
        if (pageData.jsCount > 20) {
            findings.push(`⚠ High script count (${pageData.jsCount})`);
            score -= 5;
        }
        // Check for deferred/async loading
        const deferredAsync = this.checkDeferredAsyncScripts();
        if (deferredAsync.async + deferredAsync.defer > 3) {
            findings.push(`✓ ${deferredAsync.async + deferredAsync.defer} deferred/async scripts`);
        }
        else {
            findings.push('⚠ Consider using async/defer for non-critical scripts');
            score -= 5;
        }
        // Check for third-party scripts
        const thirdParty = this.checkThirdPartyScripts();
        if (thirdParty > 5) {
            findings.push(`⚠ ${thirdParty} third-party scripts detected`);
            score -= 10;
        }
        else if (thirdParty > 0) {
            findings.push(`${thirdParty} third-party script(s)`);
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
    static hasCriticalContentInHTML() {
        // Check if main content elements are present in initial HTML
        const contentSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.length > 100) {
                return true;
            }
        }
        // Fallback: check if body has substantial text
        return document.body.innerText.length > 500;
    }
    static estimateScriptErrors() {
        // This is a rough estimate; actual errors would require logging from runtime
        // Look for common error patterns in scripts
        let errorCount = 0;
        document.querySelectorAll('script').forEach((script) => {
            const code = script.textContent || '';
            // Check for console.error or common error patterns
            if (code.includes('console.error') || code.includes('throw new Error')) {
                errorCount++;
            }
        });
        return errorCount;
    }
    static checkRenderBlockingScripts() {
        const blocking = { count: 0, urls: [] };
        // Scripts in head without async/defer are render-blocking
        document.querySelectorAll('head script:not([async]):not([defer])').forEach((script) => {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('data:')) {
                blocking.count++;
                blocking.urls.push(src);
            }
        });
        return blocking;
    }
    static checkDeferredAsyncScripts() {
        return {
            async: document.querySelectorAll('script[async]').length,
            defer: document.querySelectorAll('script[defer]').length,
        };
    }
    static checkThirdPartyScripts() {
        const currentDomain = new URL(window.location.href).hostname;
        let count = 0;
        document.querySelectorAll('script[src]').forEach((script) => {
            const src = script.getAttribute('src') || '';
            try {
                const scriptDomain = new URL(src, window.location.href).hostname;
                if (scriptDomain !== currentDomain) {
                    count++;
                }
            }
            catch (e) {
                // Invalid URL, skip
            }
        });
        return count;
    }
}
//# sourceMappingURL=js-handling.js.map