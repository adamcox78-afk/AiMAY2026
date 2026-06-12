import os
import httpx
from typing import Dict, List, Optional

META_BASE = "https://graph.facebook.com/v19.0"


class MetaTool:
    def __init__(self):
        self.access_token = os.getenv("META_ACCESS_TOKEN", "")
        self.ad_account_id = os.getenv("META_AD_ACCOUNT_ID", "")

    def _get(self, endpoint: str, params: dict = None) -> dict:
        if not self.access_token:
            return {"error": "Meta access token not configured."}
        p = params or {}
        p["access_token"] = self.access_token
        try:
            r = httpx.get(f"{META_BASE}/{endpoint}", params=p, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def _post(self, endpoint: str, data: dict = None) -> dict:
        if not self.access_token:
            return {"error": "Meta access token not configured."}
        d = data or {}
        d["access_token"] = self.access_token
        try:
            r = httpx.post(f"{META_BASE}/{endpoint}", json=d, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def get_campaigns(self, account_id: str = "") -> List[Dict]:
        aid = account_id or self.ad_account_id
        if not aid:
            return [{"error": "No Meta ad account ID configured."}]
        result = self._get(f"{aid}/campaigns", {
            "fields": "id,name,status,objective,daily_budget,lifetime_budget,created_time"
        })
        return result.get("data", []) if isinstance(result, dict) else []

    def get_ad_insights(self, campaign_id: str, date_range: str = "last_7d") -> Dict:
        date_presets = {
            "last_7d": "last_7_days",
            "last_30d": "last_30_days",
            "today": "today",
            "yesterday": "yesterday",
        }
        preset = date_presets.get(date_range, "last_7_days")
        result = self._get(f"{campaign_id}/insights", {
            "fields": "impressions,clicks,spend,reach,cpm,cpc,ctr",
            "date_preset": preset,
        })
        return result

    def create_campaign(self, name: str, objective: str, budget: float) -> Dict:
        aid = self.ad_account_id
        if not aid:
            return {"error": "No Meta ad account ID configured."}
        return self._post(f"{aid}/campaigns", {
            "name": name,
            "objective": objective,
            "daily_budget": int(budget * 100),
            "status": "PAUSED",
            "special_ad_categories": [],
        })

    def get_ad_account_info(self) -> Dict:
        aid = self.ad_account_id
        if not aid:
            return {"error": "No Meta ad account ID configured."}
        return self._get(aid, {"fields": "id,name,account_status,currency,amount_spent"})

    def is_connected(self) -> bool:
        if not self.access_token:
            return False
        result = self.get_ad_account_info()
        return "error" not in result
