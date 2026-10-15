import { useRef, useState, useEffect } from 'react'
import { Sparkles, X, RotateCw, ZoomIn, ZoomOut, Trash2 } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import PurikuraDoodleCanvas from './PurikuraDoodleCanvas'

export default function PhotoStripPreview({
  photos = [],
  layout = 'strip-4', // 'strip-4' (1x4) | 'grid-4' (2x2) | 'strip-2' (1x2)
  frameColor = { id: 'white', bg: '#ffffff', text: '#1e293b', border: '#e2e8f0' },
  framePattern,
  filterCss = 'none',
  photoRadius = '12px',
  customText = 'SNUGGIE PHOTOBOOTH',
  subtitle,
  stickers = [],
  onUpdateSticker,
  onRemoveSticker,
  selectedStickerId,
  onSelectSticker,
  stripRef,
  // Purikura Doodle props
  doodleStrokes = [],
  onDoodleStrokeComplete,
  activeDoodleTool,
  doodleColor,
  doodleSize,
  sparkleEmoji,
  isDoodleMode = false,
}) {
  const { t, language } = useLanguage()
  const [draggingStickerId, setDraggingStickerId] = useState(null)
  const dragStartRef = useRef({ x: 0, y: 0, startStickerX: 50, startStickerY: 50 })

  const formattedDate = subtitle || new Date().toLocaleDateString(
    language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  )

  // Global PointerMove and PointerUp handlers for buttery smooth dragging
  useEffect(() => {
    if (!draggingStickerId) return

    const handlePointerMove = (e) => {
      if (!stripRef?.current) return
      const rect = stripRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      const deltaPercentX = (deltaX / rect.width) * 100
      const deltaPercentY = (deltaY / rect.height) * 100

      const newX = Math.max(5, Math.min(95, dragStartRef.current.startStickerX + deltaPercentX))
      const newY = Math.max(5, Math.min(95, dragStartRef.current.startStickerY + deltaPercentY))

      if (onUpdateSticker) {
        onUpdateSticker(draggingStickerId, { x: newX, y: newY })
      }
    }

    const handlePointerUp = () => {
      setDraggingStickerId(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggingStickerId, onUpdateSticker, stripRef])

  const handleStickerPointerDown = (e, stk) => {
    if (isDoodleMode) return
    e.stopPropagation()
    e.preventDefault()

    if (onSelectSticker) {
      onSelectSticker(stk.id)
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startStickerX: stk.x,
      startStickerY: stk.y,
    }
    setDraggingStickerId(stk.id)
  }

  const handleRotateSticker = (e, stk, deg = 15) => {
    e.stopPropagation()
    const currentRot = stk.rotation || 0
    const newRot = (currentRot + deg) % 360
    if (onUpdateSticker) {
      onUpdateSticker(stk.id, { rotation: newRot })
    }
  }

  const handleScaleSticker = (e, stk, delta = 0.15) => {
    e.stopPropagation()
    const currentScale = stk.scale || 1
    const newScale = Math.max(0.5, Math.min(2.5, currentScale + delta))
    if (onUpdateSticker) {
      onUpdateSticker(stk.id, { scale: Number(newScale.toFixed(2)) })
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Outer Strip Shadow Container */}
      <div
        ref={stripRef}
        id="printable-photo-strip"
        onClick={() => !isDoodleMode && onSelectSticker && onSelectSticker(null)}
        style={{
          backgroundColor: frameColor.bg,
          color: frameColor.text,
          borderColor: frameColor.border,
        }}
        className={`relative transition-all duration-300 shadow-2xl p-4 sm:p-5 rounded-3xl border flex flex-col items-center select-none overflow-hidden touch-none ${
          layout === 'grid-4' ? 'w-[320px] sm:w-[380px]' : 'w-[230px] sm:w-[260px]'
        }`}
      >
        {/* Optional Texture / Pattern Overlay */}
        {framePattern && framePattern.css && (
          <div
            style={{
              backgroundImage: framePattern.css,
              backgroundSize: framePattern.bgSize || 'auto',
            }}
            className="absolute inset-0 pointer-events-none opacity-40 z-0"
          />
        )}

        {/* Film Negative Sprocket Holes (If film style selected) */}
        {frameColor.isFilm && (
          <div className="absolute top-2 bottom-2 left-1.5 flex flex-col justify-between pointer-events-none opacity-40 z-10">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="w-2 h-3.5 bg-neutral-800 rounded-xs mb-1" />
            ))}
          </div>
        )}

        {/* Top Header / Logo */}
        <div className="w-full text-center mb-3 pointer-events-none relative z-10">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-[#FF3D96]" />
            <h4 className="text-[12px] font-black uppercase tracking-widest leading-none">
              {customText}
            </h4>
            <Sparkles size={13} className="text-[#FF3D96]" />
          </div>
        </div>

        {/* Photos Layout Container */}
        <div
          className={`w-full gap-2.5 relative z-10 pointer-events-none ${
            layout === 'grid-4' ? 'grid grid-cols-2' : 'flex flex-col'
          }`}
        >
          {photos.map((photoUrl, idx) => (
            <div
              key={idx}
              style={{ borderRadius: photoRadius }}
              className="relative aspect-[4/3] bg-neutral-100 overflow-hidden shadow-xs group"
            >
              <img
                src={photoUrl}
                alt={`Shot ${idx + 1}`}
                style={{ filter: filterCss && filterCss !== 'none' ? filterCss : undefined }}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/40 text-white/90 px-1 rounded backdrop-blur-xs">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Sticker Layer - Interactive Drag, Scale & Rotate */}
        {stickers.map((stk) => {
          const isSelected = selectedStickerId === stk.id
          const scale = stk.scale || 1
          const rotation = stk.rotation || 0

          return (
            <div
              key={stk.id}
              onPointerDown={(e) => handleStickerPointerDown(e, stk)}
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              }}
              className={`absolute select-none z-20 transition-shadow ${
                isDoodleMode ? 'pointer-events-none' : 'pointer-events-auto cursor-grab active:cursor-grabbing'
              } ${isSelected ? 'ring-2 ring-[#FF3D96] ring-offset-2 rounded-xl shadow-lg' : ''}`}
            >
              {/* Sticker Content by Type */}
              {stk.type === 'emoji' && (
                <div className="text-3xl leading-none filter drop-shadow-sm p-1">
                  {stk.content}
                </div>
              )}

              {stk.type === 'text' && (
                <div
                  style={{
                    backgroundColor: stk.badgeBg || '#ff3d96',
                    color: stk.textColor || '#ffffff',
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-black tracking-wide shadow-md whitespace-nowrap border border-white/40"
                >
                  {stk.content}
                </div>
              )}

              {stk.type === 'tape' && (
                <div
                  style={{
                    backgroundColor: stk.bg || '#ffe4e6',
                    color: stk.color || '#f43f5e',
                  }}
                  className="px-3 py-1 font-mono text-[10px] font-black tracking-widest shadow-sm border-y border-dashed border-black/20 whitespace-nowrap opacity-90"
                >
                  {stk.content}
                </div>
              )}

              {/* Controls UI overlay for Selected Sticker */}
              {isSelected && !isDoodleMode && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/95 border border-pink-200 px-1.5 py-1 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-md z-30"
                >
                  <button
                    onClick={(e) => handleRotateSticker(e, stk, 15)}
                    className="w-6 h-6 rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF3D96] flex items-center justify-center transition cursor-pointer"
                    title="Xoay sticker"
                  >
                    <RotateCw size={11} />
                  </button>
                  <button
                    onClick={(e) => handleScaleSticker(e, stk, 0.15)}
                    className="w-6 h-6 rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF3D96] flex items-center justify-center transition cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn size={11} />
                  </button>
                  <button
                    onClick={(e) => handleScaleSticker(e, stk, -0.15)}
                    className="w-6 h-6 rounded-full bg-pink-50 hover:bg-pink-100 text-[#FF3D96] flex items-center justify-center transition cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveSticker && onRemoveSticker(stk.id)
                    }}
                    className="w-6 h-6 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition cursor-pointer"
                    title="Xóa sticker"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Purikura Doodle Canvas Layer (Overlay across photos & frame) */}
        <PurikuraDoodleCanvas
          strokes={doodleStrokes}
          onStrokeComplete={onDoodleStrokeComplete}
          activeTool={activeDoodleTool}
          brushColor={doodleColor}
          brushSize={doodleSize}
          sparkleEmoji={sparkleEmoji}
          isDrawingMode={isDoodleMode}
          className="z-30"
        />

        {/* Bottom Authentic K-Photobooth Footer (Date + Barcode + Slogan) */}
        <div className="w-full mt-4 pt-2.5 border-t border-black/10 flex items-end justify-between text-[10px] pointer-events-none relative z-10">
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
