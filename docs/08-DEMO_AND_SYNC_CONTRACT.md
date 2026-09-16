# Quy Ước Demo, Lưu Trữ Cục Bộ & Đồng Bộ Nhiều Tab

Tài liệu này xác lập ranh giới của bản prototype chạy trên trình duyệt, chiến lược lưu trữ cục bộ và giao thức đồng bộ thời gian thực qua `BroadcastChannel`.

---

## 1. Ranh Giới Độ Sâu Thực Hiện Của Bản Demo

Nguyên tắc: **Làm thật ở nơi giúp ra quyết định sản phẩm/thẩm mỹ, giả lập ở nơi chỉ là hạ tầng server**:

| Khu vực chức năng | Mức độ làm thật | Chi tiết hiện thực |
| :--- | :--- | :--- |
| **Cá voi 3D Hero** | Làm thật | Canvas WebGL Three.js, chu kỳ bơi tự nhiên, ánh sáng PBR, tự động pause khi ẩn. |
| **Mô phỏng Cột nước**| Làm thật | Thao tác kéo độ sâu 0–4.000m, tính toán suy giảm quang học và áp suất theo công thức vật lý. |
| **Mô phỏng Trầm tích**| Làm thật | Dòng chảy hạt phù sa, góc dốc lục địa, so sánh hai trạng thái Run A vs Run B. |
| **Đồng bộ lớp học** | Làm thật | Phối hợp tức thì giữa Bảng điều khiển Giáo viên, Màn hình Học sinh và Màn hình Chiếu qua `BroadcastChannel`. |
| **Soạn giáo án** | Làm thật | Sắp xếp thứ tự các hoạt động kéo thả, chuyển đổi tức thì giữa góc nhìn giáo viên và học sinh. |
| **Chuyển đổi 6 Biến thể**| Làm thật | Đổi nhanh cấu trúc thông tin (IA) và giao diện (Theme) không cần tải lại trang. |
| **Xác thực / Đăng nhập** | Cục bộ / Mock | Chọn nhanh vai trò (Giáo viên, Học sinh, Khách) không cần mật khẩu. |
| **Cơ sở dữ liệu backend**| Cục bộ / Mock | Lưu trữ qua `localStorage` có tiền tố phân vùng và nút Reset khôi phục dữ liệu gốc. |

---

## 2. Lưu Trữ Cục Bộ & Phiên Bản Hóa

Dữ liệu demo lưu trong `localStorage` với các namespace rõ ràng:
- `ocean-demo:v1:profile`: Vai trò và định danh đang chọn.
- `ocean-demo:v1:variant`: Biến thể thiết kế đang kích hoạt (IA & Theme).
- `ocean-demo:v1:progress`: Mẫu vật đã mở khóa và độ sâu đã lặn tới.
- `ocean-demo:v1:lessons`: Giáo án do giáo viên sắp xếp.
- `ocean-demo:v1:sessions`: Trạng thái phòng học trực tiếp.

Mọi object đều có `schemaVersion: 1`. Nếu sai lệch phiên bản, hệ thống tự động reset về giá trị mặc định mà không gây crash ứng dụng.

---

## 3. Giao Thức Đồng Bộ Nhiều Tab (BroadcastChannel)

Giao tiếp thời gian thực giữa màn hình giáo viên, học sinh và máy chiếu sử dụng `BroadcastChannel` của trình duyệt:

```typescript
export interface SessionMessage<T = unknown> {
  eventId: string;
  sourceId: string;    // Định danh duy nhất của mỗi tab
  sessionId: string;   // Mã phiên học
  timestamp: number;
  version: number;
  type: SessionEventType;
  payload: T;
}
```

### Cơ Chế Chống Lặp Vô Tận (Loop Prevention)
1. Mỗi tab trình duyệt tự sinh một `sourceId` ngẫu nhiên khi mở.
2. Khi nhận được tin nhắn từ kênh: Nếu `message.sourceId === mySourceId`, bỏ qua ngay lập tức.
3. Không bao giờ phát lại chính tin nhắn vừa nhận được vào kênh.

### Danh Sách Sự Kiện Hỗ Trợ
- `SESSION_STARTED`: Giáo viên bắt đầu buổi học.
- `SESSION_ENDED`: Kết thúc buổi học, học sinh quay về trang chủ.
- `EXPERIENCE_CHANGED`: Giáo viên chuyển bài học, màn hình học sinh tự chuyển theo.
- `PACING_CHANGED`: Thay đổi chế độ nhịp độ (`guided` | `independent` | `observe`).
- `PROMPT_OPENED`: Mở câu hỏi dự đoán lên màn hình lớn và máy học sinh.
- `PROMPT_CLOSED`: Đóng câu hỏi.
- `RESPONSE_SUBMITTED`: Học sinh gửi câu trả lời dự đoán về máy giáo viên.
- `SIM_COMMAND`: Lệnh điều khiển mô phỏng (`SET_DEPTH`, `RESET`...).
- `PRESENTATION_STATE_CHANGED`: Chuyển đổi trạng thái màn hình chiếu công cộng.
