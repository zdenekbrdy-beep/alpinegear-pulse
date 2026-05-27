"""Google Sheets read client using a service account."""

from __future__ import annotations

import json
import os
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def _build_service() -> Any:
    key_json = os.environ["GOOGLE_SA_KEY"]
    info = json.loads(key_json)
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _rows(values: list[list[str]]) -> list[dict]:
    """Convert a 2D array (first row = header) into a list of dicts."""
    if not values:
        return []
    header = [h.strip() for h in values[0]]
    return [dict(zip(header, [c.strip() for c in row + [""] * (len(header) - len(row))])) for row in values[1:]]


def fetch_orders(sheet_id: str) -> list[dict]:
    svc = _build_service()
    res = svc.spreadsheets().values().get(spreadsheetId=sheet_id, range="Orders!A1:I").execute()
    return _rows(res.get("values", []))


def fetch_ad_spend(sheet_id: str) -> list[dict]:
    svc = _build_service()
    res = svc.spreadsheets().values().get(spreadsheetId=sheet_id, range="Ad Spend!A1:H").execute()
    return _rows(res.get("values", []))
