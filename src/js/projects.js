// ═══════════════════════════════
// PROJECTS — quản lý nhiều dự án, mỗi dự án nhiều trang
// ═══════════════════════════════

const PROJ_KEY = 'langcard.projects.v1';
const PROJ_CUR = 'langcard.current.v1';

let projects = [];        // [{id, name, createdAt, updatedAt, docSizeKey, pages:[...]}]
let curProjId = null;

function uid(){ return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function nowTs(){ return Date.now(); }

function curProject(){ return projects.find(p=>p.id===curProjId) || null; }

// ── persistence ──
function saveProjects(){
  try{ localStorage.setItem(PROJ_KEY, JSON.stringify(projects)); localStorage.setItem(PROJ_CUR, curProjId||''); }catch(e){}
}

function loadProjects(){
  try{
    const raw = localStorage.getItem(PROJ_KEY);
    if(raw){
      projects = JSON.parse(raw) || [];
      curProjId = localStorage.getItem(PROJ_CUR) || (projects[0] && projects[0].id) || null;
    }
  }catch(e){ projects=[]; }
}

// migrate dữ liệu phiên cũ (langcard.session.v1) thành "Dự án 1"
function migrateLegacy(){
  if(projects.length) return false;
  let legacy=null;
  try{ const raw=localStorage.getItem(LS_KEY); if(raw) legacy=JSON.parse(raw); }catch(e){}
  const proj = {
    id: uid(),
    name: 'Dự án 1',
    createdAt: nowTs(),
    updatedAt: nowTs(),
    docSizeKey: (legacy && legacy.docSizeKey) || 'a4',
    pages: (legacy && Array.isArray(legacy.pages) && legacy.pages.length) ? legacy.pages : [structuredClone(SAMPLE['vocab-grid'])],
  };
  projects=[proj];
  curProjId=proj.id;
  saveProjects();
  return true;
}

// ── load editor state from a project into global pages/cur/docSizeKey ──
function loadProjectIntoEditor(id){
  const proj = projects.find(p=>p.id===id);
  if(!proj) return;
  curProjId = id;
  pages = proj.pages;
  cur = 0;
  docSizeKey = (proj.docSizeKey && DOC_SIZES[proj.docSizeKey]) ? proj.docSizeKey : 'a4';
  const sel = document.getElementById('doc-size');
  if(sel) sel.value = docSizeKey;
  saveProjects();
}

// ── sync current editor state back into the project object (called by autosave) ──
function syncEditorToProject(){
  const proj = curProject();
  if(!proj) return;
  proj.pages = pages;
  proj.docSizeKey = docSizeKey;
  proj.updatedAt = nowTs();
}

// ── CRUD ──
function createProject(name){
  const proj = {
    id: uid(),
    name: (name||'').trim() || `Dự án ${projects.length+1}`,
    createdAt: nowTs(),
    updatedAt: nowTs(),
    docSizeKey: 'a4',
    pages: [structuredClone(SAMPLE['vocab-grid'])],
  };
  projects.push(proj);
  saveProjects();
  return proj;
}

function switchProject(id){
  if(id===curProjId) { closeProjMenu(); return; }
  syncEditorToProject();
  saveProjects();
  loadProjectIntoEditor(id);
  initHistory();
  rAll();
  zoomFit();
  closeProjMenu();
  refreshProjUI();
  toast('Đã mở: '+esc(curProject().name));
}

function newProject(){
  syncEditorToProject(); saveProjects();
  const proj = createProject();
  loadProjectIntoEditor(proj.id);
  initHistory();
  rAll(); zoomFit();
  closeProjMenu(); refreshProjUI();
  toast('Đã tạo dự án mới');
}

function renameProject(id){
  const proj = projects.find(p=>p.id===id); if(!proj) return;
  const name = prompt('Tên dự án:', proj.name);
  if(name===null) return;
  proj.name = name.trim() || proj.name;
  proj.updatedAt = nowTs();
  saveProjects(); refreshProjUI(); renderProjModal();
}

function dupProject(id){
  const src = projects.find(p=>p.id===id); if(!src) return;
  if(id===curProjId){ syncEditorToProject(); saveProjects(); }
  const copy = {
    id: uid(),
    name: src.name+' (bản sao)',
    createdAt: nowTs(), updatedAt: nowTs(),
    docSizeKey: src.docSizeKey,
    pages: structuredClone(src.pages),
  };
  const idx = projects.findIndex(p=>p.id===id);
  projects.splice(idx+1, 0, copy);
  saveProjects(); refreshProjUI(); renderProjModal();
  toast('Đã nhân bản dự án');
}

function deleteProject(id){
  if(projects.length<=1){ toast('Cần ít nhất 1 dự án'); return; }
  const proj = projects.find(p=>p.id===id); if(!proj) return;
  if(!confirm(`Xoá dự án "${proj.name}"? Không thể hoàn tác.`)) return;
  const idx = projects.findIndex(p=>p.id===id);
  projects.splice(idx,1);
  if(curProjId===id){
    const next = projects[Math.max(0,idx-1)];
    loadProjectIntoEditor(next.id);
    initHistory(); rAll(); zoomFit();
  }
  saveProjects(); refreshProjUI(); renderProjModal();
  toast('Đã xoá dự án');
}

// ── export / import whole project ──
function exportProjectFile(id){
  const proj = (id ? projects.find(p=>p.id===id) : curProject());
  if(!proj) return;
  if(proj.id===curProjId) syncEditorToProject();
  const data = JSON.stringify({type:'langcard-project', version:1, name:proj.name, docSizeKey:proj.docSizeKey, pages:proj.pages}, null, 2);
  const blob = new Blob([data],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download = proj.name.replace(/[^\w\-]+/g,'_')+'.lcproj.json';
  a.click(); URL.revokeObjectURL(a.href);
  toast('Đã xuất dự án ✓');
}

function importProjectFile(ev){
  const file = ev.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const o = JSON.parse(e.target.result);
      const arr = Array.isArray(o) ? o : o.pages;
      if(!Array.isArray(arr) || !arr.length) throw new Error('no pages');
      const proj = {
        id: uid(),
        name: (o.name||file.name.replace(/\.(lcproj\.)?json$/,'')) || 'Dự án nhập',
        createdAt: nowTs(), updatedAt: nowTs(),
        docSizeKey: (o.docSizeKey && DOC_SIZES[o.docSizeKey]) ? o.docSizeKey : 'a4',
        pages: arr,
      };
      syncEditorToProject(); 
      projects.push(proj);
      loadProjectIntoEditor(proj.id);
      initHistory(); rAll(); zoomFit();
      saveProjects(); refreshProjUI(); renderProjModal();
      toast('Đã nhập dự án ✓');
    }catch(err){ toast('File dự án không hợp lệ'); }
    ev.target.value='';
  };
  reader.readAsText(file);
}
function triggerImportProject(){ document.getElementById('import-proj-input').click(); }

// ═══════════════════════════════
// UI — dropdown + modal lưới
// ═══════════════════════════════
function refreshProjUI(){
  const nameEl = document.getElementById('proj-name');
  if(nameEl) nameEl.textContent = curProject()?.name || 'Dự án';
}

function toggleProjMenu(){
  const m = document.getElementById('proj-menu');
  const show = !m.classList.contains('on');
  m.classList.toggle('on', show);
  if(show) renderProjMenu();
}
function closeProjMenu(){ document.getElementById('proj-menu')?.classList.remove('on'); }

function renderProjMenu(){
  const list = document.getElementById('proj-menu-list');
  if(!list) return;
  list.innerHTML = projects.map(p=>`
    <button class="proj-menu-item ${p.id===curProjId?'active':''}" onclick="switchProject('${p.id}')">
      <span class="pm-dot"></span>
      <span class="pm-name">${esc(p.name)}</span>
      <span class="pm-count">${p.pages.length} trang</span>
    </button>`).join('');
}

// modal lưới
function openProjModal(){ closeProjMenu(); document.getElementById('proj-modal-overlay').classList.add('on'); renderProjModal(); }
function closeProjModal(){ document.getElementById('proj-modal-overlay').classList.remove('on'); }

function fmtDate(ts){
  try{ return new Date(ts).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; }
}

function renderProjModal(){
  const grid = document.getElementById('proj-grid');
  if(!grid) return;
  if(curProjId) syncEditorToProject();
  grid.innerHTML = projects.map(p=>{
    const m = TEMPLATES_META.find(t=>t.id===(p.pages[0]?.template));
    return `<div class="proj-card ${p.id===curProjId?'active':''}">
      <div class="proj-thumb" onclick="switchProject('${p.id}')" title="Mở dự án">
        <span class="proj-thumb-icon">${m?.icon||'📄'}</span>
        <span class="proj-pages">${p.pages.length} trang</span>
      </div>
      <div class="proj-card-body">
        <div class="proj-card-name" onclick="switchProject('${p.id}')">${esc(p.name)}</div>
        <div class="proj-card-date">Sửa: ${fmtDate(p.updatedAt)}</div>
        <div class="proj-card-acts">
          <button class="pc-btn" onclick="renameProject('${p.id}')" title="Đổi tên">✎</button>
          <button class="pc-btn" onclick="dupProject('${p.id}')" title="Nhân bản">⧉</button>
          <button class="pc-btn" onclick="exportProjectFile('${p.id}')" title="Xuất file">⤓</button>
          <button class="pc-btn pc-del" onclick="deleteProject('${p.id}')" title="Xoá" ${projects.length<=1?'disabled':''}>×</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
