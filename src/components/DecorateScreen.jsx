import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Smile,
  Brush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Palette,
  Type,
  Plus,
  Sliders,
  Maximize2,
  Layers,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import PhotoStripPreview from './PhotoStripPreview'
import {
  STICKER_PACKS,
  FRAME_COLORS,
  FRAME_PATTERNS,
  FILTERS,
} from '../utils/filters'
import {
  BRUSH_TYPES,
  DOODLE_COLORS,
  BRUSH_SIZES,
  SPARKLE_EMOJIS,
} from '../utils/doodleEngine'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

export default function DecorateScreen({
  stripRef,
  photos,
  layout,
  frameColor,
  setFrameColor,
  framePattern,
  setFramePattern,
  selectedFilter,
  setSelectedFilter,
  photoRadius,
  setPhotoRadius,
  customText,
  setCustomText,
  placedStickers,
  onAddSticker,
  onUpdateSticker,
  onRemoveSticker,
  selectedStickerId,
  setSelectedStickerId,
  doodleStrokes,
  onDoodleStrokeComplete,
  onUndoDoodle,
  onRedoDoodle,
  onClearDoodles,
  canUndo,
  canRedo,
  activeDoodleTool,
  setActiveDoodleTool,
  doodleColor,
  setDoodleColor,
  doodleSize,
  setDoodleSize,
  sparkleEmoji,
  setSparkleEmoji,
  selectedFrame,
  onOpenFrameModal,
  onBackToReview,
  onFinishPhoto,
}) {
  const { t } = useLanguage()

  // Main active deck tab: 'stickers' | 'doodle' | 'style'
  const [activeTab, setActiveTab] = useState('stickers')

  // Sub-category for sticker drawer: 'emojis' | 'hangul' | 'words' | 'tape' | 'custom' | 'upload'
  const [stickerCategory, setStickerCategory] = useState('emojis')

  // Custom text badge input
  const [customBadgeText, setCustomBadgeText] = useState('')
  const [customBadgeColor, setCustomBadgeColor] = useState('#ff3d96')

  // Hidden File input ref for device photo/sticker picker
  const fileInputRef = useRef(null)

  // Handle image upload from device
  const handleDeviceImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        onAddSticker({
          type: 'image',
          content: dataUrl,
          scale: 1.2,
          rotation: 0,
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Support iOS & desktop clipboard paste for stickers (tap and hold sticker copy in iOS Photos)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (!blob) continue
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result
            if (dataUrl) {
              onAddSticker({
                type: 'image',
                content: dataUrl,
                scale: 1.2,
                rotation: 0,
              })
            }
          }
          reader.readAsDataURL(blob)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onAddSticker])

  const badgeColorOptions = [
    { label: 'Hot Pink', color: '#ff3d96' },
    { label: 'Sky Blue', color: '#38bdf8' },
    { label: 'Butter Yellow', color: '#fbbf24' },
    { label: 'Mint Green', color: '#34d399' },
    { label: 'Lavender', color: '#c084fc' },
    { label: 'Noir Dark', color: '#1e293b' },
  ]

  const handleAddCustomBadge = (e) => {
    e.preventDefault()
    if (!customBadgeText.trim()) return

    onAddSticker({
      type: 'text',
      content: customBadgeText.trim(),
      badgeBg: customBadgeColor,
      textColor: customBadgeColor === '#fbbf24' ? '#1e293b' : '#ffffff',
    })
    setCustomBadgeText('')
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToReview}
            className="flex items-center gap-1.5 text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('btn_back')}</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#29252C]">
              {t('decorate_title')}
            </h2>
            <p className="text-[10px] text-[#766F7B] font-medium hidden sm:block">
              {t('decorate_sub')}
            </p>
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Canvas Photo Strip Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:sticky lg:top-24">
            <PhotoStripPreview
              stripRef={stripRef}
              photos={photos}
              layout={layout}
              frameColor={frameColor}
              framePattern={framePattern}
              filterCss={selectedFilter?.css}
              photoRadius={photoRadius}
              customText={customText}
              stickers={placedStickers}
              onUpdateSticker={onUpdateSticker}
              onRemoveSticker={onRemoveSticker}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
              doodleStrokes={doodleStrokes}
              onDoodleStrokeComplete={onDoodleStrokeComplete}
              activeDoodleTool={activeDoodleTool}
              doodleColor={doodleColor}
              doodleSize={doodleSize}
              sparkleEmoji={sparkleEmoji}
              isDoodleMode={activeTab === 'doodle'}
              selectedFrame={selectedFrame}
            />
            <div className="mt-3 bg-pink-50 border border-pink-100 rounded-full px-4 py-1.5 text-[11px] text-[#FF3D96] font-bold text-center flex items-center gap-1.5 shadow-xs">
              <span>💡</span>
              <span>
                {activeTab === 'doodle'
                  ? 'Vẽ tay tự do 120 FPS lên ảnh'
                  : 'Chạm sticker để chọn, giữ và kéo để di chuyển tự do!'}
              </span>
            </div>
          </div>

          {/* Right Column: Creative Control Deck */}
          <div className="lg:col-span-7 space-y-5 bg-white border border-pink-100/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-pink-500/5">
            {/* Quick Strip Title Input */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <label className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                <Type size={14} className="text-[#FF3D96]" />
                <span>Tiêu đề dải ảnh:</span>
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="SNUGGIE PHOTOBOOTH"
                className="px-3 py-1.5 rounded-xl bg-[#FFF7EF] border border-pink-100 focus:outline-none focus:border-[#FF3D96] text-xs font-bold text-[#29252C] uppercase tracking-wider text-right"
              />
            </div>

            {/* 3 Main Deck Navigation Tabs */}
            <div className="flex bg-[#FFF7EF] p-1.5 rounded-2xl border border-pink-100 gap-1.5">
              <button
                onClick={() => setActiveTab('stickers')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'stickers'
                    ? 'bg-white text-[#FF3D96] shadow-sm'
                    : 'text-[#766F7B] hover:text-[#29252C]'
                }`}
              >
                <Smile size={16} />
                <span>Sticker & Chữ 🎀</span>
              </button>

              <button
                onClick={() => setActiveTab('doodle')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'doodle'
                    ? 'bg-gradient-to-r from-[#FF3D96] to-[#FF6BA8] text-white shadow-md shadow-pink-500/25'
                    : 'text-[#766F7B] hover:text-[#29252C]'
                }`}
              >
                <Brush size={16} />
                <span>Vẽ Tay Neon ✨</span>
              </button>

              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'style'
                    ? 'bg-white text-[#FF3D96] shadow-sm'
                    : 'text-[#766F7B] hover:text-[#29252C]'
                }`}
              >
                <Sliders size={16} />
                <span>Chỉnh Màu & Khung 🎨</span>
              </button>
            </div>

            {/* ================= TAB 1: STICKERS & CREATIVE STAMPS ================= */}
            {activeTab === 'stickers' && (
              <div className="space-y-4 animate-fade-in">
                {/* Sticker Subcategory Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'emojis', label: STICKER_PACKS.emojis.title },
                    { id: 'hangul', label: STICKER_PACKS.hangul.title },
                    { id: 'words', label: STICKER_PACKS.words.title },
                    { id: 'tape', label: STICKER_PACKS.tape.title },
                    { id: 'custom', label: '✍️ Tự Viết Chữ' },
                    { id: 'upload', label: '📸 Tải Từ Máy' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStickerCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        stickerCategory === cat.id
                          ? 'bg-[#FF3D96] text-white shadow-xs'
                          : 'bg-[#FFF7EF] text-[#766F7B] hover:bg-pink-100/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Subcategory 1: Emojis */}
                {stickerCategory === 'emojis' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
                      {STICKER_PACKS.emojis.items.map((stk, i) => (
                        <button
                          key={i}
                          onClick={() => onAddSticker(stk)}
                          className="w-11 h-11 rounded-2xl bg-[#FFF7EF] hover:bg-pink-100/70 border border-pink-100/80 text-2xl flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs hover:shadow-md"
                        >
                          {stk.content}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategory 2: Hangul Slang Stamps */}
                {stickerCategory === 'hangul' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {STICKER_PACKS.hangul.items.map((stk, i) => (
                      <button
                        key={i}
                        onClick={() => onAddSticker(stk)}
                        style={{ backgroundColor: stk.badgeBg, color: stk.textColor }}
                        className="py-2.5 px-3 rounded-2xl text-xs font-black tracking-wide shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer text-center truncate border border-white/30"
                      >
                        {stk.content}
                      </button>
                    ))}
                  </div>
                )}

                {/* Subcategory 3: Y2K Words & Phrases */}
                {stickerCategory === 'words' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {STICKER_PACKS.words.items.map((stk, i) => (
                      <button
                        key={i}
                        onClick={() => onAddSticker(stk)}
                        style={{ backgroundColor: stk.badgeBg, color: stk.textColor }}
                        className="py-2.5 px-3 rounded-2xl text-[11px] font-black tracking-wider shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer text-center truncate border border-white/30"
                      >
                        {stk.content}
                      </button>
                    ))}
                  </div>
                )}

                {/* Subcategory 4: Washi Tape */}
                {stickerCategory === 'tape' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STICKER_PACKS.tape.items.map((stk, i) => (
                      <button
                        key={i}
                        onClick={() => onAddSticker(stk)}
                        style={{ backgroundColor: stk.bg, color: stk.color }}
                        className="py-2.5 px-4 rounded-xl font-mono text-xs font-black tracking-widest shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer text-center border-y-2 border-dashed border-black/20 truncate"
                      >
                        {stk.content}
                      </button>
                    ))}
                  </div>
                )}

                {/* Subcategory 5: Custom Text Badge Creator */}
                {stickerCategory === 'custom' && (
                  <form onSubmit={handleAddCustomBadge} className="bg-[#FFF7EF] p-4 rounded-2xl border border-pink-100 space-y-3">
                    <span className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#FF3D96]" /> Tự Tạo Huy Hiệu Chữ Riêng:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customBadgeText}
                        onChange={(e) => setCustomBadgeText(e.target.value)}
                        placeholder="Nhập chữ (VD: Hiếu & My, 2026...)"
                        maxLength={20}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-pink-100 focus:outline-none focus:border-[#FF3D96] text-xs font-bold text-[#29252C]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#FF3D96] text-white text-xs font-black hover:bg-[#E62E84] transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Plus size={14} /> Dán lên
                      </button>
                    </div>

                    {/* Badge Color Choices */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-[#766F7B]">Màu nền:</span>
                      <div className="flex gap-2">
                        {badgeColorOptions.map((c) => (
                          <button
                            type="button"
                            key={c.color}
                            onClick={() => setCustomBadgeColor(c.color)}
                            style={{ backgroundColor: c.color }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                              customBadgeColor === c.color ? 'scale-125 border-white ring-2 ring-[#FF3D96]' : 'border-black/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </form>
                )}

                {/* Subcategory 6: Import Custom Sticker from Device */}
                {stickerCategory === 'upload' && (
                  <div className="bg-[#FFF7EF] p-5 rounded-3xl border-2 border-dashed border-pink-300 text-center space-y-3 animate-fade-in">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDeviceImageUpload}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#FF3D96] border border-pink-100 flex items-center justify-center mx-auto shadow-sm">
                      <ImageIcon size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#29252C]">Tải Nhãn Dán / Ảnh Từ Điện Thoại</h4>
                      <p className="text-[11px] text-[#766F7B] mt-1 max-w-sm mx-auto leading-relaxed">
                        Hỗ trợ ảnh PNG tách nền (sticker iPhone / Android), meme, hoặc ảnh từ thư viện. Bạn có thể kéo thả, phóng to và xoay tự do!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF3D96] to-[#FF6BA8] text-white text-xs font-black shadow-md shadow-pink-500/20 hover:shadow-lg transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload size={15} />
                      <span>Chọn ảnh từ thiết bị</span>
                    </button>
                    <p className="text-[10px] text-[#766F7B] italic">
                      ✨ Mẹo iOS: Bạn có thể nhấn giữ bóc sticker từ ảnh trong app Photos rồi dán (Paste) trực tiếp vào đây!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: PURIKURA DOODLE ================= */}
            {activeTab === 'doodle' && (
              <div className="space-y-4 animate-fade-in bg-[#FFF7EF]/60 p-4 rounded-2xl border border-pink-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FF3D96] flex items-center gap-1.5">
                    <Sparkles size={14} /> Cọ vẽ Neon 120 FPS
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={!canUndo}
                      onClick={onUndoDoodle}
                      className="p-2 rounded-xl bg-white border border-pink-100 text-[#766F7B] hover:text-[#FF3D96] disabled:opacity-40 transition cursor-pointer shadow-xs"
                      title={t('btn_undo')}
                    >
                      <Undo2 size={15} />
                    </button>
                    <button
                      disabled={!canRedo}
                      onClick={onRedoDoodle}
                      className="p-2 rounded-xl bg-white border border-pink-100 text-[#766F7B] hover:text-[#FF3D96] disabled:opacity-40 transition cursor-pointer shadow-xs"
                      title={t('btn_redo')}
                    >
                      <Redo2 size={15} />
                    </button>
                    <button
                      disabled={doodleStrokes.length === 0}
                      onClick={onClearDoodles}
                      className="p-2 rounded-xl bg-white border border-pink-100 text-rose-500 hover:bg-rose-50 disabled:opacity-40 transition cursor-pointer shadow-xs"
                      title={t('btn_clear_doodle')}
                    >
                      <Trash2 size={15} />
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
                        className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isActive
                            ? 'border-[#FF3D96] bg-[#FF3D96] text-white shadow-sm'
                            : 'border-pink-100 bg-white text-[#766F7B] hover:border-pink-200'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="truncate">{tool.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Sparkle Stamp Emoji Selector */}
                {activeDoodleTool === BRUSH_TYPES.SPARKLE && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#766F7B]">Chọn tem đóng dấu:</span>
                    <div className="flex gap-2">
                      {SPARKLE_EMOJIS.map((em) => (
                        <button
                          key={em}
                          onClick={() => setSparkleEmoji(em)}
                          className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition cursor-pointer ${
                            sparkleEmoji === em
                              ? 'border-[#FF3D96] bg-pink-100 shadow-xs'
                              : 'border-pink-100 bg-white hover:border-pink-200'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Swatches */}
                {activeDoodleTool !== BRUSH_TYPES.ERASER && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#766F7B]">Bảng màu vẽ:</span>
                    <div className="flex flex-wrap gap-2.5">
                      {DOODLE_COLORS.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => setDoodleColor(col.value)}
                          title={col.label}
                          style={{ backgroundColor: col.value }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                            doodleColor === col.value
                              ? 'scale-125 border-white ring-2 ring-[#FF3D96] shadow-sm'
                              : 'border-black/10 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-bold text-[#766F7B]">Cỡ nét vẽ:</span>
                  <div className="flex gap-2">
                    {BRUSH_SIZES.map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() => setDoodleSize(sz.size)}
                        className={`w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center transition cursor-pointer ${
                          doodleSize === sz.size
                            ? 'border-[#FF3D96] bg-pink-100 text-[#FF3D96]'
                            : 'border-pink-100 bg-white text-[#766F7B] hover:border-pink-200'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: PHOTO FILTERS & FRAME STYLES ================= */}
            {activeTab === 'style' && (
              <div className="space-y-4 animate-fade-in bg-[#FFF7EF]/50 p-4 rounded-2xl border border-pink-100">
                {/* 0. Themed & Custom Frame Selector */}
                {onOpenFrameModal && (
                  <div className="bg-white p-3 rounded-xl border border-pink-200 flex items-center justify-between gap-3 shadow-xs">
                    <div>
                      <p className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-[#FF3D96]" />
                        <span>Khung: {selectedFrame?.name || 'Mặc định'}</span>
                      </p>
                      <p className="text-[10px] text-[#766F7B] mt-0.5">
                        Đổi sang khung Idol K-Pop, Cartoon, Y2K hoặc tải ảnh PNG từ máy
                      </p>
                    </div>
                    <button
                      onClick={onOpenFrameModal}
                      className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#FF3D96] text-xs font-black transition cursor-pointer shrink-0"
                    >
                      Đổi Khung
                    </button>
                  </div>
                )}

                {/* 1. Live Filter Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                    <Palette size={14} className="text-[#FF3D96]" /> Đổi Bộ Lọc Màu Cho Ảnh:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FILTERS.map((f) => {
                      const isSelected = selectedFilter?.id === f.id
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFilter(f)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'border-[#FF3D96] bg-pink-100/70 shadow-xs'
                              : 'border-pink-100 bg-white hover:border-pink-200'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: f.color }}
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-black text-[11px] text-[#29252C] truncate">{f.name}</p>
                            <p className="text-[9px] text-[#766F7B] truncate">{f.enName}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Photo Corner Radius */}
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <span className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-[#FF3D96]" /> Bo Góc Ảnh:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { label: 'Bo nhẹ (8px)', val: '8px' },
                      { label: 'Bo tròn (16px)', val: '16px' },
                      { label: 'Vuông (0px)', val: '0px' },
                    ].map((rad) => (
                      <button
                        key={rad.val}
                        onClick={() => setPhotoRadius(rad.val)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          photoRadius === rad.val
                            ? 'border-[#FF3D96] bg-[#FF3D96] text-white shadow-xs'
                            : 'border-pink-100 bg-white text-[#766F7B] hover:border-pink-200'
                        }`}
                      >
                        {rad.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Frame Pattern / Texture */}
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <span className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                    <Layers size={14} className="text-[#FF3D96]" /> Hoạ Tiết Khung Dải Ảnh:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FRAME_PATTERNS.map((p) => {
                      const isSelected = framePattern?.id === p.id || (!framePattern && p.id === 'solid')
                      return (
                        <button
                          key={p.id}
                          onClick={() => setFramePattern(p)}
                          className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'border-[#FF3D96] bg-[#FF3D96] text-white shadow-xs'
                              : 'border-pink-100 bg-white text-[#766F7B] hover:border-pink-200'
                          }`}
                        >
                          <span>{p.icon}</span>
                          <span>{p.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Frame Color Picker */}
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <span className="text-xs font-black text-[#29252C] flex items-center gap-1.5">
                    <Palette size={14} className="text-[#FF3D96]" /> Màu Khung Ảnh:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {FRAME_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFrameColor(c)}
                        title={c.name}
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                        className={`h-9 rounded-xl border-2 flex items-center justify-center text-xs transition-transform cursor-pointer ${
                          frameColor.id === c.id
                            ? 'scale-105 ring-2 ring-[#FF3D96] shadow-sm'
                            : 'hover:scale-105'
                        }`}
                      >
                        {frameColor.id === c.id && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-pink-100/90 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={onFinishPhoto}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-base shadow-xl shadow-[#FF3D96]/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('btn_finish_photo')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
