import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, DollarSign, Heart, Wand2, CheckCircle2, Users, Star, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const goToPlanning = () => navigate(localStorage.getItem('celebratai_token') ? '/plan' : '/login');

  const features = [
    {
      icon: <Wand2 className="w-6 h-6 text-[#7c62be]" />,
      bg: 'bg-[#C8B6FF]/35 text-[#5a3da6]',
      title: 'AI-Powered Planning',
      desc: 'Get a complete, personalized event plan in seconds — tailored with Google Gemini AI.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#3b8c6e]" />,
      bg: 'bg-[#B4F8C8]/40 text-[#276e54]',
      title: 'Smart Budget Planner',
      desc: 'Intelligent budget allocation across every category with real-time recalculation as you edit.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-[#457b9d]" />,
      bg: 'bg-[#CDE7FF]/50 text-[#2b5d7d]',
      title: 'Preparation Timeline',
      desc: 'A chronological countdown schedule with target dates so you stay confident and organized.',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-[#d05c87]" />,
      bg: 'bg-[#FFD6E7]/50 text-[#a2375f]',
      title: 'Vendor Checklist',
      desc: 'Curated list of service providers you will need. Add custom items and check off completed ones.',
    },
    {
      icon: <Heart className="w-6 h-6 text-[#c75d86]" />,
      bg: 'bg-[#FFC6FF]/40 text-[#963765]',
      title: 'Personalized Themes',
      desc: 'Aesthetic color palettes, ambient decoration ideas, and styling concepts matched to your taste.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#7562be]" />,
      bg: 'bg-[#B8C0FF]/40 text-[#5441a1]',
      title: 'For Every Celebration',
      desc: 'Weddings, milestone birthdays, anniversaries, or community events — crafted for your scale.',
    },
  ];

  const eventTypes = [
    { emoji: '💍', label: 'Weddings' },
    { emoji: '🎂', label: 'Birthdays' },
    { emoji: '💑', label: 'Anniversaries' },
    { emoji: '🎉', label: 'Community Events' },
    { emoji: '✨', label: 'Milestones' },
  ];

  return (
    <div className="min-h-screen text-[#2D2640] flex flex-col">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button type="button" aria-label="CelebratAI home" className="flex items-center gap-2.5 text-left" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C8B6FF] via-[#FFD6E7] to-[#CDE7FF] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#4A3B72]" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#533E85] to-[#885499] bg-clip-text text-transparent">
              CelebratAI
            </span>
          </button>
          <button
            onClick={() => navigate(localStorage.getItem('celebratai_token') ? '/profile' : '/login')}
            className="pastel-btn-primary px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5"
          >
            <span>{localStorage.getItem('celebratai_token') ? 'My Profile' : 'Plan My Event'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 px-4 md:px-6 max-w-5xl mx-auto text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-white/80 shadow-xs mb-8 animate-fade-in-up">
            <Star className="w-4 h-4 text-[#7B61FF]" />
            <span className="text-xs md:text-sm font-medium text-[#4A3E68]">
              Next-Gen AI Event Experience
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-6 text-[#241E34] animate-fade-in-up delay-100">
            Craft Your Dream{' '}
            <span className="bg-gradient-to-r from-[#7B61FF] via-[#B85786] to-[#4A85B2] bg-clip-text text-transparent">
              Celebration
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-[#5F5774] max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-fade-in-up delay-150">
            From intimate gatherings to lavish weddings — get an intelligent, bespoke plan with budgets, countdown timelines, vendors, and styling in seconds.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <button
              onClick={goToPlanning}
              className="w-full sm:w-auto pastel-btn-primary px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Planning for Free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Event Pills Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-12 animate-fade-in-up delay-300">
            {eventTypes.map(et => (
              <span
                key={et.label}
                className="glass-panel px-4 py-2 rounded-full text-xs md:text-sm font-medium text-[#463D5C] flex items-center gap-1.5 hover:border-[#C8B6FF]/70 transition-colors"
              >
                <span>{et.emoji}</span>
                <span>{et.label}</span>
              </span>
            ))}
          </div>
        </section>

        {/* How It Works with Glass Cards */}
        <section className="py-16 px-4 md:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#241E34] mb-2">
              Effortless Planning in 3 Steps
            </h2>
            <p className="text-sm md:text-base text-[#6E6683]">
              Designed for simplicity, elegance, and peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Share Your Vision',
                desc: 'Enter your event type, date, budget, guest count, and any style preferences.',
                tag: 'Simple Input',
              },
              {
                step: '02',
                title: 'AI Crafts Your Plan',
                desc: 'Our Gemini AI generates your customized budget, timeline, and vendor needs.',
                tag: 'Instant Magic',
              },
              {
                step: '03',
                title: 'Personalize & Track',
                desc: 'Adjust budgets, check off countdown tasks, and manage vendors seamlessly.',
                tag: 'Full Control',
              },
            ].map(item => (
              <div
                key={item.step}
                className="glass-card p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C8B6FF]/25 text-[#4D3A82]">
                      Step {item.step}
                    </span>
                    <span className="text-xs text-[#8A829E] font-medium">{item.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#272138] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#615975] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#241E34] mb-2">
              Everything for a Seamless Celebration
            </h2>
            <p className="text-sm md:text-base text-[#6E6683]">
              Curated tools wrapped in an intuitive, calming interface
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="glass-card p-6 flex flex-col items-start"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 shadow-2xs`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#272138] text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#615975] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner Glass CTA */}
        <section className="py-16 px-4 md:px-6 max-w-4xl mx-auto">
          <div className="glass-hero rounded-3xl p-8 md:p-12 text-center text-[#251E38] relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-[#664DB3]" />
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3">
                Ready to organize your special day?
              </h2>
              <p className="text-sm md:text-base text-[#4C4362] max-w-xl mx-auto mb-8">
                Join thousands of hosts and couples who planned their celebrations with ease, clarity, and delight.
              </p>
              <button
                onClick={goToPlanning}
                className="pastel-btn-primary px-8 py-3.5 rounded-2xl text-base font-bold shadow-md cursor-pointer"
              >
                Plan My Event Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Frosted Glass Footer */}
      <footer className="glass-panel border-t border-white/60 py-8 px-6 text-center text-xs text-[#7A728F] mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#483B68]">
            <Sparkles className="w-4 h-4 text-[#8C6EE3]" />
            <span>CelebratAI Planner</span>
          </div>
          <p>AI-generated plans are suggestions. Cost estimates reflect realistic ranges rather than guaranteed quotes.</p>
          <p className="text-[#9C94B0]">Crafted for PromptWars Virtual Challenge 5</p>
        </div>
      </footer>
    </div>
  );
}
