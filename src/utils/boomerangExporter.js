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
  selectedFrame,
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

  // Themed Frame Resolution
  const hasThemedFrame = selectedFrame && selectedFrame.id !== 'none'
  const isCustomFrame = selectedFrame?.type === 'image' && selectedFrame?.imageUrl
  const activeHeader = hasThemedFrame && selectedFrame.headerTitle ? selectedFrame.headerTitle : customText
  const activeFooter = hasThemedFrame && selectedFrame.footerText ? selectedFrame.footerText : dateStr
  const activeTextColor = hasThemedFrame && selectedFrame.text ? selectedFrame.text : frameColor.text

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

  // Preload custom uploaded frame image overlay if any
  let customFrameImg = null
  if (isCustomFrame) {
    customFrameImg = await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = selectedFrame.imageUrl
    })
  }

  // Encode 96 frames in a ping-pong loop
  for (let k = 0; k < totalFrames; k++) {
    if (encodeError) throw encodeError

    // 1. Draw Frame Background (supports linear gradient themed frames)
    if (hasThemedFrame && selectedFrame.bg) {
      if (selectedFrame.bg.startsWith('linear-gradient')) {
        const grad = ctx.createLinearGradient(0, 0, 0, videoHeight)
        if (selectedFrame.id === 'bts-galaxy') {
          grad.addColorStop(0, '#18092e')
          grad.addColorStop(0.4, '#3b156b')
          grad.addColorStop(1, '#150626')
        } else if (selectedFrame.id === 'blackpink-pink') {
          grad.addColorStop(0, '#09090b')
          grad.addColorStop(0.5, '#1c0a14')
          grad.addColorStop(1, '#09090b')
        } else if (selectedFrame.id === 'capturing-moment') {
          grad.addColorStop(0, '#450a0a')
          grad.addColorStop(0.5, '#7f1d1d')
          grad.addColorStop(1, '#450a0a')
        } else if (selectedFrame.id === 'sweet-heart-couple') {
          grad.addColorStop(0, '#fff1f2')
          grad.addColorStop(0.5, '#ffe4e6')
          grad.addColorStop(1, '#fff1f2')
        } else if (selectedFrame.id === 'digitalcam-cartoon') {
          grad.addColorStop(0, '#dbeafe')
          grad.addColorStop(0.5, '#fce7f3')
          grad.addColorStop(1, '#dcfce7')
        } else if (selectedFrame.id === 'sanrio-kuromi') {
          grad.addColorStop(0, '#fdf2f8')
          grad.addColorStop(0.5, '#fae8ff')
          grad.addColorStop(1, '#fdf2f8')
        } else if (selectedFrame.id === 'newjeans-bunnies') {
          grad.addColorStop(0, '#ecfeff')
          grad.addColorStop(0.5, '#cffafe')
          grad.addColorStop(1, '#e0f2fe')
        } else if (selectedFrame.id === 'ive-eleven') {
          grad.addColorStop(0, '#fdf2f8')
          grad.addColorStop(0.4, '#f472b6')
          grad.addColorStop(1, '#831843')
        } else if (selectedFrame.id === 'aespa-cyber-neon') {
          grad.addColorStop(0, '#050505')
          grad.addColorStop(0.5, '#170c2a')
          grad.addColorStop(1, '#082f49')
        } else if (selectedFrame.id === 'seventeen-carat') {
          grad.addColorStop(0, '#fce7f3')
          grad.addColorStop(0.5, '#ede9fe')
          grad.addColorStop(1, '#dbeafe')
        } else if (selectedFrame.id === 'stray-kids-rockstar') {
          grad.addColorStop(0, '#111827')
          grad.addColorStop(0.5, '#1f2937')
          grad.addColorStop(1, '#030712')
        } else if (selectedFrame.id === 'crayon-shinchan') {
          grad.addColorStop(0, '#fef08a')
          grad.addColorStop(0.5, '#fed7aa')
          grad.addColorStop(1, '#fef08a')
        } else if (selectedFrame.id === 'sailor-moon-magic') {
          grad.addColorStop(0, '#ede9fe')
          grad.addColorStop(0.5, '#fbcfe8')
          grad.addColorStop(1, '#fee2e2')
        } else if (selectedFrame.id === 'pokemon-pikachu') {
          grad.addColorStop(0, '#fef9c3')
          grad.addColorStop(0.5, '#fef08a')
          grad.addColorStop(1, '#facc15')
        } else if (selectedFrame.id === 'ghibli-totoro') {
          grad.addColorStop(0, '#f0fdf4')
          grad.addColorStop(0.5, '#dcfce7')
          grad.addColorStop(1, '#bbf7d0')
        } else if (selectedFrame.id === 'doraemon-blue') {
          grad.addColorStop(0, '#e0f2fe')
          grad.addColorStop(0.5, '#bae6fd')
          grad.addColorStop(1, '#7dd3fc')
        } else if (selectedFrame.id === 'retro-vaporwave') {
          grad.addColorStop(0, '#2e0854')
          grad.addColorStop(0.5, '#d946ef')
          grad.addColorStop(1, '#f97316')
        } else if (selectedFrame.id === 'wedding-elegance') {
          grad.addColorStop(0, '#fffdfa')
          grad.addColorStop(0.5, '#fef9ee')
          grad.addColorStop(1, '#fffdfa')
        } else if (selectedFrame.id === 'graduation-congrats') {
          grad.addColorStop(0, '#0f172a')
          grad.addColorStop(0.5, '#1e3a8a')
          grad.addColorStop(1, '#0f172a')
        } else if (selectedFrame.id === 'minimal-matcha') {
          grad.addColorStop(0, '#ecfdf5')
          grad.addColorStop(0.5, '#d1fae5')
          grad.addColorStop(1, '#ecfdf5')
        } else if (selectedFrame.id === 'cloud-babyblue') {
          grad.addColorStop(0, '#f0f9ff')
          grad.addColorStop(0.5, '#e0f2fe')
          grad.addColorStop(1, '#bae6fd')
        } else if (selectedFrame.id === 'terracotta-warm') {
          grad.addColorStop(0, '#fffbeb')
          grad.addColorStop(0.5, '#fef3c7')
          grad.addColorStop(1, '#fde68a')
        } else {
          grad.addColorStop(0, '#ffe4e6')
          grad.addColorStop(1, '#ffffff')
        }
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = selectedFrame.bg
      }
    } else {
      ctx.fillStyle = frameColor.bg
    }
    ctx.fillRect(0, 0, videoWidth, videoHeight)

    // 2. Draw Header Text
    ctx.fillStyle = activeTextColor
    ctx.font = `900 ${28}px sans-serif`
    ctx.textAlign = 'center'
    ctx.letterSpacing = '4px'
    ctx.fillText(activeHeader.toUpperCase(), videoWidth / 2, 56)

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

    // 4. Draw Corner Decorations for Themed Frames
    if (hasThemedFrame && selectedFrame.decorations) {
      selectedFrame.decorations.forEach((d) => {
        const dx = (d.x / 100) * videoWidth
        const dy = (d.y / 100) * videoHeight
        ctx.font = '36px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(d.emoji, dx, dy)
      })
    }

    // 5. Draw Custom Uploaded Image Frame (if user uploaded a PNG overlay)
    if (customFrameImg && customFrameImg.naturalWidth > 0) {
      ctx.drawImage(customFrameImg, 0, 0, videoWidth, videoHeight)
    }

    // 6. Draw Stickers (with rotation, scale, and types)
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
        const bgW = metrics.width + 32 * stickerScale
        const bgH = 44 * stickerScale
        ctx.fillStyle = stk.badgeBg || '#ff3d96'
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 22 * stickerScale)
        } else {
          ctx.rect(-bgW / 2, -bgH / 2, bgW, bgH)
        }
        ctx.fill()
        ctx.fillStyle = stk.textColor || '#ffffff'
        ctx.fillText(stk.content, 0, 0)
      } else if (stk.type === 'tape') {
        ctx.font = `900 ${20 * stickerScale}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const metrics = ctx.measureText(stk.content)
        const bgW = metrics.width + 48 * stickerScale
        const bgH = 40 * stickerScale
        ctx.fillStyle = stk.bg || '#ffe4e6'
        ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH)
        ctx.fillStyle = stk.color || '#f43f5e'
        ctx.fillText(stk.content, 0, 0)
      } else {
        ctx.font = `${56 * stickerScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(stk.content || stk.emoji, 0, 0)
      }
      ctx.restore()
    })

    // 7. Draw Purikura Doodles
    if (doodleStrokes.length > 0) {
      const doodleScale = videoWidth / (isGrid ? 380 : 260)
      doodleStrokes.forEach((stroke) => {
        drawSingleStroke(ctx, stroke, doodleScale)
      })
    }

    // 8. Draw Footer Info & Barcode
    const footerY = videoHeight - 40
    ctx.font = `700 ${18}px sans-serif`
    ctx.textAlign = 'left'
    ctx.fillStyle = activeTextColor
    ctx.fillText(activeFooter, paddingX, footerY - 8)

    ctx.font = `600 ${14}px monospace`
    ctx.globalAlpha = 0.6
    ctx.fillText('SEOUL • TOKYO • SAIGON', paddingX, footerY + 16)
    ctx.globalAlpha = 1.0

    // 9. Create VideoFrame & Send to Encoder
    const timestampMicros = Math.round(k * (1_000_000 / fps))
    const videoFrame = new VideoFrame(canvas, { timestamp: timestampMicros })
    videoEncoder.encode(videoFrame, { keyFrame: k % (fps * 2) === 0 })
    videoFrame.close()

    // 10. Backpressure protection: If encoder queue is full, yield to CPU/GPU
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
