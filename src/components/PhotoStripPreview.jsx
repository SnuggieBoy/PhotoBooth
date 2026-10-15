import { useRef } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export default function PhotoStripPreview({
  photos = [],
  layout = 'strip-4', // 'strip-4' (1x4) | 'grid-4' (2x2) | 'strip-2' (1x2)
  frameColor = { id: 'white', bg: '#ffffff', text: '#1e293b', border: '#e2e8f0' },
  customText = 'K-PHOTOBOOTH',
  subtitle,
  stickers = [],
  onRemoveSticker,
  stripRef,
}) {
  const { t, language } = useLanguage()

  const formattedDate = subtitle || new Date().toLocaleDateString(
    language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  )

  return (
    <div className="flex flex-col items-center">
      {/* Outer Strip Shadow Container */}
      <div
        ref={stripRef}
        id="printable-photo-strip"
        style={{
          backgroundColor: frameColor.bg,
          color: frameColor.text,
          borderColor: frameColor.border,
        }}
        className={`relative transition-all duration-300 shadow-2xl p-4 sm:p-5 rounded-2xl border flex flex-col items-center ${
          layout === 'grid-4' ? 'w-[320px] sm:w-[380px]' : 'w-[230px] sm:w-[260px]'
        }`}
      >
        {/* Film Negative Sprocket Holes (If film style selected) */}
        {frameColor.isFilm && (
          <div className="absolute top-2 bottom-2 left-1.5 flex flex-col justify-between pointer-events-none opacity-40">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="w-2 h-3.5 bg-neutral-800 rounded-xs mb-1" />
            ))}
          </div>
        )}

        {/* Top Header / Logo */}
        <div className="w-full text-center mb-3">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-pink-500" />
            <h4 className="text-[12px] font-black uppercase tracking-widest leading-none">
              {customText}
            </h4>
            <Sparkles size={13} className="text-pink-500" />
          </div>
        </div>

        {/* Photos Layout Container */}
        <div
          className={`w-full gap-2.5 ${
            layout === 'grid-4' ? 'grid grid-cols-2' : 'flex flex-col'
          }`}
        >
          {photos.map((photoUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] bg-neutral-200 overflow-hidden rounded-lg shadow-xs group"
            >
              <img
                src={photoUrl}
                alt={`Shot ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/40 text-white/80 px-1 rounded">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Sticker Layer */}
        {stickers.map((stk) => (
          <div
            key={stk.id}
            style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl select-none cursor-pointer group hover:scale-125 transition-transform"
            onClick={() => onRemoveSticker && onRemoveSticker(stk.id)}
            title={t('sticker_remove_hint')}
          >
            {stk.emoji}
            <span className="hidden group-hover:block absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-[8px]">
              <X size={8} />
            </span>
          </div>
        ))}

        {/* Bottom Authentic K-Photobooth Footer (Date + Barcode + Slogan) */}
        <div className="w-full mt-4 pt-2.5 border-t border-black/10 flex items-end justify-between text-[10px]">
          <div>
            <p className="font-extrabold tracking-wider">{formattedDate}</p>
            <p className="opacity-60 text-[8px] uppercase tracking-widest font-mono">
              {t('strip_city_slogan')}
            </p>
          </div>

          {/* Barcode Graphic */}
          <div className="flex items-center gap-0.5 h-6 opacity-75">
            <span className="w-0.5 h-full bg-current" />
            <span className="w-1 h-full bg-current" />
            <span className="w-0.5 h-full bg-current" />
            <span className="w-1.5 h-full bg-current" />
            <span className="w-0.5 h-full bg-current" />
            <span className="w-1 h-full bg-current" />
            <span className="w-2 h-full bg-current" />
            <span className="w-0.5 h-full bg-current" />
          </div>
        </div>
      </div>
    </div>
  )
}
