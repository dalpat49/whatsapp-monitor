// Keep track of tabs where we've already injected the script
const injectedTabs = new Set();

chrome.tabs.query({
  currentWindow: true
}, function (tabs) {

  tabs.forEach(element => {
    //check that fhe function should run only for the whatsapp not other
    if (element.url.includes('https://web.whatsapp.com/')) {
      startGettingData(element.id, element.status, element.url)
    }
  });

});

// Listen for tab updates
const startGettingData = (tabId, status, url) => {

  if (status === 'complete' &&
    url?.includes('web.whatsapp.com') &&
    !injectedTabs.has(tabId)) {


    // Inject the content script
    chrome.scripting.executeScript({
      target: {
        tabId: tabId
      },
      files: ['content.js']
    }).then(() => {
      injectedTabs.add(tabId);
    }).catch((err) => {
      console.error('Failed to inject content script:', err);
    });
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  chrome.notifications.create('notificationId', {
    type: 'basic',
    iconUrl: 'whatsapp.png',
    title: 'New Message',
    message: request.content,
  }, function (notificationId) {
    // clear notification so that i will not distract
    setTimeout(function () {
      chrome.notifications.clear(notificationId);
    }, 1500); // 1000 ms = 1 second
  });

});

// clean the cache after tab close so that the data will not much be used
chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});