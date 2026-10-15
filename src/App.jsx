import { useState, useRef } from 'react'
import {
  Camera,
  Sparkles,
  LayoutGrid,
  Palette,
  Smile,
  RefreshCw,
  Download,
  Share2,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import CameraView from './components/CameraView'
import PhotoStripPreview from './components/PhotoStripPreview'
import ShareModal from './components/ShareModal'
import { FILTERS, FRAME_COLORS, STICKERS } from './utils/filters'

export default function App() {
  // Navigation Steps: 'setup' -> 'capturing' -> 'editing'
  const [step, setStep] = useState('setup')

  // Photobooth Configuration
  const [layout, setLayout] = useState('strip-4') // 'strip-4' | 'grid-4' | 'strip-2'
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[1]) // Haru default
  const [countdownDuration, setCountdownDuration] = useState(3) // 3s
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0]) // White
  const [customText, setCustomText] = useState('K-PHOTOBOOTH')

  // Captured Photos Array
  const [photos, setPhotos] = useState([])
  const [currentShotIndex, setCurrentShotIndex] = useState(0)

  // Stickers placed on the strip
  const [placedStickers, setPlacedStickers] = useState([])

  // Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const stripRef = useRef(null)

  // Total shots required based on layout
  const targetShotsCount = layout === 'strip-2' ? 2 : 4

  // Handle a new snapshot taken from CameraView
  const handlePhotoTaken = (dataUrl) => {
    const updatedPhotos = [...photos, dataUrl]
    setPhotos(updatedPhotos)

    if (updatedPhotos.length < targetShotsCount) {
      setCurrentShotIndex(updatedPhotos.length)
    } else {
      // Completed all shots -> move to editing/decorating
      setStep('editing')
    }
  }

  // Start capture session
  const startSession = () => {
    setPhotos([])
    setCurrentShotIndex(0)
    setPlacedStickers([])
    setStep('capturing')
  }

  // Reset to start
  const handleRetake = () => {
    if (window.confirm('Bạn có muốn chụp lại từ đầu không?')) {
      startSession()
    }
  }

  // Add sticker to strip
  const handleAddSticker = (emoji) => {
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
    }
    setPlacedStickers((prev) => [...prev, newSticker])
  }

  const handleRemoveSticker = (id) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id))
  }

  // High-Resolution 300 DPI Canvas Rendering & Download
  const handleDownloadHD = async () => {
    if (photos.length === 0) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const isGrid = layout === 'grid-4'
    const scale = 3 // High resolution scale
    const stripWidth = (isGrid ? 380 : 260) * scale
    const stripHeight = (isGrid ? 520 : 760) * scale

    canvas.width = stripWidth
    canvas.height = stripHeight

    // Fill Frame Background
    ctx.fillStyle = frameColor.bg
    ctx.fillRect(0, 0, stripWidth, stripHeight)

    // Header Text
    ctx.fillStyle = frameColor.text
    ctx.font = `900 ${14 * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = '3px'
    ctx.fillText(customText.toUpperCase(), stripWidth / 2, 28 * scale)

    // Draw Photos onto Canvas
    const photoWidth = (isGrid ? 165 : 224) * scale
    const photoHeight = (isGrid ? 165 : 142) * scale
    const paddingX = 18 * scale
    const startY = 42 * scale
    const gap = 12 * scale

    const loadedImages = await Promise.all(
      photos.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.src = src
          })
      )
    )

    loadedImages.forEach((img, i) => {
      let x = paddingX
      let y = startY + i * (photoHeight + gap)

      if (isGrid) {
        const col = i % 2
        const row = Math.floor(i / 2)
        x = paddingX + col * (photoWidth + gap)
        y = startY + row * (photoHeight + gap)
      }

      ctx.save()
      // Optional rounded corners
      ctx.drawImage(img, x, y, photoWidth, photoHeight)
      ctx.restore()
    })

    // Draw Placed Stickers
    ctx.font = `${28 * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    placedStickers.forEach((stk) => {
      const sx = (stk.x / 100) * stripWidth
      const sy = (stk.y / 100) * stripHeight
      ctx.fillText(stk.emoji, sx, sy)
    })

    // Footer Info
    const footerY = stripHeight - 20 * scale
    ctx.font = `700 ${9 * scale}px sans-serif`
    ctx.textAlign = 'left'
    ctx.fillStyle = frameColor.text
    ctx.fillText(
      new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paddingX,
      footerY - 4 * scale
    )

    ctx.font = `600 ${7 * scale}px monospace`
    ctx.globalAlpha = 0.6
    ctx.fillText('SEOUL • TOKYO • SAIGON', paddingX, footerY + 8 * scale)
    ctx.globalAlpha = 1.0

    // Trigger Browser Download
    const downloadUrl = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `k-photobooth-${Date.now()}.png`
    link.href = downloadUrl
    link.click()
  }

  // Print trigger
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                K-PHOTOBOOTH
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest hidden sm:block">
                Web & Mobile Experience
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <span
              className={`px-3 py-1 rounded-full ${
                step === 'setup'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                  : 'bg-neutral-900 border border-neutral-800'
              }`}
            >
              1. Cài Đặt
            </span>
            <ChevronRight size={14} />
            <span
              className={`px-3 py-1 rounded-full ${
                step === 'capturing'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                  : 'bg-neutral-900 border border-neutral-800'
              }`}
            >
              2. Chụp Ảnh
            </span>
            <ChevronRight size={14} />
            <span
              className={`px-3 py-1 rounded-full ${
                step === 'editing'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                  : 'bg-neutral-900 border border-neutral-800'
              }`}
            >
              3. Trang Trí & Lưu
            </span>
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* ================= STEP 1: SETUP SCREEN ================= */}
        {step === 'setup' && (
          <div className="max-w-3xl mx-auto w-full space-y-8 py-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                Studio Trực Tuyến Thế Hệ Mới
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Tạo Dải Ảnh 4-Cut Đậm Chất Hàn Quốc
              </h2>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                Chụp ảnh cùng bạn bè ngay trên trình duyệt điện thoại hoặc máy tính với bộ lọc màu Haru Film, Sticker Y2K và in ảnh tức thì.
              </p>
            </div>

            {/* Layout Choices */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <LayoutGrid size={15} /> Chọn Kiểu Khung Ảnh
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'strip-4', label: '4-Cut Dọc', sub: '1x4 Classic Life4Cuts', count: 4 },
                  { id: 'grid-4', label: '4-Cut Ô Vuông', sub: '2x2 Photoism Style', count: 4 },
                  { id: 'strip-2', label: '2-Cut Polaroid', sub: 'Duo Moments', count: 2 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      layout === item.id
                        ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-white">{item.label}</span>
                      {layout === item.id && (
                        <CheckCircle size={15} className="text-pink-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Choices */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Palette size={15} /> Bộ Lọc Màu Yêu Thích
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedFilter.id === f.id
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{f.name}</p>
                      <p className="text-[10px] text-neutral-400">{f.enName}</p>
                    </div>
                    <span
                      style={{ backgroundColor: `${f.color}20`, color: f.color }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {f.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Duration */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                ⏱️ Thời Gian Đếm Ngược Giữa Mỗi Lần Chụp
              </h3>
              <div className="flex gap-3">
                {[3, 5, 8].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setCountdownDuration(sec)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                      countdownDuration === sec
                        ? 'border-pink-500 bg-pink-500 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {sec} Giây
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 text-center">
              <button
                onClick={startSession}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-rose-600 text-white font-black text-base shadow-xl shadow-pink-500/25 transition active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                <Camera size={20} /> Bắt Đầu Chụp ({targetShotsCount} Poses)
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CAMERA CAPTURE ================= */}
        {step === 'capturing' && (
          <div className="max-w-2xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setStep('setup')}
                className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Chọn lại kiểu khung
              </button>
              <span className="text-xs font-bold text-pink-400">
                Filter: {selectedFilter.name}
              </span>
            </div>

            <CameraView
              onPhotoTaken={handlePhotoTaken}
              shotsCount={targetShotsCount}
              currentShotIndex={currentShotIndex}
              filterCss={selectedFilter.css}
              countdownDuration={countdownDuration}
            />

            {/* Thumbnails of already taken shots */}
            {photos.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {Array.from({ length: targetShotsCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden"
                  >
                    {photos[i] ? (
                      <img
                        src={photos[i]}
                        alt={`Pose ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-bold">
                        #{i + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: DECORATE & EDIT ================= */}
        {step === 'editing' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-4">
            {/* Left: Strip Live Preview */}
            <div className="md:col-span-5 flex justify-center sticky top-20">
              <PhotoStripPreview
                stripRef={stripRef}
                photos={photos}
                layout={layout}
                frameColor={frameColor}
                customText={customText}
                stickers={placedStickers}
                onRemoveSticker={handleRemoveSticker}
              />
            </div>

            {/* Right: Customization Controls */}
            <div className="md:col-span-7 space-y-6 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-black text-white">Tùy Chỉnh Dải Ảnh Của Bạn</h3>
                <p className="text-xs text-neutral-400">
                  Chọn màu viền, gắn sticker ngộ nghĩnh và ghi tiêu đề kỷ niệm.
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Tiêu Đề Dải Ảnh:
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="VD: K-PHOTOBOOTH, HARU 2026..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-pink-500 text-sm font-bold text-white uppercase tracking-wider"
                />
              </div>

              {/* Frame Color Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Màu Khung Ảnh:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {FRAME_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFrameColor(c)}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        frameColor.id === c.id
                          ? 'border-pink-500 ring-2 ring-pink-500/30'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: c.bg }}
                        className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                      />
                      <span className="text-[11px] font-bold text-neutral-200 truncate">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticker Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Smile size={14} /> Nhấn Sticker Để Thêm Vào Ảnh:
                </label>
                <div className="flex flex-wrap gap-2">
                  {STICKERS.map((stk, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSticker(stk)}
                      className="w-10 h-10 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xl flex items-center justify-center transition active:scale-95"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions: Retake vs Share & Download */}
              <div className="pt-4 border-t border-neutral-800 flex flex-wrap gap-3">
                <button
                  onClick={handleRetake}
                  className="py-3 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs text-neutral-300 flex items-center gap-2 transition"
                >
                  <RefreshCw size={15} /> Chụp Lại
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition active:scale-98"
                >
                  <Share2 size={16} /> Xuất Ảnh & Quét QR
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share & Download Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDownload={handleDownloadHD}
        onPrint={handlePrint}
      />
    </div>
  )
}
