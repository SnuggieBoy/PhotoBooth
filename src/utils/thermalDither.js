/**
 * Atkinson Error-Diffusion Dithering & ESC/POS Thermal Printer Driver
 * Specifically engineered for 58mm (384px) & 80mm (576px) Receipt Photobooths.
 */

/**
 * Converts ImageData to 1-bit monochrome bitmap using Atkinson Error-Diffusion Dithering.
 * Only diffuses 6/8 (75%) of the quantization error, preventing blown-out shadows on thermal paper.
 * @param {ImageData} imageData 
 * @param {number} gamma Gamma correction curve (default 1.35)
 * @returns {Uint8Array} Packed 1-bit bitmap bytes (8 horizontal pixels per byte, 1=black, 0=white)
 */
export function atkinsonDither(imageData, gamma = 1.35) {
  const { width, height, data } = imageData
  // Create working float array of luminance
  const lum = new Float32Array(width * height)

  for (let i = 0; i < lum.length; i++) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    // Perceived luminance
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    // Gamma correction
    lum[i] = 255 * Math.pow(y / 255, gamma)
  }

  const bytesPerRow = Math.ceil(width / 8)
  const packed = new Uint8Array(bytesPerRow * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const oldVal = lum[idx]
      const newVal = oldVal < 128 ? 0 : 255
      const err = Math.round((oldVal - newVal) / 8) // e >> 3

      // If black dot, set bit in packed array
      if (newVal === 0) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8)
        const bitOffset = 7 - (x % 8)
        packed[byteIndex] |= 1 << bitOffset
      }

      // Distribute 6/8 of error to 6 neighbors (Atkinson formula)
      if (x + 1 < width) lum[idx + 1] += err
      if (x + 2 < width) lum[idx + 2] += err
      if (x - 1 >= 0 && y + 1 < height) lum[(y + 1) * width + (x - 1)] += err
      if (y + 1 < height) lum[(y + 1) * width + x] += err
      if (x + 1 < width && y + 1 < height) lum[(y + 1) * width + (x + 1)] += err
      if (y + 2 < height) lum[(y + 2) * width + x] += err
    }
  }

  return { packed, bytesPerRow, width, height }
}

/**
 * Builds standard ESC/POS binary command payload from packed 1-bit bitmap
 * Sends image in 64-row bands to avoid printer SRAM buffer overflows.
 */
export function buildEscPosPayload({ packed, bytesPerRow, height }) {
  const commands = []

  // 1. Initialize printer: ESC @
  commands.push(new Uint8Array([0x1b, 0x40]))

  // 2. Center alignment: ESC a 1
  commands.push(new Uint8Array([0x1b, 0x61, 0x01]))

  // 3. Print raster image in bands of 64 lines: GS v 0 0 xL xH yL yH [data]
  const bandHeight = 64
  const xL = bytesPerRow & 0xff
  const xH = (bytesPerRow >> 8) & 0xff

  for (let y = 0; y < height; y += bandHeight) {
    const linesInBand = Math.min(bandHeight, height - y)
    const yL = linesInBand & 0xff
    const yH = (linesInBand >> 8) & 0xff

    const header = new Uint8Array([0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH])
    const startByte = y * bytesPerRow
    const bandData = packed.subarray(startByte, startByte + linesInBand * bytesPerRow)

    commands.push(header)
    commands.push(bandData)
  }

  // 4. Feed 4 lines & Partial Cut: GS V 66 0
  commands.push(new Uint8Array([0x1b, 0x64, 0x04])) // feed 4 lines
  commands.push(new Uint8Array([0x1d, 0x56, 0x42, 0x00])) // partial cut

  // Concatenate all chunks into a single ArrayBuffer
  const totalLength = commands.reduce((acc, c) => acc + c.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const c of commands) {
    result.set(c, offset)
    offset += c.length
  }

  return result
}

/**
 * Sends ESC/POS binary data to thermal printer via WebUSB
 */
export async function printViaWebUsb(escPosBytes) {
  if (!('usb' in navigator)) {
    throw new Error('Trình duyệt không hỗ trợ WebUSB. Vui lòng dùng Chrome hoặc Edge trên máy tính / Android.')
  }

  const device = await navigator.usb.requestDevice({ filters: [] })
  await device.open()
  await device.selectConfiguration(1)

  // Find printer interface & OUT endpoint
  const iface = device.configuration.interfaces[0]
  await device.claimInterface(iface.interfaceNumber)

  const endpointOut = iface.alternate.endpoints.find((e) => e.direction === 'out')
  if (!endpointOut) {
    throw new Error('Không tìm thấy endpoint USB OUT trên máy in.')
  }

  // Send chunks (max 64 bytes per packet for standard USB bulk transfer)
  const chunkSize = 64
  for (let i = 0; i < escPosBytes.length; i += chunkSize) {
    const chunk = escPosBytes.subarray(i, i + chunkSize)
    await device.transferOut(endpointOut.endpointNumber, chunk)
  }

  await device.close()
  return true
}

/**
 * Sends ESC/POS binary data to thermal printer via WebSerial (USB-to-Serial / Bluetooth COM)
 */
export async function printViaWebSerial(escPosBytes) {
  if (!('serial' in navigator)) {
    throw new Error('Trình duyệt không hỗ trợ WebSerial.')
  }

  const port = await navigator.serial.requestPort()
  await port.open({ baudRate: 9600 })

  const writer = port.writable.getWriter()
  await writer.write(escPosBytes)
  writer.releaseLock()
  await port.close()
  return true
}
