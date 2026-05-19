import feedparser
import requests

feeds = [
    "https://www.femina.in/beauty/rss",
    "https://indianexpress.com/section/lifestyle/beauty/feed/",
    "https://www.indiatvnews.com/rssnews/lifestyle/beauty.xml",
    "https://www.thehealthsite.com/beauty/feed/",
    "https://www.pinkvilla.com/beauty/feed"
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def test_feeds():
    for f in feeds:
        print(f"Testing {f}...")
        try:
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
