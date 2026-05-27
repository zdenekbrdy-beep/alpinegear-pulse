"""Seed 60 days of synthetic order rows directly into the Orders sheet tab.

Writes rows in the same column shape the production sync expects:
    timestamp | order_id | customer | email | phone | city | items | total_czk | status

Usage (PowerShell):
    $env:GOOGLE_SA_KEY = Get-Content path\to\sa-key.json -Raw
    $env:SHEETS_ID = "your-sheet-id"
    python orders_seed.py
"""

from __future__ import annotations

import json
import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
RANGE = "Orders!A:I"

PRODUCTS = [
    ("Tent Alpine 2", 4500),
    ("Tent Summit 3", 6200),
    ("Tent Bivak Solo", 2800),
    ("Backpack Trek 45L", 2400),
    ("Backpack Summit 65L", 3600),
    ("Backpack Daypack 25L", 1400),
    ("Backpack Crag 35L", 1900),
    ("Sleeping Bag Alpine -10", 3200),
    ("Sleeping Bag Summer +5", 1500),
    ("Sleeping Pad Inflate", 1100),
    ("Cookware Set Titan", 1800),
    ("Cookware Stove Compact", 950),
]

CITIES = ["Praha", "Brno", "Ostrava", "Plzen", "Liberec", "Hradec Kralove", "Ceske Budejovice"]
FIRST_NAMES = ["Petr", "Jana", "Tomas", "Lucie", "Martin", "Eva", "Pavel", "Katerina", "David", "Anna"]
LAST_NAMES = ["Novak", "Svoboda", "Dvorak", "Cerny", "Prochazka", "Kucera", "Vesely", "Horak"]


def make_order_row(day: datetime) -> list:
    n_items = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
    picked = random.sample(PRODUCTS, n_items)
    items_text = ", ".join(p[0] for p in picked)
    total = sum(p[1] for p in picked)
    fn = random.choice(FIRST_NAMES)
    ln = random.choice(LAST_NAMES)
    hour = random.randint(8, 22)
    minute = random.randint(0, 59)
    ts = day.replace(hour=hour, minute=minute, second=0, microsecond=0, tzinfo=timezone.utc).isoformat()
    order_id = f"AG-{day.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    email = f"{fn.lower()}.{ln.lower()}@example.cz"
    phone = f"+420 {random.randint(600, 799)} {random.randint(100, 999)} {random.randint(100, 999)}"
    city = random.choice(CITIES)
    return [ts, order_id, f"{fn} {ln}", email, phone, city, items_text, str(total), "paid"]


def build_service():
    info = json.loads(os.environ["GOOGLE_SA_KEY"])
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def main() -> None:
    sheet_id = os.environ["SHEETS_ID"]
    svc = build_service()

    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=60)
    all_rows: list[list] = []
    for offset in range(60):
        day = start + timedelta(days=offset)
        base = 25 if day.weekday() >= 5 else 15
        n_orders = random.randint(max(8, base - 7), base + 5)
        for _ in range(n_orders):
            all_rows.append(make_order_row(day))
        print(f"{day.strftime('%Y-%m-%d')}: queued {n_orders} orders (total {len(all_rows)})")

    print(f"Appending {len(all_rows)} rows to {RANGE}...")
    svc.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=RANGE,
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": all_rows},
    ).execute()
    print("Done")


if __name__ == "__main__":
    main()
