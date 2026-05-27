from matcher import explode_orders_to_line_items, match_ad_spend, find_unmatched_ad_spend


def test_explode_orders_to_line_items_one_per_product():
    orders = [
        {
            "order_id": "AG-1",
            "timestamp": "2026-05-01T10:00:00",
            "items": "Tent Alpine 2, Backpack Trek 45L",
            "total_czk": "6900",
        }
    ]
    line_items = explode_orders_to_line_items(orders)
    assert len(line_items) == 2
    products = {li["product_normalized"] for li in line_items}
    assert products == {"tent alpine 2", "backpack trek 45l"}


def test_match_ad_spend_attaches_visual_hook_by_date_and_product():
    orders = [{"order_id": "AG-1", "timestamp": "2026-05-01T10:00:00",
               "items": "Tent Alpine 2", "total_czk": "4500"}]
    ad_spend = [{"date": "2026-05-01", "campaign": "Spring Tents Push",
                 "product": "Tent Alpine 2", "spend_czk": "1000",
                 "impressions": "100000", "clicks": "1500",
                 "visual_hook": "sunset", "intent_framing": "FOMO"}]
    enriched = match_ad_spend(explode_orders_to_line_items(orders), ad_spend)
    assert enriched[0]["visual_hook"] == "sunset"


def test_find_unmatched_ad_spend_returns_rows_with_no_orders_match():
    line_items = [{"date": "2026-05-01", "product_normalized": "tent alpine 2"}]
    ad_spend = [
        {"date": "2026-05-01", "product": "Tent Alpine 2"},
        {"date": "2026-05-01", "product": "Tent UNRELEASED PROTO"},
    ]
    unmatched = find_unmatched_ad_spend(line_items, ad_spend)
    assert len(unmatched) == 1
    assert unmatched[0]["product"] == "Tent UNRELEASED PROTO"
