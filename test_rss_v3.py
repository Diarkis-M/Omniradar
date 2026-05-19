import feedparser
import requests

feeds = [
    "https://www.hindustantimes.com/feeds/rss/lifestyle/fashion-and-trends/rssfeed.xml",
    "https://www.news18.com/rss/lifestyle.xml",
    "https://www.dnaindia.com/feeds/lifestyle.xml"
]

headers = {'User-Agent': 'Mozilla/5.0'}

def test_feeds():
    for f in feeds:
        print(f"Testing {f}...")
        try:
            r = requests.get(f, headers=headers, timeout=10)
            d = feedparser.parse(r.content)
            print(f"  Entries: {len(d.entries)}")
            if len(d.entries) > 0:
                print(f"  Sample: {d.entries[0].title}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_feeds()
