"""Build the final dashboard snapshot.json shape."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PRODUCT_TO_CATEGORY = {
    "tent alpine 2": "Tents",
    "tent summit 3": "Tents",
    "tent bivak solo": "Tents",
    "backpack trek 45l": "Backpacks",
    "backpack summit 65l": "Backpacks",
    "backpack daypack 25l": "Backpacks",
    "backpack crag 35l": "Backpacks",
    "sleeping bag alpine -10": "Sleeping",
    "sleeping bag summer +5": "Sleeping",
    "sleeping pad inflate": "Sleeping",
    "cookware set titan": "Cookware",
    "cookware stove compact": "Cookware",
}


def build_snapshot(
    agg_by_product_day: list[dict],
    first_order_dates: dict[str, str],
    unmatched_ad_spend: list[dict],
) -> dict[str, Any]:
    products = sorted({r["product_normalized"] for r in agg_by_product_day})
    product_meta = [
        {
            "product_normalized": p,
            "product_display": next((r["product_raw"] for r in agg_by_product_day
                                     if r["product_normalized"] == p), p),
            "category": PRODUCT_TO_CATEGORY.get(p, "Other"),
            "first_order_date": first_order_dates.get(p),
        }
        for p in products
    ]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "products": product_meta,
        "daily": agg_by_product_day,
        "unmatched_ad_spend": unmatched_ad_spend,
    }


def write_snapshot(snapshot: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False), encoding="utf-8")
