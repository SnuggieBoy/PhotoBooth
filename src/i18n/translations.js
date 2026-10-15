export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
]

export const translations = {
  vi: {
    // Header & Steps
    app_title: 'K-PHOTOBOOTH',
    app_subtitle: 'Trải Nghiệm Web & Di Động',
    step_setup: '1. Cài Đặt',
    step_capture: '2. Chụp Ảnh',
    step_edit: '3. Trang Trí & Lưu',

    // Setup Screen
    setup_badge: 'Studio Trực Tuyến Thế Hệ Mới',
    setup_title: 'Tạo Dải Ảnh 4-Cut Đậm Chất Hàn Quốc',
    setup_desc: 'Chụp ảnh cùng bạn bè ngay trên trình duyệt điện thoại hoặc máy tính với bộ lọc màu Haru Film, Sticker Y2K và in ảnh tức thì.',
    
    layout_title: 'Chọn Kiểu Khung Ảnh',
    layout_strip4: '4-Cut Dọc',
    layout_strip4_sub: '1x4 Classic Life4Cuts',
    layout_grid4: '4-Cut Ô Vuông',
    layout_grid4_sub: '2x2 Photoism Style',
    layout_strip2: '2-Cut Polaroid',
    layout_strip2_sub: 'Duo Moments',

    filter_title: 'Bộ Lọc Màu Yêu Thích',
    filter_natural: 'Tự Nhiên',
    filter_natural_sub: 'Natural',
    filter_haru: 'Haru Film',
    filter_haru_sub: 'Pastel Glow',
    filter_y2k: 'Y2K Digicam',
    filter_y2k_sub: 'Warm CCD',
    filter_noir: 'Photoism Noir',
    filter_noir_sub: 'B&W Contrast',
    filter_film35: 'Film 35mm',
    filter_film35_sub: 'Vintage Grain',
    filter_neon: 'Cyberpunk',
    filter_neon_sub: 'Neon Pop',

    countdown_title: 'Thời Gian Đếm Ngược Giữa Mỗi Lần Chụp',
    seconds_unit: 'Giây',
    start_capture_btn: 'Bắt Đầu Chụp',
    poses_label: 'Poses',

    // Camera Capture Screen
    reselect_layout: 'Chọn lại kiểu khung',
    active_filter: 'Bộ lọc',
    shot_indicator: 'ẢNH',
    sound_mute: 'Tắt âm thanh',
    sound_unmute: 'Bật âm thanh',
    flip_camera: 'Đổi camera trước/sau',
    camera_no_permission: 'Chưa cấp quyền Camera',
    camera_no_permission_desc: 'Vui lòng cho phép trình duyệt truy cập camera để bắt đầu trải nghiệm Photobooth.',
    camera_retry: 'Thử Lại',
    countdown_prep: 'Chuẩn bị tạo dáng...',
    countdown_smile: 'Cười lên nào! ✨',

    // Decorate & Edit Screen
    edit_title: 'Tùy Chỉnh Dải Ảnh Của Bạn',
    edit_desc: 'Chọn màu viền, gắn sticker ngộ nghĩnh và ghi tiêu đề kỷ niệm.',
    strip_title_label: 'Tiêu Đề Dải Ảnh:',
    strip_title_placeholder: 'VD: K-PHOTOBOOTH, HARU 2026...',
    frame_color_label: 'Màu Khung Ảnh:',
    sticker_label: 'Nhấn Sticker Để Thêm Vào Ảnh:',
    sticker_remove_hint: 'Nhấn để xóa sticker',
    btn_retake: 'Chụp Lại',
    btn_retake_confirm: 'Bạn có muốn chụp lại từ đầu không?',
    btn_export: 'Xuất Ảnh & Quét QR',

    // Frame Colors
    color_white: 'Trắng Sữa',
    color_black: 'Đen Noir',
    color_haru_blue: 'Haru Blue',
    color_sakura: 'Hồng Pastel',
    color_mint: 'Xanh Mint',
    color_butter: 'Vàng Bơ',
    color_purple: 'Tím Lavender',
    color_film: 'Film Negative',

    // Footer Slogan
    strip_city_slogan: 'SEOUL • TOKYO • SAIGON',

    // Share & Export Modal
    modal_ready_title: 'Ảnh Của Bạn Đã Sẵn Sàng!',
    modal_ready_desc: 'Lưu kỷ niệm, in ngay dải ảnh hoặc quét mã QR để tải về điện thoại.',
    qr_hint: 'Quét để tải về máy',
    btn_download_hd: 'Tải Về Máy (HD 300 DPI)',
    btn_print: 'In Ảnh Dải Strip',
    btn_share: 'Chia Sẻ',
    share_copied: 'Đã sao chép liên kết vào bộ nhớ tạm!',
    share_title: 'Ảnh K-Photobooth của tôi! ✨',
    share_text: 'Vừa chụp bộ ảnh photobooth siêu xinh!',
  },

  en: {
    // Header & Steps
    app_title: 'K-PHOTOBOOTH',
    app_subtitle: 'Web & Mobile Experience',
    step_setup: '1. Setup',
    step_capture: '2. Capture',
    step_edit: '3. Decorate & Save',

    // Setup Screen
    setup_badge: 'Next-Gen Online Photo Studio',
    setup_title: 'Create Authentic Korean 4-Cut Strips',
    setup_desc: 'Take instant photobooth snaps with friends on mobile or desktop featuring Haru Film filters, Y2K stickers, and direct printing.',
    
    layout_title: 'Choose Photo Layout',
    layout_strip4: '4-Cut Strip',
    layout_strip4_sub: '1x4 Classic Life4Cuts',
    layout_grid4: '4-Cut Grid',
    layout_grid4_sub: '2x2 Photoism Style',
    layout_strip2: '2-Cut Polaroid',
    layout_strip2_sub: 'Duo Moments',

    filter_title: 'Signature Color Filters',
    filter_natural: 'Natural',
    filter_natural_sub: 'Clean Look',
    filter_haru: 'Haru Film',
    filter_haru_sub: 'Pastel Glow',
    filter_y2k: 'Y2K Digicam',
    filter_y2k_sub: 'Warm CCD',
    filter_noir: 'Photoism Noir',
    filter_noir_sub: 'B&W Contrast',
    filter_film35: 'Film 35mm',
    filter_film35_sub: 'Vintage Grain',
    filter_neon: 'Cyberpunk',
    filter_neon_sub: 'Neon Pop',

    countdown_title: 'Timer Between Each Shot',
    seconds_unit: 'Sec',
    start_capture_btn: 'Start Shoot',
    poses_label: 'Poses',

    // Camera Capture Screen
    reselect_layout: 'Change layout',
    active_filter: 'Filter',
    shot_indicator: 'SHOT',
    sound_mute: 'Mute sound',
    sound_unmute: 'Unmute sound',
    flip_camera: 'Switch camera',
    camera_no_permission: 'Camera Permission Denied',
    camera_no_permission_desc: 'Please allow camera access in your browser to start your photobooth session.',
    camera_retry: 'Try Again',
    countdown_prep: 'Strike a pose...',
    countdown_smile: 'Say cheese! ✨',

    // Decorate & Edit Screen
    edit_title: 'Customize Your Photo Strip',
    edit_desc: 'Choose frame colors, add playful stickers, and customize your commemorative title.',
    strip_title_label: 'Strip Title:',
    strip_title_placeholder: 'E.g. K-PHOTOBOOTH, HARU 2026...',
    frame_color_label: 'Frame Color:',
    sticker_label: 'Tap Sticker To Place On Strip:',
    sticker_remove_hint: 'Click to remove sticker',
    btn_retake: 'Retake',
    btn_retake_confirm: 'Do you want to retake all shots from the beginning?',
    btn_export: 'Export & QR Code',

    // Frame Colors
    color_white: 'Milk White',
    color_black: 'Noir Black',
    color_haru_blue: 'Haru Blue',
    color_sakura: 'Pastel Pink',
    color_mint: 'Mint Green',
    color_butter: 'Butter Yellow',
    color_purple: 'Lavender',
    color_film: 'Film Negative',

    // Footer Slogan
    strip_city_slogan: 'SEOUL • TOKYO • SAIGON',

    // Share & Export Modal
    modal_ready_title: 'Your Photos Are Ready!',
    modal_ready_desc: 'Save memories, print photo strips instantly, or scan the QR code to download to your phone.',
    qr_hint: 'Scan with phone camera',
    btn_download_hd: 'Download (HD 300 DPI)',
    btn_print: 'Print Photo Strip',
    btn_share: 'Share',
    share_copied: 'Link copied to clipboard!',
    share_title: 'My K-Photobooth Photos! ✨',
    share_text: 'Just took cute photobooth snaps!',
  },

  ko: {
    // Header & Steps
    app_title: 'K-포토부스',
    app_subtitle: '웹 & 모바일 스튜디오',
    step_setup: '1. 설정',
    step_capture: '2. 촬영',
    step_edit: '3. 꾸미기 & 저장',

    // Setup Screen
    setup_badge: '차세대 온라인 포토 스튜디오',
    setup_title: '감성 충만 네컷사진 만들기',
    setup_desc: '모바일 및 PC 브라우저에서 친구들과 함께 하루필름 감성 필터, Y2K 스티커와 함께 즉석 네컷사진을 찍고 인화해보세요.',
    
    layout_title: '프레임 레이아웃 선택',
    layout_strip4: '세로 4컷',
    layout_strip4_sub: '인생네컷 클래식 1x4',
    layout_grid4: '정사각형 4컷',
    layout_grid4_sub: '포토이즘 2x2 스타일',
    layout_strip2: '2컷 폴라로이드',
    layout_strip2_sub: '듀오 모먼트',

    filter_title: '시그니처 감성 필터',
    filter_natural: '내추럴',
    filter_natural_sub: 'Clean Look',
    filter_haru: '하루필름',
    filter_haru_sub: 'Pastel Glow',
    filter_y2k: 'Y2K 디카',
    filter_y2k_sub: 'Warm CCD',
    filter_noir: '포토이즘 흑백',
    filter_noir_sub: 'B&W Contrast',
    filter_film35: '35mm 필름',
    filter_film35_sub: 'Vintage Grain',
    filter_neon: '사이버펑크',
    filter_neon_sub: 'Neon Pop',

    countdown_title: '컷별 타이머 설정',
    seconds_unit: '초',
    start_capture_btn: '촬영 시작하기',
    poses_label: '컷',

    // Camera Capture Screen
    reselect_layout: '프레임 다시 선택',
    active_filter: '필터',
    shot_indicator: '사진',
    sound_mute: '소리 끄기',
    sound_unmute: '소리 켜기',
    flip_camera: '카메라 전환',
    camera_no_permission: '카메라 권한 필요',
    camera_no_permission_desc: '포토부스를 이용하려면 브라우저에서 카메라 접근을 허용해주세요.',
    camera_retry: '다시 시도',
    countdown_prep: '포즈를 준비하세요...',
    countdown_smile: '하나 둘 셋, 김치! ✨',

    // Decorate & Edit Screen
    edit_title: '나만의 네컷사진 꾸미기',
    edit_desc: '프레임 컬러 선택, 감성 스티커 부착, 기념 문구를 직접 적어보세요.',
    strip_title_label: '상단 타이틀:',
    strip_title_placeholder: '예: K-PHOTOBOOTH, 2026 추억...',
    frame_color_label: '프레임 컬러:',
    sticker_label: '스티커를 눌러 사진에 추가하세요:',
    sticker_remove_hint: '클릭하여 스티커 삭제',
    btn_retake: '다시 촬영',
    btn_retake_confirm: '처음부터 다시 촬영하시겠습니까?',
    btn_export: '사진 출력 & QR 코드',

    // Frame Colors
    color_white: '밀크 화이트',
    color_black: '느와르 블랙',
    color_haru_blue: '하루 블루',
    color_sakura: '파스텔 핑크',
    color_mint: '민트 그린',
    color_butter: '버터 옐로우',
    color_purple: '라벤더 퍼플',
    color_film: '필름 네거티브',

    // Footer Slogan
    strip_city_slogan: 'SEOUL • TOKYO • SAIGON',

    // Share & Export Modal
    modal_ready_title: '사진이 완성되었습니다!',
    modal_ready_desc: '소중한 추억을 다운로드하거나 QR 코드를 스캔해 스마트폰으로 바로 저장하세요.',
    qr_hint: '스마트폰으로 QR 스캔',
    btn_download_hd: '고화질 다운로드 (HD 300 DPI)',
    btn_print: '포토 스트립 즉석 인화',
    btn_share: '공유하기',
    share_copied: '링크가 클립보드에 복사되었습니다!',
    share_title: '나의 K-네컷사진! ✨',
    share_text: '방금 찍은 네컷사진 보러오세요!',
  },

  ja: {
    // Header & Steps
    app_title: 'K-PHOTOBOOTH',
    app_subtitle: 'Web & モバイルスタジオ',
    step_setup: '1. 設定',
    step_capture: '2. 撮影',
    step_edit: '3. デコレーション & 保存',

    // Setup Screen
    setup_badge: '次世代オンラインフォトスタジオ',
    setup_title: '韓国風4カット写真を作ろう',
    setup_desc: 'スマホやPCブラウザで友達と一緒にハルフィルム風フィルター、Y2Kステッカーを使って即座にプリント！',
    
    layout_title: 'フレームレイアウトを選択',
    layout_strip4: '縦4カット',
    layout_strip4_sub: '定番 1x4 ライフ4カット',
    layout_grid4: '正方形4カット',
    layout_grid4_sub: '2x2 フォトイズム風',
    layout_strip2: '2カットポラロイド',
    layout_strip2_sub: 'デュオモーメント',

    filter_title: 'シグネチャーカラーフィルター',
    filter_natural: 'ナチュラル',
    filter_natural_sub: 'Clean Look',
    filter_haru: 'ハルフィルム',
    filter_haru_sub: 'Pastel Glow',
    filter_y2k: 'Y2K デジカメ',
    filter_y2k_sub: 'Warm CCD',
    filter_noir: 'モノクロ',
    filter_noir_sub: 'B&W Contrast',
    filter_film35: '35mm フィルム',
    filter_film35_sub: 'Vintage Grain',
    filter_neon: 'サイバーパンク',
    filter_neon_sub: 'Neon Pop',

    countdown_title: 'ショット間タイマー',
    seconds_unit: '秒',
    start_capture_btn: '撮影を開始する',
    poses_label: 'カット',

    // Camera Capture Screen
    reselect_layout: 'フレームを選び直す',
    active_filter: 'フィルター',
    shot_indicator: '枚目',
    sound_mute: '音声をミュート',
    sound_unmute: '音声をオン',
    flip_camera: 'カメラ切り替え',
    camera_no_permission: 'カメラのアクセス許可が必要です',
    camera_no_permission_desc: 'フォトブース体験を開始するにはブラウザのカメラ権限を許可してください。',
    camera_retry: '再試行',
    countdown_prep: 'ポーズを決めて...',
    countdown_smile: 'はい、チーズ！✨',

    // Decorate & Edit Screen
    edit_title: 'フォトストリップをカスタムデコ',
    edit_desc: 'フレームカラーの変更、ステッカーの貼り付け、思い出のタイトルを入力。',
    strip_title_label: 'ストリップタイトル:',
    strip_title_placeholder: '例: K-PHOTOBOOTH, 2026...',
    frame_color_label: 'フレームカラー:',
    sticker_label: 'ステッカーをタップして追加:',
    sticker_remove_hint: 'クリックしてステッカーを削除',
    btn_retake: '撮り直す',
    btn_retake_confirm: '最初から撮り直しますか？',
    btn_export: '写真出力 & QRコード',

    // Frame Colors
    color_white: 'ミルクホワイト',
    color_black: 'ノワールブラック',
    color_haru_blue: 'ハルブルー',
    color_sakura: 'パステルピンク',
    color_mint: 'ミントグリーン',
    color_butter: 'バターイエロー',
    color_purple: 'ラベンダー',
    color_film: 'フィルムネガ',

    // Footer Slogan
    strip_city_slogan: 'SEOUL • TOKYO • SAIGON',

    // Share & Export Modal
    modal_ready_title: '写真の準備ができました！',
    modal_ready_desc: '思い出を保存、フォトストリップを即座に印刷、またはQRコードでスマホに保存。',
    qr_hint: 'スマホのカメラでQRスキャン',
    btn_download_hd: '高画質保存 (HD 300 DPI)',
    btn_print: 'フォトストリップ印刷',
    btn_share: '共有する',
    share_copied: 'リンクをクリップボードにコピーしました！',
    share_title: '私のK-フォトブース写真！✨',
    share_text: '可愛いフォトブース写真を撮ったよ！',
  },
}
