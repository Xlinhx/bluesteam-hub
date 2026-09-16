# Hợp Đồng Trải Nghiệm (Experience Contract) & Trừu Tượng Hóa Runtime

Tài liệu này xác lập ranh giới giao tiếp, phương thức vòng đời và hệ thống sự kiện cho các trải nghiệm học tập trong hệ thống.

---

## 1. Thực Thể Trải Nghiệm Chung (Generic Experience Entity)

Mọi phương tiện học tập tương tác (video, mô phỏng WebGL, thử thách phân loại xúc giác) đều tuân theo cùng một kiểu dữ liệu chuẩn:

```typescript
export type ExperienceType = 'video' | 'simulation' | 'challenge' | 'story' | 'audio';

export interface PresentationCapabilities {
  fullscreen: boolean;           // Hỗ trợ hiển thị toàn màn hình
  openPublicWindow: boolean;     // Hỗ trợ mở cửa sổ trình chiếu riêng biệt
  hideChrome: boolean;           // Ẩn thanh công cụ riêng tư
  largeControls: boolean;        // Điều khiển kích thước lớn nhìn rõ từ xa
  showJoinCode: boolean;         // Hiện mã tham gia phòng
  showPrompt: boolean;           // Hiển thị câu hỏi dự đoán toàn lớp
  revealLabels: boolean;         // Mở khóa nhãn khoa học theo ý giáo viên
  focusObject: boolean;          // Tiêu điểm vào một đối tượng cụ thể
}

export interface StudentInteractionConfig {
  allowsDirectManipulation: boolean;
  dragRequiresPointerAlternative: boolean; // Bắt buộc có phương án chạm thay cho kéo thả
  touchTargetMinSizePx: number;            // 48-64 px
  audioInstructionAvailable: boolean;      // Có đọc lời hướng dẫn
  maxActiveChoices: number;                // Giới hạn số lượng lựa chọn cùng lúc
}

export interface Experience {
  id: string;
  slug: string;
  type: ExperienceType;
  title: string;
  unitId: string;
  summary: string;
  estimatedMinutes: number;
  presentation: PresentationCapabilities;
  studentInteraction: StudentInteractionConfig;
  runtimeConfig: Record<string, unknown>;  // Cấu hình riêng của từng mô phỏng
  thumbnailUrl: string;
}
```

*Nguyên tắc sống còn*: Thực thể Domain không bao giờ import Three.js, React component hay mã điều khiển thiết bị phần cứng. Chúng là dữ liệu thuần túy và có thể tuần tự hóa (*serializable*).

---

## 2. Vòng Đời Của Mô Phỏng Khoa Học (Simulation Lifecycle)

Mọi mô phỏng (như Cột nước biển hay Bồi tụ thềm lục địa) đều thực thi một giao diện chuẩn:
- **`reset()`**: Đưa các thông số về trạng thái ban đầu.
- **`pause()` / `resume()`**: Tạm dừng hoặc tiếp tục chạy mô phỏng.
- **`getState()` / `setState()`**: Lấy hoặc khôi phục trạng thái mô phỏng (phục vụ đồng bộ hoá).
- **`setPresentationMode(active)`**: Bật chế độ hiển thị công cộng màn hình lớn.
- **`setStudentMode(active)`**: Bật chế độ thao tác dành cho học sinh.

### Tách Rời Sự Kiện & Tiến Trình (Gamification Decoupling)
Mô phỏng phát ra các sự kiện cột mốc quan sát (ví dụ: `observationMade: { zone: 'abyssal', depth: 4000 }`), nhưng **tuyệt đối không tự cộng điểm, không tự phát XP hay quản lý thành tích**. Tầng tiến trình bên ngoài sẽ lắng nghe sự kiện để ghi nhận mở khóa mẫu vật.

---

## 3. Năng Lực Trình Chiếu Đặc Thù
- **Điều khiển kích thước lớn (Large Controls)**: Khi chiếu lên màn hình TV, con trỏ chuột nhỏ rất khó nhìn. Hệ thống tự động chuyển sang các nút bấm to bản, phản hồi chuyển động rõ nét.
- **Tiết chế nhãn khoa học (Reveal Labels)**: Giáo viên có thể ẩn tên gọi khoa học để học sinh tự quan sát hiện tượng và đưa ra giả thuyết, sau đó giáo viên bấm hiển thị để chốt kiến thức.
- **Câu hỏi dự đoán (Prediction Prompt)**: Giáo viên kích hoạt câu hỏi trên màn hình chiếu, máy học sinh hiện lựa chọn, kết quả tổng hợp ẩn danh hiển thị cho cả lớp cùng thảo luận.
