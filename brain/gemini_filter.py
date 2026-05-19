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
                           amazon_data=None, nykaa_data=None, flipkart_data=None, instagram_data=None):
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

        system_instr = """You are a consumer intelligence analyst working for GCPL (Godrej Consumer Products Limited). Your job is to find the most SPECIFIC, ACTIONABLE, DATA-BACKED signals from raw platform data.

GCPL sells: Men's face wash, sunscreen, beard care, perfumes, deodorants, body sprays, hair colour, henna, soaps, body wash, hand wash, mosquito repellent (HIT, Good Knight), air fresheners (Godrej aer), condoms (Kamasutra). Key brands: Cinthol, Park Avenue, Godrej Expert, Nupur, HIT, Good Knight, Godrej aer, Kamasutra.

YOUR TASK: Find exactly 7 insights. NOT generic trend summaries — find SPECIFIC signals that a GCPL product manager would act on TODAY.

WHAT MAKES A GOOD INSIGHT:
- A Reddit post with 200+ upvotes about a specific product complaint or rave review
- A specific competitor product dominating bestseller charts (name the exact product + rank)
- A viral Instagram/social post about a GCPL-adjacent category
- A news headline about regulatory change, ingredient controversy, or market shift
- An e-commerce price war or new product launch in GCPL categories
- Consumer sentiment shift (e.g., "users switching FROM X TO Y because Z")

WHAT IS BAD (DO NOT DO THIS):
- "Men's grooming market is growing" — too generic, everyone knows this
- "Niacinamide is trending" — no specifics on which product, what platform, what numbers
- "Consumers prefer natural ingredients" — meaningless without data

For each insight, include:
- "why_it_matters": One sentence on what GCPL should DO about this (e.g., "Park Avenue should launch a competing SKU at Rs 299" or "Godrej Expert should monitor this complaint trend")
- "evidence": Quote the EXACT data point — the Reddit post title with upvotes, the exact Amazon product rank, the specific news headline

OUTPUT FORMAT: Return ONLY a JSON array of 7 objects:
[
  {
    "label": "[REDDIT EXCLUSIVE]",
    "trend_name": "Specific Name (not generic)",
    "source_platform": "Reddit (r/SubredditName)",
    "metric": "423 upvotes, 87 comments",
    "context": "Exact what is happening — quote the signal",
    "result": "What this means for GCPL specifically",
    "why_it_matters": "Actionable recommendation for GCPL",
    "evidence": "Exact data point or post title"
  }
]

Labels: [REDDIT EXCLUSIVE], [GOOGLE/SOCIAL], [NEWS/RSS], [CROSS-PLATFORM], [E-COMMERCE SIGNAL], [INSTAGRAM BUZZ], [COMPETITOR ALERT]"""

        prompt = f"""Analyze this raw data from 9 platforms and find the 7 most SPECIFIC, actionable signals for GCPL. Quote exact numbers, product names, and post titles.

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
