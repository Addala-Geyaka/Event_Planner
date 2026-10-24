import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { loginAccount, registerAccount } from '../api/plannerApi';

type AuthMode = 'login' | 'signup';

export default function AuthPage({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = mode === 'signup'
        ? await registerAccount(name, email, password)
        : await loginAccount(email, password);
      localStorage.setItem('celebratai_token', result.token);
      localStorage.setItem('celebratai_user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('celebratai-auth-changed'));
      navigate(location.state?.from ?? '/profile', { replace: true });
    } catch (requestError: unknown) {
      const response = requestError as { response?: { data?: { detail?: string } }; message?: string };
      setError(response.response?.data?.detail ?? 'Could not connect to the server. Check that the backend is running and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    navigate(next === 'login' ? '/login' : '/signup', { replace: true, state: location.state });
  }

  return (
    <main className="min-h-screen flex flex-col text-[#2D2640]">
      <header className="w-full px-5 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center shadow-sm"><Sparkles className="w-5 h-5 text-[#4A3B72]" /></span>
            <span className="text-xl font-bold bg-gradient-to-r from-[#533E85] to-[#885499] bg-clip-text text-transparent">CelebratAI</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-[#655B7A] hover:text-[#533E85] flex items-center gap-2"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back to home</span></Link>
        </div>
      </header>

      <section className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12 flex items-center">
        <div className="w-full grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div className="hidden lg:block max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-semibold text-[#554474] mb-7"><Sparkles className="w-4 h-4 text-[#7B61FF]" /> Your celebration starts here</div>
            <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] text-[#241E34] mb-6">Make room for the <span className="bg-gradient-to-r from-[#7B61FF] via-[#B85786] to-[#4A85B2] bg-clip-text text-transparent">moments</span> that matter.</h1>
            <p className="text-lg text-[#655D78] leading-relaxed mb-9">Sign in to pick up where you left off, or create your account to start planning a celebration that feels like you.</p>
            <div className="glass-panel rounded-3xl p-6 max-w-md">
              <div className="flex items-center gap-4 mb-5"><div className="w-12 h-12 rounded-2xl bg-[#FFD6E7]/60 flex items-center justify-center text-xl">💐</div><div><p className="font-bold text-[#342B4B]">Every detail, in one place</p><p className="text-sm text-[#777087]">Your budget, timeline, and ideas</p></div></div>
              <div className="space-y-3 text-sm text-[#5D536F]">{['A plan made for your day', 'A budget that stays on track', 'The little details, all taken care of'].map(item => <p key={item} className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-full bg-[#E8E2FF] flex items-center justify-center"><Check className="w-3 h-3 text-[#7057B2]" /></span>{item}</p>)}</div>
            </div>
            <div className="mt-9 flex items-center gap-3 text-sm text-[#777087]"><CalendarDays className="w-4 h-4 text-[#866DCE]" /> Weddings, birthdays, and all the in-between celebrations</div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mr-0 glass-panel rounded-[28px] p-6 sm:p-9 animate-fade-in-up">
            <div className="lg:hidden text-center mb-7"><div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center mb-3"><Sparkles className="w-6 h-6 text-[#4A3B72]" /></div><p className="text-sm font-semibold text-[#655B7A]">Your celebration starts here</p></div>
            <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8775B5] mb-2">{mode === 'login' ? 'Welcome back' : 'A lovely day begins here'}</p><h2 className="text-3xl font-extrabold tracking-tight text-[#29223B]">{mode === 'login' ? 'Sign in' : 'Create your account'}</h2><p className="text-sm text-[#746C84] mt-2">{mode === 'login' ? 'Your plans are right where you left them.' : 'Let’s start planning something wonderful.'}</p></div>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/65 border border-white/80 mb-6" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-sm text-[#4B3D6F]' : 'text-[#817990] hover:text-[#4B3D6F]'}`}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => switchMode('signup')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-[#4B3D6F]' : 'text-[#817990] hover:text-[#4B3D6F]'}`}>Create account</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && <label className="block"><span className="block text-sm font-semibold text-[#49415C] mb-1.5">Your name</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9489AA]" /><input autoComplete="name" required value={name} onChange={event => setName(event.target.value)} placeholder="Alex Morgan" className="glass-input w-full rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-[#AAA3B7]" /></span></label>}
              <label className="block"><span className="block text-sm font-semibold text-[#49415C] mb-1.5">Email address</span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9489AA]" /><input autoComplete="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="glass-input w-full rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-[#AAA3B7]" /></span></label>
              <label className="block"><span className="block text-sm font-semibold text-[#49415C] mb-1.5">Password</span><span className="relative block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9489AA]" /><input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" className="glass-input w-full rounded-xl py-3 pl-11 pr-11 text-sm placeholder:text-[#AAA3B7]" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9489AA] hover:text-[#594783]">{showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button></span></label>
              {error && <p role="alert" className="rounded-xl bg-[#FFE9EF] px-4 py-3 text-sm text-[#9B3458]">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="pastel-btn-primary w-full rounded-xl py-3.5 flex justify-center items-center gap-2 text-sm font-bold cursor-pointer disabled:opacity-60">{isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign in and continue' : 'Create account and continue'}{!isSubmitting && <ArrowRight className="w-4 h-4" />}</button>
            </form>
            <p className="mt-5 text-center text-xs leading-relaxed text-[#837B91]">Your account and event plan will be saved with your profile.</p>
            <p className="mt-5 text-center text-sm text-[#766D85]">{mode === 'login' ? 'New to CelebratAI?' : 'Already planning with us?'}{' '}<button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-[#654D9E] hover:text-[#493477]">{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          </div>
        </div>
      </section>
      <footer className="px-6 py-5 text-center text-xs text-[#91899F]">Made for the moments you’ll remember.</footer>
    </main>
  );
}
