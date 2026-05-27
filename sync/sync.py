"""Sync entry point: pulls sheets, processes, writes snapshot.json."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sheets_client import fetch_orders, fetch_ad_spend
from normalize import dedup_orders
from matcher import explode_orders_to_line_items, match_ad_spend, find_unmatched_ad_spend
from kpis import aggregate_by_product_day, first_order_date_per_product
from snapshot import build_snapshot, write_snapshot

SNAPSHOT_PATH = Path(__file__).resolve().parent.parent / "data" / "snapshot.json"


def main() -> int:
    sheet_id = os.environ["SHEETS_ID"]
    print(f"Fetching from sheet {sheet_id}...")
    orders_raw = fetch_orders(sheet_id)
    ad_spend = fetch_ad_spend(sheet_id)
    print(f"Pulled {len(orders_raw)} order rows, {len(ad_spend)} ad-spend rows")

    orders = dedup_orders(orders_raw)
    print(f"After dedup: {len(orders)} orders")

    line_items = explode_orders_to_line_items(orders)
    enriched = match_ad_spend(line_items, ad_spend)
    print(f"Exploded into {len(enriched)} line items")

    agg = aggregate_by_product_day(enriched)
    firsts = first_order_date_per_product(enriched)
    unmatched = find_unmatched_ad_spend(line_items, ad_spend)
    print(f"Aggregated {len(agg)} (product, day) rows, {len(unmatched)} unmatched ad-spend rows")

    snap = build_snapshot(agg, firsts, unmatched)
    write_snapshot(snap, SNAPSHOT_PATH)
    print(f"Wrote {SNAPSHOT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
