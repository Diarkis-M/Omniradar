"""
Brand Briefs Generator for TrendRadar.

Makes one Claude Sonnet API call to generate 1-3 actionable daily bullet points
per GCPL category cluster. Called after the main trend analysis in main.py.
"""

import os
import json
import logging
import anthropic
from dotenv import load_dotenv

load_dotenv(override=True)
logger = logging.getLogger(__name__)

# 7 GCPL Category Clusters — mapped to real BM roles
CATEGORY_CLUSTERS = {
    "personal-wash": {
        "name": "Personal Wash",
        "brands": ["Cinthol", "Godrej No.1", "Godrej Protekt"],
        "competitors": ["Dove", "Lux", "Nivea", "Lifebuoy", "Dettol", "Santoor", "Pears", "Fiama"],
        "keywords": ["soap", "body wash", "shower gel", "handwash", "sanitizer", "bathing bar", "liquid soap"],
    },
    "hair-care": {
        "name": "Hair Care",
        "brands": ["Godrej Expert", "Nupur", "Godrej Professional"],
        "competitors": ["L'Oreal", "Streax", "Bigen", "Indica", "Revlon", "Garnier", "Indulekha"],
        "keywords": ["hair colour", "hair color", "henna", "mehendi", "hair dye", "shampoo", "conditioner", "hair serum"],
    },
    "mens-grooming": {
        "name": "Men's Grooming & Fragrances",
        "brands": ["Park Avenue", "Cinthol"],
        "competitors": ["Wild Stone", "Fogg", "Denver", "Beardo", "Ustraa", "The Man Company", "Set Wet", "Nivea Men", "Engage"],
        "keywords": ["men's deodorant", "body spray", "perfume", "eau de parfum", "aftershave", "men's fragrance", "cologne", "beard"],
    },
    "home-insecticides": {
        "name": "Home Insecticides",
        "brands": ["HIT", "Good Knight"],
        "competitors": ["Mortein", "All Out", "Maxo", "Baygon", "Raid"],
        "keywords": ["mosquito", "insecticide", "repellent", "cockroach", "ant killer", "dengue", "malaria", "coil", "vaporizer"],
    },
    "air-fresheners": {
        "name": "Air Fresheners",
        "brands": ["Godrej aer"],
        "competitors": ["Odonil", "Ambi Pur", "Air Wick", "Glade", "Febreze"],
        "keywords": ["air freshener", "room freshener", "car freshener", "bathroom freshener", "fragrance spray", "gel freshener"],
    },
    "sexual-wellness": {
        "name": "Sexual Wellness",
        "brands": ["Kamasutra", "KS"],
        "competitors": ["Durex", "Manforce", "Skore", "Moods", "Kohinoor"],
        "keywords": ["condom", "lubricant", "intimate", "sexual wellness", "contraceptive"],
    },
    "fabric-care": {
        "name": "Fabric Care",
        "brands": ["Ezee", "Genteel"],
        "competitors": ["Surf Excel", "Ariel", "Tide", "Comfort", "Vanish"],
        "keywords": ["liquid detergent", "fabric softener", "delicate wash", "laundry", "stain remover"],
    },
}


def generate_brand_briefs(config, raw_signals, ecommerce_signals, existing_trends):
    """
    Generate 1-3 actionable daily briefs per GCPL category cluster.

    Args:
        config: dict from config.yaml
        raw_signals: dict with keys google, reddit, rss, social, pinterest, instagram, youtube
        ecommerce_signals: dict with keys amazon, nykaa, flipkart
        existing_trends: list of 7 AI-curated trend dicts from get_categorized_trends()

    Returns:
        dict mapping cluster_slug -> list of brief dicts
        Example: {"personal-wash": [{"text": "...", "evidence": "..."}], ...}
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not found — skipping brand briefs.")
        return {}

    try:
        client = anthropic.Anthropic(api_key=api_key)

        # Build cluster context string
        cluster_desc = ""
        for slug, cluster in CATEGORY_CLUSTERS.items():
            cluster_desc += f"\n{cluster['name'].upper()}\n"
            cluster_desc += f"  GCPL Brands: {', '.join(cluster['brands'])}\n"
            cluster_desc += f"  Competitors: {', '.join(cluster['competitors'])}\n"
            cluster_desc += f"  Keywords: {', '.join(cluster['keywords'])}\n"

        # Build signal summaries (reuse formatting from gemini_filter.py)
        reddit_summary = "\n".join([
            f"- {p['title']} [{p.get('score', 0)} upvotes, r/{p['subreddit']}]"
            for p in (raw_signals.get('reddit', []) or [])[:80]
        ])
        news_summary = "\n".join([
            f"- {r['title']}" for r in (raw_signals.get('rss', []) or [])[:30]
        ])
        google_summary = "\n".join([
            f"- {g}" for g in (raw_signals.get('google', []) or [])[:30]
            if isinstance(g, str)
        ])

        ecom_summary = ""
        for platform in ['amazon', 'nykaa', 'flipkart']:
            items = (ecommerce_signals.get(platform, []) or [])[:30]
            if items:
                lines = "\n".join([
                    f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]"
                    for p in items
                ])
                ecom_summary += f"\n{platform.upper()} BESTSELLERS:\n{lines}\n"

        # Existing AI trends as context
        trends_summary = "\n".join([
            f"- [{t.get('label','')}] {t.get('trend_name','')}: {t.get('why_it_matters','')}"
            for t in (existing_trends or [])[:7]
        ])

        system_prompt = f"""You are a GCPL brand intelligence analyst. Your job: scan today's market signals and produce a DAILY BRIEF for each category cluster's brand manager.

Each brand manager sees ONLY their cluster's brief. It must be immediately useful — no fluff, no obvious statements, no "market is growing" filler.

═══ CATEGORY CLUSTERS ═══
{cluster_desc}

═══ RULES ═══
1. Output 1 to 3 bullet points PER cluster. If nothing actionable happened today for a cluster, output exactly 1 point saying "No significant signals today — monitors stable."
2. Each bullet must cite SPECIFIC data: product name, rank, price, upvote count, post title, or headline.
3. NEVER suggest new product launches or category entry. ONLY recommend actions with EXISTING products.
4. Match insights to the CORRECT cluster. Fragrance insight = Men's Grooming, NOT Personal Wash.
5. Be concise. Each bullet is ONE sentence, max 40 words. Brand managers want to read this in 30 seconds.
6. Prioritize: competitor moves > pricing changes > consumer sentiment > social buzz.

═══ OUTPUT FORMAT ═══
Return ONLY a JSON object with cluster slugs as keys:
{{
  "personal-wash": [
    {{"text": "Dove 100g bar dropped to ₹45 on Amazon (#2 bestseller) — Cinthol 100g is ₹55, consider a price-match or combo offer.", "evidence": "Amazon Soaps category, rank #2, ₹45 vs Cinthol ₹55"}}
  ],
  "hair-care": [...],
  "mens-grooming": [...],
  "home-insecticides": [...],
  "air-fresheners": [...],
  "sexual-wellness": [...],
  "fabric-care": [...]
}}"""

        user_prompt = f"""Today's market signals. Scan these and generate the daily brief for each category cluster.

TODAY'S AI TRENDS (already extracted):
{trends_summary}

REDDIT:
{reddit_summary}

GOOGLE TRENDS:
{google_summary}

NEWS:
{news_summary}

E-COMMERCE:
{ecom_summary}"""

        logger.info("Generating brand briefs via Claude Sonnet...")
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.15,
        )

        if response.content and len(response.content) > 0:
            text = response.content[0].text.strip()
            # Extract JSON from response (handle markdown code blocks)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            briefs = json.loads(text)
            total_points = sum(len(v) for v in briefs.values())
            logger.info(f"Brand briefs generated: {total_points} points across {len(briefs)} clusters")
            return briefs

        logger.warning("Claude returned empty response for brand briefs.")
        return {}

    except Exception as e:
        logger.error(f"Brand briefs generation failed: {e}")
        return {}
