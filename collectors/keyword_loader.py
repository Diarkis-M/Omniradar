"""
Keyword Loader for Omniradar collectors.

Loads filter keywords from omniradar_keywords.json (project root) and provides
helper functions to retrieve flattened keyword lists for collector filtering.

The JSON is loaded once at module import time and cached.
"""
import json
import os
import logging

logger = logging.getLogger(__name__)

# Resolve path: this file lives in collectors/, JSON is one level up in project root
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_JSON_PATH = os.path.join(_PROJECT_ROOT, "omniradar_keywords.json")

# Load once at module level
_keywords_data = {}
try:
    with open(_JSON_PATH, "r", encoding="utf-8") as f:
        _keywords_data = json.load(f)
    logger.info(f"Loaded keywords from {_JSON_PATH}")
except FileNotFoundError:
    logger.error(f"Keywords file not found: {_JSON_PATH}")
except json.JSONDecodeError as e:
    logger.error(f"Invalid JSON in keywords file: {e}")


def _flatten_nested(d):
    """Flatten a dict of lists into a single list."""
    flat = []
    for values in d.values():
        if isinstance(values, list):
            flat.extend(values)
    return flat


def get_product_keywords():
    """Return flat list of all product keywords (across all sub-categories)."""
    product = _keywords_data.get("product_keywords", {})
    return _flatten_nested(product)


def get_brand_keywords():
    """Return flat list of all brand keywords (across all sub-categories)."""
    brand = _keywords_data.get("brand_keywords", {})
    return _flatten_nested(brand)


def get_industry_keywords():
    """Return list of industry/FMCG keywords."""
    return list(_keywords_data.get("industry_keywords", []))


def get_social_trend_keywords():
    """Return list of social media trend keywords."""
    return list(_keywords_data.get("social_trend_keywords", []))


def get_all_filter_keywords():
    """Return flat list of ALL keywords (product + brand + industry + social)."""
    return (
        get_product_keywords()
        + get_brand_keywords()
        + get_industry_keywords()
        + get_social_trend_keywords()
    )
