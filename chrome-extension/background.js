// Service worker for AnswerEngineer.AI v1 - Hello World extension.
// Logs install/update events; kept minimal so the extension stays self-contained.

chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[AnswerEngineer.AI v1] Extension ${details.reason}.`);
});
