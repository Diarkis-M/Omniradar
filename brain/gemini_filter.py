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
    Step 1: Identify 5 trends with mobile-optimized data fields.
    Uses Claude Haiku for fast, reliable analysis.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not found in environment.")
        return []

    try:
        client = anthropic.Anthropic(api_key=api_key)
        model_id = "claude-sonnet-4-20250514"

        # Format inputs
        reddit_list = "\n".join([f"- {p['title']} [{p.get('score', 0)} upvotes, Sub: {p['subreddit']}]" for p in reddit_posts[:80]])
        news_list = "\n".join([f"- {r['title']}" for r in rss_headlines[:30]])
        other_list = f"Social/Search: {social_trends} {google_trends} {pinterest_trends}"

        system_instr = """You are a Beauty & FMCG Trends Analyst for Godrej Consumer Products Limited (GCPL). Provide exactly 5 trends with high specificity for a mobile report.

GCPL PRODUCT PORTFOLIO: Men's Grooming (face wash, sunscreen, beard care), Fragrances & EDP (perfumes, deodorants, body sprays), Hair Care (hair colour, henna), Soaps & Body (soaps, body wash, hand wash), Skincare, Home Insecticides (mosquito repellent, cockroach killer), Air Fresheners, Sexual Wellness.

Labels: [REDDIT EXCLUSIVE], [GOOGLE/SOCIAL], [NEWS/RSS], [CROSS-PLATFORM], [INGREDIENT BREAKOUT], [E-COMMERCE SIGNAL], [INSTAGRAM BUZZ]

STRICT RULES:
- Focus on trends relevant to GCPL's product categories listed above.
- Context must be brief (max 20 words).
- Result must be specific (max 15 words).
- Metric should be the upvote count or 'Trending Search'.

OUTPUT FORMAT: Return ONLY a JSON array of 5 objects, no other text:
[
  {
    "label": "[REDDIT EXCLUSIVE]",
    "trend_name": "Trend Name",
    "source_platform": "Reddit (r/Subreddit)",
    "metric": "107 upvotes",
    "context": "Short description of what users are saying",
    "result": "Short description of the benefit/outcome"
  }
]"""

        prompt = f"DATA SOURCES:\n\nREDDIT:\n{reddit_list}\n\nGOOGLE/SOCIAL:\n{other_list}\n\nNEWS:\n{news_list}"

        # Append e-commerce bestseller data
        if amazon_data:
            amazon_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (amazon_data[:30] if isinstance(amazon_data, list) else [])])
            if amazon_list:
                prompt += f"\n\nAMAZON BESTSELLERS:\n{amazon_list}"

        if nykaa_data:
            nykaa_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (nykaa_data[:30] if isinstance(nykaa_data, list) else [])])
            if nykaa_list:
                prompt += f"\n\nNYKAA BESTSELLERS:\n{nykaa_list}"

        if flipkart_data:
            flipkart_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}* | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (flipkart_data[:30] if isinstance(flipkart_data, list) else [])])
            if flipkart_list:
                prompt += f"\n\nFLIPKART BESTSELLERS:\n{flipkart_list}"

        if instagram_data:
            insta_list = "\n".join([f"- {p.get('title','')[:100]} [query: {p.get('query','')}]" for p in (instagram_data[:20] if isinstance(instagram_data, list) else [])])
            if insta_list:
                prompt += f"\n\nINSTAGRAM SIGNALS:\n{insta_list}"

        logger.info(f"Extracting 9-Platform GCPL Intelligence using Claude Haiku...")

        response = client.messages.create(
            model=model_id,
            max_tokens=2048,
            system=system_instr,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
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
