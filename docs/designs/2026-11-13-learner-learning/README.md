# Học tập BlueSTEAM

Các ảnh đã chốt là mốc tham chiếu cho giao diện học sinh. Phần cuối ghi lại bản triển khai hiện tại.

[Bộ mockup mới cho luồng chọn nơi đến và khám phá sinh cảnh](habitat-scenes/README.md) mô tả cách chuyển từ tổng quan sang cảnh chi tiết riêng, cùng các mốc chuyển động và tiêu chí đối chiếu web.

## Bộ ảnh tham chiếu

| Ảnh | Trạng thái cần đối chiếu |
| --- | --- |
| [01 · Flycam](01-ngang-flycam.png) | Bờ biển nhìn từ trên cao, năm vùng lớn có điểm chọn trên địa hình. |
| [02 · Bãi cát](02-ngang-bai-cat.png) | Camera đã xuống Bờ biển, có giới thiệu vùng và điểm Dã tràng. |
| [03 · Vũng triều](03-ngang-vung-trieu.png) | Camera đã kéo qua tảng đá sọc. Có điểm Cua ẩn sĩ và nhóm Thân mềm. |
| [04 · Mở nhóm](04-ngang-mo-nhom.png) | Ba thẻ gợi ý tỏa ra từ điểm nhóm, có lối xem cả 17. |
| [05 · Thẻ Hàu](05-ngang-the-hau.png) | Thẻ thông tin, nút Nghe, nút đánh dấu đã học và vị trí Hàu trên đá. |
| [06 · Danh sách nhóm](06-ngang-danh-sach-nhom.png) | Sáu mục trên trang đầu, phân trang và trạng thái ĐÃ HỌC. |
| [07 · Chọn tầng](07-doc-chon-tang.png) | Camera ở mép dốc, có năm điểm chọn và nút Lặn xuống. |
| [08 · Đang lặn](08-doc-camera-dang-lan.png) | Vệt đá lùi khỏi góc nhìn khi camera đi sâu xuống. |
| [09 · Vùng nước giữa](09-doc-vung-nuoc-giua.png) | Camera tự do, có giới thiệu vùng, điểm Cá đèn và điểm nhóm Cá. |

Ảnh 03 → 04 → 05 là đường mở một sinh vật. Từ 04 có thể mở 06 để xem cả nhóm. Ảnh 06 minh họa lúc đã học Hàu. Giữ tảng đá sọc và khúc gỗ ở những khung liên quan, dùng cùng header thật giữa mọi trạng thái và nới lề dưới khay thẻ khi dựng.

## Hướng chuyển động

Đề xuất dùng cảnh toàn màn hình có lớp tiền cảnh, trung cảnh và hậu cảnh di chuyển theo cùng camera. Điểm học gắn vào tọa độ trong cảnh. Ánh sáng và chuyển động nền thay đổi theo sinh cảnh. Cấu trúc này cho phép làm camera sâu và kéo qua nhiều đoạn, đồng thời giữ khả năng tải theo vùng. Tiếp tục dùng trình quan sát 3D hiện có cho sinh vật có mô hình phù hợp.

Đề xuất mở ở flycam chiều ngang khi URL chưa chỉ đích. Link vào một tầng, nhóm hoặc thẻ mở đúng vị trí được chỉ định. Back và thao tác đóng thẻ trả về điểm vừa thao tác, kèm vị trí camera và focus tương ứng. Chọn lại Học tập từ header dùng nhịp vào trang ngắn.

| Tình huống | Chuyển động đề xuất | Tác dụng |
| --- | --- | --- |
| Mở trang trực tiếp lần đầu | Header và các nút hiện sớm. Khi ảnh nhẹ sẵn sàng, một vệt sáng lướt **trên phần nước** và làm lộ dần đường bờ trong khoảng 300–450 ms. Nếu mở link thẳng vào thẻ hoặc vùng, hiện đúng đích với chuyển nhẹ tại chỗ. | Bé nhận ra địa hình trước khi chọn. Phản hồi tải dựa trên trạng thái dữ liệu và ảnh thực tế. |
| Từ màn khác sang Học tập | Nhấn tab, trạng thái chọn cập nhật ngay. Giữ header đứng yên, chuyển phần nội dung khoảng 240–360 ms. Nếu xuất phát từ thẻ dẫn tới một vùng cụ thể, dùng hình và vị trí của thẻ đó làm điểm mở cảnh. | Nối được hành động với nơi đến. Khi vào từ Trang chủ, phần hiệu ứng của thẻ Trang chủ tiếp tục điều phối lượt chuyển. |
| Flycam xuống Bờ biển | Điểm chọn phản hồi trong 100–150 ms. Sau đó camera hạ chéo vào bãi trong khoảng 700–1.050 ms. Dốc cát và khúc gỗ dịch nhanh hơn mũi đá ở xa, tảng sọc trắng đổi góc nhìn qua các lớp. | Bé nhận ra đang xuống đúng nơi đã bấm. Các cảnh khác dùng địa hình của chính vùng đó làm mốc. |
| Đi ngang trong vùng | Kéo theo ngón tay hoặc chuột. Khi thả, camera trôi ngắn theo vận tốc và dừng ngay khi chạm lại. Các đoạn kế tiếp nối theo bờ nước, gờ đá hoặc đường cát; tải trước đoạn kề khi bé tiến gần. | Bé có thể quay lại, đi tiếp hoặc mở bất kỳ điểm nào trong vùng đã tới. |
| Chuyển xuống tầng nước | Camera nghiêng qua mép thềm, vệt đá lùi khỏi khung và ánh sáng mặt nước tắt dần. Vùng nước giữa hiện qua cá và hạt lơ lửng ở nhiều khoảng cách. Nhịp lặn dài hơn dự kiến 900–1.400 ms, có Bỏ qua ngay khi bắt đầu. | Bé cảm nhận được sự thay đổi độ sâu và biết tầng mình đang tới. |
| Mở điểm sinh vật hoặc điểm nhóm | Điểm đơn nối nhẹ từ chấm neo tới thẻ. Điểm nhóm mở ba thẻ theo một cung nhỏ, lệch nhịp khoảng 35 ms giữa các thẻ. Xem cả mở khay khoảng 200–280 ms. | Bé thấy nhóm mở từ đâu và nhận ra mình có thể xem thêm. |
| Ghi nhận học | Hiện Đang lưu khi gửi. Sau khi máy chủ xác nhận, dấu kiểm hiện trên thẻ và thẻ tương ứng trong danh sách đổi sang ĐÃ HỌC. Lỗi giữ nguyên thẻ và cho thử lại. | Tín hiệu xác nhận gắn với đúng sinh vật, dễ thấy cả khi đóng rồi mở lại nhóm. |

Chuyển động nền đi theo vật thể có sẵn trong cảnh. Bãi cát có mép bọt rút theo dốc, vũng triều có gợn sáng trên đá ngập nước, đụn cát dùng bóng nắng và một lớp cát bay thấp, vùng nước giữa có hạt trôi và cá ở các khoảng xa gần. Thẻ và chữ đứng yên khi đang đọc. Hiệu ứng nghe dùng nút chủ động và cùng bộ phát với lời giới thiệu.

Các mốc thời lượng là điểm bắt đầu để thử trên máy thật. Giữ nhịp dài cho lần đổi góc nhìn lớn, rút ngắn khi quay lại. Kéo, chạm, đổi tầng, Bỏ qua và Back có thể ngắt chuyển động đang chạy. Bật giảm chuyển động thì đi thẳng tới đích hoặc đổi độ hiện nhẹ, giữ đầy đủ điều khiển. Chuyển động nền dừng khi tab ẩn hoặc khi người dùng tạm dừng. Cùng một thao tác có thể dùng bàn phím, nút hướng hoặc danh sách điểm ở cạnh cảnh.

Khi duyệt bản chạy, so vị trí mốc địa hình và điểm học ở đầu, giữa và cuối hai cú camera chính. Thử bấm điểm khác ngay giữa chuyển cảnh, đi ngược qua ranh giới hai đoạn và quay lại sau khi mở thẻ. Nếu chưa nhận ra đang ở đâu hoặc phải chờ mới bấm tiếp được, chỉnh đường camera và thời lượng trước khi thêm hiệu ứng nền.

## Phân tuyến và học liệu

### Chiều ngang

- **Bờ biển** có thể bắt đầu ở Bãi cát, kéo qua Vũng triều rồi tới bãi đá. Một điểm nhóm tại Vũng triều có thể mở toàn nhóm Thân mềm của Bờ biển. Các thẻ mang thông tin nơi sống riêng theo nguồn.
- **Khu vực cồn cát** mở cảnh đụn cát, gắn với sheet Vùng đụn cát. Nhãn giao diện và tên gốc đều có nơi tra cứu.
- **Khu vực đánh bắt** có thuyền và phần giới thiệu riêng. Ven bờ và Rạn san hô giữ định danh, nguồn và nhóm riêng. Lối khám phá có thể bắt đầu từ mặt nước gần thuyền rồi xuống rạn, với tên đích hiện trước khi chuyển. Mục lục có lối tới từng nơi.
- **Biển khơi** và **Vùng biển sâu** có cảnh và phần giới thiệu theo workbook ngang. Dữ liệu ngang hiện có mô tả tổng quan cho hai vùng. Khi dẫn sang một tầng dọc liên quan, điểm đến phải hiện tên và trục mới.

### Chiều dọc

- **Mặt nước** và **Vùng nước nông** là hai điểm quan sát của Vùng thượng tầng trong dữ liệu. Phân vị trí theo bằng chứng nơi sống hoặc hành vi trong học liệu. Ví dụ, điểm ở mặt nước có thể diễn giải việc cá heo ngoi lên thở. Hai điểm giữ cùng tiến độ nếu dẫn tới cùng định danh sinh vật.
- **Vùng nước giữa** và **Vùng nước sâu** lần lượt dùng nội dung nguồn của Vùng trung tầng và Vùng biển sâu. Các mốc độ sâu lấy từ bảng tầng nước. Khung camera là minh họa góc nhìn, còn thước hiển thị mốc đọc từ nguồn.
- **Đáy biển** mở các đích phù hợp với Vùng vực sâu và Vùng hadal, giữ riêng đặc điểm của từng môi trường. Mỗi điểm có cảnh, giới thiệu và trạng thái danh sách tương ứng với dữ liệu.
- **Tảo, cỏ biển, sinh vật quang hợp và chuỗi thức ăn** có lối trong mục lục. Các điểm trong cảnh dẫn vào nội dung này khi nguồn nêu được liên hệ. Chuỗi thức ăn giữ đúng thứ tự mắt xích.

### Cách kiểm độ phủ hai file Excel

Tại thời điểm lập kế hoạch, hash hai file đính kèm khớp nguồn ghi trong gói dữ liệu hiện tại. Gói hiện có 275 mục sinh vật và 104 mục chuyên đề. Kiểm kê nguồn ghi 283 dòng có tên trong các sheet sinh vật theo vùng và gói hiện đánh dấu 18 mục Excel cần rà. Đây là các số theo phạm vi khác nhau. Cần đối soát theo từng dòng trước khi chốt độ phủ. [Kiểm kê nguồn hiện có](../2026-11-07-learner-refactor/source-audit.md) · [Gói dữ liệu](../../../server/seed-data/learner-ocean.json)

1. Kiểm 13 sheet, gồm cả bảng mô tả, ghi chú và chuyên đề. Mở lại dòng gốc, ô gộp và điểm neo ảnh khi parser chưa giải thích được kết quả. Mỗi dòng có nội dung phải truy được về workbook, tên sheet, số dòng và trạng thái xử lý.
2. Giữ riêng tên nguồn, tên hiển thị, nhóm, vùng, sinh cảnh, định danh sinh vật và vị trí trong cảnh. Ví dụ, Vũng triều là sinh cảnh trong Bờ biển, còn Thân mềm là nhóm. Một sinh vật có thể có nhiều điểm quan sát đã xác minh.
3. Rà tên giống nhau, tên rút gọn, thiếu nhóm, dữ liệu có mâu thuẫn và chuỗi đứt mắt xích. Lưu lý do cùng căn cứ cho từng quyết định. Ưu tiên xác minh các mục đang chờ trước khi xuất bản. Các mục chưa thể xác minh giữ được dấu vết nguồn và xuất hiện trong kết quả đối soát.
4. Với mỗi mục xuất bản, kiểm đường mở từ mục lục và từ điểm hoặc nhóm trong cảnh phù hợp. Dùng tìm kiếm, bộ lọc và phân trang để bé truy cập hết nhóm. Thẻ có ảnh và thông tin có nguồn, phần nghe đọc từ nội dung đã rà. Trạng thái ĐÃ HỌC dùng chung trên các đường mở của cùng sinh vật đã xác nhận.
5. Duyệt ảnh theo đúng loài hoặc cấp định danh mà nguồn hỗ trợ, bối cảnh, độ nét và quyền sử dụng. Ảnh thực có nguồn hoặc ảnh dựng theo tham chiếu được ghi rõ xuất xứ. Chỉ gắn một sinh vật lên nền cảnh khi vị trí và hình ảnh có căn cứ. Ảnh mockup dùng để soi bố cục, khoảng cách, điểm neo và không khí.

## Kế hoạch triển khai khi có hiệu lệnh

| Chặng | Phần làm | Điều kiện nghiệm thu |
| --- | --- | --- |
| 1 · Đối soát Excel và hợp đồng dữ liệu | Mở rộng pipeline hiện có trong `scripts/extract-learner-content.py` và gói `server/seed-data/learner-ocean.json` nếu cần. Xác định lớp ánh xạ điểm học sang vùng, nhóm hoặc sinh vật. Giữ các ID đã dùng cho tiến độ và dùng mapping rõ ràng khi xác nhận alias. | Đối soát 13 sheet, giải thích mọi dòng có nội dung, kiểm tổng theo sheet và nhóm, xác minh khả năng tra ngược từ từng mục đã xuất bản. |
| 2 · Nối điều hướng và dựng hai tuyến | Giữ `LearnerShell` và các link học tập hiện dùng. Điều phối ở `src/domains/learner/learning/`. Tách dữ liệu từng cảnh và vị trí điểm học khỏi trình vẽ. Phối hợp với `src/app/router.tsx`, `oceanNavigation.ts` và bộ chuyển cảnh hiện hành để mỗi lượt điều hướng có một chủ sở hữu. | Vào qua tab, từ Trang chủ hoặc từ link thẳng, chuyển ngang/dọc, đi tới vùng và quay lại đều đúng. Kiểm Back, reload, click nhanh, hủy khi tải chậm và trình duyệt thiếu cơ chế chuyển cảnh gốc. |
| 3 · Camera và hiệu ứng theo sinh cảnh | Dựng lớp ảnh theo cảnh, chuyển tiếp giữa các đoạn, điểm neo theo tọa độ thế giới và các đường camera chính. Dùng cơ chế hủy hiệu ứng và các mốc thời gian trong `motionScope.ts`. Tải trước mức nhẹ của cảnh kế bên theo hướng đi, ưu tiên ảnh đang thấy. | Kiểm góc flycam → bãi cát → vũng triều và mép dốc → đang lặn → vùng nước giữa theo ảnh chốt. Kéo và zoom bằng chuột, cảm ứng, bàn phím; điểm neo theo đúng vật thể. Cảnh chậm hoặc thiếu ảnh vẫn có lựa chọn, trạng thái tải và Thử lại. |
| 4 · Nhóm, thẻ, phần nghe/xem và tiến độ | Tái dùng `learnerOcean.ts`, các endpoint vùng, nhóm, mục, ghi đã học và `OceanListen`. Thêm trạng thái khay/thẻ trong cảnh với phân trang. Giữ đường dẫn quan sát cá heo và rùa 3D hiện có. Lưu tiến độ qua máy chủ theo ngữ cảnh học. | Kiểm mở điểm đơn, mở nhóm, xem đủ danh sách, nghe và xem giới thiệu, đóng thẻ về đúng góc nhìn. Đánh dấu, tải lại, chuyển ngữ cảnh học, thử lại khi lỗi và thao tác lặp cho kết quả nhất quán. |
| 5 · Kiểm dữ liệu và chạy toàn luồng | Mở rộng kiểm tra ở `tests/learner_source_pack.test.ts`, `server/test/learner-ocean.integration.test.ts` và `e2e/learner-ocean-flow.spec.ts`. Kiểm trên desktop, điện thoại hẹp, chế độ giảm chuyển động và mạng chậm. Soi mỗi màn trong 5 vùng rồi xem lại toàn ảnh theo thứ tự hành trình. | Qua `npm test`, `npm run validate:visual` với 39/39 và 0 lỗi, `npm run build`, các bài kiểm tra tích hợp và e2e liên quan. Có bằng chứng cho độ phủ, cảnh mới, điều hướng cũ và tiến độ trong Hồ sơ. |

## Bản triển khai Học tập học sinh

Tại `/learning`, mỗi chiều dùng một địa hình liên tục. Camera đi từ flycam xuống các sinh cảnh hoặc từ mặt nước xuống các tầng sâu. Trong cảnh có thể kéo, thu phóng, mở điểm học, xem nhóm và đọc thẻ. Mục lục dùng chung dữ liệu với các điểm học. Trạng thái ĐÃ HỌC được lưu theo tài khoản. [Mockup vùng nước giữa](10-doc-ban-do-lien-tuc.png)

Gói `ocean-v7` đối soát 405 dòng có nội dung từ 13 sheet, gồm 401 dòng đưa vào học liệu hoặc giới thiệu vùng, 2 ghi chú và 2 dòng đánh số giữ chỗ. Mục lục có 282 thẻ sinh vật và 105 chuyên đề, trong đó có 40 chuỗi thức ăn. [Đối soát từng dòng](../../../server/seed-data/learner-ocean-sources.json)

Phong cảnh minh họa được dựng theo bộ mockup. Ảnh thực bổ sung cho thẻ có nguồn và giấy phép hiển thị khi mở thẻ. [Nguồn ảnh bổ sung](../../../src/domains/learner/learning/world-photos.ts)
