import os
import json
import logging
import httpx
import urllib3
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# -- SSL bypass --
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
_orig_httpx_client_init = httpx.Client.__init__
def _patched_httpx_client_init(self, *args, **kwargs):
    kwargs["verify"] = False
    _orig_httpx_client_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_client_init

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_categorized_trends(config, google_trends, reddit_posts, rss_headlines, social_trends=None, pinterest_trends=None,
                           amazon_data=None, nykaa_data=None, flipkart_data=None, instagram_data=None):
    """
    Step 1: Identify 5 trends with mobile-optimized data fields.
    Now accepts e-commerce bestseller data (Amazon, Nykaa, Flipkart) and Instagram signals.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment.")
        return []

    try:
        client = genai.Client(api_key=api_key)
        model_id = "gemini-3.1-flash-lite-preview" 

        # Format inputs
        reddit_list = "\n".join([f"- {p['title']} [{p.get('score', 0)} upvotes, Sub: {p['subreddit']}]" for p in reddit_posts[:80]])
        news_list = "\n".join([f"- {r['title']}" for r in rss_headlines[:30]])
        other_list = f"Social/Search: {social_trends} {google_trends} {pinterest_trends}"

        system_instr = """You are a Beauty Trends Analyst. Provide exactly 5 trends with high specificity for a mobile report.

Labels: [REDDIT EXCLUSIVE], [GOOGLE/SOCIAL], [NEWS/RSS], [CROSS-PLATFORM], [INGREDIENT BREAKOUT], [E-COMMERCE SIGNAL], [INSTAGRAM BUZZ]

STRICT RULES:
- Context must be brief (max 20 words).
- Result must be specific (max 15 words).
- Metric should be the upvote count or 'Trending Search'.

OUTPUT FORMAT: Return a JSON array of 5 objects:
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

        gemini_config = types.GenerateContentConfig(
            system_instruction=system_instr,
            temperature=0.1,
            response_mime_type="application/json",
        )

        prompt = f"DATA SOURCES:\n\nREDDIT:\n{reddit_list}\n\nGOOGLE/SOCIAL:\n{other_list}\n\nNEWS:\n{news_list}"

        # Append e-commerce bestseller data
        if amazon_data:
            amazon_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}★ | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (amazon_data[:30] if isinstance(amazon_data, list) else [])])
            if amazon_list:
                prompt += f"\n\nAMAZON BESTSELLERS:\n{amazon_list}"

        if nykaa_data:
            nykaa_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}★ | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (nykaa_data[:30] if isinstance(nykaa_data, list) else [])])
            if nykaa_list:
                prompt += f"\n\nNYKAA BESTSELLERS:\n{nykaa_list}"

        if flipkart_data:
            flipkart_list = "\n".join([f"- #{p.get('rank','')} {p.get('title','')[:80]} | {p.get('price','')} | {p.get('rating',0)}★ | {p.get('review_count',0)} reviews [{p.get('category','')}]" for p in (flipkart_data[:30] if isinstance(flipkart_data, list) else [])])
            if flipkart_list:
                prompt += f"\n\nFLIPKART BESTSELLERS:\n{flipkart_list}"

        if instagram_data:
            insta_list = "\n".join([f"- {p.get('title','')[:100]} [query: {p.get('query','')}]" for p in (instagram_data[:20] if isinstance(instagram_data, list) else [])])
            if insta_list:
                prompt += f"\n\nINSTAGRAM SIGNALS:\n{insta_list}"

        logger.info(f"Extracting 9-Platform Beauty Intelligence for mobile report using {model_id}...")

        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=gemini_config,
        )

        if response.text:
            return json.loads(response.text.strip())
        return []

    except Exception as e:
        logger.error(f"Trend Analysis Error: {str(e)}")
        return []
