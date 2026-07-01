// ═══════════════════════════════
// PREVIEW — zoom, pan, grid view, thumbnails, backdrop
// ═══════════════════════════════

let viewMode  = 'single';                 // 'single' | 'grid'
let fitMode   = 'fit';                     // 'fit' | '100' | 'fill' | 'custom'
let showPgNum = true;
let bgMode    = localStorage.getItem('langcard.bg') || 'grid'; // grid | dark | light | checker

const SHEET_GAP = 20;                      // px gap between stacked overflow sheets
let _curViewH = 0;                         // total height of the sheets shown in single view

// physical-sheet bookkeeping: each page object may expand into several sheets
// when its content overflows. Returns counts per page, running starts, and total.
function physInfo(W, H){
  const counts = pages.map(p => renderPageParts(p, W, H).length);
  const starts = []; let acc = 0;
  counts.forEach(c => { starts.push(acc); acc += c; });
  return { counts, starts, total: acc };
}

// ── zoom helpers ──
function clampZoom(z){ return Math.min(3, Math.max(0.1, z)); }

function applyZoom() {
  const outer = document.getElementById('a4-outer');
  if(!outer) return;
  outer.style.transform = `scale(${zoomLv})`;
  outer.style.transformOrigin = 'center center';
  const W=docW(), H=docH();
  outer.style.height = (_curViewH||H)+'px';
  outer.style.width  = W+'px';
  const zv = document.getElementById('zoom-val');
  if(zv) zv.textContent = Math.round(zoomLv*100)+'%';
}

// cuộn để card nằm giữa khung xem
function centerView(){
  const outer=document.getElementById('a4-outer');
  if(outer) outer.scrollIntoView({block:'center',inline:'center'});
}

function adjZoom(d){ fitMode='custom'; zoomLv=clampZoom(zoomLv+d); applyZoom(); }
function setZoom(z){ fitMode='custom'; zoomLv=clampZoom(z); applyZoom(); }

function zoomFit(){
  fitMode='fit';
  const wrap=document.getElementById('preview-wrap');
  if(!wrap) return;
  const pad=56;
  const aw=wrap.clientWidth-pad, ah=wrap.clientHeight-pad;
  zoomLv=clampZoom(Math.min(aw/docW(), ah/(_curViewH||docH())));
  applyZoom(); centerView();
}
function zoom100(){ fitMode='100'; zoomLv=1; applyZoom(); centerView(); }
function zoomFill(){
  fitMode='fill';
  const wrap=document.getElementById('preview-wrap');
  if(!wrap) return;
  zoomLv=clampZoom((wrap.clientWidth-56)/docW());
  applyZoom(); centerView();
}

// ── backdrop ──
function setBg(mode){
  bgMode=mode;
  localStorage.setItem('langcard.bg', mode);
  const wrap=document.getElementById('preview-wrap');
  if(!wrap) return;
  wrap.classList.remove('bg-grid','bg-dark','bg-light','bg-checker');
  wrap.classList.add('bg-'+mode);
  document.querySelectorAll('#bg-seg .seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.bg===mode));
}

// ── toggles ──
function togglePgNum(){ showPgNum=!showPgNum; document.getElementById('btn-pgnum')?.classList.toggle('on',showPgNum); rPreview(); }

function setView(mode){
  viewMode=mode;
  document.getElementById('btn-view-single')?.classList.toggle('active', mode==='single');
  document.getElementById('btn-view-grid')?.classList.toggle('active', mode==='grid');
  rPreview();
}

// ── main render dispatcher ──
function rPreview(){
  const W=docW(), H=docH();
  const meta=TEMPLATES_META.find(t=>t.id===pages[cur].template);
  const phTitle=document.getElementById('ph-title');
  if(phTitle) phTitle.textContent=`${meta?.name||''} · ${DOC_SIZES[docSizeKey].label} · ${W}×${H}`;

  if(viewMode==='grid'){ renderGrid(W,H); }
  else { renderSingle(W,H); }

  // nav state
  const ct=document.getElementById('nav-ct'); if(ct) ct.textContent=`${cur+1} / ${pages.length}`;
  const pv=document.getElementById('nav-prev'); if(pv) pv.disabled=cur===0;
  const nx=document.getElementById('nav-next'); if(nx) nx.disabled=cur===pages.length-1;

  renderThumbs(W,H);
}

function renderSingle(W,H){
  const wrap=document.getElementById('preview-wrap');
  wrap.classList.remove('grid-mode');
  const {starts,total}=physInfo(W,H);
  const parts=renderPageParts(pages[cur],W,H);
  _curViewH = parts.length*H + (parts.length-1)*SHEET_GAP;
  const sheets=parts.map((part,k)=>{
    const pn=showPgNum?`${starts[cur]+k+1} / ${total}`:'';
    return wrapPart(part,pn,W,H);
  }).join('');
  wrap.innerHTML=`<div id="a4-pad"><div id="a4-outer"><div id="a4-frame" style="width:${W}px;position:relative;display:flex;flex-direction:column;gap:${SHEET_GAP}px">${sheets}</div></div></div>`;
  applyZoom();
}

function renderGrid(W,H){
  const wrap=document.getElementById('preview-wrap');
  wrap.classList.add('grid-mode');
  const scale=Math.min(0.34, 230/W);
  const {total}=physInfo(W,H);
  let n=0;
  const cells=pages.map((p,i)=>{
    const parts=renderPageParts(p,W,H);
    return parts.map((part,k)=>{
      const num=++n;
      const pn=showPgNum?`${num} / ${total}`:'';
      const cap = parts.length>1 ? `${i+1}.${k+1}` : `${i+1}`;
      return `<div class="grid-cell ${i===cur?'active':''}" onclick="gridPick(${i})" title="Trang ${num}">
        <div class="grid-thumb" style="width:${W*scale}px;height:${H*scale}px">
          <div style="transform:scale(${scale});transform-origin:top left;width:${W}px;height:${H}px;position:relative">${wrapPart(part,pn,W,H)}</div>
        </div>
        <div class="grid-cap">${cap}</div>
      </div>`;
    }).join('');
  }).join('');
  wrap.innerHTML=`<div class="grid-sheet">${cells}</div>`;
}

function gridPick(i){ cur=i; setView('single'); rPageList(); rForm(); syncJSON(); }

// ── thumbnail strip (single mode) ──
function renderThumbs(W,H){
  const strip=document.getElementById('thumb-strip');
  if(!strip) return;
  if(viewMode==='grid' || pages.length<=1){ strip.style.display='none'; return; }
  strip.style.display='flex';
  const scale=44/H;
  strip.innerHTML=pages.map((p,i)=>{
    const parts=renderPageParts(p,W,H);
    return parts.map((part,k)=>{
      const lbl = parts.length>1 ? `${i+1}.${k+1}` : `${i+1}`;
      return `<div class="thumb ${i===cur?'active':''}" onclick="goPage(${i})" title="Trang ${lbl}">
        <div class="thumb-inner" style="width:${W*scale}px;height:44px">
          <div style="transform:scale(${scale});transform-origin:top left;width:${W}px;height:${H}px">${wrapPart(part,'',W,H)}</div>
        </div>
        <span class="thumb-n">${lbl}</span>
      </div>`;
    }).join('');
  }).join('');
  const act=strip.querySelector('.thumb.active');
  if(act) act.scrollIntoView({block:'nearest',inline:'nearest'});
}

// ── Ctrl + wheel zoom, Space-pan ──
function initPreviewInteractions(){
  const wrap=document.getElementById('preview-wrap');
  if(!wrap) return;

  wrap.addEventListener('wheel', e=>{
    if(!(e.ctrlKey||e.metaKey)) return;
    e.preventDefault();
    setZoom(zoomLv + (e.deltaY<0 ? .08 : -.08));
  }, {passive:false});

  let panning=false, sx=0, sy=0, sl=0, st=0, spaceDown=false;

  document.addEventListener('keydown', e=>{
    if(e.code==='Space' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){
      if(!spaceDown){ spaceDown=true; wrap.classList.add('pan-ready'); }
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', e=>{
    if(e.code==='Space'){ spaceDown=false; wrap.classList.remove('pan-ready'); }
  });

  wrap.addEventListener('mousedown', e=>{
    // pan with Space-held left-click, or middle mouse button
    if(!(spaceDown && e.button===0) && e.button!==1) return;
    panning=true; sx=e.clientX; sy=e.clientY; sl=wrap.scrollLeft; st=wrap.scrollTop;
    wrap.classList.add('panning');
    e.preventDefault();
  });
  window.addEventListener('mousemove', e=>{
    if(!panning) return;
    wrap.scrollLeft = sl - (e.clientX - sx);
    wrap.scrollTop  = st - (e.clientY - sy);
  });
  window.addEventListener('mouseup', ()=>{
    if(panning){ panning=false; wrap.classList.remove('panning'); }
  });
}
