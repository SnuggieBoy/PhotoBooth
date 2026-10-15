import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'

let gestureRecognizerInstance = null
let isInitializing = false

/**
 * Initializes MediaPipe GestureRecognizer asynchronously.
 * Uses GPU delegate if supported, falling back to CPU.
 */
export async function initGestureRecognizer() {
  if (gestureRecognizerInstance) return gestureRecognizerInstance
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100))
    }
    return gestureRecognizerInstance
  }

  isInitializing = true
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    )

    gestureRecognizerInstance = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    })

    return gestureRecognizerInstance
  } catch (err) {
    console.warn('MediaPipe GestureRecognizer GPU failed, trying CPU fallback:', err)
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      )
      gestureRecognizerInstance = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      })
      return gestureRecognizerInstance
    } catch (cpuErr) {
      console.error('Failed to initialize GestureRecognizer:', cpuErr)
      return null
    }
  } finally {
    isInitializing = false
  }
}

/**
 * Recognizes gestures from an active <video> element.
 * @param {HTMLVideoElement} videoElement
 * @returns {string|null} Recognized gesture name ('Victory', 'Open_Palm', 'Thumb_Up', etc.)
 */
export function detectGesture(videoElement) {
  if (!gestureRecognizerInstance || !videoElement || videoElement.readyState < 2) {
    return null
  }

  try {
    const results = gestureRecognizerInstance.recognizeForVideo(
      videoElement,
      performance.now()
    )

    if (results.gestures && results.gestures.length > 0) {
      const topGesture = results.gestures[0][0]
      if (topGesture && topGesture.score > 0.55) {
        return topGesture.categoryName
      }
    }
  } catch (err) {
    // skip frame on error
  }

  return null
}

/**
 * AI Beauty Filter CSS Generators (Bojeong / Skin Softening)
 * Mức độ làm đẹp: 0 (Off), 1 (Natural Glow), 2 (Porcelain Smooth / Da Trắng Sứ)
 */
export const BEAUTY_LEVELS = [
  {
    level: 0,
    label: 'Tắt Làm Đẹp',
    enLabel: 'Beauty Off',
    icon: '✨',
    css: '',
  },
  {
    level: 1,
    label: 'Da Mịn Tự Nhiên',
    enLabel: 'Natural Soft',
    icon: '🌸',
    css: 'brightness(106%) contrast(96%) saturate(108%)',
  },
  {
    level: 2,
    label: 'Da Trắng Sứ (Haru Bojeong)',
    enLabel: 'Porcelain Glow',
    icon: '👑',
    css: 'brightness(114%) contrast(92%) saturate(112%) hue-rotate(-4deg)',
  },
]
