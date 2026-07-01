// ═══════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════

const LANG_LABEL = {en:'ENGLISH',de:'DEUTSCH',fr:'FRANÇAIS',ja:'日本語',ko:'한국어',zh:'中文',es:'ESPAÑOL',it:'ITALIANO',pt:'PORTUGUÊS',ru:'РУССКИЙ',vi:'TIẾNG VIỆT'};
const TYPE_COLOR = {NOMEN:'#60a5fa',VERB:'#4ade80',ADJ:'#fb923c',ADV:'#f472b6',PREP:'#a78bfa',OTHER:'#94a3b8'};
const TYPE_BG    = {NOMEN:'rgba(96,165,250,.12)',VERB:'rgba(74,222,128,.12)',ADJ:'rgba(251,146,60,.12)',ADV:'rgba(244,114,182,.12)',PREP:'rgba(167,139,250,.12)',OTHER:'rgba(148,163,184,.12)'};

const DOC_SIZES = {
  a4:     {W:595, H:842,  label:'A4'},
  a5:     {W:420, H:595,  label:'A5'},
  letter: {W:612, H:792,  label:'Letter'},
  post:   {W:800, H:800,  label:'Post 1:1'},
  story:  {W:480, H:852,  label:'Story 9:16'},
};

const TEMPLATES_META = [
  {id:'vocab-grid',     icon:'🟦', name:'Vocab Grid',      desc:'Lưới thẻ từ vựng + ảnh',   hasImage:true},
  {id:'sentence-pairs', icon:'📝', name:'Sentence Pairs',  desc:'Cặp câu song ngữ',           hasImage:false},
  {id:'conjugation',    icon:'🔀', name:'Conjugation',     desc:'Bảng chia động từ',           hasImage:false},
  {id:'idiom-spotlight',icon:'💡', name:'Idiom Spotlight', desc:'Thành ngữ có giải thích',    hasImage:false},
  {id:'dialogue',       icon:'💬', name:'Dialogue',         desc:'Hội thoại chat bubble',      hasImage:false},
  {id:'word-map',       icon:'🗺️', name:'Word Map',        desc:'Mạng từ theo chủ đề',        hasImage:false},
  {id:'word-family',    icon:'🌳', name:'Word Family',     desc:'Từ gốc + các cụm từ ghép',   hasImage:false},
];

const LANG_OPTS = ['en','de','fr','ja','ko','zh','es','it','pt','ru','vi'];
const LANG_LABELS_UI = {en:'🇬🇧 Tiếng Anh',de:'🇩🇪 Tiếng Đức',fr:'🇫🇷 Tiếng Pháp',ja:'🇯🇵 Tiếng Nhật',ko:'🇰🇷 Tiếng Hàn',zh:'🇨🇳 Tiếng Trung',es:'🇪🇸 Tiếng TBN',it:'🇮🇹 Tiếng Ý',pt:'🇵🇹 Tiếng BĐN',ru:'🇷🇺 Tiếng Nga',vi:'🇻🇳 Tiếng Việt'};

// FONT embed helper (for exports)
const FONT_EMBED = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&display=swap');`;

// ── BACKGROUND PRESETS ──
// Tổng hợp các nền mặc định của 7 template thành bộ chọn sẵn.
// `dark:true` = nền tối (đi với chữ sáng). Dùng để tự tính lớp phủ khi lệch với template.
const BG_PRESETS = [
  {id:'light',  label:'Sáng',           css:'#f8fafc', dark:false},
  {id:'cream',  label:'Kem',            css:'#fffdf7', dark:false},
  {id:'slate',  label:'Xám xanh',       css:'#f1f5f9', dark:false},
  {id:'paper',  label:'Giấy ấm',        css:'#fafaf9', dark:false},
  {id:'indigo', label:'Tím than',       css:'linear-gradient(145deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)', dark:true},
  {id:'plum',   label:'Mận đêm',        css:'linear-gradient(160deg,#0f172a 0%,#1e1b2e 100%)',            dark:true},
  {id:'ocean',  label:'Xanh đại dương', css:'linear-gradient(150deg,#0f172a 0%,#172554 55%,#0f172a 100%)', dark:true},
];
const DEFAULT_BG_ID = 'light';   // nền chọn sẵn ban đầu

// Độ tối gốc của từng template (chữ sáng = true). Dùng để tự bật scrim khi nền lệch hướng.
const TEMPLATE_DARK = {'vocab-grid':true,'sentence-pairs':false,'conjugation':false,'idiom-spotlight':true,'dialogue':false,'word-map':false,'word-family':true};
