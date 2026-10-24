import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventPlan, BudgetItem, TimelineTask, VendorItem } from '../types';
import { SavedPlan } from '../api/plannerApi';
import { formatCurrency } from '../utils/budgetUtils';
import { formatDate, getDaysUntilEvent, getTimelineStatus } from '../utils/dateUtils';
import BudgetTab from '../components/BudgetTab';
import TimelineTab from '../components/TimelineTab';
import VendorTab from '../components/VendorTab';
import ThemesTab from '../components/ThemesTab';
import { Sparkles, ArrowLeft, Calendar, Users, DollarSign, MapPin, RotateCcw, Trash2, History } from 'lucide-react';

const EVENT_EMOJI: Record<string, string> = {
  wedding: '💍',
  birthday: '🎂',
  anniversary: '💑',
  community: '🎉',
  other: '✨',
};

const TABS = ['Overview', 'Budget', 'Timeline', 'Vendors', 'Themes & Ideas'];

interface Props {
  plan: EventPlan | null;
  activePlanId: number | null;
  plans: SavedPlan[];
  onPlanUpdated: (plan: EventPlan) => void;
  onSelectPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: number) => void;
  onReset: () => void;
}

export default function DashboardPage({ plan, activePlanId, plans, onPlanUpdated, onSelectPlan, onDeletePlan, onReset }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    plan?.budgetBreakdown ?? []
  );
  const [timelineTasks, setTimelineTasks] = useState<TimelineTask[]>(
    (plan?.preparationTimeline ?? []).map(t => ({
      ...t,
      status: t.completed ? 'completed' : getTimelineStatus(t.targetDate),
    }))
  );
  const [vendorItems, setVendorItems] = useState<VendorItem[]>(
    plan?.vendorChecklist ?? []
  );

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-[#2D2640]">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C8B6FF] to-[#FFD6E7] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#4A3B72]" />
          </div>
          <h2 className="text-xl font-bold text-[#272138] mb-2">No event plan found</h2>
          <p className="text-sm text-[#615975] mb-6">
            Describe your event details to generate a personalized planning dashboard.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="pastel-btn-primary px-6 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntilEvent(plan.formData.eventDate);
  const eventEmoji = EVENT_EMOJI[plan.formData.eventType] ?? '✨';

  function handleToggleTimeline(id: string) {
    const updated = timelineTasks.map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? 'completed' : getTimelineStatus(t.targetDate),
            }
          : t
      );
    setTimelineTasks(updated);
    onPlanUpdated({ ...plan!, preparationTimeline: updated });
  }

  function updateBudget(items: BudgetItem[]) {
    setBudgetItems(items);
    onPlanUpdated({ ...plan!, budgetBreakdown: items });
  }

  function updateVendors(items: VendorItem[]) {
    setVendorItems(items);
    onPlanUpdated({ ...plan!, vendorChecklist: items });
  }

  const completedTasks = timelineTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen text-[#2D2640] flex flex-col">
      {/* Glass Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onReset();
                navigate('/plan');
              }}
              className="pastel-btn-secondary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button type="button" aria-label="CelebratAI home" className="flex items-center gap-2 text-left" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#4A3B72]" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#533E85] to-[#885499] bg-clip-text text-transparent">
                CelebratAI
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              onReset();
              navigate('/plan');
            }}
            className="pastel-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-[#C8B6FF]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plan Another Event</span>
          </button>
          <button onClick={() => navigate('/profile')} className="pastel-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold">My Profile</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {plans.length > 0 && (
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4"><History className="w-5 h-5 text-[#7057B2]" /><h2 className="font-bold text-[#302744]">Your event history</h2><span className="text-xs text-[#7A7292]">{plans.length} plans</span></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map(item => {
                const tasks = item.plan.preparationTimeline ?? [];
                const vendors = item.plan.vendorChecklist ?? [];
                const completed = tasks.filter(task => task.completed).length + vendors.filter(vendor => vendor.completed).length;
                const total = tasks.length + vendors.length;
                const selected = item.id === activePlanId;
                return <div key={item.id} className={`rounded-2xl border p-4 ${selected ? 'border-[#A994E5] bg-white/75' : 'border-white/80 bg-white/45'}`}>
                  <button type="button" onClick={() => onSelectPlan(item)} className="text-left w-full">
                    <span className="font-bold text-sm text-[#302744] block truncate">{EVENT_EMOJI[item.plan.formData.eventType] ?? '✨'} {item.plan.eventSummary.title}</span>
                    <span className="text-xs text-[#777087] block mt-1">{formatDate(item.plan.formData.eventDate)} · {item.plan.formData.location}</span>
                    <span className="text-xs text-[#665D7D] block mt-2">Progress: {completed}/{total} checklist items</span>
                    <span className="mt-2 block h-1.5 rounded-full bg-white"><span className="block h-full rounded-full bg-gradient-to-r from-[#B8C0FF] to-[#D984AC]" style={{ width: `${total ? completed / total * 100 : 0}%` }} /></span>
                  </button>
                  <button type="button" aria-label={`Delete ${item.plan.eventSummary.title}`} onClick={() => { if (window.confirm(`Delete “${item.plan.eventSummary.title}”? This event and its saved progress will be permanently removed.`)) void onDeletePlan(item.id); }} className="mt-3 text-xs font-semibold text-[#94758B] hover:text-[#A0284A] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Remove plan</button>
                </div>;
              })}
            </div>
          </section>
        )}
        {/* Dreamy Hero Banner */}
        <div className="glass-hero rounded-3xl p-6 sm:p-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl p-2 rounded-2xl bg-white/60 shadow-2xs">
                  {eventEmoji}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241E34]">
                  {plan.eventSummary.title}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-[#4F4666] leading-relaxed max-w-3xl">
                {plan.eventSummary.overview}
              </p>
            </div>

            {daysUntil >= 0 && (
              <div className="glass-panel px-6 py-4 rounded-2xl text-center shrink-0 border border-white/80 shadow-xs self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-center">
                <span className="text-2xl sm:text-3xl font-black text-[#4B3B73]">
                  {daysUntil}
                </span>
                <span className="text-xs font-semibold text-[#665D7D] uppercase tracking-wider">
                  {daysUntil === 1 ? 'Day to go' : 'Days to go'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/50">
            {[
              {
                icon: <Calendar className="w-4 h-4 text-[#5D5080]" />,
                label: 'Event Date',
                value: formatDate(plan.formData.eventDate),
              },
              {
                icon: <Users className="w-4 h-4 text-[#5D5080]" />,
                label: 'Guest Count',
                value: `${plan.formData.guestCount} guests`,
              },
              {
                icon: <DollarSign className="w-4 h-4 text-[#5D5080]" />,
                label: 'Total Budget',
                value: formatCurrency(plan.formData.totalBudget, plan.formData.currency),
              },
              {
                icon: <MapPin className="w-4 h-4 text-[#5D5080]" />,
                label: 'Location',
                value: plan.formData.location,
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="glass-panel rounded-2xl px-4 py-3 border border-white/70"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#6F6785] mb-1 font-medium">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <p className="font-bold text-sm text-[#272138] truncate">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="glass-panel rounded-2xl p-1.5 sticky top-[72px] z-40 border border-white/80 shadow-xs">
          <div className="flex overflow-x-auto gap-1 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#B8C0FF]/50 via-[#C8B6FF]/50 to-[#FFD6E7]/50 text-[#291F44] shadow-xs border border-white/90'
                    : 'text-[#615975] hover:text-[#2D2640] hover:bg-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="transition-opacity duration-300">
          {activeTab === 'Overview' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Counter Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card p-6 text-center">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-[#6A4BBF] to-[#9165BA] bg-clip-text text-transparent block mb-1">
                    {budgetItems.length}
                  </span>
                  <p className="text-xs font-semibold text-[#665D7D] uppercase tracking-wider">
                    Budget Categories
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-[#2B7A78] to-[#4AA3A1] bg-clip-text text-transparent block mb-1">
                    {completedTasks}/{timelineTasks.length}
                  </span>
                  <p className="text-xs font-semibold text-[#665D7D] uppercase tracking-wider">
                    Tasks Completed
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-[#BA4A7B] to-[#D66B99] bg-clip-text text-transparent block mb-1">
                    {vendorItems.length}
                  </span>
                  <p className="text-xs font-semibold text-[#665D7D] uppercase tracking-wider">
                    Vendor Checklist Items
                  </p>
                </div>
              </div>

              {/* Budget Preview Bar */}
              {budgetItems.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 sm:p-7">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#272138] text-base">
                      Budget Allocation Preview
                    </h3>
                    <button
                      onClick={() => setActiveTab('Budget')}
                      className="text-xs font-bold text-[#6B4BBF] hover:underline cursor-pointer"
                    >
                      View & Edit Breakdown →
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {budgetItems.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm font-medium text-[#463D5C] w-36 sm:w-44 truncate shrink-0">
                          {item.category}
                        </span>
                        <div className="flex-1 h-2.5 bg-white/70 rounded-full overflow-hidden border border-white">
                          <div
                            className="h-full bg-gradient-to-r from-[#B8C0FF] via-[#C8B6FF] to-[#FFD6E7] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#2F2742] w-12 text-right shrink-0">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Tips Callout */}
              {plan.practicalTips?.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#FFE5A3]/60 bg-gradient-to-r from-[#FFF9EB]/70 to-[#FFF4E0]/60">
                  <h3 className="font-bold text-[#4D3A16] mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <span>💡 Curated Planner Tips</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {plan.practicalTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#5C4B28] flex items-start gap-2.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E0A838] mt-2 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation Quick Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                {[
                  { tab: 'Budget', emoji: '💰', desc: 'Real-time calculation' },
                  { tab: 'Timeline', emoji: '📅', desc: 'Countdown checklists' },
                  { tab: 'Vendors', emoji: '✅', desc: 'Service checklist' },
                  { tab: 'Themes & Ideas', emoji: '🎨', desc: 'Palettes & concepts' },
                ].map(item => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className="glass-card p-4 sm:p-5 text-left cursor-pointer group"
                  >
                    <span className="text-2xl mb-2 block transition-transform group-hover:scale-110">
                      {item.emoji}
                    </span>
                    <p className="font-bold text-sm text-[#272138]">{item.tab}</p>
                    <p className="text-xs text-[#716987] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Budget' && (
            <div className="animate-fade-in-up">
              <BudgetTab
                items={budgetItems}
                totalBudget={plan.formData.totalBudget}
                currency={plan.formData.currency}
                onUpdate={updateBudget}
              />
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="animate-fade-in-up">
              <TimelineTab
                tasks={timelineTasks}
                onToggleComplete={handleToggleTimeline}
              />
            </div>
          )}

          {activeTab === 'Vendors' && (
            <div className="animate-fade-in-up">
              <VendorTab
                items={vendorItems}
                onUpdate={updateVendors}
              />
            </div>
          )}

          {activeTab === 'Themes & Ideas' && (
            <div className="animate-fade-in-up">
              <ThemesTab
                themes={plan.themeSuggestions}
                decorationIdeas={plan.decorationIdeas}
                activitySuggestions={plan.activitySuggestions}
                practicalTips={plan.practicalTips}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
