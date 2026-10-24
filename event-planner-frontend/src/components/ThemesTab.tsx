import { ThemeSuggestion } from '../types';
import { Palette, Lightbulb, Music, Sparkles } from 'lucide-react';

interface Props {
  themes: ThemeSuggestion[];
  decorationIdeas: string[];
  activitySuggestions: string[];
  practicalTips: string[];
}

export default function ThemesTab({
  themes,
  decorationIdeas,
  activitySuggestions,
  practicalTips,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Theme Suggestions Cards */}
      {themes.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#27203A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C8B6FF]/35 flex items-center justify-center text-[#5A3DA6]">
              <Palette className="w-4 h-4" />
            </div>
            <span>Bespoke Theme Concepts</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {themes.map((theme, i) => (
              <div key={i} className="glass-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <h4 className="font-extrabold text-[#27203A] text-base">{theme.name}</h4>
                    <span className="text-2xs sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C8B6FF]/35 text-[#4D3A82] border border-white shrink-0">
                      {theme.mood}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5F5774] mb-4 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Color Palette Swatches */}
                <div className="pt-3 border-t border-white/60">
                  <span className="text-2xs font-bold text-[#7A7292] uppercase tracking-wider block mb-2">
                    Color Palette
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {theme.colors.map((color, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1.5 text-xs text-[#433B58] bg-white/70 px-2.5 py-1 rounded-full border border-white shadow-2xs font-medium"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 inline-block shadow-2xs"
                          style={{
                            backgroundColor: color.match(/#[0-9a-fA-F]{3,6}/) ? color : '#C8B6FF',
                          }}
                        />
                        <span>{color}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decoration Ideas */}
      {decorationIdeas.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#27203A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD6E7]/50 flex items-center justify-center text-[#A0284A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Atmosphere & Decoration Ideas</span>
          </h3>

          <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/50 border border-white/80">
            {decorationIdeas.map((idea, i) => (
              <div key={i} className="px-5 py-3.5 text-xs sm:text-sm text-[#463E5E] flex items-start gap-3 hover:bg-white/40 transition-colors">
                <span className="text-[#C8B6FF] font-bold text-sm leading-none mt-0.5 shrink-0">✦</span>
                <span className="leading-relaxed">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest Activities */}
      {activitySuggestions.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#27203A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#B8C0FF]/40 flex items-center justify-center text-[#4E3CA3]">
              <Music className="w-4 h-4" />
            </div>
            <span>Guest Experience & Entertainment</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {activitySuggestions.map((act, i) => (
              <div
                key={i}
                className="glass-card p-4 text-xs sm:text-sm text-[#3E3654] flex items-start gap-2.5 font-medium leading-relaxed"
              >
                <span className="text-lg leading-none shrink-0">✨</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Tips */}
      {practicalTips.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#27203A] mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFE5A3]/50 flex items-center justify-center text-[#735314]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span>Practical Expert Tips</span>
          </h3>

          <div className="glass-panel rounded-3xl p-6 border border-[#FFE5A3]/50 bg-gradient-to-r from-[#FFFDF7]/70 to-[#FFF7E8]/60 space-y-3">
            {practicalTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#544522] leading-relaxed">
                <span className="text-[#E0A838] mt-0.5 shrink-0">💡</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {themes.length === 0 &&
        decorationIdeas.length === 0 &&
        activitySuggestions.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 text-center text-[#7A7292]">
            <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#6B5A96]" />
            <p className="text-sm font-medium">No theme details available.</p>
          </div>
        )}
    </div>
  );
}
