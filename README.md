# 📸 K-PHOTOBOOTH — Studio Chụp Ảnh 4-Cut Đậm Chất Hàn Quốc (Web & Mobile)

Ứng dụng Photobooth chụp ảnh 4-cut trực tuyến thế hệ mới, tối ưu hóa 100% cho cả trình duyệt Desktop và Mobile Web với đầy đủ bộ lọc màu điện ảnh (Haru Film, Y2K Digicam, Noir B&W), trang trí khung ảnh, gắn sticker và xuất ảnh chất lượng cao 300 DPI kèm mã QR tức thì.

---

## ✨ Điểm Nổi Bật (Tính Năng "Được - Đúng - Đủ - Đẹp - Đỉnh")

1. **Camera WebRTC Thời Gian Thực**:
   - Tự động nhận diện camera trước/sau (`facingMode`) trên smartphone, tablet, laptop.
   - Hỗ trợ tỷ lệ khung hình 4:3 và 16:10 sắc nét.
   - Hiệu ứng đèn Flash chớp sáng (`animate-flash`) chân thực như buồng chụp Studio.
   - Tự tổng hợp âm thanh Shutter cơ học và tiếng đếm ngược bíp bằng **Web Audio API** (không cần tải file MP3 ngoài, chạy mượt mà ngay cả khi offline).

2. **Các Kiểu Khung Ảnh (Layouts)**:
   - **4-Cut Dọc (1x4)**: Form dải ảnh chuẩn Life4Cuts (인생네컷) kinh điển.
   - **4-Cut Ô Vuông (2x2)**: Phong cách Photoism hiện đại, cân đối.
   - **2-Cut Polaroid (1x2)**: Form đôi bạn thân / cặp đôi lãng mạn.

3. **Bộ Lọc Màu Phong Cách (Color Presets)**:
   - **Haru Film**: Tông xanh lam pastel dịu mát, làm sáng da, mờ khuyết điểm nhẹ.
   - **Y2K Digicam**: Tông vàng ấm retro những năm 2000 máy ảnh CCD.
   - **Photoism Noir**: Tông đen trắng tương phản cao chuẩn nghệ thuật.
   - **Film 35mm**: Hạt noise grain cổ điển của cuộn phim Kodak/Fuji.
   - **Cyberpunk**: Đậm đà tương phản neon rực rỡ.

4. **Trang Trí Khung & Sticker**:
   - Đa dạng màu viền: Trắng sữa, Đen Noir, Haru Blue, Hồng Sakura, Xanh Mint, Vàng Bơ, Tím Lavender, Film Negative đục lỗ.
   - Tùy chỉnh tiêu đề dải ảnh (tự do ghi tên nhóm, sự kiện, ngày kỷ niệm).
   - Kho Sticker emoji phong phú gắn trực tiếp lên dải ảnh.

5. **Xuất Ảnh & Chia Sẻ Đỉnh Cao**:
   - **Canvas Offscreen Rendering (300 DPI)**: Xuất file ảnh PNG độ nét cao sẵn sàng in ấn.
   - **Mã QR Tức Thì (`QRCodeSVG`)**: Cho phép quét điện thoại để lưu ngay.
   - **In Dải Ảnh Trực Tiếp (`window.print`)**: Căn chỉnh sẵn kích thước khổ in strip giấy tiêu chuẩn.
   - **Web Share API**: Bắn ảnh qua Zalo, Messenger, AirDrop trên thiết bị di động.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

```bash
# 1. Di chuyển vào thư mục dự án
cd PhotoBooth

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev

# 4. Đóng gói bản phát hành production
npm run build
```

---

## 🛠️ Công Nghệ Sử Dụng (Frontend-First Architecture)

- **Framework**: React 19 + Vite 8 (Tốc độ biên dịch siêu tốc < 400ms).
- **Styling**: Tailwind CSS v4 với cấu hình tối ưu touch-friendly cho mobile.
- **Icon System**: Lucide React.
- **Audio Synthesizer**: Pure Web Audio API (`OscillatorNode`, `GainNode`).
- **Camera & Stream**: HTML5 `MediaDevices.getUserMedia` API.
- **Graphics & Export**: HTML5 Canvas 2D Context (High-DPI rendering).
- **QR Engine**: `qrcode.react`.
- **Celebration**: `canvas-confetti`.
