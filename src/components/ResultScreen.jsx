import { useEffect } from 'react'
import {
  Download,
  Printer,
  Film,
  Play,
  Share2,
  RefreshCw,
  Sparkles,
  QrCode,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import PhotoStripPreview from './PhotoStripPreview'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

export default function ResultScreen({
  stripRef,
  photos,
  layout,
  frameColor,
  customText,
  placedStickers,
  doodleStrokes,
  onDownloadHD,
  onExportBoomerang,
  onDownloadVideo,
  isExportingVideo,
  exportProgress,
  boomerangVideoUrl,
  hasVideoClips,
  onPrintStandard,
  onPrintDnpSplit,
  onPrintThermalReceipt,
  onStartNewSession,
  onBackToDecorate,
}) {
  const { t } = useLanguage()

  // Trigger celebratory confetti on screen entry
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF3D96', '#FFB8D0', '#DCD3FF', '#CDEBFF', '#FFE7A3'],
    })
  }, [])

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
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToDecorate}
            className="flex items-center gap-1.5 text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Chỉnh sửa thêm</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#29252C] flex items-center justify-center gap-1.5">
              <span>{t('result_title')}</span>
            </h2>
            <p className="text-[10px] text-[#766F7B] font-medium hidden sm:block">
              {t('result_sub')}
            </p>
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Result Showcase */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Final Finished Photo Strip Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:sticky lg:top-24">
            <div className="p-4 bg-white rounded-3xl border border-pink-100 shadow-2xl shadow-pink-500/10 flex flex-col items-center">
              <PhotoStripPreview
                stripRef={stripRef}
                photos={photos}
                layout={layout}
                frameColor={frameColor}
                customText={customText}
                stickers={placedStickers}
                doodleStrokes={doodleStrokes}
                isDoodleMode={false}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#FF3D96]">
              <Sparkles size={14} />
              <span>Dải ảnh 300 DPI chính thức</span>
            </div>
          </div>

          {/* Right Column: Download, Video, Print & QR Actions */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. HD 300 DPI DOWNLOAD CARD */}
            <div className="bg-white border-2 border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#FF3D96] flex items-center justify-center">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#29252C]">Ảnh Gốc Siêu Nét HD 300 DPI</h4>
                    <p className="text-[11px] text-[#766F7B]">Chuẩn in photobooth chất lượng cao không vỡ nét</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onDownloadHD}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF3D96] to-[#FF6BA8] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-xs sm:text-sm shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Download size={16} />
                <span>{t('btn_download_hd')}</span>
              </button>
            </div>

            {/* 2. BOOMERANG MOVING PHOTO MP4 CARD */}
            {hasVideoClips && (
              <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
                      <Film size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#29252C]">Moving Photo Boomerang (MP4)</h4>
                      <p className="text-[11px] text-[#766F7B]">{t('boomerang_desc')}</p>
                    </div>
                  </div>
                </div>

                {boomerangVideoUrl ? (
                  <div className="space-y-3">
                    <div className="flex justify-center p-3 bg-[#FFF7EF] rounded-2xl border border-pink-100">
                      <video
                        src={boomerangVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-36 h-48 object-cover rounded-xl shadow-lg border border-pink-200"
                      />
                    </div>
                    <button
                      onClick={onDownloadVideo}
                      className="w-full py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                    >
                      <Download size={15} />
                      <span>{t('btn_download_video')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={isExportingVideo}
                    onClick={onExportBoomerang}
                    className="w-full py-3 px-4 rounded-2xl bg-[#FFF7EF] hover:bg-pink-50 border border-pink-200 text-[#FF3D96] font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <Play size={15} />
                    <span>
                      {isExportingVideo
                        ? `${t('exporting_video')} (${Math.round(exportProgress * 100)}%)`
                        : t('btn_export_boomerang')}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* 3. PRINT OPTIONS GRID (STANDARD, DNP 2X6, THERMAL RECEIPT) */}
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-[#766F7B] flex items-center gap-1.5">
                <Printer size={15} className="text-[#FF3D96]" />
                <span>Tùy chọn in ấn chuyên nghiệp:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Standard Print */}
                <button
                  onClick={onPrintStandard}
                  className="p-3 rounded-2xl bg-[#FFF7EF] hover:bg-pink-50 border border-pink-100 text-left transition cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xl mb-1">🖨️</span>
                  <div>
                    <p className="font-black text-xs text-[#29252C]">{t('btn_print')}</p>
                    <p className="text-[10px] text-[#766F7B]">In máy in văn phòng</p>
                  </div>
                </button>

                {/* DNP DS-RX1HS 2x6 Split */}
                <button
                  onClick={onPrintDnpSplit}
                  className="p-3 rounded-2xl bg-[#FFF7EF] hover:bg-pink-50 border border-pink-100 text-left transition cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xl mb-1">📸</span>
                  <div>
                    <p className="font-black text-xs text-[#29252C]">{t('btn_print_dnp')}</p>
                    <p className="text-[10px] text-[#766F7B]">Chuẩn Kiosk thương mại</p>
                  </div>
                </button>

                {/* Thermal Receipt Print */}
                <button
                  onClick={onPrintThermalReceipt}
                  className="p-3 rounded-2xl bg-[#FFF7EF] hover:bg-pink-50 border border-pink-100 text-left transition cursor-pointer flex flex-col justify-between"
                >
                  <span className="text-xl mb-1">🧾</span>
                  <div>
                    <p className="font-black text-xs text-[#29252C]">{t('btn_print_thermal')}</p>
                    <p className="text-[10px] text-[#766F7B]">Máy in bill nhiệt Atkinson</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. QR CODE INSTANT PHONE SCAN */}
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-[#FFF7EF] rounded-2xl border border-pink-100 shrink-0">
                <QRCodeSVG
                  value={shareUrl}
                  size={96}
                  level="M"
                  fgColor="#FF3D96"
                  bgColor="transparent"
                />
              </div>
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF3D96] px-2 py-0.5 rounded-full bg-pink-100">
                  📱 Mobile Scan
                </span>
                <h4 className="font-black text-sm text-[#29252C]">Lưu Ngay Về Điện Thoại</h4>
                <p className="text-[11px] text-[#766F7B] leading-relaxed">
                  {t('qr_hint')} để mở phiên ảnh và lưu dải ảnh kỷ niệm cùng bạn bè.
                </p>
                <button
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3D96] hover:underline cursor-pointer pt-1"
                >
                  <Share2 size={13} />
                  <span>{t('btn_share')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar with NEW SESSION CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-pink-100/90 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={onStartNewSession}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-base shadow-xl shadow-[#FF3D96]/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={18} />
            <span>{t('btn_new_session')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
