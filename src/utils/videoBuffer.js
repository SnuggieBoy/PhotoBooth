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

  clear() {
    this.frames.forEach((f) => {
      if (f && typeof f.close === 'function') {
        f.close()
      }
    })
    this.frames = []
  }
}
