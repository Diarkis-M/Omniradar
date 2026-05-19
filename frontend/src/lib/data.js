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

const seedData = getSeedData();
export default seedData;
