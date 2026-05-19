import requests
from bs4 import BeautifulSoup

def test_hashtags():
    url = "https://displaypurposes.com/hashtags/tag/beauty/india"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    print(f"Testing Hashtag Aggregator for India...")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {r.status_code}")
        # This site is heavily JS based, might need a different approach
        if "skincare" in r.text.lower():
            print("  Found beauty keywords in response!")
        else:
            print("  No beauty keywords found in raw text.")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_hashtags()
