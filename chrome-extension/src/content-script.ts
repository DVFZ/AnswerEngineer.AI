/**
 * Content Script - runs in page context and executes the GEO audit
 * Receives messages from popup and sends back audit results
 */

import { GEOAudit } from './geo-audit';
import { AuditResult } from './types';

declare const chrome: any;

console.log('[AnswerEngineer.AI] Content script started loading...');

try {
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response?: any) => void) => {
    console.log('[AnswerEngineer.AI] Message received:', request);
    
    if (request.action === 'runAudit') {
      console.log('[AnswerEngineer.AI] Audit requested from popup');

      // Run the audit
      GEOAudit.run()
        .then((result: AuditResult) => {
          console.log('[AnswerEngineer.AI] Audit complete:', result);
          sendResponse({
            success: true,
            result: result,
            error: null,
          });
        })
        .catch((error: Error) => {
          console.error('[AnswerEngineer.AI] Audit failed:', error);
          sendResponse({
            success: false,
            result: null,
            error: error.message,
          });
        });

      // Required for async response
      return true;
    }
  });

  console.log('[AnswerEngineer.AI] Content script ready and listening');
} catch (error) {
  console.error('[AnswerEngineer.AI] Content script initialization failed:', error);
}
