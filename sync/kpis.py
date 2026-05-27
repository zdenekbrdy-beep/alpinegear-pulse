"""KPI aggregation: per-(product, day) rollup and period totals."""

from __future__ import annotations

from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP


def _round2(x: float) -> float:
    """Round half-up to 2 decimal places (banker's rounding in stdlib round()
    would turn 7.125 into 7.12; tests expect 7.13)."""
    return float(Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def aggregate_by_product_day(line_items: list[dict]) -> list[dict]:
    """Sum revenue + count orders per (date, product). Spend kept as max per group
    to avoid double-counting (the same campaign spend appears once per ad-spend row,
    not per order)."""
    by_key: dict[tuple[str, str], dict] = {}
    for li in line_items:
        key = (li["date"], li["product_normalized"])
        bucket = by_key.setdefault(key, {
            "date": li["date"],
            "product_raw": li["product_raw"],
            "product_normalized": li["product_normalized"],
            "revenue_czk": 0.0,
            "orders": 0,
            "spend_czk": 0.0,
            "visual_hook": li["visual_hook"],
            "intent_framing": li["intent_framing"],
        })
        bucket["revenue_czk"] += li["revenue_czk"]
        bucket["orders"] += 1
        bucket["spend_czk"] = max(bucket["spend_czk"], li["matched_spend_czk"])
    return list(by_key.values())


def totals_for_period(agg: list[dict], date_from: str, date_to: str) -> dict:
    filtered = [r for r in agg if date_from <= r["date"] <= date_to]
    revenue = sum(r["revenue_czk"] for r in filtered)
    orders = sum(r["orders"] for r in filtered)
    spend = sum(r["spend_czk"] for r in filtered)
    aov = revenue / orders if orders else 0.0
    roas = revenue / spend if spend else 0.0
    cac = spend / orders if orders else 0.0
    return {
        "revenue": _round2(revenue),
        "orders": orders,
        "aov": _round2(aov),
        "ad_spend": _round2(spend),
        "roas": _round2(roas),
        "cac": _round2(cac),
    }


def first_order_date_per_product(line_items: list[dict]) -> dict[str, str]:
    firsts: dict[str, str] = {}
    for li in line_items:
        p = li["product_normalized"]
        if p not in firsts or li["date"] < firsts[p]:
            firsts[p] = li["date"]
    return firsts
