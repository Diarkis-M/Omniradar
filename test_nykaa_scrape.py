import requests
from bs4 import BeautifulSoup

url = "https://www.nykaa.com/tags/trending-now"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def test_nykaa():
    print(f"Testing Nykaa Trending Now...")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            # Look for product names or trend keywords
            # Nykaa uses a lot of JS, so we might need a specific selector
            products = soup.select('.css-11z79ar') # Example product name class
            print(f"  Products found: {len(products)}")
            for p in products[:5]:
                print(f"    - {p.text.strip()}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_nykaa()
