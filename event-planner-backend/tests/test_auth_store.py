import json
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

import auth_store
from ai_service import _extract_json, _fix_budget_rounding
from models import EventFormRequest


class BackendQualityTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1])
        self.original_database_url = auth_store.DATABASE_URL
        self.original_db_path = auth_store.DB_PATH
        auth_store.DATABASE_URL = None
        auth_store.DB_PATH = Path(self.temp_dir.name) / "celebratai-test.db"
        auth_store.initialize()

    def tearDown(self):
        auth_store.DATABASE_URL = self.original_database_url
        auth_store.DB_PATH = self.original_db_path
        self.temp_dir.cleanup()

    def test_registration_normalizes_email_rejects_duplicate_and_revokes_session(self):
        account = auth_store.register("  Sam Lee  ", "Sam@Example.com", "a-safe-password")

        self.assertEqual(account["user"]["name"], "Sam Lee")
        self.assertEqual(account["user"]["email"], "sam@example.com")
        self.assertEqual(auth_store.user_for_token(account["token"])["id"], account["user"]["id"])
        self.assertIsNone(auth_store.register("Sam", "SAM@example.com", "another-password"))
        self.assertEqual(auth_store.login("SAM@example.com", "a-safe-password")["user"], account["user"])
        self.assertIsNone(auth_store.login("sam@example.com", "wrong-password"))

        auth_store.delete_session(account["token"])
        self.assertIsNone(auth_store.user_for_token(account["token"]))

    def test_saved_plans_are_owned_and_support_update_and_delete(self):
        owner = auth_store.register("Owner", "owner@example.com", "owner-password")
        other = auth_store.register("Other", "other@example.com", "other-password")
        original = json.dumps({"title": "Birthday"})
        updated = json.dumps({"title": "Updated birthday"})

        plan_id = auth_store.create_plan(owner["user"]["id"], original)
        self.assertEqual(len(auth_store.list_plans(owner["user"]["id"])), 1)
        self.assertFalse(auth_store.update_plan(other["user"]["id"], plan_id, updated))
        self.assertFalse(auth_store.delete_plan(other["user"]["id"], plan_id))
        self.assertTrue(auth_store.update_plan(owner["user"]["id"], plan_id, updated))
        self.assertEqual(
            json.loads(auth_store.list_plans(owner["user"]["id"])[0]["plan_json"]),
            {"title": "Updated birthday"},
        )
        self.assertTrue(auth_store.delete_plan(owner["user"]["id"], plan_id))
        self.assertEqual(auth_store.list_plans(owner["user"]["id"]), [])

    def test_event_request_rejects_past_dates(self):
        with self.assertRaisesRegex(ValueError, "past"):
            EventFormRequest(
                eventType="birthday",
                totalBudget=1000,
                currency="INR",
                eventDate=(date.today() - timedelta(days=1)).isoformat(),
                location="Pune",
                guestCount=10,
            )

    def test_budget_rounding_preserves_total(self):
        items = [
            {"id": "venue", "category": "Venue", "amount": 333, "percentage": 33.3, "notes": ""},
            {"id": "food", "category": "Food", "amount": 333, "percentage": 33.3, "notes": ""},
            {"id": "other", "category": "Other", "amount": 334, "percentage": 33.4, "notes": ""},
        ]

        result = _fix_budget_rounding(items, 10_000)

        self.assertEqual(sum(item["amount"] for item in result), 10_000)
        self.assertAlmostEqual(sum(item["percentage"] for item in result), 100, delta=0.2)

    def test_extract_json_handles_markdown_and_surrounding_text(self):
        expected = '{"ready": true}'

        self.assertEqual(_extract_json(f"```json\n{expected}\n```"), expected)
        self.assertEqual(_extract_json(f"Result: {expected} Thanks"), expected)


if __name__ == "__main__":
    unittest.main()

