import { useState, useRef } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import StyleSelectScreen from './components/StyleSelectScreen'
import CameraView from './components/CameraView'
import ReviewScreen from './components/ReviewScreen'
import DecorateScreen from './components/DecorateScreen'
import ResultScreen from './components/ResultScreen'

import { FILTERS, FRAME_COLORS, FRAME_PATTERNS } from './utils/filters'
import { COLLAB_FRAMES } from './utils/collabFrames'
import {
  BRUSH_TYPES,
  DOODLE_COLORS,
  BRUSH_SIZES,
  SPARKLE_EMOJIS,
  drawSingleStroke,
} from './utils/doodleEngine'
import { exportBoomerangMp4 } from './utils/boomerangExporter'
import { createDnp2x6SplitCanvas } from './utils/dnpKioskAdapter'
import { atkinsonDither, buildEscPosPayload, printViaWebUsb } from './utils/thermalDither'
import { useLanguage } from './i18n/LanguageContext'

export default function App() {
  const { t, language } = useLanguage()

  // 6 Dedicated Flow Screens: 'welcome' | 'style' | 'camera' | 'review' | 'decorate' | 'result'
  const [step, setStep] = useState('welcome')

  // Photobooth Configurations
  const [layout, setLayout] = useState('strip-4') // 'strip-4' | 'grid-4' | 'strip-2'
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[1]) // Haru default
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0]) // White
  const [framePattern, setFramePattern] = useState(FRAME_PATTERNS[0]) // Solid default
  const [photoRadius, setPhotoRadius] = useState('12px')
  const [selectedCollabFrame, setSelectedCollabFrame] = useState(COLLAB_FRAMES[0]) // None
  const [countdownDuration, setCountdownDuration] = useState(3) // 3s
  const [customText, setCustomText] = useState('SNUGGIE PHOTOBOOTH')

  // Captured Photos & Boomerang Video Buffers
  const [photos, setPhotos] = useState([])
  const [videoClips, setVideoClips] = useState([])
  const [currentShotIndex, setCurrentShotIndex] = useState(0)

  // Single-shot retake state (when user retakes a specific photo from ReviewScreen)
  const [retakeTargetIndex, setRetakeTargetIndex] = useState(null)

  // Placed Stickers on Strip (with x, y, scale, rotation, type, content, badgeBg, textColor)
  const [placedStickers, setPlacedStickers] = useState([])
  const [selectedStickerId, setSelectedStickerId] = useState(null)

  // Purikura Doodle Studio State
  const [doodleStrokes, setDoodleStrokes] = useState([])
  const [doodleUndoStack, setDoodleUndoStack] = useState([])
  const [activeDoodleTool, setActiveDoodleTool] = useState(BRUSH_TYPES.NEON)
  const [doodleColor, setDoodleColor] = useState(DOODLE_COLORS[0].value) // Neon Pink
  const [doodleSize, setDoodleSize] = useState(BRUSH_SIZES[1].size) // Medium 12
  const [sparkleEmoji, setSparkleEmoji] = useState(SPARKLE_EMOJIS[0]) // '✨'

  // Boomerang Export State
  const [isExportingVideo, setIsExportingVideo] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [boomerangVideoUrl, setBoomerangVideoUrl] = useState(null)

  const stripRef = useRef(null)

  // Target shots needed based on layout
  const targetShotsCount = layout === 'strip-2' ? 2 : 4

  // Handle Photo Taken from CameraView
  const handlePhotoTaken = (dataUrl, capturedFrames = []) => {
    // Case A: User was retaking a specific single photo from Review screen
    if (retakeTargetIndex !== null) {
      const updatedPhotos = [...photos]
      const updatedClips = [...videoClips]
      updatedPhotos[retakeTargetIndex] = dataUrl
      updatedClips[retakeTargetIndex] = capturedFrames
      setPhotos(updatedPhotos)
      setVideoClips(updatedClips)
      setRetakeTargetIndex(null)
      setStep('review')
      return
    }

    // Case B: Regular progressive capture
    const updatedPhotos = [...photos, dataUrl]
    setPhotos(updatedPhotos)
    setVideoClips((prev) => [...prev, capturedFrames])

    if (updatedPhotos.length < targetShotsCount) {
      setCurrentShotIndex(updatedPhotos.length)
    } else {
      setStep('review')
    }
  }

  // Start fresh capture session from Style screen
  const handleStartCapture = () => {
    setPhotos([])
    setVideoClips([])
    setCurrentShotIndex(0)
    setRetakeTargetIndex(null)
    setPlacedStickers([])
    setSelectedStickerId(null)
    setDoodleStrokes([])
    setDoodleUndoStack([])
    setBoomerangVideoUrl(null)
    setStep('camera')
  }

  // Retake individual shot from Review screen
  const handleRetakeSingleShot = (index) => {
    setRetakeTargetIndex(index)
    setStep('camera')
  }

  // Retake all shots from Review screen
  const handleRetakeAllShots = () => {
    if (window.confirm(t('btn_retake_confirm'))) {
      handleStartCapture()
    }
  }

  // Interactive Sticker Handlers
  const handleAddSticker = (item) => {
    const isObject = typeof item === 'object' && item !== null
    const newSticker = {
      id: Date.now() + Math.random(),
      type: isObject ? item.type || 'emoji' : 'emoji',
      content: isObject ? item.content : item,
      badgeBg: isObject ? item.badgeBg : undefined,
      textColor: isObject ? item.textColor : undefined,
      bg: isObject ? item.bg : undefined,
      color: isObject ? item.color : undefined,
      x: 35 + Math.random() * 30,
      y: 25 + Math.random() * 50,
      scale: 1.1,
      rotation: Math.round(Math.random() * 16 - 8),
    }
    setPlacedStickers((prev) => [...prev, newSticker])
    setSelectedStickerId(newSticker.id)
  }

  const handleUpdateSticker = (id, updates) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const handleRemoveSticker = (id) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id))
    if (selectedStickerId === id) setSelectedStickerId(null)
  }

  // Doodle Handlers
  const handleDoodleStrokeComplete = (newStroke) => {
    setDoodleStrokes((prev) => [...prev, newStroke])
    setDoodleUndoStack([])
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

  // High-Resolution 300 DPI Canvas Builder (Synchronized with filters, radius, and sticker transforms)
  const renderPhotoStripToCanvas = async (scale = 3) => {
    if (photos.length === 0) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const isGrid = layout === 'grid-4'
    const stripWidth = (isGrid ? 380 : 260) * scale
    const stripHeight = (isGrid ? 520 : 760) * scale

    canvas.width = stripWidth
    canvas.height = stripHeight

    // 1. Fill Frame Background
    ctx.fillStyle = frameColor.bg
    ctx.fillRect(0, 0, stripWidth, stripHeight)

    // Optional Frame Texture Pattern
    if (framePattern && framePattern.id === 'grid') {
      ctx.strokeStyle = '#ff3d9615'
      ctx.lineWidth = 1 * scale
      for (let gx = 0; gx < stripWidth; gx += 20 * scale) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, stripHeight)
        ctx.stroke()
      }
      for (let gy = 0; gy < stripHeight; gy += 20 * scale) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(stripWidth, gy)
        ctx.stroke()
      }
    } else if (framePattern && framePattern.id === 'dots') {
      ctx.fillStyle = '#ec489920'
      const dotSpacing = 24 * scale
      for (let dx = 12 * scale; dx < stripWidth; dx += dotSpacing) {
        for (let dy = 12 * scale; dy < stripHeight; dy += dotSpacing) {
          ctx.beginPath()
          ctx.arc(dx, dy, 2 * scale, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // 2. Header Text
    ctx.fillStyle = frameColor.text
    ctx.font = `900 ${14 * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = '3px'
    ctx.fillText(customText.toUpperCase(), stripWidth / 2, 28 * scale)

    // 3. Draw Photos onto Canvas (with live filter & rounded corners)
    const photoWidth = (isGrid ? 165 : 224) * scale
    const photoHeight = (isGrid ? 165 : 142) * scale
    const paddingX = 18 * scale
    const startY = 42 * scale
    const gap = 12 * scale
    const numRadius = parseInt(photoRadius) || 12
    const cornerRadius = numRadius * scale

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

    // Preload custom image stickers if any
    const imageStickerMap = new Map()
    const customImageStickers = placedStickers.filter((s) => s.type === 'image' && s.content)
    if (customImageStickers.length > 0) {
      await Promise.all(
        customImageStickers.map(
          (stk) =>
            new Promise((resolve) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.onload = () => {
                imageStickerMap.set(stk.id, img)
                resolve()
              }
              img.onerror = () => resolve()
              img.src = stk.content
            })
        )
      )
    }

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
      // Apply active filter CSS (e.g. Haru Film, Peach Glow, etc.)
      if (selectedFilter && selectedFilter.css && selectedFilter.css !== 'none') {
        ctx.filter = selectedFilter.css
      }

      // Clip rounded photo corners
      if (cornerRadius > 0 && typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.roundRect(x, y, photoWidth, photoHeight, cornerRadius)
        ctx.clip()
      }

      ctx.drawImage(img, x, y, photoWidth, photoHeight)
      ctx.restore()
    })

    // 4. Draw Placed Stickers (with rotation, scale, and types)
    placedStickers.forEach((stk) => {
      const sx = (stk.x / 100) * stripWidth
      const sy = (stk.y / 100) * stripHeight
      const stickerScale = (stk.scale || 1) * scale
      const rotation = ((stk.rotation || 0) * Math.PI) / 180

      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(rotation)

      if (stk.type === 'image') {
        const imgEl = imageStickerMap.get(stk.id)
        if (imgEl && imgEl.naturalWidth > 0) {
          const baseSize = 64 * stickerScale
          const aspect = imgEl.naturalWidth / imgEl.naturalHeight
          let w = baseSize
          let h = baseSize
          if (aspect >= 1) {
            h = baseSize / aspect
          } else {
            w = baseSize * aspect
          }
          ctx.drawImage(imgEl, -w / 2, -h / 2, w, h)
        }
      } else if (stk.type === 'text') {
        ctx.font = `900 ${11 * stickerScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const metrics = ctx.measureText(stk.content)
        const bgW = metrics.width + 16 * stickerScale
        const bgH = 22 * stickerScale
        ctx.fillStyle = stk.badgeBg || '#ff3d96'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 11 * stickerScale)
        } else {
          ctx.rect(-bgW / 2, -bgH / 2, bgW, bgH)
        }
        ctx.fill()
        ctx.fillStyle = stk.textColor || '#ffffff'
        ctx.fillText(stk.content, 0, 0)
      } else if (stk.type === 'tape') {
        ctx.font = `900 ${10 * stickerScale}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const metrics = ctx.measureText(stk.content)
        const bgW = metrics.width + 24 * stickerScale
        const bgH = 20 * stickerScale
        ctx.fillStyle = stk.bg || '#ffe4e6'
        ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH)
        ctx.fillStyle = stk.color || '#f43f5e'
        ctx.fillText(stk.content, 0, 0)
      } else {
        ctx.font = `${28 * stickerScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(stk.content || stk.emoji, 0, 0)
      }
      ctx.restore()
    })

    // 5. Draw Purikura Doodles with Sub-Pixel Scale Alignment
    if (doodleStrokes.length > 0) {
      const previewEl = stripRef.current
      const previewWidth = previewEl?.clientWidth || (isGrid ? 380 : 260)
      const doodleScale = stripWidth / previewWidth

      doodleStrokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke, doodleScale)
      })
    }

    // 6. Footer Info
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

  // Export HD 300 DPI PNG
  const handleDownloadHD = async () => {
    const canvas = await renderPhotoStripToCanvas(3)
    if (!canvas) return
    const downloadUrl = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `snuggie-photobooth-${Date.now()}.png`
    link.href = downloadUrl
    link.click()
  }

  // Export Boomerang MP4
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
        filterCss: selectedFilter?.css || 'none',
        language,
        onProgress: (p) => setExportProgress(p),
      })
      setBoomerangVideoUrl(url)
    } catch (err) {
      console.error('Boomerang error:', err)
      alert('Lỗi xuất video Boomerang: ' + err.message)
    } finally {
      setIsExportingVideo(false)
    }
  }

  const handleDownloadVideo = () => {
    if (!boomerangVideoUrl) return
    const link = document.createElement('a')
    link.download = `snuggie-photobooth-boomerang-${Date.now()}.mp4`
    link.href = boomerangVideoUrl
    link.click()
  }

  // DNP DS-RX1HS 2x6 Split
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

  // Thermal Receipt Print
  const handlePrintThermalReceipt = async () => {
    const stripCanvas = await renderPhotoStripToCanvas(1.5)
    if (!stripCanvas) return

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
      const previewDataUrl = thermalCanvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `receipt-photobooth-${Date.now()}.png`
      link.href = previewDataUrl
      link.click()
      alert('Chưa kết nối WebUSB máy in nhiệt. Đã tải dải ảnh đen trắng 1-bit Atkinson về máy!')
    }
  }

  // Reset entire session
  const handleStartNewSession = () => {
    setPhotos([])
    setVideoClips([])
    setCurrentShotIndex(0)
    setRetakeTargetIndex(null)
    setPlacedStickers([])
    setSelectedStickerId(null)
    setDoodleStrokes([])
    setDoodleUndoStack([])
    setBoomerangVideoUrl(null)
    setStep('welcome')
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] selection:bg-[#FF3D96] selection:text-white">
      {/* SCREEN 01: WELCOME STUDIO */}
      {step === 'welcome' && (
        <WelcomeScreen onStart={() => setStep('style')} />
      )}

      {/* SCREEN 02: CHOOSE PHOTO STYLE */}
      {step === 'style' && (
        <StyleSelectScreen
          layout={layout}
          setLayout={setLayout}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          frameColor={frameColor}
          setFrameColor={setFrameColor}
          selectedCollabFrame={selectedCollabFrame}
          setSelectedCollabFrame={setSelectedCollabFrame}
          countdownDuration={countdownDuration}
          setCountdownDuration={setCountdownDuration}
          customText={customText}
          setCustomText={setCustomText}
          onBack={() => setStep('welcome')}
          onContinue={handleStartCapture}
        />
      )}

      {/* SCREEN 03: CAMERA CAPTURE SESSION */}
      {step === 'camera' && (
        <div className="min-h-[100dvh] bg-[#FFFDF9] flex flex-col justify-between px-2 py-1.5 sm:p-6 safe-top safe-bottom">
          <div className="max-w-3xl w-full mx-auto space-y-2.5 sm:space-y-4 my-auto">
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setStep(retakeTargetIndex !== null ? 'review' : 'style')}
                className="text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                ← {retakeTargetIndex !== null ? 'Quay lại xem ảnh' : 'Chọn lại phong cách'}
              </button>
              <div className="flex items-center gap-2 text-xs font-bold">
                {selectedCollabFrame.id !== 'none' && (
                  <span className="text-[#FF3D96] bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {selectedCollabFrame.icon} {selectedCollabFrame.name}
                  </span>
                )}
                <span className="text-[#FF3D96] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                  {t('active_filter')}: {t(selectedFilter.nameKey) || selectedFilter.name}
                </span>
              </div>
            </div>

            <CameraView
              onPhotoTaken={handlePhotoTaken}
              shotsCount={targetShotsCount}
              currentShotIndex={retakeTargetIndex !== null ? retakeTargetIndex : currentShotIndex}
              filterCss={selectedFilter.css}
              countdownDuration={countdownDuration}
              collabFrame={selectedCollabFrame.id}
              isRetakingSingleShot={retakeTargetIndex !== null}
              retakeIndex={retakeTargetIndex || 0}
            />

            {/* Thumbnails of captured shots */}
            {photos.length > 0 && retakeTargetIndex === null && (
              <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
                {Array.from({ length: targetShotsCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-9 sm:w-16 sm:h-12 rounded-xl bg-white border border-pink-200 overflow-hidden shadow-xs"
                  >
                    {photos[i] ? (
                      <img
                        src={photos[i]}
                        alt={`Pose ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-pink-300 font-black">
                        #{i + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 04: REVIEW YOUR PHOTOS */}
      {step === 'review' && (
        <ReviewScreen
          photos={photos}
          onRetakeSingle={handleRetakeSingleShot}
          onRetakeAll={handleRetakeAllShots}
          onProceedDecorate={() => setStep('decorate')}
          onBackToCamera={() => setStep('camera')}
        />
      )}

      {/* SCREEN 05: PURIKURA DECORATION STUDIO */}
      {step === 'decorate' && (
        <DecorateScreen
          stripRef={stripRef}
          photos={photos}
          layout={layout}
          frameColor={frameColor}
          setFrameColor={setFrameColor}
          framePattern={framePattern}
          setFramePattern={setFramePattern}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          photoRadius={photoRadius}
          setPhotoRadius={setPhotoRadius}
          customText={customText}
          setCustomText={setCustomText}
          placedStickers={placedStickers}
          onAddSticker={handleAddSticker}
          onUpdateSticker={handleUpdateSticker}
          onRemoveSticker={handleRemoveSticker}
          selectedStickerId={selectedStickerId}
          setSelectedStickerId={setSelectedStickerId}
          doodleStrokes={doodleStrokes}
          onDoodleStrokeComplete={handleDoodleStrokeComplete}
          onUndoDoodle={handleUndoDoodle}
          onRedoDoodle={handleRedoDoodle}
          onClearDoodles={handleClearDoodles}
          canUndo={doodleStrokes.length > 0}
          canRedo={doodleUndoStack.length > 0}
          activeDoodleTool={activeDoodleTool}
          setActiveDoodleTool={setActiveDoodleTool}
          doodleColor={doodleColor}
          setDoodleColor={setDoodleColor}
          doodleSize={doodleSize}
          setDoodleSize={setDoodleSize}
          sparkleEmoji={sparkleEmoji}
          setSparkleEmoji={setSparkleEmoji}
          onBackToReview={() => setStep('review')}
          onFinishPhoto={() => setStep('result')}
        />
      )}

      {/* SCREEN 06: FINAL RESULT / SHARE / PRINT */}
      {step === 'result' && (
        <ResultScreen
          stripRef={stripRef}
          photos={photos}
          layout={layout}
          frameColor={frameColor}
          framePattern={framePattern}
          filterCss={selectedFilter?.css}
          photoRadius={photoRadius}
          customText={customText}
          placedStickers={placedStickers}
          doodleStrokes={doodleStrokes}
          onDownloadHD={handleDownloadHD}
          onExportBoomerang={handleExportBoomerang}
          onDownloadVideo={handleDownloadVideo}
          isExportingVideo={isExportingVideo}
          exportProgress={exportProgress}
          boomerangVideoUrl={boomerangVideoUrl}
          hasVideoClips={videoClips.length > 0}
          onPrintStandard={() => window.print()}
          onPrintDnpSplit={handlePrintDnpSplit}
          onPrintThermalReceipt={handlePrintThermalReceipt}
          onStartNewSession={handleStartNewSession}
          onBackToDecorate={() => setStep('decorate')}
        />
      )}
    </div>
  )
}
