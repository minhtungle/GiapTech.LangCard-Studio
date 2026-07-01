// ═══════════════════════════════
// TEMPLATE RENDERERS
// Each returns an ARRAY of "parts" — one per physical sheet.
// When content overflows, it spills onto continuation sheets that
// carry only the body (the header appears on the first sheet only).
// Every part is {content, bg, dark}; the caller wraps it with a footer.
// All CSS is inline so exports are pixel-perfect regardless of context.
// ═══════════════════════════════

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

function highlight(text, terms=[]) {
  let s = esc(text);
  terms.forEach(t => {
    if(!t) return;
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
    s = s.replace(re, m=>`<mark style="background:#fde68a;color:#92400e;padding:1px 4px;border-radius:3px;font-weight:600;font-style:normal">${m}</mark>`);
  });
  return s;
}

// ── ADAPTIVE PALETTE ───────────────────────────
// Text/surface tokens picked by the *effective* darkness of the page so text
// stays readable on any chosen background. Accent hues (type/level/speaker
// colours, amber notes, pastel group cards) keep their own colours.
function pal(dark){
  return dark ? {
    fg:'#f1f5f9', fg2:'#94a3b8', fg3:'#64748b', fg4:'#475569',
    card:'rgba(255,255,255,.06)', cardBd:'rgba(255,255,255,.1)', rule:'rgba(255,255,255,.08)',
    chipBg:'rgba(255,255,255,.07)', chipBd:'rgba(255,255,255,.1)'
  } : {
    fg:'#1c1917', fg2:'#57534e', fg3:'#78716c', fg4:'#a8a29e',
    card:'#ffffff', cardBd:'#e5e7eb', rule:'#eceaf0',
    chipBg:'#f5f5f4', chipBd:'#e0ddd8'
  };
}

// luminance test for a hex colour → true if dark. null if not a hex.
function colorIsDark(c){
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(String(c||'').trim());
  if(!m) return null;
  let h = m[1]; if(h.length===3) h = h.split('').map(x=>x+x).join('');
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  return (0.299*r + 0.587*g + 0.114*b)/255 < 0.55;
}

// effective darkness of a page: from preset/colour bg, else the template's native design.
function pageIsDark(d){
  const b = d && d.bg;
  if(b && b.type==='preset' && typeof BG_PRESETS!=='undefined'){
    const pr = BG_PRESETS.find(x=>x.id===b.preset); if(pr) return !!pr.dark;
  }
  if(b && b.type==='color'){ const r = colorIsDark(b.color); if(r!==null) return r; }
  return !!(typeof TEMPLATE_DARK!=='undefined' && TEMPLATE_DARK[d.template]);
}

// shared wrapper with doc-size aware dimensions
function pageWrap(content, bg, W, H, extraStyle='') {
  return `<div style="width:${W}px;min-height:${H}px;background:${bg};font-family:-apple-system,'Segoe UI',system-ui,sans-serif;position:relative;overflow:hidden;${extraStyle}">${content}</div>`;
}

// split a list into chunks: `first` items on sheet 1, `rest` on each later sheet.
// Always returns at least one (possibly empty) chunk so the header sheet still renders.
function chunkList(arr, first, rest) {
  const a = arr || [];
  if(a.length === 0) return [[]];
  const out = [a.slice(0, first)];
  for(let i=first; i<a.length; i+=rest) out.push(a.slice(i, i+rest));
  return out;
}

// wrap one part with its page-number footer + page background
function wrapPart(part, pn, W, H) {
  const col = part.dark ? 'rgba(255,255,255,.15)' : '#cbd5e1';
  const footer = pn ? `<div style="position:absolute;bottom:14px;width:100%;text-align:center;font-size:9px;color:${col}">${esc(pn)}</div>` : '';
  return pageWrap(part.content + footer, part.bg, W, H);
}

// ── 1. VOCAB GRID ──────────────────────────────
function renderVocabGridParts(d, W, H, dark=true) {
  const t = pal(dark);
  const bg = 'linear-gradient(145deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)';
  const header = `
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:${Math.round(H*0.025)}px">
        <div>
          <div style="font-size:9px;color:${t.fg4};letter-spacing:.15em;font-weight:700;text-transform:uppercase;margin-bottom:3px">${LANG_LABEL[d.lang]||esc(d.lang||'')}</div>
          <div style="font-size:${Math.round(W*0.05)}px;color:${t.fg};font-weight:700;letter-spacing:-.5px;font-family:'Fraunces',Georgia,serif">${esc(d.topic||'')}</div>
          ${d.topicMeaning?`<div style="font-size:${Math.round(W*0.022)}px;color:${t.fg3};margin-top:2px">${esc(d.topicMeaning)}</div>`:''}
        </div>
        <span style="font-size:10px;color:${t.fg3};background:${t.chipBg};padding:3px 10px;border-radius:20px;border:1px solid ${t.chipBd}">${esc(d.level||'')}</span>
      </div>`;

  return chunkList(d.items, 6, 9).map((items, ci) => {
    const cols = items.length<=2?2:items.length<=4?2:3;
    const cards = items.map(it => {
      const tc = TYPE_COLOR[it.type]||'#94a3b8';
      const tbg = TYPE_BG[it.type]||'rgba(148,163,184,.12)';
      const imgTag = it.image ? `<img src="${esc(it.image)}" style="width:100%;height:${Math.round(H*0.09)}px;object-fit:cover;border-radius:6px;margin-bottom:6px">` : '';
      return `<div style="background:${t.card};border:1px solid ${t.cardBd};border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;backdrop-filter:blur(4px)">
        ${imgTag}
        <div style="display:inline-flex;align-items:center;gap:4px">
          <span style="font-size:9px;font-weight:700;letter-spacing:.1em;color:${tc};background:${tbg};padding:2px 7px;border-radius:20px">${esc(it.type||'')}</span>
        </div>
        <div style="font-size:${Math.round(W*0.038)}px;color:${t.fg};font-weight:700;line-height:1.25;letter-spacing:-.2px">${esc(it.word||'')}</div>
        <div style="font-size:${Math.round(W*0.023)}px;color:${t.fg2};line-height:1.4">${esc(it.meaning||'')}</div>
        ${it.note?`<div style="font-size:${Math.round(W*0.018)}px;color:${t.fg4};margin-top:auto;font-style:italic">${esc(it.note)}</div>`:''}
      </div>`;
    }).join('');

    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${Math.round(W*0.02)}px">${cards}</div>
      </div>`;
    return { content, bg, dark };
  });
}

// ── 2. SENTENCE PAIRS ──────────────────────────
function renderSentencePairsParts(d, W, H, dark=false) {
  const t = pal(dark);
  const bg = '#fffdf7';
  const header = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${Math.round(H*0.012)}px">
        <div>
          <div style="font-size:9px;color:${t.fg4};letter-spacing:.14em;font-weight:700;text-transform:uppercase;margin-bottom:4px">${LANG_LABEL[d.lang]||''} · ${esc(d.topic||'')}</div>
          <div style="font-size:${Math.round(W*0.042)}px;color:${t.fg};font-weight:700;font-family:'Fraunces',Georgia,serif;letter-spacing:-.3px">${esc(d.title||d.topic||'Câu mẫu')}</div>
        </div>
        ${d.level?`<span style="background:#fef3c7;color:#92400e;font-size:10px;padding:4px 12px;border-radius:20px;font-weight:600;flex-shrink:0">${esc(d.level)}</span>`:''}
      </div>
      <div style="width:${Math.round(W*0.12)}px;height:3px;background:#f59e0b;border-radius:2px;margin-bottom:${Math.round(H*0.03)}px"></div>`;

  return chunkList(d.items, 6, 9).map((items, ci) => {
    const rows = items.map((it,i) => {
      const active = ci===0 && i===0;
      const lineHtml = highlight(it.sentence||'', it.highlight||[]);
      return `<div style="border-left:3px solid ${active?'#f59e0b':t.rule};padding-left:${Math.round(W*0.03)}px;padding-top:3px;padding-bottom:3px">
        <div style="font-size:${Math.round(W*0.028)}px;color:${t.fg};font-weight:600;line-height:1.45;margin-bottom:4px">${lineHtml}</div>
        <div style="font-size:${Math.round(W*0.02)}px;color:${t.fg3};line-height:1.5;font-style:italic">${esc(it.translation||'')}</div>
      </div>`;
    }).join('');

    const content = `
      <div style="padding:${Math.round(H*0.045)}px ${Math.round(W*0.065)}px">
        ${ci===0 ? header : ''}
        <div style="display:flex;flex-direction:column;gap:${Math.round(H*0.022)}px">${rows}</div>
      </div>`;
    return { content, bg, dark };
  });
}

// ── 3. CONJUGATION ─────────────────────────────
function renderConjugationParts(d, W, H, dark=false) {
  const t = pal(dark);
  const bg = '#f8fafc';
  const header = `
      <div style="text-align:center;margin-bottom:${Math.round(H*0.025)}px">
        <div style="font-size:9px;color:#6366f1;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px">${LANG_LABEL[d.lang]||''} · ${esc(d.tense||'')}</div>
        <div style="font-size:${Math.round(W*0.055)}px;color:${t.fg};font-weight:700;font-family:'Fraunces',Georgia,serif;letter-spacing:-.5px">${(d.verbs||[]).map(v=>esc(v.verb)).join(' &amp; ')}</div>
      </div>`;
  const noteHtml = d.note?`<div style="margin-top:${Math.round(H*0.015)}px;background:#fef3c7;border-left:3px solid #f59e0b;padding:${Math.round(H*0.012)}px ${Math.round(W*0.025)}px;border-radius:0 6px 6px 0;font-size:${Math.round(W*0.019)}px;color:#92400e"><strong>Lưu ý:</strong> ${esc(d.note)}</div>`:'';

  const chunks = chunkList(d.verbs, 2, 2);
  return chunks.map((verbs, ci) => {
    const tables = verbs.map(v => {
      const rows = (v.rows||[]).map((r,i)=>`<tr style="background:${i%2===0?v.bgLight||'rgba(79,70,229,.05)':t.card}">
        <td style="padding:${Math.round(H*0.009)}px ${Math.round(W*0.02)}px;color:${t.fg3};font-weight:600;font-size:${Math.round(W*0.019)}px;${i?'border-top:1px solid '+t.rule:''}">${esc(r.pronoun)}</td>
        <td style="padding:${Math.round(H*0.009)}px ${Math.round(W*0.02)}px;color:${t.fg};font-weight:800;font-size:${Math.round(W*0.023)}px;letter-spacing:-.2px;${i?'border-top:1px solid '+t.rule:''}">${esc(r.form)}</td>
        <td style="padding:${Math.round(H*0.009)}px ${Math.round(W*0.02)}px;color:${t.fg2};font-size:${Math.round(W*0.017)}px;${i?'border-top:1px solid '+t.rule:''}">${esc(r.meaning||'')}</td>
      </tr>`).join('');
      return `<div style="border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="background:${v.color||'#4f46e5'};color:#fff;padding:${Math.round(H*0.012)}px ${Math.round(W*0.025)}px;display:flex;align-items:baseline;gap:8px">
          <span style="font-size:${Math.round(W*0.028)}px;font-weight:800;letter-spacing:-.2px">${esc(v.verb)}</span>
          <span style="font-size:${Math.round(W*0.019)}px;opacity:.75">— ${esc(v.meaning)}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;background:${t.card}">${rows}</table>
      </div>`;
    }).join('');

    const isLast = ci === chunks.length-1;
    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:${Math.round(W*0.025)}px">${tables}</div>
        ${isLast ? noteHtml : ''}
      </div>`;
    return { content, bg, dark };
  });
}

// ── 4. IDIOM SPOTLIGHT ─────────────────────────
function renderIdiomSpotlightParts(d, W, H, dark=true) {
  const t = pal(dark);
  const bg = 'linear-gradient(160deg,#0f172a 0%,#1e1b2e 100%)';
  const header = `
      <div style="margin-bottom:${Math.round(H*0.025)}px">
        <div style="font-size:9px;color:#818cf8;letter-spacing:.15em;font-weight:700;text-transform:uppercase;margin-bottom:5px">${LANG_LABEL[d.lang]||''}</div>
        <div style="font-size:${Math.round(W*0.05)}px;color:${t.fg};font-weight:700;font-family:'Fraunces',Georgia,serif;letter-spacing:-.4px">${esc(d.topic||'Idioms')}</div>
      </div>`;

  return chunkList(d.items, 5, 7).map((items, ci) => {
    const cards = items.map(it => `
      <div style="background:${t.card};border:1px solid ${t.cardBd};border-left:3px solid ${it.color||'#6366f1'};border-radius:0 8px 8px 0;padding:${Math.round(H*0.014)}px ${Math.round(W*0.035)}px">
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:${Math.round(H*0.007)}px">
          <span style="font-size:${Math.round(W*0.032)}px;color:${t.fg};font-weight:700;letter-spacing:-.2px">${esc(it.idiom||'')}</span>
          <span style="font-size:9px;color:${it.color||'#818cf8'};border:1px solid ${it.color||'#6366f1'};padding:2px 8px;border-radius:20px;font-weight:600;white-space:nowrap">${esc(it.meaning||'')}</span>
        </div>
        <div style="font-size:${Math.round(W*0.02)}px;color:${t.fg2};line-height:1.5;margin-bottom:${Math.round(H*0.006)}px">${esc(it.explanation||'')}</div>
        <div style="font-size:${Math.round(W*0.018)}px;color:${t.fg4};font-style:italic">"${esc(it.example||'')}"</div>
      </div>`).join('');

    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:flex;flex-direction:column;gap:${Math.round(H*0.014)}px">${cards}</div>
      </div>`;
    return { content, bg, dark };
  });
}

// ── 5. DIALOGUE ────────────────────────────────
function renderDialogueParts(d, W, H, dark=false) {
  const t = pal(dark);
  const bg = '#f1f5f9';
  const spA = (d.speakers||{}).A||{name:'A',color:'#0284c7'};
  const spB = (d.speakers||{}).B||{name:'B',color:'#16a34a'};
  const header = `
      <div style="text-align:center;margin-bottom:${Math.round(H*0.025)}px">
        <div style="font-size:9px;color:${t.fg3};letter-spacing:.14em;font-weight:700;text-transform:uppercase;margin-bottom:4px">${LANG_LABEL[d.lang]||''} · ${esc(d.level||'')}</div>
        <div style="font-size:${Math.round(W*0.046)}px;color:${t.fg};font-weight:700;font-family:'Fraunces',Georgia,serif;letter-spacing:-.3px">${esc(d.scene||'')}</div>
      </div>`;
  const kw = (d.keywords||[]).length ? `<div style="margin-top:${Math.round(H*0.015)}px;background:#e0f2fe;border-radius:6px;padding:${Math.round(H*0.01)}px ${Math.round(W*0.025)}px;font-size:${Math.round(W*0.019)}px;color:#0369a1"><strong>Cụm từ khoá:</strong> ${(d.keywords||[]).map(k=>esc(k)).join(' · ')}</div>` : '';

  const chunks = chunkList(d.lines, 5, 8);
  return chunks.map((lns, ci) => {
    const lines = lns.map(ln => {
      const sp = ln.speaker==='B' ? spB : spA;
      const isB = ln.speaker==='B';
      const txt = highlight(ln.text||'', ln.highlight||[]);
      // A = neutral bubble (adapts to mode); B = fixed green accent bubble (dark text)
      const bBg  = isB ? '#dcfce7' : t.card;
      const bFg  = isB ? '#14532d' : t.fg;
      const bFg2 = isB ? '#3f6212' : t.fg3;
      const bubble = `<div style="background:${bBg};border-radius:${isB?'10px 2px 10px 10px':'2px 10px 10px 10px'};padding:${Math.round(H*0.012)}px ${Math.round(W*0.03)}px;max-width:76%;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <div style="font-size:${Math.round(W*0.024)}px;color:${bFg};font-weight:600;line-height:1.45;margin-bottom:4px">${txt}</div>
        <div style="font-size:${Math.round(W*0.018)}px;color:${bFg2};font-style:italic;line-height:1.4">${esc(ln.translation||'')}</div>
      </div>`;
      const av = `<div style="width:${Math.round(W*0.052)}px;height:${Math.round(W*0.052)}px;border-radius:50%;background:${sp.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:700;font-size:${Math.round(W*0.022)}px">${esc(sp.name.charAt(0))}</div>`;
      return isB
        ? `<div style="display:flex;gap:${Math.round(W*0.015)}px;flex-direction:row-reverse;align-items:flex-start">${av}${bubble}</div>`
        : `<div style="display:flex;gap:${Math.round(W*0.015)}px;align-items:flex-start">${av}${bubble}</div>`;
    }).join('');

    const isLast = ci === chunks.length-1;
    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:flex;flex-direction:column;gap:${Math.round(H*0.016)}px">${lines}</div>
        ${isLast ? kw : ''}
      </div>`;
    return { content, bg, dark };
  });
}

// ── 6. WORD MAP ────────────────────────────────
function renderWordMapParts(d, W, H, dark=false) {
  const t = pal(dark);
  const bg = '#fafaf9';
  const header = `
      <div style="text-align:center;margin-bottom:${Math.round(H*0.025)}px">
        <div style="font-size:9px;color:#d97706;letter-spacing:.15em;font-weight:700;text-transform:uppercase;margin-bottom:4px">${LANG_LABEL[d.lang]||''} · Wortfeld</div>
        <div style="font-size:${Math.round(W*0.065)}px;color:${t.fg};font-weight:700;font-family:'Fraunces',Georgia,serif;letter-spacing:-1px;line-height:1">${esc(d.topic||'')}</div>
        ${d.topicMeaning?`<div style="font-size:${Math.round(W*0.022)}px;color:${t.fg2};margin-top:4px">${esc(d.topicMeaning)}</div>`:''}
      </div>`;

  return chunkList(d.groups, 4, 6).map((grps, ci) => {
    const groups = grps.map(g => {
      const wordRows = (g.items||[]).map(it=>`<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;padding:${Math.round(H*0.006)}px 0;border-bottom:1px solid rgba(0,0,0,.05)">
        <span style="color:#1c1917;font-weight:600;font-size:${Math.round(W*0.021)}px">${esc(it.word||'')}</span>
        <span style="color:#78716c;font-size:${Math.round(W*0.019)}px;text-align:right">${esc(it.meaning||'')}</span>
      </div>`).join('');
      return `<div style="background:${g.color||'#fef3c7'};border-radius:10px;padding:${Math.round(H*0.018)}px ${Math.round(W*0.028)}px">
        <div style="font-size:9px;color:${g.titleColor||'#92400e'};font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:${Math.round(H*0.01)}px">${esc(g.title||'')} <span style="font-weight:400;opacity:.7">· ${esc(g.subtitle||'')}</span></div>
        ${wordRows}
      </div>`;
    }).join('');

    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:${Math.round(W*0.022)}px">${groups}</div>
      </div>`;
    return { content, bg, dark };
  });
}

// ── 7. WORD FAMILY ─────────────────────────────
function renderWordFamilyParts(d, W, H, dark=true) {
  const t = pal(dark);
  const bg = 'linear-gradient(150deg,#0f172a 0%,#172554 55%,#0f172a 100%)';
  const LV = {A1:'#22c55e',A2:'#10b981',B1:'#3b82f6',B2:'#6366f1',C1:'#a855f7',C2:'#ec4899'};
  const header = `
      <div style="margin-bottom:${Math.round(H*0.028)}px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <div style="font-size:9px;color:${t.fg4};letter-spacing:.15em;font-weight:700;text-transform:uppercase">${LANG_LABEL[d.lang]||esc(d.lang||'')}</div>
          ${d.topic?`<div style="font-size:9px;color:${t.fg4}">· ${esc(d.topic)}</div>`:''}
        </div>
        <div style="display:flex;align-items:baseline;gap:${Math.round(W*0.022)}px;flex-wrap:wrap">
          <span style="font-size:${Math.round(W*0.075)}px;color:${t.fg};font-weight:700;letter-spacing:-1px;font-family:'Fraunces',Georgia,serif;line-height:1">${esc(d.base_word||'')}</span>
          ${d.word_type?`<span style="font-size:10px;font-weight:700;color:${dark?'#fbbf24':'#b45309'};background:rgba(251,191,36,${dark?'.14':'.22'});padding:3px 11px;border-radius:20px">${esc(d.word_type)}</span>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
          ${d.meaning?`<span style="font-size:${Math.round(W*0.026)}px;color:${t.fg2}">${esc(d.meaning)}</span>`:''}
          ${d.level_range?`<span style="font-size:10px;color:${t.fg3};background:${t.chipBg};padding:3px 10px;border-radius:20px;border:1px solid ${t.chipBd}">${esc(d.level_range)}</span>`:''}
        </div>
      </div>
      <div style="width:${Math.round(W*0.12)}px;height:3px;background:linear-gradient(90deg,#60a5fa,#a855f7);border-radius:2px;margin-bottom:${Math.round(H*0.025)}px"></div>`;

  return chunkList(d.combinations, 5, 7).map((combos, ci) => {
    const cards = combos.map(c => {
      const lvc = LV[(c.level||'').toUpperCase()] || '#64748b';
      return `<div style="background:${t.card};border:1px solid ${t.cardBd};border-radius:10px;padding:${Math.round(H*0.014)}px ${Math.round(W*0.032)}px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:${Math.round(H*0.006)}px">
          <div style="display:flex;align-items:baseline;gap:${Math.round(W*0.02)}px;flex-wrap:wrap">
            <span style="font-size:${Math.round(W*0.032)}px;color:${t.fg};font-weight:700;letter-spacing:-.2px">${esc(c.german||'')}</span>
            <span style="font-size:${Math.round(W*0.022)}px;color:${dark?'#7dd3fc':'#0369a1'}">${esc(c.vietnamese||'')}</span>
          </div>
          ${c.level?`<span style="font-size:9px;font-weight:700;color:${lvc};border:1px solid ${lvc};padding:2px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0">${esc(c.level)}</span>`:''}
        </div>
        ${c.example_de?`<div style="font-size:${Math.round(W*0.019)}px;color:${t.fg2};line-height:1.45;font-style:italic">${esc(c.example_de)}</div>`:''}
        ${c.example_vi?`<div style="font-size:${Math.round(W*0.018)}px;color:${t.fg3};line-height:1.45">${esc(c.example_vi)}</div>`:''}
      </div>`;
    }).join('');

    const content = `
      <div style="padding:${Math.round(H*0.04)}px ${Math.round(W*0.055)}px">
        ${ci===0 ? header : ''}
        <div style="display:flex;flex-direction:column;gap:${Math.round(H*0.014)}px">${cards}</div>
      </div>`;
    return { content, bg, dark };
  });
}

// ── PAGE BACKGROUND OVERRIDE ───────────────────
// A page may override its template's default background with a solid colour
// or an image (data URL). `d.bg = {type:'template'|'color'|'image', color, image, fit, overlay}`.
// The base is the raw colour/image; a readability "scrim" is layered on top
// (dark templates → dark tint, light templates → light tint) via a flat
// linear-gradient — CSS paints the FIRST background layer on top.

// raw colour/image background (no scrim), or null to keep the template default.
function pageBgBase(d) {
  const b = d && d.bg;
  if(!b || !b.type || b.type==='template') return null;
  if(b.type==='preset'){
    const pr = (typeof BG_PRESETS!=='undefined') ? BG_PRESETS.find(x=>x.id===b.preset) : null;
    return pr ? pr.css : null;
  }
  if(b.type==='color') return b.color ? esc(b.color) : null;
  if(b.type==='image' && b.image){
    const fit = b.fit || 'cover';
    const behind = b.color ? esc(b.color)+' ' : '';
    return fit==='repeat'
      ? `${behind}url('${esc(b.image)}') top left repeat`
      : `${behind}url('${esc(b.image)}') center/${fit} no-repeat`;
  }
  return null;
}

// full background for one part = optional scrim (based on part.dark) + base.
function pageBgFor(d, dark, base) {
  const ov = (d.bg && typeof d.bg.overlay === 'number') ? d.bg.overlay : 0;
  if(ov > 0){
    const c = dark ? '0,0,0' : '255,255,255';
    const a = Math.min(0.92, Math.max(0, ov)).toFixed(3);
    return `linear-gradient(rgba(${c},${a}),rgba(${c},${a})),${base}`;
  }
  return base;
}

// ── DISPATCH ───────────────────────────────────
// Returns an array of parts {content, bg, dark}; one per physical sheet.
function renderPageParts(data, W, H) {
  const fn = {'vocab-grid':renderVocabGridParts,'sentence-pairs':renderSentencePairsParts,'conjugation':renderConjugationParts,'idiom-spotlight':renderIdiomSpotlightParts,'dialogue':renderDialogueParts,'word-map':renderWordMapParts,'word-family':renderWordFamilyParts};
  const f = fn[data.template];
  const dark = pageIsDark(data);
  const parts = f
    ? f(data, W, H, dark)
    : [{ content:`<div style="width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center;color:#888;background:#fff">Template không xác định</div>`, bg:'#fff', dark:false }];
  const base = pageBgBase(data);
  return base ? parts.map(p => ({ ...p, bg: pageBgFor(data, p.dark, base) })) : parts;
}

// Backward-compatible single-string render of the FIRST sheet only.
function renderPage(data, pn, W, H) {
  return wrapPart(renderPageParts(data, W, H)[0], pn, W, H);
}
