# Quy Chuẩn Sản Xuất & Quản Lý Asset — BlueSTEAM v2 (ASSET_SPEC.md)

Phong cách: Living Ocean (duy nhất)
Thư mục chứa Asset Production: `public/assets/ocean/`
Tệp kê khai chính thức: `production-asset-manifest.json`

---

## 1. Cấu Trúc Khai Báo Bắt Buộc Của Asset Production

Mỗi tệp tài nguyên đưa vào sản phẩm phải tuân thủ đúng quy ước định danh:
`bs-{scene}-{subject}-{role}-v01.{ext}`

Trong đó:
- `scene`: Tên cảnh hoặc màn hình sử dụng (ví dụ: `home`, `landing`, `atlas`, `turtle`, `habitat`, `rescue`).
- `subject`: Đối tượng được thể hiện (ví dụ: `greenturtle`, `coralreef`, `seagrass`, `bottle`, `mangrove`).
- `role`: Vai trò trong bố cục (`bg` - nền, `fg` - tiền cảnh, `item` - vật thể tương tác, `icon` - biểu tượng).
- `v01`: Phiên bản đánh số.

---

## 2. Phân Tầng Độ Sâu Cảnh (Scene Stacking Context Layers)

| Tầng (z-index) | Phân Loại | Vai Trò & Thuộc Tính |
|---|---|---|
| **Layer 0** | Nền xa (Far Background) | Bầu trời, chân trời biển, nền gradient đại dương tĩnh |
| **Layer 10** | Trung cảnh (Midground Terrain) | Rạn san hô xa, vách đá ngầm, thềm lục địa |
| **Layer 20** | Đối tượng tương tác / 3D Canvas | Mô hình rùa 3D, sinh vật bơi lội, chai nhựa mô phỏng |
| **Layer 30** | Tiền cảnh trang trí (Foreground) | Bọt nước lướt qua, vệt rong rêu cận cảnh (`pointer-events: none`) |
| **Layer 40** | Hotspot & Nhãn thông tin | Điểm chạm giải phẫu, nhãn tên loài, chỉ dẫn quan sát |
| **Layer 50** | Bảng công cụ & Hướng dẫn trẻ | Khay màu sỏi, nút chọn nơi sống, lời dẫn giáo viên |
| **Layer 100+** | Shell, Modal & Phản hồi hệ thống | Thanh điều hướng, hộp thoại hoàn thành, thông báo kết nối |

---

## 3. Các Ràng Buộc Nghiêm Ngặt

1. **Tuyệt đối không cắt ảnh mockup:** Không crop ảnh mockup tham chiếu tại `Downloads/ocean` làm background hay icon sản phẩm.
2. **Không chồng click lên screenshot:** Không dùng kỹ thuật screenshot làm nền rồi đặt các vùng bấm vô hình (transparent overlays) lên trên.
3. **Phân tách đối tượng rõ ràng:** Nền đại dương phải sạch sẽ, không có sẵn hình rùa; hình rùa là đối tượng tương tác/3D độc lập.
4. **Không watermark hay chữ giả:** Các asset ảnh phải sạch 100%, không chứa chữ, số, watermark hay thanh UI giả do AI tạo ra.
5. **Giấy phép minh bạch:** Chỉ sử dụng asset tự sinh từ công cụ `generate_image`, hoặc mã nguồn SVG/Canvas tự vẽ, hoặc thư viện mã nguồn mở có giấy phép phù hợp (MIT / CC0 / Apache 2.0).
