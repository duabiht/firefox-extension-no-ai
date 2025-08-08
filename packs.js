// Default filter packs for Filterit extension
// These are preset packs that can be installed by users

const DEFAULT_PACKS = [
  {
    name: "AI & Tech",
    description: "AI, machine learning, and technology content",
    enabled: true,
    keywords: [
      { text: "AI", enabled: true },
      { text: "artificial intelligence", enabled: true },
      { text: "chatgpt", enabled: true },
      { text: "gpt-4", enabled: true },
      { text: "openai", enabled: true },
      { text: "midjourney", enabled: true },
      { text: "dall-e", enabled: true },
      { text: "machine learning", enabled: true },
      { text: "neural network", enabled: true },
      { text: "llm", enabled: true }
    ]
  },
  {
    name: "Politics",
    description: "Political discussions and news",
    enabled: false,
    keywords: [
      { text: "politics", enabled: true },
      { text: "election", enabled: true },
      { text: "president", enabled: true },
      { text: "government", enabled: true },
      { text: "congress", enabled: true },
      { text: "senate", enabled: true },
      { text: "republican", enabled: true },
      { text: "democrat", enabled: true },
      { text: "liberal", enabled: true },
      { text: "conservative", enabled: true },
      { text: "voting", enabled: true },
      { text: "campaign", enabled: true }
    ]
  },
  {
    name: "War & Conflict",
    description: "War, conflict, and military content",
    enabled: false,
    keywords: [
      { text: "war", enabled: true },
      { text: "conflict", enabled: true },
      { text: "battle", enabled: true },
      { text: "invasion", enabled: true },
      { text: "military", enabled: true },
      { text: "army", enabled: true },
      { text: "soldier", enabled: true },
      { text: "weapons", enabled: true },
      { text: "bombing", enabled: true },
      { text: "attack", enabled: true }
    ]
  },
  {
    name: "Sports",
    description: "Sports discussions and news",
    enabled: false,
    keywords: [
      { text: "football", enabled: true },
      { text: "soccer", enabled: true },
      { text: "basketball", enabled: true },
      { text: "nba", enabled: true },
      { text: "nfl", enabled: true },
      { text: "mlb", enabled: true },
      { text: "nhl", enabled: true },
      { text: "olympics", enabled: true },
      { text: "world cup", enabled: true },
      { text: "championship", enabled: true },
      { text: "playoff", enabled: true },
      { text: "game score", enabled: true }
    ]
  },
  {
    name: "Movie Spoilers",
    description: "Movie spoilers and plot discussions",
    enabled: false,
    keywords: [
      { text: "spoiler", enabled: true },
      { text: "movie ending", enabled: true },
      { text: "plot twist", enabled: true },
      { text: "spoilers ahead", enabled: true },
      { text: "ending explained", enabled: true },
      { text: "post credits", enabled: true },
      { text: "leaked plot", enabled: true }
    ]
  },
  {
    name: "Video Game Spoilers",
    description: "Video game spoilers and story discussions",
    enabled: false,
    keywords: [
      { text: "game spoiler", enabled: true },
      { text: "final boss", enabled: true },
      { text: "secret ending", enabled: true },
      { text: "story spoiler", enabled: true },
      { text: "plot spoiler", enabled: true },
      { text: "ending spoiler", enabled: true },
      { text: "leaked gameplay", enabled: true }
    ]
  }
];

// Pack sharing functions
function exportPack(pack) {
  const exportData = {
    name: pack.name,
    description: pack.description || '',
    keywords: pack.keywords.map(kw => ({ text: kw.text, enabled: kw.enabled }))
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
      keywords: data.keywords.map(kw => ({
        text: kw.text || '',
        enabled: kw.enabled !== false
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
