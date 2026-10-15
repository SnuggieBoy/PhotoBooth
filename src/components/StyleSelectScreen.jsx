import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Sliders,
  Palette,
  LayoutGrid,
  Clock,
  Type,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  Camera,
  SwitchCamera,
  Maximize2,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react'
import { FILTERS, FRAME_COLORS } from '../utils/filters'
import { COLLAB_FRAMES } from '../utils/collabFrames'
import { PRESET_FRAMES } from '../utils/frameTemplates'
import { BEAUTY_LEVELS } from '../utils/aiVision'
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext'

// Demo portrait photos to render real photobooth sample previews for all options
const SAMPLE_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
]

export default function StyleSelectScreen({
  layout,
  setLayout,
  selectedFilter,
  setSelectedFilter,
  frameColor,
  setFrameColor,
  selectedCollabFrame,
  setSelectedCollabFrame,
  countdownDuration,
  setCountdownDuration,
  customText,
  setCustomText,
  selectedFrame,
  onSelectFrame,
  onOpenFrameModal,
  facingMode = 'user',
  setFacingMode,
  beautyLevel = 1,
  setBeautyLevel,
  isUltraWide = false,
  setIsUltraWide,
  onBack,
  onContinue,
}) {
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [hasCameraPermission, setHasCameraPermission] = useState(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showFrameGuide, setShowFrameGuide] = useState(true)

  // Layout choices with visual miniatures containing real photo cutouts
  const layoutItems = [
    {
      id: 'strip-4',
      title: '4-Cut Dọc',
      sub: '1x4 Classic Life4Cuts',
      slots: 4,
      type: '1x4',
    },
    {
      id: 'grid-4',
      title: '4-Cut Ô Vuông',
      sub: '2x2 Photoism Style',
      slots: 4,
      type: '2x2',
    },
    {
      id: 'strip-6',
      title: '6-Cut Dọc',
      sub: '1x6 Life4Cuts Max',
      slots: 6,
      type: '1x6',
    },
    {
      id: 'grid-6',
      title: '6-Cut Ghép Ô',
      sub: '2x3 Collage',
      slots: 6,
      type: '2x3',
    },
    {
      id: 'strip-3',
      title: '3-Cut Dọc',
      sub: '1x3 Haru Film Style',
      slots: 3,
      type: '1x3',
    },
    {
      id: 'strip-2',
      title: '2-Cut Polaroid',
      sub: 'Duo Moments',
      slots: 2,
      type: '1x2',
    },
  ]

  // Top trending frame quick visual cards
  const topVisualFrames = PRESET_FRAMES.slice(1, 9)

  // AI Beauty Bojeong filter CSS
  const activeBeautyCss = BEAUTY_LEVELS[beautyLevel]?.css || ''
  const compositeFilterCss = `${selectedFilter?.css && selectedFilter.css !== 'none' ? selectedFilter.css : ''} ${activeBeautyCss}`.trim() || 'none'

  // Initialize camera stream for live mirror
  useEffect(() => {
    let activeStream = null

    async function startPreviewCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        activeStream = mediaStream
        setStream(mediaStream)
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.warn('Camera preview not available:', err)
        setHasCameraPermission(false)
      }
    }

    startPreviewCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  const toggleFacingMode = () => {
    if (setFacingMode) {
      setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
    }
  }

  const cycleBeautyLevel = () => {
    if (setBeautyLevel) {
      setBeautyLevel((prev) => (prev + 1) % BEAUTY_LEVELS.length)
    }
  }

  const toggleUltraWide = () => {
    if (setIsUltraWide) {
      setIsUltraWide((prev) => !prev)
    }
  }

  const hasThemedFrame = selectedFrame && selectedFrame.id !== 'none'
  const isCustomFrame = selectedFrame?.type === 'image' && selectedFrame?.imageUrl

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#29252C] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#766F7B] hover:text-[#FF3D96] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t('btn_back')}</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#29252C] flex items-center justify-center gap-1.5">
              <span>{t('screen2_title')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-[#766F7B] font-medium hidden sm:block">
              Xem trước hình ảnh trực quan và soi gương trực tiếp trước khi chụp
            </p>
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Studio Viewport: Live Camera Mirror + 100% Visual Style Selector */}
      <main className="max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 flex-1 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================= LEFT COLUMN: LIVE CAMERA MIRROR ================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-20">
            {/* Camera Viewfinder Card */}
            <div
              className={`relative w-full max-w-sm sm:max-w-md bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-300 ${
                layout === 'grid-4' ? 'aspect-square' : 'aspect-[3/4]'
              }`}
            >
              {hasCameraPermission === false ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-neutral-900">
                  <Camera size={44} className="text-pink-400 mb-2 opacity-60" />
                  <h4 className="text-sm font-bold mb-1">Chưa bật camera</h4>
                  <p className="text-[11px] text-neutral-400 max-w-xs">
                    Vui lòng cho phép quyền camera để xem trước bộ lọc và khung hình trực tiếp.
                  </p>
                </div>
              ) : (
                <div
                  className={`w-full h-full overflow-hidden transition-transform duration-500 ${
                    isUltraWide ? 'scale-110 perspective-[600px] rotate-x-2' : ''
                  }`}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ filter: compositeFilterCss }}
                    className={`w-full h-full object-cover transition-all ${
                      facingMode === 'user' ? '-scale-x-100' : ''
                    }`}
                  />
                </div>
              )}

              {/* LIVE THEMED FRAME GUIDE OVERLAY ON CAMERA */}
              {hasThemedFrame && showFrameGuide && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5">
                  {isCustomFrame ? (
                    <div className="absolute inset-0 p-2 flex items-center justify-center opacity-85">
                      <img
                        src={selectedFrame.imageUrl}
                        alt="Custom Frame Guide"
                        className="w-full h-full object-contain pointer-events-none select-none filter drop-shadow-md"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Top Header Tag Guide */}
                      <div className="flex items-center justify-between text-xs font-black drop-shadow-md">
                        <span className="text-xl animate-pulse">
                          {selectedFrame.decorations?.[0]?.emoji || '✨'}
                        </span>
                        <span
                          style={{
                            backgroundColor: selectedFrame.accent || '#ff3d96',
                            color: '#ffffff',
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-xs border border-white/40"
                        >
                          {selectedFrame.headerTitle || selectedFrame.name}
                        </span>
                        <span className="text-xl animate-pulse">
                          {selectedFrame.decorations?.[1]?.emoji || '💖'}
                        </span>
                      </div>

                      {/* Central Alignment Crosshair Box */}
                      <div
                        style={{
                          borderColor: selectedFrame.border || '#ff3d96',
                        }}
                        className="w-full h-3/5 border-2 border-dashed rounded-2xl opacity-40 mx-auto flex items-center justify-center"
                      />

                      {/* Bottom Footer Tag Guide */}
                      <div className="flex items-center justify-between text-xs font-black drop-shadow-md">
                        <span className="text-xl">
                          {selectedFrame.decorations?.[2]?.emoji || '⭐'}
                        </span>
                        <span className="text-[9px] font-bold text-white bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20">
                          {selectedFrame.footerText || 'K-PHOTOBOOTH'}
                        </span>
                        <span className="text-xl">
                          {selectedFrame.decorations?.[3]?.emoji || '🎉'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Live Collab Concept Overlays on Camera */}
              {selectedCollabFrame?.id === 'idol-half-heart' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-5 z-20">
                  <div className="flex flex-col items-center animate-pulse">
                    <span className="text-6xl sm:text-7xl select-none filter drop-shadow-[0_0_20px_rgba(255,61,150,0.8)]">
                      🫶
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-300 bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-pink-500/30">
                      Ghép tim tại đây
                    </span>
                  </div>
                </div>
              )}

              {selectedCollabFrame?.id === 'cat-ear-headband' && (
                <div className="absolute top-4 inset-x-0 pointer-events-none flex justify-center z-20">
                  <span className="text-5xl sm:text-6xl select-none filter drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-bounce">
                    🐱
                  </span>
                </div>
              )}

              {selectedCollabFrame?.id === 'y2k-cyber-glitch' && (
                <div className="absolute inset-3 border border-dashed border-cyan-400/60 rounded-2xl pointer-events-none z-20 flex flex-col justify-between p-2.5 font-mono text-[9px] text-cyan-300">
                  <div className="flex justify-between">
                    <span>[REC] 24FPS</span>
                    <span>Y2K CYBER HUD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ISO 400</span>
                    <span>3.2 MEGAPIXELS</span>
                  </div>
                </div>
              )}

              {selectedCollabFrame?.id === 'film-slate' && (
                <div className="absolute inset-x-0 top-0 h-8 bg-black/80 flex items-center justify-between px-3 text-[9px] font-mono text-neutral-300 pointer-events-none z-20 border-b border-white/20">
                  <span>SCENE 01 / TAKE 01</span>
                  <span>SNUGGIE PHOTOBOOTH</span>
                </div>
              )}

              {/* Camera Overlaid Controls Bar (Top) */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20 text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {layoutItems.find((i) => i.id === layout)?.title || '4-Cut Dọc'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={cycleBeautyLevel}
                    className={`h-7 px-2 rounded-full backdrop-blur-md border flex items-center gap-1 text-[10px] font-black transition active:scale-95 cursor-pointer ${
                      beautyLevel > 0
                        ? 'bg-pink-100/90 border-pink-300 text-[#FF3D96]'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    }`}
                    title="Làm mịn da AI Bojeong"
                  >
                    <span>{BEAUTY_LEVELS[beautyLevel]?.icon || '✨'}</span>
                    <span className="hidden sm:inline">{BEAUTY_LEVELS[beautyLevel]?.label || 'Bojeong'}</span>
                  </button>

                  <button
                    onClick={toggleUltraWide}
                    className={`h-7 px-2 rounded-full backdrop-blur-md border text-[10px] font-black transition active:scale-95 cursor-pointer ${
                      isUltraWide
                        ? 'bg-amber-400 border-amber-300 text-[#29252C]'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    }`}
                    title="Góc siêu rộng 0.5x Ultra-Wide"
                  >
                    {isUltraWide ? '0.5x' : '1.0x'}
                  </button>

                  {hasThemedFrame && (
                    <button
                      onClick={() => setShowFrameGuide(!showFrameGuide)}
                      className={`w-7 h-7 rounded-full backdrop-blur-md border flex items-center justify-center transition active:scale-95 cursor-pointer ${
                        showFrameGuide
                          ? 'bg-white text-[#FF3D96] border-pink-200'
                          : 'bg-black/50 text-white/70 border-white/20'
                      }`}
                      title={showFrameGuide ? 'Ẩn khung căn góc' : 'Hiện khung căn góc'}
                    >
                      {showFrameGuide ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  )}

                  <button
                    onClick={toggleFacingMode}
                    className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition active:scale-95 cursor-pointer"
                    title={t('flip_camera')}
                  >
                    <SwitchCamera size={13} />
                  </button>
                </div>
              </div>

              {/* Bottom active pill on mirror */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-30 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  {t(selectedFilter?.nameKey) || selectedFilter?.name}
                </span>
                {hasThemedFrame && (
                  <span className="bg-[#FF3D96] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                    {selectedFrame.name}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-[#766F7B] font-medium flex items-center justify-center gap-1.5">
              <span>💡</span>
              <span>Gương xem trước trực tiếp: chọn ảnh dưới đây để thấy hiệu ứng ngay trên mặt!</span>
            </p>
          </div>

          {/* ================= RIGHT COLUMN: 100% VISUAL STYLE CONTROL DECK ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. CHỌN BỐ CỤC DẢI ẢNH (MINIATURE PHOTO STRIP PREVIEWS) */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>Chọn Kiểu Dải Ảnh (Layout)</span>
                </h3>
                <span className="text-xs font-black text-[#FF3D96] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                  {layoutItems.find((i) => i.id === layout)?.slots || 4} Poses
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {layoutItems.map((item) => {
                  const isSelected = layout === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLayout(item.id)}
                      className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col items-center justify-between gap-1.5 group ${
                        isSelected
                          ? 'border-[#FF3D96] bg-pink-50/50 shadow-md shadow-pink-500/10 ring-2 ring-pink-300'
                          : 'border-pink-100 bg-[#FFFDF9] hover:border-pink-300'
                      }`}
                    >
                      {/* REAL MINI PHOTO STRIP SHOWCASE */}
                      <div className="w-13 sm:w-14 h-28 bg-white rounded-xl border border-pink-200 p-1 flex flex-col justify-between items-center shadow-xs overflow-hidden">
                        {(item.type === '1x4' || item.type === '1x6' || item.type === '1x3' || item.type === '1x2') && (
                          <div className="w-full flex flex-col justify-between h-full gap-0.5">
                            {SAMPLE_PORTRAITS.slice(0, item.slots).map((url, idx) => (
                              <div key={idx} className="w-full flex-1 rounded-xs overflow-hidden bg-neutral-100">
                                <img src={url} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        {(item.type === '2x2' || item.type === '2x3') && (
                          <div className="w-full grid grid-cols-2 gap-0.5 h-full">
                            {SAMPLE_PORTRAITS.slice(0, item.slots).map((url, idx) => (
                              <div key={idx} className="w-full flex-1 rounded-xs overflow-hidden bg-neutral-100">
                                <img src={url} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-center w-full">
                        <p className="font-black text-[11px] sm:text-xs text-[#29252C] truncate">
                          {item.title}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-[#766F7B] font-bold">
                          {item.slots} Poses
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 2. BỘ LỌC MÀU (REAL PORTRAIT PHOTO PREVIEWS) */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Bộ Lọc Màu Yêu Thích (Signature Filters)</span>
                </h3>
                <span className="text-xs font-bold text-[#FF3D96]">
                  {t(selectedFilter?.nameKey) || selectedFilter?.name}
                </span>
              </div>

              {/* Photo Cards Grid for each filter */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {FILTERS.map((f) => {
                  const isSelected = selectedFilter?.id === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={`group p-1.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#FF3D96] bg-pink-50 shadow-md shadow-pink-500/10 ring-2 ring-pink-300'
                          : 'border-pink-100 bg-[#FFFDF9] hover:border-pink-300'
                      }`}
                    >
                      {/* REAL PHOTO THUMBNAIL WITH DYNAMIC FILTER APPLIED */}
                      <div className="w-full aspect-[4/5] rounded-xl overflow-hidden relative shadow-xs">
                        <img
                          src={SAMPLE_PORTRAITS[0]}
                          alt={f.name}
                          style={{ filter: f.css }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FF3D96]/15 border-2 border-[#FF3D96] rounded-xl flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-[#FF3D96] text-white flex items-center justify-center shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center">
                        <p className="font-black text-[11px] text-[#29252C] truncate">
                          {t(f.nameKey) || f.name}
                        </p>
                        <span
                          style={{ color: f.color }}
                          className="text-[8px] font-extrabold uppercase block truncate"
                        >
                          {f.badge}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 3. KHUNG HỖ TRỢ CHỤP (VISUAL THEMED STRIP CARDS & MOBILE UPLOAD) */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>Khung Hỗ Trợ Chụp & Thần Tượng (22+ Mẫu)</span>
                </h3>
                <button
                  onClick={onOpenFrameModal}
                  className="text-xs font-black text-[#FF3D96] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <span>→</span>
                </button>
              </div>

              {/* Visual Strip Cards Horizontal Slider */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* UPLOAD CUSTOM FRAME CARD */}
                <div
                  onClick={onOpenFrameModal}
                  className="group relative border-2 border-dashed border-pink-300 hover:border-[#FF3D96] bg-pink-50/40 hover:bg-pink-50/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-98 min-h-[160px]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white border border-pink-200 text-[#FF3D96] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
                    <Upload size={18} />
                  </div>
                  <h4 className="font-black text-xs text-[#29252C] group-hover:text-[#FF3D96]">
                    Tải lên khung của bạn
                  </h4>
                  <p className="text-[9px] text-[#766F7B] mt-0.5 leading-tight">
                    File PNG tách nền từ điện thoại
                  </p>
                  <span className="mt-2 text-[8px] font-black uppercase text-[#FF3D96] bg-pink-100 px-2 py-0.5 rounded-full">
                    Từ Máy Bạn
                  </span>
                </div>

                {/* TOP THEMED FRAMES WITH MINI PHOTOS */}
                {topVisualFrames.slice(0, 3).map((frame) => {
                  const isSelected = selectedFrame?.id === frame.id
                  return (
                    <div
                      key={frame.id}
                      onClick={() => onSelectFrame && onSelectFrame(frame)}
                      className={`relative rounded-2xl p-2.5 flex flex-col items-center cursor-pointer transition active:scale-98 border-2 ${
                        isSelected
                          ? 'border-[#FF3D96] bg-pink-50/50 ring-2 ring-pink-300 shadow-md'
                          : 'border-pink-100 bg-[#FFFDF9] hover:border-pink-300'
                      }`}
                    >
                      {/* MINIATURE 1X4 STRIP WITH SAMPLES */}
                      <div
                        style={{
                          background: frame.bg || '#ffffff',
                          borderColor: frame.border || '#fbcfe8',
                        }}
                        className="w-16 h-28 rounded-xl border p-1 flex flex-col justify-between items-center shadow-xs overflow-hidden relative"
                      >
                        <span
                          style={{ color: frame.text || '#29252c' }}
                          className="text-[4px] font-black uppercase truncate text-center w-full"
                        >
                          {frame.headerTitle || frame.name}
                        </span>

                        <div className="w-full flex flex-col justify-between flex-1 py-0.5 gap-0.5">
                          {SAMPLE_PORTRAITS.map((url, i) => (
                            <div key={i} className="w-full h-4 rounded-xs overflow-hidden bg-black/10">
                              <img src={url} alt={`Cutout ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>

                        <span
                          style={{ color: frame.text || '#29252c' }}
                          className="text-[3px] font-bold text-center opacity-70"
                        >
                          {frame.footerText || 'K-PHOTOBOOTH'}
                        </span>
                      </div>

                      <div className="w-full text-center mt-1.5">
                        <span className="text-[7px] font-black uppercase px-1.5 py-0.2 rounded-full bg-pink-100 text-[#FF3D96]">
                          {frame.badge || 'HOT'}
                        </span>
                        <p className="font-black text-[11px] text-[#29252C] truncate mt-0.5">
                          {frame.name}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* View all frames button */}
              <button
                onClick={onOpenFrameModal}
                className="w-full py-2.5 rounded-2xl bg-[#FFF7EF] hover:bg-pink-50 border border-pink-200 text-xs font-black text-[#FF3D96] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ImageIcon size={15} />
                <span>Mở toàn bộ kho khung (BTS, Born Pink, Sanrio, NewJeans, Y2K...)</span>
              </button>
            </section>

            {/* 4. KHUNG CONCEPT & ĐẠO CỤ COLLAB (VISUAL PROPS CARDS) */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-xs space-y-3">
              <h3 className="text-sm sm:text-base font-black text-[#29252C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#FF3D96] flex items-center justify-center text-xs font-black">
                  4
                </span>
                <span>Khung Concept & Đạo Cụ Chụp Chung</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {COLLAB_FRAMES.map((cf) => {
                  const isSelected = selectedCollabFrame?.id === cf.id
                  return (
                    <button
                      key={cf.id}
                      onClick={() => setSelectedCollabFrame(cf)}
                      className={`p-2 rounded-2xl border-2 text-center transition cursor-pointer relative flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#FF3D96] bg-pink-50/50 shadow-md ring-2 ring-pink-300'
                          : 'border-pink-100 bg-[#FFFDF9] hover:border-pink-300'
                      }`}
                    >
                      {/* Visual Photo Card with Prop Overlay */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-xs bg-neutral-100">
                        <img
                          src={SAMPLE_PORTRAITS[1]}
                          alt={cf.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Prop Mockup Overlay */}
                        {cf.id === 'idol-half-heart' && (
                          <div className="absolute inset-0 flex items-center justify-end pr-1 bg-black/20">
                            <span className="text-2xl filter drop-shadow-md animate-pulse">🫶</span>
                          </div>
                        )}
                        {cf.id === 'cat-ear-headband' && (
                          <div className="absolute top-0.5 inset-x-0 flex justify-center bg-black/10">
                            <span className="text-xl filter drop-shadow-md animate-bounce">🐱</span>
                          </div>
                        )}
                        {cf.id === 'y2k-cyber-glitch' && (
                          <div className="absolute inset-1 border border-cyan-400/80 rounded-sm flex items-center justify-center text-[7px] text-cyan-300 font-mono">
                            <span>[HUD]</span>
                          </div>
                        )}
                        {cf.id === 'film-slate' && (
                          <div className="absolute top-0 inset-x-0 h-3 bg-black/80 flex items-center justify-center text-[6px] text-white font-mono">
                            <span>SCENE 01</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center">
                        <p className="font-black text-[11px] text-[#29252C] truncate">{cf.name}</p>
                        <span className="text-[8px] font-bold text-[#FF3D96]">{cf.badge}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 5. MÀU KHUNG & TÙY CHỌN BỔ SUNG */}
            <section className="bg-white rounded-3xl border border-pink-100 p-4 shadow-xs">
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[#FF3D96]" />
                  <span className="font-black text-xs uppercase tracking-wider text-[#29252C]">
                    Màu Khung Ảnh Trơn & Hẹn Giờ Chụp
                  </span>
                </div>
                {showMoreOptions ? (
                  <ChevronUp size={16} className="text-[#766F7B]" />
                ) : (
                  <ChevronDown size={16} className="text-[#766F7B]" />
                )}
              </button>

              {showMoreOptions && (
                <div className="mt-4 pt-4 border-t border-pink-100 space-y-4 animate-fade-in">
                  {/* Visual Strip Colors */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#766F7B]">Màu viền dải ảnh:</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {FRAME_COLORS.map((c) => {
                        const isSelected = frameColor?.id === c.id
                        return (
                          <button
                            key={c.id}
                            onClick={() => setFrameColor(c)}
                            className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                              isSelected
                                ? 'border-[#FF3D96] bg-pink-50 ring-2 ring-[#FF3D96]/30'
                                : 'border-pink-100 bg-white hover:border-pink-200'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: c.bg, borderColor: c.border }}
                              className="w-6 h-6 rounded-full border-2 shadow-xs shrink-0 flex items-center justify-center text-[10px]"
                            >
                              {isSelected && '✓'}
                            </span>
                            <span className="text-[9px] font-bold text-[#29252C] truncate w-full">
                              {t(c.nameKey) || c.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Countdown Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                      <Clock size={13} /> {t('countdown_title')}
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 8].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setCountdownDuration(sec)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                            countdownDuration === sec
                              ? 'bg-[#FF3D96] text-white shadow-xs'
                              : 'bg-[#FFF7EF] text-[#766F7B] hover:bg-pink-50'
                          }`}
                        >
                          {sec} {t('seconds_unit')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Strip Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#766F7B] flex items-center gap-1.5">
                      <Type size={13} /> {t('custom_title_label')}
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="SNUGGIE PHOTOBOOTH"
                      className="w-full px-4 py-2 rounded-xl bg-[#FFF7EF] border border-pink-100 focus:outline-none focus:border-[#FF3D96] text-xs font-bold uppercase tracking-wider text-[#29252C]"
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar with CONTINUE CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-pink-100/90 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF3D96] via-[#FF589E] to-[#FF75A9] hover:from-[#E62E84] hover:to-[#FF589E] text-white font-black text-base shadow-xl shadow-[#FF3D96]/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera size={20} />
            <span>TIẾP TỤC CHỤP ẢNH ({layoutItems.find((i) => i.id === layout)?.slots || 4} POSE)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
