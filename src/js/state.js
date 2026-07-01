// ═══════════════════════════════
// STATE
// ═══════════════════════════════

let pages = [structuredClone(SAMPLE['vocab-grid'])];
let cur = 0;
let curTab = 'form';
let zoomLv = 0.7;
let docSizeKey = 'a4';
let exportMode = 'pdf';

function docW(){return DOC_SIZES[docSizeKey].W}
function docH(){return DOC_SIZES[docSizeKey].H}

// ═══════════════════════════════
// STATE UPDATERS
// text edits → debounced history; structural edits → immediate history
// ═══════════════════════════════
function uF(k,v){pages[cur][k]=v;rPreview();syncJSON();pushHistory()}
function uI(i,k,v){pages[cur].items[i][k]=v;rPreview();syncJSON();pushHistory()}
function uIHL(i,v){pages[cur].items[i].highlight=v.split(',').map(s=>s.trim()).filter(Boolean);rPreview();syncJSON();pushHistory()}
function uV(vi,k,v){pages[cur].verbs[vi][k]=v;rPreview();syncJSON();pushHistory()}
function uRow(vi,ri,k,v){pages[cur].verbs[vi].rows[ri][k]=v;rPreview();syncJSON();pushHistory()}
function uSp(s,k,v){if(!pages[cur].speakers)pages[cur].speakers={};if(!pages[cur].speakers[s])pages[cur].speakers[s]={};pages[cur].speakers[s][k]=v;rAll();pushHistory()}
function uLn(i,k,v){pages[cur].lines[i][k]=v;rPreview();syncJSON();pushHistory()}
function uLnHL(i,v){pages[cur].lines[i].highlight=v.split(',').map(s=>s.trim()).filter(Boolean);rPreview();syncJSON();pushHistory()}
function uG(gi,k,v){pages[cur].groups[gi][k]=v;rPreview();syncJSON();pushHistory()}
function uGI(gi,ii,k,v){pages[cur].groups[gi].items[ii][k]=v;rPreview();syncJSON();pushHistory()}
function uC(i,k,v){pages[cur].combinations[i][k]=v;rPreview();syncJSON();pushHistory()}
function addItem(t){if(!pages[cur].items)pages[cur].items=[];pages[cur].items.push({...t});rAll();pushHistory(true)}
function rmItem(i){const bak=snapshot();pages[cur].items.splice(i,1);rAll();pushHistory(true);toastUndo('Đã xoá',bak)}
function addVerb(){pages[cur].verbs.push({verb:'',meaning:'',color:'#4f46e5',rows:[{pronoun:'',form:'',meaning:''}]});rAll();pushHistory(true)}
function rmVerb(i){const bak=snapshot();pages[cur].verbs.splice(i,1);rAll();pushHistory(true);toastUndo('Đã xoá',bak)}
function addLine(){if(!pages[cur].lines)pages[cur].lines=[];pages[cur].lines.push({speaker:'A',text:'',translation:'',highlight:[]});rAll();pushHistory(true)}
function rmLine(i){const bak=snapshot();pages[cur].lines.splice(i,1);rAll();pushHistory(true);toastUndo('Đã xoá',bak)}
function addGroup(){if(!pages[cur].groups)pages[cur].groups=[];pages[cur].groups.push({title:'',subtitle:'',color:'#f0f4ff',titleColor:'#1e3a5f',items:[]});rAll();pushHistory(true)}
function rmGroup(gi){const bak=snapshot();pages[cur].groups.splice(gi,1);rAll();pushHistory(true);toastUndo('Đã xoá',bak)}
function addGI(gi){pages[cur].groups[gi].items.push({word:'',meaning:''});rAll();pushHistory(true)}
function addCombo(){if(!pages[cur].combinations)pages[cur].combinations=[];pages[cur].combinations.push({german:'',vietnamese:'',level:'',example_de:'',example_vi:''});rAll();pushHistory(true)}
function rmCombo(i){const bak=snapshot();pages[cur].combinations.splice(i,1);rAll();pushHistory(true);toastUndo('Đã xoá',bak)}

// image upload
function handleImgUpload(ev, key, idx) {
  const file = ev.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    // key like "items.2.image"
    const parts = key.split('.');
    if(parts[0]==='items') { pages[cur].items[parseInt(parts[1])].image = dataUrl; }
    const prev = document.getElementById('iprev_'+idx);
    if(prev){prev.src=dataUrl;prev.classList.add('show');}
    const clearBtn = prev?.nextElementSibling;
    if(clearBtn) clearBtn.style.display='flex';
    // hide placeholder text
    const zone = document.getElementById('iuz_'+idx);
    zone?.querySelectorAll('div').forEach(d=>d.style.display='none');
    rPreview(); syncJSON(); pushHistory(true);
  };
  reader.readAsDataURL(file);
}
function clearImg(ev, key, idx) {
  ev.stopPropagation();
  const parts = key.split('.');
  if(parts[0]==='items') pages[cur].items[parseInt(parts[1])].image = '';
  rAll(); pushHistory(true);
}

// ═══════════════════════════════
// PAGE BACKGROUND — màu hoặc ảnh nền cho trang
// pages[cur].bg = {type:'template'|'color'|'image', color, image, fit}
// ═══════════════════════════════
function setPageBgType(type){
  const p = pages[cur];
  if(!p.bg) p.bg = {};
  p.bg.type = type;
  if(type==='color' && !p.bg.color) p.bg.color = '#ffffff';
  if(type==='image' && !p.bg.fit)  p.bg.fit  = 'cover';
  rAll(); pushHistory(true);          // rAll: form đổi để hiện đúng ô điều khiển
}
// nền sáng mặc định cho 1 template. Chữ tự đổi theo nền nên không cần lớp phủ.
function bgForTemplate(template){
  return {type:'preset', preset:DEFAULT_BG_ID, overlay:0};
}
// trang cũ chưa có nền → gán nền sáng mặc định (idempotent)
function ensurePageBg(p){ if(p && !p.bg) p.bg = bgForTemplate(p.template); return p; }

// chọn 1 nền có sẵn; 'template' = về nền gốc của template.
// Màu chữ tự khớp độ sáng/tối của nền (xem pageIsDark) nên không cần scrim.
function setPageBgPreset(id){
  const p = pages[cur];
  if(id==='template'){ p.bg = {type:'template'}; rAll(); pushHistory(true); return; }
  if(!p.bg) p.bg = {};
  p.bg.type    = 'preset';
  p.bg.preset  = id;
  p.bg.overlay = 0;
  rAll(); pushHistory(true);
}
function setPageBgColor(v){
  const p = pages[cur];
  if(!p.bg) p.bg = {type:'color'};
  p.bg.color = v;
  rPreview(); syncJSON(); pushHistory();
}
function setPageBgFit(v){
  const p = pages[cur];
  if(!p.bg) p.bg = {type:'image'};
  p.bg.fit = v;
  rPreview(); syncJSON(); pushHistory(true);
}
function setPageBgOverlay(v){
  const p = pages[cur];
  if(!p.bg) p.bg = {};
  p.bg.overlay = Math.max(0, Math.min(0.92, (parseFloat(v)||0)/100));
  rPreview(); syncJSON(); pushHistory();   // rPreview (không rAll) để không reset slider khi kéo
}
function handleBgUpload(ev){
  const file = ev.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const p = pages[cur];
    if(!p.bg) p.bg = {};
    p.bg.type  = 'image';
    p.bg.image = e.target.result;
    if(!p.bg.fit) p.bg.fit = 'cover';
    if(p.bg.overlay == null) p.bg.overlay = 0.35;   // scrim mặc định để chữ đọc được ngay
    rAll(); pushHistory(true);
  };
  reader.readAsDataURL(file);
}
function clearBgImage(ev){
  if(ev) ev.stopPropagation();
  const p = pages[cur];
  if(p.bg){ p.bg.image = ''; if(p.bg.type==='image') p.bg.type = 'template'; }
  rAll(); pushHistory(true);
}
