import { useState, useRef } from 'react'
import { X, Search, Upload, Sparkles, Check, ChevronDown, Image as ImageIcon, Trash2 } from 'lucide-react'
import { FRAME_CATEGORIES, PRESET_FRAMES, saveCustomFrameToStorage } from '../utils/frameTemplates'

export default function FrameSelectorModal({
  isOpen,
  onClose,
  selectedFrame,
  onSelectFrame,
  customFrames = [],
  onAddCustomFrame,
  onDeleteCustomFrame,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Combine custom uploaded frames with preset frames
  const allFrames = [...customFrames, ...PRESET_FRAMES]

  // Filter frames by category and search term
  const filteredFrames = allFrames.filter((frame) => {
    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'custom' && frame.type !== 'image') return false
      if (selectedCategory !== 'custom' && frame.category !== selectedCategory) return false
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = frame.name.toLowerCase().includes(q)
      const matchEn = frame.enName?.toLowerCase().includes(q)
      const matchTags = frame.tags?.some((t) => t.toLowerCase().includes(q))
      return matchName || matchEn || matchTags
    }

    return true
  })

  // Process selected file
  const processFile = (file) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        const newCustomFrame = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          enName: 'Custom Frame',
          category: 'custom',
          badge: 'Tải Lên',
          type: 'image',
          imageUrl: dataUrl,
          bg: '#ffffff',
          text: '#29252c',
          border: '#ff3d96',
          accent: '#ff3d96',
          headerTitle: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
          footerText: 'CUSTOM FRAME · 2026',
        }
        saveCustomFrameToStorage(newCustomFrame)
        if (onAddCustomFrame) {
          onAddCustomFrame(newCustomFrame)
        }
        onSelectFrame(newCustomFrame)
        onClose()
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle local device image upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'image/png' || file.type === 'image/webp' || file.type.startsWith('image/'))) {
      processFile(file)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 flex items-start justify-between bg-[#FFFDF9]">
          <div>
            <h3 className="font-display font-black text-lg sm:text-xl text-[#29252C] flex items-center gap-2">
              <Sparkles size={18} className="text-[#FF3D96]" />
              <span>Chọn Khung Hỗ Trợ Chụp</span>
            </h3>
            <p className="text-xs text-[#059669] font-medium mt-1 leading-relaxed">
              Tính năng này giúp bạn xem trước khung và căn chỉnh góc chụp dễ dàng hơn (Tương thích với mọi bố cục dải ảnh).
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-[#766F7B] hover:text-[#FF3D96] flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#FFF7EF]/60 border-b border-pink-100/60 space-y-2.5">
          {/* Category Dropdown Selector */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#29252C] focus:outline-none focus:border-[#FF3D96] shadow-xs cursor-pointer pr-10"
            >
              {FRAME_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
              {customFrames.length > 0 && (
                <option value="custom">Frame Bạn Đã Tải Lên ({customFrames.length})</option>
              )}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#766F7B] pointer-events-none"
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766F7B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên khung hoặc nametag (BTS, IVE, Y2K, Sanrio...)"
              className="w-full bg-white border border-pink-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#29252C] focus:outline-none focus:border-[#FF3D96] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#766F7B] hover:text-[#FF3D96]"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Frame Cards Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 bg-[#FFFDF9]">
          {/* CARD 1: Upload Custom Frame From Phone / PC */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition duration-200 active:scale-98 min-h-[200px] ${
              isDragging
                ? 'border-[#FF3D96] bg-pink-100/80 scale-102'
                : 'border-pink-300 hover:border-[#FF3D96] bg-pink-50/30 hover:bg-pink-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-[#FF3D96] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2.5">
              <Upload size={22} />
            </div>
            <h4 className="font-display font-black text-xs sm:text-sm text-[#29252C] group-hover:text-[#FF3D96]">
              Tải lên khung của bạn
            </h4>
            <p className="text-[10px] text-[#766F7B] mt-1 leading-relaxed max-w-[140px]">
              Ảnh PNG tách nền hoặc viền chụp từ điện thoại
            </p>
            <span className="mt-2 text-[9px] font-black uppercase tracking-wider text-[#FF3D96] bg-pink-100 px-2 py-0.5 rounded-full">
              Từ Thiết Bị
            </span>
          </div>

          {/* CARDS 2..N: Preset and Custom Frames */}
          {filteredFrames.map((frame) => {
            const isSelected = selectedFrame?.id === frame.id
            const isCustom = frame.type === 'image'

            return (
              <div
                key={frame.id}
                onClick={() => {
                  onSelectFrame(frame)
                  onClose()
                }}
                className={`group relative rounded-2xl p-2.5 sm:p-3 flex flex-col items-center cursor-pointer transition duration-200 active:scale-98 border-2 ${
                  isSelected
                    ? 'border-[#FF3D96] bg-pink-50/40 ring-2 ring-pink-300 shadow-md shadow-pink-500/10'
                    : 'border-pink-100 bg-white hover:border-pink-200 hover:shadow-sm'
                }`}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-[#FF3D96] text-white flex items-center justify-center shadow-md">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {/* Delete button for custom uploaded frame */}
                {isCustom && onDeleteCustomFrame && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`Xóa khung "${frame.name}" đã tải lên?`)) {
                        onDeleteCustomFrame(frame.id)
                      }
                    }}
                    className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-xs"
                    title="Xóa khung này"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                {/* Frame Preview Visual Miniature (1x4 strip silhouette) */}
                <div
                  style={{
                    background: frame.bg || '#ffffff',
                    borderColor: frame.border || '#fbcfe8',
                    color: frame.text || '#29252c',
                  }}
                  className="w-20 sm:w-24 h-40 rounded-xl border flex flex-col justify-between p-1.5 shadow-xs overflow-hidden relative"
                >
                  {isCustom ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <img
                        src={frame.imageUrl}
                        alt={frame.name}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Top Header Mockup */}
                      <div className="text-[6px] font-black uppercase text-center truncate tracking-tighter opacity-80 pb-0.5">
                        {frame.headerTitle || frame.name}
                      </div>

                      {/* 4 Photo Cutout Windows */}
                      <div className="flex-1 flex flex-col justify-between py-1 gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              border: frame.photoBorder || '1px solid rgba(0,0,0,0.1)',
                            }}
                            className="w-full h-6 rounded-xs bg-black/10 flex items-center justify-center relative overflow-hidden"
                          >
                            <span className="text-[6px] opacity-40 font-mono">0{i + 1}</span>
                          </div>
                        ))}
                      </div>

                      {/* Corner Decorations */}
                      {frame.decorations?.slice(0, 2).map((d, i) => (
                        <span
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${d.x}%`,
                            top: `${d.y}%`,
                            fontSize: '7px',
                          }}
                          className="pointer-events-none"
                        >
                          {d.emoji}
                        </span>
                      ))}

                      {/* Footer Mockup */}
                      <div className="text-[5px] font-bold text-center truncate tracking-tighter opacity-70 pt-0.5">
                        {frame.footerText || 'K-PHOTOBOOTH'}
                      </div>
                    </>
                  )}
                </div>

                {/* Frame Info */}
                <div className="w-full text-center mt-2.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-pink-100 text-[#FF3D96]">
                      {frame.badge || 'Frame'}
                    </span>
                  </div>
                  <h5 className="font-display font-black text-xs text-[#29252C] truncate mt-1">
                    {frame.name}
                  </h5>
                  <p className="text-[9px] text-[#766F7B] truncate">
                    {frame.enName || frame.category}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Hint */}
        <div className="p-3 sm:p-4 bg-[#FFF7EF] border-t border-pink-100 text-center text-[11px] text-[#766F7B] flex items-center justify-center gap-2">
          <ImageIcon size={14} className="text-[#FF3D96]" />
          <span>Bạn có thể đổi khung hoặc tải khung từ điện thoại bất kỳ lúc nào!</span>
        </div>
      </div>
    </div>
  )
}
