import { useRef, useEffect, useState, useCallback } from 'react'
import { drawSingleStroke, renderAllStrokes, BRUSH_TYPES } from '../utils/doodleEngine'

export default function PurikuraDoodleCanvas({
  strokes = [],
  onStrokeComplete,
  activeTool = BRUSH_TYPES.NEON,
  brushColor = '#ff2d75',
  brushSize = 12,
  sparkleEmoji = '✨',
  isDrawingMode = true,
  className = '',
}) {
  const containerRef = useRef(null)
  const committedCanvasRef = useRef(null)
  const activeCanvasRef = useRef(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isPointerDownRef = useRef(false)
  const currentPointsRef = useRef([])

  // Track parent container dimensions via ResizeObserver
  useEffect(() => {
    const el = containerRef.current?.parentElement
    if (!el) return

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  // Redraw committed strokes whenever strokes array or dimensions change
  useEffect(() => {
    const canvas = committedCanvasRef.current
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderAllStrokes(ctx, strokes, 1)
  }, [strokes, dimensions])

  // Get pointer coordinates relative to canvas
  const getCanvasPoint = useCallback((e) => {
    const canvas = activeCanvasRef.current
    if (!canvas) return [0, 0, 0.5]
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5
    return [x, y, pressure]
  }, [])

  // Pointer Down
  const handlePointerDown = (e) => {
    if (!isDrawingMode || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    isPointerDownRef.current = true

    const point = getCanvasPoint(e)
    currentPointsRef.current = [point]

    const activeCanvas = activeCanvasRef.current
    if (activeCanvas) {
      const ctx = activeCanvas.getContext('2d', { desynchronized: true })
      ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height)
      drawSingleStroke(
        ctx,
        {
          points: currentPointsRef.current,
          brushType: activeTool,
          color: brushColor,
          size: brushSize,
          emoji: sparkleEmoji,
        },
        1
      )
    }
  }

  // Pointer Move with Coalesced Events for 120Hz precision
  const handlePointerMove = (e) => {
    if (!isDrawingMode || !isPointerDownRef.current) return

    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e]
    for (const ce of events) {
      currentPointsRef.current.push(getCanvasPoint(ce))
    }

    const activeCanvas = activeCanvasRef.current
    if (activeCanvas && currentPointsRef.current.length > 1) {
      const ctx = activeCanvas.getContext('2d', { desynchronized: true })
      ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height)
      drawSingleStroke(
        ctx,
        {
          points: currentPointsRef.current,
          brushType: activeTool,
          color: brushColor,
          size: brushSize,
          emoji: sparkleEmoji,
        },
        1
      )
    }
  }

  // Pointer Up / Cancel -> Commit stroke
  const handlePointerUp = (e) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture was already released
    }

    const points = currentPointsRef.current
    if (points.length >= 2 && onStrokeComplete) {
      onStrokeComplete({
        id: Date.now() + Math.random(),
        points: [...points],
        brushType: activeTool,
        color: brushColor,
        size: brushSize,
        emoji: sparkleEmoji,
      })
    }

    // Clear active temporary canvas
    const activeCanvas = activeCanvasRef.current
    if (activeCanvas) {
      const ctx = activeCanvas.getContext('2d')
      ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height)
    }
    currentPointsRef.current = []
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
    >
      {/* Layer 1: Committed Ink Canvas */}
      <canvas
        ref={committedCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
      />

      {/* Layer 2: Desynchronized Active Ink Canvas (Top layer for real-time draw) */}
      <canvas
        ref={activeCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full rounded-2xl touch-none ${
          isDrawingMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
      />
    </div>
  )
}
