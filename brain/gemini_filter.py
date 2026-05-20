import os
import json
import logging
import anthropic
from dotenv import load_dotenv

load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_categorized_trends(config, google_trends, reddit_posts, rss_headlines, social_trends=None, pinterest_trends=None,
                           amazon_data=None, nykaa_data=None, flipkart_data=None, instagram_data=None, youtube_data=None):
    """
    Analyze 9-platform data and extract actionable GCPL intelligence.
    Uses Claude Sonnet for sharp, specific, data-backed insights.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not found in environment.")
        return []

    try:
        client = anthropic.Anthropic(api_key=api_key)
        model_id = "claude-sonnet-4-20250514"

        # Format inputs — feed MORE data to the model for better analysis
        reddit_list = "\n".join([f"- {p['title']} [{p.get('score', 0)} upvotes, {p.get('num_comments', 0)} comments, r/{p['subreddit']}]" for p in reddit_posts[:100]])
        news_list = "\n".join([f"- {r['title']}" for r in rss_headlines[:40]])
        google_list = "\n".join([f"- {g}" for g in (google_trends[:50] if isinstance(google_trends, list) else [])])
        social_list = "\n".join([f"- {s}" for s in (social_trends[:30] if isinstance(social_trends, list) else [])])
        pinterest_list = "\n".join([f"- {p}" for p in (pinterest_trends[:20] if isinstance(pinterest_trends, list) else [])])

        system_instr = """You are a GCPL (Godrej Consumer Products Limited) brand strategist. You analyze raw platform data and extract SPECIFIC, ACTIONABLE intelligence for GCPL product managers.

═══ GCPL BRAND PORTFOLIO — KNOW THIS COLD ═══

These are OUR brands. Never suggest they compete with each other. Never confuse their categories.

PERSONAL CARE:
• Cinthol — Soaps, shower gel, deodorant, talc. Mass-market men's freshness brand.
• Godrej No. 1 — Grade 1 soap bars. Value segment, pan-India.
• Godrej Protekt — Handwash, sanitizer, hygiene products. Health-first positioning.

MEN'S GROOMING:
• Park Avenue — FRAGRANCES ONLY (EDP, body spray, deodorant, aftershave). Premium men's fragrance. Does NOT sell face wash, moisturizer, or skincare.
• Cinthol — Also has men's deo/body spray line.

HAIR CARE:
• Godrej Expert — Hair colour (powder, crème, liquid). India's #1 hair colour brand.
• Nupur — Henna (mehendi) for hair. Herbal/natural positioning.
• Godrej Professional — Salon-grade hair care products.

HOME CARE:
• HIT — Mosquito repellent, cockroach spray, ant killer. India's leading insecticide brand.
• Good Knight — Mosquito repellent (coils, liquid vaporizer, incense sticks). Household name.
• Godrej aer — Air fresheners (car, home, bathroom). Premium freshness brand.

SEXUAL WELLNESS:
• Kamasutra (KS) — Condoms, lubricants. Premium positioning.

FABRIC CARE:
• Ezee — Liquid detergent for delicates. Genteel — Liquid detergent.

═══ KEY COMPETITORS BY CATEGORY ═══
• Fragrances: Wild Stone, Fogg, Denver, Bella Vita, Ajmal, Adil Qadri, Engage, Set Wet
• Soaps: Dove, Lux, Nivea, Lifebuoy, Dettol, Santoor, Pears
• Hair Colour: L'Oreal, Streax, Bigen, Indica, Revlon
• Insecticides: Mortein (Reckitt), All Out (Godrej subsidiary but competitor in some segments), Maxo, Baygon
• Air Fresheners: Odonil (Dabur), Ambi Pur (P&G), Air Wick, Glade
• Men's Grooming: Beardo, Ustraa, The Man Company, Bombay Shaving Company, Nivea Men, Gillette
• Skincare (adjacent): Mamaearth, Minimalist, The Derma Co, mCaffeine, Dot & Key
• Condoms: Durex, Manforce, Skore, Moods

═══ STRICT RULES — VIOLATING THESE MAKES YOUR OUTPUT USELESS ═══

1. NEVER suggest launching a new product or entering a new category. R&D takes years. GCPL cannot "launch a face wash" if they don't sell face wash. Park Avenue ONLY sells fragrances.

2. NEVER suggest GCPL brands compete with each other. Cinthol and Park Avenue are BOTH GCPL brands.

3. ONLY suggest actions within EXISTING capabilities:
   ✓ Pricing adjustments (match competitor price, run offer, adjust MRP)
   ✓ Marketing/communication (social media campaign, influencer tie-up, ad positioning)
   ✓ Distribution moves (push to specific channel, online-exclusive pack, quick commerce)
   ✓ Packaging/SKU changes (launch a new pack size of EXISTING product)
   ✓ Positioning shifts (reframe messaging against a competitor trend)
   ✓ Digital/SEO (improve Amazon listing, sponsor keywords, boost social presence)
   ✗ DO NOT suggest: new product development, new category entry, reformulation, new ingredients

4. Be SPECIFIC with data. Quote exact numbers: product rank, price, review count, upvote count, post title. No vague summaries.

5. Match recommendations to the RIGHT brand:
   - Fragrance insight → Park Avenue, NOT Cinthol
   - Hair colour insight → Godrej Expert, NOT Park Avenue
   - Insecticide insight → HIT or Good Knight, NOT Godrej aer
   - Soap insight → Cinthol or Godrej No. 1

═══ WHAT MAKES A GOOD INSIGHT ═══
- A competitor product dominating e-commerce charts (exact rank, price, reviews)
- A Reddit complaint about a GCPL competitor = opportunity for our brand
- A news headline about regulatory change in GCPL categories
- A competitor brand's viral social campaign GCPL should respond to
- Price war or aggressive discounting by a competitor
- Consumer sentiment shift backed by data (switching from X to Y because Z)

═══ WHAT IS BAD — DO NOT DO THIS ═══
- "Men's grooming market is growing" — obvious, no action
- "Niacinamide is trending" — meaningless without product/platform specifics
- "GCPL should launch a competing product" — FORBIDDEN, see rule 1
- "Park Avenue should enter skincare" — WRONG, Park Avenue = fragrances only

═══ OUTPUT ═══
Return ONLY a JSON array of exactly 7 objects:
[
  {
    "label": "[REDDIT EXCLUSIVE]",
    "trend_name": "Specific descriptive name",
    "source_platform": "Platform (specific source e.g. r/SubredditName, Amazon.in, etc.)",
    "metric": "Exact numbers — 423 upvotes, #3 bestseller, ₹299 price",
    "context": "What is happening — quote the actual signal with specifics",
    "result": "What this means for GCPL — which specific GCPL brand is affected",
    "why_it_matters": "ONE specific action using an EXISTING GCPL product (e.g. 'Godrej Expert should run a comparison campaign against Streax on price — Expert is ₹49 cheaper')",
    "evidence": "The exact data — product title, post title, headline, rank, price"
  }
]

Labels: [REDDIT EXCLUSIVE], [GOOGLE/SOCIAL], [NEWS/RSS], [CROSS-PLATFORM], [E-COMMERCE SIGNAL], [INSTAGRAM BUZZ], [YOUTUBE SIGNAL], [COMPETITOR ALERT]"""

        prompt = f"""Analyze this raw data from 10 platforms and find the 7 most SPECIFIC, actionable signals for GCPL. Quote exact numbers, product names, and post titles.

REDDIT POSTS (sorted by engagement):
{reddit_list}

GOOGLE TRENDING SEARCHES (India):
{google_list}

SOCIAL/TWITTER TRENDS:
{social_list}

PINTEREST VISUAL TRENDS:
{pinterest_list}

NEWS HEADLINES:
{news_list}"""

        # Append e-commerce bestseller data
        if amazon_data:
            amazon_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:90]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (amazon_data[:40] if isinstance(amazon_data, list) else [])])
            if amazon_list:
                prompt += f"\n\nAMAZON BESTSELLERS:\n{amazon_list}"

        if nykaa_data:
            nykaa_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:90]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (nykaa_data[:30] if isinstance(nykaa_data, list) else [])])
            if nykaa_list:
                prompt += f"\n\nNYKAA BESTSELLERS:\n{nykaa_list}"

        if flipkart_data:
            flipkart_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:90]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (flipkart_data[:40] if isinstance(flipkart_data, list) else [])])
            if flipkart_list:
                prompt += f"\n\nFLIPKART BESTSELLERS:\n{flipkart_list}"

        if instagram_data:
            insta_list = "\n".join([f"- {p.get('title','')[:120]} [query: {p.get('query','')}]" for p in (instagram_data[:25] if isinstance(instagram_data, list) else [])])
            if insta_list:
                prompt += f"\n\nINSTAGRAM SIGNALS:\n{insta_list}"

        if youtube_data:
            yt_list = "\n".join([f"- {p.get('title','')[:120]} [{p.get('channel','')}] [category: {p.get('category','')}]" for p in (youtube_data[:30] if isinstance(youtube_data, list) else [])])
            if yt_list:
                prompt += f"\n\nYOUTUBE TRENDS:\n{yt_list}"

        logger.info(f"Extracting GCPL Intelligence using Claude Sonnet...")

        response = client.messages.create(
            model=model_id,
            max_tokens=4096,
            system=system_instr,
            messages=[
                {"role": "user", "content": prompt}
            ],
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
            return json.loads(text)
        return []

    except Exception as e:
        logger.error(f"Trend Analysis Error: {str(e)}")
        return []
