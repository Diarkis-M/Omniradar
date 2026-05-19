import asyncio
import yaml
import json
import os
from collectors.google_trends import get_google_trends
from collectors.reddit_public_collector import get_reddit_trends
from collectors.rss_collector import get_rss_trends
from collectors.social_collector import get_social_trends
from collectors.pinterest_collector import get_pinterest_trends

async def debug_raw():
    print("--- FETCHING RAW DATA FROM ALL SOURCES ---")
    
    with open('config.yaml') as f:
        config = yaml.safe_load(f)
    
    cats = config.get('categories', [])
    subs = []
    rss_feeds = []
    for c in cats:
        subs.extend(c.get('subreddits', []))
        rss_feeds.extend(c.get('rss', []))
    
    # Remove duplicates
    subs = list(set(subs))
    rss_feeds = list(set(rss_feeds))

    print(f"Targeting {len(subs)} Subreddits and {len(rss_feeds)} RSS Feeds...")

    results = await asyncio.gather(
        asyncio.to_thread(get_google_trends),
        asyncio.to_thread(get_reddit_trends, subs),
        asyncio.to_thread(get_rss_trends, rss_feeds),
        asyncio.to_thread(get_social_trends, config),
        asyncio.to_thread(get_pinterest_trends, config)
    )

    google, reddit, rss, social, pinterest = results

    output = {
        "GOOGLE_TRENDS_RAW": google[:5],
        "REDDIT_SAMPLES": [{"title": p['title'], "sub": p['subreddit']} for p in reddit[:30]],
        "RSS_HEADLINES": [r['title'] for r in rss[:10]] if rss else "No RSS data found",
        "SOCIAL_HASHTAGS": social[:20],
        "PINTEREST_TRENDS": pinterest
    }

    print(json.dumps(output, indent=2))
    print(f"\n--- TOTALS ---")
    print(f"Google: {len(google)}")
    print(f"Reddit: {len(reddit)}")
    print(f"RSS: {len(rss)}")
    print(f"Social: {len(social)}")
    print(f"Pinterest: {len(pinterest)}")

if __name__ == "__main__":
    asyncio.run(debug_raw())
