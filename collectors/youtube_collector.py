"""
YouTube Trend Collector for TrendRadar.

Primary: YouTube Data API v3 — mostPopular endpoint (1 quota unit per call)
         Fetches trending videos in India, filters for GCPL relevance.
         Rotates across 3 API keys for longevity.

Fallback: Google News RSS proxy with site:youtube.com queries (no API key)

Quota budget: 2 calls per pipeline run x 3 runs/day = 6 units/day
              (daily limit per key: 10,000 units)
"""

import logging
import os
import random
import requests

logger = logging.getLogger(__name__)

# GCPL-relevant keywords for filtering trending videos
GCPL_KEYWORDS = [
    # Men's Grooming
    'grooming', 'beard', 'shaving', 'trimmer', 'face wash', 'aftershave',
    'men skin', 'men face', 'men routine',
    # Fragrances
    'perfume', 'fragrance', 'deodorant', 'deo', 'body spray', 'edp', 'attar',
    'cologne', 'scent',
    # Hair Care
    'hair colour', 'hair color', 'henna', 'mehendi', 'shampoo', 'hair care',
    'hair oil', 'hair dye', 'hair serum', 'dandruff', 'hair fall',
    # Skincare
    'skincare', 'skin care', 'sunscreen', 'moisturizer', 'serum', 'face mask',
    'acne', 'dark spots', 'vitamin c',
    # Soaps & Body
    'soap', 'body wash', 'shower gel', 'handwash', 'bath',
    # Home Insecticides
    'mosquito', 'insecticide', 'cockroach', 'repellent',
    # Air Fresheners
    'air freshener', 'room freshener', 'car freshener',
    # Brand names (own + top competitors)
    'park avenue', 'cinthol', 'godrej', 'hit spray', 'good knight',
    'wild stone', 'fogg', 'denver', 'beardo', 'ustraa', 'man company',
    'nivea', 'dove', 'garnier', 'loreal', "l'oreal", 'mamaearth',
    'minimalist', 'bella vita', 'durex', 'manforce',
    # General beauty/personal care
    'beauty', 'personal care', 'skincare routine', 'hair routine',
]


def _get_api_keys():
    """Return list of available YouTube API keys."""
    keys = [
        os.getenv('YOUTUBE_API_KEY_1', ''),
        os.getenv('YOUTUBE_API_KEY_2', ''),
        os.getenv('YOUTUBE_API_KEY_3', ''),
    ]
    return [k for k in keys if k]


def _is_gcpl_relevant(title, description=''):
    """Check if video title/description matches GCPL product categories."""
    text = (title + ' ' + description).lower()
    return any(kw in text for kw in GCPL_KEYWORDS)


def _infer_category(title, description=''):
    """Infer GCPL product category from video title/description."""
    text = (title + ' ' + description).lower()
    if any(kw in text for kw in ['grooming', 'beard', 'shaving', 'trimmer', 'men face', 'men skin']):
        return "Men's Grooming"
    if any(kw in text for kw in ['perfume', 'fragrance', 'deodorant', 'deo', 'body spray', 'edp', 'attar', 'cologne']):
        return "Fragrances & Deo"
    if any(kw in text for kw in ['hair colour', 'hair color', 'henna', 'mehendi', 'shampoo', 'hair care', 'hair oil', 'hair dye']):
        return "Hair Care"
    if any(kw in text for kw in ['skincare', 'skin care', 'face wash', 'sunscreen', 'moisturizer', 'serum', 'acne']):
        return "Skincare"
    if any(kw in text for kw in ['soap', 'body wash', 'shower gel', 'handwash', 'bath']):
        return "Soaps & Body"
    if any(kw in text for kw in ['mosquito', 'insecticide', 'cockroach', 'repellent']):
        return "Home Insecticides"
    if any(kw in text for kw in ['air freshener', 'room freshener', 'car freshener']):
        return "Air Fresheners"
    return "Beauty & Personal Care"


def _fetch_most_popular(api_key, category_id=None):
    """
    Fetch YouTube mostPopular videos for India.
    Cost: 1 quota unit per call (cheapest possible endpoint).
    """
    params = {
        'part': 'snippet,statistics',
        'chart': 'mostPopular',
        'regionCode': 'IN',
        'maxResults': 50,
        'key': api_key,
    }
    if category_id:
        params['videoCategoryId'] = str(category_id)

    try:
        r = requests.get(
            'https://www.googleapis.com/youtube/v3/videos',
            params=params,
            timeout=15,
        )
        if r.status_code == 403:
            logger.warning("YouTube API quota exceeded or key invalid (403)")
            return []
        if r.status_code != 200:
            logger.warning(f"YouTube API returned {r.status_code}: {r.text[:200]}")
            return []

        data = r.json()
        return data.get('items', [])

    except Exception as e:
        logger.warning(f"YouTube API request failed: {e}")
        return []


def get_youtube_trends(config):
    """
    Fetch YouTube trending videos relevant to GCPL product categories.

    Strategy (lowest cost):
    - Call 1: mostPopular in Howto & Style (category 26) — beauty/grooming core
    - Call 2: mostPopular general trending (no category) — catch viral beauty content
    - Client-side filter for GCPL keywords in title + description
    - Total: 2 API calls = 2 quota units per pipeline run

    Falls back to RSS proxy if no API keys or quota exhausted.

    Returns: list[dict] with title, source, url, channel, views, likes,
             comment_count, engagement, category, published
    """
    api_keys = _get_api_keys()
    if not api_keys:
        logger.warning("No YouTube API keys found in env. Falling back to RSS proxy.")
        return _fallback_rss(config)

    # Rotate keys: pick different keys for each call
    random.shuffle(api_keys)
    key_1 = api_keys[0]
    key_2 = api_keys[1 % len(api_keys)]

    results = []
    seen_ids = set()

    # Call 1: Howto & Style trending (category 26) — most relevant for GCPL
    logger.info("YouTube API: Fetching mostPopular — Howto & Style (IN)...")
    howto_items = _fetch_most_popular(key_1, category_id=26)

    # Call 2: General trending — catch viral beauty/grooming content
    logger.info("YouTube API: Fetching mostPopular — General trending (IN)...")
    general_items = _fetch_most_popular(key_2)

    # Process all items
    for item in howto_items + general_items:
        video_id = item.get('id', '')
        if video_id in seen_ids:
            continue
        seen_ids.add(video_id)

        snippet = item.get('snippet', {})
        stats = item.get('statistics', {})

        title = snippet.get('title', '')
        description = snippet.get('description', '')[:500]
        channel = snippet.get('channelTitle', '')
        published = snippet.get('publishedAt', '')

        views = int(stats.get('viewCount', 0))
        likes = int(stats.get('likeCount', 0))
        comment_count = int(stats.get('commentCount', 0))

        # Filter for GCPL relevance
        if not _is_gcpl_relevant(title, description):
            continue

        url = f"https://www.youtube.com/watch?v={video_id}"

        results.append({
            "title": title,
            "source": "youtube",
            "url": url,
            "channel": channel,
            "engagement": views,
            "views": views,
            "likes": likes,
            "comment_count": comment_count,
            "query": "",
            "category": _infer_category(title, description),
            "published": published,
        })

    # Sort by views (most popular first)
    results.sort(key=lambda x: x.get('views', 0), reverse=True)

    logger.info(f"YouTube API: {len(results)} GCPL-relevant trending videos "
                f"(from {len(howto_items)} Howto + {len(general_items)} General).")

    # If API returned nothing, fall back to RSS proxy
    if not results:
        logger.info("YouTube API returned no GCPL results, falling back to RSS proxy.")
        return _fallback_rss(config)

    return results


def _fallback_rss(config):
    """Fallback: Google News RSS proxy (no API key needed)."""
    import feedparser
    import time

    youtube_config = config.get('youtube', {})
    queries = youtube_config.get('search_queries', [
        "site:youtube.com men grooming routine india",
        "site:youtube.com best perfume men india",
        "site:youtube.com hair colour at home india",
        "site:youtube.com skincare routine india men",
        "site:youtube.com best soap india review",
        "site:youtube.com mosquito repellent india review",
    ])

    results = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
    }

    for query in queries[:6]:
        try:
            search_q = f"{query} when:7d"
            url = f"https://news.google.com/rss/search?q={search_q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code != 200:
                continue

            feed = feedparser.parse(r.content)
            for entry in feed.entries[:5]:
                raw_title = entry.get('title', '')
                parts = raw_title.rsplit(' - ', 1)
                title = parts[0].strip()
                channel = parts[1].strip() if len(parts) > 1 else ''

                if title:
                    results.append({
                        "title": title,
                        "source": "youtube",
                        "url": entry.get('link', ''),
                        "channel": channel,
                        "engagement": 0,
                        "views": 0,
                        "likes": 0,
                        "comment_count": 0,
                        "query": query.replace('site:youtube.com ', ''),
                        "category": _infer_category(title),
                    })

            time.sleep(random.uniform(0.5, 1.0))
        except Exception as e:
            logger.warning(f"YouTube RSS fallback failed for '{query}': {e}")

    # Deduplicate
    seen = set()
    unique = []
    for r in results:
        key = r['title'].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info(f"YouTube RSS fallback: {len(unique)} results.")
    return unique


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)

    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}

    trends = get_youtube_trends(config)
    print(f"\nYouTube Trends: {len(trends)} collected\n")
    for t in trends[:15]:
        views_str = f"{t.get('views', 0):,}" if t.get('views') else 'N/A'
        ch = f" [{t['channel']}]" if t.get('channel') else ''
        print(f"  [{t['category']}]{ch} {t['title'][:80]}")
        print(f"    Views: {views_str} | Likes: {t.get('likes', 0):,} | Comments: {t.get('comment_count', 0):,}")
        if t.get('url'):
            print(f"    -> {t['url']}")
