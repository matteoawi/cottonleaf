"""Prepare a scan-only source PDF for local OCR and sample extraction.

Usage: python scripts/prepare-catalog.py source.pdf working-directory
The original document and OCR page images stay outside the public website.
"""
from pathlib import Path
import sys
import io
import hashlib
import json
import pymupdf
from PIL import Image, ImageDraw

source = Path(sys.argv[1])
work = Path(sys.argv[2])
work.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(source)
thumbs = []
for index, page in enumerate(doc):
    target = work / f"page-{index+1:02}.png"
    original = work / f"original-{index+1:02}.jpg"
    if not target.exists() or not original.exists():
        image = doc.extract_image(page.get_images()[0][0])
        original.write_bytes(image["image"])
        with Image.open(io.BytesIO(image["image"])) as full:
            preview = full.convert("RGB")
            preview.thumbnail((1700, 2450), Image.Resampling.LANCZOS)
            preview.save(target)
    with Image.open(target) as preview:
        thumb = preview.convert("RGB")
        thumb.thumbnail((250, 355), Image.Resampling.LANCZOS)
        labeled = Image.new("RGB", (270, 385), "#ddd6c9")
        labeled.paste(thumb, ((270-thumb.width)//2, 25))
        ImageDraw.Draw(labeled).text((10, 7), f"PDF page {index+1}", fill="black")
        thumbs.append(labeled)
    if (index+1) % 10 == 0:
        board = Image.new("RGB", (270*5, 385*2), "white")
        for j, thumb in enumerate(thumbs[-10:]):
            board.paste(thumb, ((j%5)*270, (j//5)*385))
        board.save(work / f"contact-{index//10+1}.jpg", quality=90)
        print(f"Prepared {index+1}/{len(doc)}", flush=True)
(work / "source.json").write_text(json.dumps({"source":"20261106174551.pdf", "sha256":hashlib.sha256(source.read_bytes()).hexdigest(), "pages":len(doc), "method":"Individual original scan crops; OCR derived from 1700px page previews"},indent=2),encoding="utf-8")
