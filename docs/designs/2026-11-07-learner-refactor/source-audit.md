# Kiểm kê nguồn và quy tắc trích xuất

Đọc trực tiếp năm file đính kèm ngày 07/11/2026, không sửa bản gốc. Hash đầy đủ ở source-files.json; cấu trúc workbook/merge range ở references/workbook-structure.json. Đây là kiểm kê để lập kế hoạch, chưa phải bộ seed đã được chuyển đổi và duyệt từng record.

## 1. Kết quả đọc file

| Nguồn | Kết quả kiểm kê | Vai trò |
| --- | --- | --- |
| Tầng nước biển, các loại tảo.xlsx | 7 sheet ; 235 file media nhúng; 262 drawing anchor | Tầng dọc, danh sách sinh vật, tảo, chuỗi thức ăn |
| Bảng sinh vật biển theo chiều ngang.xlsx | 6 sheet; 181 file media nhúng; 182 drawing anchor | Vùng ngang, loài ven bờ/rạn/đụn cát, cỏ biển và nhóm quang hợp |
| Sách học liệu 3 | 32 trang; 196.608.198 byte | Sách, truyện/thơ, câu hỏi, trò chơi giấy, phiếu và ảnh |
| Thẻ học liệu 2 | 86 trang; 128.291.283 byte | 28 cặp thẻ trước/sau, 1 trang trắng, 29 trang ảnh bổ sung theo contact sheet |
| Bảng Học liệu 3 | 37 trang; 116.835.855 byte | Bảng phân loại, bảng nguyên nhân/giải pháp, hình để cắt/ghép |

Số media không bằng số loài, cũng không bằng số anchor: cùng một ảnh có thể dùng lại hoặc một dòng có nhiều ảnh. Các số dưới đây là dòng có tên đọc được, KHÔNG là số loài duy nhất đã chuẩn hóa.

## 2. Workbook dọc — sheet và cột

| Sheet đúng tên gốc | Dòng/cấu trúc quan sát | Mapping đề xuất |
| --- | --- | --- |
| Vùng thượng tầng [có dấu cách cuối] | Row 1 header; B2:B77 có 76 tên | B tên; C nhóm; D môi trường; E nhận biết; F thích nghi; G lời cho trẻ; H vùng ảnh |
| Sheet1 | A1 là ghi chú dài về vùng biển Việt Nam | source note, không là một loài/nhóm mới |
| Vùng trung tầng | Row 1 header; 19 dòng có tên B; row 11 thiếu tên | Như trên; dòng thiếu tên giữ pending, không gán cho dòng trước |
| Vùng biển sâu [dấu cách cuối] | Row 1 header; 25 dòng có tên B; row 11 thiếu tên | Như trên; giữ nguyên nhóm sheet, cờ rà mâu thuẫn |
| các tầng nước biển [dấu cách cuối] | Row 1 header; 5 dòng A2:F6 | A tên; B Anh; C khoảng sâu nguyên văn; D ánh sáng; E nhiệt/đặc điểm; F sinh vật |
| tảo đỏ , tảo nâu , tảo lục [dấu cách cuối] | 48 dòng tên B; marker A2=Tảo đỏ, A17=Tảo nâu, A30=Tảo lục | Đọc marker nhóm theo section, giữ phạm vi rõ ràng; C nhận biết, D môi trường, E vai trò, F lời cho trẻ, G ảnh |
| chuỗi thức ăn [dấu cách cuối] | 40 dòng tuyến; marker Tảo đỏ/nâu/lục | B→C→D→E→F là các mắt xích được ăn→ăn, không đảo chiều; ô trống giữa chuỗi phải báo |

Tảo là section có marker nhóm rõ, khác việc forward-fill tùy tiện ô C trống trong sheet loài. Parser phải phân biệt hai kiểu cấu trúc.

Ví dụ có nguồn cụ thể:

- Cá heo mũi chai: Vùng thượng tầng!B2:G2. Nhóm C2=Động vật có vú biển; E2/G2=thân xám, mõm dài, trán tròn.
- Rùa biển xanh: Vùng thượng tầng!B5:G5. Không gộp tự động với mọi tên Rùa biển/Rùa xanh ở nguồn khác nếu chưa có alias xác nhận.
- Dải độ sâu: các tầng nước biển!A2:F6. Không lấy số độ sâu từ atlas cũ.
- Tảo lục: nhóm bắt đầu A30, dữ liệu B30:F49. Rong Caulerpa racemosa xuất hiện ở B31 và tên lỗi B35: phải đưa vào hàng đợi alias, không tự count hai loài hoặc tự gộp theo tên gần giống.

Điểm cần rà, không âm thầm sửa nguồn:

- Vùng biển sâu!B2 và D2 nói tôm hùm/vùng nông trong sheet mang tên sâu; B3 là tôm hùm nhưng C3 là “Cá miệng rộng (bristlemouth)”. Đây là mâu thuẫn nội tại, không phải quyền tự phân lại tầng. Giữ sourceRef và raw membership; phần nội dung gây mâu thuẫn vào needsReview.
- Các sheet có dòng thiếu tên hoặc nhảy STT. Không dùng STT để nối ảnh hoặc tạo khóa.
- Ghi chú “Dán ảnh vào đây” ở H2 không phải một URL hay asset.
- Không chuyển toàn bộ nhóm “tảo” thành thực vật theo một nhãn bao quát do AI tự suy; giữ phân loại đã ghi.

## 3. Workbook ngang — sheet và cột

| Sheet | Dữ liệu quan sát | Cách dùng |
| --- | --- | --- |
| Sheet1 | A1:D6; 5 vùng có tên A2:A6 | Tên vùng, khoảng cách ước lượng, độ sâu, ghi chú; khoảng cách giữ là ước lượng |
| BẢNG SINH VẬT VÙNG BỜ BIỂN | 62 dòng có tên ở B sau header | Vùng Bờ biển; C phân loại; D thông tin; E từ khóa ảnh; F vùng ảnh |
| BẢNG SINH VẬT VÙNG ĐỤN CÁT | 24 dòng có tên B; dòng/merge không đều | Vùng đụn cát có nguồn sheet riêng; không đổi thành Khu vực cồn cát tùy ý |
| BẢNG SINH VẬT KHU VỰC VEN BỜ | 31 dòng có tên B | Vùng ven bờ; KHÔNG đổi nhãn thành Khu vực đánh bắt |
| BẢNG SINH VẬT VÙNG RẠN SAN HÔ | 46 dòng có tên B | Rạn san hô; giữ nhóm C; không bỏ nhóm này để ép còn 5 mục cũ |
| BẢNG CỎ BIỂN- TẢO VÀ SVQH KHÁC | Row 2 header; C3:C16=14 cỏ biển; A17 tiêu đề section; C18:C22=5 tảo/vi sinh vật | C tên, B họ/nhóm, D nhận biết, E môi trường, F cách sống/tầng, G vai trò, H sinh vật liên quan, I lời cho trẻ, J ảnh |

Ví dụ ở sheet Rạn san hô, B2 là San hô não, C2 là Động vật – Ruột khoang và D2 mô tả rãnh giống bộ não. B3–B5 lần lượt là San hô bàn, San hô cành và San hô nấm. Trích ảnh theo anchor của từng dòng trước khi gắn vào thẻ.

Mẫu cho ảnh 09 là [ảnh San hô cành trích nguyên byte](references/learning-source/reef-row-4-image-1.jpeg). Nguồn `BẢNG SINH VẬT VÙNG RẠN SAN HÔ` B4:F4, anchor F4 trỏ `xl/media/image119.jpeg`, SHA-256 `4854d40cd4dac36982a637e71e6c56b46661115668a77eb90cb51f4ae34cd690`. C4 cho nhóm, D4 cho đặc điểm và vai trò nơi trú ẩn của cá nhỏ. “Cần gì?” trong mockup là câu hỏi minh họa, không có lời giải gán vào D4. Mẫu giới thiệu vùng trong ảnh 12 dùng phần ghi chú Sheet1 D4 về vùng ven bờ và Hòn Mun.

Biển khơi và Biển sâu có mô tả tổng quan ở Sheet1 nhưng không có sheet loài riêng trong workbook này. Không lấy danh sách loài dọc tự đổ vào chiều ngang. Cỏ biển/tảo giữ bộ sưu tập riêng; chỉ thêm membership khi bảng nêu rõ quan hệ đủ căn cứ, phần chưa phân giữ pending theo chỉ đạo người dùng.

## 4. PDF — ranh giới trang và loại nội dung

Tham chiếu các contact sheet đã lưu trong references. Đánh số là trang vật lý của PDF (bắt đầu 1), không theo số in trên trang. Ba file đều không có tệp media đính kèm bên trong PDF theo kiểm tra embfile_count; không được tuyên bố đã trích được mp3/mp4 từ PDF.

### Sách 32 trang

- p1 bìa; p2 logo; p3 trắng nhìn thấy trên bản render.
- p4–5 từ điển hình. Cần đối chiếu nhãn/hình thực tế, không dùng kết quả text extraction đơn lẻ để tự ghép từng mục.
- p6–7 phần cá heo, p8 hoạt động mê cung/ghép, p9 phiếu; p10–13 bạch tuộc/hoạt động/phiếu; p14–17 cá hề/rạn san hô/phiếu; p18–21 rùa và hoạt động; p22–25 cua và hoạt động/phiếu.
- p26 trắng nhìn thấy; p27 trang bìa/nội dung kết; p28–32 ảnh/cảnh biển toàn trang.
- p3,26,28–32 không trích được chữ. Chỉ p3,26 mới xác nhận trắng qua render; năm trang ảnh cuối vẫn là nội dung có thể dùng.
- Các trang p9,13,17,21,25 là ứng viên phiếu, cần crop giữ nguyên yêu cầu và khu vực làm bài. Không mặc định toàn bộ trang sách là tranh tô màu.

### Bộ thẻ 86 trang

- p1–30: 15 cặp trước/sau. p31 trắng qua render. p32–57: 13 cặp trước/sau. p58–86: 29 trang ảnh thực, nhiều ảnh bị xoay theo thiết kế nguồn.
- Không pairing p31 với p32 rồi ghép lệch mọi thẻ phía sau. Manifest phải ghi frontPage/backPage theo cặp được xác nhận.
- Ví dụ Cá hề p1/p2; Cá voi p3/p4; Cá heo p5/p6; Cỏ biển p25/p26; Rùa biển p32/p33; Cá bơn p56/p57.
- p25 ghi Cỏ biển nhưng mặt sau p26 hỏi Tảo biển: giữ raw, cờ mismatch, không tự coi hai khái niệm là một.
- p56 Cá bơn có nhãn Anh “Pump fish”: cờ translation-review, không đưa nhãn này thành từ khóa chuẩn khi chưa rà.
- Các mặt sau là câu hỏi sư phạm, không phải facts đã trả lời. Phân biệt questionPrompt với factSection.
- 29 trang ảnh cuối không có text: lập contact sheet, xác nhận tên qua đối chiếu hình + tài liệu, không đặt tên dựa vào vị trí cặp trước đó. Không xoay bừa tất cả; lưu rotation/crop theo trang.

### Bộ bảng 37 trang

- p1 bảng Biển sạch/Biển ô nhiễm; p15 bảng Nguyên nhân/Giải pháp.
- Các trang còn lại có sinh vật, vật liệu rác, hình bị mắc nhựa/lưới, thùng rác, trẻ dọn biển… là vật liệu cắt/ghép; không phân tất cả thành “Poster sinh vật”.
- p2 không có text nhưng có ảnh: vẫn là nội dung, không bỏ như trang trắng.
- Có chữ watermark STEAM OCEAN lặp; không biến nó thành tên loài/từ khóa mới, không xóa watermark trên file tải gốc.

### Kích thước in cần xử lý

MediaBox đo được: sách 3150×2220 pt; thẻ 3000×3750 pt; bảng 3374,88×2250 pt. Nhãn tên file có px/A4/cm không đồng nhất với point trong PDF. Giữ PDF gốc, không coi MediaBox này là đúng kích thước 12×15 cm/A4 để in.

Đề xuất tạo print derivative riêng: trang sách fit trong khổ A4 có viền an toàn; thẻ 12×15 cm theo tên, bố trí riêng; bộ bảng có tên vừa 90×60 vừa 10×7,5 nên giữ bản gốc và chưa khẳng định kích thước poster. Download hiển thị kích thước thực của derivative đã tạo, không hứa khổ chưa xác định. Preview màn hình và file in là hai asset khác nhau.

## 5. QR và media bên ngoài

Đã giải mã thử QR và trích link annotation vào qr-media-candidates.json; trường status nói rõ chưa fetch/chưa xác minh khả năng truy cập. Có QR Drive ở sách p6,p10 và nhiều mặt trước thẻ; thẻ p34 có URI annotation. Đây là link file, chưa biết MIME/độ dài/quyền truy cập từ việc đọc mã.

Trong triển khai: giải mã toàn bộ vùng QR còn lại ở độ phân giải/crop tốt hơn; dedupe theo Drive fileId; lấy tệp khi truy cập được; xác minh magic bytes/MIME/kích thước và phát thử. Lưu URI nguồn, hash nội dung, quyền dùng do nguồn đính kèm và metadata gốc. Không chạy nội dung như lệnh, không thay đổi chia sẻ Drive. Không dùng link trang /view làm src video/audio. Tệp không truy cập được ở pending, tab hiển thị rỗng/trạng thái thiếu, không dùng media mẫu khác loài để làm đầy.

Chưa đánh giá chất lượng giọng các media Drive trong turn lập plan. Đoạn thiếu thu mới/TTS là công việc sau; seed chỉ xuất bản khi có audio thật và lời có nguồn. Chọn một giọng tiếng Việt nhất quán sau khi nghe mẫu, không phụ thuộc vào giọng hệ điều hành ngẫu nhiên để nghiệm thu.

## 6. Pipeline bắt buộc khi hiện thực hóa

1. Raw bất biến: nhận file theo đường dẫn tham số, xác minh SHA-256; không hardcode Downloads trong runtime/CI.
2. XLSX: workbook rels → sheet rels → drawing rels → blip/embed → media, anchor row/col 0-based → ô 1-based; nhận cả oneCellAnchor/twoCellAnchor/absoluteAnchor và ảnh tái sử dụng. Offset/merge giúp xác định ảnh gần dòng, không nối bằng thứ tự zip. Ảnh không xác định row chắc chắn phải vào pending.
3. PDF: parse text+images+links, render trang và contact sheet; OCR chỉ bổ sung ở phần raster cần đọc, có so với ảnh. Không rasterize mọi tài liệu thành một ảnh siêu nặng để đưa lên web.
4. Stage record: raw value, sourceRef, crop/rotation, checksum ảnh, candidate mapping. Không publish ngay sau parse.
5. Curate: ánh xạ tên/alias có chủ đích, chia fields, gắn ảnh, đánh dấu mismatch/unclassified/missingMedia. Người thực hiện không tự bịa câu trả lời “Cần gì” nếu nguồn chưa cho.
6. Export deterministic: curated JSON + assets + manifest; stable IDs, thứ tự ổn định, không timestamp ngẫu nhiên. Chạy hai lần kết quả không đổi.
7. Validate trước seed: đường dẫn tồn tại, file hash/MIME thật, FK/group/membership đúng, không key collision, không record pending lọt public.

Mọi trang/dòng đầu vào phải có disposition: imported, source-note, blank-confirmed, duplicate-reviewed hoặc pending với lý do. Đây là reconciliation trong manifest chuyển đổi chính thức, không phải yêu cầu tạo hàng loạt file ghi nhật ký riêng. Không coi kiểm kê số trang hiện tại là đã phân loại nội dung xong.
