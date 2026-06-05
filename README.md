# Omniradar — GCPL Consumer Intelligence Platform

> **Built by Shashwat Maurya** | XLRI Jamshedpur | Summer Internship Project at Godrej Consumer Products Limited (GCPL), 2026

A real-time consumer intelligence pipeline for **GCPL**. Collects market signals from 10 platforms, generates AI-powered trend analysis, and delivers daily brand manager briefs via a web dashboard and Telegram.

**Live:** [omniradar.vercel.app](https://omniradar.vercel.app)

---

## What It Does

1. **Collects** data from 10 sources every 8 hours (3x daily via GitHub Actions):
   - E-commerce bestsellers: Amazon.in, Flipkart, Nykaa
   - Social platforms: Reddit, Instagram, YouTube, Pinterest
   - Search trends: Google Trends
   - News: RSS feeds from Google News
   - Social/Twitter trending topics

2. **Analyzes** all raw signals using Claude Sonnet (Anthropic AI):
   - Extracts 7 high-priority actionable trends for GCPL
   - Generates 1-3 daily brief points per brand category cluster (7 clusters)

3. **Delivers** intelligence through:
   - Web dashboard with platform feeds, brand health, and AI digest views
   - Per-cluster brand brief pages with 30-day rolling history
   - Telegram push notifications with top 7 trends

---

## Architecture

```
GitHub Actions (cron: 3x daily)
        │
        ▼
┌─── 10 Collectors (parallel) ───┐
│  Google · Reddit · RSS · Social │
│  Pinterest · Amazon · Nykaa     │
│  Flipkart · Instagram · YouTube │
└────────────────────────────────┘
        │
        ▼
┌─── Claude Sonnet AI ───────────┐
│  7 Trend Analysis              │
│  7 Brand Cluster Briefs        │
└────────────────────────────────┘
        │
        ▼
┌─── Output ─────────────────────┐
│  daily_beauty_insights.json    │
│  brand_briefs_history.json     │
│  → Copied to frontend/src/lib/ │
│  → Git push → Vercel rebuild   │
│  → Telegram alert              │
└────────────────────────────────┘
```

---

## Project Structure

```
├── main.py                          # Pipeline entry point (async)
├── run_and_deploy.py                # Build + git push automation
├── config.yaml                      # Categories, keywords, brand portfolio, e-commerce URLs
├── requirements.txt                 # Python dependencies
├── .env.example                     # Required environment variables (copy to .env)
├── .github/
│   └── workflows/
│       └── run_radar.yml            # GitHub Actions — 3x daily cron
│
├── collectors/                      # 10 data source collectors
│   ├── amazon_collector.py          # Playwright + RSS fallback
│   ├── flipkart_collector.py        # Playwright + RSS fallback
│   ├── nykaa_collector.py           # Playwright + RSS fallback
│   ├── reddit_public_collector.py   # JSON API + RSS (no auth needed)
│   ├── google_trends.py             # Google Trends RSS
│   ├── rss_collector.py             # Google News RSS feeds
│   ├── social_collector.py          # Twitter/Social trends
│   ├── pinterest_collector.py       # Pinterest via Google News proxy
│   ├── instagram_collector.py       # Instagram via Google News proxy
│   ├── youtube_collector.py         # YouTube Data API v3
│   └── keyword_loader.py            # Keyword filtering utility
│
├── brain/                           # AI analysis layer
│   ├── gemini_filter.py             # Claude Sonnet — 7-trend extraction
│   ├── brand_briefs.py              # Claude Sonnet — per-cluster daily briefs
│   └── brief_history.py             # 30-day rolling history manager
│
├── alerts/
│   └── telegram_alert.py            # Telegram HTML push notification
│
├── utils/
│   └── deduplicator.py              # Trend deduplication
│
├── frontend/                        # Next.js 14 web dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js              # Home — dashboard overview
│   │   │   ├── digest/page.js       # AI Digest — 7 curated trends
│   │   │   ├── brands/page.js       # Brand Health — cross-brand view
│   │   │   ├── brands/[cluster]/    # Brand Brief pages (7 clusters)
│   │   │   ├── feeds/page.js        # All Feeds — raw signal browser
│   │   │   └── feed/[source]/       # Per-platform feed views
│   │   ├── components/              # Sidebar, SignalCard, FeedGrid, etc.
│   │   └── lib/
│   │       ├── data.js              # Data layer — brand/category mapping
│   │       ├── pipeline_data.json   # Latest pipeline output (auto-updated)
│   │       ├── brand_briefs_data.json # Brand briefs history (auto-updated)
│   │       └── omniradar_keywords.json # Keyword database
│   ├── next.config.mjs              # Static export config
│   ├── vercel.json                  # Vercel deployment settings
│   └── package.json
│
└── daily_beauty_insights.json       # Latest pipeline output (auto-updated)
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Chromium (installed via Playwright)

### 1. Clone and install

```bash
git clone <repo-url>
cd TrendRadar-main

# Python
pip install -r requirements.txt
python -m playwright install chromium --with-deps

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `ANTHROPIC_API_KEY` | **Yes** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) — Powers all AI analysis. Claude Sonnet 4 model. |
| `TELEGRAM_BOT_TOKEN` | **Yes** | Create a bot via [@BotFather](https://t.me/BotFather) on Telegram |
| `TELEGRAM_CHAT_ID` | **Yes** | Send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to find the chat ID |
| `YOUTUBE_API_KEY_1` | Optional | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — YouTube Data API v3. Use 3 keys rotated to avoid quota limits. |
| `YOUTUBE_API_KEY_2` | Optional | Same as above |
| `YOUTUBE_API_KEY_3` | Optional | Same as above |

> **Cost:** The only paid API is Anthropic Claude. Each pipeline run makes 2 API calls (~$0.02-0.03 per run). At 3 runs/day, expect ~$2-3/month.

### 3. Run the pipeline

```bash
python main.py
```

This will:
- Collect from all 10 platforms (~5-10 min)
- Generate 7 AI trends + 7 brand cluster briefs
- Save `daily_beauty_insights.json` and `brand_briefs_history.json`
- Send a Telegram alert

### 4. Run the frontend locally

```bash
cd frontend
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### 5. Build and deploy

```bash
# Full pipeline + build + git push (triggers Vercel)
python run_and_deploy.py
```

Or build frontend only:

```bash
cd frontend
npm run build    # Outputs to frontend/out/
```

---

## GitHub Actions (CI/CD)

The pipeline runs automatically 3x daily via `.github/workflows/run_radar.yml`:

| Schedule | UTC | IST | Purpose |
|----------|-----|-----|---------|
| Morning  | 07:30 | 1:00 PM | Captures morning trends |
| Afternoon | 12:30 | 6:00 PM | Captures afternoon trends |
| Evening  | 17:00 | 10:30 PM | Captures evening trends |

**Required GitHub Secrets** (Settings > Secrets and variables > Actions):

- `ANTHROPIC_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `YOUTUBE_API_KEY_1`, `YOUTUBE_API_KEY_2`, `YOUTUBE_API_KEY_3`

The workflow: runs pipeline > copies data to frontend > commits > pushes > Vercel auto-deploys.

---

## Brand Brief Clusters

7 category clusters, each generating 1-3 daily actionable points for the respective brand manager:

| Cluster | URL Path | GCPL Brands |
|---------|----------|-------------|
| Personal Wash | `/brands/personal-wash` | Cinthol, Godrej No.1, Protekt |
| Hair Care | `/brands/hair-care` | Godrej Expert, Nupur, Godrej Professional |
| Men's Grooming & Fragrances | `/brands/mens-grooming` | Park Avenue, Cinthol |
| Home Insecticides | `/brands/home-insecticides` | HIT, Good Knight |
| Air Fresheners | `/brands/air-fresheners` | Godrej aer |
| Sexual Wellness | `/brands/sexual-wellness` | Kamasutra / KS |
| Fabric Care | `/brands/fabric-care` | Ezee, Genteel |

Briefs accumulate over 30 days (auto-purged). Each pipeline run replaces the current day's entry (latest run wins).

---

## Key Technical Details

- **AI Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`) via Anthropic API, temperature 0.15
- **Frontend:** Next.js 14 App Router, static export (`output: 'export'`), deployed on Vercel
- **E-commerce scraping:** Playwright headless Chromium with stealth measures + RSS fallback when blocked
- **Reddit:** Public JSON API + RSS (no auth required)
- **Instagram/Pinterest:** Google News RSS proxy (no API keys needed)
- **Data format:** All pipeline output is JSON — no database required
- **Design system:** Fraunces (serif), Inter Tight (sans), JetBrains Mono (mono), GCPL green accent (`oklch(0.58 0.14 145)`)

---

## Configuration

`config.yaml` controls all collection parameters:

- **Categories and keywords** — what signals are relevant to GCPL
- **Subreddits** — which subreddits to monitor
- **RSS feeds** — which Google News queries to track
- **E-commerce URLs** — Amazon/Nykaa/Flipkart category pages to scrape
- **Brand portfolio** — GCPL brands and competitor brands
- **Thresholds** — `min_relevance_score`, `max_trends_per_day`

To add a new category or competitor brand, edit `config.yaml` and the next pipeline run will pick it up.

---

## Extending

**Add a new collector:** Create `collectors/new_collector.py` with a function that returns a list of dicts. Import it in `main.py`, add to the `asyncio.gather()` call, and pass data to `get_categorized_trends()`.

**Add a new brand cluster:** Edit `CATEGORY_CLUSTERS` in `brain/brand_briefs.py` and `CLUSTER_META` in `frontend/src/app/brands/[cluster]/ClusterBriefClient.js`. Add the slug to `generateStaticParams()` in `page.js` and to the sidebar in `Sidebar.js`.

**Change AI behavior:** Edit the system prompt in `brain/gemini_filter.py` (main trends) or `brain/brand_briefs.py` (cluster briefs).
