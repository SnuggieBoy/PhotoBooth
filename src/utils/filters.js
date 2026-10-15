// Photobooth Filter Presets & Canvas Matrix Processors
export const FILTERS = [
  {
    id: 'natural',
    name: 'Tự Nhiên',
    enName: 'Natural',
    css: 'contrast(102%) brightness(102%)',
    badge: 'Clean',
    color: '#3b82f6',
  },
  {
    id: 'haru',
    name: 'Haru Film',
    enName: 'Pastel Glow',
    css: 'brightness(112%) contrast(92%) saturate(115%) hue-rotate(-8deg)',
    badge: 'K-Trend',
    color: '#06b6d4',
  },
  {
    id: 'y2k',
    name: 'Y2K Digicam',
    enName: 'Warm CCD',
    css: 'sepia(18%) contrast(110%) brightness(106%) saturate(125%)',
    badge: 'Retro',
    color: '#f59e0b',
  },
  {
    id: 'noir',
    name: 'Photoism Noir',
    enName: 'B&W Contrast',
    css: 'grayscale(100%) contrast(140%) brightness(95%)',
    badge: 'Classic',
    color: '#64748b',
  },
  {
    id: 'film35',
    name: 'Film 35mm',
    enName: 'Vintage Grain',
    css: 'sepia(28%) saturate(88%) brightness(96%) contrast(105%)',
    badge: 'Film',
    color: '#d97706',
  },
  {
    id: 'neon',
    name: 'Cyberpunk',
    enName: 'Neon Pop',
    css: 'contrast(125%) saturate(160%) hue-rotate(25deg)',
    badge: 'Vivid',
    color: '#ec4899',
  },
]

export const FRAME_COLORS = [
  { id: 'white', name: 'Trắng Sữa', bg: '#ffffff', text: '#1e293b', border: '#e2e8f0' },
  { id: 'black', name: 'Đen Noir', bg: '#111111', text: '#ffffff', border: '#333333' },
  { id: 'haru-blue', name: 'Haru Blue', bg: '#bae6fd', text: '#0369a1', border: '#7dd3fc' },
  { id: 'sakura', name: 'Hồng Pastel', bg: '#fbcfe8', text: '#9d174d', border: '#f472b6' },
  { id: 'mint', name: 'Xanh Mint', bg: '#a7f3d0', text: '#065f46', border: '#34d399' },
  { id: 'butter', name: 'Vàng Bơ', bg: '#fef08a', text: '#854d0e', border: '#fde047' },
  { id: 'purple', name: 'Tím Lavender', bg: '#e9d5ff', text: '#6b21a8', border: '#c084fc' },
  { id: 'film-strip', name: 'Film Negative', bg: '#18181b', text: '#f43f5e', border: '#27272a', isFilm: true },
]

export const STICKERS = [
  '✨', '💖', '🎀', '🧸', '🌸', '👑', '🍒', '🐱',
  '🐰', '⭐', '🕶️', '⚡', '🎂', '🥳', '📸', '💯'
]
