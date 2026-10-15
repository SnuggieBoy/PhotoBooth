import { useState } from 'react'
import { Sparkles, Camera, Film, Brush, Printer, ArrowRight, Heart, Star } from 'lucide-react'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

// Demo photo strip poses for visual preview on Welcome Screen
const DEMO_POSES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
]

export default function WelcomeScreen({ onStart }) {
  const { t } = useLanguage()

  return (
    <div className="relative min-h-screen bg-[#FFFDF9] flex flex-col justify-between overflow-hidden">
      {/* Background Soft Ambient Pastel Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FFE7A3]/30 via-[#FFB8D0]/25 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#DCD3FF]/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#CDEBFF]/35 blur-3xl pointer-events-none rounded-full" />

      {/* Floating Y2K Decorative Elements */}
      <div className="absolute top-24 left-[8%] text-2xl sm:text-3xl animate-float select-none pointer-events-none opacity-80">
        ✨
      </div>
      <div className="absolute top-44 right-[10%] text-3xl sm:text-4xl animate-float-reverse select-none pointer-events-none opacity-80">
        💖
      </div>
      <div className="absolute bottom-40 left-[6%] text-3xl select-none pointer-events-none opacity-75 animate-float">
        🎀
      </div>
      <div className="absolute bottom-48 right-[8%] text-3xl select-none pointer-events-none opacity-75 animate-float-reverse">
        🧸
      </div>
      <div className="absolute top-1/2 left-[3%] text-2xl select-none pointer-events-none opacity-70 animate-float">
        🌸
      </div>
      <div className="absolute top-1/3 right-[4%] text-2xl select-none pointer-events-none opacity-70 animate-float-reverse">
        🍒
      </div>

      {/* Top Header Bar */}
      <header className="relative z-30 max-w-6xl w-full mx-auto px-5 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF3D96] to-[#FF85B2] flex items-center justify-center shadow-lg shadow-[#FF3D96]/25">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-[#29252C] flex items-center gap-1.5">
              <span>{t('app_title')}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FF3D96]/10 text-[#FF3D96] border border-[#FF3D96]/20">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-[#766F7B] font-bold tracking-wider uppercase hidden sm:block">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        <LanguageSelector />
      </header>

      {/* Hero Content Section */}
      <main className="relative z-20 max-w-5xl w-full mx-auto px-4 py-4 sm:py-8 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-pink-200/80 shadow-xs shadow-pink-500/10 mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#FF3D96] animate-ping" />
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#FF3D96]">
            {t('welcome_badge')}
          </span>
        </div>

        {/* Big Editorial Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#29252C] max-w-3xl leading-[1.15]">
          {t('welcome_title')}
        </h2>

        {/* Subtitle */}
        <p className="mt-3.5 text-xs sm:text-base text-[#766F7B] max-w-xl font-medium leading-relaxed">
          {t('welcome_subtitle')}
        </p>

        {/* Centerpiece: Overlapping Realistic Photo Strips Showcase */}
        <div className="relative my-7 sm:my-10 flex items-center justify-center w-full max-w-md sm:max-w-xl h-[310px] sm:h-[350px]">
          {/* Strip 1: Haru Pastel Blue (Left, tilted -9deg) */}
          <div className="absolute left-4 sm:left-12 -rotate-9 hover:rotate-0 transition-transform duration-300 w-[140px] sm:w-[170px] bg-[#bae6fd] border border-[#7dd3fc] rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-sky-500/15 flex flex-col gap-1.5 select-none z-10">
            <div className="text-center text-[8px] font-black tracking-widest text-[#0369a1] py-0.5">
              HARU FILM 2026
            </div>
            {DEMO_POSES.slice(0, 3).map((url, i) => (
              <div key={i} className="aspect-[4/3] rounded-md overflow-hidden bg-white/50">
                <img src={url} alt="Demo" className="w-full h-full object-cover filter brightness-110 saturate-110" />
              </div>
            ))}
            <div className="flex justify-between items-center text-[7px] font-bold text-[#0369a1] px-1 pt-0.5">
              <span>04-CUT</span>
              <span>SEOUL</span>
            </div>
          </div>

          {/* Strip 2: Noir Black / Film Negative (Center, tilted 3deg, main focus) */}
          <div className="relative rotate-3 hover:rotate-0 transition-transform duration-300 w-[160px] sm:w-[190px] bg-white border border-pink-200/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-pink-500/20 flex flex-col gap-1.5 select-none z-20">
            <div className="flex items-center justify-center gap-1 text-[9px] font-black tracking-widest text-[#FF3D96] py-0.5">
              <Sparkles size={10} /> SNUGGIE PHOTO <Sparkles size={10} />
            </div>
            {DEMO_POSES.map((url, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-pink-50 relative group">
                <img src={url} alt="Demo" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[7px] font-bold px-1 rounded">
                  0{i + 1}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-[8px] font-extrabold text-[#29252C] px-1 pt-1 border-t border-black/5">
              <span>PHOTOISM</span>
              <span>2026.10.15</span>
            </div>
            {/* Cute stickers on strip */}
            <span className="absolute -top-3 -right-3 text-2xl select-none">💖</span>
            <span className="absolute bottom-10 -left-3 text-xl select-none">✨</span>
          </div>

          {/* Strip 3: Sakura Pink (Right, tilted 12deg) */}
          <div className="absolute right-4 sm:right-12 rotate-12 hover:rotate-0 transition-transform duration-300 w-[140px] sm:w-[170px] bg-[#fbcfe8] border border-[#f472b6] rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-pink-500/15 flex flex-col gap-1.5 select-none z-10">
            <div className="text-center text-[8px] font-black tracking-widest text-[#9d174d] py-0.5">
              PURIKURA KAWAII
            </div>
            {DEMO_POSES.slice(1, 4).map((url, i) => (
              <div key={i} className="aspect-[4/3] rounded-md overflow-hidden bg-white/50">
                <img src={url} alt="Demo" className="w-full h-full object-cover filter brightness-105 hue-rotate-5" />
              </div>
            ))}
            <div className="flex justify-between items-center text-[7px] font-bold text-[#9d174d] px-1 pt-0.5">
              <span>TOKYO</span>
              <span>★★★★★</span>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA: START PHOTO */}
        <div className="mt-2 w-full flex flex-col items-center">
          <button
            onClick={onStart}
            className="w-full max-w-xs sm:max-w-md py-4 sm:py-5 px-8 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-base sm:text-lg shadow-xl shadow-[#FF3D96]/35 hover:shadow-2xl hover:shadow-[#FF3D96]/45 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Camera size={22} className="group-hover:rotate-12 transition-transform" />
            <span>{t('btn_start_photo')}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
          <span className="text-[11px] text-[#766F7B] mt-2 font-semibold">
            {t('popular_styles_title')}
          </span>
        </div>
      </main>

      {/* Feature Highlights Footer Bar */}
      <footer className="relative z-20 max-w-5xl w-full mx-auto px-4 pb-6 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="bg-white/80 border border-pink-100/90 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-lg mb-1">🌸</div>
            <p className="text-[11px] font-extrabold text-[#29252C]">{t('highlight_filters')}</p>
          </div>
          <div className="bg-white/80 border border-pink-100/90 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-lg mb-1">✍️</div>
            <p className="text-[11px] font-extrabold text-[#29252C]">{t('highlight_doodle')}</p>
          </div>
          <div className="bg-white/80 border border-pink-100/90 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-lg mb-1">🎬</div>
            <p className="text-[11px] font-extrabold text-[#29252C]">{t('highlight_boomerang')}</p>
          </div>
          <div className="bg-white/80 border border-pink-100/90 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-lg mb-1">🖨️</div>
            <p className="text-[11px] font-extrabold text-[#29252C]">{t('highlight_print')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
