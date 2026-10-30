# Motion khu Sáng tạo — cô và bé

Phạm vi đã chốt: khu Sáng tạo của giáo viên và học sinh, gồm biển chung, khảo sát tô màu, quét tranh, vẽ/tô màu và sa bàn tự do của bé. Giữ bố cục, minh họa watercolor, header và nghiệp vụ hiện có. Giáo viên chỉ có Biển chung và Tô màu; không khôi phục Xây nơi sống phía cô.

## Quyết định thiết kế

Chuyển động gồm ba lớp có nhịp riêng: bờ biển/nền, nội dung trang và vật thể tương tác. Không chạy cùng một preset trên mọi màn hình. Không chặn thao tác để chờ hiệu ứng; vẽ, kéo, chọn công cụ, lọc, lưu và nhận kết quả vẫn phản hồi trực tiếp.

- Chuyển trang: nền và nội dung có snapshot riêng; giữ header ổn định. Scan thu trọng tâm vào cửa sổ crop, drawing mở mặt giấy, habitat đặt khay xuống, report mở theo chiều đọc, review hé vùng đối chiếu. Nội dung 780–1150ms; nền 1050–1350ms. Back có hướng riêng.
- Chuyển trang mới hủy lượt cũ; pointer/keyboard ngắt snapshot để tiếp tục thao tác. Chỉ đợi vùng nội dung đúng tối đa 550ms. Trình duyệt không hỗ trợ hoặc bật reduced motion cập nhật trực tiếp.
- Một lần xuất hiện chỉ có một chủ sở hữu: trang được snapshot bao phủ không chạy lại entrance từng phần sau khi snapshot kết thúc. Các lớp mới đến do dữ liệu cũng không tạo lượt xuất hiện thứ hai. Trang mở trực tiếp vẫn có choreography riêng.
- Search, filter, poll, query draft và đổi chế độ chạy/sửa không tạo chuyển trang mới. Thao tác trực tiếp trên canvas không có entrance.

## Các ngữ cảnh

**Hub của bé:** phối tiêu đề, biển gỗ, tranh giấy, cá trên giấy, mũi tên, splash, cá dưới nước, giấy tô và phần sa bàn. Cá đi từ rectangle giấy tới rectangle vùng nước thực. Ảnh giấy mở theo mép; phần sa bàn cân theo đáy. Nhịp 900–1250ms; delay theo vị trí trong viewport, tối đa 280ms.

**Quét/gửi tranh:** lời dẫn, ảnh gốc, crop và vùng đối chiếu có vai trò riêng. Canvas kết quả chỉ chuyển động khi ảnh đã decode và vẽ xong. Hành trình nguồn–đích 700–1150ms theo khoảng cách. Chạm sửa nền, scroll, resize hoặc keyboard hủy choreography đang chờ. Giữ nguyên xác nhận phần trắng, mã biển, người vẽ, lưu và ACK gửi.

**Vẽ/tô màu:** thanh công cụ và màu có entrance khi mở trực tiếp; canvas và nét bút đứng yên. Press 100ms, phản hồi lựa chọn 130–170ms. Bảng thêm màu mở từ cạnh trên desktop 460ms, đi từ đáy trên mobile 580ms; đóng 220/280ms. Có thể đảo chiều khi mở lại giữa lúc đóng. Trả focus về nút gọi, Escape đóng, đóng xong bỏ nội dung bảng khỏi DOM. Hoàn thành chỉ nhấn icon sau khi lưu thành công.

**Sa bàn của bé:** thanh điều khiển, khay gần đây và thư viện có nhịp riêng. Thư viện desktop giữ cố định; mobile dùng sheet như bảng màu. Không làm chuyển động canvas/camera khi kéo, chọn hoặc undo. Chạy thử, dừng/tiếp tục, thêm cảnh và lưu/hoàn thành dùng trạng thái thật. Reduced motion cập nhật trực tiếp cả renderer 3D.

**Biển chung của cô:** hero, lời dẫn và hàng biển gần đây có entrance khi mở trực tiếp, không phát lại theo poll. Tranh mới trong hàng chờ mở theo cạnh 220ms; số liệu thay đổi chỉ nhấn màu 180ms. Hành trình ảnh nguồn–đích 480–780ms. Thumbnail biển cũ có ảnh không tải được giữ nền môi trường, không hiện biểu tượng ảnh vỡ và không thay dữ liệu bài.

**Mở biển:** giữ dialog giữa trang; mở vùng nhìn 520ms, đóng 340ms. Catalogue môi trường 380ms; giữ preview, tìm kiếm, chọn và phân trang hiện có. Không đổi profile modal của các phân hệ khác.

**Khảo sát tô màu:** giữ bảng và số liệu ổn định; không count-up hoặc stagger khi lọc. Xem mẫu, công cụ đã dùng, thời gian và xuất CSV giữ cơ chế hiện có.

**Biển của cô và bé:** đổi nền sau decode với hòa 850ms. Chỉ ID mới sau lần hiển thị đầu có entry 780ms; poll trùng không phát lại. Giới hạn toàn thân, caption và quãng bơi theo kích thước vùng nước thật, tối đa 40 vật thể/lượt. Dừng/chạy và reduced motion tác động ngay.

## Nền và bảo toàn

CreativeWaterlines bổ sung contour riêng cho hub/biển/bàn, wash, dòng nước, foam và frond ở mép. Nền nước 19–28 giây, rong 12–19 giây, bọt nước 16–21 giây. Không đặt lớp trang trí lên vùng thao tác. Bubble dùng transform/opacity, không cuộn background-position liên tục. Giữ ảnh đã có để bảo toàn phong cách và bố cục.

Ẩn tab dừng ambient; reduced motion tắt các lớp tự chạy và chuyển tiếp. Observer, listener, animation và chờ decode đều được thu hồi hoặc vô hiệu khi ngữ cảnh đổi. Không thêm thư viện, đổi API/schema hoặc sửa `.env`. Motion mới của bảng công cụ chỉ áp dụng trong trang Sáng tạo của bé; preview Học liệu dùng shared surface không nhận profile này.

## Nghiệm thu 31/10/2026

- `npm test`: 452/452 tests, 94 files trên checkout hiện tại.
- `npm run validate:visual`: 39/39 VERIFIED, không lỗi. Đây là kiểm tra baseline, không thay việc xem trải nghiệm.
- `npm run build`: TypeScript và Vite qua; Docker frontend thực thi lại build trước khi chạy. Cảnh báo chunk lớn và import resourceGroups có sẵn vẫn còn.
- `npx playwright test --config playwright.creative.config.ts`: 10 luồng qua trong lượt đầy đủ; bổ sung ca thumbnail lỗi và chạy lại workspace/chuyển trang sau sửa phần liên quan. Không kéo dài sang kiểm thử các phân hệ khác.
- Runtime đã kiểm: cô mở biển/tìm môi trường/duyệt/thả/ẩn/ghi chú/Back; báo cáo/lọc/CSV; bé tô màu/quét/crop/sửa/lưu/gửi; vẽ/chọn màu/Escape/trả focus; sa bàn/thêm vật thể/chạy/dừng/thêm cảnh/hoàn thành; reduced motion thay đổi khi đang mở; 40 vật thể ở 1440/390/320px; poll không lặp entry; Back không chạy entrance lần hai.
- Đã xem ảnh kết quả desktop/mobile và frame từ video runtime. Mobile sheet chụp sau khi chuyển động ổn định, không dùng ảnh giữa animation làm ảnh kết quả cuối.
- Frontend Docker rebuild tại cổng 3010; kiểm HTML/bundle mới HTTP 200 và API readiness. Không seed/reset cơ sở dữ liệu vận hành.

Video: `artifacts/creative-motion-page-journeys.webm`, `artifacts/creative-motion-workspaces.webm`, `artifacts/creative-motion-learner.webm`. Ảnh: `artifacts/creative-final-drawing-desktop.png`, `artifacts/creative-final-color-sheet.png`, `artifacts/creative-final-habitat-sheet.png`, `artifacts/creative-final-habitat-desktop.png`.

Kết luận tự nghiệm thu: hoàn tất phạm vi motion Sáng tạo cô/bé đã chốt, qua kiểm nghiệp vụ và xem lại giao diện trên Chrome desktop cùng viewport mobile. Chưa đo trên thiết bị Android/iPad vật lý; không khẳng định độ mượt trên mọi thiết bị từ kết quả trình duyệt này.