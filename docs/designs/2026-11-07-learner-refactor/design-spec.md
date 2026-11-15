# Blue STEAM Hub — Đặc tả refactor góc học sinh

Ngày: 07/11/2026. Trạng thái: đề xuất để duyệt cùng mockup; CHƯA triển khai vào sản phẩm.

## 1. Hợp đồng đã chốt với chủ sản phẩm

- Phạm vi đợt này gồm bộ mockup tĩnh và plan bàn giao. Các mục về tương tác, seed và CI/CD là đặc tả cho lần triển khai được giao riêng.
- Excel là chuẩn tên tầng/vùng/nhóm. Quyết định mới này thay thế danh sách 5 nhãn giản lược trong yêu cầu trước. Không hỏi lại về cách chia nhóm; không tự gán phần Excel chưa phân.
- Bé tự nhập Họ tên, Trường, Năm học, Lớp. Ưu tiên form thường + gợi ý từ lịch sử đã nhập; không xây hệ quản lý trường/lớp hay bắt giáo viên cấp danh sách.
- +100 điểm một lần cho mỗi bé / mỗi chế độ / mỗi mô hình. Hai chế độ là VR và Model Inspector; xem lại không cộng nữa.
- Chủ sản phẩm cho phép thay layout/luồng hoàn toàn. Giữ khả năng và dữ liệu của web hiện tại, không giữ bố cục xấu. Nhận diện thân thiện/chibi, môi trường có ánh sáng và chiều sâu tự nhiên; ảnh học thuật từ tài liệu không được tùy tiện thay bằng hình trang trí.
- Giữ logo cá mập, tên Blue STEAM Hub, 20 avatar gần môi trường nước đã làm, trạng thái đăng nhập, chức năng giáo viên, tác phẩm và bản nháp hiện có.
- Danh sách trò chơi mới chưa được cung cấp: giữ trò chơi hiện có, không bịa danh sách mới.

## 2. Nguồn nào quyết định điều gì

| Lớp | Nguồn chuẩn | Cấm suy từ |
| --- | --- | --- |
| Phân tầng, phân vùng, phân loại, đặc điểm sinh vật | Hai Excel, sheet + ô cụ thể; xem source-audit.md | Vị trí trong ảnh mockup, tên ảnh cũ, thứ tự ZIP |
| Thẻ, trang sách, phiếu, poster và hình gốc | Ba PDF, trang vật lý 1-based + crop được xác định | Tự cắt theo trang chẵn/lẻ cho toàn bộ tài liệu |
| Bố cục, màu, ánh sáng, kích thước tương đối | Bộ mockup đang áp dụng + đặc tả này | Một ảnh nền chứa sẵn cả chữ/nút |
| Trạng thái đã học, điểm, lịch sử chơi | API tài khoản đang đăng nhập + sự kiện thật | Số minh họa trên mockup, anonymous analytics, demoStore |
| Tác phẩm cũ trên thiết bị | Kho tác phẩm/bản nháp hiện có | Nhận diện toàn bộ tác phẩm là đã đồng bộ tài khoản |

Các dòng chữ do imagegen sinh là chỉ dẫn bố cục, không là dữ liệu seed. Tên, mô tả và quan hệ phải lấy từ nguồn chuẩn. Chữ sai dấu, loài thiếu trong Excel, số demo trên ảnh đều không được chép nguyên vào DB.

## 3. Ranh giới Học liệu / Học tập / Tương tác

| Mục | Bé đến để | Nội dung chính | Trạng thái riêng |
| --- | --- | --- | --- |
| Học liệu /resources | Xem, nghe, dùng hoặc tải một tài nguyên | 8 bộ lọc định dạng, chủ đề, nhóm nguồn, chi tiết tài nguyên | Đã lưu, trang lọc, vị trí cuộn |
| Học tập /learning | Đi theo vùng/tầng, chọn nhóm rồi học một sinh vật | Hai trục khám phá, giới thiệu, danh sách sinh vật, thẻ, 3D có liên kết | Đã học, vùng/nhóm đang chọn, tiến trình |
| Tương tác /interactive | Chơi hoặc thao tác một hoạt động | 3D, Trò chơi, Mô phỏng, Tình huống | Lượt chơi thật, kết quả khi runtime có báo |

Học liệu liên quan trong thẻ Học tập mở tài nguyên có sẵn; không nhân đôi một sinh vật thành 3 bản ghi độc lập ở ba mục. Mô phỏng còn giữ thí nghiệm/quan hệ tương tác; nội dung chỉ đọc tầng biển chuyển về Học tập. Nút 3D ở Tương tác có thể tiếp tục làm lối vào thư viện mô hình; hoạt động học tích hợp từ một sinh vật thuộc Học tập.

## 4. Taxonomy và cách biểu diễn trên bản đồ

### 4.1. Chiều dọc

Nguồn: Excel Tầng nước biển, các loại tảo, sheet “các tầng nước biển ” A2:F6. Tên hiển thị trim khoảng trắng ngoài, giữ nguyên nội dung:

1. Vùng thượng tầng — Epipelagic Zone — 0–200 m.
2. Vùng trung tầng — Mesopelagic Zone — 200–1.000 m.
3. Vùng biển sâu — Bathypelagic Zone — 1.000–4.000 m.
4. Vùng vực sâu / vùng đáy biển — Abyssopelagic Zone — 4.000–6.000 m.
5. Vùng hadal — Hadalpelagic Zone — từ 6.000 m đến đáy đại dương, giữ nguyên mô tả nguồn trong dữ liệu.

Ba sheet danh sách sinh vật hiện chỉ đặt tên cho thượng tầng, trung tầng, biển sâu. Không lấy các loài ở sheet thứ ba chia tiếp sang vực sâu/hadal bằng phỏng đoán. Hai tầng thiếu danh sách vẫn mở được phần giới thiệu; vùng chọn sinh vật hiển thị “Chưa có sinh vật được phân nhóm trong tài liệu này”. Không mượn nhóm khác để làm đầy.

Không còn mảng verticalLevels viết cứng với nhãn Mặt nước/Nước nông/Nước giữa gán tuần tự vào 5 dải độ sâu. Bản đồ là sơ đồ minh họa, không theo tỉ lệ. Nắng chỉ rõ ở tầng có ánh sáng; không chiếu các tia nắng xuống hadal.

### 4.2. Chiều ngang

Nguồn tổng quan: Sheet1 A2:D6 của Excel Bảng sinh vật biển theo chiều ngang: Bờ biển, Vùng ven bờ, Rạn san hô, Biển khơi, Biển sâu.

Nguồn danh sách: các sheet BẢNG SINH VẬT VÙNG BỜ BIỂN; VÙNG ĐỤN CÁT; KHU VỰC VEN BỜ; VÙNG RẠN SAN HÔ. Vì Excel có bảng đụn cát riêng, thể hiện thêm một điểm/nhóm “Vùng đụn cát”; không ép nó thành con của vùng khác nếu nguồn không ghi quan hệ. Bản đồ mockup có sáu điểm để phản ánh hợp các vùng được nêu rõ ở hai loại sheet. Thứ tự vị trí trên cảnh minh họa là đụn cát → bờ biển → ven bờ → rạn → ngoài khơi → sâu; thứ tự dữ liệu gốc vẫn được lưu riêng.

“Khu vực đánh bắt” không còn là vùng taxonomy. Tàu/lưới có thể là lớp minh họa hoạt động con người; bật/tắt lớp này không đổi nhóm sinh vật. Biển khơi/Biển sâu chỉ có tổng quan trong workbook ngang, không có sheet loài riêng; để trống danh sách cho đến khi có nguồn phân loại.

“BẢNG CỎ BIỂN- TẢO VÀ SVQH KHÁC” là bộ sưu tập chuyên đề, không tự động tạo vùng thứ bảy. Phân nhóm đúng các tiêu đề CỎ BIỂN và TẢO VÀ VI SINH VẬT QUANG HỢP KHÁC trong sheet. Tảo đỏ/nâu/lục và chuỗi thức ăn của workbook dọc cũng giữ nhóm riêng, không tự gán tầng từ chữ “nông” trong mô tả bằng một luật regex.

### 4.3. Phân loại và định danh

- Axis → zone → group → organism là đường khám phá, không phải cây phân loại sinh học tuyệt đối.
- Lưu nguyên rawLabel/rawGroup, khóa chuẩn và sourceRef. Chỉ chuẩn hóa khoảng trắng/Unicode phục vụ tìm kiếm, không sửa nghĩa âm thầm.
- Một sinh vật có thể có nhiều membership được chứng minh bởi nguồn; một nhóm không có loài hiển thị trạng thái rỗng, không biến thành lỗi mạng.
- Không dùng STT làm ID. Excel có số thiếu/nhảy, dòng chú thích, ô gộp, tên trùng. Họ/chi/tên chung không mặc định tương đương một loài cụ thể.
- Chỉ fill ô gộp đúng merge range; ô trống không gộp không được forward-fill từ dòng trước. Record chưa phân nhóm giữ ở raw/pending, không tự thêm vào nhóm công khai.
- Một số dòng nguồn tự mâu thuẫn: lưu nguyên nhóm theo Excel và ghi cờ cần rà; không tự chuyển loài sang tầng khác. Nội dung thiếu không được viết bù như đã có nguồn.

## 5. Hệ hình ảnh và ghép cảnh

### 5.1. Token và bố cục

Học tập dùng shell chung cho bản đồ, giới thiệu vùng và mục lục. Cảnh quan sát chiếm toàn màn hình, sổ mở theo nhu cầu và viewer 3D là nhánh riêng. Học liệu, Tương tác, Sáng tạo và Hồ sơ dùng cùng khung sáng. Màu đậm dành cho hành động hoặc trạng thái được chọn, chibi tập trung ở chủ thể và rìa cảnh. Tham chiếu theo [ma trận ảnh](README.md). Khi dựng scene, tách nền, sinh vật và ánh sáng. Phần đọc dùng ảnh từ nguồn.

- Nền điều khiển/trang nội dung: trắng #FFFFFF; chữ chính navy #123F77; chữ phụ #416886; viền #BBDFF3; trạng thái chọn #E3F6FF; CTA cyan #5DCCF5 với chữ navy, hover xanh hơn. Kiểm tra tương phản thực tế; không dùng chữ trắng mảnh trên cyan sáng.
- Bản đồ nằm trong shell sáu mục gồm Trang chủ, Học liệu, Tương tác, Sáng tạo, Học tập và Hồ sơ. Cảnh lặn dùng thanh điều khiển gọn có đường quay về bản đồ và mở sổ.
- Dùng font sans đang nạp sẵn có tiếng Việt cho nav, nội dung và điều khiển. Các tiêu đề lớn bản đồ và giới thiệu vùng 02/03/12 có thể dùng token serif sẵn trong repo theo ảnh. Heading 36–44px desktop, body 18px, nhãn thao tác ≥16px. Mobile heading 28–32px, body ≥16px.
- Desktop 1440: lề trang 36–48px, khung tối đa khoảng 1368px. Nhóm trắng radius 24–28 px, tile 20 px, khoảng nội bộ 16–24 px. Khoảng giữa panel 16–24 px có cảnh biển phía dưới, không là dải trắng trống.
- Vùng bấm mục tiêu 48×48 px và sàn 44×44 CSS px, CTA chính cao khoảng 56 px. Icon chính 24 px, speaker 22–24 px. Các nhãn dài được wrap, không giảm chữ cho vừa một dòng.
- Text/card không đặt lên vùng lóa hoặc chi tiết san hô; giữ nền trắng đủ đục. Ảnh động vật/tảo vẫn được phép có màu tự nhiên, yêu cầu trắng-xanh áp dụng hệ UI.

### 5.2. Quy tắc lắp ảnh, không làm trang bằng ảnh chụp

1. Tách 4 lớp: ảnh môi trường không chữ → caustics/nắng nhẹ → cutout trang trí → UI DOM có chữ/nút thật. Thẻ sinh vật là lớp dữ liệu riêng, không dính vào nền.
2. Nền biển phủ wrapper dài của trang, không đặt một ảnh cover độc lập cho từng section rồi lặp lại mặt nước. Dùng phần đáy nối tiếp/tile biến thiên nếu trang dài; nối bằng mask mềm cùng màu nước, không blur để che mọi thứ.
3. Một nguồn sáng chính từ trên-phải xuyên qua mặt nước. Cutout mascot/san hô có highlight cùng phía, bóng tiếp xúc mềm, tỷ lệ hợp lý. Không thêm bóng CSS xám nặng cho loài đang bơi giữa nước.
4. Giữ vùng an toàn giữa cảnh để UI; san hô ở rìa và đáy, tránh che tiêu đề, nav, nút âm thanh. Ảnh cover dùng focal-point; cutout dùng contain. Không dựa đuôi .png để đoán ảnh có alpha.
5. Ảnh nhỏ/icon dùng SVG từ thư viện hoặc SVG tĩnh cùng nét; không gen bitmap cho các icon sách, loa, download, zoom. SVG do repo quản lý khác với SVG người dùng upload đang bị chặn.
6. Cắt nền chỉ cho mascot, vỏ ốc, cụm san hô trang trí cần ghép. Ưu tiên imagegen transparent background; kiểm alpha thật, viền halo trên trắng/navy. Ảnh sinh vật khoa học/PDF in giữ khung/cảnh gốc, không xóa nền hàng loạt.
7. Không lấy nguyên mockup làm background. Gen asset riêng dựa crop tham chiếu của mockup đã duyệt; UI được code thật. Lưu prompt, ảnh tham chiếu, kích thước, điểm neo, safe area, format và provenance trong manifest asset.
8. Không gen lại 20 avatar đã có. Không thay logo mới. Không đưa chữ/nav vào ảnh nền hay che đồ học tập bằng mascot.

### 5.3. Danh mục asset cần làm trong turn triển khai

| Asset đề xuất | Thực hiện | Alpha | Lắp vào | Tiêu chí |
| --- | --- | --- | --- | --- |
| learner-ocean-sunlit-wide | Trước tiên thử tái dùng ocean-sunlit.webp hiện có; gen biến thể nếu bố cục không có safe area | Không | Wrapper resources/interactive/profile/creative | Cùng hướng nắng; cảnh nối được, không lặp mặt nước |
| learner-ocean-lower-extension | Gen khi nền hiện có không đủ cho trang dài | Không | Phần kéo dài dưới scene đầu | Hai mép hòa màu với nền trên; không đường nối ngang |
| nautilus-discovery-chibi | Gen thay OceanCabinet discovery cũ, ốc xà cừ rực rỡ + mascot nếu cần | Có | Hero Học liệu bên phải | Không chữ, không cắt đứt vỏ, ánh sáng trên-phải |
| reef-edge-left/right | Tái dùng asset landing nếu hợp; nếu không gen cặp đồng bộ | Có | Rìa Tương tác, Học liệu, Hồ sơ | Không chen vào vùng thao tác, không lặp cụm thấy rõ |
| atlas-vertical-environment | Gen lại bối cảnh có 5 vùng đúng mô hình nguồn | Không | Học tập chiều dọc | Dải trên sáng, dưới tối; không nhúng tên/loài vào ảnh |
| atlas-horizontal-environment | Gen bờ/đụn/ven bờ/rạn/khơi/sâu nối tự nhiên | Không | Học tập chiều ngang | Địa hình liên tục; pin/label và loài là lớp riêng |
| encounter-environment | Gen cảnh tương ứng từng vùng đã có nội dung quan sát, lấy hướng nắng và khoảng trống từ 07 | Không | Cảnh lặn | Vùng nông có mặt nước, nắng và độ sâu. Vùng sâu có ngữ cảnh ánh sáng riêng. Chừa khung cho chuyển động của sinh vật |
| encounter-subject | Ưu tiên model đúng loài đã xác minh. Gen cutout minh họa nếu phiên bản đầu dùng lớp 2.5D | Có với cutout | Cảnh lặn | Chủ thể có silhouette riêng, ánh sáng khớp nền và animation theo kịch bản. Ảnh định danh trong sổ trích riêng từ nguồn |
| creative ocean backdrop | Tái dùng nền chung + trang trí nhỏ, chỉ gen riêng nếu cần | Tùy lớp | Sáng tạo | Giữ scan preview, tranh bé và tranh nét gốc |
| Specimen/flashcard/book/worksheet/poster | TRÍCH từ file nguồn; chỉ gen minh họa bổ sung khi thật sự thiếu và ghi rõ minh họa | Theo gốc | Nội dung và downloads | Có sheet/cell/page; ảnh đúng đối tượng |

Ngân sách mục tiêu: background desktop ≤400KB/biến thể khi đạt chất lượng, mobile ≤200KB, cutout ≤180KB, thumbnail≤80KB; đây là mục tiêu tối ưu, không hủy chi tiết tài liệu để đạt số. Dùng WebP/AVIF có fallback theo pipeline hiện tại, width/height rõ, lazy-load ngoài viewport, không preload toàn bộ thư viện hay toàn bộ PDF. Nguồn PNG/PDF gốc vẫn được giữ theo provenance.

## 6. Chi tiết màn Học liệu

Mockup 01 là trang vào. Giữ tìm kiếm và Đã lưu. Hero “Nghe · Xem · Khám phá” trên mặt trắng, ốc chibi sặc sỡ bên phải. Thanh tám định dạng nằm ngay dưới hero và trước các nhóm. Màn con có thể dùng hero thu gọn, tái dùng đúng shell và icon của 01.

| Nhãn | Icon gợi ý | Contract/filter |
| --- | --- | --- |
| Flashcards | Layers hoặc thẻ chồng | kind=flashcard, alias legacy card, mockup 01 |
| Hình ảnh | Image | kind=image, dùng khung danh sách + xem ảnh của 16 |
| Audio | AudioLines/Volume2 | kind=audio, player gọn theo 10 |
| Video | CirclePlay/Video | kind=video, dùng player video của 10, cần tệp phát thật |
| Tranh tô màu | Palette | kind=coloring, khung 16 và liên kết mẫu tô nếu có |
| Phiếu học tập | ClipboardList | kind=worksheet, mockup 16 |
| Poster | Presentation | kind=poster, khung 16 cho ảnh/tài liệu thực đã phân loại |
| Kho học liệu tải về | Download | view=downloads, facet downloadability, mockup 11 |

Overview vẫn cho thấy nhóm chính trên, preview tài nguyên nhỏ dưới giống Tương tác. Khi chọn định dạng, nội dung shelf và count phải thật sự lọc theo định dạng ấy. Ảnh mockup là thiết kế vị trí, không cấp phép bịa một flashcard nếu PDF không có loài đó. Chỉ có các kiểu thật sẵn mới có count khác 0; tab thiếu media vẫn hiện cùng empty state trung thực.

Nhóm Rạn san hô, Bờ biển, chuyên đề từ sách nằm trên panel trắng; taxonomy từ Excel và chủ đề sư phạm từ PDF là hai facet riêng. Search/group/kind/saved/download có URL state, pagination và back restoration đúng. Khi đổi filter bỏ cursor cũ, tránh response cũ ghi đè dữ liệu mới. Giữ liên kết màu → Sáng tạo, in, tải, bookmark và nhóm giáo viên tự tạo.

Chi tiết Rạn san hô theo 09 và tái dùng ResourceObservation. “Đặc điểm”, “Nơi ở”, “Cần gì?” và các phần có nguồn đều có loa riêng. Mẫu San hô cành dùng dữ liệu Excel hàng 4. Mục “Cần gì?” trong ảnh là câu hỏi nghe được. Nếu chưa có câu trả lời có nguồn, giữ nhãn câu hỏi. Nút nghe tên, nghe toàn bài và nghe từng phần không phát chồng. Nội dung do catalog quyết định số phần.

Màn 10 minh họa trình phát và danh sách bên cạnh. Hình từ Sách p6/p10 chỉ làm cover tham chiếu cho tới khi tệp media được kiểm và phát thử. “Nghe lời giới thiệu” là audio gắn với tài nguyên, dùng cùng trình phát với tab Audio. Màn 16 minh họa đọc ảnh/tài liệu cạnh danh sách. Phiếu mẫu lấy từ Sách p17/p9. Các tác vụ in, tải hoặc chuyển Sáng tạo có mặt theo loại và asset thật. Màn 11 dùng cover từ tài liệu gốc, có số trang, định dạng, dung lượng và nút Xem bản in/Tải PDF. Tải theo bộ và theo phiếu/thẻ là attachment của resource. Không nhân đôi kết quả tìm kiếm hay xóa watermark nguồn.

## 7. Học tập từ bản đồ đến sổ thám hiểm

| Ảnh | Bố cục và hành vi cần dựng |
| --- | --- |
| [02 — Chiều dọc](mockups/02-learning-map-vertical.png) | Giữ shell học sinh. Trên desktop, phần chữ sáng chiếm khoảng 35%, mặt cắt biển chiếm 65%. Chọn tầng trên thang hoặc bằng bàn phím. Điểm đánh dấu đi theo tầng đã chọn. “Vào vùng” mở phần giới thiệu. |
| [03 — Chiều ngang](mockups/03-learning-map-horizontal.png) | Giữ cùng khung chữ. Đổi sang góc nhìn từ bờ ra khơi và sáu điểm theo Excel. Rạn san hô là ví dụ đang chọn. Kéo trên dải vùng hoặc chọn từng điểm. Trên mobile dải vùng cuộn có chỉ báo còn nội dung, đồng thời dùng được bằng bàn phím. |
| [12 — Giới thiệu vùng](mockups/12-learning-zone-intro.png) | Cả hai trục dùng cùng màn. Cột đọc trắng, cảnh bên phải, điểm vùng đã chọn. Loa và Xem giới thiệu riêng. Nút Chọn nhóm sinh vật luôn tiếp cận được. Khi chỉ có ảnh, Xem giới thiệu mở ảnh có alt/caption. |
| [13 — Nhóm và loài](mockups/13-learning-species-index.png) và [17 — Mobile](mockups/17-learning-mobile-catalog.png) | Ba phần nhóm/danh sách/preview ở desktop. Mobile dùng chọn nhóm, danh sách và sheet chi tiết. Mục lục trong sổ quay về màn này với trục/vùng hiện tại. Tìm kiếm, lọc trạng thái và Tải thêm dùng dữ liệu API. |
| [07 — Quan sát](mockups/07-learning-dive.png) | Cảnh toàn màn hình. Thanh nhỏ gồm Bản đồ, tên vùng, âm, dừng và Sổ thám hiểm. Giữ chủ thể trọn khung. Câu hỏi và Quan sát nằm dưới trái, thanh Độ sâu và nút Thu phóng ở mép phải. Mobile giảm HUD, nút chạm tối thiểu 44×44 CSS px và có safe area. |
| [08 — Sổ thám hiểm](mockups/08-learning-notebook.png) | Mặt giấy sáng, cảnh còn hiện ở desktop, một cột cuộn trên mobile. Ảnh minh họa trạng thái sau khi lưu. Khi vừa phát hiện, cùng vị trí hiển thị “Ghi vào sổ”, tiếp theo là đang lưu, lỗi/thử lại hoặc “Đã học”. Mục lục và Bơi tiếp là hai hành động riêng. |
| [18 — Thẻ trước khi ghi và điểm vào 3D](mockups/18-learning-model-entry.png) | Cùng sổ với 08, ví dụ Rùa biển xanh theo Excel hàng 5. “Ghi vào sổ” và “Quan sát 3D” độc lập. Chỉ hiện lối 3D khi có model đã nối. |
| [14 — Viewer 3D](mockups/14-learning-model-inspector.png) | Khung mẫu xoay/phóng to ở trái, chọn chế độ ở phải và đường trở về thẻ. Ảnh thể hiện Inspector vừa được ghi nhận. VR là chế độ riêng. |

Hai trục cùng dùng tên vùng và nhóm đã xác định trong Excel. Vùng có mô tả nhưng thiếu danh sách vẫn cho xem phần giới thiệu đã kiểm. Hiện “Vùng này chưa có sinh vật để khám phá” và đường quay lại. Ở vùng có nội dung, mục lục hỗ trợ chọn nhóm, lọc đã học và tìm tên. “Quan sát trong vùng” đưa đến cụm có encounter. Bé có thể “Mở thẻ thông tin” trực tiếp, kể cả loài chỉ có tư liệu.

Kéo hoặc dùng phím để đổi góc nhìn. Cuộn, chụm hoặc nút +/− điều chỉnh khoảng quan sát. Thanh lặn thay đổi độ sâu trong cảnh, kèm ánh sáng và âm nền nếu đã bật. Giới hạn camera trong vùng đã dựng, nới khoảng trống quanh sinh vật khi theo dõi và chỉ hướng thật khi chủ thể ra ngoài khung. Dừng chuyển động và reduced motion có đường đọc cùng kiến thức.

Ở cảnh cá heo, đặt câu hỏi “Cá heo thở dưới nước được không?”. Bé tiến gần và giữ khoảng cách ổn định hoặc chọn “Quan sát”. Camera theo cá heo hướng lên mặt nước, sau đó mở sự kiện phát hiện. Câu “Cá heo phải ngoi lên mặt nước để thở” đối chiếu D2/F2 của sheet `Vùng thượng tầng `. Thân xám, mõm dài, trán tròn lấy từ E2/G2. Ảnh nguồn lấy theo anchor H2 đã trích. Kịch bản khác cần fact và chuyển động phù hợp với loài trước khi xuất bản. Xem [kiểm kê nguồn](source-audit.md).

Mở sổ, nghe hoặc quan sát xong giữ trạng thái chưa ghi. Bấm “Ghi vào sổ” mới gửi sự kiện lưu cho tài khoản và context hiện tại. Khi server xác nhận, cập nhật sổ, mục lục và hồ sơ. “Bơi tiếp” đóng sổ và trả đúng camera/điểm quan sát. Nếu bé từng học ở context khác, hiển thị “Đã tìm hiểu trước đây” và cho ghi nhận vào context hiện tại.

Khi mở rộng catalog, map chỉ tải tên vùng và giới thiệu nhẹ. Mỗi cảnh tải cụm đang quan sát. Mục lục tìm và phân trang qua API của vùng đã chọn, kèm group/status và key ổn định. Mở ảnh, audio, PDF, model theo nhu cầu. Chuyển cụm hủy request cũ và giải phóng texture, geometry, audio. Kiểm fixture 0/1/100/1.000/10.000 record, tìm và mở loài cuối, kiểm request đầu và bộ nhớ sau nhiều lần chuyển cụm. Giới hạn request và số chủ thể đang render là ngân sách kỹ thuật, tổng catalog tăng theo dữ liệu.

Các URL `view=zones|intro|index|expedition|organism` nằm trong router hiện có. Giữ trục/vùng/nhóm/query khi quay về. Trạng thái tải, lỗi mạng, nguồn thiếu, không có kết quả và model chưa nối có hiển thị riêng. Viewer 3D mở khi có model đã xác minh và quay lại thẻ bằng `returnTo` nội bộ. Task6/7 trong plan quy định các bước và proof runtime.

## 8. Audio và phần thưởng 3D

Audio chuẩn ưu tiên bản thu/tệp TTS đã nghe duyệt, tiếng Việt rõ và thân thiện; câu ngắn, ngắt nghỉ, dí dỏm vừa đủ. Thử 3 đoạn đại diện: tên Việt + tên khoa học, mô tả dài, hướng dẫn thao tác. Không hứa chất giọng đồng nhất bằng cách chỉ tăng pitch/rate của SpeechSynthesis hệ điều hành.

Đã có oceanAudio.playNarration(url,fallbackText). Mở rộng dùng một audio focus, trạng thái loading/playing/stopped/error, chọn giọng và locale, fallback đọc máy khi tệp lỗi. Narration của thẻ dùng metadata theo sectionId, không dùng array index làm khóa. Phát câu mới dừng câu cũ; đổi route/group/đóng dialog/đăng xuất dừng âm. Không cộng điểm hay đánh dấu đã học vì onEnd của fallback bị gọi khi không có voice.

VR phải có xác nhận phiên VR thật sự bắt đầu từ viewer/provider. Fullscreen, iframe.onload hoặc chỉ bấm icon không đủ. Model Inspector là chế độ inspection đã mở thành công khi viewer/model ready; nếu provider không có API xác nhận, cần adapter hoặc dùng bộ inspector điều khiển được, không giả callback. Thiết bị không hỗ trợ VR có hướng dẫn tiếp tục xem 3D và không cộng thưởng VR. Backend không thể chứng minh phần cứng VR từ client; mô tả đúng đây là phần thưởng tương tác dựa trên event, không phải xác thực phần cứng chống gian lận tuyệt đối.

Khóa thưởng UNIQUE(learner_id, model_id, mode) không gồm contentVersion, contextId, route hay ngày. Mỗi key delta=100 cố định do server quyết, không nhận delta từ client. Hai tab gửi đồng thời chỉ cộng một lần. Toast +100 chỉ khi response awarded=true; awarded=false hiện trạng thái đã nhận, không chạy lại animation cộng điểm. Điểm này thuộc tài khoản bé, không nhập vào point_events của phòng lớp học.

## 9. Tương tác và Sáng tạo

Mockup04: giữ bốn lối lớn và nhóm game bên dưới, nền rạn chibi 3D có nắng, mặt trắng, CTA xanh. Thêm speaker độc lập cho từng lối lớn và tên nhóm; thay icon Mô phỏng bằng SlidersHorizontal/Orbit, Tình huống bằng MessagesSquare/GitBranch, Ngôi nhà đại dương bằng House+Waves. Không bọc nút loa trong button category/card. Thao tác nghe không đổi kind hay mở hoạt động.

Chỉ chuyển nội dung atlas/tầng biển mang tính học sang /learning. Không chuyển mọi simulation hoặc xóa 3D khỏi Tương tác. Giữ đường dẫn hoạt động cũ bằng redirect/adapter có trạng thái trở lại; không duplicate trang cũ chết và trang mới. Không thay cover game do giáo viên tạo bằng bộ chibi mặc định; style backdrop là dùng chung.

Mockup05: giữ hai card scan/tô màu, card xây nơi sống và Làm tiếp. Đổi đúng intro thành “Góc sáng tạo của nhà thám hiểm nhí. Bé vẽ đại dương - Bé kể chuyện biển xanh”. Có thể tách câu 1 làm heading và câu 2 làm subtitle như ảnh. Nền hiện đại hơn, trắng-xanh, giữ bản vẽ trẻ và tranh nét in; không đổi luồng QR, scan, resume, undo, autosave, bản nháp, xuất/tải/in tác phẩm.

## 10. Thông tin cá nhân và dữ liệu thật

Mockup06. Nav ngắn “Hồ sơ” vẫn giữ để không gây xáo trộn; heading trong trang là “Thông tin cá nhân”. Họ tên là trường đầy đủ; dialog avatar vẫn dùng nhãn “Tên của bé”, dùng chung bộ 20 avatar và mapping giáo viên.

Form thường gồm 4 trường; gợi ý từ dữ liệu từng nhập trong tài khoản, không gọi danh bạ trường/lớp. Trường ≤160 ký tự, Lớp ≤80, Năm học ≤40, Họ tên ≤120 là đề xuất schema đầu vào; trim ngoài, Unicode NFC, không bỏ dấu. Năm học chấp nhận nhãn tự nhập, gợi ý năm hiện tại chứ không khóa cứng YYYY–YYYY. Escape render, không render HTML. Không yêu cầu cung cấp thêm ngày sinh/địa chỉ.

Một context có ID ổn định và 3 text Trường/Năm học/Lớp. Sửa chính tả trong context đang có không đổi ID và không mất tiến trình. “Thêm năm học/lớp khác” tạo context khác, không tự ghi đè lịch sử. Bé chọn lại context đã nhập để xem các bảng dưới; chỉ cần select/list thường, không hệ phân cấp quản trị. Context thiếu thông tin vẫn có thể tiếp tục khám phá; hồ sơ nhắc bổ sung nhẹ, không chặn Học tập.

Các khu vực tiến trình, thành tích, sinh vật đã học, game đã chơi và sản phẩm đã tạo có preview ở 06 và mở rộng theo khung 15. Mỗi danh sách có con trỏ riêng, chỉ tải tab đang mở. Số liệu lấy từ event thật theo contextId đang chọn. Tiến trình = số organismId duy nhất có học trong context / số organism đã xuất bản có thể học trong gói hiện hành. Loại trùng membership và ghi contentVersion để giải thích mẫu số thay đổi. Thời lượng chơi không xác định đã học xong.

Thành tích bản đầu dùng quy tắc có thể chứng minh như lần đầu đánh dấu đã học, nhận thưởng quan sát3D; không tự phát minh hàng chục huy hiệu. Game “đã chơi” cần runtime ready + tương tác có ý nghĩa; “hoàn thành” chỉ khi runtime báo hoàn thành. Analytics hiện tại global_anonymous không quy ngược thành bé này đã chơi.

Giữ nguyên ba bộ sưu tập local artwork: Tranh vẽ & tô màu, Tranh quét, Sa bàn/Nơi sống, cùng load-more, retry và viewer. Bổ sung context metadata cho tác phẩm tạo mới khi có tài khoản; tác phẩm cũ chưa có context nằm “Tác phẩm cũ trên thiết bị này”, không tự gán vào trường/lớp đang xem và không xóa. Scope thực tế của kho local cũ là thiết bị, có thể dùng chung nhiều tài khoản: không công bố chúng là sở hữu riêng đã được server xác nhận, không tự upload toàn bộ lịch sử thiết bị.

## 11. Responsive và trạng thái nhỏ

- 1440 desktop: 8 tab một hàng khi nhãn còn đủ rộng; ở 1024 có thể dùng 4×2. Ở 390/412 dùng 4×2 hoặc hàng trượt có dấu còn nội dung; ưu tiên 4×2 cho trẻ và đủ cả 8 mục, không cắt nhãn.
- Học tập mobile: cảnh toàn màn hình có điều khiển chạm gọn; sổ/mục lục mở theo nhu cầu và giữ camera khi quay lại. Ảnh/sinh vật không đè chữ hoặc bị cắt ở encounter. Không sidebar 400px tràn màn.
- Hồ sơ mobile form 1 cột, summary 2×2, gallery 1–2 cột; Sáng tạo hai card xếp dọc, các CTA wrap và giữ đầy đủ label.
- Các trạng thái cần làm bằng code, không cần gen mockup riêng: loading skeleton, empty-source, not-found, lỗi tải, offline/pending save, no audio, no VR, model timeout, reward already-claimed, profile chưa nhập, user mới có tiến trình 0, mất ảnh nguồn, filter không có kết quả.
- Keyboard/focus, dialog semantics, aria-pressed/selected, aria-live nhẹ khi lưu; không chỉ phân biệt màu. Reduced-motion tắt chuyển động camera/caustic liên tục; nắng có thể tĩnh.

## 12. Giới hạn của mockup và cách nghiệm thu

Bộ mockup tĩnh cung cấp bố cục và art direction. Triển khai lấy tên, ảnh sinh vật, facts và thống kê từ nguồn tương ứng. Nghiệm thu chuyển động, audio, ghi nhận đã học và VR bằng runtime riêng sau khi triển khai.

So sánh tại cùng viewport và trạng thái với bản mockup; lần lượt kiểm header → hero → menu → shelf/card → nền và ánh sáng → mobile. Overlay 50% hoặc side-by-side phát hiện sai tỷ lệ, không dùng một điểm pixel-diff toàn trang để tuyên bố giống vì ảnh nền được nén/crop khác. Sai số vị trí khối chính mục tiêu ≤16 px tại 1440 sau quy đổi ảnh, type ±2 px; card trắng, 8 mục, đúng cây dữ liệu, không seam/clip/che hit target là tiêu chí bắt buộc. Nếu lệch phải sửa và chụp lại, không tự đổi mockup để hợp với code vừa làm.
