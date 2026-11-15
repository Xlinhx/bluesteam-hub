"""Add bundled Vietnamese recordings to the extracted learner pack.

Run on the extracted pack or to upgrade ocean-v3, with Piper 1.8.0, ffmpeg and the
vi_VN-vais1000-medium voice from the linked model card.
"""

import json
import argparse
from hashlib import sha256
from pathlib import Path
import re
import subprocess
import tempfile
import wave

from piper import PiperVoice, SynthesisConfig


ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = ROOT / "server/seed-data/learner-ocean.json"
MODEL_CARD = "https://huggingface.co/rhasspy/piper-voices/blob/3d796cc2f2c884b3517c527507e084f7bb245aea/vi/vi_VN/vais1000/medium/MODEL_CARD"
WELCOME_PATH = ROOT / "src/domains/learner/resources/resource-narration.json"
WORLD_INTROS = ROOT / "src/domains/learner/learning/world-intros.json"
REEF_INTRO = (
    "Bé thử tìm rạn san hô trên bản đồ nhé! Rạn san hô cũng có thể nằm trong vùng biển ven bờ. "
    "Cù Lao Chàm cách Hội An khoảng mười lăm ki lô mét. Còn Hòn Mun, ở Nha Trang, chỉ cách bờ vài ki lô mét."
)
REEF_FACTS = {
    "reef-2": "Bé nhìn kỹ nhé! San hô não sống thành tập đoàn lớn. Mặt san hô có những đường rãnh trông giống bộ não đấy!",
    "reef-3": "Bé có thấy chiếc bàn dưới biển không? San hô bàn có những phiến rộng xếp chồng lên nhau, trông giống mặt bàn.",
    "reef-4": "Bé nhìn những cành san hô kìa! Chúng tỏa ra nhiều nhánh. Cá nhỏ có thể trốn giữa các nhánh ấy.",
    "reef-8": "Bé có thấy những xúc tu không? Đó là hải quỳ, một loài động vật bám trên đá. Cá hề thường sống bên cạnh hải quỳ đấy!",
}


def split_long_sentence(text):
    return re.sub(r";\s*(\w)", lambda match: ". " + match[1].upper(), text).rstrip(".") + "."


def referenced_assets(value):
    if isinstance(value, dict):
        for field in value.values():
            yield from referenced_assets(field)
    elif isinstance(value, list):
        for entry in value:
            yield from referenced_assets(entry)
    elif isinstance(value, str) and value.startswith("/assets/learner-content/"):
        yield value


def main(model, learning_world=False):
    pack = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    if learning_world and pack["version"] not in ("ocean-v6", "ocean-v7"):
        raise ValueError("Reconcile the two workbooks before adding the learning world recordings")
    if not learning_world and pack["version"] not in ("ocean-v1", "ocean-v3"):
        raise ValueError("Narration requires the original extraction or the ocean-v3 pack")
    voice = PiperVoice.load(str(model))
    voice.session.set_providers(["CPUExecutionProvider"])
    model_hash = sha256(model.read_bytes()).hexdigest()
    if learning_world:
        if model_hash != pack["narration"]["modelSha256"]:
            raise ValueError("The voice model must match the existing pack")
        pack["version"] = "ocean-v7"
    else:
        pack["version"] = "ocean-v5"
        pack["resources"] = [entry for entry in pack["resources"] if entry["kind"] == "flashcard"]
        for row in pack["disposition"]:
            if row.get("page") and row["source"] != "flashcards" and row["status"] == "imported":
                row.update(status="excluded", reason="catalog-format-retired")
        pack["narration"] = dict(voice="Piper vi_VN-vais1000-medium", modelCard=MODEL_CARD,
                                 datasetLicense="https://creativecommons.org/licenses/by/4.0/", modelSha256=model_hash)
    legacy_config = SynthesisConfig(length_scale=1.12, noise_scale=0, noise_w_scale=0)
    child_config = SynthesisConfig(length_scale=1.18, noise_scale=0, noise_w_scale=0)

    with tempfile.TemporaryDirectory() as directory:
        sample = Path(directory) / "voice.wav"

        def clip(id, text, revision="v3"):
            url = f"/assets/learner-content/{revision}/audio/{id}.mp3"
            path = ROOT / "public" / url.lstrip("/")
            path.parent.mkdir(parents=True, exist_ok=True)
            with wave.open(str(sample), "wb") as wav_file:
                if revision == "v2":
                    voice.synthesize_wav(text, wav_file, syn_config=legacy_config)
                else:
                    sentences = re.split(r"(?<=[.!?])\s+", text)
                    for index, sentence in enumerate(sentences):
                        voice.synthesize_wav(sentence, wav_file, syn_config=child_config, set_wav_format=index == 0)
                        if index < len(sentences) - 1:
                            wav_file.writeframes(b"\x00\x00" * round(voice.config.sample_rate * 0.2))
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(sample),
                            "-map_metadata", "-1", "-af", "loudnorm=I=-17:TP=-1.5:LRA=8",
                            "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "48k", str(path)], check=True)
            data = path.read_bytes()
            if len(data) < 1200:
                raise ValueError(f"Voice did not produce a playable clip for {id}")
            pack["assets"][url] = dict(sha256=sha256(data).hexdigest(), bytes=len(data),
                                       textSha256=sha256(text.encode("utf-8")).hexdigest())
            return url

        if learning_world:
            intros = json.loads(WORLD_INTROS.read_text(encoding="utf-8"))
            for name, entry in intros.items():
                if clip(f"world-intro-{name}", entry["text"], revision="v7") != entry["audio"]:
                    raise ValueError(f"Introduction path does not match the scene: {name}")
            pack["narration"]["worldIntros"] = intros
        else:
            welcome = json.loads(WELCOME_PATH.read_text(encoding="utf-8"))
            if clip("resources-welcome", welcome["text"]) != welcome["audio"]:
                raise ValueError("Welcome narration path does not match the catalog")
            pack["narration"]["welcome"] = welcome

            for zone in pack["zones"]:
                if zone["id"] == "reef":
                    zone["spokenText"] = REEF_INTRO
                    zone["audio"] = clip("intro-reef", REEF_INTRO)
                    text = "Bé thử đoán nhé! Những bạn sống ở rạn san hô cần gì để sống khỏe?"
                    zone["inquiry"] = dict(text=text, audio=clip("reef-inquiry", text))
                elif zone["intro"] and not zone.get("audio"):
                    zone["audio"] = clip(f"intro-{zone['id']}", f"{zone['title']}. {zone['intro']}", revision="v2")
        reconciled_ids = {row["itemId"] for row in pack["disposition"]
                          if row.get("reason") == "reviewed-by-habitat-and-taxonomy"}
        for item in pack["species"]:
            if not item["facts"] or (learning_world and item.get("audio")):
                continue
            if item["zone"] != "reef" and not (learning_world and item["id"] in reconciled_ids):
                continue
            revision = "v7" if learning_world else "v3"
            item["audio"] = clip(item["id"] + "-name", item["title"], revision)
            for index, fact in enumerate(item["facts"]):
                script = REEF_FACTS.get(item["id"]) if fact["label"] == "Đặc điểm" else None
                fact["spokenText"] = script or split_long_sentence(fact["text"])
                fact["audio"] = clip(f"{item['id']}-{index}", fact["spokenText"], revision)

    used = set(referenced_assets({key: value for key, value in pack.items() if key != "assets"}))
    pack["assets"] = {url: entry for url, entry in pack["assets"].items() if url in used}
    PACK_PATH.write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print({"version": pack["version"], "audio": sum(path.endswith(".mp3") for path in pack["assets"])})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path)
    parser.add_argument("--learning-world", action="store_true")
    options = parser.parse_args()
    main(options.model, options.learning_world)
