import os
import json
import uuid
import re
import logging
from datetime import datetime, date, timedelta
from typing import Any, Dict

from models import EventFormRequest, EventPlanResponse, EventFormData

logger = logging.getLogger(__name__)


def _get_currency_label(currency: str) -> str:
    labels = {'INR': '₹ INR', 'USD': '$ USD', 'EUR': '€ EUR', 'GBP': '£ GBP', 'AED': 'AED'}
    return labels.get(currency, currency)


def _build_prompt(req: EventFormRequest) -> str:
    event_date = datetime.strptime(req.eventDate, '%Y-%m-%d').date()
    days_until = (event_date - date.today()).days
    currency_label = _get_currency_label(req.currency)

    optional_parts = []
    if req.theme:
        optional_parts.append(f"- Preferred theme/style: {req.theme}")
    if req.colorPalette:
        optional_parts.append(f"- Color palette: {req.colorPalette}")
    if req.venueType:
        optional_parts.append(f"- Venue type preference: {req.venueType}")
    if req.duration:
        optional_parts.append(f"- Event duration: {req.duration}")
    if req.dietaryPreferences:
        optional_parts.append(f"- Dietary preferences/restrictions: {req.dietaryPreferences}")
    if req.specialRequirements:
        optional_parts.append(f"- Special requirements: {req.specialRequirements}")

    optional_section = "\n".join(optional_parts) if optional_parts else "- No additional preferences specified"

    return f"""You are an expert event planner AI. Generate a complete, personalized event plan for the following event.

## Event Details
- Event type: {req.eventType}
- Location: {req.location}
- Event date: {req.eventDate} ({days_until} days from today)
- Expected guests: {req.guestCount}
- Total budget: {req.totalBudget:,.0f} {currency_label}

## User Preferences
{optional_section}

## Instructions
Generate a realistic, detailed, and personalized event plan. Adapt all recommendations to the specific event type, budget scale, guest count, and location. The budget breakdown amounts MUST sum to exactly {req.totalBudget:.0f} (the total budget). Do NOT exceed the budget.

For the preparation timeline:
- Generate tasks from today ({date.today().isoformat()}) to the event date ({req.eventDate})
- If the event is less than 7 days away, generate a short but realistic urgent timeline
- If more than 30 days away, include long-term planning tasks
- Target dates must be between today and the event date (inclusive)
- Each task must have a unique ID, a target_date in YYYY-MM-DD format, and days_before_event (days before the event date)

Return ONLY valid JSON in this exact schema (no markdown, no code blocks, no extra text):

{{
  "event_summary": {{
    "title": "string - creative event title",
    "overview": "string - 2-3 sentence personalized overview"
  }},
  "budget_breakdown": [
    {{
      "id": "unique string id",
      "category": "string",
      "amount": number,
      "percentage": number,
      "notes": "string - brief note about this category"
    }}
  ],
  "preparation_timeline": [
    {{
      "id": "unique string id",
      "task": "string - task name",
      "description": "string - what to do",
      "target_date": "YYYY-MM-DD",
      "days_before_event": number,
      "completed": false,
      "status": "upcoming"
    }}
  ],
  "vendor_checklist": [
    {{
      "id": "unique string id",
      "name": "string - vendor/service type",
      "category": "string",
      "notes": "string - brief guidance",
      "completed": false
    }}
  ],
  "theme_suggestions": [
    {{
      "name": "string",
      "description": "string",
      "colors": ["color1", "color2", "color3"],
      "mood": "string"
    }}
  ],
  "decoration_ideas": ["string", "string", ...],
  "activity_suggestions": ["string", "string", ...],
  "practical_tips": ["string", "string", ...]
}}

Guidelines:
- budget_breakdown amounts must sum exactly to {req.totalBudget:.0f}
- Include 6-10 budget categories relevant to the event type
- Include 5-10 timeline tasks in chronological order
- Include 5-8 vendor checklist items relevant to this event type only
- Include 2-3 theme suggestions
- Include 5-8 decoration ideas
- Include 4-6 activity suggestions
- Include 4-6 practical tips
- All recommendations should reflect the budget level ({req.totalBudget:,.0f} {currency_label}) and scale ({req.guestCount} guests)
- Do NOT suggest real specific vendor companies or claim real availability/prices
- Keep suggestions practical and culturally relevant to {req.location}
"""


def _extract_json(text: str) -> str:
    """Extract JSON from text that might have extra content."""
    text = text.strip()
    # Try to find JSON block
    if text.startswith('{'):
        return text
    # Look for ```json ... ```
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        return match.group(1)
    # Find first { to last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text


def _fix_budget_rounding(breakdown: list, total_budget: float) -> list:
    """Ensure budget items sum exactly to total_budget."""
    if not breakdown:
        return breakdown
    
    total = sum(item.get('amount', 0) for item in breakdown)
    if total == 0:
        return breakdown
    
    # Scale amounts to match total budget exactly
    scale = total_budget / total
    new_breakdown = []
    running_total = 0.0
    
    for i, item in enumerate(breakdown):
        if i == len(breakdown) - 1:
            # Last item gets the remainder to avoid rounding errors
            amount = round(total_budget - running_total)
        else:
            amount = round(item.get('amount', 0) * scale)
        
        running_total += amount
        pct = round((amount / total_budget * 100), 1) if total_budget > 0 else 0
        new_breakdown.append({**item, 'amount': amount, 'percentage': pct})
    
    return new_breakdown


def _parse_and_validate(raw_text: str, req: EventFormRequest, event_date_str: str) -> Dict[str, Any]:
    """Parse AI response and validate/fix the structure."""
    json_str = _extract_json(raw_text)
    data = json.loads(json_str)
    
    # Ensure IDs are present and unique
    for key in ['budget_breakdown', 'preparation_timeline', 'vendor_checklist']:
        for item in data.get(key, []):
            if not item.get('id'):
                item['id'] = str(uuid.uuid4())
    
    # Fix budget rounding
    if 'budget_breakdown' in data:
        data['budget_breakdown'] = _fix_budget_rounding(data['budget_breakdown'], req.totalBudget)
    
    # Validate and fix timeline dates
    today = date.today()
    event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
    
    for task in data.get('preparation_timeline', []):
        raw_target = task.get('targetDate') or task.get('target_date') or event_date_str
        try:
            td = datetime.strptime(str(raw_target), '%Y-%m-%d').date()
            if td > event_date:
                td = event_date
            if td < today:
                td = today
        except (KeyError, ValueError):
            td = today
        
        target_str = td.isoformat()
        days_before = (event_date - td).days

        task['targetDate'] = target_str
        task['daysBeforeEvent'] = days_before
        task['target_date'] = target_str
        task['days_before_event'] = days_before
        task.setdefault('completed', False)
        task.setdefault('status', 'upcoming')
    
    # Fix vendor checklist
    for vendor in data.get('vendor_checklist', []):
        vendor.setdefault('completed', False)
        vendor.setdefault('notes', '')
        vendor.setdefault('isCustom', False)
    
    return data


def generate_event_plan(req: EventFormRequest) -> EventPlanResponse:
    """Call Gemini API and return structured event plan."""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    from google import genai
    from google.genai import types
    
    client = genai.Client(api_key=api_key)
    candidate_models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash']
    
    prompt = _build_prompt(req)
    generation_config = types.GenerateContentConfig(
        temperature=0.7,
        max_output_tokens=4096,
        response_mime_type="application/json",
    )
    
    last_error = None
    for model_name in candidate_models:
        try:
            logger.info(f"Trying Gemini model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=generation_config,
            )
            raw_text = response.text
            logger.info(f"AI response received from {model_name}, length: {len(raw_text)}")
            
            data = _parse_and_validate(raw_text, req, req.eventDate)
            
            form_data = EventFormData(
                eventType=req.eventType,
                totalBudget=req.totalBudget,
                currency=req.currency,
                eventDate=req.eventDate,
                location=req.location,
                guestCount=req.guestCount,
                theme=req.theme,
                colorPalette=req.colorPalette,
                venueType=req.venueType,
                duration=req.duration,
                dietaryPreferences=req.dietaryPreferences,
                specialRequirements=req.specialRequirements,
            )
            
            return EventPlanResponse(
                formData=form_data,
                eventSummary=data.get('eventSummary') or data.get('event_summary', {'title': 'Event Plan', 'overview': ''}),
                budgetBreakdown=data.get('budgetBreakdown') or data.get('budget_breakdown', []),
                preparationTimeline=data.get('preparationTimeline') or data.get('preparation_timeline', []),
                vendorChecklist=data.get('vendorChecklist') or data.get('vendor_checklist', []),
                themeSuggestions=data.get('themeSuggestions') or data.get('theme_suggestions', []),
                decorationIdeas=data.get('decorationIdeas') or data.get('decoration_ideas', []),
                activitySuggestions=data.get('activitySuggestions') or data.get('activity_suggestions', []),
                practicalTips=data.get('practicalTips') or data.get('practical_tips', []),
            )
        except Exception as e:
            last_error = str(e)
            logger.warning(f"Model {model_name} failed: {e}")
            continue

    raise ValueError(last_error or "Failed to generate plan across available models.")
