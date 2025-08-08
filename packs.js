// Default filter packs for Filterit extension
// These are preset packs that can be installed by users

const DEFAULT_PACKS = [
  {
    name: "AI & Tech",
    description: "AI, machine learning, and technology content",
    enabled: true,
    caseSensitiveDefault: false,
    keywords: [
      { text: "AI", enabled: true, caseSensitive: true },
      { text: "artificial intelligence", enabled: true, caseSensitive: false },
      { text: "chatgpt", enabled: true, caseSensitive: false },
      { text: "gpt-4", enabled: true, caseSensitive: false },
      { text: "openai", enabled: true, caseSensitive: false },
      { text: "midjourney", enabled: true, caseSensitive: false },
      { text: "dall-e", enabled: true, caseSensitive: false },
      { text: "machine learning", enabled: true, caseSensitive: false },
      { text: "neural network", enabled: true, caseSensitive: false },
      { text: "llm", enabled: true, caseSensitive: false }
    ]
  },
  {
    name: "Politics",
    description: "Political discussions and news",
    enabled: false,
    caseSensitiveDefault: false,
    keywords: [
      { text: "politics", enabled: true, caseSensitive: false },
      { text: "election", enabled: true, caseSensitive: false },
      { text: "president", enabled: true, caseSensitive: false },
      { text: "government", enabled: true, caseSensitive: false },
      { text: "congress", enabled: true, caseSensitive: false },
      { text: "senate", enabled: true, caseSensitive: false },
      { text: "republican", enabled: true, caseSensitive: false },
      { text: "democrat", enabled: true, caseSensitive: false },
      { text: "liberal", enabled: true, caseSensitive: false },
      { text: "conservative", enabled: true, caseSensitive: false },
      { text: "voting", enabled: true, caseSensitive: false },
      { text: "campaign", enabled: true, caseSensitive: false }
    ]
  },
  {
    name: "War & Conflict",
    description: "War, conflict, and military content",
    enabled: false,
    caseSensitiveDefault: false,
    keywords: [
      { text: "war", enabled: true, caseSensitive: false },
      { text: "conflict", enabled: true, caseSensitive: false },
      { text: "battle", enabled: true, caseSensitive: false },
      { text: "invasion", enabled: true, caseSensitive: false },
      { text: "military", enabled: true, caseSensitive: false },
      { text: "army", enabled: true, caseSensitive: false },
      { text: "soldier", enabled: true, caseSensitive: false },
      { text: "weapons", enabled: true, caseSensitive: false },
      { text: "bombing", enabled: true, caseSensitive: false },
      { text: "attack", enabled: true, caseSensitive: false }
    ]
  },
  {
    name: "Sports",
    description: "Sports discussions and news",
    enabled: false,
    caseSensitiveDefault: false,
    keywords: [
      { text: "football", enabled: true, caseSensitive: false },
      { text: "soccer", enabled: true, caseSensitive: false },
      { text: "basketball", enabled: true, caseSensitive: false },
      { text: "nba", enabled: true, caseSensitive: false },
      { text: "nfl", enabled: true, caseSensitive: false },
      { text: "mlb", enabled: true, caseSensitive: false },
      { text: "nhl", enabled: true, caseSensitive: false },
      { text: "olympics", enabled: true, caseSensitive: false },
      { text: "world cup", enabled: true, caseSensitive: false },
      { text: "championship", enabled: true, caseSensitive: false },
      { text: "playoff", enabled: true, caseSensitive: false },
      { text: "game score", enabled: true, caseSensitive: false }
    ]
  },
  {
    name: "Movie Spoilers",
    description: "Movie spoilers and plot discussions",
    enabled: false,
    caseSensitiveDefault: false,
    keywords: [
      { text: "spoiler", enabled: true, caseSensitive: false },
      { text: "movie ending", enabled: true, caseSensitive: false },
      { text: "plot twist", enabled: true, caseSensitive: false },
      { text: "spoilers ahead", enabled: true, caseSensitive: false },
      { text: "ending explained", enabled: true, caseSensitive: false },
      { text: "post credits", enabled: true, caseSensitive: false },
      { text: "leaked plot", enabled: true, caseSensitive: false }
    ]
  },
  {
    name: "Video Game Spoilers",
    description: "Video game spoilers and story discussions",
    enabled: false,
    caseSensitiveDefault: false,
    keywords: [
      { text: "game spoiler", enabled: true, caseSensitive: false },
      { text: "final boss", enabled: true, caseSensitive: false },
      { text: "secret ending", enabled: true, caseSensitive: false },
      { text: "story spoiler", enabled: true, caseSensitive: false },
      { text: "plot spoiler", enabled: true, caseSensitive: false },
      { text: "ending spoiler", enabled: true, caseSensitive: false },
      { text: "leaked gameplay", enabled: true, caseSensitive: false }
    ]
  }
];

// Pack sharing functions
function exportPack(pack) {
  const exportData = {
    name: pack.name,
    description: pack.description || '',
    caseSensitiveDefault: pack.caseSensitiveDefault || false,
    keywords: pack.keywords.map(kw => ({ 
      text: kw.text, 
      enabled: kw.enabled,
      caseSensitive: kw.caseSensitive !== undefined ? kw.caseSensitive : false
    }))
  };
  return btoa(JSON.stringify(exportData));
}

function importPack(code) {
  try {
    const data = JSON.parse(atob(code));
    if (!data.name || !Array.isArray(data.keywords)) {
      throw new Error('Invalid pack format');
    }
    return {
      name: data.name,
      description: data.description || '',
      enabled: true,
      caseSensitiveDefault: data.caseSensitiveDefault || false,
      keywords: data.keywords.map(kw => ({
        text: kw.text || '',
        enabled: kw.enabled !== false,
        caseSensitive: kw.caseSensitive !== undefined ? kw.caseSensitive : false
      }))
    };
  } catch (e) {
    throw new Error('Failed to import pack: ' + e.message);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.FilteritPacks = {
    DEFAULT_PACKS,
    exportPack,
    importPack
  };
}

// For Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_PACKS, exportPack, importPack };
}
