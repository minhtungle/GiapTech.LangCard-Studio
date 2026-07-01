// ═══════════════════════════════
// STORE — history (undo/redo), autosave, import/export
// ═══════════════════════════════

const LS_KEY = 'langcard.session.v1';

let history = [];      // array of snapshots
let histIdx = -1;      // pointer into history
let _histTimer = null;
const HIST_MAX = 60;

function snapshot(){
  return JSON.stringify({pages, cur, docSizeKey});
}

function restoreSnapshot(snap){
  try{
    const o = JSON.parse(snap);
    pages = o.pages;
    cur = Math.min(o.cur ?? 0, pages.length-1);
    if(o.docSizeKey && DOC_SIZES[o.docSizeKey]){
      docSizeKey = o.docSizeKey;
      const sel = document.getElementById('doc-size');
      if(sel) sel.value = docSizeKey;
    }
  }catch(e){ /* ignore */ }
}

// Seed history with initial state (called once at init)
function initHistory(){
  history = [snapshot()];
  histIdx = 0;
}

// Push a new snapshot. immediate=true for structural changes;
// otherwise debounced (good for text typing).
function pushHistory(immediate){
  const doPush = () => {
    const snap = snapshot();
    if(history[histIdx] === snap) return; // no change
    // drop any redo branch
    history = history.slice(0, histIdx+1);
    history.push(snap);
    if(history.length > HIST_MAX){ history.shift(); }
    histIdx = history.length-1;
    saveLocal();
    refreshUndoButtons();
  };
  clearTimeout(_histTimer);
  if(immediate){ doPush(); }
  else { _histTimer = setTimeout(doPush, 500); }
}

function undo(){
  clearTimeout(_histTimer);
  if(histIdx <= 0) return;
  histIdx--;
  restoreSnapshot(history[histIdx]);
  saveLocal();
  rAll();
  refreshUndoButtons();
}

function redo(){
  clearTimeout(_histTimer);
  if(histIdx >= history.length-1) return;
  histIdx++;
  restoreSnapshot(history[histIdx]);
  saveLocal();
  rAll();
  refreshUndoButtons();
}

function refreshUndoButtons(){
  const u = document.getElementById('btn-undo');
  const r = document.getElementById('btn-redo');
  if(u) u.disabled = histIdx <= 0;
  if(r) r.disabled = histIdx >= history.length-1;
}

// ── autosave: ghi state hiện tại vào dự án đang mở ──
let _saveTimer = null;
function saveLocal(){
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(()=>{
    try{
      if(typeof syncEditorToProject==='function'){ syncEditorToProject(); saveProjects(); }
    }catch(e){ /* quota */ }
  }, 300);
}

// ── import / export JSON file (whole document) ──
function exportJSONFile(){
  const data = JSON.stringify({version:1, docSizeKey, pages}, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0,10);
  a.download = `langcards-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Đã lưu JSON ✓');
}

function importJSONFile(ev){
  const file = ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const o = JSON.parse(e.target.result);
      const arr = Array.isArray(o) ? o : o.pages;
      if(!Array.isArray(arr) || !arr.length) throw new Error('no pages');
      pages = arr;
      cur = 0;
      if(o.docSizeKey && DOC_SIZES[o.docSizeKey]){
        docSizeKey = o.docSizeKey;
        const sel = document.getElementById('doc-size');
        if(sel) sel.value = docSizeKey;
      }
      pushHistory(true);
      rAll();
      toast('Đã mở tài liệu ✓');
    }catch(err){
      toast('File JSON không hợp lệ');
    }
    ev.target.value = '';
  };
  reader.readAsText(file);
}

function triggerImport(){
  document.getElementById('import-file-input').click();
}
