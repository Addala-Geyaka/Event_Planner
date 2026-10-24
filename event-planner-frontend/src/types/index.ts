export interface EventFormData {
  eventType: 'wedding' | 'birthday' | 'anniversary' | 'community' | 'other';
  totalBudget: number;
  currency: string;
  eventDate: string;
  location: string;
  guestCount: number;
  theme?: string;
  colorPalette?: string;
  venueType?: 'indoor' | 'outdoor' | 'both' | '';
  duration?: string;
  dietaryPreferences?: string;
  specialRequirements?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  percentage: number;
  notes: string;
}

export interface TimelineTask {
  id: string;
  task: string;
  description: string;
  targetDate: string;
  daysBeforeEvent: number;
  completed: boolean;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  notes: string;
  completed: boolean;
  isCustom?: boolean;
}

export interface ThemeSuggestion {
  name: string;
  description: string;
  colors: string[];
  mood: string;
}

export interface EventPlan {
  formData: EventFormData;
  eventSummary: {
    title: string;
    overview: string;
  };
  budgetBreakdown: BudgetItem[];
  preparationTimeline: TimelineTask[];
  vendorChecklist: VendorItem[];
  themeSuggestions: ThemeSuggestion[];
  decorationIdeas: string[];
  activitySuggestions: string[];
  practicalTips: string[];
}
