import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { writeRasterProvenance } from './scripts/catalog-provenance.mjs';
const root=new URL('./',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const definitions=JSON.parse(read('atlas-i18n.json'));
const dataset=JSON.parse(read('fabrics.json'));
const materials=JSON.parse(read('catalog-materials.json')).collections;
for(const fabric of dataset.fabrics)fabric.composition=materials[fabric.collection]?.parts||null;
writeRasterProvenance(dataset,root);
const colors=['blue','white','pink','purple','green','neutral','red','dark'];
const bucketOrder=colors.flatMap(color=>dataset.fabrics.filter(f=>f.color===color).sort((a,b)=>b.value-a.value));
const buckets=colors.map(color=>bucketOrder.filter(f=>f.color===color));
const fabrics=[];
while(buckets.some(b=>b.length)) for(const bucket of buckets) if(bucket.length) fabrics.push(bucket.shift());
const collections=[...new Set(fabrics.map(f=>f.collection))].sort();
const icons={heart:'<path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',prev:'<path d="m14 5-7 7 7 7"/>',next:'<path d="m10 5 7 7-7 7"/>',compare:'<path d="M12 3v18M3 6h6v12H3zM15 6h6v12h-6z"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',fit:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',grid:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',whatsapp:'<path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L4 20.4l1.1-3.8a8.5 8.5 0 1 1 15.4-4.8Z"/><path d="M9 8.2c-.4 0-.8.6-.8 1.3 0 2.2 2.7 4.9 5 5.6.9.3 1.9-.2 2.2-.9l.2-.6-2.1-1.1-.7.9c-1.2-.5-2.1-1.4-2.7-2.6l.7-.8-.9-1.8H9Z"/>'};
const icon=(name)=>`<svg aria-hidden="true"><use href="#a-${name}"/></svg>`;

export function buildAtlas({version,releaseDate,locales}) {
 const pages=[];
 for(const [lang,locale] of Object.entries(locales)) {
  const ix=definitions.languages.indexOf(lang);
  const text=Object.fromEntries(Object.entries(definitions.strings).map(([k,v])=>[k,v[ix]]));
  const t=k=>esc(text[k]);
  const prefix=lang==='it'?'../':'../../';
  const pagePath=(code)=>`${code==='it'?'':code+'/'}tessuti/`;
  const canonical='https://cottonleaf.it/'+pagePath(lang);
  const image=(f,size)=>`${prefix}assets/tessuti/${f.id}-${size}.webp`;
  const title=text.title+' | Cotton Leaf Roma';
  const description=text.price+'. '+text.appointment;
  const languageLinks=Object.entries(locales).map(([code,l])=>`<a href="/${pagePath(code)}" lang="${l.lang}" hreflang="${l.lang}" dir="${l.dir}"${code===lang?' aria-current="page"':''}>${esc(l.name)}</a>`).join('');
  const scriptData={text,language:lang,fabrics:fabrics.map(({id,collection,code,color,pattern,tone,width,height,value,composition})=>({id,collection,code,color,pattern,tone,width,height,value,composition})),assetBase:prefix+'assets/tessuti/'};
  const structured={'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':canonical+'#webpage',url:canonical,name:title,description,inLanguage:locale.lang,isPartOf:{'@id':'https://cottonleaf.it/#website'},about:{'@type':'Thing',name:text.title},mainEntity:{'@id':canonical+'#fabrics'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Cotton Leaf',item:'https://cottonleaf.it/'+(lang==='it'?'':lang+'/')},{'@type':'ListItem',position:2,name:text.title,item:canonical}]},{'@type':'ItemList','@id':canonical+'#fabrics',numberOfItems:fabrics.length,itemListElement:fabrics.map((f,i)=>({'@type':'ListItem',position:i+1,url:canonical+'#'+f.id,name:f.collection+' · '+f.code,image:'https://cottonleaf.it/assets/tessuti/'+f.id+'-960.webp'}))}]};
  const allCards=fabrics.map((f,i)=>`<article class="fabric-card" id="${f.id}"${i>=24?' hidden':''}><button class="swatch-open" type="button" data-open="${f.id}" ><span class="fabric-image" style="--swatch:${f.tone}"><img src="${image(f,320)}" width="320" height="258" alt="" ${i<8?'fetchpriority="'+(i===0?'high':'auto')+'"':'loading="lazy"'} decoding="async"></span><span class="fabric-label"><span>${esc(f.collection)}</span> <strong dir="ltr">${esc(f.code)}</strong></span></button><button class="save-icon needs-js" data-save="${f.id}" aria-label="${t('save')} ${esc(f.collection+' '+f.code)}" aria-pressed="false">${icon('heart')}</button></article>`);
  const cards=allCards.slice(0,24).join('\n');
  const remaining=allCards.slice(24).map(card=>card.replace(' hidden','')).join('\n');
  const parked='';
  const home=lang==='it'?'/':'/'+lang+'/';
  const html=`<!doctype html>
<html lang="${locale.lang}"${locale.dir==='rtl'?' dir="rtl"':''}>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f6f2e9">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">
${Object.entries(locales).map(([code,l])=>`<link rel="alternate" hreflang="${l.lang}" href="https://cottonleaf.it/${pagePath(code)}">`).join('\n')}<link rel="alternate" hreflang="x-default" href="https://cottonleaf.it/tessuti/">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://cottonleaf.it/assets/tessuti/platino-260-4-960.webp"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${prefix}assets/cotton-leaf.svg" type="image/svg+xml"><link rel="preload" href="${prefix}assets/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="${image(fabrics[0],320)}" fetchpriority="high"><link rel="stylesheet" href="${prefix}atlas.css?v=${version}"><script src="${prefix}atlas.js?v=${version}" defer></script><script src="${prefix}language.js?v=${version}" defer></script>
<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script></head>
<body><a class="skip-link" href="#fabric-wall">${t('skip')}</a><svg class="icon-library" aria-hidden="true">${Object.entries(icons).map(([name,paths])=>`<symbol id="a-${name}" viewBox="0 0 24 24">${paths}</symbol>`).join('')}</svg>
<header class="atlas-header"><a class="wordmark" href="${home}" title="${t('home')}">Cotton Leaf <span>Roma</span></a><div class="header-actions"><a class="home-link" href="${home}">${t('home')}</a><details class="language-menu"><summary><span class="visually-hidden">${t('language')}: </span>${lang.toUpperCase()}</summary><div class="language-options">${languageLinks}</div></details><button class="saved-button needs-js" id="open-saved">${icon('heart')}<span class="saved-label">${t('saved')}</span><span id="saved-count">0</span></button></div></header>
<main><section class="atlas-intro"><h1>${t('title')}</h1><div><p>${t('intro')}</p><span class="intro-note">${t('price')}</span></div></section>
<section class="atlas-tools needs-js" aria-label="${t('search')}"><div class="filter-row"><label class="search-field">${icon('search')}<span class="visually-hidden">${t('search')}</span><input type="search" id="search" placeholder="${t('search')}" autocomplete="off"></label><label class="select-field"><span>${t('collection')}</span><select id="collection"><option value="">${t('allCollections')}</option>${collections.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label><label class="select-field"><span>${t('pattern')}</span><select id="pattern"><option value="">${t('allPatterns')}</option>${['plain','stripes','checks','texture'].map(p=>`<option value="${p}">${t(p)}</option>`).join('')}</select></label><label class="select-field sort-field"><span>${t('sort')}</span><select id="sort"><option value="explore">${t('view')}</option><option value="color">${t('sortColor')}</option><option value="collection">${t('sortCollection')}</option><option value="code">${t('sortCode')}</option></select></label></div>
<div class="color-row" role="group" aria-label="${t('color')}"><button class="color-chip" data-color="" aria-pressed="true">${t('allColors')}</button>${colors.filter(c=>fabrics.some(f=>f.color===c)).map(c=>`<button class="color-chip" data-color="${c}" aria-pressed="false"><span class="color-dot color-${c}" aria-hidden="true"></span>${t(c)}</button>`).join('')}</div>
<div class="wall-meta"><p id="result-count" role="status" aria-live="polite">${fabrics.length} ${t('fabrics')}</p><label class="saved-only"><input id="saved-only" type="checkbox">${t('savedOnly')}</label><button id="reset" class="text-button" hidden>${t('reset')}</button><div class="density-controls"><button class="icon-button" id="denser" aria-label="${t('less')}">${icon('grid')}</button><button class="icon-button" id="larger" aria-label="${t('more')}">${icon('plus')}</button></div></div></section>
<noscript><style>.fabric-card[hidden]{display:block!important}</style><p class="no-script">${t('appointment')} <a href="https://wa.me/393452357524">WhatsApp</a></p></noscript>
<section id="fabric-wall" class="fabric-wall" aria-label="${t('title')}" tabindex="-1">${cards}<noscript><style>.fabric-wall>noscript{display:contents}</style>${remaining}</noscript></section><template id="remaining-cards">${parked}</template><div class="atlas-more needs-js" id="atlas-more"><button class="button" id="load-more">${t('loadMore')}</button><span id="render-count" role="status" aria-live="polite"></span></div><div id="empty" class="empty-state" hidden><h2>${t('empty')}</h2><button class="button" data-action="reset">${t('reset')}</button></div>
<section class="atlas-appointment"><div><h2>${t('book')}</h2><p>${t('appointment')}</p></div><a class="button button-wine" href="https://wa.me/393452357524?text=${encodeURIComponent(text.message)}">${icon('whatsapp')} WhatsApp</a></section><p class="color-notice">${t('notice')}</p></main>
<footer class="atlas-footer"><a href="${home}">Cotton Leaf · Roma</a><div>Via Nomentana, 153 · Via Venti Settembre, 58D<br><a href="tel:+393452357524" dir="ltr">+39 345 235 7524</a></div><a href="${home}changelog.html">v${version}</a></footer>
<div class="compare-tray" id="compare-tray" hidden><span id="compare-count"></span><button class="button button-wine" id="open-compare">${icon('compare')} ${t('compare')}</button></div>
<dialog id="fabric-dialog" class="fabric-dialog" aria-labelledby="detail-title"><div class="dialog-top"><span id="detail-position"></span><button class="icon-button" data-close="fabric-dialog" aria-label="${t('close')}">${icon('close')}</button></div><div class="detail-layout"><div class="detail-visual"><div class="zoom-stage" id="zoom-stage"><img id="detail-image" alt="" draggable="false"></div><div class="image-controls"><button class="icon-button" id="previous" aria-label="${t('previous')}">${icon('prev')}</button><div><button class="icon-button" id="zoom-out" aria-label="${t('zoomOut')}">${icon('minus')}</button><button class="icon-button" id="fit-image" aria-label="${t('whole')}">${icon('fit')}</button><button class="icon-button" id="zoom-in" aria-label="${t('zoomIn')}">${icon('plus')}</button></div><button class="icon-button" id="next" aria-label="${t('next')}">${icon('next')}</button></div><p class="zoom-hint">${t('zoomHint')}</p></div><div class="detail-info"><p class="detail-collection" id="detail-collection"></p><h2 id="detail-title" dir="ltr"></h2><dl><div><dt>${t('color')}</dt><dd id="detail-color"></dd></div><div><dt>${t('pattern')}</dt><dd id="detail-pattern"></dd></div><div id="composition-row" class="composition-row" hidden><dt>${t('composition')}</dt><dd id="detail-composition"></dd></div></dl><div class="detail-actions"><button class="button" id="detail-save">${icon('heart')}<span></span></button><button class="text-button" id="detail-compare"></button></div><a class="button button-wine" id="detail-book">${icon('whatsapp')}${t('bookOne')}</a><p class="detail-appointment">${t('appointment')}</p><p class="detail-notice">${t('notice')}</p><button class="text-button share-button" id="share">${icon('share')}${t('share')}</button><p class="detail-price">${t('price')}</p></div></div></dialog>
<dialog id="selection-dialog" class="selection-dialog" aria-labelledby="selection-title"><div class="dialog-top"><h2 id="selection-title">${t('saved')}</h2><button class="icon-button" data-close="selection-dialog" aria-label="${t('close')}">${icon('close')}</button></div><p id="selection-hint">${t('selectionHint')}</p><div id="selection-items" class="selection-items"></div><div class="selection-footer"><p id="selection-notice">${t('notice')}</p><a class="button button-wine" id="selection-book">${icon('whatsapp')}${t('book')}</a></div></dialog>
<div class="toast" role="status" aria-live="polite" id="toast" hidden></div><script id="atlas-data" type="application/json">${JSON.stringify(scriptData).replaceAll('<','\\u003c')}</script></body></html>`;
  const path=pagePath(lang);
  mkdirSync(new URL(path,root),{recursive:true});
  writeFileSync(new URL(path+'index.html',root),html);
  pages.push(`<url><loc>${canonical}</loc><lastmod>${releaseDate}</lastmod></url>`);
 }
 return pages;
}
if(process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url) buildAtlas({version:read('VERSION').trim(),releaseDate:'2026-11-26',locales:JSON.parse(read('translations.json'))});
