# Hướng dẫn mở rộng Tương tác

Tài liệu này là nguồn chuẩn khi thêm hoạt động mới vào kho Tương tác. V5 chỉ hỗ trợ nội dung làm sẵn và số liệu tổng hợp độc lập; không dùng title làm identity và không suy đoán kết quả học tập.

## Chọn phạm vi

- `kind` là bề mặt nghiệp vụ: `game`, `simulation`, `scenario`, `model3d`.
- `templateKey` là cơ chế runtime. Thêm nội dung dùng template cũ chỉ cần config, asset và snapshot; không thêm nhánh report theo UUID.
- Cơ chế mới phải có schema/validator, renderer, canonical event IDs và adapter `UsageAnalysis` trước khi xuất bản.

## Mẫu nội dung bắt buộc

1. Mục tiêu quan sát hoặc hành động.
2. Hành động người dùng và luật phản hồi.
3. ID ổn định cho item/step/scene/choice, không lấy thứ tự mảng hay title.
4. Mẫu số và giới hạn số liệu: game tính lần trả lời đầu, simulation tách visit/choice, scenario tính từng scene, model chỉ opens.
5. Lifecycle reset/preview/publish; preview không ghi usage; version cũ đọc snapshot cũ.
6. Asset, alt text, license, focal point, revision và provenance.

## Thumbnail và nền

Một content có một thumbnail canonical cùng revision. `ActivityThumbnail` chỉ đổi variant khung/crop; không bake chữ, nút hay biểu đồ vào ảnh. Artwork chung của bốn loại nằm trong `src/shared/data/interactiveArtwork.ts`; nền Tương tác dùng các layer seascape chung, không nhân bản theo page.

## Checklist file khi thêm template cũ

`server` snapshot/validator -> `src/shared/activities` runtime -> definition IDs trong `packages/contracts` -> report analysis -> thumbnail/provenance -> test ACK/dedup/version -> browser smoke preview và mobile.

Không thêm authoring, giao bài, lớp học, đánh giá cá nhân hoặc AI diagnosis nếu chưa có scope dữ liệu và quyết định riêng.

## Interactive artwork maintenance (27/10/2026)

`src/shared/data/interactiveArtwork.ts` maps explicit content IDs to a single approved rendition. All card, row and identity variants use that resolver. An unmapped ID keeps its API cover; an unavailable image falls back to the relevant kind. Do not map a mechanic name to a particular game's image.

The following v2 renditions were generated with the built-in image generator using T01 as a style reference, then resized to 959 × 600 WebP at quality 86. The focal point is `50% 50%`; each is used for card, row and identity crops.

- `activity-sorting-v2.webp`: underwater coral/grass habitat with clownfish, starfish and crab, without text, arrows or UI. SHA-256 `E3D105D907B7C7B037630849AC1C500FDD49EB5E84C40FD31A056DDE401CAD25`.
- `activity-matching-v2.webp`: spotted ray and its silhouette in an underwater scene, without text, arrows or UI. SHA-256 `F80B1AA94D5B2A674C6A68FE5DA368B2868D770222ABF4785E1E67B6FF291992`.
- `activity-choice-v2.webp`: turtle with three distinct ocean creatures, without text, tiles or UI. SHA-256 `AC924000A6B4E06F8A3A05DFCC4EEAAC966BC852F9896ED37562BBF158E2E930`.

For new content, record the canonical content ID, kind, mechanic/report profile, rendition and focal point, and supported states before adding a mapping. A new mechanic requires its contract union, renderer, server adapter, validator and test fixture; do not silently reuse sorting.
