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
  console.log('[no-ai] Running filter check...');
  
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
      console.log(`[no-ai] Found ${posts.length} posts using selector: ${selector}`);
      break;
    }
  }
  
  if (posts.length === 0) {
    console.log('[no-ai] No posts found with any selector');
    return;
  }
  
  let hiddenCount = 0;
  
  posts.forEach((post, index) => {
    // Skip if already hidden
    if (post.style.display === 'none' || post.hasAttribute('data-no-ai-hidden')) {
      return;
    }
    
    const text = post.innerText || post.textContent || '';
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
      console.log(`[no-ai] Hidden post ${index + 1} (matched: "${matchedKeyword}")`);
    }
  });
  
  console.log(`[no-ai] Hidden ${hiddenCount} out of ${posts.length} posts`);
}

// Load custom keywords from storage and run filter
function runWithCustomKeywords() {
  if (!window.browser && window.chrome) {
    window.browser = window.chrome; // Compatibility
  }
  
  if (window.browser && window.browser.storage) {
    window.browser.storage.local.get(['customKeywords'], (result) => {
      const customKeywords = result.customKeywords || [];
      console.log('[no-ai] Loaded custom keywords:', customKeywords);
      hideAIposts(customKeywords);
    });
  } else {
    console.log('[no-ai] Storage API not available, using default keywords only');
    hideAIposts();
  }
}

// Initial run
console.log('[no-ai] Extension loaded');
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
    console.log('[no-ai] New posts detected, re-running filter');
    setTimeout(runWithCustomKeywords, 100); // Small delay to ensure DOM is ready
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('[no-ai] MutationObserver started');
