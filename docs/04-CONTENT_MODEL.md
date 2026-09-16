# Mô Hình Nội Dung & Kiến Trúc Dữ Liệu Bài Học

Tài liệu này định nghĩa cấu trúc dữ liệu của các bài học, quy tắc phân loại và truy xuất nguồn gốc tư liệu.

---

## 1. Thực Thể Gốc So Với Các Hình Chiếu Giáo Trình

Một nguyên tắc cốt lõi: **Chương (Chapter) và Khung chuẩn (Framework) KHÔNG ĐƯỢC làm gốc dữ liệu**:
- Nội dung chỉ tạo một lần dưới dạng **`LearningUnit`** (Bài học) và **`Experience`** (Trải nghiệm).
- **Chương (Chapter)**: Đơn giản là một Tập hợp có thứ tự (*Collection*) gồm các Unit.
- **Hành trình (Journey)**: Là một lộ trình (*Path*) chọn lọc qua các Unit.
- **Giáo án (Lesson)**: Là chuỗi trải nghiệm có thứ tự do giáo viên tự biên soạn.
- **Khung chuẩn (Framework)** (NGSS, Blue-STEM, ECE): Là siêu dữ liệu gắn thẻ (*mapping tags*) mà không chi phối cấu trúc menu của học sinh nhỏ tuổi.

---

## 2. Cấu Trúc Đơn Vị Bài Học (LearningUnit)

```typescript
export type AgeBand = 'early-childhood' | 'primary' | 'intermediate';
export type GradeBand = 'pre-k' | 'kindergarten' | 'grade-1' | 'grade-2' | 'grade-3+';
export type ReadingLevel = 'pre-reader' | 'early-reader' | 'fluent-reader';

export interface LearningUnit {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;

  // Trình độ đọc được tách rời độc lập với tuổi và khối lớp học
  ageBand: AgeBand;
  gradeBand: GradeBand;
  readingLevel: ReadingLevel;

  learningGoals: string[];
  concepts: string[];

  experienceIds: string[];
  tagIds: string[];
  frameworkMappings: FrameworkMapping[];

  heroAssetId: string;
  thumbnailUrl: string;
  colorAtmosphere: AtmospherePalette;
  estimatedTotalMinutes: number;
}
```

---

## 3. Truy Xuất Nguồn Gốc Tư Liệu (Asset Provenance)

Mọi hình ảnh, mô hình 3D, đoạn âm thanh hay vector minh họa trong dự án đều phải có nguồn gốc minh bạch:

```typescript
export type AssetType = 'image' | 'model-3d' | 'audio' | 'video' | 'vector-svg';

export interface AssetProvenance {
  id: string;
  type: AssetType;
  url: string;
  source: string;              // Ví dụ: 'NOAA Ocean Exploration', 'Phòng Thí Nghiệm Nội Bộ'
  creator?: string;
  license: string;             // Ví dụ: 'Public Domain', 'CC-BY-4.0', 'Tài sản độc quyền'
  attributionText?: string;
  isGenerated: boolean;
  generationMethod?: string;   // Ví dụ: 'Procedural Three.js Mesh', 'Tổng hợp âm thanh'
  version: string;
  altText: string;
}
```
Không để tư liệu sản xuất không rõ bản quyền hoặc không có mô tả thay thế (*alt text*).
