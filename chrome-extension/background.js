// Background service worker - creates right-click context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyImage",
    title: "Verify with RealReveal",
    contexts: ["image"]
  });
  console.log("✅ RealReveal context menu installed");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "verifyImage" && info.srcUrl) {
    // Send message to content script to analyze the image
    chrome.tabs.sendMessage(tab.id, {
      action: "analyzeImage",
      imageUrl: info.srcUrl
    }, (response) => {
      // Handle errors gracefully (e.g., content script not loaded yet)
      if (chrome.runtime.lastError) {
        console.log('Content script not ready:', chrome.runtime.lastError.message);
        // Optionally show a notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'RealReveal',
          message: 'Please reload the page and try again.'
        });
      }
    });
  }
});
