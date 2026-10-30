# Chuyển động học liệu và hồ sơ

Phạm vi: học liệu học sinh, học liệu giáo viên, hồ sơ học sinh và dialog danh tính hai vai trò. Giữ API, dữ liệu, bố cục, trạng thái lỗi và xác nhận bỏ thay đổi. Home và tương tác có luồng motion riêng.

## Ngôn ngữ chung

Phản hồi thường xuyên ngắn và tại chỗ; chuyển động không trì hoãn lưu hoặc điều hướng. DOM luôn chứa trạng thái cuối có thể sử dụng. `shared/ui/motion` quản lý animation theo đối tượng, thay thế hiệu ứng trước, dọn khi unmount và hủy ngay khi bật `prefers-reduced-motion`. Không thêm thư viện.

- Phản hồi: 160ms. Panel: 420ms. Quan hệ không gian tác phẩm: 680ms.
- Easing đi vào: `cubic-bezier(.22,1,.36,1)`; đóng: `cubic-bezier(.4,0,.2,1)`, 300ms cho panel và 480ms cho tác phẩm.
- Không chạy hiệu ứng chọn avatar/bookmark khi chỉ khôi phục trạng thái ban đầu.
- Reduced motion giữ phản hồi văn bản, màu, trạng thái chọn và focus; bỏ dịch chuyển.
- Nút Hủy, nút Đóng và Escape đi qua cùng vòng đời đóng; lưu thành công và điều hướng của parent không bị chờ animation.

## Học liệu học sinh

- Phân trang: vùng kết quả vào từ hướng trang trước/sau, độ dịch tối đa 32px và tỷ lệ theo chiều rộng vùng chứa, 620ms. Thanh tìm kiếm và bộ lọc đứng yên.
- Tìm kiếm/đổi nhóm: kết quả đổi độ rõ trong 420ms, không có hướng dịch giả. Khôi phục catalog từ màn chi tiết không chạy lại entrance và giữ vị trí cuộn.
- Bookmark: chỉ biểu tượng dịch 5px khi lưu hoặc 3px khi bỏ lưu; cập nhật trạng thái tức thì. Cùng hành vi ở catalog và chi tiết.
- Lưu/bỏ lưu trong catalog thường không tải lại nhóm/kết quả; chỉ thay đổi bộ lọc Đã lưu mới cần truy vấn lại theo danh sách ID mới.
- Album chi tiết: hướng ảnh theo nút trước/sau, 12px/220ms; animation bắt đầu sau cập nhật DOM, có thể thay thế và hủy khi giảm chuyển động.
- Bộ chọn nhóm: panel mở/đóng ngắn, không trì hoãn thao tác chọn nhóm; trả focus về nút mở khi đóng.

## Học liệu giáo viên

- Đổi nhóm: phần chữ tiêu đề được hé theo chiều ngang 580ms, ảnh nhóm xoay nhẹ; bảng và các control giữ vị trí ổn định. Hàng mới chỉ đổi độ rõ/màu nền trong 360ms.
- Dialog: 12px theo trục dọc. Drawer: từ cạnh phải, khoảng dịch bằng 10% chiều rộng thực và tối đa 40px. Đóng đảo hướng từ trạng thái hiển thị hiện tại; Escape/click liên tiếp không tạo nhiều timeline.
- Thêm/chuyển nhóm: chụp tâm nút xác nhận từ sự kiện click (cả chuột và bàn phím); chỉ tạo dấu xác nhận bay sau phản hồi thành công. Không dùng nút bấm bất kỳ gần nhất. Đường đi tính từ tọa độ nguồn đến bộ đếm nhóm thực, 480ms; khi nhóm không nằm trong danh sách thì dùng thông báo thành công, không gán nhầm tiêu đề nhóm khác. Đích ngoài viewport không chạy chuyến bay.
- Resize/cuộn trong chuyến bay hủy chuyển động để tránh tọa độ cũ. Thông báo thành công vẫn hiển thị độc lập. Xác nhận bỏ nội dung chưa lưu vẫn được giữ nguyên.
- Mỗi mutation thành công tăng tín hiệu riêng, nên hai lần thao tác cùng nhóm và cùng thông báo vẫn có hai phản hồi. Không dùng chuỗi thông báo làm định danh duy nhất của sự kiện.

## Hồ sơ

- Thêm tác phẩm: chỉ ảnh và caption DOM mới được đưa vào choreography theo điểm neo; ảnh đặt xuống như một tờ tranh trong 860ms, không chạy lại toàn bộ bộ sưu tập. Focus tải thêm vẫn tới tác phẩm đầu tiên mới thêm.
- Xem tác phẩm: lấy hình học thumbnail đã chọn và vùng xem thực sau layout, ánh xạ bằng translate/scale với điểm neo góc trên trái. Đóng tính lại hình học; khi nguồn không còn hợp lệ hoặc ngoài viewport, dùng đổi độ rõ ngắn.
- Đóng giữa entrance: chụp trạng thái hình ảnh hiện tại, hủy entrance rồi đo vùng xem ở layout gốc trước khi tính đích thu về; không đo trên bounding box đã bị transform.
- Tải thêm không cướp focus khi người dùng đã chuyển sang control khác; requestAnimationFrame chờ focus được hủy khi section unmount.
- Danh tính: dấu chọn avatar xuất hiện trong 200ms; ảnh xem trước cập nhật trong 260ms. Hover chỉ dịch nhẹ trên thiết bị có con trỏ chính xác, không lắc/nảy lặp lại.
- Dialog giữ focus trap và trả focus về nguồn, kể cả khi input tự focus lúc mount. Nếu consumer từ chối đóng khi đang lưu, panel trở về trạng thái CSS sử dụng được.


## WebKit, bàn phím và trạng thái

Chuyển động DOM phải hủy được khi đổi route, resize, nguồn thumbnail mất hoặc reduced motion thay đổi. Giữ focus trong modal, trả focus về opener còn tồn tại khi đóng; không giữ focus ở nội dung ẩn. Media/canvas cần được kiểm với browser thật; không suy luận từ transform CSS hoặc test source.

Các bài kiểm tra trong `e2e/resource-*`, `e2e/profile-*`, `e2e/interactive-*` và `e2e/home-*` giữ những hồi quy motion đã tìm thấy. Trace/screenshot mới là output chạy lại, không dùng nhật ký cũ để chứng minh build hiện tại.

## Sáng tạo của cô và bé

[Đặc tả motion Sáng tạo](CREATIVE_MOTION.md): hai vai trò dùng choreography theo ngữ cảnh; giữ bảng/canvas ổn định, chuyển ảnh theo nguồn–đích thực, profile riêng cho mở biển và chuyển động trong nước có giới hạn theo viewport. Không thay profile các phân hệ khác.
