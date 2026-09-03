from PIL import Image
import os

SRC_DIR = "/tmp/claude-1000/-home-renato/dd2dab19-8f1d-4035-918f-95c3a8032d4d/scratchpad/team-orig"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "img")

# Coordinate stimate visivamente sull'immagine originale (768 di larghezza).
# hair_top / chin: y approssimativa in pixel di cima ai capelli e mento.
# center_x: centro orizzontale del viso.
LANDMARKS = {
    "francesca": {"file": "francesca.jpg", "hair_top": 300, "chin": 615, "center_x": 375},
    "nicola":    {"file": "nicola.jpg",    "hair_top": 70,  "chin": 405, "center_x": 350},
    "manuela":   {"file": "manuela.jpg",   "hair_top": 100, "chin": 410, "center_x": 380},
}

OUT_NAMES = {
    "francesca": "francesca-dincau",
    "nicola": "nicola-dallo",
    "manuela": "manuela-minella",
}

TARGET_W, TARGET_H = 500, 667  # 3:4
HEAD_HEIGHT_FRAC = 0.40   # (chin - hair_top) come frazione dell'altezza finale del crop
TOP_MARGIN_FRAC = 0.09    # margine sopra la cima dei capelli

for key, lm in LANDMARKS.items():
    path = os.path.join(SRC_DIR, lm["file"])
    img = Image.open(path)
    w, h = img.size

    head_h = lm["chin"] - lm["hair_top"]
    crop_h = head_h / HEAD_HEIGHT_FRAC
    crop_w = crop_h * (TARGET_W / TARGET_H)

    crop_top = lm["hair_top"] - TOP_MARGIN_FRAC * crop_h
    crop_left = lm["center_x"] - crop_w / 2

    # se il crop esce dai bordi dell'immagine, riduci proporzionalmente
    scale = min(1.0, w / crop_w, h / crop_h)
    crop_w *= scale
    crop_h *= scale
    # ricalcola top mantenendo lo stesso margine relativo sopra i capelli
    crop_top = lm["hair_top"] - TOP_MARGIN_FRAC * crop_h
    crop_left = lm["center_x"] - crop_w / 2

    crop_left = max(0, min(crop_left, w - crop_w))
    crop_top = max(0, min(crop_top, h - crop_h))

    box = (int(crop_left), int(crop_top), int(crop_left + crop_w), int(crop_top + crop_h))
    print(key, "box:", box, "orig size:", (w, h))
    cropped = img.crop(box).resize((TARGET_W, TARGET_H), Image.LANCZOS)

    out_name = OUT_NAMES[key]
    out_path = os.path.join(OUT_DIR, f"_preview_{out_name}.jpg")
    cropped.convert("RGB").save(out_path, quality=90)
    print("saved preview:", out_path)
