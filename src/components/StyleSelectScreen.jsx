import { useState } from 'react'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sliders,
  Palette,
  LayoutGrid,
  Clock,
  Type,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { FILTERS, FRAME_COLORS } from '../utils/filters'
import { COLLAB_FRAMES } from '../utils/collabFrames'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

export default function StyleSelectScreen({
  layout,
  setLayout,
  selectedFilter,
  setSelectedFilter,
  frameColor,
  setFrameColor,
  selectedCollabFrame,
  setSelectedCollabFrame,
  countdownDuration,
  setCountdownDuration,
  customText,
  setCustomText,
  onBack,
  onContinue,
}) {
  const { t } = useLanguage()
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  // Layout choices with visual miniatures
  const layoutItems = [
    {
      id: 'strip-4',
      title: t('layout_strip4'),
      sub: t('layout_strip4_sub'),
      slots: 4,
      type: '1x4',
    },
    {
      id: 'grid-4',
      title: t('layout_grid4'),
      sub: t('layout_grid4_sub'),
      slots: 4,
      type: '2x2',
    },
    {
      id: 'strip-2',
      title: t('layout_strip2'),
      sub: t('layout_strip2_sub'),
      slots: 2,
      type: '1x2',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/80 px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('btn_back')}</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#29252C]">
              {t('screen2_title')}
            </h2>
            <p className="text-[10px] text-[#766F7B] font-medium hidden sm:block">
              {t('screen2_sub')}
            </p>
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Options Content */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8 flex-1 pb-28">
        {/* ================= 1. LAYOUT SELECTION ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs">
                1
              </span>
              <span>{t('layout_title')}</span>
            </h3>
            <span className="text-xs font-bold text-[#FF3D96]">
              {layout === 'strip-2' ? '2 Poses' : '4 Poses'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {layoutItems.map((item) => {
              const isSelected = layout === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setLayout(item.id)}
                  className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#FF3D96] bg-pink-50/40 shadow-xl shadow-pink-500/10'
                      : 'border-pink-100/70 bg-white hover:border-pink-200 shadow-xs'
                  }`}
                >
                  {/* Miniature strip layout preview */}
                  <div className="w-full h-32 bg-[#FFF7EF] rounded-2xl flex items-center justify-center p-3 mb-3 border border-pink-100/50">
                    {item.id === 'strip-4' && (
                      <div className="w-16 h-28 bg-white border border-pink-200/60 rounded-lg p-1.5 flex flex-col justify-between shadow-xs">
                        {[0, 1, 2, 3].map((n) => (
                          <div key={n} className="w-full h-4.5 bg-pink-100/80 rounded-xs" />
                        ))}
                      </div>
                    )}
                    {item.id === 'grid-4' && (
                      <div className="w-24 h-24 bg-white border border-pink-200/60 rounded-lg p-1.5 grid grid-cols-2 gap-1.5 shadow-xs">
                        {[0, 1, 2, 3].map((n) => (
                          <div key={n} className="w-full h-8 bg-pink-100/80 rounded-xs" />
                        ))}
                      </div>
                    )}
                    {item.id === 'strip-2' && (
                      <div className="w-18 h-26 bg-white border border-pink-200/60 rounded-lg p-1.5 flex flex-col justify-around shadow-xs">
                        {[0, 1].map((n) => (
                          <div key={n} className="w-full h-9 bg-pink-100/80 rounded-xs" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-[#29252C]">{item.title}</span>
                      {isSelected && <CheckCircle size={18} className="text-[#FF3D96]" />}
                    </div>
                    <p className="text-[11px] text-[#766F7B] mt-0.5 font-medium">{item.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ================= 2. FILTER SELECTION ================= */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs">
              2
            </span>
            <span>{t('filter_title')}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {FILTERS.map((f) => {
              const isSelected = selectedFilter.id === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'border-[#FF3D96] bg-pink-50/50 shadow-md shadow-pink-500/10'
                      : 'border-pink-100/70 bg-white hover:border-pink-200'
                  }`}
                >
                  <div
                    style={{ backgroundColor: `${f.color}25` }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="text-xl">📸</span>
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#FF3D96]/15 flex items-center justify-center">
                        <CheckCircle size={16} className="text-[#FF3D96]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-xs text-[#29252C]">{t(f.nameKey) || f.name}</p>
                    <span
                      style={{ color: f.color }}
                      className="text-[9px] font-extrabold uppercase"
                    >
                      {f.badge}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ================= 3. FRAME COLOR SELECTION ================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs">
                3
              </span>
              <span>{t('frame_color_title')}</span>
            </h3>
            <span className="text-xs font-bold text-[#766F7B]">
              {t(frameColor.nameKey) || frameColor.name}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {FRAME_COLORS.map((c) => {
              const isSelected = frameColor.id === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setFrameColor(c)}
                  className={`p-2.5 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'border-[#FF3D96] bg-pink-50 shadow-md ring-2 ring-[#FF3D96]/20'
                      : 'border-pink-100/70 bg-white hover:border-pink-200'
                  }`}
                >
                  <span
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    className="w-9 h-9 rounded-full border-2 shadow-xs shrink-0 flex items-center justify-center text-xs"
                  >
                    {isSelected && '✓'}
                  </span>
                  <span className="text-[10px] font-bold text-[#29252C] truncate max-w-full">
                    {t(c.nameKey) || c.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ================= 4. COLLAB CONCEPT FRAMES ================= */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs">
              4
            </span>
            <span>{t('collab_title')}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {COLLAB_FRAMES.map((cf) => {
              const isSelected = selectedCollabFrame.id === cf.id
              return (
                <button
                  key={cf.id}
                  onClick={() => setSelectedCollabFrame(cf)}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#FF3D96] bg-pink-50/50 shadow-md shadow-pink-500/10'
                      : 'border-pink-100/70 bg-white hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{cf.icon}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-pink-100 text-[#FF3D96]">
                      {cf.badge}
                    </span>
                  </div>
                  <p className="font-black text-xs text-[#29252C] truncate">{cf.name}</p>
                  <p className="text-[9px] text-[#766F7B] truncate">{cf.enName}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* ================= 5. MORE OPTIONS (COLLAPSIBLE) ================= */}
        <section className="bg-white rounded-3xl border border-pink-100 p-4 shadow-xs">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#FF3D96]" />
              <span className="font-black text-xs uppercase tracking-wider text-[#29252C]">
                {t('more_options_title')}
              </span>
            </div>
            {showMoreOptions ? (
              <ChevronUp size={16} className="text-[#766F7B]" />
            ) : (
              <ChevronDown size={16} className="text-[#766F7B]" />
            )}
          </button>

          {showMoreOptions && (
            <div className="mt-4 pt-4 border-t border-pink-100 space-y-4 animate-fade-in">
              {/* Countdown timer picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                  <Clock size={13} /> {t('countdown_title')}
                </label>
                <div className="flex gap-2">
                  {[3, 5, 8].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setCountdownDuration(sec)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        countdownDuration === sec
                          ? 'bg-[#FF3D96] text-white shadow-xs'
                          : 'bg-[#FFF7EF] text-[#766F7B] hover:bg-pink-50'
                      }`}
                    >
                      {sec} {t('seconds_unit')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strip Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                  <Type size={13} /> {t('custom_title_label')}
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="SNUGGIE PHOTOBOOTH"
                  className="w-full px-4 py-2 rounded-xl bg-[#FFF7EF] border border-pink-100 focus:outline-none focus:border-[#FF3D96] text-xs font-bold uppercase tracking-wider text-[#29252C]"
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Bar with CONTINUE CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-pink-100/90 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-base shadow-xl shadow-[#FF3D96]/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('btn_continue')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
