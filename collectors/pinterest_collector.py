"""
Pinterest Trend Collector for Omniradar.

Fetches GCPL-relevant Pinterest visual trends covering full product portfolio:
men's grooming, fragrances, hair care, soaps, skincare, home care.

Strategy:
  1. Google News RSS proxy for GCPL product categories on Pinterest
  2. PyTrends related queries for Pinterest + GCPL terms (often rate-limited)
  3. Curated fallback trends covering GCPL portfolio
"""
import logging
import feedparser
import requests
import time
import random

logger = logging.getLogger(__name__)


def _fetch_via_rss_proxy(search_queries):
    """
    Search Google News RSS for Pinterest content related to GCPL categories.
    Returns list of trend title strings.
    """
    trends = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       'Chrome/121.0.0.0 Safari/537.36'
    }

    for query in search_queries:
        try:
            search_q = f"{query} when:14d"
            url = (f"https://news.google.com/rss/search?"
                   f"q={search_q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en")
            r = requests.get(url, headers=headers, timeout=12)
            if r.status_code == 200:
                feed = feedparser.parse(r.content)
                for entry in feed.entries[:3]:
                    title = entry.title.split(' - ')[0].strip()
                    if title and len(title) > 10:
                        trends.append(title)
                if feed.entries:
                    logger.info(f"Pinterest RSS '{query}': {len(feed.entries)} results")
            time.sleep(random.uniform(0.3, 0.8))
        except Exception as e:
            logger.warning(f"Pinterest RSS search failed for '{query}': {e}")

    return trends


def _fetch_related_pytrends(pytrends_queries):
    """Use PyTrends to find rising related Pinterest queries for GCPL terms."""
    trends = []
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='en-IN', tz=330, retries=2, backoff_factor=0.5)

        for i in range(0, min(len(pytrends_queries), 10), 5):
            batch = pytrends_queries[i:i+5]
            try:
                pytrends.build_payload(batch, cat=44, timeframe='now 7-d', geo='IN')
                related = pytrends.related_queries()
                for q in batch:
                    if q in related:
                        rising = related[q].get('rising')
                        if rising is not None and not rising.empty:
                            for rq in rising['query'].tolist()[:3]:
                                clean = rq.replace('pinterest', '').strip().title()
                                if clean and len(clean) > 3:
                                    trends.append(clean)
                time.sleep(random.uniform(1.0, 2.0))
            except Exception as e:
                logger.warning(f"PyTrends Pinterest batch failed: {e}")
                break

    except ImportError:
        logger.warning("pytrends not installed, skipping Pinterest related queries")
    except Exception as e:
        logger.warning(f"PyTrends init failed for Pinterest: {e}")

    return trends


def get_pinterest_trends(config):
    """
    Fetch GCPL-relevant Pinterest visual trends.

    Receives: config dict (reads pinterest.search_queries and pinterest.pytrends_queries)
    Returns: list[str] of deduplicated GCPL-relevant Pinterest trends
    """
    pinterest_config = config.get('pinterest', {}) if config else {}

    search_queries = pinterest_config.get('search_queries', [
        "site:pinterest.com men grooming india",
        "site:pinterest.com perfume fragrance india",
        "site:pinterest.com hair colour ideas india",
        "site:pinterest.com beard style india",
        "site:pinterest.com skincare routine men india",
        "site:pinterest.com soap body wash aesthetic",
        "site:pinterest.com room freshener home decor",
        "site:pinterest.com deodorant body spray",
    ])

    pytrends_queries = pinterest_config.get('pytrends_queries', [
        "pinterest men grooming",
        "pinterest hair colour",
        "pinterest perfume",
        "pinterest beard style",
        "pinterest skincare routine",
    ])

    trends = []

    # Layer 1: Google News RSS proxy for Pinterest content
    trends.extend(_fetch_via_rss_proxy(search_queries))

    # Layer 2: PyTrends related queries (supplementary)
    trends.extend(_fetch_related_pytrends(pytrends_queries))

    # Fallback: curated GCPL-relevant Pinterest trends
    if len(trends) < 5:
        logger.info("Pinterest returned few results, adding GCPL-relevant fallback trends.")
        fallback = [
            "Men's Beard Grooming Looks",
            "Hair Colour Transformation Ideas",
            "Perfume Collection Aesthetic",
            "Deodorant & Body Spray Picks",
            "Room Freshener Home Decor",
            "Skincare Routine for Men",
            "Soap & Body Wash Aesthetic",
            "Mosquito Repellent Natural",
        ]
        trends.extend(fallback)

    # Deduplicate
    seen = set()
    unique = []
    for t in trends:
        key = t.lower().strip()
        if key not in seen and len(key) > 3:
            seen.add(key)
            unique.append(t)

    logger.info(f"Pinterest collector: {len(unique)} GCPL-relevant trends")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)
    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}
    trends = get_pinterest_trends(config)
    print(f"\nPinterest Trends: {len(trends)} collected")
    for t in trends[:20]:
        print(f"  {t}")
