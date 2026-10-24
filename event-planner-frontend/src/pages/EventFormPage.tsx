import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
  Clock,
  Palette,
  Utensils,
  Home,
  FileText,
} from 'lucide-react';
import { EventFormData, EventPlan } from '../types';
import { generateEventPlan, savePlan } from '../api/plannerApi';

const EVENT_TYPES = [
  { value: 'wedding', label: '💍 Wedding' },
  { value: 'birthday', label: '🎂 Birthday Party' },
  { value: 'anniversary', label: '💑 Anniversary' },
  { value: 'community', label: '🎉 Community Event' },
  { value: 'other', label: '✨ Other Celebration' },
];

const CURRENCIES = [
  { value: 'INR', label: '₹ INR (Indian Rupee)' },
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'AED', label: 'AED (UAE Dirham)' },
];

interface FormErrors {
  eventType?: string;
  totalBudget?: string;
  eventDate?: string;
  location?: string;
  guestCount?: string;
}

const initialForm: EventFormData = {
  eventType: 'birthday',
  totalBudget: 0,
  currency: 'INR',
  eventDate: '',
  location: '',
  guestCount: 0,
  theme: '',
  colorPalette: '',
  venueType: '',
  duration: '',
  dietaryPreferences: '',
  specialRequirements: '',
};

function localDateValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

const MIN_EVENT_DATE = localDateValue(new Date());

interface Props {
  onPlanGenerated: (plan: EventPlan, id: number) => void;
}

export default function EventFormPage({ onPlanGenerated }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<EventFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);


  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.eventType) newErrors.eventType = 'Please choose an event type.';
    if (!form.totalBudget || form.totalBudget <= 0)
      newErrors.totalBudget = 'Enter a valid total budget greater than 0.';
    if (!form.eventDate) {
      newErrors.eventDate = 'Please select your celebration date.';
    } else {
      const eventD = new Date(form.eventDate);
      const todayD = new Date();
      todayD.setHours(0, 0, 0, 0);
      if (eventD < todayD) newErrors.eventDate = 'Event date cannot be in the past.';
    }
    if (!form.location.trim()) newErrors.location = 'Please enter a location or city name.';
    if (!form.guestCount || form.guestCount < 1)
      newErrors.guestCount = 'Guest count must be at least 1.';
    if (form.guestCount > 100000)
      newErrors.guestCount = 'Please enter a realistic guest count (up to 100,000).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const plan = await generateEventPlan(form);
      const planId = await savePlan(plan);
      onPlanGenerated(plan, planId);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as {
        code?: string;
        message?: string;
        response?: { status?: number; data?: { detail?: string } };
      };
      if (
        axiosErr?.code === 'ECONNREFUSED' ||
        axiosErr?.message?.includes('Network') ||
        axiosErr?.message?.includes('connect')
      ) {
        setApiError(
          'Cannot connect to the backend server. Please verify the backend is running on port 8000.'
        );
      } else if (axiosErr?.response?.status === 429) {
        setApiError('AI quota rate limit reached. Please wait a brief moment and click Generate again.');
      } else if (axiosErr?.response?.status === 503) {
        setApiError('AI service is currently busy. Please wait a moment and try again.');
      } else {
        setApiError(
          axiosErr?.response?.data?.detail ||
            axiosErr?.message ||
            'Failed to generate plan. Please verify backend status and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(field: keyof EventFormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <div className="min-h-screen text-[#2D2640] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="pastel-btn-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#4A3B72]" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#533E85] to-[#885499] bg-clip-text text-transparent">
              CelebratAI
            </span>
          </div>
          <button onClick={() => navigate('/profile')} className="pastel-btn-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold">My Profile</button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#241E34] mb-2 tracking-tight">
            Tell Us About Your Celebration
          </h1>
          <p className="text-sm md:text-base text-[#615975]">
            Provide your event details below, and Gemini AI will curate your personalized plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Event Type Selection Card */}
          <div role="group" aria-labelledby="event-type-label" className="glass-panel rounded-3xl p-6 sm:p-7 animate-fade-in-up delay-100">
            <div className="block text-sm font-bold text-[#2D2640] mb-3">
              <span id="event-type-label" className="mb-3 flex items-center gap-1.5">
                Event Type
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD6E7]/60 text-[#8C284E] font-medium">
                  Required
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EVENT_TYPES.map(et => (
                <button
                  key={et.value}
                  type="button"
                  onClick={() => handleChange('eventType', et.value)}
                  aria-pressed={form.eventType === et.value}
                  className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    form.eventType === et.value
                      ? 'bg-gradient-to-r from-[#B8C0FF]/40 to-[#FFD6E7]/50 border-[#C8B6FF] text-[#302550] shadow-xs'
                      : 'bg-white/50 border-white/80 text-[#5F5774] hover:bg-white/80 hover:border-[#C8B6FF]/50'
                  }`}
                >
                  {et.label}
                </button>
              ))}
            </div>
            {errors.eventType && (
              <p className="text-xs text-[#B22D4E] mt-2.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.eventType}
              </p>
            )}
          </div>

          {/* Budget & Currency */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 animate-fade-in-up delay-150">
            <h2 className="text-sm font-bold text-[#2D2640] mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#B4F8C8]/40 flex items-center justify-center text-[#276E54]">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span>Budget Planning</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD6E7]/60 text-[#8C284E] font-medium">
                Required
              </span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="total-budget" className="block text-xs font-semibold text-[#534B68] mb-1.5">
                  Total Budget Amount
                </label>
                <input
                  id="total-budget"
                  type="number"
                  min="1"
                  required
                  aria-invalid={Boolean(errors.totalBudget)}
                  aria-describedby={errors.totalBudget ? 'total-budget-error' : undefined}
                  placeholder="e.g. 50000"
                  value={form.totalBudget || ''}
                  onChange={e => handleChange('totalBudget', parseFloat(e.target.value) || 0)}
                  className={`w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium ${
                    errors.totalBudget ? 'border-[#FF94B8] bg-[#FFF0F5]' : ''
                  }`}
                />
                {errors.totalBudget && (
                  <p id="total-budget-error" role="alert" className="text-xs text-[#B22D4E] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.totalBudget}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="block text-xs font-semibold text-[#534B68] mb-1.5">
                  Currency
                </label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-white text-[#2D2640]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Event Details: Date, Guests, Location */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 animate-fade-in-up delay-200">
            <h2 className="text-sm font-bold text-[#2D2640] mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#CDE7FF]/50 flex items-center justify-center text-[#2B5D7D]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span>Celebration Details</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD6E7]/60 text-[#8C284E] font-medium">
                Required
              </span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-date" className="block text-xs font-semibold text-[#534B68] mb-1.5">
                  Event Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  min={MIN_EVENT_DATE}
                  required
                  aria-invalid={Boolean(errors.eventDate)}
                  aria-describedby={errors.eventDate ? 'event-date-error' : undefined}
                  value={form.eventDate}
                  onChange={e => handleChange('eventDate', e.target.value)}
                  className={`w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium ${
                    errors.eventDate ? 'border-[#FF94B8] bg-[#FFF0F5]' : ''
                  }`}
                />
                {errors.eventDate && (
                  <p id="event-date-error" role="alert" className="text-xs text-[#B22D4E] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.eventDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="guest-count" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Expected Guests</span>
                </label>
                <input
                  id="guest-count"
                  type="number"
                  min="1"
                  required
                  aria-invalid={Boolean(errors.guestCount)}
                  aria-describedby={errors.guestCount ? 'guest-count-error' : undefined}
                  placeholder="e.g. 150"
                  value={form.guestCount || ''}
                  onChange={e => handleChange('guestCount', parseInt(e.target.value) || 0)}
                  className={`w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium ${
                    errors.guestCount ? 'border-[#FF94B8] bg-[#FFF0F5]' : ''
                  }`}
                />
                {errors.guestCount && (
                  <p id="guest-count-error" role="alert" className="text-xs text-[#B22D4E] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.guestCount}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="event-location" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Location or City</span>
                </label>
                <input
                  id="event-location"
                  type="text"
                  required
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'event-location-error' : undefined}
                  placeholder="e.g. Bangalore, Karnataka"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className={`w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium ${
                    errors.location ? 'border-[#FF94B8] bg-[#FFF0F5]' : ''
                  }`}
                />
                {errors.location && (
                  <p id="event-location-error" role="alert" className="text-xs text-[#B22D4E] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Preferences Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 animate-fade-in-up delay-250">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#2D2640] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#C8B6FF]/35 flex items-center justify-center text-[#5A3DA6]">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <span>Style & Preferences</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/70 text-[#6B6382] border border-white">
                Optional
              </span>
            </div>
            <p className="text-xs text-[#6F6785] mb-5">
              Feel free to leave these blank; Gemini will still generate inspiring ideas.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-theme" className="block text-xs font-semibold text-[#534B68] mb-1.5">
                  Preferred Theme or Aesthetic
                </label>
                <input
                  id="event-theme"
                  type="text"
                  placeholder="e.g. Pastel Garden, Boho-chic, Minimalist"
                  value={form.theme}
                  onChange={e => handleChange('theme', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="color-palette" className="block text-xs font-semibold text-[#534B68] mb-1.5">
                  Color Palette
                </label>
                <input
                  id="color-palette"
                  type="text"
                  placeholder="e.g. Lavender, blush pink, and cream"
                  value={form.colorPalette}
                  onChange={e => handleChange('colorPalette', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="venue-type" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Venue Type</span>
                </label>
                <select
                  id="venue-type"
                  value={form.venueType}
                  onChange={e => handleChange('venueType', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer"
                >
                  <option value="" className="bg-white text-[#2D2640]">No preference</option>
                  <option value="indoor" className="bg-white text-[#2D2640]">Indoor Banquet / Hall</option>
                  <option value="outdoor" className="bg-white text-[#2D2640]">Outdoor Lawn / Garden</option>
                  <option value="both" className="bg-white text-[#2D2640]">Both / Flexible</option>
                </select>
              </div>

              <div>
                <label htmlFor="event-duration" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Estimated Duration</span>
                </label>
                <input
                  id="event-duration"
                  type="text"
                  placeholder="e.g. 4 hours, Evening party, Full day"
                  value={form.duration}
                  onChange={e => handleChange('duration', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dietary-preferences" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Dietary Preferences / Restrictions</span>
                </label>
                <input
                  id="dietary-preferences"
                  type="text"
                  placeholder="e.g. Vegetarian, Jain options, Vegan, Nut-free"
                  value={form.dietaryPreferences}
                  onChange={e => handleChange('dietaryPreferences', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="special-requirements" className="block text-xs font-semibold text-[#534B68] mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#6D6582]" />
                  <span>Special Requirements or Wishes</span>
                </label>
                <textarea
                  id="special-requirements"
                  rows={3}
                  placeholder="e.g. Need acoustic music zone, photo-booth corner, wheelchair ramp access..."
                  value={form.specialRequirements}
                  onChange={e => handleChange('specialRequirements', e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* API Error Box */}
          {apiError && (
            <div role="alert" className="rounded-3xl p-5 bg-[#FFD6E7]/60 border border-[#FF94B8]/50 text-[#8C284E] flex items-start gap-3 shadow-sm animate-fade-in-up">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">Notice</p>
                <p className="mt-0.5 leading-relaxed">{apiError}</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full pastel-btn-primary py-4 px-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#302550]" />
                  <span>Gemini AI is crafting your bespoke plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#302550]" />
                  <span>Generate My Event Plan</span>
                </>
              )}
            </button>
            {isLoading && (
              <p className="text-center text-xs text-[#7A7292] mt-3 animate-pulse">
                Analyzing budgets, timeline, and themes... usually ready in ~10–20 seconds.
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
