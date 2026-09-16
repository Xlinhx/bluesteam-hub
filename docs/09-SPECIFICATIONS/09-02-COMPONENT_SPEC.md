# Quy Chuẩn Thành Phần Giao Diện — BlueSTEAM v2 (COMPONENT_SPEC.md)

Phong cách: Living Ocean (duy nhất)
Ngày chuẩn hóa: 2026-09-14

---

## 1. Hệ Thống Tokens (Design Tokens)

### 1.1. Bảng Màu Living Ocean
| Token Name | Mã Hex / HSL | Ứng Dụng | WCAG Contrast |
|---|---|---|---|
| `color-ocean-ivory` | `#F6F3EB` | Nền trang nhã toàn ứng dụng, card sáng, vùng đọc văn bản | Nền chính |
| `color-ocean-navy` | `#12384B` | Màu chữ chính (text-primary), nền sâu thẳm, viền cấu trúc | 11.2:1 trên Ivory (AAA) |
| `color-ocean-teal` | `#17657A` | Màu biển trung tầng, điểm nhấn thông tin, trạng thái đã khám phá | 4.8:1 trên Ivory (AA) |
| `color-ocean-coral` | `#F67650` | Nút hành động chính (Primary CTA), tiêu điểm tương tác | Chữ trên Coral dùng Navy `#12384B` (4.6:1 AA) |
| `color-ocean-surface-alt` | `#EAE4D5` | Nền lõm (sunken), rãnh trượt, khay chứa vật thể | Phân tách nền phụ |
| `color-ocean-gold` | `#E5A93C` | Sao hoàn thành, vỏ sò thành tựu, huy hiệu | Điểm nhấn thành tích |
| `color-ocean-biolum` | `#2EE6CA` | Ánh sáng phát quang sinh học nước sâu, hiệu ứng active glow | Điểm sáng cảnh 3D |

### 1.2. Phông Chữ & Cỡ Chữ (Typography)
- **UI & Trẻ em:** `Be Vietnam Pro` (Sans-serif). Nét chữ tròn, rõ ràng, dấu tiếng Việt hiển thị hoàn hảo.
  - Hướng dẫn thao tác trẻ: tối thiểu $20\text{px}$ (`text-xl`), `leading-relaxed`, `font-bold` hoặc `font-semibold`.
  - Nhãn nút & lựa chọn: tối thiểu $18\text{px}$ (`text-lg`), `font-bold`.
- **Editorial & Người lớn:** `Noto Serif` (Serif trang trọng).
  - Tiêu đề Landing Page, tiêu đề tổng quan Dashboard giáo viên: $28\text{px} - 48\text{px}$ (`text-2xl` đến `text-4xl`), `font-bold`.
  - Nội dung công cụ người lớn: $16\text{px}$ (`text-base`), `font-medium`.
- **Ràng buộc cứng:** Tuyệt đối không dùng font Serif cho hướng dẫn thao tác của trẻ nhỏ.

### 1.3. Khoảng Cách & Vùng Chạm (Spacing & Touch Targets)
- Thang khoảng cách 8 cấp: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- Gutter lề màn hình: `16px` (Mobile), `24px` (Tablet), `40px` (Desktop). Độ rộng nội dung tối đa: `1280px`.
- Vùng chạm tương tác (Hit Area):
  - **Trẻ em (5–6 tuổi):** Tối thiểu $56 \times 56\text{px}$. Khoảng cách giữa 2 nút độc lập $\ge 8\text{px}$.
  - **Người lớn (Giáo viên / Phụ huynh):** Tối thiểu $44 \times 44\text{px}$.

---

## 2. Các Thành Phần Hình Dạng Đặc Trưng (Shape Components)

### 2.1. `CoralButton` (Nút Hành Động Chính)
- **Hình dạng:** Dạng con nhộng (Capsule / `rounded-full`), lớp đổ bóng đáy tạo cảm giác khối 3D xúc giác (`box-shadow: 0 4px 0 #C95634, 0 8px 16px rgba(246, 118, 80, 0.3)`).
- **Màu sắc:** Nền `#F67650`, chữ `#12384B` (Navy đậm) để đạt tương phản cao.
- **Trạng thái:**
  - `hover`: Nâng nhẹ $(-1\text{px})$, bóng đổ sâu hơn.
  - `pressed`: Lún xuống $(+3\text{px})$, bóng đáy thu về $1\text{px}$.
  - `focus-visible`: Viền sáng kép (outline 3px xanh Teal).
  - `disabled`: Mờ xám nhẹ, không phản hồi click, bóng đáy phẳng.

### 2.2. `PebbleButton` (Nút Công Cụ Sỏi Bất Đối Xứng)
- **Hình dạng:** Bo góc hữu cơ tự nhiên như viên sỏi mài bên bờ sóng (`border-radius: 24px 18px 26px 20px / 20px 26px 18px 24px`). Tuyệt đối không thay thế bằng hình chữ nhật hay capsule đối xứng đơn điệu.
- **Ứng dụng:** Thanh công cụ xưởng vẽ, bộ công cụ chọn vật thể sinh thái.
- **Trạng thái:** Có trạng thái `selected` với viền Teal phát sáng nhẹ và nền sáng hơn.

### 2.3. `ScallopHintButton` (Nút Gợi Ý Vỏ Sò)
- **Hình dạng:** Khối tròn bo tròn mềm mại chứa biểu tượng Vỏ Sò SVG độc quyền của BlueSTEAM (`viewBox="0 0 24 24"` với các nan vỏ xòe tự nhiên).
- **Màu sắc:** Nền màu ngọc trai ngà Ivory `#FFFDF8`, viền vàng nhạt `#E5A93C`, icon hổ phách.
- **Chức năng:** Khi chạm vào, phát ra âm thanh gợi ý và làm rung rinh nhẹ khu vực cần quan sát.

### 2.4. `JourneyNode` (Trạm Hành Trình)
- **Hình dạng:** Khối tròn đa tầng kích thước $68 \times 68\text{px}$ (vùng chạm $72 \times 72\text{px}$).
- **Ba trạng thái:**
  1. `completed`: Nền xanh Teal `#17657A`, biểu tượng ngôi sao vàng vỏ sò `#E5A93C`, viền trắng.
  2. `current`: Vòng tròn Coral `#F67650` phát xung ánh sáng nhẹ (pulse animation $2\text{s}$), biểu tượng chú rùa con dẫn đường.
  3. `locked`: Nền ngà trầm `#EAE4D5`, biểu tượng ổ khóa san hô nhỏ, mờ nhẹ.

### 2.5. `WaveDivider` (Mép Sóng Phân Tách Section)
- **Đặc tả SVG:** Các đường phân cách dạng sóng hữu cơ sinh động, khác nhau giữa các section trên Landing Page:
  - *Sóng bờ cát nông (Hero → Môi trường):* Bước sóng êm, dập dềnh nhẹ nhàng.
  - *Sóng trung tầng biển khơi (Môi trường → Quan sát 3D):* Bước sóng dài, sâu lắng.
  - *Sóng vỗ bọt trắng (Sáng tạo → Giáo viên):* Chi tiết gợn bọt viền trên nền tối.

### 2.6. `BlueSteamLogo` (Logo BlueSTEAM Chuẩn)
- Biểu tượng SVG sóng biển cách điệu hình giọt nước đại dương lồng ghép cánh buồm vươn khơi, kèm chữ "BlueSTEAM" kiểu chữ Be Vietnam Pro đậm cá tính. Đồng nhất xuyên suốt toàn bộ các shell và trang con.

---

## 3. Đặc Tả 5 Bộ Shell Chuẩn (Canonical Shells)

| Shell | Chiều cao Desktop | Chiều cao Mobile | Cấu trúc bên Trái | Cấu trúc Trung tâm | Cấu trúc bên Phải | Dưới 1024px |
|---|---|---|---|---|---|---|
| **PublicShell** | $72\text{px}$ | $64\text{px}$ | Logo BlueSTEAM | Học liệu \| Học tập \| Tương tác \| Sáng tạo | Đổi ngôn ngữ (VI/EN) + Nút Vào lớp / Đăng nhập | Drawer menu vuốt mở |
| **LearnerShell** | $72\text{px}$ | $64\text{px}$ | Logo BlueSTEAM | Học liệu \| Học tập \| Tương tác \| Sáng tạo \| Hồ sơ | Cụm đổi ngôn ngữ + Avatar bé An | Bottom Navigation 5 icon lớn ($64\text{px}$) |
| **TeacherShell** | $72\text{px}$ | $64\text{px}$ | Logo BlueSTEAM (Teacher badge) | Bài giảng \| Giáo án \| Học liệu \| Game & Sim \| Hồ sơ | Trạng thái đồng bộ + Avatar Cô Linh | Drawer menu quản lý |
| **ActivityShell** | $64\text{px}$ | $56\text{px}$ | Nút Quay lại (Vỏ sò) | Tên hoạt động & Thanh tiến trình hạt đậu | Nút Nghe lại (Loa) + Tạm dừng | Giữ nguyên thanh tinh gọn trên cùng |
| **PresentationShell** | $0\text{px}$ (Ẩn) | $0\text{px}$ (Ẩn) | Toàn màn hình không viền (Full-bleed immersion) | Cảnh bài giảng + Lời dẫn cực lớn | Mã phòng nhỏ góc kín khi cần | Tối ưu màn hình ngang (Landscape 16:9) |

---

## 4. Bảng Ma Trận Trạng Thái Tương Tác (State Matrix)

Mọi component tương tác bắt buộc phải hỗ trợ đầy đủ 7 trạng thái:
1. `default`: Trạng thái nghỉ chuẩn, tương phản rõ ràng.
2. `hover`: Con trỏ đổi sang `cursor-pointer`, biến đổi màu/vị trí tinh tế ($120-180\text{ms}$).
3. `pressed`: Phản hồi lún nhấn ($80\text{ms}$) tạo cảm giác xúc giác thực.
4. `focus-visible`: Viền outline $3\text{px}$ màu tương phản cao phục vụ điều hướng bàn phím / trợ năng.
5. `disabled`: `pointer-events: none`, độ mờ opacity $0.45$, màu sắc trung tính.
6. `selected`: Viền hoặc màu nền nổi bật biểu thị đang được kích hoạt.
7. `loading`: Hiệu ứng gợn sóng nhẹ (shimmer), giữ nguyên kích thước khung tránh giật layout.
