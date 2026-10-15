import { useState, useEffect, useRef } from 'react'
import { Camera, SwitchCamera, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { soundFX } from '../utils/audio'
import { useLanguage } from '../i18n/LanguageContext'

export default function CameraView({
  onPhotoTaken,
  shotsCount = 4,
  currentShotIndex = 0,
  filterCss = 'none',
  countdownDuration = 3,
}) {
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user')
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(countdownDuration)
  const [isFlashing, setIsFlashing] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Initialize camera stream
  useEffect(() => {
    let activeStream = null

    async function startCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
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
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

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

    // Apply active filter
    if (filterCss && filterCss !== 'none') {
      ctx.filter = filterCss
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

    setIsCountingDown(false)
    onPhotoTaken(dataUrl)
  }

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
  }

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[68vh] rounded-3xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-2xl flex items-center justify-center">
      {/* Flash effect overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Video Stream */}
      {hasPermission === false ? (
        <div className="p-8 text-center max-w-md">
          <Camera className="w-16 h-16 mx-auto mb-4 text-pink-500 opacity-60" />
          <h3 className="font-bold text-lg mb-2">{t('camera_no_permission')}</h3>
          <p className="text-sm text-neutral-400 mb-4">
            {t('camera_no_permission_desc')}
          </p>
          <button
            onClick={() => setFacingMode(f => (f === 'user' ? 'environment' : 'user'))}
            className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 font-bold text-sm transition"
          >
            {t('camera_retry')}
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ filter: filterCss }}
          className={`w-full h-full object-cover transition-all ${
            facingMode === 'user' ? '-scale-x-100' : ''
          }`}
        />
      )}

      {/* Countdown Big Overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-40">
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
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            {t('shot_indicator')} {currentShotIndex + 1} / {shotsCount}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-95"
            title={soundEnabled ? t('sound_mute') : t('sound_unmute')}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={toggleFacingMode}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-95"
            title={t('flip_camera')}
          >
            <SwitchCamera size={18} />
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
