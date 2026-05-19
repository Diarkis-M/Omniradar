import os
import httpx
import urllib3
from google import genai
from google.genai import types

# -- SSL bypass --
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
_orig_httpx_client_init = httpx.Client.__init__
def _patched_httpx_client_init(self, *args, **kwargs):
    kwargs["verify"] = False
    _orig_httpx_client_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_client_init

def test():
    API_KEY = "AIzaSyCMNKUE9lR-f5rNNKbxHI9ri7EgQkQ4S1U"
    client = genai.Client(api_key=API_KEY)
    
    # Trying v1 compatible model name
    try:
        print("Testing gemini-1.5-flash...")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Say hello"
        )
        print(f"Success: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test()
