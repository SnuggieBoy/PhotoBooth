/**
 * DNP DS-RX1HS Commercial Kiosk Adapter
 * Implements 2x6 Split Mode on 4x6 paper (1200x1800 px at 300 DPI)
 * and DNP Hot Folder integration via File System Access API.
 */

/**
 * Generates a 4x6 inch (1200x1800 px @ 300 DPI) split canvas containing
 * two identical 2x6 strips side by side.
 * When the DNP RX1HS prints this with "2x6*2 Cut" enabled, the internal blade
 * cleanly slices it into two physical 2x6 photo strips.
 */
export async function createDnp2x6SplitCanvas(singleStripDataUrl) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1800
  const ctx = canvas.getContext('2d')

  // Load the single strip image
  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = singleStripDataUrl
  })

  // Left 2x6 strip (x: 0 -> 600)
  ctx.drawImage(img, 0, 0, 600, 1800)

  // Right 2x6 strip (x: 600 -> 1200)
  ctx.drawImage(img, 600, 0, 600, 1800)

  // Center subtle cut guide line (optional 1px light gray for manual cut fallback)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(600, 0)
  ctx.lineTo(600, 1800)
  ctx.stroke()

  return canvas
}

/**
 * Drop image directly into DNP Hot Folder Utility directory via File System Access API
 * Triggers instant silent printing without browser dialog.
 */
export async function printViaDnpHotFolder(splitCanvas) {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API không khả dụng trên trình duyệt này.')
  }

  // Request user to select DNP Hot Folder once
  const dirHandle = await window.showDirectoryPicker({
    id: 'dnp-hot-folder',
    mode: 'readwrite',
  })

  const fileName = `photobooth-${Date.now()}.png`
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()

  const blob = await new Promise((resolve) => splitCanvas.toBlob(resolve, 'image/png'))
  await writable.write(blob)
  await writable.close()

  return true
}
