// =============================================================================
// OmniRadar / TrendRadar  --  Static Data Layer
// =============================================================================
// This module supplies the Next.js static-export frontend with:
//   1. A realistic seed dataset that mirrors daily_beauty_insights.json
//   2. Helper functions to flatten, filter, categorise and score signals
// =============================================================================

// ---------------------------------------------------------------------------
// Category keyword maps (used by categorizeSignal)
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

// ---------------------------------------------------------------------------
// Urgency label map (used by getUrgencyLevel)
// ---------------------------------------------------------------------------
const URGENCY_MAP = {
  "[CROSS-PLATFORM]":      "URGENT",
  "[E-COMMERCE SIGNAL]":   "URGENT",
  "[INGREDIENT BREAKOUT]": "URGENT",
  "[REDDIT EXCLUSIVE]":    "MONITOR",
  "[INSTAGRAM BUZZ]":      "MONITOR",
  "[GOOGLE/SOCIAL]":       "MONITOR",
  "[NEWS/RSS]":            "WATCH",
};

// ---------------------------------------------------------------------------
// Brand lists
// ---------------------------------------------------------------------------
const OWN_BRANDS = [
  "Godrej Expert",
  "Cinthol",
  "Park Avenue",
  "Godrej No.1",
  "Godrej Protekt",
  "HIT",
  "Good knight",
  "Godrej aer",
];

const COMPETITOR_BRANDS = [
  "Mamaearth",
  "The Derma Co",
  "L'Oreal",
  "Plum",
  "mCaffeine",
  "Neutrogena",
  "Garnier",
  "Nivea",
  "Beardo",
  "Dove",
];

// ---------------------------------------------------------------------------
// 1. getSeedData()
// ---------------------------------------------------------------------------
export function getSeedData() {
  return {
    timestamp: "2026-05-19T08:30:00.000Z",

    // ---- AI-generated trend digest (5 trends) ---------------------------
    trends: [
      {
        label: "[CROSS-PLATFORM]",
        trend_name: "Ceramide Barrier Repair Surge",
        source_platform: "Reddit + Amazon + Nykaa",
        metric: "342 upvotes, #2 Amazon Skincare",
        context: "Barrier repair routines dominating Indian skincare forums and bestseller lists",
        result: "Launch ceramide-enriched Cinthol face wash variant for men",
      },
      {
        label: "[REDDIT EXCLUSIVE]",
        trend_name: "Ammonia-Free Hair Colour Demand",
        source_platform: "Reddit (r/IndianHaircare)",
        metric: "189 upvotes",
        context: "Users switching from chemical dyes citing scalp sensitivity and hair damage",
        result: "Position Godrej Expert Rich Creme ammonia-free range in sensitivity-led campaigns",
      },
      {
        label: "[E-COMMERCE SIGNAL]",
        trend_name: "Charcoal Deo Disruption in Men's Category",
        source_platform: "Amazon + Flipkart",
        metric: "#1 Amazon Men's Deo, 12K reviews",
        context: "Beardo and mCaffeine charcoal deo sprays surging past legacy brands in reviews",
        result: "Accelerate Park Avenue charcoal variant test-market launch",
      },
      {
        label: "[INSTAGRAM BUZZ]",
        trend_name: "Korean Glass Skin Routine for Indian Skin",
        source_platform: "Instagram + Pinterest",
        metric: "Trending hashtag, 50K+ posts",
        context: "Beauty influencers adapting K-beauty glass-skin steps for Indian climate and skin tones",
        result: "Create Cinthol hydration-focused face wash content seeded around glass-skin routines",
      },
      {
        label: "[NEWS/RSS]",
        trend_name: "Henna Renaissance Among Gen-Z",
        source_platform: "Google News + RSS",
        metric: "14 articles in 24h",
        context: "Trade press covering revival of natural henna colour among younger consumers",
        result: "Amplify Godrej Nupur henna social spend targeting 18-25 demographic",
      },
    ],

    // ---- Raw signals by platform ----------------------------------------
    raw_signals: {
      // -- Google (8 signals) ---
      google: [
        { title: "best sunscreen for oily skin India 2026", source: "google_trends", url: "https://trends.google.com/trends/explore?q=best+sunscreen+oily+skin+India" },
        { title: "ammonia free hair colour brands", source: "google_trends", url: "https://trends.google.com/trends/explore?q=ammonia+free+hair+colour" },
        { title: "men's face wash for acne India", source: "google_trends", url: "https://trends.google.com/trends/explore?q=mens+face+wash+acne+India" },
        { title: "Godrej Expert Rich Creme shade card", source: "google_news", url: "https://news.google.com/search?q=Godrej+Expert+Rich+Creme" },
        { title: "charcoal deodorant benefits", source: "google_trends", url: "https://trends.google.com/trends/explore?q=charcoal+deodorant" },
        { title: "ceramide moisturizer for Indian skin", source: "google_trends", url: "https://trends.google.com/trends/explore?q=ceramide+moisturizer+India" },
        { title: "beard growth oil with biotin", source: "google_trends", url: "https://trends.google.com/trends/explore?q=beard+growth+oil+biotin" },
        { title: "herbal soap vs chemical soap comparison", source: "google_news", url: "https://news.google.com/search?q=herbal+soap+vs+chemical+soap" },
      ],

      // -- Reddit (5 signals) ---
      reddit: [
        { title: "Godrej Expert Rich Creme vs Garnier Color Naturals - honest comparison after 6 months", subreddit: "IndianHaircare", score: 189, url: "https://www.reddit.com/r/IndianHaircare/comments/example1" },
        { title: "Finally found a ceramide moisturizer under 500 that actually works on oily skin", subreddit: "IndianSkincareAddicts", score: 342, url: "https://www.reddit.com/r/IndianSkincareAddicts/comments/example2" },
        { title: "Park Avenue Beer Shampoo review - is the hype justified?", subreddit: "IndianHaircare", score: 127, url: "https://www.reddit.com/r/IndianHaircare/comments/example3" },
        { title: "Men's deodorant that survives Indian summer humidity - mega thread", subreddit: "IndianSkincareAddicts", score: 256, url: "https://www.reddit.com/r/IndianSkincareAddicts/comments/example4" },
        { title: "Cinthol Lime soap discontinued? Best alternatives for that fresh citrus scent?", subreddit: "IndianSkincareAddicts", score: 98, url: "https://www.reddit.com/r/IndianSkincareAddicts/comments/example5" },
      ],

      // -- RSS / News (8 signals) ---
      rss: [
        { title: "Natural Henna Colour Sales Surge 40% as Gen-Z Rejects Chemical Dyes", source: "rss", url: "https://economictimes.com/example/henna-genz" },
        { title: "India Men's Grooming Market to Reach $2.1B by 2028: Report", source: "rss", url: "https://livemint.com/example/mens-grooming-market" },
        { title: "GCPL Q4 Results: Personal Care Division Shows Strong Volume Growth", source: "rss", url: "https://moneycontrol.com/example/gcpl-q4" },
        { title: "Dermatologists Warn Against Overuse of Active Ingredients in Skincare", source: "rss", url: "https://healthline.com/example/active-overuse" },
        { title: "Charcoal-Infused Personal Care Products See 3x Growth on Amazon India", source: "rss", url: "https://yourstory.com/example/charcoal-products" },
        { title: "Sustainable Packaging Now a Key Purchase Driver for Indian Beauty Shoppers", source: "rss", url: "https://beautyindependent.com/example/sustainable-packaging" },
        { title: "Korean Beauty Brands Expand India Presence via Nykaa Partnership", source: "rss", url: "https://vogue.in/example/kbeauty-nykaa" },
        { title: "India's Soap Market Evolves: Liquid Handwash Gains Ground in Tier-2 Cities", source: "rss", url: "https://businessstandard.com/example/liquid-handwash" },
      ],

      // -- Social / Twitter (5 signals) ---
      social: [
        { title: "#MensSkincare routine tips trending in India", source: "twitter", url: "https://twitter.com/search?q=%23MensSkincare" },
        { title: "#AmmoniaFreeHairColour gains traction after influencer posts", source: "twitter", url: "https://twitter.com/search?q=%23AmmoniaFreeHairColour" },
        { title: "#CintholChallenge summer campaign goes viral", source: "trends24", url: "https://trends24.in/india/" },
        { title: "#BeardCare tips and product recommendations surge", source: "twitter", url: "https://twitter.com/search?q=%23BeardCare" },
        { title: "#GlassSkin K-beauty trend adapted for Indian climate", source: "trends24", url: "https://trends24.in/india/" },
      ],

      // -- Pinterest (6 signals) ---
      pinterest: [
        { title: "Copper Balayage Hair Colour Inspiration Board", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=copper+balayage+hair+india" },
        { title: "Men's Grooming Routine Aesthetic Flat Lay", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=mens+grooming+flatlay" },
        { title: "Glass Skin Tutorial Step By Step Indian Skin", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=glass+skin+indian" },
        { title: "Natural Henna Hair Colour Before After Results", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=henna+hair+colour+before+after" },
        { title: "Beard Styling Ideas for Indian Men 2026", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=beard+style+indian+men" },
        { title: "Minimalist Skincare Shelf Organisation", source: "pinterest", url: "https://www.pinterest.com/search/pins/?q=minimalist+skincare+shelf" },
      ],

      // -- Amazon (15 products) ---
      amazon: [
        { title: "Beardo Activated Charcoal Body Wash for Men, 200ml", price: "₹299", rating: 4.3, review_count: 12480, rank: 1, brand: "Beardo", category: "Shower Gel", url: "https://www.amazon.in/dp/B07EXAMPLE1", source: "amazon" },
        { title: "Godrej Expert Rich Creme Hair Colour, Natural Brown (Pack of 4)", price: "₹200", rating: 4.2, review_count: 45230, rank: 2, brand: "Godrej Expert", category: "Hair Colour", url: "https://www.amazon.in/dp/B07EXAMPLE2", source: "amazon" },
        { title: "Park Avenue Beer Shampoo for Men, 650ml", price: "₹330", rating: 4.1, review_count: 18920, rank: 3, brand: "Park Avenue", category: "Men's Shampoo", url: "https://www.amazon.in/dp/B07EXAMPLE3", source: "amazon" },
        { title: "Mamaearth Vitamin C Face Wash with Turmeric, 150ml", price: "₹349", rating: 4.0, review_count: 67200, rank: 1, brand: "Mamaearth", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE4", source: "amazon" },
        { title: "Cinthol Deo Spray Intense for Men, 300ml", price: "₹249", rating: 4.0, review_count: 8950, rank: 5, brand: "Cinthol", category: "Men's Deodorant", url: "https://www.amazon.in/dp/B07EXAMPLE5", source: "amazon" },
        { title: "L'Oreal Paris Men Expert Charcoal Face Wash, 100ml", price: "₹449", rating: 4.1, review_count: 22340, rank: 2, brand: "L'Oreal", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE6", source: "amazon" },
        { title: "Garnier Men Oil Clear Face Wash, 150g", price: "₹199", rating: 4.0, review_count: 34100, rank: 3, brand: "Garnier", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE7", source: "amazon" },
        { title: "Nivea Men Deep Impact Face Wash, 100ml", price: "₹225", rating: 4.2, review_count: 29800, rank: 4, brand: "Nivea", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE8", source: "amazon" },
        { title: "Godrej No.1 Bathing Soap Sandal & Turmeric (4x100g)", price: "₹125", rating: 4.3, review_count: 52100, rank: 1, brand: "Godrej No.1", category: "Bar Soaps", url: "https://www.amazon.in/dp/B07EXAMPLE9", source: "amazon" },
        { title: "Godrej Protekt Masterblaster Handwash Refill 1500ml", price: "₹165", rating: 4.4, review_count: 14800, rank: 2, brand: "Godrej Protekt", category: "Liquid Handwash", url: "https://www.amazon.in/dp/B07EXAMPLE10", source: "amazon" },
        { title: "mCaffeine Naked & Raw Coffee Body Scrub, 200g", price: "₹449", rating: 4.1, review_count: 38700, rank: 1, brand: "mCaffeine", category: "Shower Gel", url: "https://www.amazon.in/dp/B07EXAMPLE11", source: "amazon" },
        { title: "The Derma Co 1% Salicylic Acid Gel Face Wash, 100ml", price: "₹299", rating: 4.0, review_count: 41500, rank: 5, brand: "The Derma Co", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE12", source: "amazon" },
        { title: "Dove Men+Care Body Wash Clean Comfort, 250ml", price: "₹299", rating: 4.2, review_count: 11300, rank: 4, brand: "Dove", category: "Shower Gel", url: "https://www.amazon.in/dp/B07EXAMPLE13", source: "amazon" },
        { title: "Plum Green Tea Pore Cleansing Face Wash, 120ml", price: "₹380", rating: 4.1, review_count: 28900, rank: 6, brand: "Plum", category: "Face Wash", url: "https://www.amazon.in/dp/B07EXAMPLE14", source: "amazon" },
        { title: "Godrej aer Spray Home Freshener Violet Valley Bloom, 240ml", price: "₹199", rating: 4.3, review_count: 19700, rank: 1, brand: "Godrej aer", category: "Air Freshener", url: "https://www.amazon.in/dp/B07EXAMPLE15", source: "amazon" },
      ],

      // -- Nykaa (10 products) ---
      nykaa: [
        { title: "Godrej Expert Rich Creme Hair Colour - Natural Black 1.0", price: "₹60", rating: 4.1, review_count: 3200, rank: 1, brand: "Godrej Expert", category: "Hair Colour", url: "https://www.nykaa.com/godrej-expert-rich-creme/p/example1", source: "nykaa" },
        { title: "Mamaearth Onion Hair Oil for Hair Growth, 250ml", price: "₹499", rating: 4.3, review_count: 12500, rank: 1, brand: "Mamaearth", category: "Hair Serum", url: "https://www.nykaa.com/mamaearth-onion-hair-oil/p/example2", source: "nykaa" },
        { title: "The Derma Co 2% Salicylic Acid Serum, 30ml", price: "₹549", rating: 4.0, review_count: 8700, rank: 2, brand: "The Derma Co", category: "Men's Face Wash", url: "https://www.nykaa.com/derma-co-salicylic/p/example3", source: "nykaa" },
        { title: "Park Avenue Voyage Men's Eau De Parfum, 50ml", price: "₹449", rating: 4.0, review_count: 1850, rank: 1, brand: "Park Avenue", category: "Men's Deodorant", url: "https://www.nykaa.com/park-avenue-voyage/p/example4", source: "nykaa" },
        { title: "Cinthol Cool Menthol Deo Spray for Men, 150ml", price: "₹199", rating: 3.9, review_count: 920, rank: 5, brand: "Cinthol", category: "Men's Deodorant", url: "https://www.nykaa.com/cinthol-cool-deo/p/example5", source: "nykaa" },
        { title: "Neutrogena Deep Clean Facial Cleanser, 200ml", price: "₹499", rating: 4.2, review_count: 6400, rank: 3, brand: "Neutrogena", category: "Men's Face Wash", url: "https://www.nykaa.com/neutrogena-deep-clean/p/example6", source: "nykaa" },
        { title: "Garnier Color Naturals Creme Shade 3 Darkest Brown", price: "₹145", rating: 4.0, review_count: 5300, rank: 2, brand: "Garnier", category: "Hair Colour", url: "https://www.nykaa.com/garnier-color-naturals/p/example7", source: "nykaa" },
        { title: "Beardo Godfather Beard Oil, 30ml", price: "₹550", rating: 4.3, review_count: 4100, rank: 1, brand: "Beardo", category: "Beard Oil", url: "https://www.nykaa.com/beardo-godfather/p/example8", source: "nykaa" },
        { title: "Nivea Men Dark Spot Reduction Face Wash, 100g", price: "₹210", rating: 4.1, review_count: 3800, rank: 4, brand: "Nivea", category: "Men's Face Wash", url: "https://www.nykaa.com/nivea-men-dark-spot/p/example9", source: "nykaa" },
        { title: "Godrej No.1 Kesar & Milk Cream Soap (4x100g)", price: "₹110", rating: 4.2, review_count: 1600, rank: 1, brand: "Godrej No.1", category: "Soaps", url: "https://www.nykaa.com/godrej-no1-kesar/p/example10", source: "nykaa" },
      ],

      // -- Flipkart (10 products) ---
      flipkart: [
        { title: "Godrej Expert Rich Creme Hair Colour Multi-Application Pack, Burgundy", price: "₹195", rating: 4.2, review_count: 28400, rank: 1, brand: "Godrej Expert", category: "Hair Colour", url: "https://www.flipkart.com/godrej-expert-rich-creme/p/example1", source: "flipkart" },
        { title: "Park Avenue Good Morning Shaving Cream, 84g", price: "₹80", rating: 4.0, review_count: 8200, rank: 2, brand: "Park Avenue", category: "Shaving & Beard Care", url: "https://www.flipkart.com/park-avenue-shaving/p/example2", source: "flipkart" },
        { title: "Cinthol Original Deodorant Spray for Men, 300ml", price: "₹265", rating: 4.1, review_count: 6700, rank: 3, brand: "Cinthol", category: "Men's Deodorant", url: "https://www.flipkart.com/cinthol-deo/p/example3", source: "flipkart" },
        { title: "Dove Men+Care Moisturising Body Wash, 250ml", price: "₹279", rating: 4.3, review_count: 5400, rank: 1, brand: "Dove", category: "Shower Gel", url: "https://www.flipkart.com/dove-men-body-wash/p/example4", source: "flipkart" },
        { title: "L'Oreal Paris Casting Creme Gloss Hair Colour, Dark Chocolate", price: "₹550", rating: 4.1, review_count: 14200, rank: 2, brand: "L'Oreal", category: "Hair Colour", url: "https://www.flipkart.com/loreal-casting-creme/p/example5", source: "flipkart" },
        { title: "Godrej No.1 Lime & Aloe Vera Soap (4x100g)", price: "₹99", rating: 4.3, review_count: 42300, rank: 1, brand: "Godrej No.1", category: "Bar Soaps", url: "https://www.flipkart.com/godrej-no1-lime/p/example6", source: "flipkart" },
        { title: "Garnier Men Acno Fight Face Wash, 150g", price: "₹189", rating: 4.0, review_count: 19600, rank: 3, brand: "Garnier", category: "Face Wash", url: "https://www.flipkart.com/garnier-men-acno/p/example7", source: "flipkart" },
        { title: "Mamaearth Ubtan Face Wash with Turmeric & Saffron, 100ml", price: "₹249", rating: 4.0, review_count: 31200, rank: 4, brand: "Mamaearth", category: "Face Wash", url: "https://www.flipkart.com/mamaearth-ubtan/p/example8", source: "flipkart" },
        { title: "Beardo Activated Charcoal Peel Off Mask, 100g", price: "₹375", rating: 4.1, review_count: 7800, rank: 2, brand: "Beardo", category: "Face Wash", url: "https://www.flipkart.com/beardo-charcoal-mask/p/example9", source: "flipkart" },
        { title: "Godrej Protekt Germ Fighter Handwash Refill, 1500ml", price: "₹159", rating: 4.4, review_count: 11600, rank: 1, brand: "Godrej Protekt", category: "Shampoo", url: "https://www.flipkart.com/godrej-protekt-handwash/p/example10", source: "flipkart" },
      ],

      // -- Instagram (5 signals) ---
      instagram: [
        { title: "Men's Morning Skincare Routine for Indian Skin", source: "instagram", url: "https://www.instagram.com/explore/tags/mensskincareindia/", engagement: 0, query: "site:instagram.com skincare routine india men" },
        { title: "Beard Transformation Before & After Using Natural Oils", source: "instagram", url: "https://www.instagram.com/explore/tags/beardcareindia/", engagement: 0, query: "site:instagram.com beard care india" },
        { title: "Godrej Expert Hair Colour Shade Comparison Reel", source: "instagram", url: "https://www.instagram.com/explore/tags/haircolourindia/", engagement: 0, query: "site:instagram.com hair colour india" },
        { title: "Summer Deodorant Endurance Test - Park Avenue vs Nivea vs Wild Stone", source: "instagram", url: "https://www.instagram.com/explore/tags/deodorantindia/", engagement: 0, query: "site:instagram.com deodorant india" },
        { title: "Glass Skin Tutorial Modified for Humid Indian Summers", source: "instagram", url: "https://www.instagram.com/explore/tags/glassskin/", engagement: 0, query: "site:instagram.com mens grooming india" },
      ],
    },

    // ---- Brand ownership mapping ----------------------------------------
    brands: {
      own: [...OWN_BRANDS],
      competitors: [...COMPETITOR_BRANDS],
    },
  };
}

// ---------------------------------------------------------------------------
// 2. getAllSignals(data)
//    Flatten every platform's array inside raw_signals into one list.
//    Each signal gets a `platform` field so consumers can distinguish origin.
// ---------------------------------------------------------------------------
export function getAllSignals(data) {
  if (!data || !data.raw_signals) return [];

  const platformNames = {
    google:    "Google",
    reddit:    "Reddit",
    rss:       "News / RSS",
    social:    "Social / Twitter",
    pinterest: "Pinterest",
    amazon:    "Amazon",
    nykaa:     "Nykaa",
    flipkart:  "Flipkart",
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
// 3. getSignalsByPlatform(data, platform)
//    Filter the flattened signal list by a platform name string.
//    The comparison is case-insensitive and supports partial matches so that
//    "amazon" matches "Amazon", "google" matches "Google", etc.
// ---------------------------------------------------------------------------
export function getSignalsByPlatform(data, platform) {
  const all = getAllSignals(data);
  const needle = (platform || "").toLowerCase();
  return all.filter((s) => (s.platform || "").toLowerCase().includes(needle));
}

// ---------------------------------------------------------------------------
// 4. getCompetitorSignals(data)
//    Return every signal whose title mentions at least one competitor brand.
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
// 5. getBrandMentions(data)
//    Count how many times each own / competitor brand name appears in signal
//    titles across all platforms.
//    Returns { own: [{name, count}], competitors: [{name, count}] }
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

  return {
    own: countMentions(ownBrands),
    competitors: countMentions(compBrands),
  };
}

// ---------------------------------------------------------------------------
// 6. categorizeSignal(signal)
//    Inspect the signal's title for keywords and return one of:
//    Skincare | Haircare | Fragrance | Soaps | Grooming | General
// ---------------------------------------------------------------------------
export function categorizeSignal(signal) {
  const title = (signal?.title || "").toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => title.includes(kw))) {
      return category;
    }
  }
  return "General";
}

// ---------------------------------------------------------------------------
// 7. getUrgencyLevel(trend)
//    Map a trend's label to URGENT / MONITOR / WATCH.
//    Unknown labels default to WATCH.
// ---------------------------------------------------------------------------
export function getUrgencyLevel(trend) {
  const label = (trend?.label || "").trim();
  return URGENCY_MAP[label] || "WATCH";
}

// ---------------------------------------------------------------------------
// Default export  --  the seed dataset ready to drop into any component
// ---------------------------------------------------------------------------
const seedData = getSeedData();
export default seedData;
