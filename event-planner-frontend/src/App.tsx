import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import EventFormPage from './pages/EventFormPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { EventPlan } from './types';
import { deleteSavedPlan, fetchSavedPlans, SavedPlan, updateSavedPlan } from './api/plannerApi';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return localStorage.getItem('celebratai_token')
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    let active = true;
    async function loadPlan() {
      if (!localStorage.getItem('celebratai_token')) {
        if (active) { setCurrentPlan(null); setCurrentPlanId(null); setSavedPlans([]); }
        return;
      }
      try {
        const plans = await fetchSavedPlans();
        if (active) {
          setSavedPlans(plans);
          setCurrentPlan(plans[0]?.plan ?? null);
          setCurrentPlanId(plans[0]?.id ?? null);
        }
      } catch {
        if (active) { setCurrentPlan(null); setCurrentPlanId(null); setSavedPlans([]); }
      }
    }
    loadPlan();
    window.addEventListener('celebratai-auth-changed', loadPlan);
    return () => {
      active = false;
      window.removeEventListener('celebratai-auth-changed', loadPlan);
    };
  }, []);

  function handlePlanGenerated(plan: EventPlan, id: number) {
    setCurrentPlan(plan);
    setCurrentPlanId(id);
    setSavedPlans(previous => [{ id, plan, updatedAt: new Date().toISOString() }, ...previous]);
  }

  function handlePlanUpdated(plan: EventPlan) {
    setCurrentPlan(plan);
    if (currentPlanId !== null) {
      setSavedPlans(previous => previous.map(item => item.id === currentPlanId ? { ...item, plan, updatedAt: new Date().toISOString() } : item));
      void updateSavedPlan(currentPlanId, plan).catch(() => undefined);
    }
  }

  function handleSelectPlan(item: SavedPlan) {
    setCurrentPlan(item.plan);
    setCurrentPlanId(item.id);
  }

  function handleReset() {
    setCurrentPlan(null);
    setCurrentPlanId(null);
  }

  async function handleDeletePlan(id: number) {
    await deleteSavedPlan(id);
    const remaining = savedPlans.filter(item => item.id !== id);
    setSavedPlans(remaining);
    if (currentPlanId === id) {
      setCurrentPlan(remaining[0]?.plan ?? null);
      setCurrentPlanId(remaining[0]?.id ?? null);
    }
  }

  return (
    <div className="relative min-h-screen pastel-mesh-bg overflow-x-hidden selection:bg-purple-200 selection:text-purple-900">
      {/* Decorative Floating Pastel Orbs in background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed top-[-10%] left-[-8%] w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#ffd6e7]/40 to-[#c8b6ff]/35 blur-[90px] animate-float-1 z-0"
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed top-[30%] right-[-10%] w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-[#cde7ff]/45 to-[#ffd6e7]/35 blur-[100px] animate-float-2 z-0"
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#b8c0ff]/40 to-[#c8b6ff]/35 blur-[110px] animate-float-1 z-0"
      />

      {/* Main Content Layer */}
      <div className="relative z-10">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage plans={savedPlans} onOpenPlan={handleSelectPlan} onDeletePlan={id => { void handleDeletePlan(id); }} /></RequireAuth>} />
            <Route
              path="/plan"
              element={<RequireAuth><EventFormPage onPlanGenerated={handlePlanGenerated} /></RequireAuth>}
            />
            <Route
              path="/dashboard"
              element={<RequireAuth><DashboardPage key={currentPlanId ?? 'empty'} plan={currentPlan} activePlanId={currentPlanId} plans={savedPlans} onPlanUpdated={handlePlanUpdated} onSelectPlan={handleSelectPlan} onDeletePlan={handleDeletePlan} onReset={handleReset} /></RequireAuth>}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}
