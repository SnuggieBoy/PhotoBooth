import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import { drawSingleStroke } from './doodleEngine'

export const isWebCodecsSupported = () => {
  return typeof window !== 'undefined' && 'VideoEncoder' in window
}

/**
 * Determine the optimal H.264 AVC codec configuration supported by this device.
 * AVC Level 4.0 (0x28) or higher supports 1080p resolutions, solving the Level 3.0 (0x1E) limit.
 */
async function getSupportedH264Codec(width, height, bitrate) {
  const candidateCodecs = [
    'avc1.420028', // Baseline Profile Level 4.0 (supports up to 2,097,152 pixels)
    'avc1.420029', // Baseline Profile Level 4.1
    'avc1.4d002a', // Main Profile Level 4.2
    'avc1.640028', // High Profile Level 4.0
    'avc1.64002a', // High Profile Level 4.2
    'avc1.420033', // Baseline Profile Level 5.1 (supports 4K)
    'avc1.42001f', // Baseline Profile Level 3.1
  ]

  if (typeof VideoEncoder !== 'undefined' && typeof VideoEncoder.isConfigSupported === 'function') {
    for (const codec of candidateCodecs) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec,
          width,
          height,
          bitrate,
        })
        if (support && support.supported) {
          return codec
        }
      } catch {
        // Continue checking other candidates
      }
    }
  }

  // Fallback to widely compatible Baseline Level 4.0
  return 'avc1.420028'
}

/**
 * Renders an animated Boomerang 4-Cut video strip (MP4) using WebCodecs & mp4-muxer.
 * Runs 100% on GPU/Hardware encoder with zero server latency.
 */
export async function exportBoomerangMp4({
  videoClips = [], // Array of Array of ImageBitmaps (e.g. 4 shots x 60 frames)
  layout = 'strip-4',
  frameColor = { bg: '#ffffff', text: '#1e293b' },
  customText = 'SNUGGIE PHOTOBOOTH',
  stickers = [],
  doodleStrokes = [],
  filterCss = 'none',
  language = 'vi',
  onProgress,
}) {
  if (!isWebCodecsSupported()) {
    throw new Error('Trình duyệt không hỗ trợ WebCodecs VideoEncoder.')
  }

  if (!videoClips || videoClips.length === 0) {
    throw new Error('Chưa có dữ liệu khung hình camera để tạo video Boomerang.')
  }

  const isGrid = layout === 'grid-4'
  const isDuo = layout === 'strip-2'

  // Dimensions aligned to multiples of 16 for optimal H.264 hardware encoding
  const videoWidth = isGrid ? 768 : 528
  const videoHeight = isGrid ? 1040 : isDuo ? 768 : 1536

  const canvas = document.createElement('canvas')
  canvas.width = videoWidth
  canvas.height = videoHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: false })

  // Find supported H.264 codec string (Level 4.0+ for 1080p support)
  const bitrate = 2_500_000 // 2.5 Mbps crisp video
  const chosenCodec = await getSupportedH264Codec(videoWidth, videoHeight, bitrate)

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

  // Configure VideoEncoder with chosen Level 4.0+ codec
  videoEncoder.configure({
    codec: chosenCodec,
    width: videoWidth,
    height: videoHeight,
    bitrate,
  })

  const fps = 24
  const totalDurationSeconds = 4 // 4-second boomerang loop
  const totalFrames = fps * totalDurationSeconds // 96 frames

  // Layout slots
  const photoWidth = isGrid ? 336 : 456
  const photoHeight = isGrid ? 336 : 288
  const paddingX = 36
  const startY = 88
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

  // Preload custom image stickers once before the 96-frame loop
  const imageStickerMap = new Map()
  const customImageStickers = stickers.filter((s) => s.type === 'image' && s.content)
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

  // Encode 96 frames in a ping-pong loop
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

    // 4. Draw Stickers (with rotation, scale, and types)
    stickers.forEach((stk) => {
      const sx = (stk.x / 100) * videoWidth
      const sy = (stk.y / 100) * videoHeight
      const stickerScale = stk.scale || 1
      const rotation = ((stk.rotation || 0) * Math.PI) / 180

      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(rotation)

      if (stk.type === 'image') {
        const imgEl = imageStickerMap.get(stk.id)
        if (imgEl && imgEl.naturalWidth > 0) {
          const baseSize = 120 * stickerScale
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
        ctx.font = `900 ${22 * stickerScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const metrics = ctx.measureText(stk.content)
        const bgW = metrics.width + 24 * stickerScale
        const bgH = 34 * stickerScale
        ctx.fillStyle = stk.badgeBg || '#ff3d96'
        ctx.beginPath()
        ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 17 * stickerScale)
        ctx.fill()
        ctx.fillStyle = stk.textColor || '#ffffff'
        ctx.fillText(stk.content, 0, 0)
      } else if (stk.type === 'tape') {
        ctx.font = `900 ${18 * stickerScale}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const metrics = ctx.measureText(stk.content)
        const bgW = metrics.width + 32 * stickerScale
        const bgH = 30 * stickerScale
        ctx.fillStyle = stk.bg || '#ffe4e6'
        ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH)
        ctx.fillStyle = stk.color || '#f43f5e'
        ctx.fillText(stk.content, 0, 0)
      } else {
        ctx.font = `${54 * stickerScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(stk.content || stk.emoji, 0, 0)
      }
      ctx.restore()
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

    // Report normalized progress 0.0 to 1.0
    if (onProgress) {
      onProgress((k + 1) / totalFrames)
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
