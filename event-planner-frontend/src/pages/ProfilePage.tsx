import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, LogOut, MapPin, Plus, Sparkles, Wallet, Trash2 } from 'lucide-react';
import { logoutAccount, SavedPlan } from '../api/plannerApi';
import { formatCurrency } from '../utils/budgetUtils';
import { formatDate, getDaysUntilEvent } from '../utils/dateUtils';

const EMOJI: Record<string, string> = { wedding: '💍', birthday: '🎂', anniversary: '💑', community: '🎉', other: '✨' };

export default function ProfilePage({ plans, onOpenPlan, onDeletePlan }: { plans: SavedPlan[]; onOpenPlan: (plan: SavedPlan) => void; onDeletePlan: (id: number) => void }) {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('celebratai_user') ?? '{}') as { name?: string; email?: string }; }
    catch { return {}; }
  }, []);

  const upcoming = plans.filter(item => getDaysUntilEvent(item.plan.formData.eventDate) >= 0).length;
  const totals = plans.reduce((acc, item) => {
    const tasks = item.plan.preparationTimeline ?? [];
    const vendors = item.plan.vendorChecklist ?? [];
    const done = tasks.filter(task => task.completed).length + vendors.filter(vendor => vendor.completed).length;
    return { complete: acc.complete + done, total: acc.total + tasks.length + vendors.length, budget: acc.budget + item.plan.formData.totalBudget };
  }, { complete: 0, total: 0, budget: 0 });
  const overallProgress = totals.total ? Math.round(totals.complete / totals.total * 100) : 0;

  async function signOut() {
    setIsSigningOut(true);
    try { await logoutAccount(); } catch { /* Clear the local session even if the server is unavailable. */ }
    localStorage.removeItem('celebratai_token');
    localStorage.removeItem('celebratai_user');
    window.dispatchEvent(new Event('celebratai-auth-changed'));
    navigate('/', { replace: true });
  }

  return (
    <main className="min-h-screen text-[#2D2640]">
      <header className="sticky top-0 z-40 glass-panel border-b border-white/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center"><Sparkles className="w-5 h-5 text-[#4A3B72]" /></span>
            <span className="text-lg font-bold bg-gradient-to-r from-[#533E85] to-[#885499] bg-clip-text text-transparent">CelebratAI</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-semibold text-[#635A76]">{user.name || user.email}</span>
            <button disabled={isSigningOut} onClick={() => void signOut()} className="pastel-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"><LogOut className="w-4 h-4" />{isSigningOut ? 'Signing out…' : 'Sign out'}</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-9 sm:py-12 space-y-8">
        <section className="glass-hero rounded-[28px] p-6 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-[#65568A] mb-2">Your CelebratAI profile</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#29223B]">Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ' back'} ✨</h1>
            <p className="mt-2 text-sm sm:text-base text-[#655D78]">Your celebrations, saved plans, and progress all in one place.</p>
          </div>
          <button onClick={() => navigate('/plan')} className="pastel-btn-primary rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2 text-sm font-bold shrink-0"><Plus className="w-5 h-5" />Plan My Event</button>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Planning overview">
          {[
            { icon: <CalendarDays className="w-5 h-5" />, label: 'Events planned', value: String(plans.length), tint: 'text-[#7057B2]', bg: 'bg-[#E8E2FF]' },
            { icon: <Clock3 className="w-5 h-5" />, label: 'Upcoming events', value: String(upcoming), tint: 'text-[#36799D]', bg: 'bg-[#DDF1FF]' },
            { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Overall checklist progress', value: `${overallProgress}%`, tint: 'text-[#318064]', bg: 'bg-[#DFF6E8]' },
            { icon: <Wallet className="w-5 h-5" />, label: 'Planned budgets', value: plans.length ? `${plans.length} plans` : 'No plans yet', tint: 'text-[#A34E76]', bg: 'bg-[#FFE4EF]' },
          ].map(item => <div key={item.label} className="glass-panel rounded-2xl p-5"><div className={`w-10 h-10 rounded-xl ${item.bg} ${item.tint} flex items-center justify-center mb-4`}>{item.icon}</div><p className="text-2xl font-extrabold text-[#302744]">{item.value}</p><p className="text-xs text-[#777087] mt-1">{item.label}</p></div>)}
        </section>

        <section className="glass-panel rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
            <div><h2 className="text-xl font-bold text-[#302744]">Your event plans</h2><p className="text-sm text-[#777087] mt-1">Open a plan to continue where you left off.</p></div>
            {plans.length > 0 && <span className="text-xs font-semibold text-[#766D85]">{totals.complete} of {totals.total} checklist items complete</span>}
          </div>
          {plans.length === 0 ? <div className="rounded-2xl border border-dashed border-[#CFC5E6] bg-white/35 px-5 py-10 text-center"><span className="text-3xl">🎈</span><h3 className="font-bold text-[#392F52] mt-3">Your first celebration is waiting</h3><p className="text-sm text-[#777087] mt-1 mb-5">Create an event plan and it will be saved here for next time.</p><button onClick={() => navigate('/plan')} className="pastel-btn-primary rounded-xl px-5 py-3 text-sm font-bold">Plan My Event</button></div> : <div className="grid md:grid-cols-2 gap-4">{plans.map(item => {
            const timeline = item.plan.preparationTimeline ?? [];
            const vendors = item.plan.vendorChecklist ?? [];
            const complete = timeline.filter(task => task.completed).length + vendors.filter(vendor => vendor.completed).length;
            const count = timeline.length + vendors.length;
            const progress = count ? Math.round(complete / count * 100) : 0;
            const days = getDaysUntilEvent(item.plan.formData.eventDate);
            return <article key={item.id} className="glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><span className="w-12 h-12 rounded-2xl bg-[#E9E2FF]/75 flex items-center justify-center text-2xl shrink-0">{EMOJI[item.plan.formData.eventType] ?? '✨'}</span><div className="min-w-0"><h3 className="font-bold text-[#302744] truncate">{item.plan.eventSummary.title}</h3><p className="text-xs text-[#777087] mt-1">{formatDate(item.plan.formData.eventDate)}</p></div></div><span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 text-[#766D85]">{days < 0 ? 'Past event' : days === 0 ? 'Today' : `${days} days`}</span></div>
              <p className="text-xs text-[#6F6785] mt-4 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{item.plan.formData.location}<span className="mx-1">·</span>{item.plan.formData.guestCount} guests</p>
              <div className="mt-5"><div className="flex justify-between text-xs text-[#6F6785] mb-2"><span>Planning progress</span><span className="font-bold text-[#493B68]">{progress}% · {complete}/{count}</span></div><div className="h-2 rounded-full bg-white/80 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#B8C0FF] via-[#C8B6FF] to-[#E59DBA]" style={{ width: `${progress}%` }} /></div></div>
              <div className="mt-4 pt-4 border-t border-white/70 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#6F6785] flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{formatCurrency(item.plan.formData.totalBudget, item.plan.formData.currency)}</span><div className="flex items-center gap-3"><button onClick={() => { if (window.confirm(`Delete “${item.plan.eventSummary.title}”? This event and its saved progress will be permanently removed.`)) onDeletePlan(item.id); }} className="text-xs font-semibold text-[#94758B] hover:text-[#A0284A] flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button><button onClick={() => { onOpenPlan(item); navigate('/dashboard'); }} className="text-xs font-bold text-[#654D9E] hover:text-[#493477] flex items-center gap-1">Continue<ChevronRight className="w-4 h-4" /></button></div></div>
            </article>;
          })}</div>}
        </section>

        {plans.length > 0 && <section className="glass-panel rounded-3xl p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-[#302744]">Planning analysis</h2><p className="text-sm text-[#777087] mt-1">A quick look across your saved event checklists.</p></div><span className="text-2xl">📊</span></div><div className="mt-5 grid sm:grid-cols-3 gap-4 text-sm"><div className="rounded-2xl bg-white/55 p-4"><p className="text-xs text-[#777087]">Tasks and vendors complete</p><p className="mt-1 font-bold text-[#302744]">{totals.complete} / {totals.total}</p></div><div className="rounded-2xl bg-white/55 p-4"><p className="text-xs text-[#777087]">Average checklist progress</p><p className="mt-1 font-bold text-[#302744]">{overallProgress}%</p></div><div className="rounded-2xl bg-white/55 p-4"><p className="text-xs text-[#777087]">Saved celebrations</p><p className="mt-1 font-bold text-[#302744]">{plans.length} {plans.length === 1 ? 'event' : 'events'}</p></div></div></section>}
      </div>
    </main>
  );
}
