"""One-time setup: rename default tab to 'Orders', add 'Ad Spend' tab, write headers, upload ad_spend_seed.csv."""

from __future__ import annotations

import csv
import json
import os
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

ORDERS_HEADER = ["timestamp", "order_id", "customer", "email", "phone", "city", "items", "total_czk", "status"]
AD_SPEND_HEADER = ["date", "campaign", "product", "spend_czk", "impressions", "clicks", "visual_hook", "intent_framing"]


def main() -> None:
    creds = service_account.Credentials.from_service_account_info(
        json.loads(os.environ["GOOGLE_SA_KEY"]), scopes=SCOPES
    )
    svc = build("sheets", "v4", credentials=creds, cache_discovery=False)
    sheet_id = os.environ["SHEETS_ID"]

    meta = svc.spreadsheets().get(spreadsheetId=sheet_id).execute()
    existing = {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta["sheets"]}
    print(f"Existing tabs: {list(existing.keys())}")

    requests = []
    if "Orders" not in existing:
        first_id = next(iter(existing.values()))
        requests.append({
            "updateSheetProperties": {
                "properties": {"sheetId": first_id, "title": "Orders"},
                "fields": "title",
            }
        })
        print(f"Will rename first tab (id={first_id}) to 'Orders'")

    if "Ad Spend" not in existing:
        requests.append({
            "addSheet": {"properties": {"title": "Ad Spend"}}
        })
        print("Will add 'Ad Spend' tab")

    if requests:
        svc.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": requests}).execute()
        print("Tab structure updated")

    # Write headers (overwrites first row)
    svc.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range="Orders!A1:I1",
        valueInputOption="RAW",
        body={"values": [ORDERS_HEADER]},
    ).execute()
    print("Wrote Orders header")

    svc.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range="Ad Spend!A1:H1",
        valueInputOption="RAW",
        body={"values": [AD_SPEND_HEADER]},
    ).execute()
    print("Wrote Ad Spend header")

    # Upload ad_spend_seed.csv (skip its own header since we just wrote one)
    csv_path = Path(__file__).resolve().parent / "ad_spend_seed.csv"
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)[1:]  # skip header
    svc.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range="Ad Spend!A:H",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": rows},
    ).execute()
    print(f"Appended {len(rows)} ad-spend rows")

    print("Setup complete")


if __name__ == "__main__":
    main()
