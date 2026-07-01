// ═══════════════════════════════
// INIT — must load last
// ═══════════════════════════════

// 1. theme
applyTheme(localStorage.getItem('langcard.theme') || 'dark');

// 2. load projects (migrate legacy session → "Dự án 1" if needed)
loadProjects();
let _migrated = false;
if(!projects.length){ _migrated = migrateLegacy(); }
loadProjectIntoEditor(curProjId || projects[0].id);

// 3. first render
rAll();
refreshProjUI();

// 3b. preview interactions + backdrop + fit
initPreviewInteractions();
setBg(bgMode);
zoomFit();
requestAnimationFrame(()=>{ zoomFit(); });

// 4. set up history baseline
initHistory();
refreshUndoButtons();

// ═══════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════
document.addEventListener('keydown', e => {
  // close shortcuts panel on Escape
  if(e.key==='Escape'){ toggleShortcuts(false); closeModal(); closeProjMenu(); closeProjModal(); return; }

  const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
  const mod = e.ctrlKey || e.metaKey;

  if(mod && e.key.toLowerCase()==='z' && !e.shiftKey){ e.preventDefault(); undo(); return; }
  if(mod && (e.key.toLowerCase()==='y' || (e.key.toLowerCase()==='z' && e.shiftKey))){ e.preventDefault(); redo(); return; }
  if(mod && e.key.toLowerCase()==='s'){ e.preventDefault(); exportJSONFile(); return; }
  if(mod && e.key.toLowerCase()==='d'){ e.preventDefault(); dupPage(); return; }
  if(mod && e.key==='0'){ e.preventDefault(); zoomFit(); return; }
  if(mod && e.key==='1'){ e.preventDefault(); zoom100(); return; }

  // page nav only when not typing
  if(!inField && !mod){
    if(e.key==='ArrowLeft'){ navPage(-1); }
    else if(e.key==='ArrowRight'){ navPage(1); }
    else if(e.key==='?'){ toggleShortcuts(); }
    else if(e.key==='g' || e.key==='G'){ setView(viewMode==='grid'?'single':'grid'); }
  }
});
