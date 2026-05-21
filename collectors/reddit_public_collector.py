import json
import time
import random
import logging
import requests
import feedparser
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def _fetch_via_rss(clean_name, now):
    """
    Fetch posts via Reddit's public RSS feed.
    RSS feeds are served from a different pipeline and not blocked on cloud IPs.
    """
    posts = []
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
        }
        url = f"https://www.reddit.com/r/{clean_name}/hot.rss?limit=30"
        r = requests.get(url, headers=headers, timeout=15)

        if r.status_code != 200:
            logger.warning(f"RSS feed returned {r.status_code} for r/{clean_name}")
            return posts

        feed = feedparser.parse(r.content)
        for entry in feed.entries:
            title = entry.get('title', '').encode('utf-8', errors='ignore').decode('utf-8')
            link = entry.get('link', '')
            published = entry.get('published_parsed')

            if published:
                created_at = datetime.fromtimestamp(time.mktime(published), timezone.utc)
                age_hours = (now - created_at).total_seconds() / 3600
            else:
                age_hours = 12  # Assume recent if no timestamp

            if 0 < age_hours <= 24:
                # RSS doesn't give upvotes; use comment count as proxy
                summary = entry.get('summary', '')
                posts.append({
                    "title": title,
                    "score": 0,  # RSS doesn't expose scores
                    "num_comments": 0,
                    "subreddit": clean_name,
                    "velocity": 1.0 / max(age_hours, 0.1),
                    "url": link
                })

        logger.info(f"✅ RSS: {len(posts)} posts from r/{clean_name}")
    except Exception as e:
        logger.warning(f"RSS fetch failed for r/{clean_name}: {e}")

    return posts


def _fetch_via_json_api(clean_name, now):
    """
    Fetch posts via Reddit's public JSON API using requests (no Playwright needed).
    Lighter and faster than launching a headless browser per subreddit.
    Falls back gracefully if Reddit blocks the request.
    """
    posts = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendRadar/1.0; +https://omniradar.vercel.app)',
        'Accept': 'application/json',
    }

    endpoints = ['hot', 'top']
    for endpoint in endpoints:
        try:
            params = {'limit': 30, 'raw_json': 1}
            if endpoint == 'top':
                params['t'] = 'day'
            url = f"https://www.reddit.com/r/{clean_name}/{endpoint}.json"
            r = requests.get(url, headers=headers, params=params, timeout=15)

            if r.status_code == 429:
                logger.info(f"Reddit JSON rate-limited for r/{clean_name}/{endpoint}, skipping")
                time.sleep(2)
                continue
            if r.status_code != 200:
                continue

            data = r.json()
            children = data.get('data', {}).get('children', [])
            logger.info(f"✅ JSON API: {len(children)} posts from r/{clean_name} ({endpoint})")

            for post_data in children:
                post = post_data.get('data', {})
                created_utc = post.get('created_utc')
                if not created_utc:
                    continue
                created_at = datetime.fromtimestamp(created_utc, timezone.utc)
                age_hours = (now - created_at).total_seconds() / 3600
                if 0 < age_hours <= 48:
                    score = post.get('score', 0)
                    title = post.get('title', '').encode('utf-8', errors='ignore').decode('utf-8')
                    posts.append({
                        "title": title,
                        "score": score,
                        "num_comments": post.get('num_comments', 0),
                        "subreddit": clean_name,
                        "velocity": score / max(age_hours, 0.1),
                        "url": f"https://reddit.com{post.get('permalink')}"
                    })
        except (json.JSONDecodeError, ValueError):
            logger.info(f"Reddit JSON unavailable for r/{clean_name}/{endpoint} (HTML response), skipping")
        except Exception as e:
            logger.warning(f"JSON API failed for r/{clean_name} ({endpoint}): {e}")
        time.sleep(random.uniform(1.0, 2.0))

    return posts


def get_reddit_trends(subreddits):
    """
    Hybrid Reddit collector:
    - Tries Playwright (headless browser) first — works locally.
    - Falls back to RSS feeds — works on GitHub Actions cloud IPs.
    Both methods are combined to maximize data collection.
    """
    all_posts = []
    now = datetime.now(timezone.utc)

    for sub_name in subreddits:
        clean_name = sub_name.replace("r/", "") if sub_name.startswith("r/") else sub_name

        # Method 1: Try JSON API (lightweight, no browser needed)
        json_posts = _fetch_via_json_api(clean_name, now)
        all_posts.extend(json_posts)

        # Method 2: Always also fetch via RSS (works everywhere, as safety net)
        rss_posts = _fetch_via_rss(clean_name, now)
        all_posts.extend(rss_posts)

        time.sleep(random.uniform(0.5, 1.5))

    # Deduplicate by URL
    unique_posts = {p['url']: p for p in all_posts}.values()

    # Sort by score (Playwright posts with real scores first, then RSS by recency)
    results = sorted(list(unique_posts), key=lambda x: x['score'], reverse=True)
    logger.info(f"TOTAL UNIQUE REDDIT POSTS COLLECTED: {len(results)}")
    return results
