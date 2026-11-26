"""Crop original-resolution label strips for accurate short fabric codes."""
from pathlib import Path
import sys
import json
from PIL import Image

work = Path(sys.argv[1])
out = work / "labels"
out.mkdir(exist_ok=True)
double = {2,3,4,5,11,12,15,18,21,23,26,27,28,29,30,31,32,34,35,36,42,48,50}
meta = {}
for page in range(1,51):
    with Image.open(work / f"original-{page:02}.jpg") as im:
        w,h=im.size
        columns = [("L",.405,.54),("R",.835,.995)] if page in double else [("C",.635,.83)]
        for col,x0,x1 in columns:
            for half,(y0,y1) in enumerate([(.185,.52),(.52,.89)]):
                name = f"page-{page:02}-{col}-{half}"
                box = tuple(map(round,(x0*w,y0*h,x1*w,y1*h)))
                crop=im.crop(box)
                # Windows OCR supports at most 2600px per edge.
                crop.thumbnail((2550,2550))
                crop.save(out / (name+".png"))
                meta[name]={"page":page,"column":col,"x":box[0],"y":box[1],"scale":(box[3]-box[1])/crop.height}
(out/"metadata.json").write_text(json.dumps(meta),encoding="utf-8")
print(f"Prepared {len(meta)} label strips",flush=True)
