"""
Instagram Trend Collector for TrendRadar.

Primary: Google News RSS proxy (same battle-tested approach as pinterest_collector.py)
Fallback: Hardcoded GCPL-relevant beauty/grooming hashtag trends

Instagram's 2026 anti-bot measures make direct scraping unreliable for daily cron pipelines.
The RSS proxy approach searches Google News for site:instagram.com content.
"""

import logging
import feedparser
import requests
import time
import random

logger = logging.getLogger(__name__)


def _fetch_via_rss_proxy(queries):
    """
    Search Google News RSS for Instagram-related beauty/grooming content.

    Receives: list of search query strings
    Returns: list of dicts with title, source, url, engagement keys
    """
    results = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
    }

    for query in queries:
        try:
            search_q = f"{query} when:24h"
            url = f"https://news.google.com/rss/search?q={search_q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
            r = requests.get(url, headers=headers, timeout=15)

            if r.status_code != 200:
                logger.warning(f"Instagram RSS proxy returned {r.status_code} for query: {query}")
                continue

            feed = feedparser.parse(r.content)
            for entry in feed.entries[:5]:
                title = entry.get('title', '').split(' - ')[0].strip()
                link = entry.get('link', '')
                if title:
                    results.append({
                        "title": title,
                        "source": "instagram",
                        "url": link,
                        "engagement": 0,
                        "query": query,
                    })

            logger.info(f"Instagram RSS proxy: {len(feed.entries)} entries for '{query}'")

        except Exception as e:
            logger.warning(f"Instagram RSS proxy failed for '{query}': {e}")

        time.sleep(random.uniform(0.5, 1.5))

    return results


def get_instagram_trends(config):
    """
    Fetch Instagram-related beauty/grooming trends via Google News RSS proxy.

    Receives: config dict (reads instagram.rss_queries if present, else uses defaults)
    Returns: list[dict] with keys: title, source, url, engagement, query
    """
    # Get queries from config or use defaults
    instagram_config = config.get('instagram', {})
    queries = instagram_config.get('rss_queries', [
        "site:instagram.com mens grooming india",
        "site:instagram.com hair colour india",
        "site:instagram.com deodorant india",
        "site:instagram.com skincare routine india men",
        "site:instagram.com beauty trends india",
    ])

    logger.info(f"Fetching Instagram trends via RSS proxy ({len(queries)} queries)...")

    # Primary: RSS proxy
    results = _fetch_via_rss_proxy(queries)

    # Fallback: curated trends if RSS returns very little
    if len(results) < 3:
        logger.info("Instagram RSS proxy returned few results, adding curated fallback trends.")
        fallback_trends = [
            "Men's Grooming Routine India",
            "Beard Care Tips India",
            "Hair Colour Transformation",
            "Skincare for Indian Men",
            "Deodorant Comparison India",
        ]
        for ft in fallback_trends:
            results.append({
                "title": ft,
                "source": "instagram",
                "url": "",
                "engagement": 0,
                "query": "fallback",
            })

    # Deduplicate by title
    seen = set()
    unique = []
    for r in results:
        key = r['title'].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info(f"Instagram collector: {len(unique)} unique trends collected.")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)

    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}

    trends = get_instagram_trends(config)
    print(f"\nInstagram Trends: {len(trends)} collected\n")
    for t in trends[:10]:
        print(f"  [{t['source']}] {t['title'].encode('ascii', 'replace').decode()}")
