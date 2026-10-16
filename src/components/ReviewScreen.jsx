import { Sparkles, RefreshCw, Camera, ArrowRight, ArrowLeft } from 'lucide-react'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

export default function ReviewScreen({
  photos = [],
  onRetakeSingle,
  onRetakeAll,
  onProceedDecorate,
  onBackToCamera,
}) {
  const { t } = useLanguage()
  const safePhotos = Array.isArray(photos) ? photos : []

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/80 px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToCamera}
            className="flex items-center gap-1.5 text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('btn_back')}</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#29252C]">
              {t('review_title')}
            </h2>
            <p className="text-[10px] text-[#766F7B] font-medium hidden sm:block">
              {t('review_sub')}
            </p>
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Review Contact Sheet */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 pb-28">
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF3D96] px-3 py-1 rounded-full bg-pink-100/70 border border-pink-200">
            {safePhotos.length} Poses Captured
          </span>
          <h3 className="text-xl sm:text-2xl font-black mt-2 text-[#29252C]">
            Khoảnh khắc của bạn đây rồi! ✨
          </h3>
          <p className="text-xs text-[#766F7B] mt-1 max-w-md mx-auto">
            Nhấn vào nút "Chụp lại tấm này" nếu bạn muốn đổi dáng cho bất kỳ ảnh nào nhé.
          </p>
        </div>

        {/* Photos Grid */}
        <div
          className={`grid gap-4 sm:gap-6 ${
            safePhotos.length <= 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
              : 'grid-cols-2 max-w-3xl mx-auto'
          }`}
        >
          {safePhotos.map((photoUrl, idx) => (
            <div
              key={idx}
              className="group relative bg-white border-2 border-pink-100 rounded-3xl p-3 shadow-md hover:shadow-xl hover:border-pink-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo View */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FFF7EF]">
                <img
                  src={photoUrl}
                  alt={`Shot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                {/* Shot Number Badge */}
                <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-[#FF3D96] shadow-xs">
                  Shot #{idx + 1}
                </div>
              </div>

              {/* Individual Retake Button */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#766F7B]">
                  Pose #{idx + 1}
                </span>
                <button
                  onClick={() => onRetakeSingle(idx)}
                  className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-[#FF3D96] text-[#FF3D96] hover:text-white border border-pink-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <Camera size={13} />
                  <span>{t('btn_retake_shot')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-pink-100/90 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={onRetakeAll}
            className="py-3.5 px-5 rounded-full bg-[#FFF7EF] hover:bg-pink-50 text-[#766F7B] hover:text-[#FF3D96] border border-pink-100 text-xs font-black flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">{t('btn_retake_all')}</span>
            <span className="sm:hidden">Chụp lại</span>
          </button>

          <button
            onClick={onProceedDecorate}
            className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-sm sm:text-base shadow-xl shadow-[#FF3D96]/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('btn_edit_photos')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
