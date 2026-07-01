// ═══════════════════════════════
// SAMPLE DATA — initial content per template
// ═══════════════════════════════

const SAMPLE = {
  'vocab-grid':{'template':'vocab-grid','bg':{type:'preset',preset:'light',overlay:0},'lang':'de','level':'B1','topic':'Die Wohnung','topicMeaning':'Căn nhà','items':[
    {word:'die Küche',meaning:'nhà bếp',type:'NOMEN',note:'f · -n',image:''},
    {word:'das Zimmer',meaning:'phòng',type:'NOMEN',note:'n · -',image:''},
    {word:'der Balkon',meaning:'ban công',type:'NOMEN',note:'m · -s',image:''},
    {word:'wohnen',meaning:'sinh sống, ở',type:'VERB',note:'+ Dat.',image:''},
    {word:'gemütlich',meaning:'ấm cúng',type:'ADJ',note:'≠ kalt',image:''},
    {word:'sauber',meaning:'sạch sẽ',type:'ADJ',note:'≠ schmutzig',image:''},
  ]},
  'sentence-pairs':{'template':'sentence-pairs','bg':{type:'preset',preset:'light',overlay:0},'lang':'en','topic':'Phrasal Verbs','level':'B1','title':'Office English','items':[
    {sentence:'Could you lend me your pen for a second?',translation:'Bạn có thể cho tôi mượn cây bút một chút không?',highlight:['lend']},
    {sentence:"I'm looking forward to hearing from you.",translation:'Tôi trông đợi được nghe tin từ bạn.',highlight:['looking forward to']},
    {sentence:'She turned down the offer without hesitation.',translation:'Cô ấy từ chối đề nghị đó mà không do dự.',highlight:['turned down']},
    {sentence:'We need to wrap up the meeting by noon.',translation:'Chúng ta cần kết thúc cuộc họp trước buổi trưa.',highlight:['wrap up']},
    {sentence:"Don't put off until tomorrow what you can do today.",translation:'Đừng trì hoãn đến ngày mai những gì có thể làm hôm nay.',highlight:['put off']},
  ]},
  'conjugation':{'template':'conjugation','bg':{type:'preset',preset:'light',overlay:0},'lang':'fr','tense':"Présent de l'indicatif",'note':"Avoir & être dùng để tạo thì phức passé composé.",'verbs':[
    {verb:'AVOIR',meaning:'có',color:'#4f46e5',bgLight:'rgba(79,70,229,.04)',rows:[{pronoun:'je',form:'ai',meaning:'tôi có'},{pronoun:'tu',form:'as',meaning:'bạn có'},{pronoun:'il/elle',form:'a',meaning:'ấy có'},{pronoun:'nous',form:'avons',meaning:'chúng tôi'},{pronoun:'vous',form:'avez',meaning:'các bạn'},{pronoun:'ils/elles',form:'ont',meaning:'họ có'}]},
    {verb:'ÊTRE',meaning:'là',color:'#0f766e',bgLight:'rgba(15,118,110,.04)',rows:[{pronoun:'je',form:'suis',meaning:'tôi là'},{pronoun:'tu',form:'es',meaning:'bạn là'},{pronoun:'il/elle',form:'est',meaning:'ấy là'},{pronoun:'nous',form:'sommes',meaning:'chúng tôi'},{pronoun:'vous',form:'êtes',meaning:'các bạn'},{pronoun:'ils/elles',form:'sont',meaning:'họ là'}]},
  ]},
  'idiom-spotlight':{'template':'idiom-spotlight','bg':{type:'preset',preset:'light',overlay:0},'lang':'en','topic':'Idioms & Phrasal Verbs','items':[
    {idiom:'bite the bullet',meaning:'cố chịu đựng',explanation:'Chấp nhận và đương đầu tình huống khó khăn, đau đớn.',example:'I hated the dentist, but I had to bite the bullet.',color:'#6366f1'},
    {idiom:'break the ice',meaning:'phá vỡ ngượng ngùng',explanation:'Làm không khí bớt căng thẳng, bắt đầu cuộc trò chuyện.',example:'She told a joke to break the ice at the meeting.',color:'#0d9488'},
    {idiom:'hit the nail on the head',meaning:'nói đúng trọng tâm',explanation:'Nói hoặc làm chính xác điều đúng đắn.',example:'You really hit the nail on the head with that analysis.',color:'#d97706'},
    {idiom:'spill the beans',meaning:'tiết lộ bí mật',explanation:'Vô tình hoặc cố ý tiết lộ thông tin bí mật.',example:"Don't spill the beans about the surprise party!",color:'#e11d48'},
  ]},
  'dialogue':{'template':'dialogue','bg':{type:'preset',preset:'light',overlay:0},'lang':'en','scene':'At the Café','level':'A2','speakers':{A:{name:'Staff',color:'#0284c7'},B:{name:'Customer',color:'#16a34a'}},'lines':[
    {speaker:'A',text:'What can I get for you today?',translation:'Hôm nay tôi có thể phục vụ gì cho bạn?',highlight:[]},
    {speaker:'B',text:"I'd like a latte. Could I also have a slice of carrot cake?",translation:'Cho tôi một latte. Tôi cũng có thể lấy thêm một miếng bánh cà rốt không?',highlight:['Could I also have']},
    {speaker:'A',text:"Of course! That'll be £6.50. Eat in or take away?",translation:'Tất nhiên! Tổng cộng 6,50 bảng. Ăn tại chỗ hay mang đi?',highlight:["That'll be"]},
    {speaker:'B',text:"I'll eat in, thank you.",translation:'Tôi ăn tại đây, cảm ơn bạn.',highlight:["I'll eat in"]},
  ],'keywords':["Could I also have","That'll be","I'll eat in"]},
  'word-map':{'template':'word-map','bg':{type:'preset',preset:'light',overlay:0},'lang':'de','topic':'REISEN','topicMeaning':'đi du lịch','groups':[
    {title:'VERKEHR',subtitle:'phương tiện',color:'#fef3c7',titleColor:'#92400e',items:[{word:'das Flugzeug',meaning:'máy bay'},{word:'der Zug',meaning:'tàu hoả'},{word:'das Schiff',meaning:'tàu thuỷ'}]},
    {title:'UNTERKUNFT',subtitle:'chỗ ở',color:'#f0fdf4',titleColor:'#14532d',items:[{word:'das Hotel',meaning:'khách sạn'},{word:'die Pension',meaning:'nhà nghỉ'},{word:'das Zelt',meaning:'lều'}]},
    {title:'AKTIVITÄT',subtitle:'hoạt động',color:'#eff6ff',titleColor:'#1e3a5f',items:[{word:'besichtigen',meaning:'tham quan'},{word:'fotografieren',meaning:'chụp ảnh'},{word:'wandern',meaning:'đi bộ'}]},
    {title:'AUSDRUCK',subtitle:'cụm từ',color:'#fdf4ff',titleColor:'#581c87',items:[{word:'Gute Reise!',meaning:'Chúc đi vui!'},{word:'Wo ist…?',meaning:'…ở đâu?'},{word:'Ich verreise.',meaning:'Tôi đi du lịch.'}]},
  ]},
  'word-family':{'template':'word-family','bg':{type:'preset',preset:'light',overlay:0},'lang':'de','base_word':'lernen','word_type':'Verb','meaning':'học','topic':'Giao tiếp và ngôn ngữ','level_range':'A1-C1','combinations':[
    {german:'Deutsch lernen',vietnamese:'học tiếng Đức',level:'A1',example_de:'Ich lerne jeden Tag Deutsch.',example_vi:'Tôi học tiếng Đức mỗi ngày.'},
    {german:'auswendig lernen',vietnamese:'học thuộc lòng',level:'A2',example_de:'Die Schüler lernen die Wörter auswendig.',example_vi:'Các học sinh học thuộc lòng các từ vựng.'},
    {german:'kennenlernen',vietnamese:'làm quen, gặp gỡ',level:'A2',example_de:'Ich möchte neue Leute kennenlernen.',example_vi:'Tôi muốn làm quen với những người mới.'},
    {german:'dazulernen',vietnamese:'học thêm, học hỏi thêm',level:'B1',example_de:'Man kann immer etwas dazulernen.',example_vi:'Người ta luôn có thể học hỏi thêm điều gì đó.'},
  ]},
};
