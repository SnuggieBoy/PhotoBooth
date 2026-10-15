import { useState, useRef } from 'react'
import {
  Camera,
  Sparkles,
  LayoutGrid,
  Palette,
  Smile,
  RefreshCw,
  Share2,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Brush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react'
import CameraView from './components/CameraView'
import PhotoStripPreview from './components/PhotoStripPreview'
import ShareModal from './components/ShareModal'
import { FILTERS, FRAME_COLORS, STICKERS } from './utils/filters'
import { useLanguage, LanguageSelector } from './i18n/LanguageContext'
import {
  BRUSH_TYPES,
  DOODLE_COLORS,
  BRUSH_SIZES,
  SPARKLE_EMOJIS,
  drawSingleStroke,
} from './utils/doodleEngine'
import { exportBoomerangMp4 } from './utils/boomerangExporter'
import { COLLAB_FRAMES } from './utils/collabFrames'
import { createDnp2x6SplitCanvas } from './utils/dnpKioskAdapter'
import { atkinsonDither, buildEscPosPayload, printViaWebUsb } from './utils/thermalDither'

export default function App() {
  const { t, language } = useLanguage()

  // Navigation Steps: 'setup' -> 'capturing' -> 'editing'
  const [step, setStep] = useState('setup')

  // Photobooth Configuration
  const [layout, setLayout] = useState('strip-4') // 'strip-4' | 'grid-4' | 'strip-2'
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[1]) // Haru default
  const [countdownDuration, setCountdownDuration] = useState(3) // 3s
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0]) // White
  const [customText, setCustomText] = useState('K-PHOTOBOOTH')
  const [selectedCollabFrame, setSelectedCollabFrame] = useState(COLLAB_FRAMES[0])

  // Captured Photos & Boomerang Video Clips
  const [photos, setPhotos] = useState([])
  const [videoClips, setVideoClips] = useState([])
  const [currentShotIndex, setCurrentShotIndex] = useState(0)

  // Stickers placed on the strip
  const [placedStickers, setPlacedStickers] = useState([])

  // Purikura Doodle Studio State
  const [editTab, setEditTab] = useState('stickers') // 'stickers' | 'doodle'
  const [doodleStrokes, setDoodleStrokes] = useState([])
  const [doodleUndoStack, setDoodleUndoStack] = useState([])
  const [activeDoodleTool, setActiveDoodleTool] = useState(BRUSH_TYPES.NEON)
  const [doodleColor, setDoodleColor] = useState(DOODLE_COLORS[0].value) // Neon pink
  const [doodleSize, setDoodleSize] = useState(BRUSH_SIZES[1].size) // Medium (12)
  const [sparkleEmoji, setSparkleEmoji] = useState(SPARKLE_EMOJIS[0]) // '✨'

  // Boomerang Export State
  const [isExportingVideo, setIsExportingVideo] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [boomerangVideoUrl, setBoomerangVideoUrl] = useState(null)

  // Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const stripRef = useRef(null)

  // Total shots required based on layout
  const targetShotsCount = layout === 'strip-2' ? 2 : 4

  // Handle a new snapshot taken from CameraView
  const handlePhotoTaken = (dataUrl, capturedFrames = []) => {
    const updatedPhotos = [...photos, dataUrl]
    setPhotos(updatedPhotos)
    setVideoClips((prev) => [...prev, capturedFrames])

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
    setVideoClips([])
    setCurrentShotIndex(0)
    setPlacedStickers([])
    setDoodleStrokes([])
    setDoodleUndoStack([])
    setBoomerangVideoUrl(null)
    setStep('capturing')
  }

  // Export Boomerang MP4 Video
  const handleExportBoomerang = async () => {
    if (videoClips.length === 0) return
    setIsExportingVideo(true)
    setExportProgress(0)
    try {
      const { url } = await exportBoomerangMp4({
        videoClips,
        layout,
        frameColor,
        customText,
        stickers: placedStickers,
        doodleStrokes,
        filterCss: selectedFilter.css,
        language,
        onProgress: (p) => setExportProgress(p),
      })
      setBoomerangVideoUrl(url)
    } catch (err) {
      console.error('Boomerang error:', err)
      alert('Lỗi tạo video Boomerang: ' + err.message)
    } finally {
      setIsExportingVideo(false)
    }
  }

  const handleDownloadVideo = () => {
    if (!boomerangVideoUrl) return
    const link = document.createElement('a')
    link.download = `k-photobooth-boomerang-${Date.now()}.mp4`
    link.href = boomerangVideoUrl
    link.click()
  }

  // Reset to start
  const handleRetake = () => {
    if (window.confirm(t('btn_retake_confirm'))) {
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

  // Doodle Handlers
  const handleDoodleStrokeComplete = (newStroke) => {
    setDoodleStrokes((prev) => [...prev, newStroke])
    setDoodleUndoStack([]) // Clear redo stack on new action
  }

  const handleUndoDoodle = () => {
    if (doodleStrokes.length === 0) return
    const last = doodleStrokes[doodleStrokes.length - 1]
    setDoodleStrokes((prev) => prev.slice(0, prev.length - 1))
    setDoodleUndoStack((prev) => [...prev, last])
  }

  const handleRedoDoodle = () => {
    if (doodleUndoStack.length === 0) return
    const next = doodleUndoStack[doodleUndoStack.length - 1]
    setDoodleUndoStack((prev) => prev.slice(0, prev.length - 1))
    setDoodleStrokes((prev) => [...prev, next])
  }

  const handleClearDoodles = () => {
    if (doodleStrokes.length === 0) return
    if (window.confirm(t('btn_clear_doodle') + '?')) {
      setDoodleUndoStack((prev) => [...prev, ...doodleStrokes])
      setDoodleStrokes([])
    }
  }

  // Shared High-Resolution Photo Strip Canvas Generator
  const renderPhotoStripToCanvas = async (scale = 3) => {
    if (photos.length === 0) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const isGrid = layout === 'grid-4'
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

    // Draw Purikura Doodles with Sub-Pixel Scale Alignment
    if (doodleStrokes.length > 0) {
      const previewEl = stripRef.current
      const previewWidth = previewEl?.clientWidth || (isGrid ? 380 : 260)
      const doodleScale = stripWidth / previewWidth

      doodleStrokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke, doodleScale)
      })
    }

    // Footer Info
    const footerY = stripHeight - 20 * scale
    ctx.font = `700 ${9 * scale}px sans-serif`
    ctx.textAlign = 'left'
    ctx.fillStyle = frameColor.text

    const locale =
      language === 'vi'
        ? 'vi-VN'
        : language === 'ko'
        ? 'ko-KR'
        : language === 'ja'
        ? 'ja-JP'
        : 'en-US'
    ctx.fillText(
      new Date().toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paddingX,
      footerY - 4 * scale
    )

    ctx.font = `600 ${7 * scale}px monospace`
    ctx.globalAlpha = 0.6
    ctx.fillText(t('strip_city_slogan'), paddingX, footerY + 8 * scale)
    ctx.globalAlpha = 1.0

    return canvas
  }

  // High-Resolution 300 DPI Canvas Rendering & Download
  const handleDownloadHD = async () => {
    const canvas = await renderPhotoStripToCanvas(3)
    if (!canvas) return

    const downloadUrl = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `k-photobooth-${Date.now()}.png`
    link.href = downloadUrl
    link.click()
  }

  // DNP DS-RX1HS Commercial Kiosk 2x6 Split on 4x6 Paper
  const handlePrintDnpSplit = async () => {
    const stripCanvas = await renderPhotoStripToCanvas(3)
    if (!stripCanvas) return

    const splitCanvas = await createDnp2x6SplitCanvas(stripCanvas.toDataURL('image/png', 1.0))
    const downloadUrl = splitCanvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `dnp-rx1hs-2x6-split-${Date.now()}.png`
    link.href = downloadUrl
    link.click()
  }

  // Retro Thermal Receipt Printer (58mm/80mm 1-bit Atkinson Dithering)
  const handlePrintThermalReceipt = async () => {
    const stripCanvas = await renderPhotoStripToCanvas(1.5)
    if (!stripCanvas) return

    // Scale to standard 80mm printer width (576px)
    const targetWidth = 576
    const targetHeight = Math.round((targetWidth / stripCanvas.width) * stripCanvas.height)

    const thermalCanvas = document.createElement('canvas')
    thermalCanvas.width = targetWidth
    thermalCanvas.height = targetHeight
    const tCtx = thermalCanvas.getContext('2d')
    tCtx.drawImage(stripCanvas, 0, 0, targetWidth, targetHeight)

    const imageData = tCtx.getImageData(0, 0, targetWidth, targetHeight)
    const { packed, bytesPerRow, height } = atkinsonDither(imageData)
    const escPosBytes = buildEscPosPayload({ packed, bytesPerRow, height })

    try {
      await printViaWebUsb(escPosBytes)
      alert('Đã gửi lệnh in ESC/POS thành công tới máy in nhiệt!')
    } catch (err) {
      console.warn('WebUSB Print fallback:', err)
      // Provide download of Atkinson preview
      const previewDataUrl = thermalCanvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `receipt-photobooth-${Date.now()}.png`
      link.href = previewDataUrl
      link.click()
      alert('Chưa kết nối WebUSB máy in nhiệt. Đã tải dải ảnh đen trắng 1-bit Atkinson về máy!')
    }
  }

  // Print trigger
  const handlePrint = () => {
    window.print()
  }

  // Layout list with translation
  const layoutOptions = [
    { id: 'strip-4', label: t('layout_strip4'), sub: t('layout_strip4_sub'), count: 4 },
    { id: 'grid-4', label: t('layout_grid4'), sub: t('layout_grid4_sub'), count: 4 },
    { id: 'strip-2', label: t('layout_strip2'), sub: t('layout_strip2_sub'), count: 2 },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                {t('app_title')}
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest hidden sm:block">
                {t('app_subtitle')}
              </p>
            </div>
          </div>

          {/* Right Header: Stepper + Language Selector */}
          <div className="flex items-center gap-3">
            {/* Stepper Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400">
              <span
                className={`px-3 py-1 rounded-full ${
                  step === 'setup'
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                    : 'bg-neutral-900 border border-neutral-800'
                }`}
              >
                {t('step_setup')}
              </span>
              <ChevronRight size={13} />
              <span
                className={`px-3 py-1 rounded-full ${
                  step === 'capturing'
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                    : 'bg-neutral-900 border border-neutral-800'
                }`}
              >
                {t('step_capture')}
              </span>
              <ChevronRight size={13} />
              <span
                className={`px-3 py-1 rounded-full ${
                  step === 'editing'
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                    : 'bg-neutral-900 border border-neutral-800'
                }`}
              >
                {t('step_edit')}
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <LanguageSelector />
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
                {t('setup_badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {t('setup_title')}
              </h2>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                {t('setup_desc')}
              </p>
            </div>

            {/* Layout Choices */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <LayoutGrid size={15} /> {t('layout_title')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {layoutOptions.map((item) => (
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
                <Palette size={15} /> {t('filter_title')}
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
                      <p className="font-bold text-xs text-white">{t(f.nameKey) || f.name}</p>
                      <p className="text-[10px] text-neutral-400">{t(f.subKey) || f.enName}</p>
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

            {/* Concept / Idol Collab Cutouts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles size={15} /> Khung Ghép Thần Tượng & AR Concept
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COLLAB_FRAMES.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setSelectedCollabFrame(cf)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedCollabFrame.id === cf.id
                        ? 'border-pink-500 bg-pink-500/10 shadow-md shadow-pink-500/15'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{cf.icon}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400">
                        {cf.badge}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-white">{cf.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{cf.description || cf.enName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Duration */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                ⏱️ {t('countdown_title')}
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
                    {sec} {t('seconds_unit')}
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
                <Camera size={20} /> {t('start_capture_btn')} ({targetShotsCount} {t('poses_label')})
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
                <ArrowLeft size={14} /> {t('reselect_layout')}
              </button>
              <div className="flex items-center gap-2 text-xs font-bold">
                {selectedCollabFrame.id !== 'none' && (
                  <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {selectedCollabFrame.icon} {selectedCollabFrame.name}
                  </span>
                )}
                <span className="text-pink-400">
                  {t('active_filter')}: {t(selectedFilter.nameKey) || selectedFilter.name}
                </span>
              </div>
            </div>

            <CameraView
              onPhotoTaken={handlePhotoTaken}
              shotsCount={targetShotsCount}
              currentShotIndex={currentShotIndex}
              filterCss={selectedFilter.css}
              countdownDuration={countdownDuration}
              collabFrame={selectedCollabFrame.id}
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
            {/* Left: Strip Live Preview with Purikura Canvas Overlay */}
            <div className="md:col-span-5 flex justify-center sticky top-20">
              <PhotoStripPreview
                stripRef={stripRef}
                photos={photos}
                layout={layout}
                frameColor={frameColor}
                customText={customText}
                stickers={placedStickers}
                onRemoveSticker={handleRemoveSticker}
                doodleStrokes={doodleStrokes}
                onDoodleStrokeComplete={handleDoodleStrokeComplete}
                activeDoodleTool={activeDoodleTool}
                doodleColor={doodleColor}
                doodleSize={doodleSize}
                sparkleEmoji={sparkleEmoji}
                isDoodleMode={editTab === 'doodle'}
              />
            </div>

            {/* Right: Customization Controls */}
            <div className="md:col-span-7 space-y-6 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-black text-white">{t('edit_title')}</h3>
                <p className="text-xs text-neutral-400">{t('edit_desc')}</p>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {t('strip_title_label')}
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={t('strip_title_placeholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-pink-500 text-sm font-bold text-white uppercase tracking-wider"
                />
              </div>

              {/* Frame Color Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {t('frame_color_label')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        {t(c.nameKey) || c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Selector: Stickers vs Purikura Doodle Studio */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800 gap-1">
                  <button
                    onClick={() => setEditTab('stickers')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      editTab === 'stickers'
                        ? 'bg-neutral-800 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smile size={15} /> {t('tab_stickers')}
                  </button>
                  <button
                    onClick={() => setEditTab('doodle')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      editTab === 'doodle'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Brush size={15} /> {t('tab_doodle')}
                  </button>
                </div>
              </div>

              {/* TAB 1: Sticker Selector */}
              {editTab === 'stickers' && (
                <div className="space-y-2.5 animate-fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Smile size={14} /> {t('sticker_label')}
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
              )}

              {/* TAB 2: Purikura Doodle Studio Controls */}
              {editTab === 'doodle' && (
                <div className="space-y-4 animate-fade-in bg-neutral-950/70 p-4 rounded-2xl border border-pink-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> {t('doodle_hint')}
                    </span>

                    {/* Undo / Redo / Clear actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={doodleStrokes.length === 0}
                        onClick={handleUndoDoodle}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 transition"
                        title={t('btn_undo')}
                      >
                        <Undo2 size={14} />
                      </button>
                      <button
                        disabled={doodleUndoStack.length === 0}
                        onClick={handleRedoDoodle}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 transition"
                        title={t('btn_redo')}
                      >
                        <Redo2 size={14} />
                      </button>
                      <button
                        disabled={doodleStrokes.length === 0}
                        onClick={handleClearDoodles}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-40 transition"
                        title={t('btn_clear_doodle')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Brush Type Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: BRUSH_TYPES.NEON, label: t('brush_neon'), icon: Sparkles },
                      { id: BRUSH_TYPES.PASTEL, label: t('brush_pastel'), icon: Brush },
                      { id: BRUSH_TYPES.SPARKLE, label: t('brush_sparkle'), icon: Smile },
                      { id: BRUSH_TYPES.ERASER, label: t('brush_eraser'), icon: Eraser },
                    ].map((tool) => {
                      const Icon = tool.icon
                      const isActive = activeDoodleTool === tool.id
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setActiveDoodleTool(tool.id)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            isActive
                              ? 'border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <Icon size={14} />
                          <span className="truncate">{tool.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Sparkle Emoji Selector (If Sparkle Brush active) */}
                  {activeDoodleTool === BRUSH_TYPES.SPARKLE && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-neutral-400">
                        Chọn họa tiết đóng dấu:
                      </span>
                      <div className="flex gap-2">
                        {SPARKLE_EMOJIS.map((em) => (
                          <button
                            key={em}
                            onClick={() => setSparkleEmoji(em)}
                            className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition ${
                              sparkleEmoji === em
                                ? 'border-pink-500 bg-pink-500/20'
                                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Swatches (Only when not in eraser mode) */}
                  {activeDoodleTool !== BRUSH_TYPES.ERASER && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-neutral-400">
                        {t('doodle_color_label')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {DOODLE_COLORS.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => setDoodleColor(col.value)}
                            title={col.label}
                            style={{ backgroundColor: col.value }}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                              doodleColor === col.value
                                ? 'scale-125 border-white ring-2 ring-pink-500/50'
                                : 'border-black/30 hover:scale-110'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brush Size Selector */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] font-bold text-neutral-400">
                      {t('doodle_size_label')}
                    </span>
                    <div className="flex gap-2">
                      {BRUSH_SIZES.map((sz) => (
                        <button
                          key={sz.id}
                          onClick={() => setDoodleSize(sz.size)}
                          className={`w-8 h-8 rounded-xl border text-xs font-extrabold flex items-center justify-center transition ${
                            doodleSize === sz.size
                              ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions: Retake vs Share & Download */}
              <div className="pt-4 border-t border-neutral-800 flex flex-wrap gap-3">
                <button
                  onClick={handleRetake}
                  className="py-3 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs text-neutral-300 flex items-center gap-2 transition"
                >
                  <RefreshCw size={15} /> {t('btn_retake')}
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition active:scale-98"
                >
                  <Share2 size={16} /> {t('btn_export')}
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
        onExportBoomerang={handleExportBoomerang}
        onDownloadVideo={handleDownloadVideo}
        isExportingVideo={isExportingVideo}
        exportProgress={exportProgress}
        boomerangVideoUrl={boomerangVideoUrl}
        onPrintDnpSplit={handlePrintDnpSplit}
        onPrintThermalReceipt={handlePrintThermalReceipt}
        hasVideoClips={videoClips.length > 0}
      />
    </div>
  )
}
