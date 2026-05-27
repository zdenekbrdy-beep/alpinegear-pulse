"""Normalization and dedup helpers."""

from __future__ import annotations

import re
from typing import Iterable


_WS = re.compile(r"\s+")


def normalize_product(name: str) -> str:
    """Lowercase and collapse whitespace for matching keys."""
    return _WS.sub(" ", name.strip().lower())


def dedup_orders(rows: Iterable[dict]) -> list[dict]:
    """Keep the row with the latest timestamp per order_id."""
    by_id: dict[str, dict] = {}
    for row in rows:
        oid = row["order_id"]
        prev = by_id.get(oid)
        if prev is None or row["timestamp"] > prev["timestamp"]:
            by_id[oid] = row
    return list(by_id.values())
