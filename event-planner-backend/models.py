from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import date, datetime


class EventFormRequest(BaseModel):
    eventType: Literal['wedding', 'birthday', 'anniversary', 'community', 'other']
    totalBudget: float = Field(..., gt=0, description="Total budget must be positive")
    currency: str = Field(default='INR', max_length=5)
    eventDate: str = Field(..., description="Event date in YYYY-MM-DD format")
    location: str = Field(..., min_length=1, max_length=200)
    guestCount: int = Field(..., ge=1, le=100000)
    theme: Optional[str] = Field(default=None, max_length=200)
    colorPalette: Optional[str] = Field(default=None, max_length=200)
    venueType: Optional[str] = Field(default=None)
    duration: Optional[str] = Field(default=None, max_length=100)
    dietaryPreferences: Optional[str] = Field(default=None, max_length=500)
    specialRequirements: Optional[str] = Field(default=None, max_length=1000)

    @field_validator('eventDate')
    @classmethod
    def validate_event_date(cls, v: str) -> str:
        try:
            event_date = datetime.strptime(v, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError('Invalid date format. Expected YYYY-MM-DD.')
        if event_date < date.today():
            raise ValueError('Event date cannot be in the past.')
        return v

    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: str) -> str:
        allowed = {'INR', 'USD', 'EUR', 'GBP', 'AED'}
        if v.upper() not in allowed:
            return 'INR'
        return v.upper()


class BudgetBreakdownItem(BaseModel):
    id: str
    category: str
    amount: float
    percentage: float
    notes: str


class TimelineTask(BaseModel):
    id: str
    task: str
    description: str
    targetDate: str
    daysBeforeEvent: int
    completed: bool = False
    status: str = 'upcoming'


class VendorItem(BaseModel):
    id: str
    name: str
    category: str
    notes: str
    completed: bool = False
    isCustom: bool = False


class ThemeSuggestion(BaseModel):
    name: str
    description: str
    colors: List[str]
    mood: str


class EventSummary(BaseModel):
    title: str
    overview: str


class EventFormData(BaseModel):
    eventType: str
    totalBudget: float
    currency: str
    eventDate: str
    location: str
    guestCount: int
    theme: Optional[str] = None
    colorPalette: Optional[str] = None
    venueType: Optional[str] = None
    duration: Optional[str] = None
    dietaryPreferences: Optional[str] = None
    specialRequirements: Optional[str] = None


class EventPlanResponse(BaseModel):
    formData: EventFormData
    eventSummary: EventSummary
    budgetBreakdown: List[BudgetBreakdownItem]
    preparationTimeline: List[TimelineTask]
    vendorChecklist: List[VendorItem]
    themeSuggestions: List[ThemeSuggestion]
    decorationIdeas: List[str]
    activitySuggestions: List[str]
    practicalTips: List[str]
