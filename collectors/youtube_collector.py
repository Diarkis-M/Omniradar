"""
YouTube Trend Collector for TrendRadar.

Primary: Google News RSS proxy with site:youtube.com queries
         Captures trending YouTube videos, reviews, and creator content
         around GCPL product categories (grooming, fragrances, hair care, etc.)

Fallback: YouTube search URL generation for GCPL-relevant topics

No API key required — uses the same battle-tested RSS proxy approach
as instagram_collector.py and pinterest_collector.py.
"""

import logging
import feedparser
import requests
import time
import random
import re

logger = logging.getLogger(__name__)


def _fetch_via_rss_proxy(queries):
    """
    Search Google News RSS for YouTube beauty/grooming content.

    Receives: list of search query strings (should include 'site:youtube.com')
    Returns: list of dicts with title, source, url, engagement, query, channel
    """
    results = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
    }

    for query in queries:
        try:
            search_q = f"{query} when:7d"
            url = f"https://news.google.com/rss/search?q={search_q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
            r = requests.get(url, headers=headers, timeout=15)

            if r.status_code != 200:
                logger.warning(f"YouTube RSS proxy returned {r.status_code} for query: {query}")
                continue

            feed = feedparser.parse(r.content)
            for entry in feed.entries[:8]:
                raw_title = entry.get('title', '')
                # Google News titles often have " - Channel Name" suffix
                parts = raw_title.rsplit(' - ', 1)
                title = parts[0].strip()
                channel = parts[1].strip() if len(parts) > 1 else ''
                link = entry.get('link', '')

                if title:
                    results.append({
                        "title": title,
                        "source": "youtube",
                        "url": link,
                        "channel": channel,
                        "engagement": 0,
                        "query": query.replace('site:youtube.com ', ''),
                        "category": _infer_category(query),
                    })

            logger.info(f"YouTube RSS proxy: {len(feed.entries)} entries for '{query}'")

        except Exception as e:
            logger.warning(f"YouTube RSS proxy failed for '{query}': {e}")

        time.sleep(random.uniform(0.5, 1.5))

    return results


def _infer_category(query):
    """Infer GCPL product category from the search query."""
    q = query.lower()
    if any(kw in q for kw in ['grooming', 'beard', 'shaving', 'trimmer']):
        return "Men's Grooming"
    if any(kw in q for kw in ['perfume', 'fragrance', 'deodorant', 'deo', 'body spray', 'edp', 'attar']):
        return "Fragrances & Deo"
    if any(kw in q for kw in ['hair colour', 'hair color', 'henna', 'mehendi', 'shampoo', 'hair care', 'hair oil']):
        return "Hair Care"
    if any(kw in q for kw in ['face wash', 'sunscreen', 'moisturizer', 'skincare', 'skin care', 'serum']):
        return "Skincare"
    if any(kw in q for kw in ['soap', 'body wash', 'shower gel', 'handwash', 'bath']):
        return "Soaps & Body"
    if any(kw in q for kw in ['mosquito', 'insecticide', 'cockroach', 'repellent']):
        return "Home Insecticides"
    if any(kw in q for kw in ['air freshener', 'room freshener', 'car freshener']):
        return "Air Fresheners"
    if any(kw in q for kw in ['condom', 'sexual']):
        return "Sexual Wellness"
    return "Beauty & Personal Care"


def get_youtube_trends(config):
    """
    Fetch YouTube beauty/grooming trends via Google News RSS proxy.

    Receives: config dict (reads youtube.search_queries if present)
    Returns: list[dict] with keys: title, source, url, channel, engagement, query, category
    """
    youtube_config = config.get('youtube', {})
    queries = youtube_config.get('search_queries', [
        # Men's Grooming
        "site:youtube.com men grooming routine india",
        "site:youtube.com beard care tips india",
        "site:youtube.com men face wash review india",
        "site:youtube.com best trimmer india",
        # Fragrances
        "site:youtube.com best perfume men india",
        "site:youtube.com deodorant comparison india",
        "site:youtube.com perfume collection india budget",
        "site:youtube.com Park Avenue Wild Stone Denver",
        # Hair Care
        "site:youtube.com hair colour at home india",
        "site:youtube.com best shampoo india",
        "site:youtube.com henna hair colour natural",
        # Skincare
        "site:youtube.com skincare routine india men",
        "site:youtube.com best sunscreen india",
        "site:youtube.com face wash review india",
        # Soaps & Body
        "site:youtube.com best soap india review",
        "site:youtube.com shower gel vs soap india",
        # Home Care
        "site:youtube.com mosquito repellent india review",
        "site:youtube.com air freshener review india",
    ])

    logger.info(f"Fetching YouTube trends via RSS proxy ({len(queries)} queries)...")

    # Primary: RSS proxy
    results = _fetch_via_rss_proxy(queries)

    # Fallback: generate YouTube search URLs for key topics
    if len(results) < 5:
        logger.info("YouTube RSS proxy returned few results, adding search URL fallbacks.")
        fallback_topics = [
            ("Best Men's Face Wash India 2025", "Skincare", "men face wash india"),
            ("Perfume Under 500 India", "Fragrances & Deo", "perfume under 500 india"),
            ("Beard Growth Tips India", "Men's Grooming", "beard growth tips"),
            ("Hair Colour At Home Tutorial", "Hair Care", "hair colour at home"),
            ("Best Deodorant For Men India", "Fragrances & Deo", "best deodorant men india"),
            ("Mosquito Repellent Comparison India", "Home Insecticides", "mosquito repellent review"),
            ("Room Freshener DIY India", "Air Fresheners", "room freshener india"),
            ("Best Soap For Dry Skin India", "Soaps & Body", "best soap dry skin india"),
            ("Men Skincare Routine India Budget", "Skincare", "men skincare routine india"),
        ]
        for title, cat, search in fallback_topics:
            yt_url = f"https://www.youtube.com/results?search_query={search.replace(' ', '+')}"
            results.append({
                "title": title,
                "source": "youtube",
                "url": yt_url,
                "channel": "",
                "engagement": 0,
                "query": search,
                "category": cat,
            })

    # Deduplicate by title
    seen = set()
    unique = []
    for r in results:
        key = r['title'].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info(f"YouTube collector: {len(unique)} unique trends collected.")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)

    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}

    trends = get_youtube_trends(config)
    print(f"\nYouTube Trends: {len(trends)} collected\n")
    for t in trends[:15]:
        ch = f" [{t['channel']}]" if t.get('channel') else ''
        print(f"  [{t['category']}]{ch} {t['title'][:80]}")
        if t.get('url'):
            print(f"    -> {t['url'][:80]}")
