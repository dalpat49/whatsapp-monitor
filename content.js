// Check if script is already injected
if (!window.whatsAppMonitorInjected) {
  window.whatsAppMonitorInjected = true;

  //check user notifications
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
    } else {
    }
  });
  

  // Global observer reference
  let activeObserver = null;

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced console log
  const debouncedLog = debounce((message) => {
    console.log(message);
  }, 300); // 300ms delay

  // Function to observe DOM changes
  function observeMessages() {
    // If we already have an active observer, don't create a new one
    if (activeObserver) {
      return;
    }

    
    // Find the chat list container
    const chatList = document.querySelector('div[aria-label="Chat list"]');
    if (!chatList) {
      setTimeout(observeMessages, 1000);
      return;
    }

    console.log('Chat list found');



    // Create observer
    activeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        
        // Check for text content changes in deep spans
        if (mutation.type === 'characterData') {
          const targetNode = mutation.target;
          const parentSpan = targetNode.parentElement;

          if (parentSpan && parentSpan.tagName === 'SPAN') {
            const parentDiv = parentSpan.parentElement;
            const grandParentSpan = parentDiv?.parentElement;
            if (parentDiv && grandParentSpan && grandParentSpan.tagName === 'SPAN') {
              // window.postMessage('New Message Received');

              chrome.runtime.sendMessage(
                {
                  action: 'sendNotification',
                  content: 'New Whatsapp Message!',
                }
              );

            }
          }
        }
      });
    });

    // Observe the chat list
    activeObserver.observe(chatList, {
      childList: true,
      subtree: true,
      characterData: true
    });
    

    console.log('Observer setup complete');
  }

  // Start observing
  observeMessages();

  // Check periodically for chat list, but don't create multiple observers
  setInterval(() => {
    const chatList = document.querySelector('div[aria-label="Chat list"]');
    if (chatList) {
      observeMessages(); // This will only create an observer if one doesn't exist
    }
  }, 5000);
}