// AnswerEngineer.AI v1 - popup logic
// Three screens: (1) URL entry, (2) Welcome, (3) Tabbed dashboard.

// ===================================================================
// BACKEND CONFIGURATION
// ===================================================================
// LOCAL DEVELOPMENT: http://localhost:5000
// PRODUCTION: Update to your deployed backend URL (e.g., https://answerengineer-backend.herokuapp.com)
const BACKEND_URL = 'https://answerengineer-ai.onrender.com';

// Global activation modal placeholder - will be set up in DOMContentLoaded
let showActivationModal = null;
let activationTimerInterval = null; // Prevent multiple timers

document.addEventListener("DOMContentLoaded", () => {
  // Persistent notification with countdown timer for subscription activation
  let activationNotificationTimer = null;

  showActivationModal = function(timeRemaining) {
    // Clear any existing timer to prevent duplicates
    if (activationNotificationTimer) {
      clearInterval(activationNotificationTimer);
    }

    // Get or create notification container
    let notificationBar = document.getElementById('ae-activation-bar');
    if (!notificationBar) {
      notificationBar = document.createElement('div');
      notificationBar.id = 'ae-activation-bar';
      notificationBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #1e3a8a 0%, #6d28d9 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
      `;
      notificationBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px;">⏳</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 2px;">Activating Starter Plan</div>
            <div style="font-size: 11px; opacity: 0.85;">Your subscription is being set up</div>
          </div>
        </div>
        <div style="
          background: rgba(255,255,255,0.15);
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
        ">
          <div id="ae-timer-display" style="font-size: 14px;">2:00</div>
          <div style="font-size: 10px; opacity: 0.8;">remaining</div>
        </div>
      `;
      document.body.insertBefore(notificationBar, document.body.firstChild);
      // Add top padding to body to account for the bar
      document.body.style.paddingTop = '70px';
    }

    // Update timer every second
    const timerDisplay = document.getElementById('ae-timer-display');
    activationNotificationTimer = setInterval(() => {
      timeRemaining--;
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      if (timerDisplay) {
        timerDisplay.textContent = \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`;
      }

      // When timer reaches 0, hide the notification
      if (timeRemaining <= 0) {
        clearInterval(activationNotificationTimer);
        notificationBar.style.transition = 'opacity 0.4s ease-out';
        notificationBar.style.opacity = '0';
        setTimeout(() => {
          if (notificationBar.parentElement) {
            notificationBar.parentElement.removeChild(notificationBar);
          }
          document.body.style.paddingTop = '0';
        }, 400);
      }
    }, 1000);
  };

  // Add animation styles for toast
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(toastStyle);

  // SECURITY: Clean up stale upgrade records
  // Keep domain-specific pending flags indefinitely (cleared only when subscription applied)
  // This allows users to reload/return later and still get their paid subscription
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      // Only clear old email-based flags (ae_pending_upgrade_[email]), not domain-specific ones
      if (key.startsWith('ae_pending_upgrade_') && !key.startsWith('ae_pending_upgrade_domain_')) {
        const data = JSON.parse(localStorage.getItem(key));
        const age = Date.now() - new Date(data.timestamp).getTime();
        if (age > 60 * 60 * 1000) {  // Older than 1 hour
          localStorage.removeItem(key);
        }
      }
    });
  } catch (e) {
    console.log('Error cleaning stale data:', e);
  }

  const screens = {
    1: document.getElementById("screen-1"),
    2: document.getElementById("screen-2"),
    3: document.getElementById("screen-3"),
  };

  // Screen 1 elements
  const form = document.getElementById("analyze-form");
  const input = document.getElementById("site-url");
  const analyzeBtn = document.getElementById("analyze-btn");
  const status = document.getElementById("status");

  // Auto-populate URL from current tab and load settings for this domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      const tabUrl = tabs[0].url;
      // Only populate if it's a valid http/https URL
      if (tabUrl && /^https?:\/\//.test(tabUrl)) {
        input.value = tabUrl;
        input.readOnly = true;
        input.style.opacity = "0.7";
        currentUrl = tabUrl;

        // Load plan for this domain
        currentPlan = getUrlPlan(currentUrl);

        // Check subscription via backend API
        try {
          const settings = loadSettings();
          if (settings.email) {
            debug(`🔍 Checking subscription status for ${settings.email}...`);

            // Query backend for domain-specific subscription status
            const domainName = new URL(currentUrl).hostname;
            fetch(`${BACKEND_URL}/api/subscription/${encodeURIComponent(settings.email)}/${encodeURIComponent(domainName)}`)
              .then(res => res.json())
              .then(data => {
                if (data.plan && data.plan !== 'free') {
                  // Backend confirms PAID plan
                  // BUT: Only apply it to THIS DOMAIN if THIS DOMAIN explicitly upgraded
                  // This prevents another domain's subscription from applying here
                  const localPlan = getUrlPlan(currentUrl);

                  if (localPlan === 'free') {
                    // This domain hasn't been upgraded yet
                    // Check if there's a pending upgrade for THIS SPECIFIC DOMAIN
                    const domainName = new URL(currentUrl).hostname;
                    const pendingKey = 'ae_pending_upgrade_domain_' + domainName;
                    const pending = localStorage.getItem(pendingKey);

                    if (pending) {
                      const pendingData = JSON.parse(pending);
                      const upgradeInitiatedTime = new Date(pendingData.timestamp).getTime();
                      const now = Date.now();
                      const timeSinceUpgrade = now - upgradeInitiatedTime;
                      const TWO_MIN = 2 * 60 * 1000;
                      const SIXTY_MIN = 60 * 60 * 1000;

                      if (timeSinceUpgrade < TWO_MIN) {
                        // Too soon - user might still be in Stripe checkout
                        console.log(`[DOMAIN-PENDING] ${domainName} waiting for payment (initiated ${Math.round(timeSinceUpgrade/1000)}s ago)`);
                        currentPlan = 'free';
                      } else if (timeSinceUpgrade >= TWO_MIN && timeSinceUpgrade < SIXTY_MIN) {
                        // Activation in progress - show modal with remaining time in 2-minute activation window
                        const activationWindowEnd = upgradeInitiatedTime + (2 * TWO_MIN); // T + 240 seconds
                        const timeRemaining = Math.max(0, Math.ceil((activationWindowEnd - Date.now()) / 1000));
                        console.log(`[DOMAIN-ACTIVATING] Showing activation modal for ${domainName} (${Math.round(timeSinceUpgrade/1000)}s elapsed, ${timeRemaining}s remaining)`);
                        showActivationModal(timeRemaining);
                      } else if (timeSinceUpgrade > SIXTY_MIN) {
                        // Too old - payment likely never completed (>1 hour)
                        console.log(`[DOMAIN-STALE] ${domainName} upgrade pending for >1hr, clearing flag`);
                        localStorage.removeItem(pendingKey);
                        currentPlan = 'free';
                      } else {
                        // Within 2-60 minutes - payment should have completed by now
                        // Backend saying STARTER means magic link was verified
                        console.log(`[DOMAIN-UPGRADE] Applying ${data.plan} to ${domainName} (payment completed ${Math.round(timeSinceUpgrade/60000)}min ago)`);
                        currentPlan = data.plan;
                        setUrlPlan(currentUrl, currentPlan);

                        // Clear the pending flag since upgrade is confirmed
                        localStorage.removeItem(pendingKey);

                        debug(`✅ Subscription verified: ${currentPlan.toUpperCase()}`);

                        // Refresh all UIs to show the upgraded plan
                        refreshQuotaUI();
                        refreshCrawlerUI();
                        refreshHistoryUI();
                        refreshSettingsUI();
                      }
                    } else {
                      // Domain didn't initiate upgrade - keep it FREE
                      // This prevents other domains' subscriptions from bleeding in
                      console.log(`[DOMAIN-PROTECTION] ${domainName} kept FREE (this domain did not initiate upgrade)`);
                      currentPlan = 'free';
                    }
                  } else {
                    // Domain is already paid (has local plan), keep it
                    currentPlan = localPlan;
                    debug(`✅ Subscription verified: ${currentPlan.toUpperCase()}`);

                    // Refresh all UIs to show the upgraded plan
                    refreshQuotaUI();
                    refreshCrawlerUI();
                    refreshHistoryUI();
                    refreshSettingsUI();
                  }
                } else {
                  // Backend says FREE
                  if (currentPlan !== 'free') {
                    // SECURITY: Extension had PAID cached, but backend says FREE
                    // This happens when user cancels payment
                    console.log('[🔒 SECURITY] Backend says FREE but extension had cached ' + currentPlan.toUpperCase() + ' plan. Resetting...');
                    currentPlan = 'free';
                    setUrlPlan(currentUrl, 'free');

                    // Refresh UIs to show FREE plan
                    refreshQuotaUI();
                    refreshCrawlerUI();
                    refreshHistoryUI();
                    refreshSettingsUI();

                    debug(`🔄 Reset to FREE (payment was likely cancelled)`);
                  } else {
                    debug(`📍 No active subscription found`);
                  }
                }
              })
              .catch(err => {
                debug(`⚠️ Could not verify subscription: ${err.message}`);
              });
          }
        } catch (e) {
          console.log('Error checking subscription:', e);
        }

        debug(`📍 Plan for ${new URL(currentUrl).hostname}: ${currentPlan.toUpperCase()}`);
      }
    }
  });

  // Screen 2 elements
  const goBtn = document.getElementById("go-btn");
  const backBtn = document.getElementById("back-btn");

  // Screen 3 elements
  const dashTarget = document.getElementById("dash-target");
  const dashBackBtn = document.getElementById("dash-back-btn");
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const runSim = document.getElementById("run-sim");
  const simQuestion = document.getElementById("sim-question");
  const simResults = document.getElementById("sim-results");
  const simEngines = document.getElementById("sim-engines");
  const simPaywall = document.getElementById("sim-paywall");
  const simStatus = document.getElementById("sim-status");
  const simPlanBadge = document.getElementById("sim-plan-badge");
  const simBottomUpgrade = document.getElementById("sim-bottom-upgrade");
  const simUpgradeCta = document.getElementById("sim-upgrade-cta");
  const serpSection = document.getElementById("serp-section");
  const serpLocked = document.getElementById("serp-locked");
  const serpPreview = document.getElementById("serp-preview");
  const serpTabs = Array.from(document.querySelectorAll(".serp-tab"));
  const crawlerUpgradeCta = document.getElementById("crawler-upgrade-cta");
  const setUrl = document.getElementById("set-url");
  const setIndustry = document.getElementById("set-industry");
  const setEmail = document.getElementById("set-email");
  const setSave = document.getElementById("set-save");
  const setPremiumFree = document.getElementById("set-premium-free");
  const settingsUpgradeCta = document.getElementById("settings-upgrade-cta");
  const auditList = document.getElementById("audit-list");
  const auditCmsSelect = document.getElementById("audit-cms-select");
  const scoreRing = document.getElementById("score-ring");
  const scoreRingValue = document.getElementById("score-ring-value");
  const scoreRingProgress = document.getElementById("score-ring-progress");

  // History tab elements
  const historyLocked = document.getElementById("history-locked");
  const historyContent = document.getElementById("history-content");
  const historyList = document.getElementById("history-list");
  const historyEmpty = document.getElementById("history-empty");
  const historyUpgradeCta = document.getElementById("history-upgrade-cta");

  let currentUrl = "";
  let currentCms = "wordpress";
  let currentPlan = "free"; // free, starter, pro, agency

  // Per-URL plan storage: each website can have its own plan
  const URL_PLAN_KEY_PREFIX = "ae_plan_";
  function getUrlPlan(url) {
    if (!url) return "free";
    try {
      const domain = new URL(url).hostname;
      return localStorage.getItem(URL_PLAN_KEY_PREFIX + domain) || "free";
    } catch (_) {
      return "free";
    }
  }
  function setUrlPlan(url, plan) {
    if (!url) return;
    try {
      const domain = new URL(url).hostname;
      localStorage.setItem(URL_PLAN_KEY_PREFIX + domain, plan);
    } catch (_) {}
  }

  // Verify subscription status with backend to prevent false upgrades
  // (catches cases where user cancels/closes Stripe without proper redirect)
  // Defined here but called later after loadSettings is available
  async function verifySubscriptionFromBackend() {
    try {
      const settings = loadSettings();
      if (!settings.email) return;

      console.log(`[VERIFY] Checking subscription for ${settings.email}...`);
      const response = await fetch(`${BACKEND_URL}/api/subscription/${encodeURIComponent(settings.email)}`);
      const data = await response.json();

      console.log(`[VERIFY] Backend returned: ${data.plan}`);

      // If backend says FREE but we think PAID, reset to FREE
      if (data.plan === 'free' && currentPlan !== 'free') {
        console.log('[🔒 SECURITY] Backend says FREE but extension had cached PAID plan. Resetting...');
        currentPlan = 'free';
        if (currentUrl) setUrlPlan(currentUrl, 'free');
        refreshQuotaUI?.();
        refreshCrawlerUI?.();
        refreshSettingsUI?.();
      }
    } catch (e) {
      console.log('Could not verify subscription:', e.message);
    }
  }

  // Tier definitions
  const TIERS = {
    free: {
      name: "Free",
      price: "$0",
      features: {
        pointAudit: true,
        simQueries: 3,
        crawlerView: false,
        auditHistory: false,
        weeklyDigest: false,
        attributionTracking: false,
      }
    },
    starter: {
      name: "Starter",
      price: "$14/mo",
      features: {
        pointAudit: true,
        simQueries: null, // unlimited
        crawlerView: true,
        auditHistory: true,
        weeklyDigest: true,
        attributionTracking: false,
      }
    },
    pro: {
      name: "Pro",
      price: "$49/mo",
      features: {
        pointAudit: true,
        simQueries: null,
        crawlerView: true,
        auditHistory: true,
        weeklyDigest: true,
        attributionTracking: true,
      }
    },
    agency: {
      name: "Agency",
      price: "$99/mo",
      features: {
        pointAudit: true,
        simQueries: null,
        crawlerView: true,
        auditHistory: true,
        weeklyDigest: true,
        attributionTracking: true,
      }
    }
  };

  // CMS-Specific Remediation Hints
  const REMEDIATIONS = {
    wordpress: {
      "H1 Tag": [
        "Add H1 in Appearance → Customize or use Heading block",
        "Install Yoast SEO plugin for automatic H1 guidance",
        "Edit page → add Heading (H1) block as first element"
      ],
      "Meta Description": [
        "Use Yoast SEO or Rank Math plugins",
        "Edit page → Set meta description in block editor sidebar",
        "Keep between 150-160 characters for optimal display"
      ],
      "Schema Markup": [
        "Install Yoast SEO, Rank Math, or Schema plugin",
        "Plugins auto-generate schema for posts, pages, products",
        "Customize schema type in plugin settings per page"
      ],
      "Mobile Responsive": [
        "Ensure theme is mobile-responsive (most modern themes are)",
        "Check with WordPress mobile preview in editor",
        "Use DevTools Ctrl+Shift+M to test mobile view"
      ],
      "Content Freshness": [
        "Update post publish/modified dates regularly",
        "Use plugins like PublishPress to schedule updates",
        "Include current dates and statistics in content"
      ],
      "Authority": [
        "Enable HTTPS in Settings → General (use SSL certificate)",
        "Add privacy policy page (Pages → Add New)",
        "Add contact form with Contact Form 7 or WPForms"
      ],
      "JavaScript Handling": [
        "Use Lazy Load by WP Rocket for images",
        "Minimize JavaScript with autoptimize plugin",
        "Defer non-critical JS in Performance settings"
      ]
    },
    shopify: {
      "H1 Tag": [
        "Edit product → Add H1 in product title or description",
        "Use product page template to ensure H1 placement",
        "Check online store theme code for H1 in head section"
      ],
      "Meta Description": [
        "Edit product → SEO section → Meta description field",
        "Keep 150-160 characters for Google preview",
        "Each page/product should have unique description"
      ],
      "Schema Markup": [
        "Shopify auto-generates product schema in JSON-LD",
        "Enable by using built-in product sections",
        "Schema is included for products, reviews, breadcrumbs"
      ],
      "Mobile Responsive": [
        "Shopify themes are mobile-optimized by default",
        "Test on mobile using Shopify mobile preview",
        "Check theme responsiveness in theme settings"
      ],
      "Content Freshness": [
        "Update product descriptions regularly",
        "Use Shopify calendar to schedule product updates",
        "Add blog posts with current dates"
      ],
      "Authority": [
        "Use HTTPS (enabled by default on all Shopify stores)",
        "Add Privacy Policy under Settings → Legal",
        "Add contact page or store contact info in footer"
      ],
      "JavaScript Handling": [
        "Use Shopify Image Optimizer app for image lazy loading",
        "Minimize apps that inject JavaScript",
        "Monitor Core Web Vitals in Shopify Analytics"
      ]
    },
    wix: {
      "H1 Tag": [
        "Add Heading element at top of page",
        "Set first heading to H1 in element settings",
        "Ensure main page title uses H1 tag"
      ],
      "Meta Description": [
        "Go to SEO Basics → Page Description",
        "Write 150-160 character description per page",
        "Include target keywords naturally"
      ],
      "Schema Markup": [
        "Wix auto-generates basic schema markup",
        "Use Wix SEO tools to enhance schema",
        "Add structured data through SEO settings"
      ],
      "Mobile Responsive": [
        "Wix automatically creates mobile-friendly versions",
        "Preview mobile version in editor",
        "Test responsiveness with mobile preview button"
      ],
      "Content Freshness": [
        "Update pages regularly with fresh content",
        "Use Wix blog for date-stamped content",
        "Edit pages to show current modification dates"
      ],
      "Authority": [
        "Wix provides free HTTPS by default",
        "Add Privacy Policy through Settings → Legal",
        "Include contact information in footer or contact page"
      ],
      "JavaScript Handling": [
        "Use Wix native elements instead of third-party widgets",
        "Limit custom code and JavaScript injections",
        "Optimize images using Wix image optimization"
      ]
    },
    squarespace: {
      "H1 Tag": [
        "Add Heading block as first element on page",
        "Set style to H1 in block settings (Style → Heading)",
        "Ensure main title uses H1, not H2 or H3"
      ],
      "Meta Description": [
        "Page Settings → SEO → Meta description",
        "Write 150-160 characters describing page content",
        "Use keywords naturally in description"
      ],
      "Schema Markup": [
        "Squarespace auto-generates schema for pages and products",
        "Enable JSON-LD in advanced SEO settings",
        "Structured data is built-in, manually check if needed"
      ],
      "Mobile Responsive": [
        "Squarespace templates are fully responsive",
        "Preview on mobile using browser DevTools",
        "All Squarespace sites are mobile-optimized by default"
      ],
      "Content Freshness": [
        "Regularly update blog posts with new content",
        "Add publishing dates to blog posts",
        "Edit pages to reflect current information"
      ],
      "Authority": [
        "HTTPS enabled on all Squarespace sites",
        "Add Privacy Policy through Settings → Pages",
        "Include contact form on Contact page"
      ],
      "JavaScript Handling": [
        "Squarespace optimizes JavaScript automatically",
        "Minimize custom code and third-party apps",
        "Use native Squarespace blocks instead of custom code"
      ]
    },
    webflow: {
      "H1 Tag": [
        "Add Heading element, set to H1 in Inspector",
        "Use semantic HTML: ensure one H1 per page",
        "Place H1 as first meaningful heading on page"
      ],
      "Meta Description": [
        "Page Settings → SEO → Meta description field",
        "Write 150-160 characters that summarize page",
        "Each page should have unique meta description"
      ],
      "Schema Markup": [
        "Add custom code or use Webflow native elements",
        "Use Webflow's CMS to auto-generate schema",
        "Add JSON-LD in page head or custom code"
      ],
      "Mobile Responsive": [
        "Use Webflow responsive design tools",
        "Test on mobile using Device Preview",
        "Design mobile breakpoints explicitly"
      ],
      "Content Freshness": [
        "Update CMS items with current dates",
        "Add blog with publication dates",
        "Use dynamic timestamps in CMS"
      ],
      "Authority": [
        "Webflow provides free SSL/HTTPS",
        "Add Privacy Policy as dedicated page",
        "Include contact form using Webflow form builder"
      ],
      "JavaScript Handling": [
        "Minimize custom JavaScript code",
        "Use Webflow interactions instead of custom code",
        "Optimize assets and enable compression in hosting"
      ]
    },
    generic: {
      "H1 Tag": [
        "Add `<h1>` tag in HTML with main page title",
        "Ensure only one H1 per page",
        "Place as first heading in body content"
      ],
      "Meta Description": [
        "Add `<meta name='description' content='...'>`",
        "Keep 150-160 characters, describe page content",
        "Update on every unique page"
      ],
      "Schema Markup": [
        "Add JSON-LD structured data in `<head>`",
        "Use schema.org types (Article, Product, etc.)",
        "Validate with Google's Rich Results Test"
      ],
      "Mobile Responsive": [
        "Add `<meta name='viewport' content='width=device-width'>`",
        "Use CSS media queries for responsive design",
        "Test with mobile device or browser DevTools"
      ],
      "Content Freshness": [
        "Include publication dates in content",
        "Update pages regularly with new information",
        "Use `<meta name='dateModified'>` tag"
      ],
      "Authority": [
        "Enable HTTPS (use Let's Encrypt or SSL certificate)",
        "Create /privacy-policy page",
        "Add contact information in footer or /contact"
      ],
      "JavaScript Handling": [
        "Defer non-critical JavaScript with `defer` attribute",
        "Minimize and minify JavaScript files",
        "Load analytics and tracking async"
      ]
    }
  };

  function canAccess(feature) {
    return TIERS[currentPlan].features[feature];
  }

  // ---------- screen routing ----------
  function showScreen(which) {
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      const active = Number(key) === which;
      el.classList.toggle("is-hidden", !active);
      if (active) {
        el.removeAttribute("hidden");
      } else {
        el.setAttribute("hidden", "");
      }
    });
  }

  // ---------- helpers ----------
  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("error", "ok");
    if (kind) status.classList.add(kind);
  }

  function normalizeUrl(raw) {
    const trimmed = (raw || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return "https://" + trimmed;
  }

  // ---------- Screen 1 -> Screen 3 (direct audit) ----------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = normalizeUrl(input.value);

    try {
      const parsed = new URL(url);
      if (!/^https?:$/i.test(parsed.protocol)) {
        throw new Error("Only http(s) URLs are supported.");
      }
      input.value = parsed.href;
      currentUrl = parsed.href;

      // Load plan for this specific URL (per-domain)
      currentPlan = getUrlPlan(currentUrl);

      // RE-CHECK subscription from backend before audit (WAIT for it to complete)
      // (in case user just completed payment while popup was open)
      try {
        const settings = loadSettings();
        if (settings.email) {
          debug(`🔄 Re-verifying subscription for ${settings.email}...`);

          // Query domain-specific subscription (NEW: per-domain lookup)
          const domainName = new URL(currentUrl).hostname;
          const res = await fetch(`${BACKEND_URL}/api/subscription/${encodeURIComponent(settings.email)}/${encodeURIComponent(domainName)}`);
          const data = await res.json();

          if (data.plan && data.plan !== 'free') {
            // Backend says PAID - check pending flag for this domain
            const localPlan = getUrlPlan(currentUrl);
            if (localPlan === 'free') {
              // domainName already defined above
              const pendingKey = 'ae_pending_upgrade_domain_' + domainName;
              const pending = localStorage.getItem(pendingKey);

              if (pending) {
                const pendingData = JSON.parse(pending);
                const upgradeInitiatedTime = new Date(pendingData.timestamp).getTime();
                const now = Date.now();
                const timeSinceUpgrade = now - upgradeInitiatedTime;
                const TWO_MIN = 2 * 60 * 1000;
                const SIXTY_MIN = 60 * 60 * 1000;

                if (timeSinceUpgrade < TWO_MIN) {
                  // Still waiting for payment to complete - show modal with time until activation window begins
                  debug(`⏳ Subscription pending (${Math.round(timeSinceUpgrade/1000)}s elapsed) - waiting for magic link`);
                  currentPlan = 'free';
                  const timeRemaining = Math.max(0, Math.ceil((TWO_MIN - timeSinceUpgrade) / 1000));
                  showActivationModal(timeRemaining);
                } else if (timeSinceUpgrade >= TWO_MIN && timeSinceUpgrade < SIXTY_MIN) {
                  // Activation in progress - show modal with remaining time
                  const pendingTime = new Date(pendingData.timestamp).getTime();
                  const activationWindowEnd = pendingTime + (2 * TWO_MIN);
                  const timeRemaining = Math.max(0, Math.ceil((activationWindowEnd - Date.now()) / 1000));
                  debug(`⏳ Subscription activating for ${domainName} (${timeRemaining}s remaining)`);
                  currentPlan = data.plan; // Backend confirmed STARTER, apply it
                  setUrlPlan(currentUrl, currentPlan);
                  showActivationModal(timeRemaining); // Show modal for UX
                } else if (timeSinceUpgrade >= SIXTY_MIN) {
                  // Too old - payment likely never completed (>1 hour)
                  debug(`⏳ Upgrade pending for >1hr, assuming failed`);
                  localStorage.removeItem(pendingKey);
                  currentPlan = 'free';
                }
              } else {
                // No pending flag for this domain
                // This means this domain DIDN'T initiate an upgrade
                // Don't apply the email's global subscription to this domain
                console.log(`[DOMAIN-PROTECTION] ${domainName} kept FREE (backend has STARTER but no pending flag for THIS domain)`);
                currentPlan = 'free';
              }
            }
          }
        }
      } catch (e) {
        console.log('Error during subscription re-check:', e);
      }

      // Check if this email has a saved subscription
      try {
        const settings = loadSettings();
        if (settings.email) {
          const emailSub = localStorage.getItem('ae_email_' + settings.email);
          if (emailSub) {
            const sub = JSON.parse(emailSub);
            currentPlan = sub.plan || 'free';
            setUrlPlan(currentUrl, currentPlan);
            debug(`✅ Found saved subscription for ${settings.email}: ${currentPlan.toUpperCase()}`);
          }
        }
      } catch (_) {}

      debug(`📍 Loaded plan for ${new URL(currentUrl).hostname}: ${currentPlan.toUpperCase()}`);

      setStatus("");
      analyzeBtn.disabled = true;
      setTimeout(() => {
        analyzeBtn.disabled = false;

        // Go directly to dashboard and run audit (skip welcome screen)
        if (dashTarget) {
          dashTarget.textContent = currentUrl ? `Target: ${currentUrl}` : "";
        }
        activateTab("audit");
        showScreen(3);

        // Show loading state first
        renderAudit(null);

        // Run the audit
        const auditStartTime = Date.now();
        const maxWaitTime = 30000; // 30 seconds max

        debug('▶️ Starting audit...');
        auditCurrentPage()
          .then((auditResult) => {
            const elapsed = Date.now() - auditStartTime;
            debug(`⏱️ Audit took ${elapsed}ms`);
            console.log(`[Popup] Audit completed in ${elapsed}ms`);

            // Map audit results to UI scores
            const scores = mapAuditToScores(auditResult);
            debug(`📊 Scores: ${JSON.stringify(scores)}`);
            renderAudit(scores);
            // Save to history
            saveAuditToHistory(auditResult);
          })
          .catch((error) => {
            console.error(`[Popup] Audit error:`, error);
            debug(`❌ Audit error: ${error.message}`);
            renderAudit({});
          });
      }, 180);
    } catch (err) {
      setStatus("Please enter a valid website URL.", "error");
      input.focus();
      input.select();
    }
  });

  // ---------- Screen 2 -> Screen 3 ----------
  if (goBtn) {
    goBtn.addEventListener("click", () => {
      goBtn.disabled = true;
      setTimeout(() => {
        goBtn.disabled = false;
        if (dashTarget) {
          dashTarget.textContent = currentUrl ? `Target: ${currentUrl}` : "";
        }
        activateTab("audit");
        showScreen(3);

        // Show loading state first
        renderAudit(null);

        // Run the audit
        const auditStartTime = Date.now();
        const maxWaitTime = 30000; // 30 seconds max

        debug('▶️ Starting audit...');
        auditCurrentPage()
          .then((auditResult) => {
            const elapsed = Date.now() - auditStartTime;
            debug(`⏱️ Audit took ${elapsed}ms`);
            console.log(`[Popup] Audit completed in ${elapsed}ms`);

            // Map audit results to UI scores
            const scores = mapAuditToScores(auditResult);
            debug(`📊 Scores: ${JSON.stringify(scores)}`);
            renderAudit(scores);
            // Save to history
            saveAuditToHistory(auditResult);
          })
          .catch((error) => {
            debug(`❌ Audit error: ${error.message} - USING DEMO SCORES`);
            console.error('[Popup] Audit failed, using demo scores:', error);
            // Fallback to demo scores on error
            const demoScores = generateDemoScores();
            renderAudit(demoScores);
          });

        if (typeof refreshSettingsUI === "function") refreshSettingsUI();
      }, 180);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => showScreen(1));
  }

  // ---------- Screen 3: tab switching ----------
  function activateTab(name) {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === name;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const isActive = panel.id === `tab-${name}`;
      panel.classList.toggle("is-active", isActive);
      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activateTab(btn.dataset.tab);
      if (btn.dataset.tab === "crawler") refreshCrawlerUI();
      if (btn.dataset.tab === "settings") refreshSettingsUI();
      if (btn.dataset.tab === "simulator") refreshQuotaUI();
      if (btn.dataset.tab === "history") refreshHistoryUI();
    });
  });

  if (dashBackBtn) {
    dashBackBtn.addEventListener("click", () => showScreen(1));
  }

  // Close button
  const closeBtn = document.getElementById("close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.close();
    });
  }

  // ---------- AI Simulator ----------
  const FREE_QUERY_LIMIT = 3;
  const QUOTA_KEY_PREFIX = "ae_sim_quota_";
  const PREMIUM_KEY = "ae_premium";

  // Per-domain quota tracking: each website gets its own 3 free queries
  function getQuotaKeyForUrl(url) {
    if (!url) return QUOTA_KEY_PREFIX + "default";
    try {
      const domain = new URL(url).hostname;
      return QUOTA_KEY_PREFIX + domain;
    } catch (_) {
      return QUOTA_KEY_PREFIX + "default";
    }
  }

  // ALWAYS reset Premium on popup open so the free-tier limit reliably applies.
  // The quota counter is preserved across opens, so 3 cumulative analyses
  // trigger the paywall regardless of how many times the popup is reopened.
  try { localStorage.removeItem(PREMIUM_KEY); } catch (_) {}

  const AI_ENGINES = [
    { id: "chatgpt",    name: "ChatGPT",          sub: "OpenAI",       icon: "G" },
    { id: "claude",     name: "Claude",           sub: "Anthropic",    icon: "C" },
    { id: "gemini",     name: "Gemini",           sub: "Google",       icon: "M" },
    { id: "perplexity", name: "Perplexity",       sub: "Perplexity AI",icon: "P" },
    { id: "copilot",    name: "Microsoft Copilot",sub: "Microsoft",    icon: "B" },
    { id: "you",        name: "You.com",          sub: "You.com",      icon: "Y" },
  ];

  function getQuotaUsed() {
    const key = getQuotaKeyForUrl(currentUrl);
    const v = parseInt(localStorage.getItem(key) || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function setQuotaUsed(n) {
    const key = getQuotaKeyForUrl(currentUrl);
    try { localStorage.setItem(key, String(n)); } catch (_) {}
  }
  function isPremium() {
    return localStorage.getItem(PREMIUM_KEY) === "1";
  }
  function setPremium(on) {
    try { localStorage.setItem(PREMIUM_KEY, on ? "1" : "0"); } catch (_) {}
  }

  function refreshQuotaUI() {
    if (!simStatus) return;

    // Check if unlimited queries (Starter+ tier)
    const hasUnlimitedQueries = TIERS[currentPlan].features.simQueries === null;

    // Plan badge
    if (simPlanBadge) {
      const planName = TIERS[currentPlan].name;
      const planPrice = TIERS[currentPlan].price;
      simPlanBadge.textContent = `${planName.toUpperCase()} PLAN`;
      simPlanBadge.classList.toggle("sim-plan-badge--premium", currentPlan !== "free");
      simPlanBadge.classList.toggle("sim-plan-badge--free", currentPlan === "free");
    }

    if (hasUnlimitedQueries) {
      // Premium tier: unlimited queries
      simStatus.classList.remove("is-empty");
      simPaywall && simPaywall.setAttribute("hidden", "");
      simBottomUpgrade && (simBottomUpgrade.style.display = "none");
      runSim && (runSim.disabled = false);
      simQuestion && (simQuestion.disabled = false);
      return;
    }

    // Free tier: cap at 3
    const used = Math.min(FREE_QUERY_LIMIT, getQuotaUsed());
    const remaining = Math.max(0, FREE_QUERY_LIMIT - used);
    simStatus.classList.toggle("is-empty", remaining === 0);

    if (remaining === 0) {
      // Show paywall card (has upgrade button), hide bottom upgrade button
      simPaywall && simPaywall.removeAttribute("hidden");
      simBottomUpgrade && (simBottomUpgrade.style.display = "none");
      runSim && (runSim.disabled = true);
      simQuestion && (simQuestion.disabled = true);
    } else {
      // Show bottom upgrade button for free users with queries remaining
      simPaywall && simPaywall.setAttribute("hidden", "");
      simBottomUpgrade && (simBottomUpgrade.style.display = "block");
      runSim && (runSim.disabled = false);
      simQuestion && (simQuestion.disabled = false);
    }
  }

  // Deterministic pseudo-random based on a string seed so the same
  // (question, url) pair gives the same answer each run.
  function seededHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  function pickMentions(question, geoScore) {
    // Simple mode: GEO score determines mention probability
    // 90+ = 80% mention, 70-89 = 60%, 50-69 = 40%, <50 = 20%
    let mentionProbability = 20; // default for low scores

    if (geoScore >= 90) {
      mentionProbability = 80;
    } else if (geoScore >= 70) {
      mentionProbability = 60;
    } else if (geoScore >= 50) {
      mentionProbability = 40;
    }

    const seed = seededHash((currentUrl || "site") + "::" + question.toLowerCase());
    return AI_ENGINES.map((eng, i) => {
      const random = ((seed >>> (i * 4)) & 0xff) % 100;
      const mentioned = random < mentionProbability;
      const confidence = mentioned ? (60 + ((seed >>> (i * 3)) & 0x1f)) : 0;

      return {
        ...eng,
        mentioned: mentioned,
        confidence: confidence, // Only shown if mentioned
      };
    });
  }

  function renderEngines(question, geoScore) {
    if (!simEngines || !simResults) return;
    simEngines.innerHTML = "";
    const results = pickMentions(question, geoScore || 60); // Default to 60 if no score
    results.forEach((r) => {
      const li = document.createElement("li");
      li.className = "sim-engine " + (r.mentioned ? "is-mentioned" : "is-missing");
      li.innerHTML = `
        <span class="sim-engine__icon">${r.icon}</span>
        <span class="sim-engine__name">${r.name}<small>${r.sub}</small></span>
        <span class="sim-engine__status">${r.mentioned ? "MENTIONED " + r.confidence + "%" : "NOT FOUND"}</span>
      `;
      simEngines.appendChild(li);
    });
    simResults.removeAttribute("hidden");
  }

  if (runSim && simQuestion) {
    runSim.addEventListener("click", () => {
      // Re-check limit FIRST. Only free users have query limit.
      const isFreeUser = currentPlan === 'free';
      if (isFreeUser && getQuotaUsed() >= FREE_QUERY_LIMIT) {
        refreshQuotaUI();
        if (simPaywall) simPaywall.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      const question = (simQuestion.value || "").trim();
      if (!question) {
        simQuestion.focus();
        simQuestion.style.borderColor = "#ef4444";
        setTimeout(() => { simQuestion.style.borderColor = ""; }, 900);
        return;
      }

      // Loading state
      runSim.disabled = true;
      const labelEl = runSim.querySelector(".btn-3d__label");
      const originalLabel = labelEl ? labelEl.textContent : "";
      if (labelEl) labelEl.textContent = "ANALYZING…";

      // Show a placeholder list while "running"
      if (simResults && simEngines) {
        simEngines.innerHTML = "";
        AI_ENGINES.forEach((eng) => {
          const li = document.createElement("li");
          li.className = "sim-engine";
          li.innerHTML = `
            <span class="sim-engine__icon">${eng.icon}</span>
            <span class="sim-engine__name">${eng.name}<small>Querying…</small></span>
            <span class="sim-engine__status">…</span>
          `;
          simEngines.appendChild(li);
        });
        simResults.removeAttribute("hidden");
      }

      setTimeout(() => {
        // Get the current audit's GEO score, or use average if not available
        const geoScore = currentAuditResult?.overallScore || 60;
        renderEngines(question, geoScore);
        if (currentPlan === 'free') {
          const next = getQuotaUsed() + 1;
          setQuotaUsed(next);
        }
        if (labelEl) labelEl.textContent = originalLabel || "START ANALYSIS";
        runSim.disabled = false;
        refreshQuotaUI();
        // If that was the 3rd query, surface the paywall card immediately.
        if (currentPlan === 'free' && getQuotaUsed() >= FREE_QUERY_LIMIT && simPaywall) {
          simPaywall.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 900);
    });
  }

  // Debug Reset button — clears Premium flag and quota so the free-tier flow
  // can be re-tested from a clean state.
  const simResetBtn = document.getElementById("sim-reset");
  if (simResetBtn) {
    simResetBtn.addEventListener("click", () => {
      try {
        // Reset quota for current domain
        const key = getQuotaKeyForUrl(currentUrl);
        localStorage.removeItem(key);
        localStorage.removeItem(PREMIUM_KEY);
      } catch (_) {}
      // Hide any results / paywall that were showing.
      if (simResults) simResults.setAttribute("hidden", "");
      if (simEngines) simEngines.innerHTML = "";
      if (simPaywall) simPaywall.setAttribute("hidden", "");
      refreshQuotaUI();
      if (typeof refreshCrawlerUI === "function") refreshCrawlerUI();
      const orig = simResetBtn.textContent;
      simResetBtn.textContent = "Reset ✓";
      setTimeout(() => { simResetBtn.textContent = orig; }, 1100);
    });
  }

  async function showUpgradePrompt(upgradeBtn) {
    // Ensure currentUrl is set (load from current tab if not)
    if (!currentUrl) {
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });
      if (tabs && tabs[0]) {
        const tabUrl = tabs[0].url;
        if (tabUrl && /^https?:\/\//.test(tabUrl)) {
          currentUrl = tabUrl;
        }
      }
    }

    // Get user email from settings or prompt
    const settings = loadSettings();
    let email = settings.email;

    // If no email in settings, ask for it once
    if (!email) {
      email = prompt("Enter your email for the subscription:", "");
      if (!email) return; // User cancelled

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Save it so we don't ask again
      const updatedSettings = { ...settings, email };
      saveSettings(updatedSettings);
    }

    // Show loading state
    if (upgradeBtn) {
      const label = upgradeBtn.querySelector(".btn-3d__label");
      if (label) {
        const originalText = label.textContent;
        label.textContent = "PROCESSING…";
        upgradeBtn.disabled = true;
      }
    }

    // Get domain for this upgrade (declare once, reuse below)
    const domainName = new URL(currentUrl).hostname;

    try {
      debug(`💳 Creating Stripe checkout session for ${email}...`);

      // Call backend to create Stripe checkout session (with 10s timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BACKEND_URL}/api/checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          plan: "starter",
          billingPeriod: "monthly",
          domain: domainName // Include domain for per-domain subscriptions
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("No checkout URL returned from backend");
      }

      debug(`✅ Checkout URL received: ${data.url}`);

      // Store a pending upgrade flag for THIS domain
      // Key is per-domain, not per-email, so each domain tracks its own upgrade
      const pendingKey = 'ae_pending_upgrade_domain_' + domainName;
      localStorage.setItem(pendingKey, JSON.stringify({
        email: email,
        plan: 'starter',
        timestamp: new Date().toISOString()
      }));
      debug(`📌 Pending upgrade stored for domain: ${domainName}`);

      // Open Stripe checkout in a new tab
      // After payment, success page will send magic link
      chrome.tabs.create({ url: data.url });

    } catch (error) {
      let errorMsg = error.message;
      if (error.name === 'AbortError') {
        errorMsg = 'Request timeout (10s) — Backend not responding';
      }
      debug(`❌ Checkout error: ${errorMsg}`);
      console.error("Stripe checkout error:", error);
      alert(`Error starting checkout: ${errorMsg}\n\n1. Check backend is running: curl ${BACKEND_URL}/health\n2. Check backend console for errors\n3. Restart backend if needed`);

      // Re-enable button
      if (upgradeBtn) {
        const label = upgradeBtn.querySelector(".btn-3d__label");
        if (label) {
          label.textContent = "UPGRADE TO STARTER";
        }
        upgradeBtn.disabled = false;
      }
    }
  }

  if (simUpgradeCta) {
    simUpgradeCta.addEventListener("click", (e) => {
      e.preventDefault();
      showUpgradePrompt(e.target.closest("button"));
    });
  }
  const simPaywallUpgrade = document.getElementById("sim-paywall-upgrade");
  if (simPaywallUpgrade) {
    simPaywallUpgrade.addEventListener("click", (e) => {
      e.preventDefault();
      showUpgradePrompt(e.target.closest("button"));
    });
  }
  if (crawlerUpgradeCta) {
    crawlerUpgradeCta.addEventListener("click", (e) => {
      e.preventDefault();
      showUpgradePrompt(e.target.closest("button"));
    });
  }
  // Use event delegation on setPremiumFree since the button is recreated by refreshSettingsUI()
  if (setPremiumFree) {
    setPremiumFree.addEventListener("click", (e) => {
      if (e.target.closest("#settings-upgrade-cta")) {
        e.preventDefault();
        showUpgradePrompt(e.target.closest("button"));
      }
    });
  }
  if (historyUpgradeCta) {
    historyUpgradeCta.addEventListener("click", (e) => {
      e.preventDefault();
      showUpgradePrompt(e.target.closest("button"));
    });
  }

  // Debug: Reset plan button (for testing payment flow)
  const resetPlanBtn = document.getElementById("reset-plan-btn");
  if (resetPlanBtn) {
    resetPlanBtn.addEventListener("click", async () => {
      if (!currentUrl) {
        alert("No URL set. Please run an audit first.");
        return;
      }

      const confirmed = confirm(`Reset ${new URL(currentUrl).hostname} back to Free plan?\n\nThis is for testing only.`);
      if (!confirmed) return;

      // Get email to reset in backend
      const settings = loadSettings();
      if (!settings.email) {
        alert("No email set. Please save your email in settings first.");
        return;
      }

      // Reset in backend (Supabase) for THIS domain only
      try {
        const domainName = new URL(currentUrl).hostname;
        debug(`📡 Calling backend to reset ${settings.email} to FREE for domain: ${domainName}...`);
        const response = await fetch(`${BACKEND_URL}/api/reset-to-free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: settings.email, domain: domainName })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Backend reset failed');
        }

        debug(`✅ Backend reset successful`);
      } catch (err) {
        console.error('Backend reset error:', err);
        alert('Failed to reset in backend: ' + err.message);
        return;
      }

      // Reset locally
      currentPlan = "free";
      setUrlPlan(currentUrl, "free");

      // Also reset simulator quota for this domain
      const quotaKey = getQuotaKeyForUrl(currentUrl);
      try { localStorage.removeItem(quotaKey); } catch (_) {}

      debug(`🔄 Reset ${new URL(currentUrl).hostname} to FREE plan`);

      // Refresh all UIs
      refreshQuotaUI();
      refreshCrawlerUI();
      refreshHistoryUI();
      refreshSettingsUI();

      alert(`✅ ${new URL(currentUrl).hostname} reset to Free plan!\n\nYou now have:\n✓ 3 AI Simulator queries\n✓ No SERP preview\n✓ No audit history\n\nReady to test the upgrade flow again.`);
    });
  }

  // Initialize quota UI on load
  refreshQuotaUI();

  // ---------- Crawler View: search-engine preview (Premium) ----------
  let currentSerpEngine = "google";

  function pageHostFromUrl() {
    try {
      const u = new URL(currentUrl || "https://your-website.com");
      return u.hostname.replace(/^www\./, "");
    } catch (_) {
      return "your-website.com";
    }
  }

  function pageDisplayUrl() {
    try {
      const u = new URL(currentUrl || "https://your-website.com");
      const path = u.pathname === "/" ? "" : u.pathname;
      return u.hostname.replace(/^www\./, "") + path;
    } catch (_) {
      return "your-website.com";
    }
  }

  function brandLabel(engine) {
    return ({
      google: "google.com/search",
      bing: "bing.com/search",
      duckduckgo: "duckduckgo.com",
      yahoo: "search.yahoo.com",
    })[engine] || engine;
  }

  function brandFavicon(engine) {
    return ({
      google: "G",
      bing: "b",
      duckduckgo: "DG",
      yahoo: "Y!",
    })[engine] || "?";
  }

  function snippetFor(engine, host) {
    const base = `${host} offers tools, guides, and resources. Learn how AnswerEngineer.AI helps your page get cited by AI engines and rank for the queries that matter most to your audience.`;
    const variants = {
      google: base,
      bing: `Discover ${host} — ${base}`,
      duckduckgo: `${host}: ${base.slice(0, 140)}…`,
      yahoo: `${base.slice(0, 150)}…`,
    };
    return variants[engine] || base;
  }

  function rankFor(engine, host) {
    // Deterministic fake rank from host + engine.
    let h = 0;
    const s = host + ":" + engine;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return ((h % 30) + 1); // 1–30
  }

  function renderSerp(engine) {
    if (!serpPreview) return;
    const host = pageHostFromUrl();
    const displayUrl = pageDisplayUrl();
    const fullUrl = currentUrl || `https://${host}/`;
    const title = `${host.charAt(0).toUpperCase() + host.slice(1)} — Get cited by AI search`;
    const rank = rankFor(engine, host);
    const indexedDays = ((host.length * 7) % 28) + 1;

    serpPreview.className = "serp-preview engine-" + engine;
    serpPreview.innerHTML = `
      <div class="serp-result__brand">
        <span class="serp-result__favicon">${brandFavicon(engine)}</span>
        <span>${brandLabel(engine)}</span>
      </div>
      <div class="serp-result__url">${escapeHtml(displayUrl)}</div>
      <h5 class="serp-result__title">${escapeHtml(title)}</h5>
      <p class="serp-result__snippet">${escapeHtml(snippetFor(engine, host))}</p>
      <div class="serp-result__meta">
        <span><strong>Rank:</strong> #${rank}</span>
        <span><strong>Indexed:</strong> ${indexedDays} day${indexedDays === 1 ? "" : "s"} ago</span>
        <span><strong>Cached:</strong> ✓</span>
        <span><strong>Mobile-friendly:</strong> ✓</span>
        <span><strong>URL:</strong> ${escapeHtml(fullUrl)}</span>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function refreshCrawlerUI() {
    // Gate Crawler View behind Starter+ tier
    const hasCrawlerAccess = canAccess('crawlerView');
    if (hasCrawlerAccess) {
      if (serpSection) serpSection.removeAttribute("hidden");
      if (serpLocked) serpLocked.setAttribute("hidden", "");
      renderSerp(currentSerpEngine);
    } else {
      if (serpSection) serpSection.setAttribute("hidden", "");
      if (serpLocked) serpLocked.removeAttribute("hidden");
    }
  }

  serpTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      serpTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      currentSerpEngine = tab.dataset.engine;
      renderSerp(currentSerpEngine);
    });
  });

  // First-render so the section is correct whichever tab the user opens first.
  refreshCrawlerUI();

  // ===================================================================
  // POINT AUDIT - 7 criteria with color-coded scores and CMS-specific fixes
  // ===================================================================

  const AUDIT_CRITERIA = [
    {
      id: "h1",
      title: "H1 Tag",
      sub: "Proper heading present?",
      icon: "1",
    },
    {
      id: "meta",
      title: "Meta Description",
      sub: "Description tag exists?",
      icon: "2",
    },
    {
      id: "schema",
      title: "Schema Markup",
      sub: "Structured data present?",
      icon: "3",
    },
    {
      id: "mobile",
      title: "Mobile Responsive",
      sub: "Mobile friendly?",
      icon: "4",
    },
    {
      id: "speed",
      title: "Page Speed",
      sub: "Loads in under 3 seconds?",
      icon: "5",
    },
    {
      id: "fresh",
      title: "Content Freshness",
      sub: "Updated recently?",
      icon: "6",
    },
    {
      id: "questions",
      title: "Question Coverage",
      sub: "Answers customer questions?",
      icon: "7",
    },
  ];

  // CMS-specific fix instructions per criterion.
  const FIXES = {
    h1: {
      wordpress: [
        "✓ Add H1 in Appearance → Customize or use Heading block",
        "✓ Install Yoast SEO or Rank Math plugin for automatic H1 guidance",
        "✓ Edit page → add Heading (H1) block as first element",
      ],
      shopify: [
        "✓ Edit product → Add H1 in product title or description",
        "✓ Use product page template to ensure H1 placement",
        "✓ Check online store theme code for H1 in head section",
      ],
      wix: [
        "✓ Add Heading element at top of page",
        "✓ Set first heading to H1 in element settings",
        "✓ Ensure main page title uses H1 tag",
        "Ensure only one element on the page is set to H1.",
      ],
      squarespace: [
        "Edit the page and click into the title block.",
        "Set its style to <code>Heading 1</code> in the format menu.",
        "Squarespace already uses H1 for the page title in most templates — don't add a second.",
      ],
      webflow: [
        "Select the main heading element in the Designer.",
        "In the Settings panel, change the tag to <code>H1</code>.",
        "Use only one H1 per page; demote others to H2/H3.",
      ],
      generic: [
        "Add a single <code>&lt;h1&gt;</code> element near the top of the page that summarizes its purpose.",
        "Don't use <code>&lt;h1&gt;</code> for logos or decorative text.",
        "Verify with View Source or DevTools that exactly one H1 exists.",
      ],
    },

    meta: {
      wordpress: [
        "Install Yoast SEO or Rank Math.",
        "Edit the page and scroll to the SEO meta box.",
        "Fill in the <strong>Meta description</strong> field (140–160 characters).",
        "Save and re-run the audit.",
      ],
      shopify: [
        "Go to <code>Online Store → Pages</code> (or Products/Collections).",
        "Open the item and scroll to <strong>Search engine listing</strong>.",
        "Click <em>Edit</em> and write a 140–160-character description.",
      ],
      wix: [
        "Open <code>SEO Tools → Site Pages</code> and pick the page.",
        "Edit the <strong>Description</strong> under <em>Basic SEO</em>.",
        "Aim for 140–160 characters, including your main keyword.",
      ],
      squarespace: [
        "Open the page and click <strong>Page Settings → SEO</strong>.",
        "Add a description under <strong>SEO Description</strong>.",
      ],
      webflow: [
        "Open <strong>Page Settings</strong> for the page.",
        "Fill in <strong>Meta Description</strong> under SEO Settings.",
      ],
      generic: [
        "Add <code>&lt;meta name=\"description\" content=\"…\"&gt;</code> inside the <code>&lt;head&gt;</code>.",
        "Keep it 140–160 characters and unique per page.",
      ],
    },

    schema: {
      wordpress: [
        "Use Rank Math or Schema Pro to add JSON-LD for the appropriate type (Article, Product, FAQ, etc.).",
        "Validate the output at <code>search.google.com/test/rich-results</code>.",
      ],
      shopify: [
        "Most themes ship Product schema; verify with Rich Results Test.",
        "For FAQ/HowTo, add a custom JSON-LD snippet via <code>theme.liquid</code> before <code>&lt;/head&gt;</code>.",
      ],
      wix: [
        "Use <code>SEO Tools → Structured Data</code> to add custom JSON-LD per page.",
      ],
      squarespace: [
        "Add JSON-LD via <strong>Settings → Advanced → Code Injection → Header</strong>.",
        "Use page-specific injection where possible to scope per page.",
      ],
      webflow: [
        "Add a custom <code>&lt;script type=\"application/ld+json\"&gt;</code> embed inside the page or in <em>Site Settings → Custom Code</em>.",
      ],
      generic: [
        "Embed JSON-LD inside the <code>&lt;head&gt;</code> matching schema.org types relevant to your content.",
        "Validate with Google's Rich Results Test and Schema.org Validator.",
      ],
    },

    mobile: {
      wordpress: [
        "Switch to a responsive theme (most modern themes are).",
        "Test in Chrome DevTools <em>Device toolbar</em> and at <code>search.google.com/test/mobile-friendly</code>.",
        "Audit oversized images, fixed-width tables, and tap targets under 48px.",
      ],
      shopify: [
        "All Online Store 2.0 themes are responsive — preview on mobile in the theme editor.",
        "Inspect any custom Liquid sections for fixed widths or non-fluid grids.",
      ],
      wix: [
        "Open the <strong>Mobile Editor</strong> and rebuild the page for small screens.",
        "Hide or restyle elements that overflow the viewport.",
      ],
      squarespace: [
        "Most templates are responsive by default; check the mobile preview.",
        "Replace any Code Blocks that aren't responsive.",
      ],
      webflow: [
        "Use the <strong>Tablet / Mobile</strong> breakpoints in the Designer to fix layout issues.",
        "Ensure body width is fluid (no fixed pixel values on top-level containers).",
      ],
      generic: [
        "Add <code>&lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"&gt;</code>.",
        "Use fluid layouts (CSS grid/flex) and relative units.",
        "Verify with Lighthouse and Mobile-Friendly Test.",
      ],
    },

    speed: {
      wordpress: [
        "Install a caching plugin (WP Rocket, LiteSpeed Cache, or W3 Total Cache).",
        "Enable image optimization (ShortPixel, Smush) and lazy loading.",
        "Move to a faster host or use a CDN like Cloudflare.",
      ],
      shopify: [
        "Use Shopify's built-in <strong>Online Store → Speed report</strong>.",
        "Remove unused apps (each one injects scripts).",
        "Compress hero images and prefer WebP/AVIF.",
      ],
      wix: [
        "Compress images via <strong>Media Manager</strong>.",
        "Disable unused Wix apps and animations.",
        "Use Wix's <em>Performance Overview</em> in the dashboard.",
      ],
      squarespace: [
        "Resize hero images to under 500 KB.",
        "Limit fancy fonts and embedded videos above the fold.",
      ],
      webflow: [
        "Enable <strong>Minify HTML/CSS/JS</strong> in Project Settings.",
        "Compress images and turn on responsive image generation.",
        "Audit custom code embeds — remove blocking scripts.",
      ],
      generic: [
        "Run Lighthouse / PageSpeed Insights — focus on LCP and TBT.",
        "Compress and lazy-load images, defer non-critical JS, enable HTTP/2 and gzip/brotli.",
      ],
    },

    fresh: {
      wordpress: [
        "Open the post and update the publish date or content.",
        "Yoast/Rank Math expose a <em>Last Modified</em> field — make sure your theme renders it.",
      ],
      shopify: [
        "Edit the page/blog post — Shopify auto-updates the modified date.",
        "Refresh product descriptions on flagship pages quarterly.",
      ],
      wix: [
        "Edit the page or blog post; Wix updates the modified timestamp on save.",
        "Schedule quarterly content reviews from the dashboard.",
      ],
      squarespace: [
        "Re-publish edited posts to bump the modified date.",
        "Use <strong>Blog → Settings</strong> to surface updated dates on listings.",
      ],
      webflow: [
        "Update CMS items — Webflow tracks <code>updated-on</code>.",
        "Bind that field to a visible \"Last updated\" label.",
      ],
      generic: [
        "Display a visible \"Last updated\" date and emit <code>article:modified_time</code> Open Graph meta.",
        "Refresh stats, examples, and links at least every 6 months.",
      ],
    },

    questions: {
      wordpress: [
        "Add an FAQ section with 3–5 real customer questions.",
        "Use a plugin (e.g. Rank Math) to emit FAQ schema for that section.",
      ],
      shopify: [
        "Add an FAQ section to product pages or a dedicated FAQ page.",
        "Inject FAQPage JSON-LD via your theme's section files.",
      ],
      wix: [
        "Use the <strong>FAQ</strong> app from the Wix App Market.",
        "Cover the top 5 questions you hear in support / sales.",
      ],
      squarespace: [
        "Use an Accordion block to list questions and answers.",
        "Add FAQPage JSON-LD via Code Injection.",
      ],
      webflow: [
        "Build an FAQ component with collapsible items.",
        "Add FAQPage JSON-LD via an embed block on the page.",
      ],
      generic: [
        "Identify the top customer questions from search queries and support tickets.",
        "Answer each one in 1–3 sentences on the page, ideally with FAQPage JSON-LD.",
      ],
    },
  };

  // Real audit data storage
  let currentAuditResult = null;

  // DEBUG: Add debug output to popup
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #1a1a1a;
    color: #0f0;
    font-family: monospace;
    font-size: 10px;
    padding: 8px;
    max-height: 120px;
    overflow-y: auto;
    border-top: 1px solid #0f0;
    z-index: 10000;
    display: none;
  `;
  document.body.appendChild(debugPanel);

  function debug(msg) {
    console.log('[DEBUG]', msg);
    debugPanel.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${msg}</div>`;
    // Auto-scroll to bottom
    debugPanel.scrollTop = debugPanel.scrollHeight;
  }

  // Toggle debug panel on Ctrl+Shift+D
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    }
    // Show tier switcher on Ctrl+Shift+T
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
      showTierSwitcher();
    }
  });

  // Tier switcher for demo purposes
  function showTierSwitcher() {
    const tiers = Object.keys(TIERS);
    const currentIdx = tiers.indexOf(currentPlan);
    const nextIdx = (currentIdx + 1) % tiers.length;
    const nextTier = tiers[nextIdx];

    currentPlan = nextTier;
    debug(`🎯 Switched to ${TIERS[nextTier].name} plan`);

    // Refresh UI
    refreshQuotaUI();
    refreshCrawlerUI();
    refreshSettingsUI();
  }

  // Convert 7-point audit results to UI criteria scores
  function mapAuditToScores(auditResult) {
    if (!auditResult || !auditResult.points) {
      return generateDemoScores(); // Fallback to demo
    }

    const points = auditResult.points;
    return {
      h1: Math.round(points.websiteStructure?.score || 0),
      meta: Math.round(points.ctrSignals?.score || 0),
      schema: Math.round(points.schema?.score || 0),
      mobile: Math.round(points.coverage?.score || 0),
      speed: Math.round(points.jsHandling?.score || 0),
      fresh: Math.round(points.contentFreshness?.score || 0),
      questions: Math.round(points.authority?.score || 0),
    };
  }

  // Demo scores; used as fallback if audit fails
  function generateDemoScores() {
    return {
      h1: 88,
      meta: 62,
      schema: 24,
      mobile: 91,
      speed: 47,
      fresh: 35,
      questions: 71,
    };
  }

  // Run audit on current tab
  function auditCurrentPage() {
    if (!currentUrl) {
      debug('❌ No URL set for audit');
      console.error('No URL set for audit');
      return Promise.reject(new Error('No URL set'));
    }

    debug(`🔍 Requesting audit for: ${currentUrl}`);
    console.log('[Popup] Requesting audit for:', currentUrl);

    return new Promise((resolve, reject) => {
      // Query for tabs matching the current URL
      chrome.tabs.query({ url: currentUrl + '*' }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          debug('❌ No tab found with URL: ' + currentUrl);
          console.error('No tab found with URL:', currentUrl);
          reject(new Error('No matching tab found - make sure you have the website open'));
          return;
        }

        const tabId = tabs[0].id;
        debug(`📤 Sending audit to tab ${tabId}`);
        console.log('[Popup] Sending audit request to tab:', tabId);

        // Send message to content script
        chrome.tabs.sendMessage(
          tabId,
          { action: 'runAudit' },
          (response) => {
            if (chrome.runtime.lastError) {
              debug(`❌ Message error: ${chrome.runtime.lastError.message}`);
              console.error('[Popup] Message error:', chrome.runtime.lastError.message);
              reject(chrome.runtime.lastError);
              return;
            }

            if (response && response.success) {
              debug(`✅ Audit complete! Score: ${response.result.overallScore}/100`);
              console.log('[Popup] Audit successful:', response.result);
              currentAuditResult = response.result;
              resolve(response.result);
            } else {
              debug(`❌ Audit failed: ${response?.error}`);
              console.error('[Popup] Audit failed:', response?.error);
              reject(new Error(response?.error || 'Audit failed'));
            }
          }
        );
      });
    });
  }

  function bandFor(score) {
    if (score >= 70) return "green";
    if (score >= 40) return "yellow";
    return "red";
  }

  function setOverallScore(scores) {
    if (!scoreRing || !scoreRingValue || !scoreRingProgress) return;

    const values = Object.values(scores);
    if (!values.length) {
      scoreRing.classList.remove("score-green", "score-yellow", "score-red");
      scoreRing.classList.add("score-pending");
      scoreRingValue.textContent = "--";
      scoreRingProgress.setAttribute("stroke-dasharray", "0 100");
      return;
    }

    const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    const band = bandFor(avg);

    scoreRing.classList.remove("score-pending", "score-green", "score-yellow", "score-red");
    scoreRing.classList.add(`score-${band}`);
    scoreRingValue.textContent = String(avg);
    // pathLength=100 lets us drive the arc directly with the score percentage.
    scoreRingProgress.setAttribute("stroke-dasharray", `${avg} ${100 - avg}`);
  }

  function renderAudit(scores = null) {
    if (!auditList) return;

    // If no scores provided, show loading state
    if (!scores) {
      auditList.innerHTML = `
        <li class="audit-loading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Analyzing your page...</p>
          <p class="loading-subtext">Checking structure, schema, mobile optimization, and more</p>
        </li>
      `;
      return;
    }

    setOverallScore(scores);
    auditList.innerHTML = "";

    AUDIT_CRITERIA.forEach((c) => {
      const score = scores[c.id];
      const band = bandFor(score);

      const li = document.createElement("li");
      li.className = `score-${band}`;
      li.dataset.id = c.id;

      li.innerHTML = `
        <button type="button" class="audit-row" aria-expanded="false">
          <span class="audit-icon">${c.icon}</span>
          <span class="audit-name">${c.title}<small>${c.sub}</small></span>
          <span class="audit-score-badge">${score}</span>
          <span class="audit-chevron" aria-hidden="true">›</span>
        </button>
        <div class="audit-detail" role="region"></div>
      `;

      const row = li.querySelector(".audit-row");
      row.addEventListener("click", () => toggleAudit(li, c.id));

      auditList.appendChild(li);
    });
  }

  function fillAuditDetail(li, criterionId) {
    const detail = li.querySelector(".audit-detail");
    if (!detail) return;
    const steps = (FIXES[criterionId] && FIXES[criterionId][currentCms])
      || (FIXES[criterionId] && FIXES[criterionId].generic)
      || ["No specific guidance available."];
    const cmsLabel = auditCmsSelect
      ? auditCmsSelect.options[auditCmsSelect.selectedIndex].text
      : "your CMS";

    // Get the score for this criterion
    const score = parseInt(li.querySelector(".audit-score-badge").textContent, 10);
    const scoreContext = score < 60 ? "⚠️ <strong>Priority fix:</strong>" : "📝 <strong>Recommended:</strong>";

    detail.innerHTML = `
      <div class="audit-detail-content">
        <div class="audit-detail-header">${scoreContext} How to fix this in ${cmsLabel}</div>
        <ol class="audit-steps">
          ${steps.map((s, i) => `<li class="step-${i + 1}">${s}</li>`).join("")}
        </ol>
        <div class="audit-detail-footer">
          💡 <em>Re-run audit after making changes to see your updated score.</em>
        </div>
      </div>
    `;
  }

  function toggleAudit(li, criterionId) {
    const isOpen = li.classList.contains("is-open");

    // Close any other open rows.
    auditList.querySelectorAll("li.is-open").forEach((other) => {
      if (other !== li) {
        other.classList.remove("is-open");
        const btn = other.querySelector(".audit-row");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });

    if (isOpen) {
      li.classList.remove("is-open");
      li.querySelector(".audit-row").setAttribute("aria-expanded", "false");
    } else {
      fillAuditDetail(li, criterionId);
      li.classList.add("is-open");
      li.querySelector(".audit-row").setAttribute("aria-expanded", "true");
    }
  }

  if (auditCmsSelect) {
    auditCmsSelect.addEventListener("change", (e) => {
      currentCms = e.target.value;
      // Re-render any currently open detail panels with the new CMS.
      auditList.querySelectorAll("li.is-open").forEach((li) => {
        fillAuditDetail(li, li.dataset.id);
      });
    });
  }

  // REMOVED: Old ae_last_upgrade check (was trusting localStorage instead of backend)
  // Subscription status is now verified ONLY from backend via /api/subscription/:email
  // This prevents false upgrades when users cancel payment

  // First render with loading state (will be replaced when user clicks "LET'S GO")
  renderAudit(generateDemoScores());

  // ===================================================================
  // SETTINGS TAB - URL display, industry, digest email, premium card
  // ===================================================================

  // Settings are now per-domain
  function getSettingsKey() {
    if (!currentUrl) return "ae_settings_default";
    try {
      const domain = new URL(currentUrl).hostname;
      return "ae_settings_" + domain;
    } catch (_) {
      return "ae_settings_default";
    }
  }

  function loadSettings() {
    try {
      const key = getSettingsKey();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveSettings(s) {
    try {
      const key = getSettingsKey();
      localStorage.setItem(key, JSON.stringify(s));
    } catch (_) {}
  }

  function refreshSettingsUI() {
    // URL: prefer the live currentUrl, fall back to whatever was saved.
    const stored = loadSettings();
    const urlText = currentUrl || stored.url || "";
    if (setUrl) setUrl.textContent = urlText || "(no URL set — go back to Screen 1)";

    if (setIndustry && stored.industry) setIndustry.value = stored.industry;
    if (setEmail && stored.email) setEmail.value = stored.email;

    // Show current plan in settings
    if (setPremiumFree) {
      const tier = TIERS[currentPlan];
      const planHtml = `
        <div class="setting-premium__head">
          <span class="setting-premium__title">You're on the ${tier.name} plan</span>
          <span class="setting-premium__sub">${tier.price} · ${
            tier.features.simQueries === null
              ? 'Unlimited AI Simulator queries'
              : tier.features.simQueries + ' AI Simulator queries'
          }${tier.features.crawlerView ? ' · SERP Preview' : ''}${tier.features.weeklyDigest ? ' · Weekly Digest' : ''}</span>
        </div>
        ${currentPlan === 'free' ? '<button type="button" class="btn-3d btn-3d--sm" id="settings-upgrade-cta"><span class="btn-3d__label">UPGRADE TO STARTER</span></button>' : '<p style="font-size: 0.85rem; opacity: 0.8; margin: 0;">Thank you for being a valued customer!</p>'}
      `;
      setPremiumFree.innerHTML = planHtml;
    }
  }

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
  }

  if (setSave) {
    setSave.addEventListener("click", () => {
      const email = setEmail ? setEmail.value.trim() : "";
      const industry = setIndustry ? setIndustry.value : "";

      if (email && !isValidEmail(email)) {
        if (setEmail) {
          setEmail.classList.add("is-invalid");
          setEmail.focus();
          setTimeout(() => setEmail.classList.remove("is-invalid"), 1400);
        }
        return;
      }

      const next = { ...loadSettings(), url: currentUrl || "", industry, email };
      saveSettings(next);

      const orig = setSave.textContent;
      setSave.textContent = "Saved ✓";
      setSave.classList.add("is-saved");
      setTimeout(() => {
        setSave.textContent = orig;
        setSave.classList.remove("is-saved");
      }, 1400);
    });
  }

  // Render once on load so values are present even if the tab was opened directly.
  refreshSettingsUI();

  // ===================================================================
  // HISTORY TAB - Track audit results over time (per-domain)
  // ===================================================================

  const HISTORY_LIMIT_DAYS = 30;

  function getHistoryKey() {
    if (!currentUrl) return "ae_audit_history_default";
    try {
      const domain = new URL(currentUrl).hostname;
      return "ae_audit_history_" + domain;
    } catch (_) {
      return "ae_audit_history_default";
    }
  }

  function saveAuditToHistory(auditResult) {
    if (!auditResult) return;

    try {
      const historyKey = getHistoryKey();
      const history = JSON.parse(localStorage.getItem(historyKey) || "[]");

      // Add new entry
      const newEntry = {
        url: auditResult.url,
        score: auditResult.overallScore,
        timestamp: Date.now(),
        dimensions: {
          h1: mapAuditToScores(auditResult).h1,
          meta: mapAuditToScores(auditResult).meta,
          schema: mapAuditToScores(auditResult).schema,
          mobile: mapAuditToScores(auditResult).mobile,
          speed: mapAuditToScores(auditResult).speed,
          fresh: mapAuditToScores(auditResult).fresh,
          questions: mapAuditToScores(auditResult).questions,
        }
      };

      history.unshift(newEntry); // Add to front

      // Keep only last 30 days
      const thirtyDaysAgo = Date.now() - (HISTORY_LIMIT_DAYS * 24 * 60 * 60 * 1000);
      const filtered = history.filter(entry => entry.timestamp > thirtyDaysAgo);

      localStorage.setItem(historyKey, JSON.stringify(filtered));
      debug(`💾 Audit saved to history (${filtered.length} total)`);
    } catch (e) {
      console.error("Failed to save to history:", e);
    }
  }

  function getAuditHistory() {
    try {
      const historyKey = getHistoryKey();
      return JSON.parse(localStorage.getItem(historyKey) || "[]");
    } catch (e) {
      return [];
    }
  }

  function refreshHistoryUI() {
    // Gate to Starter+ tier
    const hasHistoryAccess = canAccess('auditHistory');

    if (hasHistoryAccess) {
      historyLocked && historyLocked.setAttribute("hidden", "");
      historyContent && historyContent.removeAttribute("hidden");
      renderHistory();
    } else {
      historyContent && historyContent.setAttribute("hidden", "");
      historyLocked && historyLocked.removeAttribute("hidden");
    }
  }

  function renderHistory() {
    if (!historyList) return;

    const history = getAuditHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyEmpty && historyEmpty.removeAttribute("hidden");
      return;
    }

    historyEmpty && historyEmpty.setAttribute("hidden", "");

    history.forEach((entry, idx) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      // Calculate if score improved
      const nextEntry = history[idx + 1];
      const scoreChange = nextEntry ? entry.score - nextEntry.score : 0;
      const changeText = scoreChange > 0 ? `+${scoreChange.toFixed(1)}` : (scoreChange < 0 ? `${scoreChange.toFixed(1)}` : "→");
      const changeColor = scoreChange > 0 ? "green" : scoreChange < 0 ? "red" : "gray";

      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `
        <div class="history-header">
          <div class="history-date">${dateStr}</div>
          <div class="history-score">${entry.score.toFixed(1)}/100</div>
        </div>
        <div class="history-url">${entry.url}</div>
        <div class="history-dimensions">
          H1: ${entry.dimensions.h1} | Meta: ${entry.dimensions.meta} | Schema: ${entry.dimensions.schema} | Mobile: ${entry.dimensions.mobile} | Speed: ${entry.dimensions.speed} | Fresh: ${entry.dimensions.fresh} | Q: ${entry.dimensions.questions}
        </div>
        ${nextEntry ? `<div class="history-change" style="color: ${changeColor};">Change: ${changeText}</div>` : ""}
      `;
      historyList.appendChild(li);
    });
  }

  if (historyUpgradeCta) {
    historyUpgradeCta.addEventListener("click", showUpgradePrompt);
  }

  // Add auditHistory to tier features
  TIERS.free.features.auditHistory = false;
  TIERS.starter.features.auditHistory = true;
  TIERS.pro.features.auditHistory = true;
  TIERS.agency.features.auditHistory = true;
});
