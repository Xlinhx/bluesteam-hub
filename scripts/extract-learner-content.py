"""Build the learner source pack. Requires openpyxl, Pillow and PyMuPDF.
Pass the directory containing the five unchanged originals as the sole argument.
"""
from collections import defaultdict
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json
import sys

import openpyxl
from PIL import Image
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "server/seed-data"
ASSET_DIR = "/assets/learner-content/v1/"
PUBLIC = ROOT / "public"
SOURCE_DIR = Path(sys.argv[1])
SOURCES = json.loads((SEED / "learner-ocean-sources.json").read_text(encoding="utf-8"))
PACK = dict(version="ocean-v1", zones=[], species=[], resources=[], collections=[],
            disposition=[], assets={}, sources=SOURCES)

def cell(sheet, row, col):
    value = sheet.cell(row, col).value
    return str(value).strip() if value is not None else ""

def merged_root(sheet, row, col):
    for area in sheet.merged_cells.ranges:
        if area.min_row <= row <= area.max_row and area.min_col <= col <= area.max_col:
            return area.min_row
    return row

def record(source, status, **location):
    PACK["disposition"].append(dict(source=source, status=status, **location))

def asset(filename, contents):
    url = ASSET_DIR + filename
    output = PUBLIC / url.lstrip("/")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(contents)
    PACK["assets"][url] = dict(sha256=sha256(contents).hexdigest(), bytes=len(contents))
    return url

def images_by_row(sheet, column, reviewed_anchors=()):
    result = defaultdict(list)
    for image in sheet._images:
        anchor = getattr(image.anchor, "_from", None)
        if anchor is None or (anchor.col + 1 != column and
                              (anchor.row + 1, anchor.col + 1) not in reviewed_anchors):
            continue
        row = merged_root(sheet, anchor.row + 1, column)
        result[row].append(image)
    return result

def images_for_item(images, source_key):
    urls = []
    for index, image in enumerate(images, 1):
        with Image.open(BytesIO(image._data())) as original:
            original.thumbnail((1000, 850))
            buffer = BytesIO()
            original.convert("RGB").save(buffer, "WEBP", quality=83)
        urls.append(asset(f"species/{source_key}-{index}.webp", buffer.getvalue()))
    return urls

def facts(sheet, row, columns):
    return [dict(label=label, text=cell(sheet, row, col)) for col, label in columns
            if cell(sheet, row, col)]

def ingest_species(workbook, source, title, zone, columns, image_col, exclude=()):
    sheet = workbook[title]
    # Both pictures sit on the correct rows but start slightly left of column F.
    anchored = images_by_row(sheet, image_col, ((13, 5), (15, 5)) if zone == "reef" else ())
    for row in range(2, sheet.max_row + 1):
        name, group = cell(sheet, row, 2), cell(sheet, row, 3)
        key = f"{zone}-{row}"
        if not name or not group or row in exclude:
            reason = "source-conflict" if row in exclude else (
                "merged-continuation" if merged_root(sheet, row, 2) != row else
                "missing-name" if not name else "missing-group")
            record(source, "pending" if reason != "merged-continuation" else "imported",
                   sheet=title, row=row, reason=reason)
            continue
        last_row = next((area.max_row for area in sheet.merged_cells.ranges
                         if area.min_row == row and area.min_col == 2), row)
        entry_facts = [item for n in range(row, last_row + 1) for item in facts(sheet, n, columns)]
        images = [image for n in range(row, last_row + 1) for image in anchored[n]]
        PACK["species"].append(dict(id=key, zone=zone, group=group, title=name, facts=entry_facts,
                                    images=images_for_item(images, key),
                                    source=dict(file=source, sheet=title, row=row)))
        record(source, "imported", sheet=title, row=row)

def ingest_collection(workbook, source, prefix, sheet_name, start, name_col, group_col, image_col, columns):
    sheet = workbook[sheet_name]
    anchored = images_by_row(sheet, image_col) if image_col else {}
    marker = ""
    for row in range(start, sheet.max_row + 1):
        name = cell(sheet, row, name_col)
        group = cell(sheet, row, group_col)
        if prefix in ("algae", "food-chain"):
            marker = group or marker
            group = marker
        if not name or not group:
            record(source, "pending", sheet=sheet_name, row=row, reason="missing-name-or-group")
            continue
        key = f"{prefix}-{row}"
        entry_facts = facts(sheet, row, columns)
        if prefix == "food-chain":
            sequence = [cell(sheet, row, col) for col in range(2, 7)]
            while sequence and not sequence[-1]:
                sequence.pop()
            if not all(sequence):
                record(source, "pending", sheet=sheet_name, row=row, reason="gap-in-food-chain")
                continue
            entry_facts = [dict(label="Từ sinh vật được ăn đến sinh vật ăn", text=" → ".join(sequence))]
            name = f"Chuỗi thức ăn · {name}"
        if key in ("algae-3", "algae-35"):
            record(source, "pending", sheet=sheet_name, row=row, reason="alias-review")
            continue
        PACK["collections"].append(dict(id=key, group=group, title=name, facts=entry_facts,
                                        images=images_for_item(anchored.get(row, []), key),
                                        source=dict(file=source, sheet=sheet_name, row=row)))
        record(source, "imported", sheet=sheet_name, row=row)

def vertical(file):
    workbook = openpyxl.load_workbook(file)
    layer_sheet = next(s for s in workbook if s.title.strip() == "các tầng nước biển")
    for row, key in enumerate(("upper", "middle", "deep", "abyss", "hadal"), 2):
        PACK["zones"].append(dict(id=key, axis="vertical", title=cell(layer_sheet, row, 1),
                                  depth=cell(layer_sheet, row, 3), intro=" ".join(
                                      cell(layer_sheet, row, c) for c in (4, 5, 6)),
                                  source=dict(file="vertical-algae", sheet=layer_sheet.title, row=row)))
        record("vertical-algae", "imported", sheet=layer_sheet.title, row=row)
    for title, key in (("Vùng thượng tầng", "upper"), ("Vùng trung tầng", "middle"), ("Vùng biển sâu", "deep")):
        sheet = next(s for s in workbook if s.title.strip() == title)
        ingest_species(workbook, "vertical-algae", sheet.title, key,
                       [(7,"Dành cho bé"), (5,"Đặc điểm"), (4,"Nơi ở"), (6,"Thích nghi")], 8,
                       range(2, 6) if key == "deep" else ())
    record("vertical-algae", "source-note", sheet="Sheet1", row=1)
    algae = next(s.title for s in workbook if s.title.startswith("tảo đỏ"))
    chain = next(s.title for s in workbook if s.title.startswith("chuỗi thức ăn"))
    ingest_collection(workbook, "vertical-algae", "algae", algae, 2, 2, 1, 7,
                      [(6,"Dành cho bé"), (3,"Đặc điểm"), (4,"Nơi ở"), (5,"Vai trò")])
    ingest_collection(workbook, "vertical-algae", "food-chain", chain, 2, 2, 1, 0, [])

def horizontal(file):
    workbook = openpyxl.load_workbook(file)
    overview = workbook["Sheet1"]
    dunes = "BẢNG SINH VẬT VÙNG ĐỤN CÁT"
    for row, key in [(2, "shore"), (None, "dunes"), (3, "nearshore"),
                     (4, "reef"), (5, "offshore"), (6, "deep-sea")]:
        PACK["zones"].append(dict(id=key, axis="horizontal", title=cell(overview, row, 1) if row else "Vùng đụn cát",
                                  depth=cell(overview, row, 3) if row else "",
                                  distance=cell(overview, row, 2) if row else "",
                                  intro=cell(overview, row, 4) if row else "",
                                  source=dict(file="horizontal", sheet=overview.title if row else dunes, row=row or 1)))
        if row:
            record("horizontal", "imported", sheet=overview.title, row=row)
    for key, sheet in [("shore","BẢNG SINH VẬT VÙNG BỜ BIỂN"), ("dunes",dunes),
                       ("nearshore","BẢNG SINH VẬT KHU VỰC VEN BỜ"), ("reef","BẢNG SINH VẬT VÙNG RẠN SAN HÔ")]:
        ingest_species(workbook, "horizontal", sheet, key, [(4,"Đặc điểm")], 6)
    ingest_collection(workbook, "horizontal", "seagrass", "BẢNG CỎ BIỂN- TẢO VÀ SVQH KHÁC", 3, 3, 2, 10,
                      [(9,"Dành cho bé"), (4,"Đặc điểm"), (5,"Nơi ở"), (6,"Cách sống"),
                       (7,"Vai trò"), (8,"Sinh vật liên quan")])

PDF_TITLES = {"book": "Sách học liệu 3", "flashcards": "Thẻ học liệu 2", "boards": "Bảng Học liệu 3"}
CARD_TITLES = [
    "Cá hề", "Cá voi", "Cá heo", "Cá mập", "Cá Ngựa", "Cá đuối", "Bạch Tuộc", "Con mực", "Con hàu",
    "Bào ngư", "Con vẹm", "Rong biển", "Cỏ biển", "Con tôm", "Con cua", "Rùa biển", "Sao biển",
    "Nghêu", "Con sứa", "Cá kiếm", "Cá hồi", "Con lươn", "Cá nóc", "Cá thu", "Nhím biển", "Ốc biển",
    "Cá ngừ", "Cá bơn",
]
def ingest_pdf(key, path):
    if key != "flashcards":
        with pymupdf.open(path) as original:
            for n in range(1, len(original) + 1):
                if key == "book" and n in (3, 26):
                    record(key, "blank-confirmed", page=n, reason="blank-page")
                else:
                    record(key, "excluded", page=n, reason="catalog-format-retired")
        return
    fronts = list(range(1, 31, 2)) + list(range(32, 57, 2))
    cards = [(n, title) for n, title in zip(fronts, CARD_TITLES) if n != 25]
    card_pages = {page for n, _ in cards for page in (n, n + 1)}
    with pymupdf.open(path) as original, pymupdf.open() as derivative:
        previews = {}
        for page in original:
            n = page.number + 1
            scale = 1650 / max(page.rect.width, page.rect.height)
            pixels = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            image = Image.frombytes("RGB", (pixels.width, pixels.height), pixels.samples)
            print_image = BytesIO()
            image.save(print_image, "JPEG", quality=90, subsampling=0)
            paper = pymupdf.Rect(0, 0, 120 / 25.4 * 72, 150 / 25.4 * 72) if n <= 57 else page.rect
            printed = derivative.new_page(width=paper.width, height=paper.height)
            printed.insert_image(printed.rect, stream=print_image.getvalue())
            if n in card_pages:
                image.thumbnail((1100, 900))
                preview = BytesIO()
                image.save(preview, "WEBP", quality=84)
                previews[n] = asset(f"pdf/{key}-{n}.webp", preview.getvalue())
            if n in (25, 26):
                record(key, "pending", page=n, reason="front-back-content-mismatch")
            elif n == 31:
                record(key, "blank-confirmed", page=n, reason="blank-page")
            else:
                record(key, "imported", page=n, reason="included-in-complete-derivative")
        file = asset(f"pdf/{key}.pdf", derivative.tobytes(garbage=4, deflate=True, no_new_id=True))
        for n, title in cards:
            note = "Nhãn tiếng Anh trên nguồn đang chờ rà soát." if n == 56 else ""
            PACK["resources"].append(dict(id=f"{key}-{n}", kind="flashcard", title=title, group=PDF_TITLES[key],
                                          source=key, pages=[n, n + 1], images=[previews[n], previews[n + 1]],
                                          file=file, note=note))

def main():
    for source in SOURCES:
        file = SOURCE_DIR / source["fileName"]
        with file.open("rb") as stream:
            import hashlib
            assert hashlib.file_digest(stream, "sha256").hexdigest() == source["sha256"], file.name
    for source in SOURCES:
        key = source["key"]
        file = SOURCE_DIR / source["fileName"]
        if key == "vertical-algae":
            vertical(file)
        elif key == "horizontal":
            horizontal(file)
        else:
            ingest_pdf(key, file)
    (SEED / "learner-ocean.json").write_text(json.dumps(PACK, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print({key: len(PACK[key]) for key in ("zones", "species", "collections", "resources", "disposition", "assets")})

if __name__ == "__main__":
    main()
