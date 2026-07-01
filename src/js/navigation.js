// ═══════════════════════════════
// NAVIGATION & LAYOUT
// ═══════════════════════════════
function setTpl(id) { pages[cur] = structuredClone(SAMPLE[id]); rAll(); pushHistory(true); }
function goPage(i) { cur=i; rAll(); if(typeof centerView==='function') centerView(); }
function addPage() { pages.push(structuredClone(SAMPLE['vocab-grid'])); cur=pages.length-1; rAll(); pushHistory(true); }
function dupPage(e, i) {
  if(e) e.stopPropagation();
  const src = (typeof i==='number') ? i : cur;
  pages.splice(src+1, 0, structuredClone(pages[src]));
  cur = src+1; rAll(); pushHistory(true);
}
function delPage(e,i) {
  e.stopPropagation();
  if(pages.length===1){toast('Cần ít nhất 1 trang');return;}
  const bak = snapshot();
  pages.splice(i,1); if(cur>=pages.length)cur=pages.length-1;
  rAll(); pushHistory(true);
  toastUndo('Đã xoá', bak);
}
function movePage(e, i, dir){
  e.stopPropagation();
  const j = i+dir;
  if(j<0 || j>=pages.length) return;
  [pages[i], pages[j]] = [pages[j], pages[i]];
  if(cur===i) cur=j; else if(cur===j) cur=i;
  rAll(); pushHistory(true);
}
function navPage(d) { const n=cur+d; if(n>=0&&n<pages.length){cur=n;rAll();if(typeof centerView==='function')centerView();} }
function updateDocSize(v) { docSizeKey=v; rPreview(); if(fitMode==='fit')zoomFit();else if(typeof centerView==='function')centerView(); saveLocal(); pushHistory(true); }

function rForm() {
  document.getElementById('form-inner').innerHTML = buildForm(pages[cur]);
}

function rTplList() {
  const curTpl = pages[cur]?.template;
  document.getElementById('tpl-list').innerHTML = TEMPLATES_META.map(tpl=>`
    <button class="tpl-btn ${tpl.id===curTpl?'active':''}" onclick="setTpl('${tpl.id}')" title="${tpl.desc}">
      <span class="tpl-icon">${tpl.icon}</span>
      <span class="tpl-meta">
        <span class="tpl-name">${tpl.name}</span>
        <span class="tpl-desc">${tpl.desc}</span>
      </span>
    </button>`).join('');
}

function rPageList() {
  document.getElementById('page-list').innerHTML = pages.map((p,i)=>{
    const m = TEMPLATES_META.find(tp=>tp.id===p.template);
    const label = p.topic||p.scene||p.tense||m?.name||'Trang';
    return `<div class="pg-item ${i===cur?'active':''}" draggable="true"
        ondragstart="pgDragStart(event,${i})" ondragover="pgDragOver(event)"
        ondrop="pgDrop(event,${i})" ondragend="pgDragEnd(event)"
        onclick="goPage(${i})">
      <span class="pg-grip" title="Kéo để sắp xếp">⠿</span>
      <span class="pg-num">${i+1}</span>
      <span class="pg-icon">${m?.icon||'📄'}</span>
      <span class="pg-label">${esc(label)}</span>
      <span class="pg-actions">
        <button class="pg-mini" onclick="dupPage(event,${i})" title="Nhân bản">⧉</button>
        <button class="pg-mini" onclick="movePage(event,${i},-1)" title="Lên" ${i===0?'disabled':''}>▲</button>
        <button class="pg-mini" onclick="movePage(event,${i},1)" title="Xuống" ${i===pages.length-1?'disabled':''}>▼</button>
        ${pages.length>1?`<button class="pg-del" onclick="delPage(event,${i})" title="Xoá">×</button>`:''}
      </span>
    </div>`;
  }).join('');
}

function rAll() { rTplList(); rPageList(); rForm(); rPreview(); syncJSON(); }

// ── drag reorder pages ──
let _dragFrom = null;
function pgDragStart(e, i){ _dragFrom = i; e.dataTransfer.effectAllowed='move'; }
function pgDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; }
function pgDrop(e, i){
  e.preventDefault();
  if(_dragFrom===null || _dragFrom===i) return;
  const moved = pages.splice(_dragFrom,1)[0];
  pages.splice(i,0,moved);
  cur = i;
  _dragFrom = null;
  rAll(); pushHistory(true);
}
function pgDragEnd(){ _dragFrom = null; }

// ═══════════════════════════════
// TABS
// ═══════════════════════════════
function switchTab(tab) {
  curTab=tab;
  document.getElementById('tab-form').className='tab-pill'+(tab==='form'?' active':'');
  document.getElementById('tab-json').className='tab-pill'+(tab==='json'?' active':'');
  document.getElementById('form-view').style.display=tab==='form'?'':'none';
  document.getElementById('json-view').style.display=tab==='json'?'flex':'none';
  document.getElementById('apply-btn').style.display=tab==='json'?'':'none';
  if(tab==='json') document.getElementById('json-ta').value=JSON.stringify(pages[cur],null,2);
}
function syncJSON(){if(curTab==='json') document.getElementById('json-ta').value=JSON.stringify(pages[cur],null,2);}
function applyJSON(){
  try{
    const p=JSON.parse(document.getElementById('json-ta').value);
    pages[cur]=p;
    document.getElementById('json-err').style.display='none';
    rAll(); pushHistory(true); toast('JSON đã áp dụng ✓');
  }catch(e){
    document.getElementById('json-err').style.display='block';
    document.getElementById('json-err').textContent='Lỗi JSON: '+e.message;
  }
}

// ═══════════════════════════════
// THEME
// ═══════════════════════════════
function applyTheme(th){
  document.documentElement.setAttribute('data-theme', th);
  localStorage.setItem('langcard.theme', th);
  const btn = document.getElementById('btn-theme');
  if(btn) btn.textContent = th==='light' ? '🌙' : '☀️';
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme')==='light' ? 'dark' : 'light';
  applyTheme(cur);
}

// ═══════════════════════════════
// TOAST (+ undo variant)
// ═══════════════════════════════
let _toastT;
function toast(msg) {
  const el=document.getElementById('toast');
  el.innerHTML=`<span>${esc(msg)}</span>`;
  el.classList.add('on');
  clearTimeout(_toastT); _toastT=setTimeout(()=>el.classList.remove('on'),3000);
}
function toastUndo(msg, snap){
  const el=document.getElementById('toast');
  el.innerHTML=`<span>${esc(msg)}</span>`;
  const btn=document.createElement('button');
  btn.className='toast-undo'; btn.textContent='Hoàn tác';
  btn.onclick=()=>{ restoreSnapshot(snap); rAll(); pushHistory(true); el.classList.remove('on'); };
  el.appendChild(btn);
  el.classList.add('on');
  clearTimeout(_toastT); _toastT=setTimeout(()=>el.classList.remove('on'),5000);
}

// ═══════════════════════════════
// SHORTCUTS PANEL
// ═══════════════════════════════
function toggleShortcuts(force){
  const ov = document.getElementById('sc-overlay');
  const show = force!==undefined ? force : !ov.classList.contains('on');
  ov.classList.toggle('on', show);
}
