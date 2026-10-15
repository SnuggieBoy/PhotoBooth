import { getStroke } from 'perfect-freehand'

export const BRUSH_TYPES = {
  NEON: 'neon',
  PASTEL: 'pastel',
  SPARKLE: 'sparkle',
  ERASER: 'eraser',
}

export const DOODLE_COLORS = [
  { id: 'neon-pink', label: 'Neon Pink', value: '#ff2d75', isNeon: true },
  { id: 'neon-cyan', label: 'Electric Blue', value: '#00f0ff', isNeon: true },
  { id: 'neon-yellow', label: 'Cyber Yellow', value: '#ffe600', isNeon: true },
  { id: 'neon-lime', label: 'Acid Lime', value: '#39ff14', isNeon: true },
  { id: 'pure-white', label: 'Pure White', value: '#ffffff', isNeon: false },
  { id: 'pastel-lavender', label: 'Lavender', value: '#d8b4fe', isNeon: false },
  { id: 'pastel-peach', label: 'Peach', value: '#fbcfe8', isNeon: false },
  { id: 'dark-noir', label: 'Ink Black', value: '#18181b', isNeon: false },
]

export const BRUSH_SIZES = [
  { id: 'small', label: 'S', size: 6 },
  { id: 'medium', label: 'M', size: 12 },
  { id: 'large', label: 'L', size: 20 },
]

export const SPARKLE_EMOJIS = ['✨', '💖', '⭐', '🌸', '🎀', '🍬']

/**
 * Converts a polygon of outline points into a Path2D or direct canvas fill
 */
function drawPolygonPath(ctx, points) {
  if (!points || points.length === 0) return
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1])
  }
  ctx.closePath()
  ctx.fill()
}

/**
 * Draws a single stroke onto a Canvas 2D context
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} stroke { points: [[x, y, p], ...], brushType, color, size, emoji }
 * @param {number} scale Optional multiplier for High-DPI export
 */
export function drawSingleStroke(ctx, stroke, scale = 1) {
  const { points, brushType, color, size, emoji = '✨' } = stroke
  if (!points || points.length < 2) return

  // Scale the raw coordinates
  const scaledPoints = points.map(([x, y, p]) => [x * scale, y * scale, p ?? 0.5])
  const baseSize = size * scale

  if (brushType === BRUSH_TYPES.SPARKLE) {
    // Sparkle stamp along stroke arc-length
    ctx.save()
    ctx.font = `${Math.max(14 * scale, baseSize * 1.6)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let lastX = scaledPoints[0][0]
    let lastY = scaledPoints[0][1]
    const threshold = Math.max(22 * scale, baseSize * 1.8)

    // Stamp first point
    ctx.fillText(emoji, lastX, lastY)

    for (let i = 1; i < scaledPoints.length; i++) {
      const [curX, curY] = scaledPoints[i]
      const dist = Math.hypot(curX - lastX, curY - lastY)
      if (dist >= threshold) {
        ctx.save()
        ctx.translate(curX, curY)
        const angle = (Math.sin(i * 1.5) * 20 * Math.PI) / 180
        ctx.rotate(angle)
        ctx.fillText(emoji, 0, 0)
        ctx.restore()
        lastX = curX
        lastY = curY
      }
    }
    ctx.restore()
    return
  }

  if (brushType === BRUSH_TYPES.ERASER) {
    // Destination out eraser
    const outline = getStroke(scaledPoints, {
      size: baseSize * 1.8,
      thinning: 0,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
    })
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000000'
    drawPolygonPath(ctx, outline)
    ctx.restore()
    return
  }

  if (brushType === BRUSH_TYPES.NEON) {
    // 3-Pass Alpha Stacking: Outer halo + Mid halo + White core
    // Triệt tiêu hoàn toàn shadowBlur để đạt 60-120 FPS
    const outerOutline = getStroke(scaledPoints, {
      size: baseSize * 2.8,
      thinning: 0.25,
      smoothing: 0.7,
      streamline: 0.6,
      simulatePressure: true,
    })

    const midOutline = getStroke(scaledPoints, {
      size: baseSize * 1.6,
      thinning: 0.3,
      smoothing: 0.7,
      streamline: 0.6,
      simulatePressure: true,
    })

    const coreOutline = getStroke(scaledPoints, {
      size: baseSize * 0.65,
      thinning: 0.35,
      smoothing: 0.6,
      streamline: 0.6,
      simulatePressure: true,
    })

    ctx.save()
    // Pass 1: Outer glowing aura
    ctx.fillStyle = color
    ctx.globalAlpha = 0.18
    drawPolygonPath(ctx, outerOutline)

    // Pass 2: Mid glowing aura
    ctx.globalAlpha = 0.45
    drawPolygonPath(ctx, midOutline)

    // Pass 3: Super bright core
    ctx.fillStyle = '#ffffff'
    ctx.globalAlpha = 0.95
    drawPolygonPath(ctx, coreOutline)
    ctx.restore()
    return
  }

  // Default: Pastel / Solid Marker
  const outline = getStroke(scaledPoints, {
    size: baseSize,
    thinning: 0.45,
    smoothing: 0.65,
    streamline: 0.55,
    simulatePressure: true,
  })

  ctx.save()
  ctx.fillStyle = color
  ctx.globalAlpha = 0.95
  drawPolygonPath(ctx, outline)
  ctx.restore()
}

/**
 * Render all strokes from history onto a context
 */
export function renderAllStrokes(ctx, strokes, scale = 1) {
  if (!strokes || strokes.length === 0) return
  strokes.forEach((stroke) => {
    drawSingleStroke(ctx, stroke, scale)
  })
}
