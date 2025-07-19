// Custom logging function for the no-ai extension
const noAILog = {
  info: (...args) => {
    console.log('%c[no-ai]', 'color: #4CAF50; font-weight: bold;', ...args);
    sendToDevTools('info', args.join(' '));
  },
  debug: (...args) => {
    console.log('%c[no-ai DEBUG]', 'color: #2196F3; font-weight: bold;', ...args);
    sendToDevTools('debug', args.join(' '));
  },
  warn: (...args) => {
    console.warn('%c[no-ai WARN]', 'color: #FF9800; font-weight: bold;', ...args);
    sendToDevTools('warn', args.join(' '));
  },
  error: (...args) => {
    console.error('%c[no-ai ERROR]', 'color: #F44336; font-weight: bold;', ...args);
    sendToDevTools('error', args.join(' '));
  },
  success: (...args) => {
    console.log('%c[no-ai SUCCESS]', 'color: #8BC34A; font-weight: bold;', ...args);
    sendToDevTools('success', args.join(' '));
  }
};

// Statistics tracking
window.noAIStats = {
  postsFound: 0,
  postsHidden: 0,
  filterRuns: 0
};

// Send logs to DevTools panel
function sendToDevTools(level, message, data = null) {
  try {
    chrome.runtime.sendMessage({
      type: 'no-ai-log',
      level: level,
      message: message,
      data: data
    });
  } catch (e) {
    // DevTools panel might not be open, ignore errors
  }
}

// Send stats to DevTools panel
function sendStatsToDevTools() {
  try {
    chrome.runtime.sendMessage({
      type: 'no-ai-stats',
      stats: window.noAIStats
    });
  } catch (e) {
    // DevTools panel might not be open, ignore errors
  }
}

// Default AI-related keywords to filter (case-insensitive, except 'AI' which is case-sensitive)
const aiKeywordsCaseSensitive = ["AI"];
const aiKeywordsCaseInsensitive = [
  "artificial intelligence",
  "chatgpt",
  "gpt-4",
  "openai",
  "midjourney",
  "dall-e",
  "machine learning",
  "neural network",
  "llm",
];

// Helper: Find all elements matching selector, including inside shadow roots
function findAllInShadow(root, selector) {
  let results = [];
  if (root.querySelectorAll) {
    results = Array.from(root.querySelectorAll(selector));
  }
  // Traverse shadow roots
  const walker = document.createTreeWalker(root, Node.ELEMENT_NODE, null, false);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.shadowRoot) {
      results = results.concat(findAllInShadow(node.shadowRoot, selector));
    }
  }
  return results;
}

function hideAIposts(customKeywords = []) {
  noAILog.info('Running filter check...');
  window.noAIStats.filterRuns++;
  
  // Try multiple selectors for different Reddit layouts
  const selectors = [
    '[role="article"]',
    '[data-testid="post-container"]',
    '.Post',
    'article',
    'div[data-click-id="body"]',
    'shreddit-post'
  ];
  
  let posts = [];
  // Collect posts from all selectors to avoid missing any
  for (const selector of selectors) {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      posts = posts.concat(Array.from(found));
    }
  }
  
  // Remove duplicates
  posts = Array.from(new Set(posts));
  
  if (posts.length > 0) {
    noAILog.debug(`Found ${posts.length} posts using multiple selectors`);
    window.noAIStats.postsFound = posts.length;
  }
  
  if (posts.length === 0) {
    noAILog.warn('No posts found with any selector');
    sendStatsToDevTools();
    return;
  }
  
  let hiddenCount = 0;
  
  posts.forEach((post, index) => {
    // Skip if already hidden
    if (post.style.display === 'none' || post.hasAttribute('data-no-ai-hidden')) {
      return;
    }
    
    // Try to get the title and body text with improved extraction
    let title = '';
    let body = '';
    
    // Extract title from multiple possible elements
    const titleSelectors = ['h1', 'h2', 'h3', '[data-testid="post-title"]', 'a[data-click-id="body"]'];
    for (const selector of titleSelectors) {
      const titleElem = post.querySelector(selector);
      if (titleElem) {
        title = titleElem.innerText || titleElem.textContent || '';
        if (title.trim()) break;
      }
    }
    
    // Try multiple selectors for post body content
    const bodySelectors = [
      'div[data-click-id="text"]',
      'div[slot="text-body"]',
      'div[data-testid="post-content"]',
      '.RichTextJSON-root',
      '.md',
      'p',
      'span'
    ];
    
    for (const selector of bodySelectors) {
      const bodyElem = post.querySelector(selector);
      if (bodyElem) {
        body = bodyElem.innerText || bodyElem.textContent || '';
        if (body.trim()) break; // Use first non-empty result
      }
    }
    
    // Combine title and body, fallback to full post text
    let text = (title + ' ' + body).trim();
    if (!text) {
      text = post.innerText || post.textContent || '';
    }

    // Add extraction from faceplate-screen-reader-content (including shadow DOM)
    const srElems = findAllInShadow(post, 'faceplate-screen-reader-content');
    for (const srElem of srElems) {
      text += ' ' + (srElem.innerText || srElem.textContent || '');
    }
    text = text.trim();
    
    // Debug: log what is being checked
    noAILog.debug(`Post ${index + 1} text:`, text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    
    let shouldHide = false;
    let matchedKeyword = '';
    
    // Check for exact 'AI' (case-sensitive)
    if (aiKeywordsCaseSensitive.some(keyword => text.includes(keyword))) {
      shouldHide = true;
      matchedKeyword = 'AI';
    }
    
    // Check for other keywords (case-insensitive)
    if (!shouldHide) {
      const lowerText = text.toLowerCase();
      const foundKeyword = aiKeywordsCaseInsensitive.find(keyword => lowerText.includes(keyword)) ||
                          (customKeywords && customKeywords.find(keyword => lowerText.includes(keyword.toLowerCase())));
      if (foundKeyword) {
        shouldHide = true;
        matchedKeyword = foundKeyword;
      }
    }
    
    if (shouldHide) {
      post.style.display = 'none';
      post.setAttribute('data-no-ai-hidden', 'true');
      hiddenCount++;
      noAILog.success(`Hidden post ${index + 1} (matched: "${matchedKeyword}")`);
    }
  });
  
  window.noAIStats.postsHidden = hiddenCount;
  noAILog.info(`Hidden ${hiddenCount} out of ${posts.length} posts`);
  sendStatsToDevTools();
}

// Load custom keywords from storage and run filter
function runWithCustomKeywords() {
  if (!window.browser && window.chrome) {
    window.browser = window.chrome; // Compatibility
  }
  
  if (window.browser && window.browser.storage) {
    window.browser.storage.local.get(['customKeywords'], (result) => {
      const customKeywords = result.customKeywords || [];
      noAILog.info('Loaded custom keywords:', customKeywords);
      hideAIposts(customKeywords);
    });
  } else {
    noAILog.warn('Storage API not available, using default keywords only');
    hideAIposts();
  }
}

// Initial run
noAILog.info('Extension loaded');
runWithCustomKeywords();

// Watch for new content (Reddit loads posts dynamically)
const observer = new MutationObserver((mutations) => {
  let shouldRerun = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if any new nodes contain posts
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const hasPost = node.querySelector && (
            node.querySelector('[role="article"]') ||
            node.querySelector('[data-testid="post-container"]') ||
            node.querySelector('.Post') ||
            node.matches && (
              node.matches('[role="article"]') ||
              node.matches('[data-testid="post-container"]') ||
              node.matches('.Post')
            )
          );
          if (hasPost) {
            shouldRerun = true;
          }
        }
      });
    }
  });
  
  if (shouldRerun) {
    noAILog.debug('New posts detected, re-running filter');
    setTimeout(runWithCustomKeywords, 100); // Small delay to ensure DOM is ready
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

noAILog.info('MutationObserver started');
