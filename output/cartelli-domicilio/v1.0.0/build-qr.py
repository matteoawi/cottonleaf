"""Generate the functional QR separately from the AI-created artwork."""
from pathlib import Path
from urllib.parse import quote_plus
import json
import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parent
MESSAGE = "Ciao Cotton Leaf, vorrei prenotare una visita gratuita a domicilio a Roma."
URL = "https://wa.me/393452357524?text=" + quote_plus(MESSAGE, safe="")
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=16, border=4)
qr.add_data(URL)
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save(ROOT / "qr-whatsapp.png")
qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(ROOT / "qr-whatsapp.svg")
(ROOT / "qr-destination.json").write_text(json.dumps({"version": "1.0.0", "destination": URL, "message": MESSAGE, "quietZoneModules": 4, "errorCorrection": "Q"}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(URL)
