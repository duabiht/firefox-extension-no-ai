// Custom logging function for the no-ai extension
const noAILog = {
  info: (...args) => console.log('%c[no-ai]', 'color: #4CAF50; font-weight: bold;', ...args),
  debug: (...args) => console.log('%c[no-ai DEBUG]', 'color: #2196F3; font-weight: bold;', ...args),
  warn: (...args) => console.warn('%c[no-ai WARN]', 'color: #FF9800; font-weight: bold;', ...args),
  error: (...args) => console.error('%c[no-ai ERROR]', 'color: #F44336; font-weight: bold;', ...args),
  success: (...args) => console.log('%c[no-ai SUCCESS]', 'color: #8BC34A; font-weight: bold;', ...args)
};

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

function hideAIposts(customKeywords = []) {
  noAILog.info('Running filter check...');
  
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
  for (const selector of selectors) {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      posts = Array.from(found);
      noAILog.debug(`Found ${posts.length} posts using selector: ${selector}`);
      break;
    }
  }
  
  if (posts.length === 0) {
    noAILog.warn('No posts found with any selector');
    return;
  }
  
  let hiddenCount = 0;
  
  posts.forEach((post, index) => {
    // Skip if already hidden
    if (post.style.display === 'none' || post.hasAttribute('data-no-ai-hidden')) {
      return;
    }
    
    // Try to get the title (h3) and body text separately, then combine
    let title = '';
    let body = '';
    
    // Extract title from h3 elements
    const titleElem = post.querySelector('h3');
    if (titleElem) title = titleElem.innerText || titleElem.textContent || '';
    
    // Try multiple selectors for post body content
    const bodySelectors = [
      'div[data-click-id="text"]',
      'div[slot="text-body"]',
      'div[data-testid="post-content"]',
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
    
    // Fallback to full post text if specific elements not found
    const text = title || body ? (title + ' ' + body).trim() : (post.innerText || post.textContent || '');
    
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
                          customKeywords.find(keyword => lowerText.includes(keyword.toLowerCase()));
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
  
  noAILog.info(`Hidden ${hiddenCount} out of ${posts.length} posts`);
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
