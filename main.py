import asyncio
import yaml
import logging
import json
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
from collectors.google_trends import get_google_trends
from collectors.reddit_public_collector import get_reddit_trends
from collectors.rss_collector import get_rss_trends
from collectors.social_collector import get_social_trends
from collectors.pinterest_collector import get_pinterest_trends
from collectors.amazon_collector import get_amazon_trends
from collectors.nykaa_collector import get_nykaa_trends
from collectors.flipkart_collector import get_flipkart_trends
from collectors.instagram_collector import get_instagram_trends
from brain.gemini_filter import get_categorized_trends
from alerts.telegram_alert import send_telegram_alert

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("run_log.txt"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

async def run_pipeline():
    logger.info("Starting Omniradar — GCPL Consumer Intelligence Pipeline...")
    
    # Load Config
    try:
        with open("config.yaml", "r") as f:
            config = yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Failed to load config.yaml: {e}")
        return

    # 1. Run Collectors (all 9 sources in parallel)
    logger.info("Fetching raw platform data from 9 sources...")
    try:
        results = await asyncio.gather(
            asyncio.to_thread(get_google_trends, config),
            asyncio.to_thread(get_reddit_trends, [s for c in config['categories'] for s in c.get('subreddits', [])]),
            asyncio.to_thread(get_rss_trends, [r for c in config['categories'] for r in c.get('rss', [])]),
            asyncio.to_thread(get_social_trends, config),
            asyncio.to_thread(get_pinterest_trends, config),
            asyncio.to_thread(get_amazon_trends, config),
            asyncio.to_thread(get_nykaa_trends, config),
            asyncio.to_thread(get_flipkart_trends, config),
            asyncio.to_thread(get_instagram_trends, config),
        )
    except Exception as e:
        logger.error(f"Collection failed: {e}")
        return

    google, reddit, rss, social, pinterest, amazon, nykaa, flipkart, instagram = results
    logger.info(f"Collection complete: Google={len(google)}, Reddit={len(reddit)}, RSS={len(rss)}, "
                f"Social={len(social)}, Pinterest={len(pinterest)}, Amazon={len(amazon)}, "
                f"Nykaa={len(nykaa)}, Flipkart={len(flipkart)}, Instagram={len(instagram)}")

    # 2. Extract Trends (pass all data sources to Gemini)
    logger.info("Extracting trends with mobile-first logic...")
    trends = get_categorized_trends(
        config, google, reddit, rss, social, pinterest,
        amazon_data=amazon, nykaa_data=nykaa, flipkart_data=flipkart, instagram_data=instagram
    )

    if not trends:
        logger.info("No trends found.")
        return

    # 3. Save Insights (all raw signals for frontend + AI digest)
    insights = {
        "timestamp": datetime.now().isoformat(),
        "trends": trends,
        "raw_signals": {
            "google": google,
            "reddit": reddit[:200],
            "rss": rss,
            "social": social,
            "pinterest": pinterest,
            "amazon": amazon,
            "nykaa": nykaa,
            "flipkart": flipkart,
            "instagram": instagram,
        },
        "ecommerce_signals": {
            "amazon": amazon,
            "nykaa": nykaa,
            "flipkart": flipkart,
        },
        "brands": {
            "own": config.get("brand_portfolio", []),
            "competitors": config.get("competitor_brands", []),
        }
    }
    with open("daily_beauty_insights.json", "w") as f:
        json.dump(insights, f, indent=4)

    # 4. Format Telegram Output — HTML mode (no Markdown escaping issues)
    import re

    def esc(text):
        """Escape HTML special chars for Telegram HTML mode."""
        s = str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        # Strip stray control characters that break Telegram parsing
        s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)
        return s

    def safe_html(raw_msg):
        """Validate that every opened HTML tag is properly closed.
        Telegram only supports: b, i, u, s, code, pre, a, tg-spoiler.
        Strip any broken / unclosed tags to prevent parse errors."""
        allowed = {'b', 'i', 'u', 's', 'code', 'pre', 'a', 'tg-spoiler'}
        stack = []
        # Quick check: count opening and closing tags match
        open_tags = re.findall(r'<(b|i|u|s|code|pre|a|tg-spoiler)(?:\s[^>]*)?>',  raw_msg)
        close_tags = re.findall(r'</(b|i|u|s|code|pre|a|tg-spoiler)>', raw_msg)
        # If they match, likely fine
        if len(open_tags) == len(close_tags):
            return raw_msg
        # Otherwise, append missing close tags
        for tag in reversed(open_tags[len(close_tags):]):
            raw_msg += f"</{tag}>"
        return raw_msg

    now = datetime.now().strftime("%d %b, %I:%M %p")
    sig_total = sum(len(v) for v in [google, reddit, rss, social, pinterest, amazon, nykaa, flipkart, instagram])
    msg = f"<b>OMNIRADAR</b> — {now}\n"
    msg += f"<i>{sig_total} signals across 9 platforms</i>\n\n"

    for i, t in enumerate(trends[:7], 1):
        label = esc(t.get('label', ''))
        name = esc(t.get('trend_name', 'Signal'))
        metric = esc(t.get('metric', ''))
        context = esc(t.get('context', ''))
        why = esc(t.get('why_it_matters', ''))

        msg += f"<b>{i}. {name}</b>\n"
        if metric:
            msg += f"{label} | {metric}\n"
        if context:
            # Truncate long context to avoid hitting Telegram's 4096 char limit
            if len(context) > 200:
                context = context[:197] + "..."
            msg += f"{context}\n"
        if why:
            if len(why) > 150:
                why = why[:147] + "..."
            msg += f"→ <i>{why}</i>\n"
        msg += "\n"

    msg += "🔗 omniradar.vercel.app"

    # Validate HTML structure and truncate if over Telegram limit
    msg = safe_html(msg)
    if len(msg.encode('utf-8')) > 4000:
        msg = msg[:3900] + "\n\n🔗 omniradar.vercel.app"
        msg = safe_html(msg)

    await send_telegram_alert({"custom_message": msg, "trend_name": "Intelligence Brief", "parse_mode": "HTML"})
    logger.info("Pipeline run completed. Telegram sent.")

if __name__ == "__main__":
    asyncio.run(run_pipeline())
