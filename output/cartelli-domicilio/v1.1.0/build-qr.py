"""Functional website QR independent of generated artwork."""
from pathlib import Path
import json
import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parent
URL = "https://cottonleaf.it/"
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=16, border=4)
qr.add_data(URL)
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save(ROOT / "qr-sito.png")
qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(ROOT / "qr-sito.svg")
(ROOT / "qr-destination.json").write_text(json.dumps({"version":"1.1.0", "destination":URL, "quietZoneModules":4, "errorCorrection":"Q"}, indent=2) + "\n", encoding="utf-8")
print(URL)
