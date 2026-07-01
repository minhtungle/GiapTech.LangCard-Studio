// ═══════════════════════════════
// FORM BUILDERS
// ═══════════════════════════════

function langSel(v, onch) {
  return `<select class="fsel" onchange="${onch}">${LANG_OPTS.map(l=>`<option value="${l}" ${l==v?'selected':''}>${LANG_LABELS_UI[l]||l}</option>`).join('')}</select>`;
}
function inp(label, val, onch, ph='') {
  return `<div class="fg"><div class="fg-label">${label}</div><input class="fi" value="${esc(val||'')}" placeholder="${ph}" oninput="${onch}"></div>`;
}
function ta(label, val, onch, rows=2) {
  return `<div class="fg"><div class="fg-label">${label}</div><textarea class="fta" rows="${rows}" oninput="${onch}">${esc(val||'')}</textarea></div>`;
}
function colorPicker(label, val, onch) {
  const id = 'cp_'+Math.random().toString(36).slice(2);
  return `<div class="fg"><div class="fg-label">${label}</div>
    <div class="color-row">
      <div class="color-swatch" style="background:${esc(val||'#6366f1')}" id="sw_${id}" onclick="document.getElementById('${id}').click()"></div>
      <input class="fi" value="${esc(val||'#6366f1')}" oninput="${onch};document.getElementById('sw_${id}').style.background=this.value" style="flex:1">
      <input type="color" id="${id}" value="${esc(val||'#6366f1')}" oninput="this.previousElementSibling.previousElementSibling.style.background=this.value;this.previousElementSibling.value=this.value;${onch.replace('this.value','this.value')}" aria-label="${label}">
    </div></div>`;
}
function imgUpload(label, val, onch_key, idx) {
  const hasImg = !!val;
  return `<div class="fg"><div class="fg-label">${label}</div>
    <div class="img-upload-zone" id="iuz_${idx}">
      <input type="file" accept="image/*" onchange="handleImgUpload(event,'${onch_key}',${idx})" aria-label="${label}">
      ${hasImg ? `<img src="${esc(val)}" class="img-preview show" id="iprev_${idx}" alt="">
        <button class="img-clear" onclick="clearImg(event,'${onch_key}',${idx})" aria-label="Xoá">×</button>` :
        `<img class="img-preview" id="iprev_${idx}" alt="">
        <button class="img-clear" onclick="clearImg(event,'${onch_key}',${idx})" style="display:none" aria-label="Xoá">×</button>
        <div style="font-size:10px;color:var(--text3)">📷 Kéo ảnh vào đây</div>
        <div style="font-size:9px;color:var(--text3)">hoặc click để chọn</div>`}
    </div></div>`;
}

const _grpLabel = `style="margin-top:4px;font-size:11px;font-weight:600;color:var(--text2)"`;

// ── page background section (chung cho mọi template) ──
function imgUploadBg(val){
  const hasImg = !!val;
  return `<div class="fg"><div class="fg-label" style="font-size:9px">Ảnh nền</div>
    <div class="img-upload-zone" id="bg-uz">
      <input type="file" accept="image/*" onchange="handleBgUpload(event)" aria-label="Ảnh nền">
      ${hasImg
        ? `<img src="${esc(val)}" class="img-preview show" alt=""><button class="img-clear" onclick="clearBgImage(event)" aria-label="Xoá ảnh nền">×</button>`
        : `<img class="img-preview" alt=""><div style="font-size:10px;color:var(--text3)">📷 Kéo ảnh nền vào đây</div><div style="font-size:9px;color:var(--text3)">hoặc click để chọn</div>`}
    </div></div>`;
}
function fitSelect(fit){
  const opts = [['cover','Phủ đầy (cover)'],['contain','Vừa khung (contain)'],['repeat','Lặp lại (tile)']];
  return `<div class="fg"><div class="fg-label" style="font-size:9px">Kiểu hiển thị ảnh</div>
    <select class="fsel" onchange="setPageBgFit(this.value)">${opts.map(([v,l])=>`<option value="${v}" ${v===fit?'selected':''}>${l}</option>`).join('')}</select></div>`;
}
function overlaySlider(d){
  const pct = Math.round(((d.bg && d.bg.overlay) || 0) * 100);
  return `<div class="fg">
    <div class="fg-label" style="font-size:9px" id="bg-ov-label">Lớp phủ giúp chữ dễ đọc — ${pct}%</div>
    <input type="range" min="0" max="90" value="${pct}" style="width:100%;accent-color:var(--accent)"
      oninput="setPageBgOverlay(this.value);document.getElementById('bg-ov-label').textContent='Lớp phủ giúp chữ dễ đọc — '+this.value+'%'">
  </div>`;
}
function presetGallery(d){
  const b = d.bg || {};
  const curId = b.type==='preset' ? b.preset : ((b.type==='template'||!b.type) ? 'template' : null);
  const cell = (id,label,chip)=>`<button class="bg-swatch ${curId===id?'active':''}" title="${label}" onclick="setPageBgPreset('${id}')">
      <span class="bg-swatch-chip" style="background:${chip}"></span>
      <span class="bg-swatch-lbl">${label}</span>
    </button>`;
  const cells = cell('template','Theo template','repeating-linear-gradient(45deg,#c9c9d6 0 5px,#ececf2 5px 10px)')
    + BG_PRESETS.map(p=>cell(p.id,p.label,p.css)).join('');
  return `<div class="fg"><div class="fg-label" style="font-size:9px">Chọn nền có sẵn</div>
    <div class="bg-swatch-grid">${cells}</div></div>`;
}
function bgSection(d){
  const b = d.bg || {};
  const type = b.type || 'template';
  const inPreset = (type==='template' || type==='preset');
  const btn = (label,active,onc)=>`<button class="seg-btn ${active?'active':''}" onclick="${onc}">${label}</button>`;
  const seg = btn('Mặc định',inPreset,"setPageBgType('template')")
    + btn('Màu',type==='color',"setPageBgType('color')")
    + btn('Ảnh',type==='image',"setPageBgType('image')");
  let extra = '';
  if(inPreset){
    extra = presetGallery(d) + (type==='preset' ? overlaySlider(d) : '');
  } else if(type==='color'){
    extra = colorPicker('Màu nền trang', b.color||'#ffffff', "setPageBgColor(this.value)")
      + overlaySlider(d);
  } else if(type==='image'){
    extra = imgUploadBg(b.image||'')
      + fitSelect(b.fit||'cover')
      + colorPicker('Màu phía sau ảnh', b.color||'#ffffff', "setPageBgColor(this.value)")
      + overlaySlider(d);
  }
  return `<div class="icard" style="margin-bottom:4px">
    <div class="fg-label">🎨 Nền trang</div>
    <div class="seg seg-sm">${seg}</div>
    ${extra}
  </div>`;
}

function buildForm(d) {
  const tt = d.template;
  let body = '';
  if(tt==='vocab-grid') body = formVocab(d);
  else if(tt==='sentence-pairs') body = formSentence(d);
  else if(tt==='conjugation') body = formConj(d);
  else if(tt==='idiom-spotlight') body = formIdiom(d);
  else if(tt==='dialogue') body = formDialog(d);
  else if(tt==='word-map') body = formWordMap(d);
  else if(tt==='word-family') body = formWordFamily(d);
  return bgSection(d) + body;
}

function formVocab(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    <div class="row2">${inp('Cấp độ',d.level,"uF('level',this.value)",'B1')}${inp('Chủ đề',d.topic,"uF('topic',this.value)",'Thema')}</div>
    ${inp('Nghĩa chủ đề (VN)',d.topicMeaning,"uF('topicMeaning',this.value)",'ví dụ: căn nhà')}
    <div class="fg-label" ${_grpLabel}>Từ vựng (tối đa 6)</div>`;
  (d.items||[]).forEach((it,i)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Từ ${i+1}</span><button class="icard-del" onclick="rmItem(${i})" aria-label="Xoá">×</button></div>
      <div class="row2">
        ${inp('Từ',it.word,`uI(${i},'word',this.value)`)}
        ${inp('Nghĩa',it.meaning,`uI(${i},'meaning',this.value)`)}
      </div>
      <div class="row2">
        <div class="fg"><div class="fg-label">Từ loại</div><select class="fsel" onchange="uI(${i},'type',this.value)">${['NOMEN','VERB','ADJ','ADV','PREP','OTHER'].map(x=>`<option ${x==it.type?'selected':''}>${x}</option>`).join('')}</select></div>
        ${inp('Ghi chú',it.note,`uI(${i},'note',this.value)`,'f · -n')}
      </div>
      ${imgUpload('Ảnh minh hoạ (tuỳ chọn)',it.image||'',`items.${i}.image`,i)}
    </div>`;
  });
  h+=`<button class="add-row" onclick="addItem({word:'',meaning:'',type:'NOMEN',note:'',image:''})">+ Thêm từ</button>`;
  return h;
}

function formSentence(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    <div class="row2">${inp('Tiêu đề trang',d.title,"uF('title',this.value)",'Office English')}${inp('Cấp độ',d.level,"uF('level',this.value)",'A2–B1')}</div>
    ${inp('Chủ đề',d.topic,"uF('topic',this.value)",'Phrasal Verbs')}
    <div class="fg-label" ${_grpLabel}>Cặp câu (tối đa 6)</div>`;
  (d.items||[]).forEach((it,i)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Câu ${i+1}</span><button class="icard-del" onclick="rmItem(${i})" aria-label="Xoá">×</button></div>
      ${ta('Câu gốc',it.sentence,`uI(${i},'sentence',this.value)`)}
      ${inp('Bản dịch',it.translation,`uI(${i},'translation',this.value)`)}
      ${inp('Highlight (phân cách phẩy)',( it.highlight||[]).join(', '),`uIHL(${i},this.value)`,'turn down, wrap up')}
    </div>`;
  });
  h+=`<button class="add-row" onclick="addItem({sentence:'',translation:'',highlight:[]})">+ Thêm câu</button>`;
  return h;
}

function formConj(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    ${inp('Thì/Tense',d.tense,"uF('tense',this.value)")}
    ${inp('Ghi chú cuối trang',d.note,"uF('note',this.value)")}
    <div class="fg-label" ${_grpLabel}>Động từ (tối đa 2)</div>`;
  (d.verbs||[]).forEach((v,vi)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Động từ ${vi+1}</span>${vi>0?`<button class="icard-del" onclick="rmVerb(${vi})" aria-label="Xoá">×</button>`:''}</div>
      <div class="row2">
        ${inp('Động từ',v.verb,`uV(${vi},'verb',this.value)`)}
        ${inp('Nghĩa',v.meaning,`uV(${vi},'meaning',this.value)`)}
      </div>
      ${colorPicker('Màu header',v.color,`uV(${vi},'color',this.value)`)}
      <div class="fg-label" style="font-size:9px">Các ngôi chia (đại từ · dạng chia)</div>
      ${(v.rows||[]).map((r,ri)=>`<div class="row3">
        <input class="fi" value="${esc(r.pronoun)}" placeholder="đại từ" oninput="uRow(${vi},${ri},'pronoun',this.value)" style="font-size:11px">
        <input class="fi" value="${esc(r.form)}" placeholder="dạng chia" oninput="uRow(${vi},${ri},'form',this.value)" style="font-size:11px">
        <input class="fi" value="${esc(r.meaning||'')}" placeholder="nghĩa" oninput="uRow(${vi},${ri},'meaning',this.value)" style="font-size:11px">
      </div>`).join('')}
    </div>`;
  });
  if((d.verbs||[]).length<2) h+=`<button class="add-row" onclick="addVerb()">+ Thêm động từ</button>`;
  return h;
}

function formIdiom(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    ${inp('Chủ đề / Tiêu đề trang',d.topic,"uF('topic',this.value)")}
    <div class="fg-label" ${_grpLabel}>Thành ngữ (tối đa 5)</div>`;
  (d.items||[]).forEach((it,i)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Idiom ${i+1}</span><button class="icard-del" onclick="rmItem(${i})" aria-label="Xoá">×</button></div>
      <div class="row2">
        ${inp('Idiom',it.idiom,`uI(${i},'idiom',this.value)`)}
        ${inp('Nghĩa ngắn',it.meaning,`uI(${i},'meaning',this.value)`)}
      </div>
      ${ta('Giải thích',it.explanation,`uI(${i},'explanation',this.value)`)}
      ${inp('Câu ví dụ',it.example,`uI(${i},'example',this.value)`)}
      ${colorPicker('Màu nhấn',it.color||'#6366f1',`uI(${i},'color',this.value)`)}
    </div>`;
  });
  h+=`<button class="add-row" onclick="addItem({idiom:'',meaning:'',explanation:'',example:'',color:'#6366f1'})">+ Thêm idiom</button>`;
  return h;
}

function formDialog(d) {
  const spA=(d.speakers||{}).A||{name:'Staff',color:'#0284c7'};
  const spB=(d.speakers||{}).B||{name:'Customer',color:'#16a34a'};
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    <div class="row2">${inp('Cảnh',d.scene,"uF('scene',this.value)",'At the café')}${inp('Cấp độ',d.level,"uF('level',this.value)",'A2')}</div>
    <div class="row2">
      <div class="icard" style="gap:5px">
        <div class="fg-label">Nhân vật A</div>
        ${inp('Tên',spA.name,"uSp('A','name',this.value)")}
        ${colorPicker('Màu',spA.color,"uSp('A','color',this.value)")}
      </div>
      <div class="icard" style="gap:5px">
        <div class="fg-label">Nhân vật B</div>
        ${inp('Tên',spB.name,"uSp('B','name',this.value)")}
        ${colorPicker('Màu',spB.color,"uSp('B','color',this.value)")}
      </div>
    </div>
    ${inp('Từ khoá tóm tắt (phân cách phẩy)',(d.keywords||[]).join(', '),"uF('keywords',this.value.split(',').map(s=>s.trim()).filter(Boolean))")}
    <div class="fg-label" ${_grpLabel}>Lượt thoại (tối đa 5)</div>`;
  (d.lines||[]).forEach((ln,i)=>{
    h+=`<div class="icard">
      <div class="icard-head">
        <span class="icard-title">Lượt ${i+1}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <select class="fsel" style="padding:3px 7px;font-size:11px;width:auto" onchange="uLn(${i},'speaker',this.value)">
            <option value="A" ${ln.speaker=='A'?'selected':''}>A — ${esc(spA.name)}</option>
            <option value="B" ${ln.speaker=='B'?'selected':''}>B — ${esc(spB.name)}</option>
          </select>
          <button class="icard-del" onclick="rmLine(${i})" aria-label="Xoá">×</button>
        </div>
      </div>
      ${ta('Câu gốc',ln.text,`uLn(${i},'text',this.value)`)}
      ${inp('Bản dịch',ln.translation,`uLn(${i},'translation',this.value)`)}
      ${inp('Highlight (phân cách phẩy)',(ln.highlight||[]).join(', '),`uLnHL(${i},this.value)`)}
    </div>`;
  });
  h+=`<button class="add-row" onclick="addLine()">+ Thêm lượt thoại</button>`;
  return h;
}

function formWordMap(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    <div class="row2">${inp('Chủ đề chính',d.topic,"uF('topic',this.value)",'REISEN')}${inp('Nghĩa VN',d.topicMeaning,"uF('topicMeaning',this.value)",'đi du lịch')}</div>
    <div class="fg-label" ${_grpLabel}>Nhóm từ (tối đa 4)</div>`;
  (d.groups||[]).forEach((g,gi)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Nhóm ${gi+1}</span><button class="icard-del" onclick="rmGroup(${gi})" aria-label="Xoá">×</button></div>
      <div class="row2">
        ${inp('Tiêu đề',g.title,`uG(${gi},'title',this.value)`)}
        ${inp('Nhãn phụ',g.subtitle,`uG(${gi},'subtitle',this.value)`)}
      </div>
      <div class="row2">
        ${colorPicker('Nền ô',g.color,`uG(${gi},'color',this.value)`)}
        ${colorPicker('Màu tiêu đề',g.titleColor,`uG(${gi},'titleColor',this.value)`)}
      </div>
      <div class="fg-label" style="font-size:9px">Từ trong nhóm</div>
      ${(g.items||[]).map((it,ii)=>`<div class="row2" style="gap:5px">
        <input class="fi" value="${esc(it.word)}" placeholder="từ" oninput="uGI(${gi},${ii},'word',this.value)" style="font-size:11px">
        <input class="fi" value="${esc(it.meaning)}" placeholder="nghĩa" oninput="uGI(${gi},${ii},'meaning',this.value)" style="font-size:11px">
      </div>`).join('')}
      <button class="add-row" onclick="addGI(${gi})" style="padding:4px">+ từ</button>
    </div>`;
  });
  if((d.groups||[]).length<4) h+=`<button class="add-row" onclick="addGroup()">+ Thêm nhóm</button>`;
  return h;
}

function formWordFamily(d) {
  let h = `<div class="fg"><div class="fg-label">Ngôn ngữ</div>${langSel(d.lang,"uF('lang',this.value)")}</div>
    <div class="row2">${inp('Từ gốc',d.base_word,"uF('base_word',this.value)",'lernen')}${inp('Từ loại',d.word_type,"uF('word_type',this.value)",'Verb')}</div>
    <div class="row2">${inp('Nghĩa',d.meaning,"uF('meaning',this.value)",'học')}${inp('Cấp độ (range)',d.level_range,"uF('level_range',this.value)",'A1-C1')}</div>
    ${inp('Chủ đề',d.topic,"uF('topic',this.value)",'Giao tiếp và ngôn ngữ')}
    <div class="fg-label" ${_grpLabel}>Cụm từ ghép (tối đa 5)</div>`;
  (d.combinations||[]).forEach((c,i)=>{
    h+=`<div class="icard">
      <div class="icard-head"><span class="icard-title">Cụm ${i+1}</span><button class="icard-del" onclick="rmCombo(${i})" aria-label="Xoá">×</button></div>
      <div class="row2">
        ${inp('Cụm từ (gốc)',c.german,`uC(${i},'german',this.value)`,'Deutsch lernen')}
        ${inp('Nghĩa (VN)',c.vietnamese,`uC(${i},'vietnamese',this.value)`,'học tiếng Đức')}
      </div>
      ${inp('Cấp độ',c.level,`uC(${i},'level',this.value)`,'A1')}
      ${ta('Ví dụ (gốc)',c.example_de,`uC(${i},'example_de',this.value)`)}
      ${inp('Ví dụ (VN)',c.example_vi,`uC(${i},'example_vi',this.value)`)}
    </div>`;
  });
  h+=`<button class="add-row" onclick="addCombo()">+ Thêm cụm từ</button>`;
  return h;
}
