"""
Google Trends Collector for Omniradar.

Fetches GCPL-relevant search trends instead of general India trending topics.

Strategy:
  1. Fetch general trending RSS → filter through GCPL keywords
  2. Google News RSS searches for GCPL product categories (rising interest)
  3. PyTrends related queries for GCPL terms (supplementary, often rate-limited)
"""
import feedparser
import requests
import logging
import time
import random

logger = logging.getLogger(__name__)

# GCPL-relevant keywords for filtering general trends
GCPL_FILTER = [
    # Product types
    "face wash", "sunscreen", "moisturizer", "moisturiser", "serum", "cleanser",
    "soap", "handwash", "hand wash", "shower gel", "body wash", "shampoo",
    "conditioner", "hair colour", "hair color", "henna", "mehendi", "hair oil",
    "hair serum", "hair dye", "beard", "shaving", "aftershave", "trimmer",
    "grooming", "deodorant", "deo", "perfume", "fragrance", "body spray",
    "roll-on", "cologne", "attar", "eau de", "antiperspirant",
    "mosquito", "cockroach", "insecticide", "repellent", "pest",
    "air freshener", "room freshener", "car freshener",
    "condom", "lubricant",
    "skincare", "haircare", "personal care", "beauty", "cosmetic", "makeup",
    "lotion", "cream", "skin", "hair", "scalp", "acne", "dandruff",
    # Brands (own + competitor)
    "cinthol", "godrej", "park avenue", "nupur", "kamasutra",
    "hit", "good knight", "godrej aer", "muuchstac",
    "beardo", "ustraa", "man company", "man matters", "bombay shaving",
    "wild stone", "set wet", "denver", "fogg", "engage",
    "bella vita", "ajmal", "adil qadri", "afnan",
    "mamaearth", "minimalist", "deconstruct", "derma co", "mcaffeine",
    "neutrogena", "plum", "dot & key", "dove", "nivea", "santoor",
    "medimix", "pears", "loreal", "garnier", "streax", "indulekha",
    "mortein", "all out", "odonil", "ambi pur",
    "manforce", "durex", "skore",
    # Industry
    "fmcg", "d2c", "personal care market",
]


def _is_gcpl_relevant(text):
    """Check if a text matches any GCPL keyword."""
    t = text.lower()
    return any(kw in t for kw in GCPL_FILTER)


def _fetch_general_trends_filtered():
    """Fetch general Google Trends RSS and filter to GCPL-relevant only."""
    trends = []
    try:
        rss_url = "https://trends.google.com/trending/rss?geo=IN"
        feed = feedparser.parse(rss_url)
        if feed.entries:
            for entry in feed.entries:
                title = entry.title.strip()
                if _is_gcpl_relevant(title):
                    trends.append(title)
            logger.info(f"General trends RSS: {len(feed.entries)} total, {len(trends)} GCPL-relevant")
    except Exception as e:
        logger.warning(f"General trends RSS fetch failed: {e}")
    return trends


def _fetch_gcpl_news_trends(search_queries):
    """
    Search Google News RSS for GCPL product terms to find what's trending.
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
                if feed.entries:
                    logger.info(f"Google News '{query}': {len(feed.entries)} results")
            time.sleep(random.uniform(0.3, 0.8))
        except Exception as e:
            logger.warning(f"Google News search failed for '{query}': {e}")

    return trends


def _fetch_related_queries_pytrends(search_queries):
    """
    Use PyTrends to find rising related queries for GCPL terms.
    Often rate-limited — used as supplementary source.
    """
    trends = []
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='en-IN', tz=330, retries=2, backoff_factor=0.5)

        # Process in batches of 5 (pytrends limit)
        for i in range(0, min(len(search_queries), 15), 5):
            batch = search_queries[i:i+5]
            try:
                pytrends.build_payload(batch, timeframe='now 7-d', geo='IN')
                related = pytrends.related_queries()
                for q in batch:
                    if q in related:
                        rising = related[q].get('rising')
                        if rising is not None and not rising.empty:
                            for rq in rising['query'].tolist()[:3]:
                                if _is_gcpl_relevant(rq):
                                    trends.append(rq.strip().title())
                time.sleep(random.uniform(1.0, 2.0))
            except Exception as e:
                logger.warning(f"PyTrends batch failed: {e}")
                break  # Stop on rate limit

    except ImportError:
        logger.warning("pytrends not installed, skipping related queries")
    except Exception as e:
        logger.warning(f"PyTrends init failed: {e}")

    return trends


def get_google_trends(config=None):
    """
    Fetch GCPL-relevant Google search trends.

    Receives: config dict (optional, reads google.search_queries)
    Returns: list[str] of deduplicated GCPL-relevant trending search terms
    """
    # Get search queries from config
    search_queries = []
    if config and isinstance(config, dict):
        search_queries = config.get('google', {}).get('search_queries', [])

    if not search_queries:
        # Fallback defaults covering GCPL product portfolio
        search_queries = [
            "men face wash india", "beard oil india", "deodorant india",
            "perfume india", "hair colour india", "shampoo india",
            "soap india", "mosquito repellent india", "air freshener india",
            "sunscreen india", "moisturizer india", "handwash india",
            "Park Avenue perfume", "Cinthol soap", "Godrej Expert hair colour",
        ]

    trends = []

    # Layer 1: General trending RSS, filtered to GCPL-relevant
    trends.extend(_fetch_general_trends_filtered())

    # Layer 2: Google News searches for GCPL product terms
    trends.extend(_fetch_gcpl_news_trends(search_queries))

    # Layer 3: PyTrends related queries (supplementary)
    trends.extend(_fetch_related_queries_pytrends(search_queries[:15]))

    # Deduplicate
    seen = set()
    unique = []
    for t in trends:
        key = t.lower().strip()
        if key not in seen and len(key) > 3:
            seen.add(key)
            unique.append(t)

    logger.info(f"Google Trends collector: {len(unique)} GCPL-relevant trends")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)
    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}
    trends = get_google_trends(config)
    print(f"\nGoogle Trends: {len(trends)} collected")
    for t in trends[:20]:
        print(f"  {t}")
