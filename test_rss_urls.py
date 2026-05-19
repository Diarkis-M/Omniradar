import feedparser
import requests

feeds = [
    "https://www.bebeautiful.in/rss",
    "https://www.vogue.in/rss/beauty",
    "https://www.nykaa.com/beauty-blog/feed/",
    "https://elle.in/category/beauty/feed/",
    "https://www.cosmopolitan.in/beauty/rss"
]

headers = {'User-Agent': 'Mozilla/5.0'}

def test_feeds():
    for f in feeds:
        print(f"Testing {f}...")
        try:
            # Try with requests first to see if reachable
            r = requests.get(f, headers=headers, timeout=10)
            print(f"  Status: {r.status_code}")
            d = feedparser.parse(r.content)
            print(f"  Entries: {len(d.entries)}")
            if len(d.entries) > 0:
                print(f"  Sample: {d.entries[0].title}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_feeds()
