/**
 * Standalone Content Script - No module imports
 * Simple listener that logs when it loads
 */

console.log('[AnswerEngineer.AI] ✅ CONTENT SCRIPT INJECTED');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[AnswerEngineer.AI] 📨 Message received:', request);

  if (request.action === 'runAudit') {
    console.log('[AnswerEngineer.AI] 🔍 AUDIT REQUESTED');

    // For now, send back a test response with real page data
    const testResult = {
      success: true,
      result: {
        url: window.location.href,
        timestamp: Date.now(),
        overallScore: Math.floor(Math.random() * 40 + 30), // 30-70 for testing
        points: {
          websiteStructure: { score: Math.floor(Math.random() * 100) },
          schema: { score: Math.floor(Math.random() * 100) },
          contentFreshness: { score: Math.floor(Math.random() * 100) },
          jsHandling: { score: Math.floor(Math.random() * 100) },
          authority: { score: Math.floor(Math.random() * 100) },
          ctrSignals: { score: Math.floor(Math.random() * 100) },
          coverage: { score: Math.floor(Math.random() * 100) },
        },
        recommendations: [
          'Test recommendation 1',
          'Test recommendation 2',
        ],
      },
      error: null,
    };

    console.log('[AnswerEngineer.AI] ✅ AUDIT COMPLETE:', testResult);
    sendResponse(testResult);
  }
});

console.log('[AnswerEngineer.AI] ✅ LISTENER REGISTERED');
