// =============================================================================
// OmniRadar  --  Real Data Layer (powered by pipeline output)
// =============================================================================
import pipelineData from './pipeline_data.json';

// ---------------------------------------------------------------------------
// Category keyword maps
// ---------------------------------------------------------------------------
const CATEGORY_KEYWORDS = {
  Skincare: [
    "sunscreen", "moisturizer", "moisturiser", "serum", "face wash", "facewash",
    "cleanser", "toner", "skin", "spf", "retinol", "niacinamide", "vitamin c",
    "hyaluronic", "ceramide", "peptide", "exfoliat", "peel", "acne", "pimple",
    "dark spot", "pigment", "glow", "brightening", "barrier", "derma",
  ],
  Haircare: [
    "hair", "shampoo", "conditioner", "henna", "mehendi", "hair colour",
    "hair color", "balayage", "keratin", "scalp", "dandruff", "hair oil",
    "hair serum", "hair fall", "hair loss", "frizz", "curly", "straighten",
    "wolf cut", "butterfly cut", "curtain bangs",
  ],
  Fragrance: [
    "perfume", "fragrance", "eau de", "deodorant", "deo", "body spray",
    "roll-on", "roll on", "attar", "cologne", "scent",
  ],
  Soaps: [
    "soap", "bar soap", "bathing bar", "handwash", "hand wash", "shower gel",
    "body wash", "liquid soap", "bath",
  ],
  Grooming: [
    "beard", "shaving", "shave", "trimmer", "aftershave", "after shave",
    "grooming", "moustache", "razor", "men's face",
  ],
};

// Urgency label map
const URGENCY_MAP = {
  "[CROSS-PLATFORM]":      "URGENT",
  "[E-COMMERCE SIGNAL]":   "URGENT",
  "[INGREDIENT BREAKOUT]": "URGENT",
  "[REDDIT EXCLUSIVE]":    "MONITOR",
  "[INSTAGRAM BUZZ]":      "MONITOR",
  "[GOOGLE/SOCIAL]":       "MONITOR",
  "[NEWS/RSS]":            "WATCH",
};

// GCPL Brand lists (from config.yaml)
const OWN_BRANDS = [
  "Cinthol", "Godrej No. 1", "Godrej No.1", "Godrej Expert",
  "Godrej Professional", "Nupur", "Park Avenue", "KS",
  "Kamasutra", "Muuchstac", "Bloq", "Godrej Magic",
  "Godrej Protekt", "HIT", "Good knight", "Godrej aer",
];

const COMPETITOR_BRANDS = [
  "Nivea", "Wild Stone", "Set Wet", "Beardo",
  "Bombay Shaving Company", "L'Oreal", "Dove",
  "Garnier", "Ustraa", "The Man Company",
  "Manforce", "Durex", "Streax", "Mamaearth",
  "The Derma Co", "mCaffeine", "Neutrogena", "Plum",
];

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
      // Everything else (amazon, nykaa, flipkart, instagram, pinterest)
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
    instagram: "Instagram",
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
// getBrandMentions(data)
// ---------------------------------------------------------------------------
export function getBrandMentions(data) {
  const all = getAllSignals(data);
  const ownBrands = data?.brands?.own || OWN_BRANDS;
  const compBrands = data?.brands?.competitors || COMPETITOR_BRANDS;
  function countMentions(brandList) {
    return brandList.map((brand) => {
      const needle = brand.toLowerCase();
      const count = all.filter((s) =>
        (s.title || "").toLowerCase().includes(needle)
      ).length;
      return { name: brand, count };
    });
  }
  return { own: countMentions(ownBrands), competitors: countMentions(compBrands) };
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
  const nameKw = extractKeywords(trend.trend_name);
  const contextKw = extractKeywords(trend.context || '').slice(0, 6);
  const resultKw = extractKeywords(trend.result || '').slice(0, 6);
  const keywords = [...new Set([...nameKw, ...contextKw, ...resultKw])];

  if (keywords.length === 0) return null;

  // Score every raw signal against trend keywords
  const scored = [];
  for (const signal of allSignals) {
    const title = (signal.title || '').toLowerCase();
    let score = 0;
    const matched = [];
    for (const kw of keywords) {
      if (title.includes(kw)) { score++; matched.push(kw); }
    }
    if (score >= 1) scored.push({ ...signal, _score: score, _matched: matched });
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
