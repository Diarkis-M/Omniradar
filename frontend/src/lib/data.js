// =============================================================================
// OmniRadar  --  Real Data Layer (powered by pipeline output)
// =============================================================================
import pipelineData from './pipeline_data.json';
import keywordsDB from './omniradar_keywords.json';

// ---------------------------------------------------------------------------
// GCPL Product Category Keywords — covers full Godrej Consumer portfolio
// Sourced from omniradar_keywords.json → product_keywords
// ---------------------------------------------------------------------------
const CATEGORY_KEY_MAP = {
  personal_wash:      'Soaps & Body',
  hair_care:          'Hair Care',
  mens_grooming:      "Men's Grooming",
  fragrances_deo:     'Fragrances & EDP',
  home_insecticides:  'Home Insecticides',
  air_fresheners:     'Air Fresheners',
  sexual_wellness:    'Sexual Wellness',
  skincare:           'Skincare',
};

const CATEGORY_KEYWORDS = Object.fromEntries(
  Object.entries(keywordsDB.product_keywords).map(([key, words]) => [
    CATEGORY_KEY_MAP[key] || key,
    words,
  ])
);

// Urgency label map
const URGENCY_MAP = {
  "[CROSS-PLATFORM]":      "URGENT",
  "[E-COMMERCE SIGNAL]":   "URGENT",
  "[INGREDIENT BREAKOUT]": "URGENT",
  "[REDDIT EXCLUSIVE]":    "MONITOR",
  "[INSTAGRAM BUZZ]":      "MONITOR",
  "[YOUTUBE SIGNAL]":      "MONITOR",
  "[GOOGLE/SOCIAL]":       "MONITOR",
  "[NEWS/RSS]":            "WATCH",
};

// ---------------------------------------------------------------------------
// GCPL Own Brands
// ---------------------------------------------------------------------------
const OWN_BRANDS = [
  "Godrej", "GCPL", "Cinthol", "Godrej No.1", "Godrej No. 1",
  "Godrej Protekt", "Godrej Expert", "Godrej Professional",
  "Nupur", "Park Avenue", "Kamasutra", "HIT", "Good Knight",
  "Godrej aer", "Ezee", "Genteel", "Godrej Magic",
];

// ---------------------------------------------------------------------------
// Competitor Brands — organised by GCPL-relevant category
// ---------------------------------------------------------------------------
const COMPETITOR_BRANDS_BY_CATEGORY = {
  "Men's Grooming": [
    "Beardo", "Ustraa", "The Man Company", "Man Matters",
    "Bombay Shaving Company", "Gillette", "Philips", "Braun",
    "Nivea Men", "Garnier Men", "Pond's Men", "Old Spice",
    "Axe", "Spruce Shave Club", "LetsShave", "Village Barber",
    "MensXP", "Urban Gabru", "Mancode", "Bold Care",
    "Man Arden", "One8", "Wild Stone Men", "Denver Men",
    "Set Wet Men", "Layer'r", "Envy", "Brylcreem", "Gatsby",
    "Livon", "Wahl", "Panasonic", "Dollar Shave Club", "Harry's",
  ],
  'Fragrances & EDP': [
    "Wild Stone", "Set Wet", "Denver", "Fogg", "Engage",
    "Bella Vita", "Ajmal", "Adil Qadri", "Afnan", "Skinn",
    "Guess", "Police", "Jaguar", "Armaf", "Lattafa",
    "Al Haramain", "Al Rehab", "Rasasi", "Villain", "Renee",
    "MyGlamm", "Nautica", "UCB", "Yardley", "Brut", "Nike",
    "Secret Temptation", "Layer'r", "Envy", "Embark",
    "Ferrari", "Davidoff", "Playboy", "Emper", "Paris Corner",
    "Maison Alhambra", "Miniso", "Zara", "Marks and Spencer",
  ],
  'Soaps & Body': [
    "Dove", "Nivea", "Santoor", "Medimix", "Pears", "Lux",
    "Lifebuoy", "Dettol", "Fiama", "Hamam", "Mysore Sandal",
    "Margo", "Himalaya", "Biotique", "Khadi Natural",
    "Forest Essentials", "Sebamed", "Cetaphil", "Palmolive",
    "Savlon", "Bath & Body Works", "The Body Shop", "Mamaearth",
    "WOW", "Joy", "Rexona", "Vivel", "Yardley",
  ],
  'Hair Care': [
    "L'Oreal", "Garnier", "Streax", "Bigen", "Indica",
    "Indulekha", "Biotique", "Kama Ayurveda", "WOW",
    "Mamaearth", "TRESemme", "Head & Shoulders", "Clinic Plus",
    "Sunsilk", "Pantene", "Dove", "Matrix", "Schwarzkopf",
    "Wella", "BBlunt", "Kesh King", "Patanjali",
    "Bajaj Almond Drops", "Parachute", "Dabur Amla", "Nihar",
    "Sesa", "Khadi Natural", "Forest Essentials", "Re'equil",
    "Bare Anatomy", "Earth Rhythm", "Minimalist", "Pilgrim",
    "Juicy Chemistry", "St Botanica", "Fix My Curls", "Arata",
    "Plum", "Livon", "Set Wet", "Emami", "Navratna", "Himalaya",
  ],
  'Skincare': [
    "Mamaearth", "Minimalist", "Deconstruct", "The Derma Co",
    "mCaffeine", "Neutrogena", "Plum", "Dot & Key", "Cetaphil",
    "CeraVe", "Pond's", "Olay", "Garnier", "Lakme",
    "Lotus Herbals", "Himalaya", "Biotique", "Forest Essentials",
    "Kama Ayurveda", "Juicy Chemistry", "Earth Rhythm",
    "Pilgrim", "Re'equil", "Fixderma", "Cipla", "Aqualogica",
    "Dr Sheth's", "Foxtale", "Beauty of Joseon", "Innisfree",
    "Laneige", "Simple", "Joy", "Clean & Clear", "Acne Star",
    "WOW", "Sugar Cosmetics", "The Ordinary", "Dermalogica",
    "Clinique", "La Roche-Posay", "Vichy", "Bioderma", "Avene",
    "Kiehl's", "Nykaa", "Faces Canada", "Conscious Chemist",
    "RAS Luxury Oils", "Vedix", "SkinKraft", "Dr Batra's",
  ],
  'Home Insecticides': [
    "Mortein", "All Out", "Maxo", "Baygon", "Raid", "Odomos",
    "Herbal Strategi", "Laxman Rekha", "Finit", "Pif Paf",
    "Combat", "Terminix", "Rentokil",
  ],
  'Air Fresheners': [
    "Odonil", "Ambi Pur", "Air Wick", "Glade", "Febreze",
    "Renuzit", "Sawaday", "Iris Home Fragrance", "Mangalam",
    "Cycle Pure", "HEM", "Tatva Yog", "Phool",
    "Bombay Candle Company", "Niana", "Ekam", "Seva",
    "Zed Black", "Moksh", "Mysore Sandal", "Lia",
    "Little Trees", "California Scents", "Yankee Candle",
  ],
  'Sexual Wellness': [
    "Manforce", "Durex", "Skore", "Moods", "Kohinoor",
    "Okamoto", "Trojan", "Playgard", "Contex",
    "That's Personal", "Bold Care", "Imbue Natural", "Namyaa",
    "Lemme Be", "WOW", "VWash", "Lactacyd", "Pee Safe",
    "Sirona", "Carmesi", "Gynoveda", "I Know", "Carex",
    "Mankind Pharma", "TTK Healthcare",
  ],
};

// Flat list for backward compatibility
const COMPETITOR_BRANDS = Object.values(COMPETITOR_BRANDS_BY_CATEGORY).flat();

// ---------------------------------------------------------------------------
// GCPL relevance filter — keeps signals related to Godrej product categories
// ---------------------------------------------------------------------------
const GCPL_KEYWORDS = [
  // All product keywords (from every category in the JSON)
  ...Object.values(keywordsDB.product_keywords).flat(),
  // All brand keywords (own + every competitor sub-category)
  ...Object.values(keywordsDB.brand_keywords).flat(),
  // Industry keywords
  ...keywordsDB.industry_keywords,
  // Social trend keywords
  ...keywordsDB.social_trend_keywords,
].map(kw => kw.toLowerCase());

export function isBeautyRelated(signal) {
  const title = (signal?.title || signal?.trend_name || "").toLowerCase();
  if (!title) return false;
  return GCPL_KEYWORDS.some(kw => title.includes(kw));
}

// ---------------------------------------------------------------------------
// Normalize raw signals — some platforms return plain strings
// ---------------------------------------------------------------------------
function normalizeSignals(rawSignals) {
  const normalized = {};
  for (const [platform, signals] of Object.entries(rawSignals || {})) {
    if (!Array.isArray(signals)) { normalized[platform] = []; continue; }
    normalized[platform] = signals.map((s, i) => {
      // Google & Social signals can be plain strings
      if (typeof s === 'string') {
        return { title: s, source: platform, url: '', id: `${platform}-${i}` };
      }
      // Reddit: use url directly, add source field
      if (platform === 'reddit') {
        return { ...s, source: 'reddit', id: s.url || `reddit-${i}` };
      }
      // RSS: normalize 'link' to 'url'
      if (platform === 'rss') {
        return { ...s, url: s.link || s.url || '', source: 'rss', id: s.link || `rss-${i}` };
      }
      // Amazon: generate search URL fallback when url is empty
      if (platform === 'amazon' && !s.url && s.title) {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(s.title.slice(0, 80))}`;
        return { ...s, url: searchUrl, source: 'amazon', id: `amazon-${i}` };
      }
      // YouTube: generate search URL fallback when url is empty
      if (platform === 'youtube' && !s.url && s.title) {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title.slice(0, 80))}`;
        return { ...s, url: searchUrl, source: 'youtube', id: `youtube-${i}` };
      }
      // Everything else (nykaa, flipkart, instagram, pinterest)
      return { ...s, id: s.url || `${platform}-${i}` };
    });
  }
  return normalized;
}

// ---------------------------------------------------------------------------
// getSeedData()  --  returns the real pipeline data
// ---------------------------------------------------------------------------
export function getSeedData() {
  const raw = normalizeSignals(pipelineData.raw_signals);
  return {
    timestamp: pipelineData.timestamp,
    trends: pipelineData.trends || [],
    raw_signals: raw,
    ecommerce_signals: pipelineData.ecommerce_signals || {},
    brands: {
      own: OWN_BRANDS,
      competitors: COMPETITOR_BRANDS,
    },
  };
}

// ---------------------------------------------------------------------------
// getAllSignals(data) — flatten into one list with platform labels
// ---------------------------------------------------------------------------
export function getAllSignals(data) {
  if (!data || !data.raw_signals) return [];
  const platformNames = {
    google: "Google", reddit: "Reddit", rss: "News / RSS",
    social: "Social / Twitter", pinterest: "Pinterest",
    amazon: "Amazon", nykaa: "Nykaa", flipkart: "Flipkart",
    instagram: "Instagram", youtube: "YouTube",
  };
  const all = [];
  for (const [key, signals] of Object.entries(data.raw_signals)) {
    if (!Array.isArray(signals)) continue;
    const platformLabel = platformNames[key] || key;
    for (const signal of signals) {
      all.push({ ...signal, platform: platformLabel });
    }
  }
  return all;
}

// ---------------------------------------------------------------------------
// getSignalsByPlatform(data, platform)
// ---------------------------------------------------------------------------
export function getSignalsByPlatform(data, platform) {
  const all = getAllSignals(data);
  const needle = (platform || "").toLowerCase();
  return all.filter((s) => (s.platform || "").toLowerCase().includes(needle));
}

// ---------------------------------------------------------------------------
// getCompetitorSignals(data)
// ---------------------------------------------------------------------------
export function getCompetitorSignals(data) {
  const all = getAllSignals(data);
  const competitors = data?.brands?.competitors || COMPETITOR_BRANDS;
  const lowerCompetitors = competitors.map((b) => b.toLowerCase());
  return all.filter((signal) => {
    const title = (signal.title || "").toLowerCase();
    return lowerCompetitors.some((comp) => title.includes(comp));
  });
}

// ---------------------------------------------------------------------------
// getBrandMentions(data) — includes category-grouped competitors
// ---------------------------------------------------------------------------
export function getBrandMentions(data) {
  const all = getAllSignals(data);
  const ownBrands = data?.brands?.own || OWN_BRANDS;
  const compBrands = data?.brands?.competitors || COMPETITOR_BRANDS;
  function countMentions(brandList) {
    return brandList.map((brand) => {
      const needle = brand.toLowerCase();
      const count = all.filter((s) => {
        const text = ((s.title || '') + ' ' + (s.category || '')).toLowerCase();
        return text.includes(needle);
      }).length;
      return { name: brand, count };
    });
  }

  // Category-grouped competitor mentions
  const competitorsByCategory = {};
  for (const [cat, brands] of Object.entries(COMPETITOR_BRANDS_BY_CATEGORY)) {
    competitorsByCategory[cat] = countMentions(brands);
  }

  return {
    own: countMentions(ownBrands),
    competitors: countMentions(compBrands),
    competitorsByCategory,
  };
}

// ---------------------------------------------------------------------------
// getBrandMentionDetails(data, brandName) — per-platform source breakdown
// ---------------------------------------------------------------------------
export function getBrandMentionDetails(data, brandName) {
  if (!data || !brandName) return null;
  const all = getAllSignals(data);
  const needle = brandName.toLowerCase();

  const matches = all.filter((s) => {
    const text = ((s.title || '') + ' ' + (s.category || '')).toLowerCase();
    return text.includes(needle);
  });

  // Group by platform
  const byPlatform = {};
  for (const s of matches) {
    const p = s.platform || 'Unknown';
    if (!byPlatform[p]) byPlatform[p] = [];
    byPlatform[p].push({
      title: s.title || '',
      url: s.url || s.link || '',
      price: s.price || '',
      rating: s.rating || 0,
      review_count: s.review_count || 0,
      score: s.score || 0,
      num_comments: s.num_comments || 0,
      subreddit: s.subreddit || '',
    });
  }

  // Sort platforms by count descending
  const platforms = Object.entries(byPlatform)
    .map(([platform, signals]) => ({ platform, signals, count: signals.length }))
    .sort((a, b) => b.count - a.count);

  return { total: matches.length, platforms };
}

// ---------------------------------------------------------------------------
// categorizeSignal(signal)
// ---------------------------------------------------------------------------
export function categorizeSignal(signal) {
  const title = (signal?.title || signal?.trend_name || "").toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => title.includes(kw))) return category;
  }
  return "General";
}

// ---------------------------------------------------------------------------
// getUrgencyLevel(trend)
// ---------------------------------------------------------------------------
export function getUrgencyLevel(trend) {
  const label = (trend?.label || "").trim();
  return URGENCY_MAP[label] || "WATCH";
}

// ---------------------------------------------------------------------------
// findSourceUrl(trend, data) — match an AI trend back to a raw signal URL
// ---------------------------------------------------------------------------
export function findSourceUrl(trend, data) {
  if (!trend || !data) return '';
  if (trend.url || trend.link) return trend.url || trend.link;

  const allSignals = getAllSignals(data);
  const trendName = (trend.trend_name || trend.title || '').toLowerCase();
  const sourcePlatform = (trend.source_platform || '').toLowerCase();

  // Keywords from the trend name (words > 3 chars)
  const keywords = trendName.split(/[\s\-\/]+/).filter(w => w.length > 3);

  // Subreddit mentioned in source_platform, e.g. "Reddit (r/curlyhair)"
  const subMatch = sourcePlatform.match(/r\/(\w+)/);
  const subreddit = subMatch ? subMatch[1].toLowerCase() : '';

  // Map source_platform text to platform labels used by getAllSignals
  const targets = [];
  if (sourcePlatform.includes('reddit'))    targets.push('reddit');
  if (sourcePlatform.includes('amazon'))    targets.push('amazon');
  if (sourcePlatform.includes('flipkart'))  targets.push('flipkart');
  if (sourcePlatform.includes('nykaa'))     targets.push('nykaa');
  if (sourcePlatform.includes('instagram')) targets.push('instagram');
  if (sourcePlatform.includes('pinterest')) targets.push('pinterest');
  if (sourcePlatform.includes('hindustan') || sourcePlatform.includes('times') || sourcePlatform.includes('news'))
    targets.push('news');
  if (sourcePlatform.includes('e-commerce')) targets.push('amazon', 'flipkart', 'nykaa');
  if (sourcePlatform.includes('google'))  targets.push('google');
  if (sourcePlatform.includes('social'))  targets.push('social');

  // Filter by platform
  let candidates = allSignals;
  if (targets.length > 0) {
    const filtered = allSignals.filter(s => {
      const p = (s.platform || '').toLowerCase();
      return targets.some(t => p.includes(t));
    });
    if (filtered.length > 0) candidates = filtered;
  }

  // Narrow by subreddit when available
  if (subreddit) {
    const subFiltered = candidates.filter(s => (s.subreddit || '').toLowerCase() === subreddit);
    if (subFiltered.length > 0) candidates = subFiltered;
  }

  // Score each signal by keyword overlap with trend name
  let bestMatch = null;
  let bestScore = 0;
  for (const signal of candidates) {
    const title = (signal.title || '').toLowerCase();
    const url = signal.url || signal.link || '';
    if (!url) continue;
    let score = 0;
    for (const kw of keywords) {
      if (title.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) { bestScore = score; bestMatch = signal; }
  }

  if (bestMatch) return bestMatch.url || bestMatch.link || '';

  // Fallback: first signal from the matching platform that has a URL
  const fb = candidates.find(s => s.url || s.link);
  return fb ? (fb.url || fb.link || '') : '';
}

// ---------------------------------------------------------------------------
// findSupportingSignals(trend, data) — gather cross-platform evidence
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
  'with', 'from', 'that', 'this', 'have', 'been', 'will', 'their', 'about',
  'which', 'when', 'where', 'while', 'these', 'those', 'what', 'more', 'most',
  'some', 'than', 'other', 'into', 'over', 'also', 'they', 'very', 'just',
  'only', 'like', 'make', 'made', 'such', 'each', 'every', 'both', 'does',
  'high', 'away', 'users', 'demand', 'driving', 'dedicated', 'increased',
  'platforms', 'market', 'indian', 'india', 'products', 'product', 'brands',
  'brand', 'techniques', 'processes', 'routines', 'specialized', 'seeking',
  'multi', 'functional', 'targeting', 'specific', 'avoid', 'damaging',
]);

function extractKeywords(text) {
  return text.toLowerCase().replace(/['']/g, '').split(/[\s\-\/,.:;!?()]+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

export function findSupportingSignals(trend, data) {
  if (!trend?.trend_name || !data) return null;

  const allSignals = getAllSignals(data);
  // ONLY use trend name keywords — context/result words are too generic
  const keywords = [...new Set(extractKeywords(trend.trend_name))];

  if (keywords.length === 0) return null;

  // Distinctive keywords (7+ chars like "niacinamide", "grooming") need only 1 match;
  // short generic words need at least 2 co-occurring matches to avoid false positives
  const hasDistinctive = keywords.some(kw => kw.length >= 7);
  const minScore = hasDistinctive ? 1 : Math.min(2, keywords.length);

  // Score every raw signal against trend keywords
  const scored = [];
  for (const signal of allSignals) {
    const title = (signal.title || '').toLowerCase();
    let score = 0;
    const matched = [];
    for (const kw of keywords) {
      if (title.includes(kw)) { score++; matched.push(kw); }
    }
    if (score >= minScore) scored.push({ ...signal, _score: score, _matched: matched });
  }

  if (scored.length === 0) return null;

  // Group by platform
  const byPlatform = {};
  for (const s of scored) {
    const p = s.platform || 'Unknown';
    if (!byPlatform[p]) byPlatform[p] = [];
    byPlatform[p].push(s);
  }

  // Build per-platform evidence with aggregate stats
  const platforms = {};
  for (const [platform, signals] of Object.entries(byPlatform)) {
    const sorted = signals.sort((a, b) => b._score - a._score);
    const info = { count: signals.length, top: sorted.slice(0, 3) };

    // E-commerce aggregates
    const ratings = signals.map(s => s.rating).filter(r => r > 0);
    const reviews = signals.map(s => s.review_count).filter(r => r > 0);
    if (ratings.length) info.avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    if (reviews.length) info.totalReviews = reviews.reduce((a, b) => a + b, 0);

    // Reddit aggregates
    const upvotes = signals.map(s => s.score).filter(v => v > 0);
    const comments = signals.map(s => s.num_comments).filter(v => v > 0);
    const velocities = signals.map(s => s.velocity).filter(v => v > 0);
    if (upvotes.length) info.totalUpvotes = upvotes.reduce((a, b) => a + b, 0);
    if (comments.length) info.totalComments = comments.reduce((a, b) => a + b, 0);
    if (velocities.length) info.avgVelocity = (velocities.reduce((a, b) => a + b, 0) / velocities.length).toFixed(1);

    platforms[platform] = info;
  }

  return {
    total: scored.length,
    platformCount: Object.keys(platforms).length,
    platforms,
    keywords: keywords.slice(0, 8),
  };
}

const seedData = getSeedData();
export default seedData;
