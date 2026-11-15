# Hệ thống chuyển động BlueSTEAM

## Nguyên tắc chung

BlueSTEAM chuyển động theo đối tượng đang được khám phá. Dấu vùng đi theo trục bản đồ. Dấu chọn trên bàn làm việc đi theo hàng hoặc tab thật. Nội dung đang đọc, điều khiển thường dùng và vùng thao tác trực tiếp có điểm neo ổn định.

- Điều hướng React sở hữu URL và dữ liệu. CSS và Web Animations API chỉ thay đổi cách vẽ. Ưu tiên CSS cho hiệu ứng xác định trước, WAAPI cho phần cần đo vị trí, View Transition cho hành trình giữa các màn có quan hệ không gian.
- Phản hồi chức năng ưu tiên dưới 300 ms. Chuyển động biểu đạt dài hơn dành cho cảnh, minh họa hoặc khoảnh khắc đặc biệt. Lớp biểu đạt có thể bị ngắt bằng thao tác mới. Chữ, focus, số liệu và trạng thái chọn cập nhật ngay.
- `motionScope.ts` quản lý WAAPI theo phần tử và hủy khi unmount hoặc bật giảm chuyển động. `useMovingMarker.ts` đo vị trí đang vẽ trước khi đổi lựa chọn và đo vị trí cuối sau khi React commit. Khoảng cách thật quyết định thời lượng, dùng `motionTiming.respond` làm mốc và `motionTiming.settle` làm easing.
- Khi mở trực tiếp, phần tử đặt ngay ở đích. Với dấu chọn, phím, Back, đổi trục và thay đổi dữ liệu cập nhật trực tiếp. Khi resize, chuyển động dựa trên số đo cũ kết thúc ngay. Điều khiển gốc giữ vùng bấm và focus.
- Route Home, Public, Học liệu/Hồ sơ, Tương tác và Sáng tạo giữ chủ sở hữu choreography hiện tại. Học liệu và Tương tác kết thúc snapshot khi có pointer, phím, resize, đổi thiết lập giảm chuyển động hoặc chuyển sang hành trình khác. Observer chờ dữ liệu được thu hồi cùng snapshot.

## Định hướng theo màn hình

| Màn hình | Trọng tâm và chuyển động | Điểm neo ổn định |
| --- | --- | --- |
| Landing `/` | Kể chuyện theo các vùng trên trang. Ảnh bờ biển nối sang hành trình chọn vai trò | Điều hướng và thứ tự đọc |
| Chọn vai trò `/entry` | Minh họa của đúng vai trò nối với ảnh bờ biển trong form | Lựa chọn vai trò và điểm vào bằng bàn phím |
| Đăng nhập, đăng ký | Chuyển giữa các trường tương ứng theo vị trí thật. Focus vào form kết thúc snapshot | Nhãn, validation và ô đang nhập |
| Trang chủ bé `/home` | Hướng nhìn từ nhóm khám phá đang chọn. Thẻ mở hành trình từ điểm chạm | Nút điều hướng và vùng bấm của nhóm |
| Trang chủ cô `/teacher` | Thẻ công cụ mở từ thẻ đã chọn, ưu tiên nhìn thấy màn đích sớm | Điều hướng chính, nút quay lại |
| Học tập `/learning` | Dấu vị trí bám theo độ sâu hoặc khoảng cách bờ. Mục lục và sổ đọc dùng đổi trạng thái trực tiếp | Slider, chữ trên thẻ, nút nghe và ghi vào sổ |
| Khảo sát vùng, mô hình 3D | Trục sâu và camera phục vụ quan sát. Chuyển động trong cảnh thuộc renderer, có tạm dừng ở luồng khảo sát | Điều khiển kéo, zoom, xoay và dải thông tin |
| Học liệu của bé | Mở kệ theo nhóm. Giữ quan hệ ảnh từ danh sách sang trang chi tiết | Bộ lọc, tìm kiếm, vị trí cuộn khi quay lại |
| Học liệu chi tiết, thẻ, video và in | Ảnh đi từ thẻ nguồn hoặc chuyển theo thứ tự album. Trình phát, thao tác in và tải dùng điều khiển trực tiếp | Vùng ảnh, nút phát, nút in |
| Học liệu của cô | Tiêu đề đổi theo nhóm. Drawer và dialog mở theo vị trí riêng | Hàng dữ liệu, điều khiển tìm và chỉnh sửa |
| Tương tác của bé | Chọn thế giới và mở preview từ ảnh thẻ. Game có phản hồi riêng cho kéo thả, ghép và tình huống | Vùng chơi, trạng thái đúng/sai, phím thao tác |
| Tương tác của cô | Chuyển ảnh thẻ sang preview. Bảng báo cáo ưu tiên số liệu đọc ngay | Bộ lọc, bảng, chế độ preview |
| Xưởng Sáng tạo của bé | Tranh đi từ giấy vào nước. Bảng màu, quét tranh và khay vật thể có choreography riêng | Canvas, nét vẽ, điểm thả và thao tác lưu |
| Sáng tạo của cô | Giữ bảng khảo sát tĩnh. Mở biển và đưa tranh theo vị trí nguồn–đích | Tìm kiếm, báo cáo, kiểm duyệt và mã gửi |
| Hồ sơ bé | Mở như sổ ảnh. Ảnh đã chọn nối với ảnh xem lớn. Bộ lọc và dữ liệu lớp cập nhật trực tiếp | Thông tin cá nhân, trạng thái lớp và focus |
| Hồ sơ cô | Dấu dưới tab nối Tổng quan, Danh sách, Thiết lập theo trục ngang | Dữ liệu lớp, tab và ô nhập giữ vị trí thao tác |
| Kế hoạch bài giảng | Đọc và in theo bố cục tài liệu | Tiêu đề, mục tiêu, thứ tự hoạt động |
| Soạn bài | Vạch ở mép danh sách xác định hoạt động đang hiện ở khung xem trước | Hàng, khung xem, điều khiển chỉnh bài |
| Trình chiếu | Nền mở đầu tiến nhẹ. Chú thích tiến về vị trí từ phía gần sinh vật. Ghép nơi sống giữ nguyên bố cục. Thanh kết quả và biểu tượng vinh danh có nhịp riêng | Chữ, nút và điều khiển bằng remote |
| Trang chia sẻ quét tranh và chiếu biển | Chuyển động theo nguồn ảnh hoặc sinh vật trong vùng nước | Điều khiển máy ảnh, trạng thái gửi và vùng hiển thị |
| Showcase, tuyến cũ và 404 | Giữ luồng hiện có của màn tương ứng. Showcase ưu tiên đối chiếu ảnh, 404 ưu tiên đường quay lại | Ảnh tham chiếu, trạng thái lỗi và nút thoát |

## Đặc tả các chuyển động theo vị trí

| Thành phần | Kích hoạt và trạng thái đầu → cuối | Kỹ thuật và nhịp | Responsive và giảm chuyển động |
| --- | --- | --- | --- |
| Dấu vùng trên ảnh bản đồ | Chạm hoặc bấm vùng khác cùng trục. Từ dấu đang vẽ đến vị trí vùng mới | `translate` một trục, 275–490 ms theo khoảng cách, `cubic-bezier(.33,.68,.23,1)`. Lớp ảnh bờ biển đổi độ rõ trong 730 ms khi đổi trục | Đo lại trên bố cục đang hiển thị. Chọn bằng phím, kéo slider, đổi trục và Back đặt dấu ngay ở đích |
| Dấu dưới tab hồ sơ cô | Bấm tab. Từ tâm tab cũ đến tâm tab mới, màu và nội dung cập nhật ngay | WAAPI trục ngang, 275–430 ms theo khoảng cách, `cubic-bezier(.33,.68,.23,1)` | Tâm lấy từ chiều rộng tab thật. Resize hoặc giảm chuyển động kết thúc hiệu ứng |
| Nội dung tab hồ sơ cô | Tiêu đề xác nhận tab mới, danh sách học sinh chạy theo thứ tự hàng. Mặt nước, tiền cảnh và bong bóng nối qua các tab | 370–460 ms cho tiêu đề và hàng. Hàng danh sách lệch 34 ms. Mặt nước, tiền cảnh và bong bóng có nhịp riêng 800–940 ms | Mobile dùng quãng ngang ngắn hơn. Thao tác vào nội dung hoặc đổi tab kết thúc hiệu ứng đang chạy |
| Thẻ và mục hồ sơ | Nền mở quanh hình của thẻ. Sổ và học liệu tách theo hai hướng, huy hiệu xoay theo chân đế, hình thu nhỏ và mốc hành trình lần lượt hiện | 460–720 ms cho lớp hình, lệch 43 ms cho các ảnh kế tiếp. Mũi tên của nút phản hồi trong 210 ms | Chạy một lần khi thẻ vào khung hình. Đợi cảnh chuyển trang kết thúc. Tiêu đề, số liệu và nút của thẻ có sẵn ngay |
| Vào hoặc rời hồ sơ | Bàn thông tin, mặt vịnh và cụm san hô tiền cảnh được chụp riêng. Chiều rời đảo hướng | 660 ms cho nội dung (580 ms trên mobile), 900 ms cho mặt vịnh, 970 ms cho tiền cảnh. Điều hướng đứng tại chỗ | Mobile dùng trục dọc cho nội dung. Chờ form hồ sơ hoặc nội dung Tương tác tối đa 250 ms. Pointer, phím hoặc giảm chuyển động kết thúc snapshot |
| Vạch cạnh hàng soạn bài | Bấm hàng. Từ giữa hàng cũ đến giữa hàng mới, khung xem cập nhật ngay | WAAPI trục dọc, 160–270 ms, `motionTiming.settle` | Giữ trục dọc khi các cột xếp chồng. Bàn phím đặt vạch trực tiếp ở hàng đang chọn |
| Nền kể chuyện | Mở bước 1. Phóng nhẹ quanh 50% chiều ngang, 65% chiều dọc rồi ổn định | `scale(1.025)` về 1, 1080 ms, `cubic-bezier(.27,.64,.26,1)` | Mốc theo khung chiếu. Giảm chuyển động giữ ảnh nền tĩnh |
| Chú thích sinh vật | Mở bước 2. Hai cụm ở hai cạnh đi 8 px từ phía sinh vật tới vị trí đọc | `translateX`, 340 ms, `cubic-bezier(.28,.67,.24,1)` | Trục bám theo cạnh của mỗi cụm. Giảm chuyển động hiện trực tiếp |
| Thanh phiếu | Số phiếu thay đổi. Từ tỷ lệ đang vẽ tới tỷ lệ mới | `scaleX` từ mép trái, 220 ms, `cubic-bezier(.2,.75,.2,1)` | Tỷ lệ độc lập chiều rộng, chỉ thanh chuyển động. Chữ đổi ngay, giảm chuyển động bỏ transition |
| Huy hiệu trình chiếu | Mở bước vinh danh. Ánh dưới nước quét qua nền, từng huy hiệu chibi tiến lên trước vòng sáng của mình | 780 ms mỗi huy hiệu, `cubic-bezier(.28,.69,.24,1)`. Nhịp nối 85 ms theo thứ tự đọc ngang. Lớp sáng nền 1300 ms | Khi thẻ xếp dọc, bỏ độ trễ. Tên huy hiệu và số liệu đọc được ngay. Giảm chuyển động giữ hình tĩnh |

## Nhịp riêng của Học liệu và hồ sơ

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
