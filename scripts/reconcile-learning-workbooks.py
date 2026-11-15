"""Reconcile both Excel workbooks against the current learner pack.

Pass --apply to add reviewed rows to the pack. The source files are read-only.
"""

import argparse
from collections import Counter
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

import openpyxl
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "server/seed-data/learner-ocean.json"
EXCEL_SOURCES = {"vertical-algae", "horizontal"}
SPECIES = {
    ("Vùng trung tầng", 3): ("middle-3", "middle", "Thân mềm", True),
    ("Vùng biển sâu", 2): ("deep-2", "reef", "Động vật - Chân khớp", True),
    ("Vùng biển sâu", 3): ("deep-3", "reef", "Động vật - Chân khớp", False),
    ("Vùng biển sâu", 4): ("deep-4", "reef", "Động vật - Chân khớp", True),
    ("Vùng biển sâu", 5): ("deep-5", "reef", "Động vật - Chân khớp", True),
    ("Vùng biển sâu", 6): ("deep-6", "upper", "cá", True),
    ("Vùng biển sâu", 7): ("deep-7", "middle", "Cá", True),
}
ALIASES = {
    ("Vùng biển sâu", 8): "middle-19",
    ("tảo đỏ , tảo nâu , tảo lục", 3): "algae-2",
    ("tảo đỏ , tảo nâu , tảo lục", 35): "algae-31",
}


def value(sheet, row, column):
    data = sheet.cell(row, column).value
    return str(data).strip() if data is not None else ""


def make_images(sheet, row, item_id, pack):
    urls = []
    for picture in sheet._images:
        origin = getattr(picture.anchor, "_from", None)
        if not origin or (origin.row + 1, origin.col + 1) != (row, 8):
            continue
        url = f"/assets/learner-content/v6/species/{item_id}-{len(urls) + 1}.webp"
        with Image.open(BytesIO(picture._data())) as original:
            original.thumbnail((900, 760))
            output = BytesIO()
            original.convert("RGB").save(output, "WEBP", quality=84)
        data = output.getvalue()
        path = ROOT / "public" / url.lstrip("/")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        pack["assets"][url] = {"sha256": sha256(data).hexdigest(), "bytes": len(data)}
        urls.append(url)
    return urls


def reconcile(sheet, entry, pack):
    row = entry["row"]
    key = (sheet.title.strip(), row)
    provenance = {"file": entry["source"], "sheet": sheet.title, "row": row}
    if key in SPECIES:
        item_id, zone, group, photo = SPECIES[key]
        facts = [
            {"label": label, "text": value(sheet, row, column)}
            for column, label in ((7, "Dành cho bé"), (5, "Đặc điểm"), (4, "Nơi ở"), (6, "Thích nghi"))
            if value(sheet, row, column)
        ]
        pack["species"].append({
            "id": item_id, "zone": zone, "group": group, "title": value(sheet, row, 2),
            "facts": facts, "images": make_images(sheet, row, item_id, pack) if photo else [], "source": provenance,
        })
        entry.update(status="imported", itemId=item_id, reason="reviewed-by-habitat-and-taxonomy")
    elif key in ALIASES:
        target = ALIASES[key]
        item = next(item for item in pack["species"] + pack["collections"] if item["id"] == target)
        item.setdefault("relatedSources", []).append(provenance)
        entry.update(status="imported", itemId=target, reason="confirmed-alias")
    elif key == ("chuỗi thức ăn", 11):
        raw = [value(sheet, row, column) for column in range(2, 6)]
        pack["collections"].append({
            "id": "food-chain-11", "title": "Chuỗi thức ăn · Rong sụn (thiếu mắt xích)",
            "group": "Tảo đỏ", "images": [], "source": provenance,
            "facts": [{"label": "Dữ liệu trong bảng",
                       "text": f"{raw[0]} · ô trống · {raw[2]} · {raw[3]}. Bảng thiếu mắt xích ở ô C11."}],
        })
        entry.update(status="imported", itemId="food-chain-11", reason="shown-as-incomplete")
    elif key == ("BẢNG CỎ BIỂN- TẢO VÀ SVQH KHÁC", 17):
        entry.update(status="source-note", reason="section-heading")
    elif key in {("Vùng trung tầng", 11), ("Vùng biển sâu", 11)}:
        entry.update(status="excluded", reason="number-only-no-organism")
    elif not any(value(sheet, row, column) for column in range(1, sheet.max_column + 1)):
        entry.update(status="blank-confirmed", reason="no-content")
    else:
        raise ValueError(f"Unreviewed Excel record: {provenance}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    pack = json.loads(PACK.read_text(encoding="utf-8"))
    count = 0
    pending = 0
    for source in pack["sources"]:
        if source["key"] not in EXCEL_SOURCES:
            continue
        path = args.source_dir / source["fileName"]
        if sha256(path.read_bytes()).hexdigest() != source["sha256"]:
            raise ValueError(f"Source checksum mismatch: {path.name}")
        workbook = openpyxl.load_workbook(path, data_only=True)
        entries = [entry for entry in pack["disposition"] if entry["source"] == source["key"]]
        for sheet in workbook:
            sheet_entries = {entry["row"]: entry for entry in entries if entry["sheet"] == sheet.title}
            start = 3 if sheet.title.startswith("BẢNG CỎ") else 2
            if sheet.title == "Sheet1" and source["key"] == "vertical-algae":
                start = 1
            content = {row for row, values in enumerate(sheet.values, 1)
                       if row >= start and any(val is not None and str(val).strip() for val in values)}
            if content - sheet_entries.keys():
                raise ValueError(f"Unmapped rows in {sheet.title}: {sorted(content - sheet_entries.keys())}")
            for entry in sheet_entries.values():
                if args.apply and entry["status"] == "pending":
                    reconcile(sheet, entry, pack)
            tally = Counter(sheet_entries[row]["status"] for row in content)
            count += len(content)
            pending += tally["pending"]
            print(f"{sheet.title.strip()}: {len(content)} rows, {dict(tally)}")
        workbook.close()
    print(f"{count} Excel rows with content; {pending} pending")
    if args.apply and not pending and pack["version"] == "ocean-v5":
        pack["version"] = "ocean-v6"
        PACK.write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
