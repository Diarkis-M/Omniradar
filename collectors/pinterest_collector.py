import logging
import feedparser
import requests
from pytrends.request import TrendReq

logger = logging.getLogger(__name__)

def get_pinterest_trends(config):
    """
    Pinterest Trends Proxy:
    Uses Google Trends or Google News RSS as fallback.
    """
    trends = []
    
    # Method 1: PyTrends (Prone to 429)
    try:
        pytrends = TrendReq(hl='en-IN', tz=330)
        inspo_queries = ["pinterest makeup look", "pinterest hair style"]
        pytrends.build_payload(inspo_queries, cat=44, timeframe='now 1-d', geo='IN')
        related = pytrends.related_queries()
        
        for q in inspo_queries:
            if q in related:
                rising = related[q].get('rising')
                if rising is not None and not rising.empty:
                    raw_trends = rising['query'].tolist()
                    for rt in raw_trends:
                        clean_trend = rt.replace('pinterest', '').strip().title()
                        if clean_trend: trends.append(clean_trend)
    except Exception as e:
        logger.warning(f"PyTrends failed for Pinterest: {e}. Falling back to RSS Discovery.")

    # Method 2: Google News RSS Discovery (More stable)
    if not trends:
        try:
            search_query = "site:pinterest.com beauty looks india when:24h"
            url = f"https://news.google.com/rss/search?q={search_query.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
            r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            d = feedparser.parse(r.content)
            for entry in d.entries[:5]:
                # Extract clean title before the site name
                title = entry.title.split('-')[0].strip()
                trends.append(title)
        except Exception as e:
            logger.error(f"RSS fallback failed for Pinterest: {e}")

    # Final Fallback: Curated Aesthetic Themes
    if not trends:
        trends = ["90s Blowout Hair", "Monochromatic Peach Makeup", "Scalp Slugging", "Glazed Skin"]

    return list(set(trends))
