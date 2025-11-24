import json
import os
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MOCK_DATA_PATH = os.path.join(DATA_DIR, "mock_data.json")
CONFIG_PATH = os.path.join(DATA_DIR, "customer_config.json")

class DataManager:
    def __init__(self):
        self.emails = self._load_json(MOCK_DATA_PATH)
        self.customer_config = self._load_json(CONFIG_PATH)

    def _load_json(self, path: str) -> Any:
        if not os.path.exists(path):
            return [] if "mock_data" in path else {}
        with open(path, "r") as f:
            return json.load(f)

    def get_emails(self, customer_id: str = None) -> List[Dict]:
        if customer_id:
            return [e for e in self.emails if e["customer_id"] == customer_id]
        return self.emails

    def get_customers(self) -> List[str]:
        return list(self.customer_config.keys())

    def get_valid_tags(self, customer_id: str) -> List[str]:
        return self.customer_config.get(customer_id, [])

    def get_email_by_id(self, email_id: str) -> Dict:
        for email in self.emails:
            if email["id"] == email_id:
                return email
        return None
