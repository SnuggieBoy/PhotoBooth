import { useState } from 'react'
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
} from 'lucide-react'
import PhotoStripPreview from './PhotoStripPreview'
import { STICKERS, FRAME_COLORS } from '../utils/filters'
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
  customText,
  setCustomText,
  placedStickers,
  onAddSticker,
  onRemoveSticker,
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
  onBackToReview,
  onFinishPhoto,
}) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('stickers') // 'stickers' | 'doodle'

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
              customText={customText}
              stickers={placedStickers}
              onRemoveSticker={onRemoveSticker}
              doodleStrokes={doodleStrokes}
              onDoodleStrokeComplete={onDoodleStrokeComplete}
              activeDoodleTool={activeDoodleTool}
              doodleColor={doodleColor}
              doodleSize={doodleSize}
              sparkleEmoji={sparkleEmoji}
              isDoodleMode={activeTab === 'doodle'}
            />
            <p className="text-[11px] text-[#766F7B] mt-3 font-medium text-center">
              {activeTab === 'doodle'
                ? '✍️ Vẽ tự do bằng tay hoặc chuột trực tiếp lên dải ảnh'
                : '🎀 Nhấn vào sticker để dán hoặc nhấn sticker trên ảnh để xóa'}
            </p>
          </div>

          {/* Right Column: Creative Tool Deck */}
          <div className="lg:col-span-7 space-y-5 bg-white border border-pink-100/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-pink-500/5">
            {/* Title & Frame Quick Color Controls */}
            <div className="space-y-3 pb-4 border-b border-pink-100">
              <div className="flex items-center justify-between">
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

              {/* Frame Color Quick Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                  <Palette size={14} className="text-[#FF3D96]" />
                  <span>Màu khung:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {FRAME_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFrameColor(c)}
                      title={c.name}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        frameColor.id === c.id
                          ? 'scale-125 ring-2 ring-[#FF3D96]/40 shadow-xs'
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Tabs: Y2K Stickers vs Purikura Doodle */}
            <div className="flex bg-[#FFF7EF] p-1.5 rounded-2xl border border-pink-100 gap-1.5">
              <button
                onClick={() => setActiveTab('stickers')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'stickers'
                    ? 'bg-white text-[#FF3D96] shadow-sm'
                    : 'text-[#766F7B] hover:text-[#29252C]'
                }`}
              >
                <Smile size={16} />
                <span>{t('tab_stickers')}</span>
              </button>
              <button
                onClick={() => setActiveTab('doodle')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'doodle'
                    ? 'bg-gradient-to-r from-[#FF3D96] to-[#FF6BA8] text-white shadow-md shadow-pink-500/25'
                    : 'text-[#766F7B] hover:text-[#29252C]'
                }`}
              >
                <Brush size={16} />
                <span>{t('tab_doodle')}</span>
              </button>
            </div>

            {/* TAB 1: Y2K Stickers Palette */}
            {activeTab === 'stickers' && (
              <div className="space-y-3 animate-fade-in">
                <span className="text-xs font-black uppercase tracking-wider text-[#766F7B]">
                  {t('sticker_label')}
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
                  {STICKERS.map((stk, i) => (
                    <button
                      key={i}
                      onClick={() => onAddSticker(stk)}
                      className="w-11 h-11 rounded-2xl bg-[#FFF7EF] hover:bg-pink-100/70 border border-pink-100/80 text-2xl flex items-center justify-center transition active:scale-90 cursor-pointer shadow-xs hover:shadow-md"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#766F7B] italic">
                  💡 {t('sticker_remove_hint')}
                </p>
              </div>
            )}

            {/* TAB 2: Purikura Doodle Studio Controls */}
            {activeTab === 'doodle' && (
              <div className="space-y-4 animate-fade-in bg-[#FFF7EF]/60 p-4 rounded-2xl border border-pink-100">
                {/* Header with Undo / Redo / Clear actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FF3D96] flex items-center gap-1.5">
                    <Sparkles size={14} /> Công cụ vẽ tay 120 FPS
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

                {/* Sparkle Emoji Stamp Selector */}
                {activeDoodleTool === BRUSH_TYPES.SPARKLE && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#766F7B]">
                      Chọn tem đóng dấu:
                    </span>
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

                {/* Brush Color Swatches */}
                {activeDoodleTool !== BRUSH_TYPES.ERASER && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#766F7B]">
                      {t('doodle_color_label')}
                    </span>
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

                {/* Brush Size Selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-bold text-[#766F7B]">
                    {t('doodle_size_label')}
                  </span>
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
