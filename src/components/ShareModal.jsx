import { useEffect } from 'react'
import {
  Download,
  Printer,
  Share2,
  X,
  Sparkles,
  QrCode,
  Film,
  Play,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { useLanguage } from '../i18n/LanguageContext'

export default function ShareModal({
  isOpen,
  onClose,
  onDownload,
  onPrint,
  onExportBoomerang,
  onDownloadVideo,
  isExportingVideo = false,
  exportProgress = 0,
  boomerangVideoUrl = null,
  hasVideoClips = false,
  onPrintDnpSplit,
  onPrintThermalReceipt,
}) {
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#38bdf8', '#fbbf24', '#a855f7'],
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  // Fallback share url
  const shareUrl = window.location.href

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share_title'),
          text: t('share_text'),
          url: shareUrl,
        })
      } catch (err) {
        console.warn('Share error:', err)
      }
    } else {
      navigator.clipboard?.writeText(shareUrl)
      alert(t('share_copied'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 mb-2 shadow-lg shadow-pink-500/30">
            <Sparkles size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-black">{t('modal_ready_title')}</h3>
          <p className="text-xs text-neutral-400 mt-1">{t('modal_ready_desc')}</p>
        </div>

        {/* Live Boomerang Video Preview (If exported) */}
        {boomerangVideoUrl ? (
          <div className="bg-neutral-950 p-4 rounded-2xl border border-pink-500/30 mb-5 flex flex-col items-center gap-3">
            <div className="relative group">
              <video
                src={boomerangVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-32 h-44 object-cover rounded-xl shadow-lg border border-pink-500/40"
              />
              <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-pink-500 text-white px-1 rounded">
                MP4
              </span>
            </div>
            <p className="text-[11px] text-pink-300 font-semibold text-center">
              {t('boomerang_desc')}
            </p>
            <button
              onClick={onDownloadVideo}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20"
            >
              <Download size={14} /> {t('btn_download_video')}
            </button>
          </div>
        ) : isExportingVideo ? (
          <div className="bg-neutral-950 p-4 rounded-2xl border border-pink-500/30 text-center space-y-2 mb-5">
            <div className="flex justify-between text-xs font-bold text-pink-400">
              <span className="flex items-center gap-1">
                <Film size={14} className="animate-spin" /> {t('exporting_video')}
              </span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${exportProgress}%` }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-100"
              />
            </div>
          </div>
        ) : (
          hasVideoClips && (
            <div className="mb-5">
              <button
                onClick={onExportBoomerang}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition active:scale-98"
              >
                <Film size={16} /> {t('btn_export_boomerang')}
              </button>
            </div>
          )
        )}

        {/* QR Code Container for Phone Scan */}
        <div className="bg-white p-4 rounded-2xl w-40 h-40 mx-auto mb-5 flex flex-col items-center justify-center shadow-inner">
          <QRCodeSVG value={shareUrl} size={118} level="M" />
          <span className="text-[10px] text-neutral-500 font-bold mt-1.5 flex items-center gap-1">
            <QrCode size={11} /> {t('qr_hint')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onDownload}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition active:scale-98"
          >
            <Download size={18} /> {t('btn_download_hd')}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onPrint}
              className="py-2.5 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-98"
            >
              <Printer size={15} /> {t('btn_print')}
            </button>
            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-98"
            >
              <Share2 size={15} /> {t('btn_share')}
            </button>
          </div>

          {/* Commercial Kiosk & Hardware Printers */}
          <div className="pt-3 border-t border-neutral-800/80 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Printer size={13} className="text-amber-400" /> Chế Độ Kiosk & Máy In Chuyên Dụng
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPrintDnpSplit}
                className="py-2.5 px-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1 transition active:scale-95"
                title="Ghép 2 dải 2x6 trên khung 4x6 (1200x1800 300DPI) để dao máy DNP tự xẻ đôi"
              >
                <span>📸 In DNP 2x6 Split</span>
              </button>

              <button
                onClick={onPrintThermalReceipt}
                className="py-2.5 px-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 flex items-center justify-center gap-1 transition active:scale-95"
                title="In dải ảnh đen trắng 1-bit Atkinson qua WebUSB / WebSerial"
              >
                <span>🧾 In Hóa Đơn Nhiệt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
