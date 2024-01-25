var Ct=Object.defineProperty;var St=(l,t,n)=>t in l?Ct(l,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):l[t]=n;var H=(l,t,n)=>(St(l,typeof t!="symbol"?t+"":t,n),n);import{s as xt,n as et}from"../chunks/scheduler.5o8iMP-j.js";import{S as jt,i as Wt,s as B,e as S,t as h,l as Bt,d as W,f as E,c as x,a as Q,g as V,b as u,m as j,h as U,j as a,q as Et,k as q,n as F}from"../chunks/index.roUWO4sU.js";import{e as z}from"../chunks/each.6w4Ej4nR.js";import{i as kt,r as xe,w as De,a as tt,s as Ht}from"../chunks/index.Zx8RnaKC.js";import{c as zt}from"../chunks/index.ag_JRNvT.js";class w{constructor(t,n,r,d){H(this,"sound");H(this,"transcriptions");H(this,"classifiers");H(this,"commonality");this.sound=t,this.transcriptions=n,this.classifiers=r,this.commonality=d}}function Tt(){return[new w("b",["b"],["consonant","bilabial","plosive","voiced"],1),new w("c",["c","k"],["consonant","palatal","plosive","voiceless"],1),new w("ch",["ch"],["affricate","consonant","palato-alveolar","sibilant","voiceless"],1),new w("d",["d"],["alveolar","consonant","dental","plosive","voiced"],1),new w("dʒ",["j"],["affricate","consonant","postalveolar","voiced"],1),new w("tʃ",["ch"],["affricate","consonant","postalveolar","voiceless"],1),new w("f",["f"],["consonant","voiceless","fricative","labiodental"],1),new w("g",["g"],["consonant","plosive","velar","voiced"],1),new w("h",["h"],["consonant","voiceless","fricative","glottal","transition"],1),new w("j",["j"],["affricate","consonant","sibilant"],1),new w("k",["k"],["consonant","plosive","velar","voiceless"],1),new w("l",["l","ll"],["alveolar","consonant","dental","lateral","liquid","voiced"],1),new w("m",["m"],["bilabial","consonant","nasal","occlusive","voiced"],1),new w("n",["n"],["alveolar","consonant","dental","nasal","occlusive","voiced"],1),new w("ŋ",["ng"],["consonant","nasal","velar","voiced"],1),new w("p",["p"],["bilabial","consonant","plosive","voiced"],1),new w("q",["q"],["consonant","plosive","uvular","voiceless"],1),new w("ɹ",["r"],["consonant","liquid","rhotic"],1),new w("r",["rr"],["alveolar","consonant","trill","voiced"],1),new w("s",["s","c"],["consonant","coronal","fricative","voiceless"],1),new w("ʃ",["sh"],["consonant","fricative","sibilant"],1),new w("ʒ",["si","zh"],["consonant","fricative","palato-alveolar","sibilant"],1),new w("ɾ",["tt"],["alveolar","consonant","voiced","tap"],1),new w("ɽ",["dd"],["alveolar","consonant","voiced","tap"],1),new w("t",["t"],["consonant","dental","plosive","voiceless"],1),new w("ts",["ts","tsu"],["affricate","alveolar","consonant","fricative","voiceless"],1),new w("θ",["th"],["consonant","fricative","voiceless"],1),new w("ð",["th"],["consonant","fricative","voiced"],1),new w("v",["v"],["consonant","fricative","labiodental","voiced"],1),new w("w",["w"],["approximant","consonant","velar","voiced"],1),new w("x",["ch","k"],["consonant","fricative","velar","voiceless"],1),new w("y",["y"],["approximant","consonant","palatal","voiced"],1),new w("z",["z","x"],["aveolar","consonant","fricative","voiced"],1),new w("ə",["a"],["central","unrounded","vowel"],1),new w("e",["ay","e"],["close-mid","front","unrounded","vowel"],1),new w("aɪ",["ai","y","ie","igh"],["vowel"],1),new w("aʊ",["ou"],["vowel"],1),new w("æ",["a"],["front","unrounded","vowel"],1),new w("ɔ",["o"],["back","unrounded","vowel"],1),new w("a",["a"],["open","front","unrounded","vowel"],1),new w("ɒ",["ough","a","o"],["back","open","rounded","vowel"],1),new w("ɛ",["e"],["front","unrounded","vowel"],1),new w("o",["aw"],["close-mid","back","unrounded","vowel"],1),new w("ɪ",["i"],["front","unrounded","vowel"],1),new w("ʌ",["u","oo"],["back","open-mid","unrounded","vowel"],1),new w("ʊ",["u"],["near-back","rounded","vowel"],1),new w("i",["i","ee"],["close","front","unrounded","vowel"],1),new w("ʊ",["oo"],["near-close","near-back","rounded","vowel"],1),new w("ɔɪ",["oi","oy"],["vowel"],1),new w("u",["u","oo"],["close","back","rounded","vowel"],1)]}function yt(l,t){return t.filter(n=>n.classifiers.includes(l))}function Lt(l){return yt("consonant",l)}function Ot(l){return yt("vowel",l)}class Gt{constructor(t){H(this,"name");H(this,"phonemes");this.name=t,this.phonemes=$t()}getPhonemes(){let t=[];for(const n in this.phonemes)t.push(this.phonemes[n]);return t}}function $t(){let l=Tt(),t={};for(const n of l)t[n.sound]=n;return t}function At(){return[It()]}function It(){let l=new Gt("English");return l.phonemes.ə.commonality=114,l.phonemes.n.commonality=71,l.phonemes.ɾ.commonality=69,l.phonemes.t.commonality=69,l.phonemes.ɪ.commonality=63,l.phonemes.s.commonality=47,l.phonemes.d.commonality=42,l.phonemes.l.commonality=39,l.phonemes.i.commonality=36,l.phonemes.k.commonality=31,l.phonemes.ð.commonality=29,l.phonemes.ɛ.commonality=28,l.phonemes.m.commonality=27,l.phonemes.z.commonality=27,l.phonemes.p.commonality=21,l.phonemes.æ.commonality=21,l.phonemes.v.commonality=20,l.phonemes.w.commonality=19,l.phonemes.u.commonality=19,l.phonemes.b.commonality=18,l.phonemes.e.commonality=17,l.phonemes.ʌ.commonality=17,l.phonemes.f.commonality=17,l.phonemes.aɪ.commonality=15,l.phonemes.a.commonality=14,l.phonemes.h.commonality=15,l.phonemes.o.commonality=12,l.phonemes.ɒ.commonality=11,l.phonemes.ŋ.commonality=9,l.phonemes.ʃ.commonality=8,l.phonemes.j.commonality=8,l.phonemes.g.commonality=8,l.phonemes.dʒ.commonality=5,l.phonemes.tʃ.commonality=5,l.phonemes.aʊ.commonality=5,l.phonemes.ʊ.commonality=4,l.phonemes.θ.commonality=4,l.phonemes.ɔɪ.commonality=1,l.phonemes.ʒ.commonality=1,l}class Nt{constructor(){H(this,"phonemeSets");this.phonemeSets=At()}}class J{constructor(t,n){H(this,"root");H(this,"pronunciation");H(this,"speechPart");H(this,"meaning");this.root="",this.pronunciation="",this.speechPart=t,this.meaning=n}}class Dt{constructor(){H(this,"words");this.words=[];const t=Mt();for(let c=0;c<t.length;c++){const m=new J("adjective",t[c]);this.words.push(m)}const n=Vt();for(let c=0;c<n.length;c++){const m=new J("adverb",n[c]);this.words.push(m)}const r=Qt();for(let c=0;c<r.length;c++){const m=new J("article",r[c]);this.words.push(m)}const d=Ut();for(let c=0;c<d.length;c++){const m=new J("interjection",d[c]);this.words.push(m)}const f=Ft();for(let c=0;c<f.length;c++){const m=new J("preposition",f[c]);this.words.push(m)}const p=Jt();for(let c=0;c<p.length;c++){const m=new J("question",p[c]);this.words.push(m)}const _=Kt();for(let c=0;c<_.length;c++){const m=new J("verb",_[c]);this.words.push(m)}const v=Rt();for(let c=0;c<v.length;c++){const m=new J("noun",v[c]);this.words.push(m)}const g=Xt();for(let c=0;c<g.length;c++){const m=new J("number",g[c]);this.words.push(m)}const b=Yt();for(let c=0;c<b.length;c++){const m=new J("pronoun",b[c]);this.words.push(m)}}getWordsBySpeechPart(t){return this.words.filter(n=>n.speechPart==t)}}function Mt(){return["aromatic","basted","big","bitter","black","blue","brown","chilled","cold","curried","dark","deep","divine","drunk","empty","evil","familiar","fat","flat","frail","fried","full","good","green","grey","honest","hot","light","long","loud","mortal","mysterious","narrow","old","orange","pungent","purple","quiet","raw","rectangular","red","roasted","round","salty","savory","shallow","short","smoked","sober","sour","spicy","spiral","square","steamed","strange","strong","sturdy","sweet","tall","thick","thin","warm","weak","white","wide","yellow","young"]}function Vt(){return["again","now","soon","often","sometimes","always","never","seldom"]}function Qt(){return["a","the"]}function Ut(){return["hello","goodbye","hey","bye","ouch","wow","uh","er","um"]}function Ft(){return["and","as","from","in","of","or","to","will","with"]}function Jt(){return["what","who","how","why","when"]}function Kt(){return["bake","be","belong","bite","break","burn","come","die","drink","eat","fall","fight","find","fish","fly","frown","go","growl","hate","have","hear","hide","hold","hunt","jump","kill","know","laugh","lie","live","lose","love","need","own","roast","run","see","sit","sleep","smell","smile","stand","strike","swallow","swim","taste","throw","walk","want"]}function Rt(){return["afternoon","ale","all","alligator","arm","ash","aunt","axe","bark","bay","beer","beet","bird","blood","boar","bone","breakfast","breast","brother","castle","cat","cat","chest","chicken","claw","cloud","coconut","crime","day","dinner","dog","drink","dungeon","ear","earth","egg","elder","enemy","evening","eye","family","father","feather","fight","finger","fire","fish","flesh","foot","forest","fox","friend","goose","grease","group","gulf","hair","hand","hat","hate","head","hill","horn","horse","house","inn","island","jaw","lake","leaf","leg","liver","louse","love","lunch","man","many","meal","metal","mine","monster","moon","morning","mother","mountain","mouth","name","neck","night","noodle","nose","ocean","parent","path","peace","pepper","person","pie","pig","rabbit","rain","rat","river","robe","rock","root","salt","sand","seed","sibling","sister","skin","sky","smoke","snake","soup","star","stew","stomach","stone","stream","sun","sword","tail","tavern","thumb","tongue","tooth","tree","truth","uncle","valley","war","water","way","wine","woman","word"]}function Xt(){return["zero","one","two","three","four","five","six","seven","eight","nine","ten"]}function Yt(){return["he","she","they","you","we","I"]}class Zt{constructor(t,n){H(this,"name");H(this,"lexicon");H(this,"phonemeSet");H(this,"conjugations");H(this,"wordOrder");this.name=t,this.phonemeSet=n,this.conjugations=[],this.lexicon=new Dt,this.wordOrder=""}}class en{constructor(){H(this,"phonemes");this.phonemes=[]}getPronunciation(){return this.phonemes.map(t=>t.sound).join("")}getTranscription(){return this.phonemes.map(t=>t.transcriptions[0]).join("")}}class tn{constructor(t){H(this,"config");this.config=t}generate(){let t=kt(this.config.phonemeSets),n=new Zt("",t);n.wordOrder=nn(),n.name=zt(nt(xe.int(4,7),t).getTranscription());for(let r=0;r<n.lexicon.words.length;r++){let d=xe.int(2,7);["article","pronoun"].includes(n.lexicon.words[r].speechPart)&&(d=xe.int(2,3));let f=nt(d,t);n.lexicon.words[r].root=f.getTranscription(),n.lexicon.words[r].pronunciation=f.getPronunciation()}return n}}function nn(){return De([{value:"svo",commonality:10},{value:"sov",commonality:1}]).value}function nt(l,t){let n=Lt(t.getPhonemes()),r=Ot(t.getPhonemes()),d="";for(let p=0;p<l;p++)if(p==0&&l==1)d="v";else{let _=kt(["v","c"]);p>0&&(d[p-1]=="v"?_="c":_="v"),d+=_}let f=new en;for(let p=0;p<d.length;p++)d[p]=="v"?f.phonemes.push(De(r)):f.phonemes.push(De(n));return f}function ot(l,t,n){const r=l.slice();return r[5]=t[n],r}function lt(l,t,n){const r=l.slice();return r[5]=t[n],r}function st(l,t,n){const r=l.slice();return r[5]=t[n],r}function at(l,t,n){const r=l.slice();return r[5]=t[n],r}function it(l,t,n){const r=l.slice();return r[5]=t[n],r}function rt(l,t,n){const r=l.slice();return r[5]=t[n],r}function ct(l,t,n){const r=l.slice();return r[5]=t[n],r}function ht(l,t,n){const r=l.slice();return r[5]=t[n],r}function ut(l,t,n){const r=l.slice();return r[5]=t[n],r}function ft(l,t,n){const r=l.slice();return r[5]=t[n],r}function mt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function pt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function vt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function gt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function dt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function _t(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function wt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function bt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function Pt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function qt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=Q(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){U(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function on(l){let t,n,r,d="Language Generator",f,p,_="This generates fictional languages. This is mostly useful for debugging.",v,g,b="Generate",c,m,P=l[0].name+"",i,o,K,ge=l[0].name+"",de,je,We,R,Me="Pronouns",Be,_e,X,Ve="Articles",Ee,we,Y,Qe="Prepositions",He,be,Z,Ue="Numbers",ze,Pe,ee,Fe="Questions",Te,qe,te,Je="Interjections",Le,ke,ne,Ke="Adverbs",Oe,ye,oe,Re="Adjectives",Ge,Ce,le,Xe="Verbs",$e,Se,se,Ye="Nouns",Ae,Ie,Ze,ae=z(l[0].lexicon.getWordsBySpeechPart("pronoun")),T=[];for(let s=0;s<ae.length;s+=1)T[s]=mt(ft(l,ae,s));let ie=z(l[0].lexicon.getWordsBySpeechPart("article")),L=[];for(let s=0;s<ie.length;s+=1)L[s]=pt(ut(l,ie,s));let re=z(l[0].lexicon.getWordsBySpeechPart("preposition")),O=[];for(let s=0;s<re.length;s+=1)O[s]=vt(ht(l,re,s));let ce=z(l[0].lexicon.getWordsBySpeechPart("number")),G=[];for(let s=0;s<ce.length;s+=1)G[s]=gt(ct(l,ce,s));let he=z(l[0].lexicon.getWordsBySpeechPart("question")),$=[];for(let s=0;s<he.length;s+=1)$[s]=dt(rt(l,he,s));let ue=z(l[0].lexicon.getWordsBySpeechPart("interjection")),A=[];for(let s=0;s<ue.length;s+=1)A[s]=_t(it(l,ue,s));let fe=z(l[0].lexicon.getWordsBySpeechPart("adverb")),I=[];for(let s=0;s<fe.length;s+=1)I[s]=wt(at(l,fe,s));let me=z(l[0].lexicon.getWordsBySpeechPart("adjective")),N=[];for(let s=0;s<me.length;s+=1)N[s]=bt(st(l,me,s));let pe=z(l[0].lexicon.getWordsBySpeechPart("verb")),D=[];for(let s=0;s<pe.length;s+=1)D[s]=Pt(lt(l,pe,s));let ve=z(l[0].lexicon.getWordsBySpeechPart("noun")),M=[];for(let s=0;s<ve.length;s+=1)M[s]=qt(ot(l,ve,s));return{c(){t=B(),n=S("section"),r=S("h1"),r.textContent=d,f=B(),p=S("p"),p.textContent=_,v=B(),g=S("button"),g.textContent=b,c=B(),m=S("h2"),i=h(P),o=B(),K=S("h3"),de=h(ge),je=h(" Dictionary"),We=B(),R=S("h4"),R.textContent=Me,Be=B();for(let s=0;s<T.length;s+=1)T[s].c();_e=B(),X=S("h4"),X.textContent=Ve,Ee=B();for(let s=0;s<L.length;s+=1)L[s].c();we=B(),Y=S("h4"),Y.textContent=Qe,He=B();for(let s=0;s<O.length;s+=1)O[s].c();be=B(),Z=S("h4"),Z.textContent=Ue,ze=B();for(let s=0;s<G.length;s+=1)G[s].c();Pe=B(),ee=S("h4"),ee.textContent=Fe,Te=B();for(let s=0;s<$.length;s+=1)$[s].c();qe=B(),te=S("h4"),te.textContent=Je,Le=B();for(let s=0;s<A.length;s+=1)A[s].c();ke=B(),ne=S("h4"),ne.textContent=Ke,Oe=B();for(let s=0;s<I.length;s+=1)I[s].c();ye=B(),oe=S("h4"),oe.textContent=Re,Ge=B();for(let s=0;s<N.length;s+=1)N[s].c();Ce=B(),le=S("h4"),le.textContent=Xe,$e=B();for(let s=0;s<D.length;s+=1)D[s].c();Se=B(),se=S("h4"),se.textContent=Ye,Ae=B();for(let s=0;s<M.length;s+=1)M[s].c();this.h()},l(s){Bt("svelte-mq0loe",document.head).forEach(W),t=E(s),n=x(s,"SECTION",{class:!0});var e=Q(n);r=x(e,"H1",{class:!0,"data-svelte-h":!0}),V(r)!=="svelte-wy8brr"&&(r.textContent=d),f=E(e),p=x(e,"P",{class:!0,"data-svelte-h":!0}),V(p)!=="svelte-1u4cm7r"&&(p.textContent=_),v=E(e),g=x(e,"BUTTON",{class:!0,"data-svelte-h":!0}),V(g)!=="svelte-41x9ys"&&(g.textContent=b),c=E(e),m=x(e,"H2",{class:!0});var y=Q(m);i=u(y,P),y.forEach(W),o=E(e),K=x(e,"H3",{class:!0});var Ne=Q(K);de=u(Ne,ge),je=u(Ne," Dictionary"),Ne.forEach(W),We=E(e),R=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(R)!=="svelte-1bph58e"&&(R.textContent=Me),Be=E(e);for(let k=0;k<T.length;k+=1)T[k].l(e);_e=E(e),X=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(X)!=="svelte-1ni3061"&&(X.textContent=Ve),Ee=E(e);for(let k=0;k<L.length;k+=1)L[k].l(e);we=E(e),Y=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(Y)!=="svelte-nd1e35"&&(Y.textContent=Qe),He=E(e);for(let k=0;k<O.length;k+=1)O[k].l(e);be=E(e),Z=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(Z)!=="svelte-fzmpg4"&&(Z.textContent=Ue),ze=E(e);for(let k=0;k<G.length;k+=1)G[k].l(e);Pe=E(e),ee=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(ee)!=="svelte-9or4p"&&(ee.textContent=Fe),Te=E(e);for(let k=0;k<$.length;k+=1)$[k].l(e);qe=E(e),te=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(te)!=="svelte-12jbw3z"&&(te.textContent=Je),Le=E(e);for(let k=0;k<A.length;k+=1)A[k].l(e);ke=E(e),ne=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(ne)!=="svelte-5ts5g1"&&(ne.textContent=Ke),Oe=E(e);for(let k=0;k<I.length;k+=1)I[k].l(e);ye=E(e),oe=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(oe)!=="svelte-2u4ffq"&&(oe.textContent=Re),Ge=E(e);for(let k=0;k<N.length;k+=1)N[k].l(e);Ce=E(e),le=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(le)!=="svelte-zg1ee0"&&(le.textContent=Xe),$e=E(e);for(let k=0;k<D.length;k+=1)D[k].l(e);Se=E(e),se=x(e,"H4",{class:!0,"data-svelte-h":!0}),V(se)!=="svelte-50u9e5"&&(se.textContent=Ye),Ae=E(e);for(let k=0;k<M.length;k+=1)M[k].l(e);e.forEach(W),this.h()},h(){document.title="Language Generator | Iron Arachne",j(r,"class","svelte-4q74qx"),j(p,"class","svelte-4q74qx"),j(g,"class","svelte-4q74qx"),j(m,"class","svelte-4q74qx"),j(K,"class","svelte-4q74qx"),j(R,"class","svelte-4q74qx"),j(X,"class","svelte-4q74qx"),j(Y,"class","svelte-4q74qx"),j(Z,"class","svelte-4q74qx"),j(ee,"class","svelte-4q74qx"),j(te,"class","svelte-4q74qx"),j(ne,"class","svelte-4q74qx"),j(oe,"class","svelte-4q74qx"),j(le,"class","svelte-4q74qx"),j(se,"class","svelte-4q74qx"),j(n,"class","main default svelte-4q74qx")},m(s,C){U(s,t,C),U(s,n,C),a(n,r),a(n,f),a(n,p),a(n,v),a(n,g),a(n,c),a(n,m),a(m,i),a(n,o),a(n,K),a(K,de),a(K,je),a(n,We),a(n,R),a(n,Be);for(let e=0;e<T.length;e+=1)T[e]&&T[e].m(n,null);a(n,_e),a(n,X),a(n,Ee);for(let e=0;e<L.length;e+=1)L[e]&&L[e].m(n,null);a(n,we),a(n,Y),a(n,He);for(let e=0;e<O.length;e+=1)O[e]&&O[e].m(n,null);a(n,be),a(n,Z),a(n,ze);for(let e=0;e<G.length;e+=1)G[e]&&G[e].m(n,null);a(n,Pe),a(n,ee),a(n,Te);for(let e=0;e<$.length;e+=1)$[e]&&$[e].m(n,null);a(n,qe),a(n,te),a(n,Le);for(let e=0;e<A.length;e+=1)A[e]&&A[e].m(n,null);a(n,ke),a(n,ne),a(n,Oe);for(let e=0;e<I.length;e+=1)I[e]&&I[e].m(n,null);a(n,ye),a(n,oe),a(n,Ge);for(let e=0;e<N.length;e+=1)N[e]&&N[e].m(n,null);a(n,Ce),a(n,le),a(n,$e);for(let e=0;e<D.length;e+=1)D[e]&&D[e].m(n,null);a(n,Se),a(n,se),a(n,Ae);for(let e=0;e<M.length;e+=1)M[e]&&M[e].m(n,null);Ie||(Ze=Et(g,"click",l[1]),Ie=!0)},p(s,[C]){if(C&1&&P!==(P=s[0].name+"")&&q(i,P),C&1&&ge!==(ge=s[0].name+"")&&q(de,ge),C&1){ae=z(s[0].lexicon.getWordsBySpeechPart("pronoun"));let e;for(e=0;e<ae.length;e+=1){const y=ft(s,ae,e);T[e]?T[e].p(y,C):(T[e]=mt(y),T[e].c(),T[e].m(n,_e))}for(;e<T.length;e+=1)T[e].d(1);T.length=ae.length}if(C&1){ie=z(s[0].lexicon.getWordsBySpeechPart("article"));let e;for(e=0;e<ie.length;e+=1){const y=ut(s,ie,e);L[e]?L[e].p(y,C):(L[e]=pt(y),L[e].c(),L[e].m(n,we))}for(;e<L.length;e+=1)L[e].d(1);L.length=ie.length}if(C&1){re=z(s[0].lexicon.getWordsBySpeechPart("preposition"));let e;for(e=0;e<re.length;e+=1){const y=ht(s,re,e);O[e]?O[e].p(y,C):(O[e]=vt(y),O[e].c(),O[e].m(n,be))}for(;e<O.length;e+=1)O[e].d(1);O.length=re.length}if(C&1){ce=z(s[0].lexicon.getWordsBySpeechPart("number"));let e;for(e=0;e<ce.length;e+=1){const y=ct(s,ce,e);G[e]?G[e].p(y,C):(G[e]=gt(y),G[e].c(),G[e].m(n,Pe))}for(;e<G.length;e+=1)G[e].d(1);G.length=ce.length}if(C&1){he=z(s[0].lexicon.getWordsBySpeechPart("question"));let e;for(e=0;e<he.length;e+=1){const y=rt(s,he,e);$[e]?$[e].p(y,C):($[e]=dt(y),$[e].c(),$[e].m(n,qe))}for(;e<$.length;e+=1)$[e].d(1);$.length=he.length}if(C&1){ue=z(s[0].lexicon.getWordsBySpeechPart("interjection"));let e;for(e=0;e<ue.length;e+=1){const y=it(s,ue,e);A[e]?A[e].p(y,C):(A[e]=_t(y),A[e].c(),A[e].m(n,ke))}for(;e<A.length;e+=1)A[e].d(1);A.length=ue.length}if(C&1){fe=z(s[0].lexicon.getWordsBySpeechPart("adverb"));let e;for(e=0;e<fe.length;e+=1){const y=at(s,fe,e);I[e]?I[e].p(y,C):(I[e]=wt(y),I[e].c(),I[e].m(n,ye))}for(;e<I.length;e+=1)I[e].d(1);I.length=fe.length}if(C&1){me=z(s[0].lexicon.getWordsBySpeechPart("adjective"));let e;for(e=0;e<me.length;e+=1){const y=st(s,me,e);N[e]?N[e].p(y,C):(N[e]=bt(y),N[e].c(),N[e].m(n,Ce))}for(;e<N.length;e+=1)N[e].d(1);N.length=me.length}if(C&1){pe=z(s[0].lexicon.getWordsBySpeechPart("verb"));let e;for(e=0;e<pe.length;e+=1){const y=lt(s,pe,e);D[e]?D[e].p(y,C):(D[e]=Pt(y),D[e].c(),D[e].m(n,Se))}for(;e<D.length;e+=1)D[e].d(1);D.length=pe.length}if(C&1){ve=z(s[0].lexicon.getWordsBySpeechPart("noun"));let e;for(e=0;e<ve.length;e+=1){const y=ot(s,ve,e);M[e]?M[e].p(y,C):(M[e]=qt(y),M[e].c(),M[e].m(n,null))}for(;e<M.length;e+=1)M[e].d(1);M.length=ve.length}},i:et,o:et,d(s){s&&(W(t),W(n)),F(T,s),F(L,s),F(O,s),F(G,s),F($,s),F(A,s),F(I,s),F(N,s),F(D,s),F(M,s),Ie=!1,Ze()}}}function ln(l,t,n){let r,d,f,p=tt(13);function _(){p=tt(13),xe.use(Ht(p)),f=new Nt,d=new tn(f),n(0,r=d.generate())}return _(),[r,_]}class fn extends jt{constructor(t){super(),Wt(this,t,ln,on,xt,{})}}export{fn as component};
//# sourceMappingURL=18.uor-iinK.js.map
