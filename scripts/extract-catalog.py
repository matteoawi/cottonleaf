"""Extract real fabric crops from the locally prepared original scans.

The manifest below was checked against the 50 source pages and their label
strips. y coordinates refer to the top of the printed code at 4960x7015.
No fabric pixels are generated. Duplicate collection/code references are merged.
Usage: python scripts/extract-catalog.py working-directory
"""
from pathlib import Path
from collections import Counter
import colorsys
import json
import re
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw

WORK = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'tessuti'
OUT.mkdir(parents=True, exist_ok=True)
groups=[]
def G(page, column, collection, codes, y=2070, step=594, pattern='plain', prefix=''):
    groups.append(dict(page=page,column=column,collection=collection,codes=codes.split(','),y=y,step=step,pattern=pattern,prefix=prefix))

G(1,'C','Wrinkle Free','5486-1,5467-1,5466-1,5638-1,5465-1,5638-2',2040)
G(2,'L','New York','764-1,764-2,764-4,764-5',2079,pattern='texture')
G(2,'R','New York','764-6,764-7',2075,pattern='texture')
G(2,'R','Manhattan','5561-2',3263,pattern='texture')
for row,(collection,code) in enumerate([('New York','773-1'),('New York','764-1'),('Manhattan','589-1'),('Mexico','1'),('New York','764-2'),('New York','507/R-1')]):
    G(3,'L',collection,code,2011+row*594)
for row,(collection,code) in enumerate([('Manhattan','594-1'),('New York','764-5'),('New York','506/R-1'),('New York','764-4')]):
    G(3,'R',collection,code,2009+row*594)
for row,(collection,code) in enumerate([('Silver 70','1'),('Topazio D.R.','393-1'),('Acapulco','1'),('Sinai','1'),('Agasta','1'),('Prince Plus','1'),('Rubino Plus','1')]):
    G(4,'L',collection,code,2007+row*594)
for row,(collection,code) in enumerate([('Platino Satin','5491-7'),('Millenium','1'),('Topazio Dobby','392-1'),('Town','1'),('Firenze D.R.','246-1')]):
    G(4,'R',collection,code,2002+row*594,pattern='texture')
G(5,'L','Topazio Twill D.R.','1,2,3',2050,prefix='392')
G(5,'R','Topazio Dobby D.R.','1,2,3',2050,prefix='390',pattern='texture')
G(6,'C','Manhattan','1,8,3',2101,prefix='589',pattern='texture')
G(6,'C','Mexico','1,2',5068,pattern='texture')
G(7,'C','Silver 70','1,3,2,4,5',2100)
G(8,'C','New York','1,14,3,6,7,10,9',2088,prefix='773')
G(9,'C','New York','1,2N,3,7,9,23',2056,prefix='507/R',pattern='texture')
G(10,'C','Platino Special','5041-00,5041-1,5041-6',2075)
G(11,'L','Oxford Gold','1,3',2070,prefix='A081',pattern='texture')
G(11,'R','Millenium','1,2',2070,pattern='texture')
G(12,'L','Prince Plus','1,6,2,3',2065)
G(12,'R','Prince Plus','7,8,9,4,5',2065)
G(13,'C','Atene','958-3,958-20,958-6,958-16N,958-22,958-17',2048,pattern='stripes')
G(14,'C','Atene','327,105N,333,331,330,19',2060)
G(15,'L','Ios','1,2,5,3,4',2150,prefix='200',pattern='stripes')
G(15,'R','Ios','1,2,5,3,4',2150,prefix='300',pattern='stripes')
G(16,'C','Ios','1,2,6,5,3,24',2017)
G(17,'C','Atene','10,324,260,80,958-4N,320,321,200-118,104',1393,542)
G(18,'L','Platino','277-4,276-4,275-4,270-4,271-4',2065,pattern='checks')
G(18,'R','Platino','277-5,270-5,275-5,271-5,273-5,395-13',2071,pattern='checks')
G(19,'C','Topazio D.R.','386-13,396-13,386-11,387-11',2127,pattern='checks')
G(20,'C','Miami Stretch 50','346-6,341-6,347-6',2047,pattern='checks')
G(21,'L','Super Twill','496-1',2076,pattern='texture')
G(21,'L','Super Twill','336-5,497-1',2671,pattern='checks')
G(21,'R','Super Twill','496-2',2067,pattern='texture')
G(21,'R','Super Twill','336-4,497-2,497-3,336-6',2659,pattern='checks')
G(22,'C','New York','A358-3,A318-2,A358-6',2085,pattern='checks')
G(23,'L','Platino','552-3',2076)
G(23,'L','Platino','379-7,379-8,5032-5,5032-1',2673,pattern='stripes')
G(23,'R','Platino','277-2,276-2,275-2,277-3,276-3,275-3',2094,pattern='texture')
G(24,'C','Wrinkle Free','5469-4,5471-4,5469-3,5471-3',2040,pattern='checks')
G(25,'C','Platino','260-4,258-1,257-1,261-4,258-2,257-2,267-4,258-3,257-3',1444,pattern='stripes')
G(26,'L','Maldives','605-B930,605-B953,605-R940',2061,pattern='stripes')
G(26,'L','Maldives','601-B930,601-B051,601-R662',4435,584,pattern='stripes')
G(26,'R','Maldives','5370-2,5370-8,5370-4',2071,pattern='stripes')
G(26,'R','Maldives','5369-1,5369-7,5369-3',4435,592,pattern='checks')
G(27,'L','Platino','282-5,281-5,283-5,288-5,287-5',2080,pattern='stripes')
G(27,'R','Platino','292-3,260-3,261-3,267-3,263-3,268-3,395-9',2074,pattern='stripes')
G(28,'L','Wrinkle Free','5468-5,5468-1,5468-2,5468-3,5468-8,5468-4',2054,pattern='stripes')
G(28,'R','Wrinkle Free','5470-5,5470-1,5470-2,5470-3,5470-8,5470-4',2053,pattern='stripes')
G(29,'L','New York','545-6,545-14,A358-1,525-2,545-22',2145,pattern='stripes')
G(29,'R','New York','A318-1,545-9,545-10,525-8,545-25',2143,pattern='stripes')
G(30,'L','Platino','293-4,260-11,261-11,267-11,265-12,268-12,293-3,293-2',1429,pattern='stripes')
G(30,'R','Platino','260-6,261-6,267-6,265-6,263-6,268-6',1451,pattern='stripes')
G(31,'L','Super Twill','495-1',2051,pattern='texture')
G(31,'L','Super Twill','A164-1,A164-4,A164-5',2645,pattern='stripes')
G(31,'R','Super Twill','A164-3,425-2,425-3,A164-7',2044,pattern='stripes')
G(32,'L','Topazio D.R.','387-3,387-5,387-8,387-16',2037,pattern='stripes')
G(32,'R','Topazio D.R.','510-22,512-22,513-22,514-22',2034,pattern='stripes')
G(33,'C','Platino','292-2,260-2,261-2,267-2,264-2,265-2,268-2,263-2,395-3',1442,pattern='stripes')
G(34,'L','Platino Special','5043-1,5044-1,5023-1',2076,pattern='stripes')
G(34,'R','Platino Special','5043-6,5044-6,5023-2',2071,pattern='stripes')
G(35,'L','Topazio D.R.','386-3,386-4,386-5,386-8,386-16',2017,pattern='stripes')
G(35,'R','Topazio D.R.','396-3,396-4,396-5,396-8',2021,pattern='stripes')
G(36,'L','Miami Stretch 50','A333-1,346-1,346-2,346-3,346-4',1774,pattern='stripes')
G(36,'R','Miami Stretch 50','347-11,347-1,347-2,347-3,347-4',1762,pattern='stripes')
G(37,'C','Manhattan','A315-2,A315-23,A315-21',2100,pattern='stripes')
G(38,'C','Platino','260-1,261-1,267-1,260-7,261-7,267-7',2085,pattern='stripes')
G(39,'C','Denim','5635-1',1734,pattern='texture')
G(39,'C','Denim','5635-2',2655,pattern='texture')
G(39,'C','Denim','5635-3,5424-1,5424-2,5636-1',3406,594,pattern='texture')
G(40,'C','Acapulco','13,26,18,10,9,38,19',2064)
G(41,'C','Cordoba','1,3,4,5',2069,prefix='A162')
G(42,'L','Wrinkle Free','1,2,6',2152,prefix='5465',pattern='texture')
G(42,'R','Wrinkle Free','1,2,3,4,5',2152,prefix='5638',pattern='texture')
G(43,'C','Town','1,5,6,3,22,10,8,9',1837)
for row,(collection,code) in enumerate([('Platino Satin','5491-7'),('Gold Satin','5422-1'),('Gold Satin','5429-1'),('Gold Satin','5477-1'),('Platino Satin','5491-2'),('Gold Satin','5423-1'),('Platino Satin','5492-6')]):
    G(44,'C',collection,code,2065+row*593)
G(45,'C','Manhattan','1,4,3,5,27,38,7,8',2094,558,prefix='594')
G(46,'C','Firenze D.R.','1,4,2,3,6',2080,prefix='E')
G(47,'C','Topazio D.R.','1,7,2,4,5',2040,prefix='393')
G(48,'L','Firenze D.R.','1,4,6',2104,prefix='F')
G(48,'R','Firenze D.R.','1,2,11,12',2104,prefix='246')
G(49,'C','Acapulco','1,27,3,2-B,5,37',2059)
G(50,'L','Wrinkle Free','1,2,6,4,5',2095,542,prefix='5466',pattern='texture')
G(50,'R','Wrinkle Free','1,2,3,4,5,6,7,8',2092,542,prefix='5467',pattern='texture')

def colour(image):
    rgb=tuple(v/255 for v in image.resize((1,1),Image.Resampling.BOX).getpixel((0,0)))
    h,s,v=colorsys.rgb_to_hsv(*rgb)
    if v<.13: name='dark'
    elif s<.08: name='white' if v>.80 else ('dark' if v<.27 else 'neutral')
    elif h<.065 or h>.94: name='red'
    elif h>.79: name='pink' if v>.55 else 'purple'
    elif h>.70: name='purple'
    elif h>.48: name='blue' if v>.2 else 'dark'
    elif h>.18: name='green'
    else: name='neutral'
    return name, '#'+''.join(f'{round(v*255):02x}' for v in rgb), round(v,4)

def sample_box(full,left,right,y):
    x0,x1=round(full.width*left),round(full.width*right)
    lo,hi=round(y-400),round(y+650)
    pixels=np.asarray(full.crop((x0,lo,x1,hi)).convert('RGB'),dtype=np.float32)
    descriptor=np.concatenate((pixels.mean(axis=1),pixels.std(axis=1)),axis=1)
    smooth=cv2.GaussianBlur(descriptor,(1,31),0)
    delta=np.linalg.norm(smooth[40:]-smooth[:-40],axis=1)
    candidates=np.where(delta>14)[0]+20
    boundaries=[]
    for point in candidates:
        absolute=lo+int(point)
        if not boundaries or absolute-boundaries[-1]>65:
            boundaries.append(absolute)
        elif delta[point-20]>delta[max(0,boundaries[-1]-lo-20)]:
            boundaries[-1]=absolute
    target=y+60
    before=max([v+22 for v in boundaries if v<target-25]+[target-195])
    after=min([v-22 for v in boundaries if v>target+25]+[target+205])
    if after-before<100: before,after=target-35,target+65
    return (x0,round(before),x1,round(after))

records={}
audit=[]
for page in range(1,51):
    with Image.open(WORK/f'original-{page:02}.jpg') as full:
        for group in [g for g in groups if g['page']==page]:
            col=group['column']
            left,right={'L':(.13,.36),'R':(.57,.79),'C':(.38,.61)}[col]
            if page==39: left,right=.30,.58
            for index,variant in enumerate(group['codes']):
                code=(group['prefix']+'-' if group['prefix'] else '')+variant
                key=group['collection']+'|'+code
                y=group['y']+index*group['step']
                offset=155 if (page==30 and col=='R' and variant in ['265-6','263-6']) or (page==33 and variant=='260-2') else 0
                box=sample_box(full,left,right,y+offset)
                source={'page':page,'column':col,'box':list(box),'printedCode':variant,'printedPrefix':group['prefix']}
                if key in records:
                    records[key]['sources'].append(source)
                    continue
                crop=full.crop(box).convert('RGB')
                tag,hexcode,value=colour(crop)
                if (group['collection'],code) in {('Prince Plus','6'),('Gold Satin','5422-1'),('Firenze D.R.','E-4'),('Acapulco','2-B'),('Wrinkle Free','5466-5'),('Wrinkle Free','5467-5')}:
                    tag='pink'
                if (group['collection'],code) in {('Prince Plus','8'),('Atene','333'),('Ios','200-3'),('Ios','300-3'),('Platino','273-5'),('Platino','288-5'),('Platino','263-3'),('Platino','263-2'),('Platino','263-6'),('Super Twill','A164-5'),('Super Twill','A164-7'),('Topazio D.R.','510-22'),('Topazio D.R.','512-22'),('Topazio D.R.','513-22'),('Topazio D.R.','514-22')}:
                    tag='green'
                if (group['collection'],code) in {('Prince Plus','9'),('Atene','330'),('Acapulco','10'),('Platino','395-9'),('Platino','395-3'),('Ios','200-4'),('Ios','300-4')}:
                    tag='neutral'
                slug=re.sub(r'[^a-z0-9]+','-',(group['collection']+'-'+code).lower()).strip('-')
                for width in (320,960):
                    image=crop.copy()
                    if width==320:
                        patch_width=min(image.width,round(image.height*1.24))
                        x=(image.width-patch_width)//2
                        image=image.crop((x,0,x+patch_width,image.height))
                    image.thumbnail((width,960),Image.Resampling.LANCZOS)
                    image.save(OUT/f'{slug}-{width}.webp',quality=87 if width==960 else 79,method=5)
                pattern=group['pattern']
                if page==21 or (page==23 and (col=='R' or code in ['379-8','5032-1'])): pattern='checks'
                records[key]={'id':slug,'collection':group['collection'],'code':code,'color':tag,'tone':hexcode,'value':value,'pattern':pattern,'width':min(960,crop.width),'height':round(crop.height*min(960,crop.width)/crop.width),'sources':[source]}
                audit.append((slug,crop.copy().resize((150,100)),group['collection']+' '+code,page))
    print(f'Extracted page {page}/50',flush=True) if page%10==0 else None

data={'version':'1.6.0','source':json.loads((WORK/'source.json').read_text()),'fabrics':list(records.values())}
(ROOT/'fabrics.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
(ROOT/'catalog-provenance.json').write_text(json.dumps({'source':data['source'],'extractedReferences':sum(len(g['codes']) for g in groups),'uniqueFabrics':len(records),'groups':groups},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for start in range(0,len(audit),60):
    board=Image.new('RGB',(1200,1400),'#f6f2e9'); draw=ImageDraw.Draw(board)
    for j,(_,image,label,page) in enumerate(audit[start:start+60]):
        x,y=(j%6)*200,(j//6)*140
        board.paste(image,(x+10,y+5));draw.text((x+10,y+109),label,fill='black');draw.text((x+10,y+123),f'PDF {page}',fill='black')
    board.save(WORK/f'extracted-{start//60+1}.jpg',quality=90)
print(json.dumps({'unique':len(records),'references':sum(len(g['codes']) for g in groups),'colours':dict(Counter(f['color'] for f in records.values()))}))
