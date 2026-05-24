"""
Brief History Manager for TrendRadar.

Manages brand_briefs_history.json — a rolling 30-day accumulation of daily briefs.
Each pipeline run appends/replaces the current day's entry (3 runs/day = same-day replacement).
Entries older than 30 days are auto-purged.
"""

import json
import os
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

HISTORY_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brand_briefs_history.json")
MAX_HISTORY_DAYS = 30


def _empty_history():
    """Return empty history structure."""
    return {"last_updated": "", "clusters": {}}


def load_history():
    """Load existing history file, or return empty structure."""
    if not os.path.exists(HISTORY_FILE):
        return _empty_history()
    try:
        with open(HISTORY_FILE, "r") as f:
            data = json.load(f)
        if not isinstance(data, dict) or "clusters" not in data:
            logger.warning("History file has invalid structure — resetting.")
            return _empty_history()
        return data
    except (json.JSONDecodeError, IOError) as e:
        logger.warning(f"Failed to load history file: {e} — starting fresh.")
        return _empty_history()


def save_briefs(briefs_by_cluster):
    """
    Merge today's briefs into history and save.
    Same-day entries are replaced (so 3 daily runs keep only the latest).
    Entries older than 30 days are purged.

    Args:
        briefs_by_cluster: dict from generate_brand_briefs()
            e.g. {"personal-wash": [{"text": "...", "evidence": "..."}], ...}
    """
    if not briefs_by_cluster:
        logger.info("No briefs to save.")
        return

    history = load_history()
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    run_id = now.isoformat()
    cutoff = (now - timedelta(days=MAX_HISTORY_DAYS)).strftime("%Y-%m-%d")

    clusters = history.get("clusters", {})

    for slug, briefs_list in briefs_by_cluster.items():
        if slug not in clusters:
            clusters[slug] = []

        # Remove any existing entry for today (same-day replacement)
        clusters[slug] = [entry for entry in clusters[slug] if entry.get("date") != today_str]

        # Add today's entry
        clusters[slug].append({
            "date": today_str,
            "run_id": run_id,
            "briefs": briefs_list,
        })

        # Purge entries older than 30 days
        clusters[slug] = [entry for entry in clusters[slug] if entry.get("date", "") >= cutoff]

        # Sort by date descending (newest first)
        clusters[slug].sort(key=lambda x: x.get("date", ""), reverse=True)

    history["last_updated"] = run_id
    history["clusters"] = clusters

    try:
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)
        total_entries = sum(len(v) for v in clusters.values())
        logger.info(f"Brand briefs history saved: {total_entries} total entries across {len(clusters)} clusters")
    except IOError as e:
        logger.error(f"Failed to save history file: {e}")
