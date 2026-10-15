/**
 * Ring buffer managing ImageBitmap frames for pre-shot video buffering
 * Holds exactly `capacity` frames (e.g. 60 frames = 2.5s @ 24fps)
 * Automatically closes evicted frames to prevent VRAM memory leaks.
 */
export class ShotRingBuffer {
  constructor(capacity = 60) {
    this.capacity = capacity
    this.frames = []
  }

  push(bitmap) {
    if (this.frames.length >= this.capacity) {
      const oldest = this.frames.shift()
      if (oldest && typeof oldest.close === 'function') {
        oldest.close()
      }
    }
    this.frames.push(bitmap)
  }

  getFrames() {
    return [...this.frames]
  }

  toArray() {
    return [...this.frames]
  }

  extractAndReset() {
    const extracted = [...this.frames]
    this.frames = []
    return extracted
  }

  clear() {
    this.frames.forEach((f) => {
      if (f && typeof f.close === 'function') {
        try {
          f.close()
        } catch {}
      }
    })
    this.frames = []
  }

  dispose() {
    this.clear()
  }
}
