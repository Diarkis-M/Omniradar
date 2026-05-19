"""
Amazon.in Bestseller / Search Collector for TrendRadar.

Uses Playwright headless Chromium to scrape Amazon.in product listings.
Primary: Search URLs sorted by popularity (review-rank) — most reliable.
Fallback: Bestseller browse-node pages.

Follows the Playwright pattern from reddit_public_collector.py.
"""

import json
import time
import random
import logging
import re

logger = logging.getLogger(__name__)


def _extract_rating(text):
    """Extract numeric rating from text like '4.2 out of 5 stars'."""
    if not text:
        return 0.0
    match = re.search(r'([\d.]+)\s*out of\s*5', text)
    if match:
        return float(match.group(1))
    return 0.0


def _extract_review_count(text):
    """Extract review count from text like '32,344 ratings' or '32,344'."""
    if not text:
        return 0
    # Remove commas and find numbers
    cleaned = text.replace(',', '').replace('.', '')
    match = re.search(r'(\d+)', cleaned)
    if match:
        return int(match.group(1))
    return 0


def _extract_price(text):
    """Extract price string from text like '₹199' or '₹1,299'."""
    if not text:
        return ""
    match = re.search(r'[₹$][\d,]+', text)
    if match:
        return match.group(0)
    return text.strip()


def _scrape_amazon_search(page, url, category_name, max_products=20):
    """
    Scrape an Amazon.in search results page.

    Receives: Playwright page, URL string, category name string, max products int
    Returns: list of product dicts
    """
    products = []
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(random.uniform(3, 5))

        # Scroll to load lazy content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        time.sleep(1)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        # Amazon search results use div.s-result-item with data-component-type="s-search-result"
        items = page.query_selector_all('div[data-component-type="s-search-result"]')

        if not items:
            # Fallback: try the older selector
            items = page.query_selector_all('div.s-result-item[data-asin]')

        logger.info(f"Amazon search: found {len(items)} items for {category_name}")

        for i, item in enumerate(items[:max_products]):
            try:
                # Skip sponsored/ad items
                sponsored = item.query_selector('span.puis-label-popover-default')
                if sponsored and 'sponsored' in (sponsored.text_content() or '').lower():
                    continue

                # Product name
                name_el = item.query_selector('h2 a span') or item.query_selector('h2 span')
                name = name_el.text_content().strip() if name_el else ""
                if not name:
                    continue

                # Product URL
                link_el = item.query_selector('h2 a')
                href = link_el.get_attribute('href') if link_el else ""
                product_url = f"https://www.amazon.in{href}" if href and href.startswith('/') else href

                # Price
                price_el = item.query_selector('span.a-price span.a-offscreen') or item.query_selector('span.a-price-whole')
                price = _extract_price(price_el.text_content() if price_el else "")

                # Rating
                rating_el = item.query_selector('span.a-icon-alt') or item.query_selector('i.a-icon-star-small span')
                rating = _extract_rating(rating_el.text_content() if rating_el else "")

                # Review count
                review_el = item.query_selector('span.a-size-base.s-underline-text') or item.query_selector('a span.a-size-base')
                review_count = _extract_review_count(review_el.text_content() if review_el else "")

                # Brand (try to extract from name or dedicated element)
                brand_el = item.query_selector('span.a-size-base-plus.a-color-base')
                brand = brand_el.text_content().strip() if brand_el else ""
                if not brand:
                    # Try to get brand from first word(s) of product name
                    brand = name.split()[0] if name else ""

                products.append({
                    "title": name,
                    "price": price,
                    "rating": rating,
                    "review_count": review_count,
                    "rank": i + 1,
                    "brand": brand,
                    "category": category_name,
                    "url": product_url,
                    "source": "amazon",
                })

            except Exception as e:
                logger.warning(f"Amazon: error parsing item {i} in {category_name}: {e}")
                continue

    except Exception as e:
        logger.error(f"Amazon search scrape failed for {category_name}: {e}")

    return products


def _scrape_amazon_bestsellers(page, url, category_name, max_products=20):
    """
    Scrape an Amazon.in Bestsellers page (browse-node URL).

    Receives: Playwright page, URL string, category name, max products int
    Returns: list of product dicts
    """
    products = []
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(random.uniform(3, 5))

        # Scroll to load content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        time.sleep(1)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        # Bestseller items use #gridItemRoot
        items = page.query_selector_all('#gridItemRoot')
        if not items:
            items = page.query_selector_all('div.zg-grid-general-faceout')

        logger.info(f"Amazon bestsellers: found {len(items)} items for {category_name}")

        for i, item in enumerate(items[:max_products]):
            try:
                # Product name
                name_el = item.query_selector("a.a-link-normal[role='link'] span") or item.query_selector("a.a-link-normal span")
                name = name_el.text_content().strip() if name_el else ""
                if not name:
                    continue

                # Product URL
                link_el = item.query_selector("a.a-link-normal")
                href = link_el.get_attribute('href') if link_el else ""
                product_url = f"https://www.amazon.in{href}" if href and href.startswith('/') else href

                # Price
                price_el = item.query_selector("span.a-color-price") or item.query_selector("span._cDEzb_p13n-sc-price_3mJ9Z")
                price = _extract_price(price_el.text_content() if price_el else "")

                # Rating
                rating_el = item.query_selector("i.a-icon-star-small span.a-icon-alt") or item.query_selector("span.a-icon-alt")
                rating = _extract_rating(rating_el.text_content() if rating_el else "")

                # Review count
                review_el = item.query_selector("span.a-size-small") or item.query_selector("i.a-icon-star-small + span")
                review_count = _extract_review_count(review_el.text_content() if review_el else "")

                # Brand
                brand = name.split()[0] if name else ""

                products.append({
                    "title": name,
                    "price": price,
                    "rating": rating,
                    "review_count": review_count,
                    "rank": i + 1,
                    "brand": brand,
                    "category": category_name,
                    "url": product_url,
                    "source": "amazon",
                })

            except Exception as e:
                logger.warning(f"Amazon: error parsing bestseller item {i} in {category_name}: {e}")
                continue

    except Exception as e:
        logger.error(f"Amazon bestsellers scrape failed for {category_name}: {e}")

    return products


def get_amazon_trends(config):
    """
    Scrape Amazon.in for trending/bestselling beauty and grooming products.

    Receives: config dict (reads ecommerce.amazon config if present)
    Returns: list[dict] with keys: title, price, rating, review_count, rank, brand, category, url, source
    """
    all_products = []

    # Get config or use defaults
    ecommerce = config.get('ecommerce', {})
    amazon_config = ecommerce.get('amazon', {})

    if not amazon_config.get('enabled', True):
        logger.info("Amazon collector is disabled in config.")
        return []

    max_per_category = amazon_config.get('max_products_per_category', 20)

    # Categories from config or defaults
    categories = amazon_config.get('categories', [])
    if not categories:
        # Default categories using verified search URLs (most reliable)
        categories = [
            {"name": "Men's Face Wash", "url": "https://www.amazon.in/s?k=mens+face+wash&s=review-rank"},
            {"name": "Men's Deodorant", "url": "https://www.amazon.in/s?k=mens+deodorant&s=review-rank"},
            {"name": "Bar Soaps", "url": "https://www.amazon.in/s?k=bath+soap+bar&i=beauty&s=review-rank"},
            {"name": "Hair Colour", "url": "https://www.amazon.in/s?k=hair+colour+dye+permanent&i=beauty&s=review-rank"},
            {"name": "Men's Shampoo", "url": "https://www.amazon.in/s?k=men+shampoo&s=review-rank"},
            {"name": "Shower Gel", "url": "https://www.amazon.in/s?k=shower+gel+body+wash&i=beauty&s=review-rank"},
            {"name": "Beard Oil", "url": "https://www.amazon.in/s?k=beard+oil&rh=n%3A1374994031&s=review-rank"},
            {"name": "Shaving", "url": "https://www.amazon.in/s?k=men+shaving+cream+foam+aftershave&s=review-rank"},
        ]

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        logger.error("Playwright not installed. Amazon collector requires Playwright.")
        return []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--start-maximized'])
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 800},
                locale='en-IN',
                timezone_id='Asia/Kolkata',
            )
            page = context.new_page()

            # Block heavy resources for speed
            page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,ico}", lambda route: route.abort())

            for cat in categories:
                cat_name = cat.get('name', 'Unknown')
                cat_url = cat.get('url', '')

                if not cat_url:
                    continue

                logger.info(f"Amazon: scraping {cat_name}...")

                # Determine if it's a search URL or bestseller URL
                if '/s?' in cat_url or '/s/' in cat_url:
                    products = _scrape_amazon_search(page, cat_url, cat_name, max_per_category)
                elif '/gp/bestsellers/' in cat_url:
                    products = _scrape_amazon_bestsellers(page, cat_url, cat_name, max_per_category)
                else:
                    # Treat as search by default
                    products = _scrape_amazon_search(page, cat_url, cat_name, max_per_category)

                all_products.extend(products)

                # Rate limiting between categories
                time.sleep(random.uniform(2, 4))

            browser.close()

    except Exception as e:
        logger.error(f"Amazon Playwright error: {e}")

    logger.info(f"Amazon collector: {len(all_products)} total products collected.")
    return all_products


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)

    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}

    products = get_amazon_trends(config)
    print(f"\nAmazon Products: {len(products)} collected\n")
    for p in products[:10]:
        print(f"  #{p['rank']} [{p['category']}] {p['title'][:70]}... | {p['price']} | {p['rating']}* | {p['review_count']} reviews")
