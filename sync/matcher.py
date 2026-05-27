"""Match orders to ad spend by (date, product)."""

from __future__ import annotations

from normalize import normalize_product


def explode_orders_to_line_items(orders: list[dict]) -> list[dict]:
    """One row per product in an order. Total revenue split equally across line items."""
    line_items: list[dict] = []
    for order in orders:
        items = [i.strip() for i in order["items"].split(",") if i.strip()]
        if not items:
            continue
        total = float(order["total_czk"])
        per_item = total / len(items)
        date = order["timestamp"][:10]
        for product in items:
            line_items.append({
                "order_id": order["order_id"],
                "date": date,
                "product_raw": product,
                "product_normalized": normalize_product(product),
                "revenue_czk": per_item,
            })
    return line_items


def match_ad_spend(line_items: list[dict], ad_spend: list[dict]) -> list[dict]:
    """Attach visual_hook + intent_framing + spend share to each line item."""
    index: dict[tuple[str, str], dict] = {}
    for row in ad_spend:
        key = (row["date"], normalize_product(row["product"]))
        index[key] = row
    out: list[dict] = []
    for li in line_items:
        key = (li["date"], li["product_normalized"])
        match = index.get(key)
        enriched = dict(li)
        if match:
            enriched["visual_hook"] = match.get("visual_hook", "")
            enriched["intent_framing"] = match.get("intent_framing", "")
            enriched["matched_spend_czk"] = float(match.get("spend_czk", 0) or 0)
        else:
            enriched["visual_hook"] = ""
            enriched["intent_framing"] = ""
            enriched["matched_spend_czk"] = 0.0
        out.append(enriched)
    return out


def find_unmatched_ad_spend(line_items: list[dict], ad_spend: list[dict]) -> list[dict]:
    """Ad-spend rows whose (date, product) has zero matching line items."""
    seen: set[tuple[str, str]] = {(li["date"], li["product_normalized"]) for li in line_items}
    return [row for row in ad_spend if (row["date"], normalize_product(row["product"])) not in seen]
