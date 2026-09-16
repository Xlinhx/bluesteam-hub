# Mô Hình Sản Phẩm & Phân Hệ Kiến Trúc

Tài liệu này xác lập mô hình phân hệ sản phẩm chuẩn mực, phản ánh triết lý: **Động cơ học tập trực quan kết hợp hệ thống điều phối lớp học chuyên nghiệp (*Visual Learning Engine + Teaching Orchestration System*)**.

---

## 1. Sơ Đồ Hệ Thống Tổng Thể

```
                      ĐỒ THỊ NỘI DUNG (Content Graph)
                                    │
                                    ▼
                     ĐỘNG CƠ TRẢI NGHIỆM (Experience Engine)
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │                            │                            │
       ▼                            ▼                            ▼
 MÀN HÌNH HỌC SINH         BÀN ĐIỀU KHIỂN GV           MÀN HÌNH TRÌNH CHIẾU
 (Thao tác trực tiếp,      (Điều phối sư phạm,          (Sân khấu bùng nổ,
  ít chrome, thế giới sâu)   mật độ cao, kiểm soát)       tối đa hiện tượng tự nhiên)
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
                         PHIÊN HỌC / LỚP HỌC (Session)
                                    │
             ┌──────────────────────┴──────────────────────┐
    HÀNH TRÌNH (Journey)                          KHÁM PHÁ (Explore)
 (Lộ trình tiến trình dã ngoại)                (Bề rộng triển lãm tự do)
```

---

## 2. Phân Cấp Mức Độ Trải Nghiệm (Hero Tiers)

Để tối ưu hóa sức nặng dự án khi đem đi thi và trình diễn, các trải nghiệm được phân cấp rõ rệt:

### Tier A — Trải Nghiệm Mũi Nhọn (Hero Experiences)
*Chiếm phần lớn ngân sách thị giác và độ sâu mô phỏng, tạo hiệu ứng kinh ngạc ngay từ cái nhìn đầu tiên:*
1. **Water Column (Mô phỏng Cột nước biển 3D)**: Camera lặn xuống theo độ sâu 0–4000m, suy giảm quang học vật lý, áp suất ép méo vật thể, đường cong thermocline, sinh vật biển sâu phát quang kỳ ảo.
2. **Sediment Terraces (Mô phỏng Thềm bồi tụ trầm tích)**: Động lực học dòng chảy, góc dốc lục địa, bồi tụ phân tầng giữa phù sa, cát và sỏi; so sánh trực tiếp Run A vs Run B.
3. **Whale Living World (Thế giới cá voi 3D)**: Cá voi xanh anatomically accurate bơi lượn trong lòng đại dương sâu thẳm, ánh sáng caustics mặt nước.
4. **Living Journey Map (Bản đồ thám hiểm sống động)**: Lộ trình không gian cắt ngang đại dương, mở khóa các mẫu vật và vùng biển mới.

### Tier B — Trải Nghiệm Bổ Trợ (Supporting Experiences)
- Video tài liệu khoa học có chú thích tương tác.
- Thử thách quan sát / phân loại sinh vật theo độ sâu (chạm trực quan).
- Câu chuyện khoa học tương tác và âm thanh tự nhiên.

### Tier C — Giao Diện Quản Trị Hệ Thống (System Surfaces)
- Thư viện bài giảng giáo viên (bộ lọc hai cột & xem trước tức thì).
- Trình soạn giáo án kéo thả trải nghiệm (*Lesson Composer*).
- Báo cáo tổng kết sau buổi học (*Session Results*).

---

## 3. Khái Niệm "Teacher Overlay" & "Exhibit Mode"

Cùng một Experience Runtime (như Water Column), hệ thống hỗ trợ các lớp chế độ:

### 1. Student Personal Mode
- Giao diện tối giản thanh công cụ.
- Trẻ kéo cần trượt độ sâu, chạm vào sinh vật, nghe tiếng đọc, trả lời câu hỏi dự đoán.

### 2. Teacher Overlay (Bật lớp điều khiển)
- Kích hoạt ngay trên màn hình trải nghiệm mà không cần chuyển trang.
- Mở rộng thanh điều khiển chuyên sâu: Bật/tắt các lớp biến số (Ánh sáng, Nhiệt độ, Áp suất), ẩn/hiện nhãn khoa học, đóng băng khung hình, kích hoạt câu hỏi toàn lớp (*Inquiry Prompt*).

### 3. Exhibit Mode (Chế độ Trưng Bày Bảo Tàng Kiosk)
- Giao diện sạch 100%, không thanh công cụ, hoạt động như một tác phẩm sắp đặt bảo tàng (*Museum Installation*).
- Ví dụ: Cột nước tự động lặn từ mặt biển xuống đáy vực 4.000m trong 90 giây kèm âm thanh đại dương, chạy trên TV hoặc màn hình lớn triển lãm.

---

## 4. Tương Tác Màn Hình Lớn Mang Tính Sân Khấu (Theatrical Shared-Screen)

Khi 20 học sinh gửi câu trả lời dự đoán về máy chủ:
- Màn hình trình chiếu **không** hiển thị biểu đồ khô khan dạng `A: 12, B: 5, C: 3`.
- Thay vào đó, nó **trực quan hóa ngay vào môi trường tự nhiên**:
  - Các sinh vật bơi tập trung về vùng dự đoán của lớp;
  - Hoặc ba tầng độ sâu phát sáng tương ứng với tỉ lệ phân bổ lựa chọn của học sinh.
- Sau đó giáo viên bấm nút để hiện thực hiện ra, tạo khoảnh khắc *"Aha!"* bùng nổ trong lớp học.
