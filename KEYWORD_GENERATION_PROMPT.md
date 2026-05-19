# Keyword Generation Prompt for Omniradar Pipeline

Copy-paste the prompt below into any LLM (ChatGPT, Gemini, Claude, etc.)

---

## THE PROMPT

```
I am building a consumer intelligence radar for Godrej Consumer Products Limited (GCPL), an Indian FMCG company. I need you to generate exhaustive keyword lists that I will use to filter Google Trends, Twitter/X trending topics, Pinterest trending pins, Reddit posts, Instagram content, and news/RSS feeds — so that ONLY signals relevant to GCPL's business show up.

## GCPL's Product Portfolio (brands in parentheses)

1. **Personal Wash / Soaps** — Cinthol, Godrej No.1, Godrej Protekt (bar soaps, liquid handwash, shower gels, sanitizers)
2. **Hair Care / Hair Colour** — Godrej Expert, Godrej Professional, Nupur (hair colour, henna/mehendi, shampoo, conditioner, hair serum, hair oil)
3. **Men's Grooming** — Cinthol, Park Avenue (men's face wash, men's moisturizer, men's sunscreen, beard oil, shaving cream, aftershave, trimmer-related)
4. **Fragrances & Deodorants** — Park Avenue, Kamasutra/KS (perfume/EDP/EDT, deodorant, body spray, roll-on, antiperspirant)
5. **Home Insecticides** — HIT, Good Knight (mosquito repellent, cockroach spray, ant killer, mosquito coil, liquid vaporizer, pest control)
6. **Air Care / Air Fresheners** — Godrej aer (room freshener, car freshener, bathroom freshener, air purifier spray)
7. **Sexual Wellness** — Kamasutra (condoms, lubricants, intimate care)
8. **Skincare** — across brands (face wash, sunscreen, moisturizer, serum, SPF products)

## GCPL's Key Competitors (by category)

- **Men's Grooming**: Beardo, Ustraa, The Man Company, Man Matters, Bombay Shaving Company, Gillette
- **Fragrances/Deo**: Wild Stone, Set Wet, Denver, Fogg, Engage, Bella Vita, Ajmal, Adil Qadri, Afnan, Skinn by Titan, Guess, Police (perfume brand)
- **Soaps/Body**: Dove, Nivea, Santoor, Medimix, Pears, Lux, Lifebuoy, Dettol
- **Hair Care**: L'Oreal, Garnier, Streax, Indulekha, Biotique, Kama Ayurveda
- **Skincare D2C**: Mamaearth, Minimalist, Deconstruct, The Derma Co, mCaffeine, Neutrogena, Plum, Dot & Key, Cetaphil, CeraVe
- **Home Insecticides**: Mortein, All Out, Maxo, Kala HIT competitors
- **Air Fresheners**: Odonil, Ambi Pur, Air Wick
- **Sexual Wellness**: Manforce, Durex, Skore

## What I Need

For EACH of the following filter categories, give me an exhaustive list of keywords/phrases (lowercase). These keywords will be matched as substrings against signal titles — so "moistur" will match both "moisturizer" and "moisturising".

### Category 1: Product-Level Keywords
For each of GCPL's 8 product categories above, give me 30-50 keywords covering:
- Product types (e.g., "bar soap", "shower gel", "roll-on deodorant")
- Active ingredients consumers search for (e.g., "niacinamide", "salicylic acid", "DEET")
- Consumer problems/needs (e.g., "body odour", "frizzy hair", "mosquito bite")
- Trending formats (e.g., "solid perfume", "micellar water", "gel sunscreen")
- Texture/format terms (e.g., "foam", "gel", "cream", "spray", "stick")
- Indian-specific terms (e.g., "mehendi", "ubtan", "multani mitti")

### Category 2: Brand Keywords
All GCPL own brands AND all competitor brand names listed above, plus any major brands I may have missed in each category in the Indian market.

### Category 3: Industry & Business Keywords
Keywords that capture FMCG industry news relevant to GCPL:
- Business terms: "FMCG", "consumer goods", "personal care market", "D2C brand", "quick commerce"
- Retail/distribution: "Amazon India", "Flipkart", "Nykaa", "Blinkit", "Zepto", "BigBasket", "DMart"
- Regulatory: "BIS standard", "CDSCO", "FSSAI", "cosmetic regulation India"
- Investor/financial: "GCPL", "Godrej Consumer", "earnings", "quarterly results", "market share"
- Sustainability: "sustainable packaging", "plastic-free", "refill", "cruelty-free", "vegan"
- Consumer trends: "premiumization", "ayurveda", "clean label", "gender-neutral", "men's beauty"

### Category 4: Social/Cultural Trend Keywords
Terms that show up in social media trends relevant to GCPL categories:
- Beauty/grooming trends: "glass skin", "clean girl", "soft boy", "grwm", "skincare routine", "beard style"
- Seasonal: "summer skincare", "monsoon hair", "winter moisturizer", "Diwali gifting"
- Platform-specific: hashtags, creator terminology, viral formats

## Output Format

Return the result as a JSON object with this exact structure:

{
  "product_keywords": {
    "personal_wash": ["keyword1", "keyword2", ...],
    "hair_care": ["keyword1", "keyword2", ...],
    "mens_grooming": ["keyword1", "keyword2", ...],
    "fragrances_deo": ["keyword1", "keyword2", ...],
    "home_insecticides": ["keyword1", "keyword2", ...],
    "air_fresheners": ["keyword1", "keyword2", ...],
    "sexual_wellness": ["keyword1", "keyword2", ...],
    "skincare": ["keyword1", "keyword2", ...]
  },
  "brand_keywords": {
    "gcpl_own": ["keyword1", "keyword2", ...],
    "competitors_grooming": ["keyword1", ...],
    "competitors_fragrance": ["keyword1", ...],
    "competitors_soaps": ["keyword1", ...],
    "competitors_haircare": ["keyword1", ...],
    "competitors_skincare": ["keyword1", ...],
    "competitors_home": ["keyword1", ...],
    "competitors_air": ["keyword1", ...],
    "competitors_sexual_wellness": ["keyword1", ...]
  },
  "industry_keywords": ["keyword1", "keyword2", ...],
  "social_trend_keywords": ["keyword1", "keyword2", ...]
}

Be exhaustive. I would rather have false positives (too many keywords) than miss relevant signals. Think about what an Indian consumer would actually type into Google, tweet about, pin on Pinterest, or post on Reddit/Instagram.
```

---

## How to Use the Output

Once you get the JSON back, hand it to the developer to update:
- `frontend/src/lib/data.js` — the `CATEGORY_KEYWORDS`, `COMPETITOR_BRANDS_BY_CATEGORY`, and `GCPL_KEYWORDS` filter
- `config.yaml` — the pipeline's RSS search queries, Reddit subreddits, and e-commerce search URLs
