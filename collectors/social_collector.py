import requests
from bs4 import BeautifulSoup
import logging
import re
from pytrends.request import TrendReq

logger = logging.getLogger(__name__)


def _fetch_from_trends24():
    """
    Fetch trending hashtags from trends24.in (more reliable than getdaytrends.com).

    Receives: nothing
    Returns: list of trending topic strings
    """
    trends = []
    try:
        url = "https://trends24.in/india/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # trends24.in uses trend-card list items with anchor tags
            trend_links = soup.select('ol.trend-card__list li a')
            if trend_links:
                for el in trend_links:
                    topic = el.text.strip()
                    if topic:
                        trends.append(topic)
            else:
                # Fallback: try table format (when table tab is active)
                trend_rows = soup.select('table.the-table tbody tr td.topic a.trend-link')
                for el in trend_rows:
                    topic = el.text.strip()
                    if topic:
                        trends.append(topic)

            if trends:
                logger.info(f"Fetched {len(trends)} trends from trends24.in")
        else:
            logger.warning(f"trends24.in returned status {response.status_code}")

    except Exception as e:
        logger.warning(f"trends24.in fetch failed: {e}")

    return trends[:20]


def _fetch_from_getdaytrends():
    """
    Fetch trending hashtags from getdaytrends.com/india/ (original source, kept as fallback).

    Receives: nothing
    Returns: list of trending topic strings
    """
    trends = []
    try:
        url = "https://getdaytrends.com/india/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            trend_elements = soup.select('td.main a')
            all_hashtags = [el.text.strip() for el in trend_elements]
            trends.extend(all_hashtags[:10])
            if trends:
                logger.info(f"Fetched {len(trends)} hashtags from getdaytrends.com")
    except Exception as e:
        logger.warning(f"getdaytrends.com fetch failed: {e}")

    return trends


def get_social_trends(config):
    """
    Combined social trend fetcher with multi-layer fallback.

    Layer 1: trends24.in (primary — more reliable, richer data)
    Layer 2: getdaytrends.com (fallback — original source)
    Layer 3: Google Trends pytrends API (supplementary — prone to 429/404)

    Receives: config dict (currently unused but kept for collector pattern consistency)
    Returns: list[str] of deduplicated trending topics/hashtags
    """
    trends = []

    # 1. trends24.in (Primary — from Twitter/X Trending Hashtags reference)
    trends24_results = _fetch_from_trends24()
    trends.extend(trends24_results)

    # 2. getdaytrends.com (Fallback — original source, only if trends24 returned little)
    if len(trends) < 5:
        logger.info("trends24.in returned few results, trying getdaytrends.com fallback...")
        daytrends_results = _fetch_from_getdaytrends()
        trends.extend(daytrends_results)

    # 3. Google Trends (Supplementary — API prone to 429/404)
    try:
        pytrends = TrendReq(hl='en-IN', tz=330, retries=2, backoff_factor=0.1)
        trending_searches = pytrends.trending_searches(pn='india')
        if not trending_searches.empty:
            trends.extend(trending_searches[0].tolist()[:10])
            logger.info("Fetched top 10 trending searches from Google India.")
    except Exception as e:
        logger.warning(f"Google Trends API failed: {e}. Moving on.")

    return list(set(trends))
