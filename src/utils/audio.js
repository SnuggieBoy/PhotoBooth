// Web Audio API Synthesizer for Camera Sounds (No external MP3 required, 100% offline)
class SoundFX {
  constructor() {
    this.ctx = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Beep sound during countdown
  playBeep(isHigh = false) {
    try {
      this.init()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(isHigh ? 880 : 440, this.ctx.currentTime) // A5 or A4

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.12)
    } catch (e) {
      console.warn('Audio play error:', e)
    }
  }

  // Realistic mechanical shutter click sound
  playShutter() {
    try {
      this.init()
      if (!this.ctx) return

      // Part 1: Click
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)

      // Part 2: White noise mechanical release
      const bufferSize = this.ctx.sampleRate * 0.06
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.2, now + 0.03)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

      noise.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noise.start(now + 0.03)
    } catch (e) {
      console.warn('Audio play error:', e)
    }
  }
}

export const soundFX = new SoundFX()
