# Tham chiếu chiều dọc và bảng học tập — 15/11/2026

Các ảnh này thay thế hướng bố cục thẻ/mục lục cũ. Header vẫn dùng hệ thống hiện có. Phạm vi chỉ là giao diện học sinh.

1. `01-depth-camera.png`: khung nhìn trên của một mặt cắt cao, có thể kéo tới các tầng bên dưới. Năm tầng không bị dồn vào cùng một viewport. Chọn tầng sẽ chuyển sang ảnh cảnh chi tiết riêng.
2. `02-creature-card.png`: thẻ độc lập nền trắng, ảnh 16:9, nghe màu xanh ngọc ngay dưới ảnh và đánh dấu đã học màu vàng.
3. `03-catalogue.png`: mục lục cạnh phải, ảnh cùng kích thước, tìm kiếm, lọc, phân trang; danh sách cuộn bên trong bảng.
4. `04-catalogue-detail.png`: danh sách và phần đọc chia cột trong cùng một bảng. Điện thoại chuyển sang phần đọc trong chính bảng, đóng thẻ sẽ trở về danh sách.

Ảnh được tạo bằng ImageGen tích hợp. Prompt đầy đủ nằm trong `prompts.json`. Mockup định hướng bố cục và màu; ảnh thực thi của sinh vật vẫn dùng ảnh học liệu/ảnh có nguồn đã chọn, không lấy sinh vật vẽ trong mockup làm chứng cứ nhận dạng. Hai nút Sinh vật / Học liệu truy cập danh sách và chuyên đề hiện có; các bộ lọc nhóm và tiến độ giữ nguyên dữ liệu. Ảnh ô mục lục dùng khung 16:9 đồng nhất; phần đọc trong bảng dùng ảnh cao hơn, gần 4:3 theo không gian còn lại. Điện thoại dùng ảnh 16:9 để nhường chỗ cho nội dung. Nút đánh dấu đã học nằm ngoài vùng cuộn nội dung, luôn hiện trọn trong bảng.

Đối chiếu web Docker tại `http://localhost:3010/learning`: ảnh toàn màn hình và các cặp năm dải ngang bằng nhau nằm tại `artifacts/verification/learner-habitats/panels-depth-2026-11-15/`. Mỗi dải lấy đúng 1/5 chiều cao ảnh gốc. Ảnh so sánh đặt mockup bên trái và web bên phải.

Lượt chỉnh sát mockup tiếp theo lưu ảnh mới trong thư mục con `mockup-fidelity/`, gồm bốn màn tham chiếu, khung laptop và điện thoại. Giữ cách chia nhóm, vị trí sinh vật và dữ liệu hiện có để trao đổi riêng sau; lượt này chỉ chỉnh cách trình bày và giữ trang/từ khóa khi quay lại mục lục.

Cảnh dọc tổng quan mới dùng ảnh mặt cắt có tỷ lệ gốc; bản đồ nhỏ hiển thị toàn chiều cao. Cảnh chi tiết vẫn là panorama theo khu vực, không phóng ảnh tổng quan để giả làm cảnh mới. Camera có biên theo kích thước cảnh; đây là bản đồ lớn kéo được, không phải địa hình vô hạn hay mô hình 3D thật.

Phần này không thay ảnh toàn bộ học liệu hay xác nhận lại nhận dạng từng loài trong hai workbook. Bảo toàn danh sách nguồn và trạng thái học được kiểm bằng kiểm thử hiện có; các vấn đề chất lượng ảnh còn lại cần xử lý theo từng nguồn.
