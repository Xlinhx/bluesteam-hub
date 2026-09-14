# Sai lệch ảnh đã biết — bắt buộc đưa vào plan
Đây là cảnh báo khi tham chiếu, không phải lỗi đã sửa bằng code. Quy tắc chung áp dụng toàn bộ ảnh.

| Ảnh (suffix sau bluesteam-v2-) | Giữ | Phải điều chỉnh/không sao chép |
|---|---|---|
| public-landing-overview | Nhịp nhiều cảnh, chất liệu đại dương | Bỏ An/Hồ sơ đăng nhập khỏi public; kiểm vật liệu chai, giảm slogan tự sinh |
| public-role-and-access | Phân vai | Không hiển thị như người dùng đã đăng nhập; bỏ mẫu danh tính khỏi trạng thái chưa xác thực |
| public-adult-login | Bố cục form | Copy và validation theo đặc tả, không giữ slogan vô nghĩa |
| resources-library-overview, resources-catalog | Tổ chức kho | Thống nhất taxonomy và shell, nội dung mẫu không phải dataset |
| resources-flashcard-detail, resources-media-player | Vùng học liệu | Active Học liệu; sidebar không tự sinh; video thực hoặc placeholder trung thực |
| resources-print-preview | Preview và tải | Bỏ mục Cộng đồng tự sinh, dùng shell đúng vai trò |
| ocean-horizontal-atlas | Cảnh ngang | Active Học tập; lớp đánh bắt khác môi trường sống; tránh chữ dày cho trẻ |
| ocean-vertical-atlas | Mặt cắt tầng nước | Không gán mọi sứa cho nước giữa, không đánh đồng habitat với chuỗi thức ăn; kiểm khoa học |
| ocean-creature-viewer | Sân quan sát | Active Học tập; ảnh không thay được mô hình 3D xoay thực |
| game-lab-overview | Kho cơ chế | Đưa lối tiếp tục rõ, giảm dày thẻ cho trẻ; active Tương tác |
| game-lab-recognition-round | Hình thái vòng chọn | Áp dụng immersive shell chuẩn từ ảnh habitat-placement mới |
| game-lab-habitat-feedback | Ý tưởng quan sát và sửa | Chỉ tham khảo kết quả; dùng shell/camera/đối tượng của placement mới. Không nhân đôi vật đã đặt trong dock |
| simulations-catalog | Kho mở rộng | Không tự thêm simulation ngoài yêu cầu; kiểm loại chai và active Tương tác |
| simulations-my-action-choice | Điểm quyết định | Active Tương tác; phân biệt chọn với kết quả |
| simulations-my-action-compare | So sánh lựa chọn | Cùng camera/object ban đầu; bước hiện tại phải là kết quả/so sánh |
| simulations-plastic-journey | Cảnh hành trình | Bỏ header/sidebar tự chế; theo shell simulation thống nhất |
| simulations-rescue-mission | Quan sát và nhờ hỗ trợ | Không hướng dẫn trẻ tự tiếp cận/cắt lưới động vật; logic phải kiểm nội dung |
| creative-studio | Bàn sáng tạo | Ô rỗng dùng tạo mới, không Mở tác phẩm; bỏ slogan tự sinh |
| creative-drawing | Vùng vẽ, tranh trẻ | Công cụ thật; lưu/mở giữ nguyên sản phẩm |
| creative-habitat-build, creative-habitat-run | Cặp dựng/chạy | Không tự đổi hình học khi chạy; phân biệt edit/run, cùng objectId/transform, bỏ công cụ dư |
| profile-learner-profile | Sản phẩm và hành trình | Bỏ sidebar không chuẩn; không dựng thành tích giả |
| teacher-dashboard | Mật độ công cụ người lớn | Dữ liệu minh họa, đồng nhất teacher shell |
| teacher-resource-library | Kho giáo viên | Bỏ Tiểu học/THCS/THPT sai phạm vi mẫu giáo; active Học liệu |
| teacher-lesson-plan | Cấu trúc giáo án | Nội dung giáo án cần đặc tả thực |
| teacher-lesson-builder, teacher-live-console | Soạn và điều khiển | Selection phải khớp preview; cùng số bước/stepId khi chuyển màn |
| teacher-presentation | Cảnh lớp xem chung | Chỉ dùng cảnh làm tham khảo; loại full menu trẻ và An; giáo viên điều khiển qua console |

Ảnh mới home và habitat-placement: xem nhận xét thực tế ở PROGRESS.md. Không được suy ra UI/motion đạt chỉ từ ảnh.

