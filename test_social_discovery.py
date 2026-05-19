import feedparser
import requests

queries = [
    "site:twitter.com beauty india when:24h",
    "site:twitter.com skincare india when:24h",
    "site:pinterest.com makeup india when:24h"
]

def test_social_news():
    for q in queries:
        print(f"Testing Social Discovery via Google News for '{q}'...")
        url = f"https://news.google.com/rss/search?q={q.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
        try:
            r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            d = feedparser.parse(r.content)
            print(f"  Entries: {len(d.entries)}")
            for entry in d.entries[:3]:
                print(f"    - {entry.title}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_social_news()
