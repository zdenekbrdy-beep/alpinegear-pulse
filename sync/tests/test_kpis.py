from kpis import aggregate_by_product_day, totals_for_period, first_order_date_per_product


def test_aggregate_by_product_day_sums_revenue_and_spend():
    line_items = [
        {"date": "2026-05-01", "product_raw": "Tent Alpine 2",
         "product_normalized": "tent alpine 2", "revenue_czk": 4500.0,
         "matched_spend_czk": 1000.0, "visual_hook": "sunset", "intent_framing": "FOMO"},
        {"date": "2026-05-01", "product_raw": "Tent Alpine 2",
         "product_normalized": "tent alpine 2", "revenue_czk": 4500.0,
         "matched_spend_czk": 1000.0, "visual_hook": "sunset", "intent_framing": "FOMO"},
    ]
    agg = aggregate_by_product_day(line_items)
    assert len(agg) == 1
    row = agg[0]
    assert row["revenue_czk"] == 9000.0
    assert row["orders"] == 2
    assert row["spend_czk"] == 1000.0


def test_totals_for_period_computes_kpis():
    agg = [
        {"date": "2026-05-01", "product_normalized": "tent alpine 2",
         "revenue_czk": 9000.0, "orders": 2, "spend_czk": 1000.0},
        {"date": "2026-05-02", "product_normalized": "backpack trek 45l",
         "revenue_czk": 2400.0, "orders": 1, "spend_czk": 600.0},
    ]
    totals = totals_for_period(agg, "2026-05-01", "2026-05-02")
    assert totals["revenue"] == 11400.0
    assert totals["orders"] == 3
    assert totals["aov"] == 3800.0
    assert totals["ad_spend"] == 1600.0
    assert round(totals["roas"], 2) == 7.13
    assert round(totals["cac"], 2) == 533.33


def test_totals_for_period_handles_zero_spend():
    agg = [{"date": "2026-05-01", "product_normalized": "x",
            "revenue_czk": 100.0, "orders": 1, "spend_czk": 0.0}]
    totals = totals_for_period(agg, "2026-05-01", "2026-05-01")
    assert totals["roas"] == 0.0
    assert totals["cac"] == 0.0


def test_first_order_date_per_product_returns_earliest_date():
    line_items = [
        {"date": "2026-05-03", "product_normalized": "tent alpine 2"},
        {"date": "2026-05-01", "product_normalized": "tent alpine 2"},
        {"date": "2026-05-02", "product_normalized": "backpack trek 45l"},
    ]
    firsts = first_order_date_per_product(line_items)
    assert firsts["tent alpine 2"] == "2026-05-01"
    assert firsts["backpack trek 45l"] == "2026-05-02"
