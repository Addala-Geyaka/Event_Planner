"""
Basic tests for the CelebratAI backend.
Run with: python test_backend.py
"""
import asyncio
import sys
import os
from datetime import date, timedelta

# Test budget utilities inline (no external deps needed)
def test_budget_rounding():
    """Test that budget fixing logic works correctly."""
    from ai_service import _fix_budget_rounding
    
    items = [
        {'id': '1', 'category': 'Venue', 'amount': 30000, 'percentage': 30, 'notes': ''},
        {'id': '2', 'category': 'Food', 'amount': 25000, 'percentage': 25, 'notes': ''},
        {'id': '3', 'category': 'Misc', 'amount': 10000, 'percentage': 10, 'notes': ''},
    ]
    total_budget = 100000
    result = _fix_budget_rounding(items, total_budget)
    total = sum(item['amount'] for item in result)
    assert total == total_budget, f"Expected {total_budget}, got {total}"
    print("[PASS] test_budget_rounding passed")

def test_input_validation():
    """Test Pydantic model validation."""
    from models import EventFormRequest
    from pydantic import ValidationError

    # Valid request
    future_date = (date.today() + timedelta(days=30)).isoformat()
    try:
        req = EventFormRequest(
            eventType='birthday',
            totalBudget=50000,
            currency='INR',
            eventDate=future_date,
            location='Mumbai',
            guestCount=50,
        )
        print(f"[PASS] test_input_validation (valid) passed: {req.eventType}")
    except Exception as e:
        print(f"[FAIL] test_input_validation (valid) FAILED: {e}")
        sys.exit(1)

    # Invalid: past date
    try:
        req2 = EventFormRequest(
            eventType='birthday',
            totalBudget=50000,
            currency='INR',
            eventDate='2020-01-01',
            location='Mumbai',
            guestCount=50,
        )
        print("[FAIL] test_input_validation (past date) FAILED: should have raised")
        sys.exit(1)
    except ValidationError:
        print("[PASS] test_input_validation (past date rejection) passed")

    # Invalid: zero budget
    try:
        req3 = EventFormRequest(
            eventType='wedding',
            totalBudget=0,
            currency='INR',
            eventDate=future_date,
            location='Delhi',
            guestCount=100,
        )
        print("[FAIL] test_input_validation (zero budget) FAILED: should have raised")
        sys.exit(1)
    except ValidationError:
        print("[PASS] test_input_validation (zero budget rejection) passed")

    # Invalid: negative guest count
    try:
        req4 = EventFormRequest(
            eventType='wedding',
            totalBudget=100000,
            currency='INR',
            eventDate=future_date,
            location='Delhi',
            guestCount=-5,
        )
        print("[FAIL] test_input_validation (negative guests) FAILED: should have raised")
        sys.exit(1)
    except ValidationError:
        print("[PASS] test_input_validation (negative guests rejection) passed")

def test_json_extraction():
    """Test JSON extraction from AI responses."""
    from ai_service import _extract_json
    
    # Clean JSON
    clean = '{"key": "value"}'
    assert _extract_json(clean) == clean
    print("[PASS] test_json_extraction (clean) passed")
    
    # JSON in markdown block
    md = '```json\n{"key": "value"}\n```'
    result = _extract_json(md)
    assert '"key"' in result
    print("[PASS] test_json_extraction (markdown) passed")
    
    # JSON with surrounding text
    surrounded = 'Here is the JSON: {"key": "value"} done.'
    result = _extract_json(surrounded)
    assert '"key"' in result
    print("[PASS] test_json_extraction (surrounded) passed")

def test_date_validation():
    """Test date validation edge cases."""
    from models import EventFormRequest
    from pydantic import ValidationError
    
    future_date = (date.today() + timedelta(days=1)).isoformat()
    
    # Tomorrow should be valid
    try:
        req = EventFormRequest(
            eventType='birthday',
            totalBudget=10000,
            currency='INR',
            eventDate=future_date,
            location='Test City',
            guestCount=10,
        )
        print("[PASS] test_date_validation (tomorrow is valid) passed")
    except ValidationError as e:
        print(f"[FAIL] test_date_validation FAILED: {e}")
        sys.exit(1)

def run_all_tests():
    print("\n" + "="*50)
    print("CelebratAI Backend Tests")
    print("="*50 + "\n")
    
    tests = [
        test_budget_rounding,
        test_input_validation,
        test_json_extraction,
        test_date_validation,
    ]
    
    for test in tests:
        try:
            test()
        except SystemExit:
            raise
        except Exception as e:
            print(f"[FAIL] {test.__name__} ERROR: {e}")
            sys.exit(1)
    
    print("\n" + "="*50)
    print("[PASS] All tests passed!")
    print("="*50 + "\n")

if __name__ == "__main__":
    run_all_tests()
