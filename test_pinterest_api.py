import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
}

queries = ["skincare india", "makeup trends india", "hair care india"]

def test_pinterest_autocomplete():
    for q in queries:
        print(f"Testing Pinterest Autocomplete for '{q}'...")
        url = f"https://www.pinterest.com/resource/SearchAutocompleteResource/get/?source_url=/&data=%7B%22options%22%3A%7B%22q%22%3A%22{q.replace(' ', '%20')}%22%2C%22pin_count%22%3Atrue%7D%7D"
        try:
            r = requests.get(url, headers=headers, timeout=10)
            print(f"  Status: {r.status_code}")
            if r.status_code == 200:
                data = r.json()
                suggestions = data.get('resource_response', {}).get('data', [])
                print(f"  Suggestions: {[s for s in suggestions[:5]]}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_pinterest_autocomplete()
