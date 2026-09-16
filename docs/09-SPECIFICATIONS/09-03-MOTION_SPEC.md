# Đặc Tả Chuyển Động & Hiệu Ứng — BlueSTEAM v2 (MOTION_SPEC.md)

Phong cách: Living Ocean (duy nhất)
Ngày chuẩn hóa: 2026-09-14

---

## 1. Nguyên Tắc Motion

1. **Chuyển động có mục đích học tập:** Mỗi chuyển động phải phục vụ dẫn dắt sự chú ý của trẻ vào điểm quan sát quan trọng, không thêm chuyển động trang trí tùy tiện.
2. **Không chặn thao tác:** Trẻ và giáo viên có thể tương tác bấm nút bất kỳ lúc nào mà không cần chờ chuyển động trang trí chạy xong.
3. **Phân cấp kỹ thuật rõ ràng:**
   - Phản hồi nút bấm/UI: Dùng CSS Transitions ngắn gọn ($120-200\text{ms}$).
   - Chuỗi kể chuyện nhiều bước: Dùng Web Animations API (WAAPI) có hỗ trợ `pause()`, `play()`, `cancel()`.
   - Sinh vật và đại dương 3D: Three.js requestAnimationFrame và AnimationMixer.
4. **Tôn trọng Reduced Motion (Trợ năng):** Khi hệ điều hành hoặc người dùng bật `prefers-reduced-motion: reduce`:
   - Bỏ toàn bộ camera travel, parallax, bobbing và xoay tự động.
   - Thay thế bằng chuyển đổi fade nhẹ ($150\text{ms}$) hoặc chuyển trạng thái tức thì.
   - Giữ nguyên $100\%$ thông tin học tập, hệ quả và âm thanh giải thích.

---

## 2. Bảng Danh Mục Chuyển Động Trọng Yếu

| Motion ID | Vị trí & Tên | Trigger | Timeline & Thời lượng | Trạng thái cuối (End-State) | Reduced Motion | Bằng chứng kiểm tra |
|---|---|---|---|---|---|---|
| `m-hero-water-caustics` | Landing: Ánh sáng mặt nước | Tải trang & xuất hiện trong viewport | Loop vô tận $14\text{s}$, dao động nhẹ $0.98 - 1.02$ scale | Trạng thái dao động tuần hoàn | Đóng băng ở khung sáng tĩnh | Quay chu trình $15\text{s}$ không rách khung |
| `m-home-node-pulse` | Home: Xung sáng trạm hiện tại | Trạm đang học kích hoạt | Pulse mềm $2.0\text{s}$, mở rộng ring $1.0 \to 1.15$, mờ dần | Vòng tròn sáng bao quanh | Viền cố định không phát xung | Kiểm tra tại trạm số 2 |
| `m-home-mascot-idle` | Home: Bé rùa con vẫy vây | Sau $8\text{s}$ không thao tác (tối đa 2 lần) | Vẫy vây chào $1.2\text{s}$, mắt chớp | Quay về tư thế bơi nghỉ | Giữ nguyên tư thế tĩnh | Idle $8\text{s}$ và quan sát |
| `m-turtle-swim-loop` | Viewer 3D: Chu trình bơi rùa | Canvas 3D mount | Vòng bơi mái chèo $4.5\text{s}$, vây trước đập nhịp, vây sau bẻ lái | Bơi lượn trong hồ nước ảo | Rùa giữ nguyên góc nghiêng $15^\circ$ | Xoay quanh trong lúc bơi |
| `m-turtle-focus-part` | Viewer 3D: Zoom vào Mai/Vây | Chạm vào Hotspot mai hoặc vây | $600\text{ms}$, camera di chuyển mượt mà tới cự ly gần | Điểm quan sát ở trung tâm | Nhảy camera tức thì $50\text{ms}$ | Chạm hotspot và kiểm tra tiêu cự |
| `m-game-snap-placement` | Game: Snap thả vật thể | Thả vật thể vào vùng đích hợp lệ | $180\text{ms}$, hút về tâm đích kèm độ nảy nhẹ | Vật thể neo chặt ở vị trí đích | Snap tức thì không độ nảy | Thả gần mép và kiểm tra snap |
| `m-game-feedback-turtle` | Game: Rùa ăn cỏ biển | Đặt rùa đúng thảm cỏ biển | $1200\text{ms}$: Rùa bơi tới, cúi đầu ăn cỏ, bọt khí bay lên | Rùa nghỉ ngơi tại bãi cỏ | Hiện ảnh rùa ăn cỏ và chữ chúc mừng | Đặt đúng và kiểm tra chuỗi $1.2\text{s}$ |
| `m-sim-plastic-flow` | Sim: Mảnh nhựa trôi dạt | Chọn hành vi vứt rác bừa bãi | $2500\text{ms}$: Chai nhựa rơi cống $\to$ trôi ra cửa sông $\to$ biển | Chai nhựa trôi dạt trên mặt sóng | Hiện sơ đồ kết quả phân nhánh | Bấm chọn và xem tiến trình |
| `m-sim-rescue-assist` | Sim: Báo đội cứu hộ | Trẻ chọn "Báo người lớn" | $1600\text{ms}$: Tín hiệu phát đi, thuyền cứu hộ tới, gỡ lưới | Rùa biển tự do bơi vút lên | Hiện ảnh rùa đã an toàn | Bấm nút và theo dõi phản hồi |
| `m-builder-creature-roam`| Xưởng 3D: Chạy thử sinh vật | Bấm nút "Chạy thử" | Blend $400\text{ms} \to$ bơi lượn tự do theo đường cong $10\text{s}$ | Sinh vật tuần tra trong sinh cảnh | Sinh vật tĩnh trên mặt phẳng | Chuyển đổi giữa Edit và Run |
| `m-loading-turtle-wait` | Toàn hệ thống: Rùa chờ | Tải trang/asset kéo dài $> 300\text{ms}$ | Rùa bơi vòng tròn $1.5\text{s}$ rồi nhìn quanh | Biến mất khi tải xong (hoặc nút Thử lại nếu $> 8\text{s}$) | Thanh tiến trình tĩnh | Giả lập mạng chậm kiểm tra |
