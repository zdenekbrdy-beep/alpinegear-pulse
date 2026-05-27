from normalize import normalize_product, dedup_orders


def test_normalize_product_strips_and_lowercases():
    assert normalize_product("  Tent Alpine 2  ") == "tent alpine 2"


def test_normalize_product_collapses_whitespace():
    assert normalize_product("Tent  Alpine   2") == "tent alpine 2"


def test_dedup_orders_keeps_latest_by_order_id():
    rows = [
        {"order_id": "AG-1", "timestamp": "2026-05-01T10:00:00", "total_czk": 1000},
        {"order_id": "AG-1", "timestamp": "2026-05-01T11:00:00", "total_czk": 1000},
        {"order_id": "AG-2", "timestamp": "2026-05-01T10:00:00", "total_czk": 500},
    ]
    out = dedup_orders(rows)
    assert len(out) == 2
    ag1 = next(r for r in out if r["order_id"] == "AG-1")
    assert ag1["timestamp"] == "2026-05-01T11:00:00"


def test_dedup_orders_empty():
    assert dedup_orders([]) == []
