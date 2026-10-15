/**
 * Idol / Artist Collab Frames & Theme Cutouts
 * Renders transparent character overlays (Half-Heart, Peace Sign, Cat Ears, Bunny, Cyberpunk)
 * directly over the camera viewfinder in real time so users can pose cheek-to-cheek with the character.
 */

export const COLLAB_FRAMES = [
  {
    id: 'none',
    name: 'Không có',
    enName: 'None',
    icon: '✨',
    badge: 'Standard',
  },
  {
    id: 'idol-half-heart',
    name: 'Idol Ghép Tim (Phải)',
    enName: 'Idol Half-Heart',
    icon: '🫰',
    badge: 'K-Trend',
    description: 'Tạo dáng nửa trái tim để ghép trọn với thần tượng',
    overlaySvg: 'half-heart-right',
  },
  {
    id: 'cat-ear-headband',
    name: 'Bờm Tai Mèo Kawaii',
    enName: 'Kawaii Cat Ears',
    icon: '🐱',
    badge: 'Cute',
    description: 'Tai mèo lấp lánh trên đầu',
    overlaySvg: 'cat-ears',
  },
  {
    id: 'y2k-cyber-glitch',
    name: 'Y2K Cyber Glitch',
    enName: 'Cyber Border',
    icon: '⚡',
    badge: 'Retro',
    description: 'Khung viền công nghệ thập niên 2000',
    overlaySvg: 'cyber-glitch',
  },
  {
    id: 'film-slate',
    name: 'Clapperboard Movie',
    enName: 'Movie Set',
    icon: '🎬',
    badge: 'Cinema',
    description: 'Góc nhìn trường quay điện ảnh',
    overlaySvg: 'film-slate',
  },
]
