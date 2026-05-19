"""
Flipkart.com Product Trend Collector for TrendRadar.

Uses Playwright headless Chromium to scrape Flipkart product listings.
Uses verified SID-based category URLs sorted by popularity.

Follows the Playwright pattern from reddit_public_collector.py.
"""

import time
import random
import logging
import re

logger = logging.getLogger(__name__)


def _extract_rating(text):
    """Extract numeric rating from Flipkart rating text like '4.2' or '4.2 ★'."""
    if not text:
        return 0.0
    match = re.search(r'([\d.]+)', text)
    if match:
        try:
            val = float(match.group(1))
            return val if val <= 5.0 else 0.0
        except ValueError:
            return 0.0
    return 0.0


def _extract_review_count(text):
    """Extract review/rating count from text like '32,344 Ratings & 1,234 Reviews' or '(15,200)'."""
    if not text:
        return 0
    cleaned = text.replace(',', '')
    # Try to find "X Ratings" pattern first
    match = re.search(r'([\d]+)\s*Ratings', cleaned, re.IGNORECASE)
    if match:
        return int(match.group(1))
    # Try "X Reviews"
    match = re.search(r'([\d]+)\s*Reviews', cleaned, re.IGNORECASE)
    if match:
        return int(match.group(1))
    # Just find any number
    match = re.search(r'(\d+)', cleaned)
    if match:
        return int(match.group(1))
    return 0


def _extract_price(text):
    """Extract price from text like '₹199' or '₹1,299'."""
    if not text:
        return ""
    match = re.search(r'[₹$]?\s*([\d,]+)', text)
    if match:
        return f"₹{match.group(1)}"
    return text.strip()


def _scrape_flipkart_category(page, url, category_name, max_products=20):
    """
    Scrape a Flipkart category/search page.

    Receives: Playwright page, URL string, category name, max products int
    Returns: list of product dicts
    """
    products = []
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(random.uniform(3, 5))

        # Close login popup if it appears
        try:
            close_btn = page.query_selector('button._2KpZ6l._2doB4z') or page.query_selector('button[class*="close"]')
            if close_btn:
                close_btn.click()
                time.sleep(0.5)
        except Exception:
            pass

        # Scroll to load content
        for _ in range(3):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)

        # Flipkart product card selectors (multiple fallbacks)
        card_selectors = [
            'div[data-id]',          # Primary: product cards with data-id
            'div.cPHDOP',            # Common product card class
            'div._1AtVbE',           # Older product card class
            'a.CGtC98',              # Product link cards
            'div.tUxRFH',            # Another variant
            'div._4ddWXP',           # Grid product cards
        ]

        items = []
        for sel in card_selectors:
            items = page.query_selector_all(sel)
            if items and len(items) > 2:
                logger.info(f"Flipkart: found {len(items)} items via '{sel}' for {category_name}")
                break

        if not items:
            logger.warning(f"Flipkart: no products found for {category_name} at {url}")
            return products

        for i, item in enumerate(items[:max_products]):
            try:
                # Product name — multiple selector fallbacks
                name = ""
                for name_sel in ['.KzDlHZ', '.RG5Slk', '._4rR01T', 'a.wjcEIp', 'a.IRpwTa', 'img[alt]']:
                    name_el = item.query_selector(name_sel)
                    if name_el:
                        if name_sel == 'img[alt]':
                            name = name_el.get_attribute('alt') or ""
                        else:
                            name = name_el.text_content() or ""
                        name = name.strip()
                        if name and len(name) > 3:
                            break

                if not name:
                    continue

                # Product URL
                href = ""
                for link_sel in ['a.CGtC98', 'a.IRpwTa', 'a.wjcEIp', 'a[href*="/p/"]', 'a']:
                    link_el = item.query_selector(link_sel)
                    if link_el:
                        href = link_el.get_attribute('href') or ""
                        if href and '/p/' in href:
                            break
                product_url = f"https://www.flipkart.com{href}" if href and href.startswith('/') else href

                # Price — multiple fallbacks
                price = ""
                for price_sel in ['.Nx9bqj', '.hZ3P6w', '._30jeq', 'div[class*="price"] div']:
                    price_el = item.query_selector(price_sel)
                    if price_el:
                        price_text = price_el.text_content() or ""
                        if '₹' in price_text or any(c.isdigit() for c in price_text):
                            price = _extract_price(price_text)
                            if price:
                                break

                # Rating
                rating = 0.0
                for rating_sel in ['.XQDdHH', '.Xm_DCC', '._3LWZlK', 'div[class*="rating"] span']:
                    rating_el = item.query_selector(rating_sel)
                    if rating_el:
                        rating = _extract_rating(rating_el.text_content())
                        if rating > 0:
                            break

                # Review count
                review_count = 0
                for rev_sel in ['.Wphh3N', '.PvbNMB', '._2_R_oP', 'span[class*="rating"]']:
                    rev_el = item.query_selector(rev_sel)
                    if rev_el:
                        review_count = _extract_review_count(rev_el.text_content())
                        if review_count > 0:
                            break

                # Brand — extract from name
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
                    "source": "flipkart",
                })

            except Exception as e:
                logger.warning(f"Flipkart: error parsing item {i} in {category_name}: {e}")
                continue

    except Exception as e:
        logger.error(f"Flipkart scrape failed for {category_name}: {e}")

    return products


def get_flipkart_trends(config):
    """
    Scrape Flipkart.com for trending/bestselling beauty and grooming products.

    Receives: config dict (reads ecommerce.flipkart config if present)
    Returns: list[dict] with keys: title, price, rating, review_count, rank, brand, category, url, source
    """
    all_products = []

    ecommerce = config.get('ecommerce', {})
    flipkart_config = ecommerce.get('flipkart', {})

    if not flipkart_config.get('enabled', True):
        logger.info("Flipkart collector is disabled in config.")
        return []

    max_per_category = flipkart_config.get('max_products_per_category', 20)

    categories = flipkart_config.get('categories', [])
    if not categories:
        # Default categories using verified Flipkart SID-based URLs
        categories = [
            {"name": "Face Wash", "url": "https://www.flipkart.com/beauty-and-grooming/body-face-skin-care/body-and-face-care/face-wash/pr?sid=g9b%2Cema%2C5la%2Cjav&sort=popularity"},
            {"name": "Men's Deodorant", "url": "https://www.flipkart.com/all/beauty-and-grooming/fragrances/deodorants/pr?sid=all%2Cg9b%2C0yh%2Cvp1&sort=popularity"},
            {"name": "Bar Soaps", "url": "https://www.flipkart.com/beauty-and-grooming/bath-shower/bath-essentials/bath-soap/pr?sid=g9b%2C5nz%2Cb1b%2Cyug&sort=popularity"},
            {"name": "Shampoo", "url": "https://www.flipkart.com/beauty-and-grooming/hair-care-and-accessory/hair-care/shampoo/pr?sid=g9b%2Clcf%2Cqqm%2Ct36&sort=popularity"},
            {"name": "Hair Colour", "url": "https://www.flipkart.com/beauty-and-grooming/hair-care-and-accessory/hair-care/hair-color/pr?sid=g9b%2Clcf%2Cqqm%2C55t&sort=popularity"},
            {"name": "Beard Oil", "url": "https://www.flipkart.com/beauty-and-grooming/shaving-beard-care/beard-oil/pr?sid=g9b%2Ctiz%2Ccnj&sort=popularity"},
            {"name": "Shower Gel", "url": "https://www.flipkart.com/beauty-and-grooming/bath-shower/bath-essentials/body-wash/pr?sid=g9b%2C5nz%2Cb1b%2Cbwa&sort=popularity"},
            {"name": "Shaving", "url": "https://www.flipkart.com/beauty-and-grooming/shaving-beard-care/pr?sid=g9b%2Ctiz&sort=popularity"},
        ]

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        logger.error("Playwright not installed. Flipkart collector requires Playwright.")
        return []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 800},
                locale='en-IN',
                timezone_id='Asia/Kolkata',
            )
            page = context.new_page()

            # Block heavy resources
            page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,ico}", lambda route: route.abort())

            for cat in categories:
                cat_name = cat.get('name', 'Unknown')
                cat_url = cat.get('url', '')

                if not cat_url:
                    continue

                logger.info(f"Flipkart: scraping {cat_name}...")
                products = _scrape_flipkart_category(page, cat_url, cat_name, max_per_category)
                all_products.extend(products)

                time.sleep(random.uniform(2, 4))

            browser.close()

    except Exception as e:
        logger.error(f"Flipkart Playwright error: {e}")

    logger.info(f"Flipkart collector: {len(all_products)} total products collected.")
    return all_products


if __name__ == "__main__":
    import yaml
    logging.basicConfig(level=logging.INFO)

    try:
        with open("config.yaml") as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {}

    products = get_flipkart_trends(config)
    print(f"\nFlipkart Products: {len(products)} collected\n")
    for p in products[:10]:
        print(f"  #{p['rank']} [{p['category']}] {p['title'][:70]}... | {p['price']} | {p['rating']}* | {p['review_count']} reviews")
