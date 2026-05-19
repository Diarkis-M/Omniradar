"""
Social / Twitter Trend Collector for Omniradar.

Fetches GCPL-relevant social media trends instead of general India trending topics.

Strategy:
  1. Fetch trending topics from trends24.in / getdaytrends.com → FILTER through GCPL keywords
  2. Google News RSS searches for GCPL brands/products on social media
  3. Supplementary: Google Trends for social buzz on GCPL terms
"""
import requests
from bs4 import BeautifulSoup
import feedparser
import logging
import time
import random
from collectors.keyword_loader import get_product_keywords, get_brand_keywords, get_social_trend_keywords

logger = logging.getLogger(__name__)

# Default GCPL filter keywords loaded from omniradar_keywords.json
# Uses all product + brand + social_trend keywords for filtering social trends
# (Can still be overridden by config.social.gcpl_filter_keywords at runtime)
DEFAULT_FILTER = get_product_keywords() + get_brand_keywords() + get_social_trend_keywords()


def _is_gcpl_relevant(text, filter_keywords):
    """Check if text matches any GCPL keyword."""
    t = text.lower()
    return any(kw.lower() in t for kw in filter_keywords)


def _fetch_from_trends24_filtered(filter_keywords):
    """Fetch trending topics from trends24.in, return only GCPL-relevant ones."""
    trends = []
    try:
        url = "https://trends24.in/india/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                           '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            trend_links = soup.select('ol.trend-card__list li a')
            if not trend_links:
                trend_links = soup.select('table.the-table tbody tr td.topic a.trend-link')

            all_topics = [el.text.strip() for el in trend_links if el.text.strip()]
            trends = [t for t in all_topics if _is_gcpl_relevant(t, filter_keywords)]
            logger.info(f"trends24.in: {len(all_topics)} total, {len(trends)} GCPL-relevant")
        else:
            logger.warning(f"trends24.in returned status {response.status_code}")
    except Exception as e:
        logger.warning(f"trends24.in fetch failed: {e}")
    return trends


def _fetch_from_getdaytrends_filtered(filter_keywords):
    """Fetch trending topics from getdaytrends.com, return only GCPL-relevant ones."""
    trends = []
    try:
        url = "https://getdaytrends.com/india/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                           'Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            trend_elements = soup.select('td.main a')
            all_topics = [el.text.strip() for el in trend_elements if el.text.strip()]
            trends = [t for t in all_topics if _is_gcpl_relevant(t, filter_keywords)]
            logger.info(f"getdaytrends.com: {len(all_topics)} total, {len(trends)} GCPL-relevant")
    except Exception as e:
        logger.warning(f"getdaytrends.com fetch failed: {e}")
    return trends


def _fetch_gcpl_social_news(search_queries):
    """
    Search Google News RSS for GCPL brands/products in social media context.
    Returns list of trending topic strings.
    """
    trends = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       'Chrome/121.0.0.0 Safari/537.36'
    }

    for query in search_queries:
        try:
            search_q = f"{query} when:7d"
            url = (f"https://news.google.com/rss/search?"
                   f"q={search_q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en")
            r = requests.get(url, headers=headers, timeout=12)
            if r.status_code == 200:
                feed = feedparser.parse(r.content)
                for entry in feed.entries[:3]:
                    title = entry.title.split(' - ')[0].strip()
                    if title and len(title) > 10:
                        trends.append(title)
            time.sleep(random.uniform(0.3, 0.8))
        except Exception as e:
            logger.warning(f"Social news search failed for '{query}': {e}")

    return trends


def get_social_trends(config):
    """
    Fetch GCPL-relevant social/Twitter trends.

    Receives: config dict (reads social.gcpl_filter_keywords and social.search_queries)
    Returns: list[str] of deduplicated GCPL-relevant trending social topics
    """
    social_config = config.get('social', {}) if config else {}
    filter_keywords = social_config.get('gcpl_filter_keywords', DEFAULT_FILTER)
    search_queries = social_config.get('search_queries', [
        "GCPL Godrej Consumer Products",
        "men grooming trend India",
        "deodorant trend India",
        "FMCG India personal care",
    ])

    trends = []

    # Layer 1: trends24.in filtered
    trends.extend(_fetch_from_trends24_filtered(filter_keywords))

    # Layer 2: getdaytrends.com filtered (only if trends24 returned few)
    if len(trends) < 5:
        logger.info("trends24 returned few GCPL results, trying getdaytrends fallback...")
        trends.extend(_fetch_from_getdaytrends_filtered(filter_keywords))

    # Layer 3: Google News RSS for GCPL social media discussions
    trends.extend(_fetch_gcpl_social_news(search_queries))

    # Deduplicate
    seen = set()
    unique = []
    for t in trends:
        key = t.lower().strip()
        if key not in seen and len(key) > 3:
            seen.add(key)
            unique.append(t)

    logger.info(f"Social collector: {len(unique)} GCPL-relevant social trends")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)
    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}
    trends = get_social_trends(config)
    print(f"\nSocial Trends: {len(trends)} collected")
    for t in trends[:20]:
        print(f"  {t}")
