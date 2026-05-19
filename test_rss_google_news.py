import feedparser
import requests

feeds = [
    "https://news.google.com/rss/search?q=beauty+skin+makeup+india+when:24h&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=skincare+india+when:24h&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=makeup+trends+india+when:24h&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=hair+care+india+when:24h&hl=en-IN&gl=IN&ceid=IN:en"
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
