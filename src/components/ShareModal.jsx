import { useEffect } from 'react'
import { Download, Printer, Share2, X, Check, QrCode, Sparkles } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'

export default function ShareModal({
  isOpen,
  onClose,
  onDownload,
  onPrint,
  stripDataUrl,
}) {
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

  // Fallback share url (current window URL with photo hash or demo link)
  const shareUrl = window.location.href

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ảnh K-Photobooth của tôi! ✨',
          text: 'Vừa chụp bộ ảnh photobooth siêu xinh!',
          url: shareUrl,
        })
      } catch (err) {
        console.warn('Share error:', err)
      }
    } else {
      navigator.clipboard?.writeText(shareUrl)
      alert('Đã sao chép liên kết vào bộ nhớ tạm!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 mb-3 shadow-lg shadow-pink-500/30">
            <Sparkles size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-black">Ảnh Của Bạn Đã Sẵn Sàng!</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Lưu kỷ niệm, in ngay dải ảnh hoặc quét mã QR để tải về điện thoại.
          </p>
        </div>

        {/* QR Code Container for Phone Scan */}
        <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto mb-6 flex flex-col items-center justify-center shadow-inner">
          <QRCodeSVG value={shareUrl} size={130} level="M" />
          <span className="text-[10px] text-neutral-500 font-bold mt-2 flex items-center gap-1">
            <QrCode size={11} /> Quét để tải về máy
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onDownload}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition active:scale-98"
          >
            <Download size={18} /> Tải Về Máy (HD 300 DPI)
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onPrint}
              className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-98"
            >
              <Printer size={16} /> In Ảnh Dải Strip
            </button>
            <button
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-98"
            >
              <Share2 size={16} /> Chia Sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
