import os
import httpx
from typing import List, Dict, Optional

BUFFER_BASE = "https://api.bufferapp.com/1"


class BufferTool:
    def __init__(self):
        self.token = os.getenv("BUFFER_ACCESS_TOKEN", "")

    def _get(self, endpoint: str, params: dict = None) -> dict:
        if not self.token:
            return {"error": "Buffer access token not configured."}
        p = params or {}
        p["access_token"] = self.token
        try:
            r = httpx.get(f"{BUFFER_BASE}/{endpoint}.json", params=p, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def _post(self, endpoint: str, data: dict = None) -> dict:
        if not self.token:
            return {"error": "Buffer access token not configured."}
        d = data or {}
        d["access_token"] = self.token
        try:
            r = httpx.post(f"{BUFFER_BASE}/{endpoint}.json", data=d, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def get_profiles(self) -> List[Dict]:
        result = self._get("profiles")
        if isinstance(result, list):
            return [
                {
                    "id": p.get("id"),
                    "service": p.get("service"),
                    "service_username": p.get("service_username"),
                    "formatted_username": p.get("formatted_username"),
                    "statistics": p.get("statistics", {}),
                }
                for p in result
            ]
        return result if isinstance(result, dict) else []

    def get_analytics(self, profile_id: str, period: str = "week") -> Dict:
        result = self._get(f"profiles/{profile_id}/analytics/daily")
        return result

    def get_pending_posts(self, profile_id: str) -> List[Dict]:
        result = self._get(f"profiles/{profile_id}/updates/pending")
        if isinstance(result, dict):
            return result.get("updates", [])
        return []

    def create_post(self, profile_ids: List[str], text: str, scheduled_at: Optional[str] = None) -> Dict:
        data = {
            "text": text,
        }
        for i, pid in enumerate(profile_ids):
            data[f"profile_ids[{i}]"] = pid
        if scheduled_at:
            data["scheduled_at"] = scheduled_at
        return self._post("updates/create", data)

    def is_connected(self) -> bool:
        if not self.token:
            return False
        result = self._get("profiles")
        return not (isinstance(result, dict) and "error" in result)
