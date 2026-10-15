import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import { drawSingleStroke } from './doodleEngine'

export const isWebCodecsSupported = () => {
  return typeof window !== 'undefined' && 'VideoEncoder' in window
}

/**
 * Renders an animated Boomerang 4-Cut video strip (MP4) using WebCodecs & mp4-muxer.
 * Runs 100% on GPU/Hardware encoder with zero server latency.
 */
export async function exportBoomerangMp4({
  videoClips = [], // Array of Array of ImageBitmaps (e.g. 4 shots x 60 frames)
  layout = 'strip-4',
  frameColor = { bg: '#ffffff', text: '#1e293b' },
  customText = 'K-PHOTOBOOTH',
  stickers = [],
  doodleStrokes = [],
  filterCss = 'none',
  language = 'vi',
  onProgress,
}) {
  if (!isWebCodecsSupported()) {
    throw new Error('WebCodecs VideoEncoder is not supported in this browser.')
  }

  if (!videoClips || videoClips.length === 0) {
    throw new Error('No video frames recorded for Boomerang.')
  }

  const isGrid = layout === 'grid-4'
  const isDuo = layout === 'strip-2'

  // Dimensions must be even numbers for H.264 video encoding
  const videoWidth = isGrid ? 760 : 520
  const videoHeight = isGrid ? 1040 : isDuo ? 760 : 1520
  const scale = 2 // 2x scale for crisp 720p/1080p mobile video

  const canvas = document.createElement('canvas')
  canvas.width = videoWidth
  canvas.height = videoHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: false })

  // Initialize mp4-muxer
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: videoWidth,
      height: videoHeight,
    },
    fastStart: 'in-memory',
  })

  // Initialize WebCodecs VideoEncoder
  let encodeError = null
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      console.error('WebCodecs VideoEncoder error:', e)
      encodeError = e
    },
  })

  // Configure H.264 Baseline Profile (avc1.42001E)
  videoEncoder.configure({
    codec: 'avc1.42001E',
    width: videoWidth,
    height: videoHeight,
    bitrate: 2_500_000, // 2.5 Mbps crisp video
  })

  const fps = 24
  const totalDurationSeconds = 4 // 4-second boomerang loop
  const totalFrames = fps * totalDurationSeconds // 96 frames
  const maxRecorded = Math.max(...videoClips.map((c) => c?.length || 1), 60)

  // Layout slots
  const photoWidth = (isGrid ? 330 : 448)
  const photoHeight = (isGrid ? 330 : 284)
  const paddingX = 36
  const startY = 84
  const gap = 24

  // Map loop index k (0..95) to ping-pong boomerang frame index
  const getPingPongIndex = (k, clipLength) => {
    if (clipLength <= 1) return 0
    const half = clipLength
    const fullCycle = half * 2 - 2
    const cycleIndex = k % (fullCycle || 1)
    if (cycleIndex < half) {
      return cycleIndex
    } else {
      return fullCycle - cycleIndex
    }
  }

  // Pre-calculate date string
  const locale =
    language === 'vi'
      ? 'vi-VN'
      : language === 'ko'
      ? 'ko-KR'
      : language === 'ja'
      ? 'ja-JP'
      : 'en-US'
  const dateStr = new Date().toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Encode 96 frames
  for (let k = 0; k < totalFrames; k++) {
    if (encodeError) throw encodeError

    // 1. Draw Frame Background
    ctx.fillStyle = frameColor.bg
    ctx.fillRect(0, 0, videoWidth, videoHeight)

    // 2. Draw Header Text
    ctx.fillStyle = frameColor.text
    ctx.font = `900 ${28}px sans-serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = '4px'
    ctx.fillText(customText.toUpperCase(), videoWidth / 2, 56)

    // 3. Draw Video Frames for each Shot Slot
    videoClips.forEach((clip, i) => {
      let x = paddingX
      let y = startY + i * (photoHeight + gap)

      if (isGrid) {
        const col = i % 2
        const row = Math.floor(i / 2)
        x = paddingX + col * (photoWidth + gap)
        y = startY + row * (photoHeight + gap)
      }

      const frameIdx = getPingPongIndex(k, clip.length)
      const bitmap = clip[frameIdx]

      ctx.save()
      if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss
      }

      if (bitmap) {
        ctx.drawImage(bitmap, x, y, photoWidth, photoHeight)
      } else {
        ctx.fillStyle = '#262626'
        ctx.fillRect(x, y, photoWidth, photoHeight)
      }
      ctx.restore()
    })

    // 4. Draw Stickers
    ctx.font = `${56}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    stickers.forEach((stk) => {
      const sx = (stk.x / 100) * videoWidth
      const sy = (stk.y / 100) * videoHeight
      ctx.fillText(stk.emoji, sx, sy)
    })

    // 5. Draw Purikura Doodles
    if (doodleStrokes.length > 0) {
      const doodleScale = videoWidth / (isGrid ? 380 : 260)
      doodleStrokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke, doodleScale)
      })
    }

    // 6. Draw Footer Info & Barcode
    const footerY = videoHeight - 40
    ctx.font = `700 ${18}px sans-serif`
    ctx.textAlign = 'left'
    ctx.fillStyle = frameColor.text
    ctx.fillText(dateStr, paddingX, footerY - 8)

    ctx.font = `600 ${14}px monospace`
    ctx.globalAlpha = 0.6
    ctx.fillText('SEOUL • TOKYO • SAIGON', paddingX, footerY + 16)
    ctx.globalAlpha = 1.0

    // 7. Create VideoFrame & Send to Encoder
    const timestampMicros = Math.round(k * (1_000_000 / fps))
    const videoFrame = new VideoFrame(canvas, { timestamp: timestampMicros })
    videoEncoder.encode(videoFrame, { keyFrame: k % (fps * 2) === 0 })
    videoFrame.close()

    // 8. Backpressure protection: If encoder queue is full, yield to CPU/GPU
    if (videoEncoder.encodeQueueSize > 5) {
      await new Promise((resolve) => setTimeout(resolve, 8))
    }

    if (onProgress) {
      onProgress(Math.round(((k + 1) / totalFrames) * 100))
    }
  }

  // Finalize video encoding
  await videoEncoder.flush()
  videoEncoder.close()
  muxer.finalize()

  const buffer = muxer.target.buffer
  const blob = new Blob([buffer], { type: 'video/mp4' })
  const url = URL.createObjectURL(blob)

  return { blob, url }
}
