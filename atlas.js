/* Cotton Leaf: progressively enhanced, static fabric atlas. */
(() => {
  'use strict';
  const {text:t, fabrics, assetBase} = JSON.parse(document.getElementById('atlas-data').textContent);
  const byId = new Map(fabrics.map(f => [f.id,f]));
  const $ = id => document.getElementById(id);
  const wall=$('fabric-wall');
  const parking=$('remaining-cards').content;
  const cards=new Map([...wall.querySelectorAll('.fabric-card')].map(node=>[node.id,node]));
  const saveButtons=new Map([...cards].map(([id,node])=>[id,node.querySelector('[data-save]')]));
  let displayOrder=fabrics.slice(0,24).map(f=>f.id).join(',');
  let renderLimit=24;
  const detail=$('fabric-dialog');
  const selection=$('selection-dialog');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const key='cottonleaf-fabrics-v1';
  let storageAvailable=true;
  let saved=new Set();
  let compared=new Set();
  let visible=fabrics;
  let current=null;
  let selectionMode='saved';
  let detailOrigin=null;
  let toastTimer;
  let zoom=1, panX=0,panY=0,drag=null,whole=false;
  let density=0;
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const icon=name=>`<svg aria-hidden="true"><use href="#a-${name}"/></svg>`;
  try {
    let stored=[];
    try {stored=JSON.parse(localStorage.getItem(key)||'[]');}catch(error){if(error.name!=='SyntaxError')throw error;}
    if(Array.isArray(stored)) saved=new Set(stored.filter(id=>typeof id==='string'&&byId.has(id)).slice(0,12));
    localStorage.setItem(key,JSON.stringify([...saved]));
  } catch {storageAvailable=false;}
  const parameters=new URLSearchParams(location.search);
  const validColors=new Set(fabrics.map(f=>f.color));
  const state={q:parameters.get('q')||'',collection:parameters.get('collection')||'',pattern:parameters.get('pattern')||'',color:parameters.get('color')||'',saved:parameters.get('saved')==='1',sort:parameters.get('sort')||'explore'};
  if(!validColors.has(state.color))state.color='';
  if(!fabrics.some(f=>f.collection===state.collection))state.collection='';
  if(!['plain','stripes','checks','texture'].includes(state.pattern))state.pattern='';
  if(!['explore','color','collection','code'].includes(state.sort))state.sort='explore';
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const searchText=new Map(fabrics.map(f=>[f.id,normalize(`${f.collection} ${f.code} ${t[f.color]} ${t[f.pattern]}`)]));
  const asset=(f,size=960)=>assetBase+f.id+'-'+size+'.webp';
  const label=f=>f.collection+' · '+f.code;
  function cardFor(f) {
    if(cards.has(f.id))return cards.get(f.id);
    const holder=document.createElement('template');
    holder.innerHTML=`<article class="fabric-card" id="${f.id}"><button class="swatch-open" type="button" data-open="${f.id}"><span class="fabric-image" style="--swatch:${f.tone}"><img src="${asset(f,320)}" width="320" height="258" alt="" loading="lazy" decoding="async"></span><span class="fabric-label"><span>${escape(f.collection)}</span> <strong dir="ltr">${escape(f.code)}</strong></span></button><button class="save-icon needs-js" data-save="${f.id}" aria-label="${escape((saved.has(f.id)?t.remove:t.save)+' '+label(f))}" aria-pressed="${saved.has(f.id)}">${icon('heart')}</button></article>`;
    const node=holder.content.firstElementChild;
    cards.set(f.id,node);saveButtons.set(f.id,node.querySelector('[data-save]'));
    return node;
  }
  const activeHash=()=>{try{return decodeURIComponent(location.hash.slice(1));}catch{return '';}};

  function toast(message) {
    clearTimeout(toastTimer);
    const node=$('toast');
    const parent=detail.open?detail:selection.open?selection:document.body;
    parent.append(node);node.classList.toggle('in-dialog',parent!==document.body);
    node.textContent=message;node.hidden=false;
    toastTimer=setTimeout(()=>{node.hidden=true;document.body.append(node);node.classList.remove('in-dialog');},4300);
  }
  function persist() {
    try {localStorage.setItem(key,JSON.stringify([...saved]));}
    catch {storageAvailable=false;toast(t.storageNotice);}
  }
  function whatsapp(ids) {
    const references=ids.map(id=>byId.get(id)).filter(Boolean).map(f=>'• '+label(f));
    const url=new URL(location.pathname,location.origin).href;
    return 'https://wa.me/393452357524?text='+encodeURIComponent(`${t.message}\n${references.join('\n')}\n\n${t.appointment}\n${url}`);
  }
  function syncButtons() {
    $('saved-count').textContent=saved.size;
    $('open-saved').setAttribute('aria-label',`${t.saved}: ${saved.size}`);
    for(const [id,button] of saveButtons) {
      const pressed=saved.has(id);
      button.setAttribute('aria-pressed',String(pressed));
      button.setAttribute('aria-label',(pressed?t.remove:t.save)+' '+label(byId.get(id)));
    }
    if(current) {
      $('detail-save').setAttribute('aria-pressed',String(saved.has(current.id)));
      $('detail-save').querySelector('span').textContent=saved.has(current.id)?t.remove:t.save;
      $('detail-compare').setAttribute('aria-pressed',String(compared.has(current.id)));
      $('detail-compare').textContent=compared.has(current.id)?t.removeCompare:t.addCompare;
    }
    $('compare-tray').hidden=compared.size<2;
    $('compare-count').textContent=`${compared.size} ${t.fabrics}`;
  }
  function toggleSave(id) {
    if(saved.has(id))saved.delete(id);
    else if(saved.size>=12){toast(t.saveLimit);return;}
    else saved.add(id);
    persist();syncButtons();
    if(state.saved)applyFilters(false);
    if(selection.open&&selectionMode==='saved')renderSelection();
  }
  function toggleCompare(id) {
    if(compared.has(id))compared.delete(id);
    else if(compared.size>=4){toast(t.compareLimit);return;}
    else compared.add(id);
    syncButtons();
    if(selection.open)renderSelection();
  }
  function syncUrl() {
    const query=new URLSearchParams(location.search);
    for(const field of ['q','collection','pattern','color','sort']) {
      const value=state[field];
      if(value&&(field!=='sort'||value!=='explore'))query.set(field,value);else query.delete(field);
    }
    if(state.saved)query.set('saved','1');else query.delete('saved');
    const suffix=query.toString();
    history.replaceState(null,'',location.pathname+(suffix?'?'+suffix:'')+location.hash);
    for(const link of document.querySelectorAll('.language-options a')) {
      const url=new URL(link.href);url.search=suffix;url.hash=location.hash;link.href=url.href;
    }
  }
  function applyFilters(animate=true,extend=false) {
    if(!extend)renderLimit=24;
    const words=normalize(state.q).split(' ').filter(Boolean);
    visible=fabrics.filter(f=>(!state.collection||f.collection===state.collection)&&(!state.pattern||f.pattern===state.pattern)&&(!state.color||f.color===state.color)&&(!state.saved||saved.has(f.id))&&words.every(w=>searchText.get(f.id).includes(w)));
    if(state.sort!=='explore') {
      const natural=new Intl.Collator(document.documentElement.lang,{numeric:true,sensitivity:'base'});
      const colorOrder=['white','blue','pink','purple','green','neutral','red','dark'];
      visible.sort((a,b)=>state.sort==='color'?(colorOrder.indexOf(a.color)-colorOrder.indexOf(b.color)||b.value-a.value):state.sort==='collection'?(natural.compare(a.collection,b.collection)||natural.compare(a.code,b.code)):natural.compare(a.code,b.code));
    }
    const displayed=visible.slice(0,renderLimit);
    const ids=new Set(displayed.map(f=>f.id));
    const old=new Map();
    if(animate&&!reduceMotion.matches)for(const [id,node]of cards){const r=node.getBoundingClientRect();if(!node.hidden&&r.bottom>0&&r.top<innerHeight)old.set(id,r);}
    for(const [id,node]of cards){const hide=!ids.has(id);if(node.hidden!==hide)node.hidden=hide;if(hide&&node.parentNode===wall)parking.append(node);}
    const nextOrder=displayed.map(f=>f.id).join(',');
    if(displayOrder!==nextOrder){
      const fragment=document.createDocumentFragment();
      for(const f of displayed){const node=cardFor(f);node.hidden=false;fragment.append(node);}
      wall.prepend(fragment);displayOrder=nextOrder;
    }
    if(animate&&!reduceMotion.matches)for(const [id,before]of old){const node=cards.get(id);if(node.hidden)continue;const after=node.getBoundingClientRect();const x=before.left-after.left,y=before.top-after.top;if((x||y)&&Math.abs(y)<innerHeight)node.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});}
    $('result-count').textContent=`${visible.length} ${t.fabrics}`;
    $('atlas-more').hidden=displayed.length>=visible.length;
    $('render-count').textContent=`${displayed.length} / ${visible.length}`;
    $('empty').hidden=visible.length!==0;
    $('reset').hidden=!(state.q||state.collection||state.pattern||state.color||state.saved);
    for(const button of document.querySelectorAll('[data-color]'))button.setAttribute('aria-pressed',String(button.dataset.color===state.color));
    syncUrl();
  }
  function reset() {
    Object.assign(state,{q:'',collection:'',pattern:'',color:'',saved:false,sort:'explore'});
    $('search').value='';$('collection').value='';$('pattern').value='';$('sort').value='explore';$('saved-only').checked=false;
    applyFilters();
  }
  function updateZoom() {
    const stage=$('zoom-stage'),image=$('detail-image');
    const limitX=stage.clientWidth*(zoom-1)/2,limitY=stage.clientHeight*(zoom-1)/2;
    panX=Math.max(-limitX,Math.min(limitX,panX));panY=Math.max(-limitY,Math.min(limitY,panY));
    image.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;
    stage.classList.toggle('zoomed',zoom>1);stage.classList.toggle('whole',whole);
    $('zoom-out').disabled=zoom<=1;$('zoom-in').disabled=zoom>=3;
    $('fit-image').setAttribute('aria-pressed',String(whole));
  }
  function resetZoom() {zoom=1;panX=0;panY=0;whole=false;updateZoom();}
  function showFabric(id) {
    const f=byId.get(id);if(!f)return;
    current=f;
    const image=$('detail-image');
    image.src=asset(f);image.alt=`${label(f)} · ${t[f.pattern]} · ${t[f.color]}`;
    $('zoom-stage').style.setProperty('--swatch',f.tone);
    $('detail-collection').textContent=f.collection;$('detail-title').textContent=f.code;
    $('detail-color').textContent=t[f.color];$('detail-pattern').textContent=t[f.pattern];
    $('composition-row').hidden=!f.composition;
    $('detail-composition').textContent=(f.composition||[]).map(([percentage,material])=>new Intl.NumberFormat(document.documentElement.lang,{style:'percent'}).format(percentage/100)+' '+(t[material]||material)).join(' · ');
    $('detail-book').href=whatsapp([f.id]);
    const index=visible.findIndex(item=>item.id===id);
    $('detail-position').textContent=index>=0?`${index+1} / ${visible.length}`:t.title;
    $('previous').disabled=index<=0;$('next').disabled=index<0||index>=visible.length-1;
    resetZoom();syncButtons();
    if(selection.open)selection.close();
    if(!detail.open)detail.showModal();
  }
  function openFabric(id,origin) {
    detailOrigin=origin||document.activeElement;
    if(activeHash()!==id)history.pushState(null,'',location.pathname+location.search+'#'+encodeURIComponent(id));
    const source=origin?.querySelector('img');
    if(document.startViewTransition&&!reduceMotion.matches&&!detail.open&&source&&!selection.open) {
      source.style.viewTransitionName='fabric-focus';
      const transition=document.startViewTransition(async()=>{
        source.style.viewTransitionName='';
        $('detail-image').style.viewTransitionName='fabric-focus';
        showFabric(id);
        await $('detail-image').decode().catch(()=>{});
      });
      transition.finished.finally(()=>{source.style.viewTransitionName='';$('detail-image').style.viewTransitionName='';}).catch(()=>{});
    } else showFabric(id);
  }
  function clearHash() {
    if(byId.has(activeHash()))history.replaceState(null,'',location.pathname+location.search);
    if(detailOrigin?.isConnected&&!detailOrigin.closest('[hidden]'))detailOrigin.focus({preventScroll:true});
    else $('search').focus({preventScroll:true});
  }
  function move(direction) {
    const index=visible.findIndex(f=>f.id===current?.id),next=visible[index+direction];
    if(index<0||!next)return;
    history.replaceState(null,'',location.pathname+location.search+'#'+next.id);showFabric(next.id);
  }
  function renderSelection() {
    const ids=[...(selectionMode==='compare'?compared:saved)];
    $('selection-title').textContent=selectionMode==='compare'?t.compare:t.saved;
    $('selection-hint').textContent=selectionMode==='compare'?t.compareHint:t.selectionHint;
    const container=$('selection-items');
    container.style.setProperty('--selection-columns',Math.min(4,ids.length)||4);
    container.style.setProperty('--selection-tablet-columns',Math.min(3,ids.length)||3);
    container.style.setProperty('--selection-mobile-columns',Math.min(2,ids.length)||2);
    container.innerHTML=ids.length?ids.map(id=>{
      const f=byId.get(id);
      return `<article><button class="swatch-open" data-open="${id}" ><span class="fabric-image" style="--swatch:${f.tone}"><img src="${asset(f,960)}" alt="" width="${f.width}" height="${f.height}" decoding="async"></span><span class="fabric-label"><span>${escape(f.collection)}</span> <strong dir="ltr">${escape(f.code)}</strong></span></button><div class="selection-actions"><button class="text-button" data-compare="${id}" aria-pressed="${compared.has(id)}">${escape(compared.has(id)?t.removeCompare:t.addCompare)}</button><button class="icon-button" data-${selectionMode==='compare'?'compare':'save'}="${id}" aria-label="${escape((selectionMode==='compare'?t.removeCompare:t.remove)+' '+label(f))}">${icon('close')}</button></div></article>`;
    }).join(''):`<p class="selection-empty">${escape(t.emptySaved)}</p>`;
    $('selection-book').hidden=!ids.length;
    $('selection-book').href=whatsapp(ids);
    $('selection-notice').textContent=storageAvailable?t.notice:t.storageNotice;
  }
  function openSelection(mode) {
    selectionMode=mode;renderSelection();
    if(detail.open)detail.close();
    if(!selection.open)selection.showModal();
  }
  document.addEventListener('click',event=>{
    const open=event.target.closest('[data-open]');
    if(open){openFabric(open.dataset.open,open);return;}
    const save=event.target.closest('[data-save]');
    if(save){const inSelection=selection.contains(save);toggleSave(save.dataset.save);if(inSelection)selection.querySelector('.selection-items button, [data-close]')?.focus();return;}
    const compare=event.target.closest('[data-compare]');
    if(compare){const id=compare.dataset.compare;toggleCompare(id);if(selection.open)(selection.querySelector(`[data-compare="${id}"]`)||selection.querySelector('.selection-items button')||selection.querySelector('[data-close]')).focus();return;}
    const close=event.target.closest('[data-close]');if(close){$(close.dataset.close).close();return;}
    const color=event.target.closest('[data-color]');if(color){state.color=color.dataset.color;applyFilters();return;}
    if(event.target.closest('[data-action="reset"]'))reset();
  });
  let searchTimer;
  $('search').value=state.q;$('collection').value=state.collection;$('pattern').value=state.pattern;$('sort').value=state.sort;$('saved-only').checked=state.saved;
  $('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.q=$('search').value;applyFilters();},120);});
  for(const field of ['collection','pattern','sort'])$(field).addEventListener('change',()=>{state[field]=$(field).value;applyFilters();});
  $('saved-only').addEventListener('change',()=>{state.saved=$('saved-only').checked;applyFilters();});
  $('reset').addEventListener('click',reset);
  function loadMore() {
    if(renderLimit>=visible.length)return;
    renderLimit+=24;applyFilters(false,true);
  }
  $('load-more').addEventListener('click',loadMore);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting))loadMore();
  },{rootMargin:'400px'}).observe($('atlas-more'));
  $('open-saved').addEventListener('click',()=>openSelection('saved'));
  $('open-compare').addEventListener('click',()=>openSelection('compare'));
  $('detail-save').addEventListener('click',()=>{if(current)toggleSave(current.id);});
  $('detail-compare').addEventListener('click',()=>{if(current)toggleCompare(current.id);});
  $('previous').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));
  $('zoom-in').addEventListener('click',()=>{zoom=Math.min(3,zoom+.5);updateZoom();});
  $('zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.5);updateZoom();});
  $('fit-image').addEventListener('click',()=>{zoom=1;panX=panY=0;whole=!whole;updateZoom();});
  const stage=$('zoom-stage');
  stage.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    drag={x:event.clientX,y:event.clientY,px:panX,py:panY};
    if(zoom>1){stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');event.preventDefault();}
  });
  stage.addEventListener('pointermove',event=>{if(!drag||zoom<=1)return;panX=drag.px+event.clientX-drag.x;panY=drag.py+event.clientY-drag.y;updateZoom();});
  stage.addEventListener('pointerup',event=>{if(drag&&zoom===1&&Math.abs(event.clientX-drag.x)>65&&Math.abs(event.clientY-drag.y)<35)move(event.clientX<drag.x?1:-1);drag=null;stage.classList.remove('dragging');});
  new ResizeObserver(()=>{if(detail.open)updateZoom();}).observe(stage);
  for(const event of ['pointercancel','lostpointercapture'])stage.addEventListener(event,()=>{drag=null;stage.classList.remove('dragging');});
  detail.addEventListener('keydown',event=>{if(event.target.matches('input,select,textarea')||zoom>1)return;if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}});
  detail.addEventListener('close',clearHash);
  for(const dialog of [detail,selection]) {
    let outside=false;
    dialog.addEventListener('pointerdown',event=>{const r=dialog.getBoundingClientRect();outside=event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom);});
    dialog.addEventListener('click',event=>{if(outside&&event.target===dialog)dialog.close();outside=false;});
  }
  $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(new URL(location.pathname+location.search+'#'+current.id,location.origin).href);toast(t.copied);}catch{toast(t.copyError);}});
  function setDensity(change) {
    density=Math.max(-1,Math.min(1,density+change));
    wall.classList.toggle('dense',density===-1);wall.classList.toggle('large',density===1);
    $('denser').disabled=density===-1;$('larger').disabled=density===1;
    $('denser').setAttribute('aria-pressed',String(density===-1));$('larger').setAttribute('aria-pressed',String(density===1));
  }
  $('denser').addEventListener('click',()=>setDensity(-1));$('larger').addEventListener('click',()=>setDensity(1));
  addEventListener('hashchange',()=>{const id=activeHash();if(byId.has(id))showFabric(id);else if(detail.open)detail.close();});
  addEventListener('popstate',()=>{
    const query=new URLSearchParams(location.search);
    state.q=query.get('q')||'';state.collection=query.get('collection')||'';state.pattern=query.get('pattern')||'';state.color=query.get('color')||'';state.saved=query.get('saved')==='1';state.sort=query.get('sort')||'explore';
    $('search').value=state.q;$('collection').value=state.collection;$('pattern').value=state.pattern;$('sort').value=state.sort;$('saved-only').checked=state.saved;applyFilters(false);
  });
  document.documentElement.classList.add('atlas-ready');syncButtons();setDensity(0);applyFilters(false);
  if(byId.has(activeHash()))showFabric(activeHash());
})();
