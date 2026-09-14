# Quy tắc sử dụng ảnh
## Shell dùng chung
Ảnh không phải nguồn sự thật cho menu: không vẽ lại header riêng từng trang.
- Learner shell: logo sóng BlueSTEAM bên trái; Học liệu | Học tập | Tương tác | Sáng tạo | Hồ sơ đúng thứ tự; avatar sóng trung tính và tài khoản bên phải. Không tự thêm sidebar. Home không giả vờ active Học liệu.
- Resources thuộc Học liệu; atlas và creature viewer thuộc Học tập; game/simulation thuộc Tương tác; studio thuộc Sáng tạo; profile thuộc Hồ sơ.
- Teacher shell: Bài giảng | Giáo án | Học liệu | Game & Simulation | Hồ sơ; danh tính giáo viên, không bé An.
- Public shell: không hiện tài khoản An/Cô Linh khi chưa đăng nhập. CTA theo vai trò; biến thể public phải được chốt ở Plan mode.
- Immersive game: quay lại, tên hoạt động/tiến trình, nghe lại và tạm dừng. Đây là ngoại lệ có chủ đích; không nhét full menu vào sân chơi.
- Presentation: không có danh tính trẻ hay bảng điều khiển riêng tư của giáo viên.
Plan sẽ chốt kích thước, font, SVG, active/hover/focus/disabled và responsive; sau đó một component duy nhất cho mỗi shell. Không suy đoán pixel chuẩn từ các ảnh mâu thuẫn.

## Asset
Cấm crop screenshot/mockup làm asset, screenshot-as-background rồi chồng hotspot, hoặc dùng nguyên UI raster thay giao diện thật.
Mỗi cảnh cần bản kê: background sạch không chữ/nút; vật thể tương tác độc lập; foreground; DOM/SVG UI; motion; hit area; anchor; cách co giãn.
Prompt asset cần subject, camera, ánh sáng, palette, tỉ lệ, vùng trống, alpha khi cần và invariants với cảnh liền kề.
- 2D: ảnh/illustration cho nhìn và chọn.
- 2.5D: tách lớp/parallax/di chuyển mặt phẳng, không tự gọi là xoay 3D.
- 3D thật: quan sát nhiều phía, camera/orbit hoặc bố trí vật thể không gian khi nhiệm vụ đòi hỏi. Có phương án tải chậm/lỗi và thiết bị yếu.
Không làm sinh vật chuyển động bằng cách di chuyển cả background; không nhúng sẵn vật thể cần tương tác vào nền rồi thêm bản sao lên trên.
Hình dáng nút, đường viền, SVG đặc trưng phải có đặc tả, không tự thay icon gần nghĩa. Mockup không chứng minh footage, alpha, mesh hay motion tồn tại.

## Nội dung và khả năng mở rộng
Không dùng video không liên quan để giả bài học đại dương; placeholder phải rõ trạng thái và không giả playable.
Không gán nguồn khoa học khi chưa xác thực. Nhãn loài/habitat và kết quả mô phỏng cần kiểm chứng trước triển khai.
Minh họa hồ sơ không phải dữ liệu thật. Không tự bịa hoàn thành/thành tích.
Catalog phải có ít/nhiều/rỗng/lỗi/tìm không thấy và tải thêm; nội dung không hardcode theo số card trong ảnh. Tách metadata nội dung khỏi cơ chế game/simulation trong plan.

