# CODEBASE_MAP.md -- TrendRadar Complete Documentation

> Generated: 2026-05-19
> GitHub: `github.com/nikhilgwl/TrendRadar` (main branch, 105 commits, last updated 2026-05-18)
> Local: `C:\Users\shash\Downloads\GCPL SIP\TrendRadar-main`
> Live App: `https://trend-radar-app-frontend.vercel.app/`

---

## Part 1: File-Match Diff Summary (GitHub vs Local)

### GitHub Repository File Tree (30 files)

```
.github/
  workflows/
    run_radar.yml
alerts/
  telegram_alert.py
brain/
  gemini_filter.py
collectors/
  google_trends.py
  pinterest_collector.py
  reddit_collector.py
  reddit_public_collector.py
  rss_collector.py
  social_collector.py
utils/
  deduplicator.py
.env.example
.gitignore
config.yaml
daily_beauty_insights.json
debug_403.py
debug_raw_data.py
debug_v1.py
main.py
requirements.txt
run_log.txt
seen_trends.json
test_nykaa_scrape.py
test_pinterest_api.py
test_reddit.py
test_rss_google_news.py
test_rss_urls.py
test_rss_urls_v2.py
test_rss_v3.py
test_social_discovery.py
test_social_v2.py
```

### Local File Tree (31 files)

All 30 GitHub files are present locally, plus one extra:

```
.claude/
  settings.local.json    <-- LOCAL ONLY (not in GitHub)
```

### Diff Result

| Status | Count | Details |
|--------|-------|---------|
| Matched (present in both) | 30 | All 30 GitHub files exist locally with identical paths |
| Extra in Local | 1 | `.claude/settings.local.json` (Claude Code local config, not tracked by git) |
| Missing from Local | 0 | None |
| Mismatched paths | 0 | None |

**Verdict: Local codebase is a 1:1 match with the GitHub repository.** The only extra file is a Claude Code tool configuration file that is not part of the project.

---

## Part 2: File-by-File Documentation

### Architecture Overview

TrendRadar is a **Python-based beauty trend intelligence pipeline** that:
1. **Collects** raw data from 5 platforms (Google Trends, Reddit, RSS/News, Social/Twitter, Pinterest)
2. **Analyzes** collected data using Google Gemini AI to extract top 5 actionable beauty trends
3. **Alerts** via Telegram with a mobile-optimized beauty intelligence report
4. **Runs daily** via GitHub Actions cron job at 10:00 AM IST

The pipeline outputs `daily_beauty_insights.json` which is consumed by a **separate Vercel-hosted frontend** (not included in this repo).

---

### 2.1 Root Configuration & Data Files

---

#### `.env.example` (6 lines)

**Purpose:** Template showing required environment variables for local development.

**Dependencies:** None (plain text).

**Content Breakdown:**

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | API key for Google Gemini AI (used by `brain/gemini_filter.py`) |
| `REDDIT_CLIENT_ID` | Reddit OAuth app client ID (used by `collectors/reddit_collector.py`) |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth app client secret |
| `REDDIT_USER_AGENT` | User agent string for Reddit API; defaults to `TrendRadarBot/1.0` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token (used by `alerts/telegram_alert.py`) |
| `TELEGRAM_CHAT_ID` | Target Telegram chat/channel ID for sending alerts |

---

#### `.gitignore` (5 lines)

**Purpose:** Prevents sensitive/generated files from being committed.

**Content Breakdown:**

| Pattern | What it excludes |
|---------|-----------------|
| `.env` | Secret environment variables file |
| `__pycache__/` | Python bytecode cache directories |
| `*.pyc` | Compiled Python bytecode files |
| `top_opportunity.json` | Legacy output file (no longer produced by current pipeline) |
| `*.png` | Any generated image files |

---

#### `config.yaml` (35 lines)

**Purpose:** Central configuration file defining beauty categories, data sources, brand portfolio, and thresholds.

**Dependencies:** Read by `main.py`, `debug_raw_data.py`; passed into collectors and the Gemini filter.

**Block-by-Block Breakdown:**

**`categories` (lines 1-22):** Array of 3 beauty category objects:

- **Skin Care category:**
  - `keywords`: 10 terms ("barrier repair", "active ingredients", "glass skin", "ceramides", "peptides", etc.)
  - `subreddits`: 5 subreddits -- `IndianSkincareAddicts`, `SkincareAddiction`, `AsianBeauty`, `DermatologyQuestions`, `DIYBeauty`
  - `rss`: 1 Google News RSS feed URL filtered to skincare+trends+india within last 24h

- **Makeup category:**
  - `keywords`: 13 terms ("shade name", "lipstick shade", "strawberry makeup", "soft goth", "monochromatic", etc.)
  - `subreddits`: 5 subreddits -- `IndianMakeupAddicts`, `MakeupAddiction`, `MakeupAddicts`, `AsianBeauty`, `BeautyGuruChatter`
  - `rss`: 2 Google News RSS feeds (makeup+looks+india, pinterest+makeup+look+india)

- **Hair Care category:**
  - `keywords`: 10 terms ("scalp health", "hair porosity", "balayage", "butterfly cut", "copper hair", etc.)
  - `subreddits`: 5 subreddits -- `IndianHaircare`, `HaircareScience`, `Haircare`, `curlyhair`, `NoPoo`
  - `rss`: 2 Google News RSS feeds (hair+style+trends+india, pinterest+hairstyle+india)

**`brand_portfolio` (lines 24-32):** Array of 8 brand names -- Dove, Pond's, Lakme, TRESemme, Indulekha, Simple, Vaseline, Love Beauty and Planet. These are HUL (Hindustan Unilever Limited) brands the system tracks.

**`thresholds` (lines 34-35):**
- `min_relevance_score`: 7 (minimum score for a trend to be reported)
- `max_trends_per_day`: 10 (cap on trends per daily run)

---

#### `requirements.txt` (15 lines)

**Purpose:** Python package dependencies for pip install.

**Dependencies Listed:**

| Package | Used By | Purpose |
|---------|---------|---------|
| `pytrends` | `collectors/google_trends.py`, `collectors/pinterest_collector.py`, `collectors/social_collector.py` | Unofficial Google Trends API |
| `praw` | `collectors/reddit_collector.py` | Reddit API wrapper (OAuth-based) |
| `feedparser` | `collectors/rss_collector.py`, `collectors/google_trends.py`, `collectors/reddit_public_collector.py`, `collectors/pinterest_collector.py` | RSS/Atom feed parser |
| `google-genai` | `brain/gemini_filter.py`, `debug_403.py`, `debug_v1.py` | Google Gemini AI SDK |
| `python-telegram-bot` | `alerts/telegram_alert.py` | Telegram Bot API wrapper |
| `pyyaml` | `main.py`, `debug_raw_data.py` | YAML parser for config.yaml |
| `python-dotenv` | `alerts/telegram_alert.py`, `brain/gemini_filter.py`, `collectors/reddit_collector.py` | Loads .env files |
| `asyncio` | `main.py`, `debug_raw_data.py` | Async I/O (stdlib, redundant in requirements) |
| `requests` | `collectors/social_collector.py`, `collectors/pinterest_collector.py`, `collectors/reddit_public_collector.py`, test files | HTTP client |
| `beautifulsoup4` | `collectors/social_collector.py`, `test_nykaa_scrape.py`, `test_social_v2.py` | HTML parser |
| `pandas` | `collectors/google_trends.py` | Data manipulation (imported but only used via pytrends) |
| `httpx` | `brain/gemini_filter.py`, `debug_403.py`, `debug_v1.py` | HTTP client patched for SSL bypass |
| `urllib3` | `brain/gemini_filter.py`, `debug_403.py`, `debug_v1.py` | HTTP library; warnings disabled for SSL bypass |
| `lxml` | (indirect) | XML/HTML parser backend for feedparser/beautifulsoup |
| `playwright` | `collectors/reddit_public_collector.py` | Headless browser for Reddit scraping |

---

#### `daily_beauty_insights.json` (45 lines)

**Purpose:** Output file written by `main.py` after each pipeline run. Contains timestamped beauty trend intelligence consumed by the Vercel frontend.

**Dependencies:** Written by `main.py`; committed back to GitHub by the Actions workflow.

**Structure:**
- `timestamp`: ISO-8601 datetime of the pipeline run
- `trends`: Array of 5 trend objects, each with:
  - `label`: Category tag (`[INGREDIENT BREAKOUT]`, `[CROSS-PLATFORM]`, `[GOOGLE/SOCIAL]`, `[NEWS/RSS]`, `[REDDIT EXCLUSIVE]`)
  - `trend_name`: Short name of the trend
  - `source_platform`: Where the trend was detected
  - `metric`: Quantitative signal (upvote count or "Trending Search")
  - `context`: Brief description of consumer behavior
  - `result`: Business outcome or market implication

**Current data (as of 2026-05-18):** 5 trends including "Volufiline for Volume", "Gel Sunscreen Transition", "Kyoto Aesthetic Styling", "90s Sheer Lip Revival", "Thai Sunscreen Efficacy".

---

#### `seen_trends.json` (10 lines)

**Purpose:** Deduplication database tracking previously reported trends with timestamps. Prevents the same trend from being re-alerted within a configurable time window.

**Dependencies:** Read/written by `utils/deduplicator.py`.

**Structure:** JSON object where keys are trend names (strings) and values are ISO-8601 timestamps of when the trend was last seen. Entries older than 24 hours are auto-purged.

**Current data:** 8 entries from April 30 - May 1, 2026 (mostly Bollywood/IPL trends from an earlier configuration).

---

#### `run_log.txt` (empty)

**Purpose:** Logging output file. Python's `logging.FileHandler` in `main.py` writes pipeline execution logs here.

**Dependencies:** Written by `main.py` via `logging.basicConfig(handlers=[FileHandler("run_log.txt")])`.

**Current state:** Empty (gets overwritten/appended each run; committed by Actions workflow).

---

### 2.2 Core Pipeline

---

#### `main.py` (88 lines)

**Purpose:** Entry point for the TrendRadar pipeline. Orchestrates the full collect-analyze-alert cycle.

**Imports/Dependencies:**
- `asyncio` -- async event loop for parallel collector execution
- `yaml` -- parses `config.yaml`
- `logging` -- structured logging to console and `run_log.txt`
- `json` -- writes `daily_beauty_insights.json`
- `os` -- (imported but not directly used in this file)
- `datetime.datetime` -- timestamps for the insights output
- `collectors.google_trends.get_google_trends` -- Google Trends collector
- `collectors.reddit_public_collector.get_reddit_trends` -- Reddit collector (public/RSS-based)
- `collectors.rss_collector.get_rss_trends` -- RSS/News collector
- `collectors.social_collector.get_social_trends` -- Twitter/social trends collector
- `collectors.pinterest_collector.get_pinterest_trends` -- Pinterest collector
- `brain.gemini_filter.get_categorized_trends` -- Gemini AI trend analyzer
- `alerts.telegram_alert.send_telegram_alert` -- Telegram notification sender

**Block-by-Block Breakdown:**

**Logging setup (lines 16-23):**
- Configures logging at INFO level
- Dual output: `run_log.txt` file + console (StreamHandler)
- Format: `%(asctime)s - %(levelname)s - %(message)s`
- Creates module-level `logger` instance

**`async def run_pipeline()` (lines 25-85):**
The main orchestration function. Runs asynchronously.

1. **Config loading (lines 28-34):** Opens and parses `config.yaml` with `yaml.safe_load()`. Receives: nothing. Returns: populates local `config` dict. On failure: logs error and returns early.

2. **Collector execution (lines 37-48):** Uses `asyncio.gather()` with `asyncio.to_thread()` to run all 5 collectors in parallel threads:
   - `get_google_trends()` -- no args
   - `get_reddit_trends(subreddits)` -- flattens all subreddits from all categories via list comprehension
   - `get_rss_trends(rss_urls)` -- flattens all RSS URLs from all categories
   - `get_social_trends(config)` -- passes full config
   - `get_pinterest_trends(config)` -- passes full config
   
   Receives: config dict. Returns: tuple of 5 lists `(google, reddit, rss, social, pinterest)`. On failure: logs error and returns early.

3. **Trend extraction (lines 52-56):** Calls `get_categorized_trends(config, google, reddit, rss, social, pinterest)` which sends all raw data to Gemini AI. Receives: config + 5 raw data lists. Returns: list of up to 5 trend dicts. If empty, logs and returns.

4. **Save insights (lines 58-60):** Creates an `insights` dict with current timestamp and trends, writes to `daily_beauty_insights.json` with 4-space indent.

5. **Telegram formatting (lines 62-80):** Builds a mobile-optimized Markdown message:
   - Header: diamond emoji + "DAILY BEAUTY INTELLIGENCE"
   - For each of up to 5 trends: extracts `label`, `trend_name`, `source_platform`, `metric`, `context`, `result` with multiple fallback field names
   - Each trend block: label, quoted name, source, metric, context paragraph, result paragraph, separator line
   - Sends via `send_telegram_alert()` with `custom_message` key

6. **Logs completion (line 82).**

**`if __name__ == "__main__"` (lines 84-85):** Calls `asyncio.run(run_pipeline())`.

---

### 2.3 Collectors (`collectors/`)

---

#### `collectors/google_trends.py` (67 lines)

**Purpose:** Fetches trending search terms from Google Trends for India using RSS feed (primary) and pytrends API (fallback).

**Imports/Dependencies:**
- `pandas` (as `pd`) -- imported but only used indirectly via pytrends
- `feedparser` -- parses Google Trends RSS feed
- `logging` -- module-level logger
- `pytrends.request.TrendReq` -- unofficial Google Trends API client
- `datetime.datetime` -- imported but unused in this file
- `os` -- imported but unused in this file

**Block-by-Block Breakdown:**

**`get_google_trends()` (lines 11-39):**
- Receives: nothing
- Returns: deduplicated `list[str]` of trending search terms

1. **Method 1 -- RSS Feed (lines 15-25):** Parses `https://trends.google.com/trending/rss?geo=IN`. For each entry, appends `entry.title` to trends list. Logs count on success. On failure: warns and falls through.

2. **Method 2 -- Pytrends fallback (lines 28-37):** Only runs if RSS returned nothing. Creates `TrendReq(hl='en-IN', tz=330)`, calls `trending_searches(pn='IN')`, takes top 20 results from the DataFrame. On failure: warns.

3. **Deduplication (line 39):** Returns `list(set(trends))`.

**`get_breakout_trends(keywords)` (lines 41-63):**
- Receives: `keywords` -- list of keyword strings
- Returns: `list[str]` of keywords showing breakout growth pattern

For each of the first 5 keywords: builds a pytrends payload for `now 4-H` timeframe in India, checks `interest_over_time()`. If the first value < 10 and last value > 70, the keyword is classified as a breakout trend. On failure: warns per-keyword and continues.

**Note:** `get_breakout_trends` is defined but **not called** anywhere in the current pipeline.

**`if __name__ == "__main__"` (lines 65-67):** Test runner that prints fetched trends.

---

#### `collectors/reddit_collector.py` (51 lines)

**Purpose:** Fetches hot Reddit posts using the official Reddit API (PRAW) with OAuth credentials. This is the **authenticated** Reddit collector.

**Imports/Dependencies:**
- `praw` -- Reddit API wrapper (requires OAuth credentials)
- `os` -- reads environment variables
- `datetime.datetime`, `datetime.timezone` -- UTC time calculations
- `dotenv.load_dotenv` -- loads `.env` file

**Block-by-Block Breakdown:**

**`load_dotenv()` (line 7):** Loads environment variables from `.env`.

**`get_reddit_trends(subreddits)` (lines 9-44):**
- Receives: `subreddits` -- list of subreddit name strings
- Returns: `list[dict]` sorted by upvote velocity (descending)

1. **Reddit client init (lines 13-18):** Creates `praw.Reddit` instance using `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` from env vars.

2. **Per-subreddit fetch (lines 22-38):** For each subreddit, fetches top 15 hot posts. For each post:
   - Calculates `age_hours` from `created_utc` vs current UTC time
   - Filters to posts created within last 6 hours only
   - Calculates `velocity = score / max(age_hours, 0.1)` (upvotes per hour)
   - Appends dict with: `title`, `score`, `subreddit`, `velocity`, `url`
   - On failure per subreddit: prints error, continues

3. **Sort (line 42):** Sorts all posts by velocity descending.

**Note:** This collector is **not used** in the current `main.py`. The pipeline uses `reddit_public_collector.py` instead (which doesn't need OAuth).

**`if __name__ == "__main__"` (lines 46-51):** Test with `["india", "bollywood"]`.

---

#### `collectors/reddit_public_collector.py` (151 lines)

**Purpose:** Hybrid Reddit collector that works without OAuth. Uses Playwright headless browser (local) and RSS feeds (cloud/GitHub Actions) to collect posts from beauty subreddits.

**Imports/Dependencies:**
- `json` -- parses JSON responses from Reddit
- `time` -- sleep between requests, timestamp conversion
- `random` -- randomized delays to avoid rate limiting
- `logging` -- module-level logger
- `requests` -- HTTP client for RSS feeds
- `feedparser` -- RSS feed parser
- `datetime.datetime`, `datetime.timezone` -- UTC time calculations

**Block-by-Block Breakdown:**

**`_fetch_via_rss(clean_name, now)` (lines 11-57):**
- Receives: `clean_name` (subreddit name without `r/` prefix), `now` (current UTC datetime)
- Returns: `list[dict]` of posts from the subreddit

1. **HTTP request (lines 17-22):** Sends GET to `https://www.reddit.com/r/{clean_name}/hot.rss?limit=30` with Chrome-like User-Agent. If non-200 status: warns and returns empty.

2. **Feed parsing (lines 24-49):** Parses RSS response with feedparser. For each entry:
   - Extracts `title` (UTF-8 safe), `link`
   - Parses `published_parsed` timestamp if available; defaults to 12h age if missing
   - Filters to posts within last 24 hours
   - Since RSS doesn't expose scores: sets `score=0`, `num_comments=0`, calculates `velocity = 1.0 / max(age_hours, 0.1)`
   - Appends dict with: `title`, `score`, `num_comments`, `subreddit`, `velocity`, `url`

3. **Logging (line 53):** Logs count of posts fetched.

**`_fetch_via_playwright(clean_name, now)` (lines 60-113):**
- Receives: `clean_name` (subreddit name), `now` (current UTC datetime)
- Returns: `list[dict]` of posts with real scores

1. **Import check (lines 66-68):** Tries `from playwright.sync_api import sync_playwright`. If ImportError: returns empty list (graceful fallback).

2. **Browser setup (lines 71-79):** Launches headless Chromium with Chrome User-Agent, 1280x800 viewport, `en-US` locale, `Asia/Kolkata` timezone. Blocks image/CSS/font requests for speed.

3. **Endpoint iteration (lines 81-104):** Iterates over `['hot', 'top?t=day']` endpoints:
   - Navigates to `https://www.reddit.com/r/{clean_name}/{endpoint}.json?limit=30`
   - Extracts page body text, parses as JSON
   - For each child post: calculates age in hours from `created_utc`
   - Filters to 24h window
   - Extracts `score`, `title`, `num_comments`, calculates velocity
   - Appends dict with: `title`, `score`, `num_comments`, `subreddit`, `velocity`, `url`
   - Sleeps 1-2 seconds between endpoints

4. **Cleanup (line 107):** Closes browser.

**`get_reddit_trends(subreddits)` (lines 116-145):**
- Receives: `subreddits` -- list of subreddit names (may include `r/` prefix)
- Returns: `list[dict]` deduplicated and sorted by score descending

1. **Per-subreddit processing (lines 122-134):** For each subreddit:
   - Strips `r/` prefix if present
   - Tries Playwright first (works locally)
   - Always also fetches via RSS (works on cloud IPs)
   - Combines results from both methods
   - Sleeps 0.5-1.5 seconds between subreddits

2. **Deduplication (line 137):** Uses URL as unique key via dict comprehension `{p['url']: p for p in all_posts}`.

3. **Sort (line 140):** Sorts by `score` descending (Playwright posts with real scores rank first).

4. **Logging (line 141):** Logs total unique post count.

---

#### `collectors/rss_collector.py` (56 lines)

**Purpose:** Fetches and parses RSS feeds from news sources, returning articles published within the last 24 hours.

**Imports/Dependencies:**
- `feedparser` -- RSS/Atom feed parser
- `re` -- regex for HTML tag stripping
- `datetime.datetime`, `datetime.timezone`, `datetime.timedelta` -- time window filtering
- `time` -- timestamp conversion via `time.mktime`
- `logging` -- module-level logger

**Block-by-Block Breakdown:**

**`clean_html(raw_html)` (lines 10-13):**
- Receives: `raw_html` -- string possibly containing HTML tags
- Returns: stripped plain text string
- Uses regex `<.*?>` to remove all HTML tags.

**`get_rss_trends(rss_urls)` (lines 15-56):**
- Receives: `rss_urls` -- list of RSS feed URL strings
- Returns: `list[dict]` of article objects

1. **Time window (lines 22-24):** Calculates a 24-hour lookback window from current UTC time.

2. **Per-feed parsing (lines 26-52):** For each URL:
   - Parses with `feedparser.parse(url)`
   - Logs entry count per feed
   - For each entry:
     - If `published_parsed` exists: converts to datetime, checks if within 24h window
     - If no timestamp: includes anyway with current time as published date
     - Appends dict with: `title`, `summary` (HTML-cleaned), `link`, `published` (ISO format), `source` (feed URL)
   - On failure per feed: logs error, continues

---

#### `collectors/social_collector.py` (41 lines)

**Purpose:** Fetches social/Twitter trending hashtags and Google trending searches for India.

**Imports/Dependencies:**
- `requests` -- HTTP client for scraping
- `bs4.BeautifulSoup` -- HTML parser for extracting hashtag elements
- `logging` -- module-level logger
- `pytrends.request.TrendReq` -- Google Trends API client

**Block-by-Block Breakdown:**

**`get_social_trends(config)` (lines 8-41):**
- Receives: `config` -- full config dict (currently unused within the function body)
- Returns: `list[str]` of deduplicated trending terms

1. **Twitter India Trends scrape (lines 14-28):** Sends GET to `https://getdaytrends.com/india/` with Chrome User-Agent. Parses HTML, selects `td.main a` elements (hashtag links). Takes top 10 hashtags. On failure: logs error.

2. **Google Trends API (lines 31-38):** Creates fresh `TrendReq(hl='en-IN', tz=330, retries=2, backoff_factor=0.1)`, calls `trending_searches(pn='india')`. Takes top 10 from DataFrame. On failure: warns ("Prone to 429/404").

3. **Deduplication (line 40):** Returns `list(set(trends))`.

---

#### `collectors/pinterest_collector.py` (51 lines)

**Purpose:** Collects Pinterest-related beauty trends using Google Trends pytrends API and Google News RSS as proxy sources (no direct Pinterest API access).

**Imports/Dependencies:**
- `logging` -- module-level logger
- `feedparser` -- RSS parser for Google News fallback
- `requests` -- HTTP client
- `pytrends.request.TrendReq` -- Google Trends API

**Block-by-Block Breakdown:**

**`get_pinterest_trends(config)` (lines 8-51):**
- Receives: `config` -- full config dict (currently unused within function body)
- Returns: `list[str]` of deduplicated trend names

1. **Method 1 -- PyTrends (lines 14-31):** Builds payload for queries `["pinterest makeup look", "pinterest hair style"]` with category 44 (Beauty & Fitness), timeframe `now 1-d`, geo `IN`. Fetches `related_queries()`. For rising queries: strips "pinterest" prefix, title-cases, and appends. On failure: warns, falls through.

2. **Method 2 -- Google News RSS (lines 34-43):** Only if pytrends returned nothing. Searches Google News RSS for `site:pinterest.com beauty looks india when:24h`. For each of first 5 entries: extracts title (split on `-`, take first part). On failure: logs error.

3. **Method 3 -- Hardcoded fallback (lines 46-47):** Only if both methods failed. Returns curated list: `["90s Blowout Hair", "Monochromatic Peach Makeup", "Scalp Slugging", "Glazed Skin"]`.

4. **Deduplication (line 49):** Returns `list(set(trends))`.

---

### 2.4 Brain (`brain/`)

---

#### `brain/gemini_filter.py` (85 lines)

**Purpose:** The AI analysis engine. Sends all collected raw data to Google Gemini and receives a structured JSON response with 5 categorized beauty trends.

**Imports/Dependencies:**
- `os` -- reads `GEMINI_API_KEY` from environment
- `json` -- parses Gemini's JSON response
- `logging` -- module-level logger
- `httpx` -- patched for SSL bypass
- `urllib3` -- SSL warning suppression
- `google.genai` -- Google Gemini AI client
- `google.genai.types` -- Gemini configuration types
- `dotenv.load_dotenv` -- loads `.env`

**Block-by-Block Breakdown:**

**SSL bypass patch (lines 12-18):**
- Disables urllib3 InsecureRequestWarning
- Monkey-patches `httpx.Client.__init__` to force `verify=False` on all HTTPS requests
- This works around SSL certificate verification issues in some environments

**`get_categorized_trends(config, google_trends, reddit_posts, rss_headlines, social_trends=None, pinterest_trends=None)` (lines 24-85):**
- Receives: `config` dict, `google_trends` list[str], `reddit_posts` list[dict], `rss_headlines` list[dict], optional `social_trends` list, optional `pinterest_trends` list
- Returns: `list[dict]` of 5 trend objects (or empty list on failure)

1. **API key check (lines 29-32):** Reads `GEMINI_API_KEY` from env. If missing: logs error, returns `[]`.

2. **Client init (lines 35-36):** Creates `genai.Client(api_key=api_key)`. Uses model `gemini-3.1-flash-lite-preview`.

3. **Input formatting (lines 38-40):**
   - `reddit_list`: Joins first 80 Reddit posts as `"- {title} [{score} upvotes, Sub: {subreddit}]"` lines
   - `news_list`: Joins first 30 RSS headlines as `"- {title}"` lines
   - `other_list`: Concatenates social, Google, and Pinterest data into one string

4. **System instruction (lines 42-61):** Defines a detailed prompt telling Gemini to act as a "Beauty Trends Analyst" that must:
   - Return exactly 5 trends
   - Use specific labels: `[REDDIT EXCLUSIVE]`, `[GOOGLE/SOCIAL]`, `[NEWS/RSS]`, `[CROSS-PLATFORM]`, `[INGREDIENT BREAKOUT]`
   - Keep context under 20 words, result under 15 words
   - Use upvote count or "Trending Search" as metric
   - Output JSON array with fields: `label`, `trend_name`, `source_platform`, `metric`, `context`, `result`

5. **Gemini config (lines 63-67):** Creates `GenerateContentConfig` with:
   - `system_instruction`: the analyst prompt above
   - `temperature`: 0.1 (highly deterministic)
   - `response_mime_type`: `"application/json"` (forces structured JSON output)

6. **Prompt construction (line 69):** Formats data sources into sections: `REDDIT:`, `GOOGLE/SOCIAL:`, `NEWS:`.

7. **API call (lines 73-78):** Calls `client.models.generate_content()` with model ID, prompt, and config. Parses the response text as JSON.

8. **Error handling (lines 80-82):** On any exception: logs error, returns `[]`.

---

### 2.5 Alerts (`alerts/`)

---

#### `alerts/telegram_alert.py` (62 lines)

**Purpose:** Sends formatted Telegram messages (text or photo+caption) for trend alerts.

**Imports/Dependencies:**
- `os` -- reads Telegram credentials from environment
- `asyncio` -- imported but not directly used (the function itself is async)
- `telegram.Bot` -- Telegram Bot API client (python-telegram-bot package)
- `datetime.datetime` -- current time formatting
- `dotenv.load_dotenv` -- loads `.env`

**Block-by-Block Breakdown:**

**`load_dotenv()` (line 7):** Loads environment variables.

**`async def send_telegram_alert(opportunity, image_path=None)` (lines 9-58):**
- Receives: `opportunity` dict (trend data or custom message), optional `image_path` string
- Returns: nothing (sends message as side effect)
- Triggers: Telegram message delivery

1. **Credential check (lines 16-21):** Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from env. If either missing: prints warning and returns.

2. **Bot init (line 23):** Creates `Bot(token=token)`.

3. **Message branching (lines 25-44):**
   - **Custom message path (lines 26-28):** If `opportunity` has `custom_message` key: uses it directly (this is the path `main.py` takes for the daily report).
   - **Individual trend path (lines 29-44):** Otherwise, formats a standard trend alert with:
     - Priority prefix (fire emoji + "HIGH PRIORITY") if urgency >= 8
     - Trend name, category, relevance score out of 10
     - Summary text
     - Detection timestamp in IST format

4. **Send (lines 46-53):**
   - If `image_path` provided and file exists: sends photo with caption via `bot.send_photo()`
   - Otherwise: sends text via `bot.send_message()`
   - Both use `parse_mode='Markdown'`
   - On failure: prints error message

**`if __name__ == "__main__"` (lines 55-62):** Contains a commented-out test call with a sample trend dict.

---

### 2.6 Utils (`utils/`)

---

#### `utils/deduplicator.py` (42 lines)

**Purpose:** Tracks previously seen trends in `seen_trends.json` to prevent duplicate alerts within a configurable time window.

**Imports/Dependencies:**
- `json` -- reads/writes the seen trends database
- `os` -- checks if database file exists
- `datetime.datetime`, `datetime.timedelta` -- time window calculations

**Block-by-Block Breakdown:**

**`DB_FILE = "seen_trends.json"` (line 5):** Module-level constant pointing to the persistence file.

**`is_new_trend(trend_name, interval_minutes=720)` (lines 7-42):**
- Receives: `trend_name` string, optional `interval_minutes` int (default 720 = 12 hours)
- Returns: `bool` -- `True` if the trend has not been seen within the interval, `False` otherwise
- Triggers: updates `seen_trends.json` on disk if trend is new

1. **Load database (lines 14-20):** Reads `seen_trends.json` if it exists. On parse failure: starts with empty dict.

2. **Purge old entries (lines 23-24):** Removes any entries older than 24 hours from the database.

3. **Check window (lines 27-32):** Calculates cutoff time as `now - interval_minutes`. If trend exists in database and its timestamp is within the window: `is_new = False`.

4. **Update (lines 35-38):** If the trend is new: writes current timestamp to database and persists to disk.

**Note:** `is_new_trend` is defined but **not called** in the current pipeline (`main.py` does not use the deduplicator). It was likely used in an earlier version of the codebase.

---

### 2.7 Debug Scripts

---

#### `debug_403.py` (31 lines)

**Purpose:** Debug script to test Gemini API connectivity using model `gemini-3.1-flash-lite-preview` with a hardcoded API key. Used to diagnose 403 Forbidden errors from the Gemini API.

**Imports/Dependencies:**
- `os` -- imported but unused
- `httpx` -- patched for SSL bypass
- `urllib3` -- SSL warning suppression
- `google.genai` -- Gemini client
- `google.genai.types` -- imported but unused

**Block-by-Block Breakdown:**

**SSL bypass (lines 8-13):** Same monkey-patch pattern as `brain/gemini_filter.py`.

**`test()` (lines 15-28):**
- Receives: nothing
- Returns: nothing (prints results)
- Creates Gemini client with hardcoded API key
- Sends `"Say hello"` to `gemini-3.1-flash-lite-preview`
- Prints success/failure

---

#### `debug_v1.py` (31 lines)

**Purpose:** Debug script testing Gemini API with the older model `gemini-1.5-flash`. Identical structure to `debug_403.py` but targets a different model.

**Imports/Dependencies:** Same as `debug_403.py`.

**Block-by-Block Breakdown:** Same structure as `debug_403.py` except tests model `gemini-1.5-flash` instead of `gemini-3.1-flash-lite-preview`.

---

#### `debug_raw_data.py` (57 lines)

**Purpose:** Debug script that runs all 5 collectors and prints their raw output without Gemini analysis or Telegram alerting. Used for inspecting the quality and volume of collected data.

**Imports/Dependencies:**
- `asyncio` -- parallel collector execution
- `yaml` -- parses `config.yaml`
- `json` -- pretty-printing output
- `os` -- imported but unused
- All 5 collector functions (same as `main.py`)

**Block-by-Block Breakdown:**

**`async def debug_raw()` (lines 11-55):**
- Receives: nothing
- Returns: nothing (prints to console)

1. **Config loading (lines 14-16):** Reads `config.yaml`.

2. **Source extraction (lines 18-27):** Extracts and deduplicates subreddits and RSS feeds from all categories.

3. **Parallel collection (lines 31-37):** Runs all 5 collectors via `asyncio.gather` + `asyncio.to_thread`.

4. **Output formatting (lines 41-49):** Creates a summary dict with:
   - First 5 Google trends
   - First 30 Reddit posts (title + subreddit only)
   - First 10 RSS headlines
   - First 20 social hashtags
   - All Pinterest trends

5. **Print totals (lines 51-55):** Prints count from each source.

---

### 2.8 Test Scripts

---

#### `test_reddit.py` (7 lines)

**Purpose:** Quick test of the Reddit public collector with 3 skincare subreddits.

**Imports:** `collectors.reddit_public_collector.get_reddit_trends`

**Behavior:** Calls `get_reddit_trends(['IndianSkincareAddicts', 'SkincareAddiction', 'MakeupAddiction'])`, prints count and first 5 posts with score, subreddit, and truncated title.

---

#### `test_nykaa_scrape.py` (26 lines)

**Purpose:** Tests scraping Nykaa's trending products page.

**Imports:** `requests`, `bs4.BeautifulSoup`

**Behavior:** Sends GET to `https://www.nykaa.com/tags/trending-now`, parses HTML looking for elements with class `.css-11z79ar`. Prints first 5 product names. Note: Nykaa relies heavily on client-side JS so this scraper likely finds no products.

---

#### `test_pinterest_api.py` (27 lines)

**Purpose:** Tests Pinterest's autocomplete API for beauty-related search suggestions.

**Imports:** `requests`, `json`

**Behavior:** For 3 queries ("skincare india", "makeup trends india", "hair care india"), hits Pinterest's `SearchAutocompleteResource/get/` endpoint. Prints status and first 5 suggestions.

---

#### `test_rss_google_news.py` (26 lines)

**Purpose:** Tests Google News RSS feeds for beauty topics.

**Imports:** `feedparser`, `requests`

**Behavior:** Tests 4 Google News RSS URLs (beauty+skin+makeup, skincare, makeup trends, hair care -- all India-focused, last 24h). Prints entry count and sample title per feed.

---

#### `test_rss_urls.py` (29 lines)

**Purpose:** Tests direct beauty publication RSS feeds.

**Imports:** `feedparser`, `requests`

**Behavior:** Tests 5 feeds: BeBeautiful, Vogue India, Nykaa Blog, Elle India, Cosmopolitan India. Prints HTTP status, entry count, sample title.

---

#### `test_rss_urls_v2.py` (28 lines)

**Purpose:** Tests additional Indian publication RSS feeds.

**Imports:** `feedparser`, `requests`

**Behavior:** Tests 5 feeds: Femina, Indian Express Lifestyle/Beauty, India TV News, The Health Site, PinkVilla. Same output pattern as v1.

---

#### `test_rss_v3.py` (25 lines)

**Purpose:** Tests mainstream Indian news RSS feeds for lifestyle/beauty coverage.

**Imports:** `feedparser`, `requests`

**Behavior:** Tests 3 feeds: Hindustan Times, News18, DNA India. Same output pattern.

---

#### `test_social_discovery.py` (24 lines)

**Purpose:** Tests discovering social media content via Google News RSS by searching for site-specific queries.

**Imports:** `feedparser`, `requests`

**Behavior:** Searches Google News RSS for 3 queries: `site:twitter.com beauty india`, `site:twitter.com skincare india`, `site:pinterest.com makeup india` (all last 24h). Prints first 3 entries per query.

---

#### `test_social_v2.py` (22 lines)

**Purpose:** Tests a hashtag aggregator service for India beauty hashtags.

**Imports:** `requests`, `bs4.BeautifulSoup`

**Behavior:** Fetches `https://displaypurposes.com/hashtags/tag/beauty/india`, checks if "skincare" appears in response text. The site is JS-heavy so may not work with simple HTTP requests.

---

### 2.9 CI/CD

---

#### `.github/workflows/run_radar.yml` (47 lines)

**Purpose:** GitHub Actions workflow that runs the pipeline daily and commits output files back to the repo.

**Block-by-Block Breakdown:**

**Trigger (lines 3-5):**
- `schedule`: cron `30 4 * * *` = daily at 04:30 UTC = 10:00 AM IST
- `workflow_dispatch`: allows manual trigger from GitHub UI

**Job `run-radar` (lines 7-47):**
- Runs on: `ubuntu-latest`

**Steps:**

1. **Checkout (lines 12-15):** `actions/checkout@v3` with `fetch-depth: 0` (full history for rebase support).

2. **Python setup (lines 17-20):** `actions/setup-python@v4` with Python 3.11.

3. **Install dependencies (lines 22-25):** Upgrades pip, installs from `requirements.txt`, installs Playwright Chromium with system deps.

4. **Run pipeline (lines 27-36):** Executes `python main.py` with 6 secret environment variables injected: `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`.

5. **Commit changes (lines 38-45):** Configures git as `github-actions` user, stages 3 output files (`seen_trends.json`, `run_log.txt`, `daily_beauty_insights.json`), commits with `[skip ci]` message (prevents recursive workflow trigger), rebases on remote main, and pushes.

---

### 2.10 Local Config

---

#### `.claude/settings.local.json` (7 lines)

**Purpose:** Claude Code local configuration. Not part of the TrendRadar project.

**Content:** Grants automatic permission for the `mcp__Claude_in_Chrome__tabs_context_mcp` tool.

---

## Part 3: Route-to-File Mapping (Web App vs Backend)

The live web app at `https://trend-radar-app-frontend.vercel.app/` is a **separate frontend codebase** (not in this repo). It consumes data produced by this pipeline. The mapping below shows which backend pipeline files contribute data to each web app page.

### Web App Pages Observed

| # | Web App Page | URL Route | Signal Count | Data Source in Backend Pipeline |
|---|-------------|-----------|-------------|-------------------------------|
| 1 | **Dashboard** (Home) | `/` | Summary view | `daily_beauty_insights.json` (written by `main.py`) provides Today's Intelligence cards; Competitor Pulse data comes from the frontend's own backend |
| 2 | **Intelligence Digest** (AI Digest) | `/ai-digest` | 3 signals | `brain/gemini_filter.py` produces the categorized trends with labels, HUL insights are added by the frontend |
| 3 | **Brand Health** | `/brand-health` | 8 competitors, 4 HUL brands | `config.yaml` `brand_portfolio` defines HUL brands; competitor tracking is handled by the frontend backend |
| 4 | **All Feed** | `/all-feeds` | 204 signals | Aggregation of all platform feeds below |
| 5 | **Google Feed** | `/google` | 13 signals | `collectors/google_trends.py` (Google Trends RSS) + `collectors/rss_collector.py` (Google News RSS feeds from `config.yaml`) |
| 6 | **Reddit Feed** | `/reddit` | 28 signals | `collectors/reddit_public_collector.py` -- hybrid RSS + Playwright collector pulling from 15 beauty subreddits defined in `config.yaml` |
| 7 | **Pinterest Feed** | `/pinterest` | 9 signals | `collectors/pinterest_collector.py` -- Pinterest-proxied data via Google Trends and Google News RSS |
| 8 | **News Feed** | `/news` | 29 signals | `collectors/rss_collector.py` -- parses the RSS feed URLs from `config.yaml` (Google News beauty/skincare/makeup/hair queries) |
| 9 | **Amazon Feed** | `/amazon` | 60 signals | **Not sourced from this backend repo** -- Amazon product data (bestsellers, rankings, ratings) is collected by the frontend's own backend or a separate service |
| 10 | **Nykaa Feed** | `/nykaa` | 65 signals | **Not sourced from this backend repo** -- Nykaa trending product data is collected separately; `test_nykaa_scrape.py` exists as an experimental scraper but is not integrated into the pipeline |

### Data Flow Diagram

```
config.yaml
    |
    v
main.py (orchestrator)
    |
    +---> collectors/google_trends.py      --> Google Trends data
    +---> collectors/reddit_public_collector.py --> Reddit posts
    +---> collectors/rss_collector.py      --> News/RSS articles
    +---> collectors/social_collector.py   --> Twitter/social hashtags
    +---> collectors/pinterest_collector.py --> Pinterest-proxy trends
    |
    v
brain/gemini_filter.py (Gemini AI)
    |
    v
daily_beauty_insights.json (5 categorized trends)
    |
    v
alerts/telegram_alert.py --> Telegram message
    |
    v
GitHub Actions commits insights JSON --> Frontend reads it
                                          |
                                          v
                                    Vercel Web App
                                    (10 pages, 204+ signals)
```

### Files NOT Connected to Any Web App Page

These files exist in the repo but do not directly power any web app feature:

| File | Reason |
|------|--------|
| `debug_403.py` | One-off Gemini API debug script |
| `debug_v1.py` | One-off Gemini model test script |
| `debug_raw_data.py` | Developer tool for inspecting raw collector output |
| `test_nykaa_scrape.py` | Experimental Nykaa scraper (not integrated) |
| `test_pinterest_api.py` | Pinterest API exploration (not integrated) |
| `test_reddit.py` | Reddit collector quick test |
| `test_rss_google_news.py` | Google News RSS feed validation |
| `test_rss_urls.py` | Beauty publication RSS feed validation |
| `test_rss_urls_v2.py` | Additional RSS feed validation |
| `test_rss_v3.py` | Mainstream news RSS feed validation |
| `test_social_discovery.py` | Social media via Google News RSS test |
| `test_social_v2.py` | Hashtag aggregator test |
| `collectors/reddit_collector.py` | OAuth-based Reddit collector (replaced by `reddit_public_collector.py`) |
| `utils/deduplicator.py` | Trend deduplication utility (defined but not called in current pipeline) |
| `seen_trends.json` | Deduplicator database (stale, not actively used) |
| `run_log.txt` | Pipeline execution log |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore rules |
| `requirements.txt` | Package dependencies |
| `.claude/settings.local.json` | Claude Code local config |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total files in repo | 30 |
| Total files locally | 31 (+ 1 `.claude/settings.local.json`) |
| Python files | 22 |
| Config/data files | 9 |
| Total Python LOC | 1,068 |
| Active pipeline files | 8 (`main.py`, 5 collectors, 1 brain, 1 alert) |
| Test/debug files | 12 |
| Utility files (unused) | 2 (`deduplicator.py`, `reddit_collector.py`) |
| Web app pages | 10 |
| Web app signals tracked | 204+ |
| Platforms collected | 5 (Google Trends, Reddit, RSS/News, Social/Twitter, Pinterest) |
| Platforms in web app only | 2 (Amazon, Nykaa -- not sourced from this repo) |
