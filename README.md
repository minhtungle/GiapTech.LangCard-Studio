# LangCard Studio

Công cụ tạo thẻ học ngoại ngữ đẹp mắt — chạy hoàn toàn trên trình duyệt, không cần backend.

6 template dựng sẵn: Vocab Grid, Sentence Pairs, Conjugation, Idiom Spotlight, Dialogue, Word Map. Hỗ trợ nhiều khổ giấy (A4, A5, Letter, Post 1:1, Story 9:16) và xuất ra PDF / PNG / ZIP.

## Tính năng

- **Quản lý nhiều dự án**: mỗi dự án chứa nhiều trang riêng. Dropdown chọn dự án ở thanh trên + modal lưới "Quản lý dự án" (tạo / đổi tên / nhân bản / xuất / xoá). Xuất/nhập cả dự án ra file `.lcproj.json` để backup/chuyển máy
- **Tự động lưu** vào localStorage theo từng dự án
- **Hoàn tác / Làm lại** (Ctrl+Z / Ctrl+Y) với lịch sử tới 60 bước
- **Mở / Lưu JSON** cả tài liệu nhiều trang ra file — backup, mang sang máy khác
- **Sắp xếp trang**: kéo thả, nút lên/xuống, nhân bản, xoá (có nút Hoàn tác trong toast)
- **Theme** sáng / tối (lưu lựa chọn)
- **Khung xem nâng cao**: xem từng trang / lưới tất cả trang, dải thumbnail, zoom Vừa khung/100%/Lấp đầy, Ctrl+cuộn để phóng, Space+kéo để pan, ẩn/hiện số trang, đổi nền (lưới/tối/sáng/caro)
- **Phím tắt** đầy đủ — nhấn `?` để xem bảng
- **Accessibility**: focus ring, ARIA label, điều hướng bàn phím

### Phím tắt

| Phím | Chức năng |
|------|-----------|
| Ctrl+Z / Ctrl+Y | Hoàn tác / Làm lại |
| ← / → | Trang trước / sau |
| Ctrl+D | Nhân bản trang |
| Ctrl+S | Lưu JSON |
| Ctrl+0 / Ctrl+1 | Vừa khung / 100% |
| Ctrl+cuộn | Phóng to tại con trỏ |
| Space+kéo | Kéo xem (pan) |
| G | Xem dạng lưới |
| ? | Bảng phím tắt |

## Cách chạy

**Cách 1 — mở trực tiếp:** double-click `index.html`. Phần chỉnh sửa và xuất PDF hoạt động ngay.

**Cách 2 — qua server (khuyến nghị, để xuất PNG/ZIP ổn định):**

```bash
npx serve .
# hoặc
python -m http.server 8000
```

Rồi mở `http://localhost:8000`.

> Lưu ý: xuất PNG/ZIP dùng `html2canvas` qua iframe. Một số trình duyệt chặn iframe khi mở bằng `file://`, nên chạy qua server sẽ đảm bảo mọi tính năng.

## Cấu trúc

```
langcard-studio/
├── index.html              # Cấu trúc HTML + nạp CSS/JS
├── src/
│   ├── css/styles.css      # Toàn bộ giao diện (gồm theme sáng/tối)
│   └── js/
│       ├── config.js       # Hằng số: khổ giấy, template, nhãn ngôn ngữ
│       ├── samples.js      # Dữ liệu mẫu cho 6 template
│       ├── templates.js    # 6 hàm render + dispatcher
│       ├── forms.js        # Trình tạo form chỉnh sửa
│       ├── state.js        # State + hàm cập nhật + upload ảnh
│       ├── store.js        # Undo/redo, auto-save, import/export JSON
│       ├── projects.js     # Quản lý nhiều dự án (dropdown + modal lưới)
│       ├── navigation.js   # Điều hướng trang, tab, theme, kéo thả, toast
│       ├── preview.js      # Khung xem: zoom, pan, lưới, thumbnail, vùng an toàn
│       ├── export.js       # Xuất PDF / PNG / ZIP
│       └── main.js         # Khởi động + phím tắt (chạy cuối)
└── assets/                 # (dự phòng cho ảnh/icon sau này)
```

Các file JS nạp tuần tự theo thứ tự phụ thuộc qua thẻ `<script>` thường — không cần build tool.

## Thư viện ngoài (CDN)

- [html2canvas](https://html2canvas.hertzen.com/) — render PNG
- [jsPDF](https://github.com/parallax/jsPDF) — đóng gói PDF (tải file trực tiếp)
- [JSZip](https://stuk.github.io/jszip/) — đóng gói ZIP
- Google Fonts: Inter + Fraunces

Cần internet ở lần chạy đầu để tải các thư viện này.
