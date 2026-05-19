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
            "google": google[:50],
            "reddit": reddit[:50],
            "rss": rss[:50],
            "social": social[:50],
            "pinterest": pinterest[:30],
            "amazon": amazon[:60],
            "nykaa": nykaa[:60],
            "flipkart": flipkart[:60],
            "instagram": instagram[:30],
        },
        "ecommerce_signals": {
            "amazon": amazon[:30],
            "nykaa": nykaa[:30],
            "flipkart": flipkart[:30],
        },
        "brands": {
            "own": config.get("brands", {}).get("own", []),
            "competitors": config.get("brands", {}).get("competitors", []),
        }
    }
    with open("daily_beauty_insights.json", "w") as f:
        json.dump(insights, f, indent=4)

    # 4. Format Telegram Output (Mobile-Optimized Structure)
    msg = "💎 *GCPL DAILY INTELLIGENCE* 💎\n\n"
    for i, t in enumerate(trends[:5], 1):
        label = t.get('label', '[TREND]')
        name = t.get('trend_name', t.get('trend', 'Beauty Trend'))
        source = t.get('source_platform', t.get('platform', 'Multiple Sources'))
        metric = t.get('metric', t.get('popularity', t.get('metric_summary', 'Rising')))
        context = t.get('context', t.get('what_is_happening', ''))
        result = t.get('result', t.get('the_result', ''))

        msg += f"*{label}*\n"
        msg += f"*\"{name}\"*\n\n"
        msg += f"📍 *Source:* {source}\n"
        msg += f"📊 *Metric:* {metric}\n\n"
        msg += f"💬 *Context:*\n{context}\n\n"
        msg += f"✨ *The Result:*\n{result}\n\n"
        msg += "───────────────────\n\n"

    await send_telegram_alert({"custom_message": msg, "trend_name": "Mobile Report"})
    logger.info("Pipeline run completed. Telegram sent.")

if __name__ == "__main__":
    asyncio.run(run_pipeline())
