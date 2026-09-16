# Kiến Trúc Trải Nghiệm (UX Architecture) & Hai Bản Tinh Hoa

> **Chiến lược tối thượng**: Bỏ ma trận 6 biến thể dàn trải. Thu gọn toàn bộ sản phẩm về **Hai Bản Tinh Hoa (Two Flagship Editions)** chạy trên cùng một nền tảng lõi (*Core Product & Shared Simulation Runtime*).

---

## 1. Hai Bản Tinh Hoa (Two Flagship Editions)

```
                            NỀN TẢNG LÕI (Core Product Runtime)
                       ┌──────────────────────────────────────────┐
                       │  • Domain Engine (Units, Experiences)    │
                       │  • Physics Sim (Water Column & Sediment) │
                       │  • Session Transport (BroadcastChannel)  │
                       └────────────────────┬─────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        BẢN A — CINEMATIC DISCOVERY                 BẢN B — SCIENTIFIC LEARNING LAB
   (Sân khấu thị giác bùng nổ để đi thi)       (Công cụ khoa học & Hệ thống thực dụng)
   • Explore là root, Journey hòa vào world    • Teacher Cockpit & Orchestration mạnh mẽ
   • 3D realistic, motion, scroll narrative    • Thước đo xúc giác (Tactile Controls)
   • Không gian rộng mở, màu tươi sáng         • Simulation telemetry & Lesson composer
   • Vibe: Museum + NASA Eyes + High-End       • Vibe: High-Tech Lab + PhET Whole-Class
```

### Bản A — Cinematic Discovery (Sân Khấu Thị Giác)
- **Mục tiêu**: Gây ấn tượng mạnh mẽ ngay lập tức khi đem đi thi và trình diễn trước hội đồng giám khảo.
- **Trải nghiệm**:
  - Landing page kể chuyện bằng không gian (*spatial scroll narrative*).
  - 3D chân thực, chuyển động điện ảnh mượt mà, bố cục khổ lớn khoáng đạt.
  - Màu sắc tươi sáng, tự nhiên nhưng hoàn toàn không trẻ con (*fresh, sophisticated, not childish*).
  - **Cấu trúc thông tin**: *Explore là root*; *Journey* không phải một thanh tiến trình khô khan mà được hòa trực tiếp vào một thế giới sống động (*Living Ocean World*).
- **Cảm giác chủ đạo**: Giao thoa giữa **Triển lãm bảo tàng hiện đại (Smithsonian) + Trực quan hóa vũ trụ (NASA Eyes) + Trang sản phẩm cao cấp**.

### Bản B — Scientific Learning Lab (Phòng Thí Nghiệm Khoa Học)
- **Mục tiêu**: Chứng minh chiều sâu học thuật, năng lực công nghệ và tính thực dụng trong lớp học thật, chứng minh sản phẩm không chỉ là một video showreel làm màu.
- **Trải nghiệm**:
  - Bàn chỉ huy giáo viên (*Teacher Cockpit*) mạnh mẽ, mật độ thông tin cao, thao tác nhanh.
  - Thước đo và cần gạt xúc giác (*tactile instruments*) trên các mô phỏng (Cột nước Water Column, Bồi tụ thềm lục địa Sediment Terraces).
  - Trình soạn giáo án kéo thả trải nghiệm (*Lesson Composer*), quản lý phiên học trực tiếp (*Live Session*) và chế độ câu hỏi dự đoán (*Prediction Prompts*).
- **Cảm giác chủ đạo**: **Công cụ nghiên cứu khoa học công nghệ cao + Mô phỏng tương tác PhET**.

---

## 2. Điểm Hội Tụ Cuối Cùng (The Final Synthesis)

Hai bản không hề mâu thuẫn hay triệt tiêu nhau, mà bổ trợ hoàn hảo:
- **Lấy Landing Page và Visual Storytelling của Bản A** làm cửa ngõ bùng nổ cảm xúc.
- **Lấy Bàn điều khiển Giáo viên, Hệ thống bài giảng và Mô phỏng tương tác sâu của Bản B** làm xương sống vận hành.

---

## 3. Kiến Trúc Điều Hướng Chuẩn

```
Cổng Vào & Giới Thiệu
  /                          -> Landing Page (Cinematic Discovery Narrative)
  /entry                     -> Chọn chế độ trải nghiệm (Bản A / Bản B / Vai trò)

Bản A — Khám Phá Thị Giác
  /student                   -> Living World Canvas (Mặt cắt đại dương sống động)
  /student/explore           -> Visual Atlas / Infinite Discovery Wall
  /student/experience/:id    -> Trình diễn hiện tượng tự nhiên

Bản B — Công Cụ Khoa Học & Lớp Học
  /teacher                   -> Teacher Cockpit (Lịch dạy, Trạng thái lớp trực tiếp)
  /teacher/library           -> Thư viện bài giảng phân loại sâu
  /teacher/lesson/:id        -> Trình soạn giáo án kéo thả
  /teacher/session/:id       -> Điều phối phiên học & kích hoạt câu hỏi dự đoán
  /session/:id/present       -> Màn hình trình chiếu công cộng (Sân khấu lớp học)
  /student/sim/water-column  -> Mô phỏng cột nước biển chuẩn phòng Lab
  /student/sim/sediment      -> Mô phỏng bồi tụ trầm tích chuẩn phòng Lab

Đối Chiếu So Sánh
  /showcase/editions         -> Bảng đối chiếu song song Bản A và Bản B
```
