// ═══════════════════════════════
// EXPORT MODAL & FILE EXPORT
// ═══════════════════════════════
let _exportFmt = 'pdf';
let _exporting = false;

function segPick(btn, groupId) {
  document.querySelectorAll(`#${groupId} .seg-btn`).forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
function openExport(fmt) {
  _exportFmt = fmt;
  document.getElementById('modal-title').textContent = fmt==='pdf'?'Xuất PDF':fmt==='png'?'Xuất PNG':'Xuất ZIP (nhiều ảnh)';
  document.getElementById('modal-dpi-row').style.display = '';
  document.getElementById('modal-do-btn').textContent = 'Tải xuống';
  document.getElementById('modal-overlay').classList.add('on');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('on'); }

function doExport() {
  if(_exporting){ return; }
  const pagesArr = document.querySelector('#modal-pages-seg .seg-btn.active').dataset.v==='all' ? pages : [pages[cur]];
  const scale = parseInt(document.querySelector('#modal-dpi-seg .seg-btn.active')?.dataset.v||'2');
  const W=docW(), H=docH();
  closeModal();
  if(_exportFmt==='pdf') exportPDF(pagesArr, W, H, scale);
  else if(_exportFmt==='png') exportPNG(pagesArr, W, H, scale);
  else exportZIP(pagesArr, W, H, scale);
}

function pageHTMLFull(body, W, H) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${FONT_EMBED}*{margin:0;padding:0;box-sizing:border-box}body{width:${W}px;}</style></head><body>${body}</body></html>`;
}

// Expand the requested page objects into a flat list of physical sheets,
// each {html, label} with global "X / Y" numbering across ALL pages.
function buildExportSheets(pagesArr, W, H) {
  const counts = pages.map(p => renderPageParts(p, W, H).length);
  const total = counts.reduce((a,b)=>a+b,0);
  const starts = []; let acc=0; counts.forEach(c=>{ starts.push(acc); acc+=c; });
  const sheets = [];
  pagesArr.forEach(p => {
    const gi = pages.indexOf(p);
    renderPageParts(p, W, H).forEach((part,k) => {
      const num = starts[gi]+k+1;
      sheets.push({ html: wrapPart(part, `${num} / ${total}`, W, H), num });
    });
  });
  return sheets;
}

function exportPDF(pagesArr, W, H, scale) {
  if(typeof html2canvas === 'undefined'){ toast('Chưa tải được html2canvas (cần mạng)'); return; }
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if(!JsPDF){ toast('Chưa tải được jsPDF (cần mạng)'); return; }
  _exporting = true;
  const sheets = buildExportSheets(pagesArr, W, H);
  toast(`Đang dựng PDF (${sheets.length} trang)...`);
  (async () => {
    try{
      const pdf = new JsPDF({ orientation: W>=H?'landscape':'portrait', unit:'px', format:[W,H], compress:true });
      let first = true;
      for(const s of sheets){
        const dataUrl = await renderToCanvas(pageHTMLFull(s.html, W, H), W, H, scale);
        if(!first) pdf.addPage([W,H], W>=H?'landscape':'portrait');
        pdf.addImage(dataUrl, 'PNG', 0, 0, W, H);
        first = false;
      }
      pdf.save('langcards.pdf');
      toast(`Đã tải PDF (${sheets.length} trang) ✓`);
    }catch(e){ toast('Lỗi xuất PDF: '+(e.message||e)); }
    _exporting = false;
  })();
}

async function exportPNG(pagesArr, W, H, scale) {
  if(typeof html2canvas === 'undefined'){ toast('Chưa tải được html2canvas (cần mạng)'); return; }
  _exporting = true;
  const sheets = buildExportSheets(pagesArr, W, H);
  toast(`Đang xuất ${sheets.length} ảnh PNG...`);
  try{
    for(const s of sheets){
      const dataUrl = await renderToCanvas(pageHTMLFull(s.html, W, H), W, H, scale);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `langcard_${String(s.num).padStart(2,'0')}.png`;
      a.click();
      await new Promise(r=>setTimeout(r,120));
    }
    toast(`Đã xuất ${sheets.length} ảnh PNG ✓`);
  }catch(e){ toast('Lỗi xuất PNG: '+(e.message||e)); }
  _exporting = false;
}

// Render an HTML string to a PNG dataURL via a hidden iframe + html2canvas.
// Robust against font/onload hang: waits for fonts then rasterises, with a hard timeout.
function renderToCanvas(html, W, H, scale) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `position:fixed;top:-99999px;left:-99999px;width:${W}px;height:${H}px;border:none;`;
    document.body.appendChild(iframe);

    let done = false;
    const cleanup = () => { try{ document.body.removeChild(iframe); }catch(_){} };
    const fail = (err) => { if(done) return; done=true; cleanup(); reject(err); };
    const ok   = (url) => { if(done) return; done=true; cleanup(); resolve(url); };

    // hard timeout so it never hangs forever
    const killer = setTimeout(()=>fail(new Error('hết thời gian render')), 20000);

    const rasterise = async () => {
      try{
        const doc = iframe.contentDocument;
        // wait for fonts if supported (don't block forever)
        if(doc.fonts && doc.fonts.ready){
          await Promise.race([doc.fonts.ready, new Promise(r=>setTimeout(r,1500))]);
        }
        const canvas = await html2canvas(doc.body, {
          scale: scale, width: W, height: H, useCORS:true, allowTaint:true, backgroundColor:null, logging:false
        });
        clearTimeout(killer);
        ok(canvas.toDataURL('image/png'));
      }catch(e){ clearTimeout(killer); fail(e); }
    };

    iframe.onload = () => setTimeout(rasterise, 60);
    // write content (more reliable than src=blob for onload + same-origin fonts API)
    const d = iframe.contentDocument || iframe.contentWindow.document;
    d.open(); d.write(html); d.close();
    // if onload already fired before handler attached, kick it
    setTimeout(()=>{ if(!done) rasterise(); }, 400);
  });
}

async function exportZIP(pagesArr, W, H, scale) {
  if(typeof html2canvas === 'undefined'){ toast('Chưa tải được html2canvas (cần mạng)'); return; }
  if(typeof JSZip === 'undefined'){ toast('Chưa tải được JSZip (cần mạng)'); return; }
  _exporting = true;
  const sheets = buildExportSheets(pagesArr, W, H);
  toast(`Đang dựng ${sheets.length} ảnh cho ZIP...`);
  try{
    const zip = new JSZip();
    for(const s of sheets){
      const dataUrl = await renderToCanvas(pageHTMLFull(s.html, W, H), W, H, scale);
      zip.file(`langcard_${String(s.num).padStart(2,'0')}.png`, dataUrl.split(',')[1], {base64:true});
    }
    const blob = await zip.generateAsync({type:'blob'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'langcards.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Đã tải ZIP ✓');
  }catch(e){ toast('Lỗi xuất ZIP: '+(e.message||e)); }
  _exporting = false;
}
