import os
import httpx
from typing import Dict, Optional

REVENUECAT_BASE = "https://api.revenuecat.com/v1"


class RevenueCatTool:
    def __init__(self):
        self.api_key = os.getenv("REVENUECAT_API_KEY", "")

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Platform": "stripe",
        }

    def _get(self, endpoint: str, params: dict = None) -> dict:
        if not self.api_key:
            return {"error": "RevenueCat API key not configured."}
        try:
            r = httpx.get(
                f"{REVENUECAT_BASE}/{endpoint}",
                headers=self._headers(),
                params=params or {},
                timeout=15,
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def get_overview(self) -> Dict:
        """Get revenue overview metrics."""
        result = self._get("overview")
        return result

    def get_subscriber(self, app_user_id: str) -> Dict:
        """Get a specific subscriber's details."""
        return self._get(f"subscribers/{app_user_id}")

    def get_offering(self, offering_identifier: str = "default") -> Dict:
        """Get offering details."""
        return self._get(f"offerings/{offering_identifier}")

    def is_connected(self) -> bool:
        if not self.api_key:
            return False
        result = self.get_overview()
        return "error" not in result
