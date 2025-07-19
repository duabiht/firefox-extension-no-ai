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
  // Reddit posts have the 'Post' role
  const posts = document.querySelectorAll('[role="article"]');
  posts.forEach(post => {
    const text = post.innerText;
    // Check for exact 'AI' (case-sensitive)
    if (aiKeywordsCaseSensitive.some(keyword => text.includes(keyword))) {
      post.style.display = 'none';
      return;
    }
    // Check for other keywords (case-insensitive)
    const lowerText = text.toLowerCase();
    if (
      aiKeywordsCaseInsensitive.some(keyword => lowerText.includes(keyword)) ||
      customKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
    ) {
      post.style.display = 'none';
    }
  });
}

function runWithCustomKeywords() {
  if (!window.browser && window.chrome) {
    window.browser = window.chrome;
  }
  if (!window.browser || !window.browser.storage) {
    hideAIposts();
    return;
  }
  browser.storage.local.get({ customKeywords: [] }).then(data => {
    hideAIposts(data.customKeywords || []);
  });
}

// Run on page load and when new posts are added
runWithCustomKeywords();
const observer = new MutationObserver(runWithCustomKeywords);
observer.observe(document.body, { childList: true, subtree: true });
