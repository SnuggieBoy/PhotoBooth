import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  SwitchCamera,
  Sparkles,
  Volume2,
  VolumeX,
  Hand,
  Smile,
} from 'lucide-react'
import { soundFX } from '../utils/audio'
import { useLanguage } from '../i18n/LanguageContext'
import { ShotRingBuffer } from '../utils/videoBuffer'
import {
  initGestureRecognizer,
  detectGesture,
  BEAUTY_LEVELS,
} from '../utils/aiVision'

export default function CameraView({
  onPhotoTaken,
  shotsCount = 4,
  currentShotIndex = 0,
  filterCss = 'none',
  countdownDuration = 3,
  collabFrame = 'none', // 'none' | 'idol-half-heart' | 'cat-ear-headband' | 'y2k-cyber-glitch' | 'film-slate'
}) {
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const ringBufferRef = useRef(new ShotRingBuffer(60))
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user')
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(countdownDuration)
  const [isFlashing, setIsFlashing] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isUltraWide, setIsUltraWide] = useState(false) // 0.5x lens simulation

  // AI Features State
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [gestureToast, setGestureToast] = useState(null)
  const [beautyLevel, setBeautyLevel] = useState(1) // 1 = Natural Bojeong by default

  // Active composite filter: base filter + AI beauty filter
  const activeBeautyCss = BEAUTY_LEVELS[beautyLevel]?.css || ''
  const compositeFilterCss = `${filterCss && filterCss !== 'none' ? filterCss : ''} ${activeBeautyCss}`.trim() || 'none'

  // Initialize camera stream
  useEffect(() => {
    let activeStream = null

    async function startCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        activeStream = mediaStream
        setStream(mediaStream)
        setHasPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setHasPermission(false)
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
      ringBufferRef.current.clear()
    }
  }, [facingMode])

  // Sample pre-shot frames at 24 fps during countdown for Boomerang
  useEffect(() => {
    let sampleTimer = null
    if (isCountingDown) {
      sampleTimer = setInterval(async () => {
        const video = videoRef.current
        if (!video || video.readyState < 2) return
        try {
          const bitmap = await createImageBitmap(video, {
            resizeWidth: 480,
            resizeHeight: 360,
          })
          ringBufferRef.current.push(bitmap)
        } catch {
          // ignore transient frame capture aborts
        }
      }, 41) // ~24 fps
    }

    return () => {
      if (sampleTimer) clearInterval(sampleTimer)
    }
  }, [isCountingDown])

  // MediaPipe Gesture Recognition loop (Runs decoupled at ~8 Hz)
  useEffect(() => {
    let gestureInterval = null
    let isDisposed = false

    if (gestureEnabled && !isCountingDown) {
      initGestureRecognizer().then((recognizer) => {
        if (!recognizer || isDisposed) return

        gestureInterval = setInterval(() => {
          if (!videoRef.current || isCountingDown) return
          const gesture = detectGesture(videoRef.current)

          if (gesture === 'Victory' || gesture === 'Open_Palm') {
            const label = gesture === 'Victory' ? '✌️ Chữ V (Victory)' : '🖐️ Mở Lòng Bàn Tay'
            setGestureToast(`${label}! Bắt đầu chụp...`)
            setTimeout(() => setGestureToast(null), 2500)
            triggerCapture()
          }
        }, 125)
      })
    }

    return () => {
      isDisposed = true
      if (gestureInterval) clearInterval(gestureInterval)
    }
  }, [gestureEnabled, isCountingDown])

  // Handle countdown trigger
  const triggerCapture = () => {
    if (isCountingDown) return
    setIsCountingDown(true)
    setCountdown(countdownDuration)

    if (soundEnabled) soundFX.playBeep(false)

    let current = countdownDuration
    const timer = setInterval(() => {
      current -= 1
      if (current > 0) {
        setCountdown(current)
        if (soundEnabled) soundFX.playBeep(false)
      } else {
        clearInterval(timer)
        setCountdown(0)
        takeSnapshot()
      }
    }, 1000)
  }

  // Snap the frame from video to canvas
  const takeSnapshot = () => {
    if (!videoRef.current) return

    if (soundEnabled) soundFX.playShutter()
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 300)

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    // Mirror image if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    // Apply active composite filter (Filter preset + AI Bojeong)
    if (compositeFilterCss && compositeFilterCss !== 'none') {
      ctx.filter = compositeFilterCss
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Capture the 60 buffer frames for Boomerang
    const capturedFrames = ringBufferRef.current.getFrames()
    ringBufferRef.current = new ShotRingBuffer(60)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

    setIsCountingDown(false)
    onPhotoTaken(dataUrl, capturedFrames)
  }

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const cycleBeautyLevel = () => {
    setBeautyLevel((prev) => (prev + 1) % BEAUTY_LEVELS.length)
  }

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[68vh] rounded-3xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-2xl flex items-center justify-center select-none">
      {/* Flash effect overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Video Stream with optional 0.5x Ultra-Wide Fisheye Simulation */}
      {hasPermission === false ? (
        <div className="p-8 text-center max-w-md">
          <Camera className="w-16 h-16 mx-auto mb-4 text-pink-500 opacity-60" />
          <h3 className="font-bold text-lg mb-2">{t('camera_no_permission')}</h3>
          <p className="text-sm text-neutral-400 mb-4">
            {t('camera_no_permission_desc')}
          </p>
          <button
            onClick={() => setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))}
            className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 font-bold text-sm transition"
          >
            {t('camera_retry')}
          </button>
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

      {/* Live Collab Frame Cutout Overlay */}
      {collabFrame === 'idol-half-heart' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-6 z-20">
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-7xl sm:text-8xl select-none filter drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]">
              🫶
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300 bg-black/60 px-2.5 py-1 rounded-full mt-2 border border-pink-500/30">
              Ghép nửa trái tim
            </span>
          </div>
        </div>
      )}

      {collabFrame === 'cat-ear-headband' && (
        <div className="absolute top-6 inset-x-0 pointer-events-none flex justify-center z-20">
          <span className="text-6xl sm:text-7xl select-none filter drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce">
            🐱
          </span>
        </div>
      )}

      {collabFrame === 'y2k-cyber-glitch' && (
        <div className="absolute inset-3 border-2 border-dashed border-cyan-400/60 rounded-2xl pointer-events-none z-20 flex flex-col justify-between p-3 font-mono text-[10px] text-cyan-300">
          <div className="flex justify-between">
            <span>[REC] 24FPS</span>
            <span>Y2K CYBER HUD</span>
          </div>
          <div className="flex justify-between">
            <span>ISO 400</span>
            <span>SHUTTER 1/125</span>
          </div>
        </div>
      )}

      {collabFrame === 'film-slate' && (
        <div className="absolute inset-x-0 top-0 h-10 bg-black/80 flex items-center justify-between px-4 text-[10px] font-mono text-neutral-300 pointer-events-none z-20 border-b border-white/20">
          <span>SCENE 01 / TAKE 04</span>
          <span>DIRECTOR: K-PHOTOBOOTH</span>
        </div>
      )}

      {/* Gesture Recognition Toast Notification */}
      {gestureToast && (
        <div className="absolute top-16 inset-x-0 flex justify-center z-40 pointer-events-none animate-bounce">
          <div className="bg-pink-500 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow-lg shadow-pink-500/40 flex items-center gap-2">
            <Sparkles size={14} />
            <span>{gestureToast}</span>
          </div>
        </div>
      )}

      {/* Countdown Big Overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center animate-bounce">
            <span className="text-8xl sm:text-9xl font-black text-pink-400 drop-shadow-[0_0_35px_rgba(244,114,182,0.9)]">
              {countdown > 0 ? countdown : '📸'}
            </span>
            <p className="text-white text-lg font-bold tracking-wider mt-4 uppercase">
              {countdown > 0 ? t('countdown_prep') : t('countdown_smile')}
            </p>
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
        {/* Shot Counter Pill */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            {t('shot_indicator')} {currentShotIndex + 1} / {shotsCount}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Hands-free Gesture Trigger Toggle */}
          <button
            onClick={() => setGestureEnabled(!gestureEnabled)}
            className={`h-9 px-2.5 rounded-full backdrop-blur-md border flex items-center gap-1.5 text-xs font-black transition active:scale-95 ${
              gestureEnabled
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-pink-400 text-white shadow-md shadow-pink-500/30 ring-2 ring-pink-500/40'
                : 'bg-black/60 border-white/10 text-white/80 hover:bg-black/80'
            }`}
            title="Chụp rảnh tay bằng cử chỉ (✌️ Chữ V hoặc 🖐️ Mở bàn tay)"
          >
            <span>✌️</span>
            <span className="hidden sm:inline">Rảnh tay</span>
          </button>

          {/* AI Beauty Bojeong Level Button */}
          <button
            onClick={cycleBeautyLevel}
            className={`h-9 px-2.5 rounded-full backdrop-blur-md border flex items-center gap-1 text-xs font-black transition active:scale-95 ${
              beautyLevel > 0
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                : 'bg-black/60 border-white/10 text-white/60 hover:bg-black/80'
            }`}
            title="Cấp độ làm mịn da AI (Bojeong)"
          >
            <span>{BEAUTY_LEVELS[beautyLevel].icon}</span>
            <span className="hidden sm:inline">{BEAUTY_LEVELS[beautyLevel].label}</span>
          </button>

          {/* 0.5x Ultra Wide Lens Toggle */}
          <button
            onClick={() => setIsUltraWide(!isUltraWide)}
            className={`h-9 px-2.5 rounded-full backdrop-blur-md border flex items-center gap-1 text-xs font-black transition active:scale-95 ${
              isUltraWide
                ? 'bg-amber-400/90 border-amber-300 text-black shadow-md shadow-amber-400/30'
                : 'bg-black/60 border-white/10 text-white hover:bg-black/80'
            }`}
            title="Góc siêu rộng 0.5x Ultra-Wide"
          >
            {isUltraWide ? '0.5x WIDE' : '1.0x'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-95"
            title={soundEnabled ? t('sound_mute') : t('sound_unmute')}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Camera Flip */}
          <button
            onClick={toggleFacingMode}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-95"
            title={t('flip_camera')}
          >
            <SwitchCamera size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Shutter Overlay */}
      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-30 pointer-events-auto">
        <button
          disabled={isCountingDown || hasPermission === false}
          onClick={triggerCapture}
          className="group relative p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.9)] transition-all">
            <Camera size={26} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  )
}
