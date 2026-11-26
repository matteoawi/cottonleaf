"""Decode the actual final posters and previews, and assert the destination."""
from pathlib import Path
import json
import cv2

ROOT = Path(__file__).resolve().parent
expected = json.loads((ROOT / "qr-destination.json").read_text(encoding="utf-8"))["destination"]
detector = cv2.QRCodeDetector()
results = []
for path in sorted(ROOT.glob("cartello-*-300dpi.png")) + sorted(ROOT.glob("anteprima-*.png")):
    img = cv2.imread(str(path))
    for width in ([img.shape[1], 794] if img.shape[1] > 1000 else [img.shape[1]]):
        test = img if width == img.shape[1] else cv2.resize(img, (width, round(img.shape[0]*width/img.shape[1])), interpolation=cv2.INTER_AREA)
        data, corners, _ = detector.detectAndDecode(test)
        results.append({"file": path.name, "width": width, "height": test.shape[0], "decoded": data, "passed": data == expected})
(ROOT / "qr-verification.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(results, ensure_ascii=False, indent=2))
assert len(results) == 9, "Expected three print images at two sizes and three previews"
assert all(r["passed"] for r in results), "A final QR could not be decoded correctly"
