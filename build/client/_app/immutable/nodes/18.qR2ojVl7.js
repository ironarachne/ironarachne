import{s as yt,n as Ze}from"../chunks/scheduler.5o8iMP-j.js";import{S as Ct,i as St,s as B,e as S,t as h,l as xt,d as W,f as E,c as x,a as V,g as M,b as u,m as j,h as Q,j as a,q as jt,k as q,n as U}from"../chunks/index.EoApDFme.js";import{e as H}from"../chunks/each.-oqiv04n.js";import{i as qt,r as Se,w as Ne,a as et,s as Wt}from"../chunks/index.BP-IY3w8.js";import{c as Bt}from"../chunks/index.718X_Gn9.js";class w{sound;transcriptions;classifiers;commonality;constructor(t,n,r,d){this.sound=t,this.transcriptions=n,this.classifiers=r,this.commonality=d}}function Et(){return[new w("b",["b"],["consonant","bilabial","plosive","voiced"],1),new w("c",["c","k"],["consonant","palatal","plosive","voiceless"],1),new w("ch",["ch"],["affricate","consonant","palato-alveolar","sibilant","voiceless"],1),new w("d",["d"],["alveolar","consonant","dental","plosive","voiced"],1),new w("dʒ",["j"],["affricate","consonant","postalveolar","voiced"],1),new w("tʃ",["ch"],["affricate","consonant","postalveolar","voiceless"],1),new w("f",["f"],["consonant","voiceless","fricative","labiodental"],1),new w("g",["g"],["consonant","plosive","velar","voiced"],1),new w("h",["h"],["consonant","voiceless","fricative","glottal","transition"],1),new w("j",["j"],["affricate","consonant","sibilant"],1),new w("k",["k"],["consonant","plosive","velar","voiceless"],1),new w("l",["l","ll"],["alveolar","consonant","dental","lateral","liquid","voiced"],1),new w("m",["m"],["bilabial","consonant","nasal","occlusive","voiced"],1),new w("n",["n"],["alveolar","consonant","dental","nasal","occlusive","voiced"],1),new w("ŋ",["ng"],["consonant","nasal","velar","voiced"],1),new w("p",["p"],["bilabial","consonant","plosive","voiced"],1),new w("q",["q"],["consonant","plosive","uvular","voiceless"],1),new w("ɹ",["r"],["consonant","liquid","rhotic"],1),new w("r",["rr"],["alveolar","consonant","trill","voiced"],1),new w("s",["s","c"],["consonant","coronal","fricative","voiceless"],1),new w("ʃ",["sh"],["consonant","fricative","sibilant"],1),new w("ʒ",["si","zh"],["consonant","fricative","palato-alveolar","sibilant"],1),new w("ɾ",["tt"],["alveolar","consonant","voiced","tap"],1),new w("ɽ",["dd"],["alveolar","consonant","voiced","tap"],1),new w("t",["t"],["consonant","dental","plosive","voiceless"],1),new w("ts",["ts","tsu"],["affricate","alveolar","consonant","fricative","voiceless"],1),new w("θ",["th"],["consonant","fricative","voiceless"],1),new w("ð",["th"],["consonant","fricative","voiced"],1),new w("v",["v"],["consonant","fricative","labiodental","voiced"],1),new w("w",["w"],["approximant","consonant","velar","voiced"],1),new w("x",["ch","k"],["consonant","fricative","velar","voiceless"],1),new w("y",["y"],["approximant","consonant","palatal","voiced"],1),new w("z",["z","x"],["aveolar","consonant","fricative","voiced"],1),new w("ə",["a"],["central","unrounded","vowel"],1),new w("e",["ay","e"],["close-mid","front","unrounded","vowel"],1),new w("aɪ",["ai","y","ie","igh"],["vowel"],1),new w("aʊ",["ou"],["vowel"],1),new w("æ",["a"],["front","unrounded","vowel"],1),new w("ɔ",["o"],["back","unrounded","vowel"],1),new w("a",["a"],["open","front","unrounded","vowel"],1),new w("ɒ",["ough","a","o"],["back","open","rounded","vowel"],1),new w("ɛ",["e"],["front","unrounded","vowel"],1),new w("o",["aw"],["close-mid","back","unrounded","vowel"],1),new w("ɪ",["i"],["front","unrounded","vowel"],1),new w("ʌ",["u","oo"],["back","open-mid","unrounded","vowel"],1),new w("ʊ",["u"],["near-back","rounded","vowel"],1),new w("i",["i","ee"],["close","front","unrounded","vowel"],1),new w("ʊ",["oo"],["near-close","near-back","rounded","vowel"],1),new w("ɔɪ",["oi","oy"],["vowel"],1),new w("u",["u","oo"],["close","back","rounded","vowel"],1)]}function kt(l,t){return t.filter(n=>n.classifiers.includes(l))}function Ht(l){return kt("consonant",l)}function zt(l){return kt("vowel",l)}class Tt{name;phonemes;constructor(t){this.name=t,this.phonemes=Lt()}getPhonemes(){let t=[];for(const n in this.phonemes)t.push(this.phonemes[n]);return t}}function Lt(){let l=Et(),t={};for(const n of l)t[n.sound]=n;return t}function Ot(){return[Gt()]}function Gt(){let l=new Tt("English");return l.phonemes.ə.commonality=114,l.phonemes.n.commonality=71,l.phonemes.ɾ.commonality=69,l.phonemes.t.commonality=69,l.phonemes.ɪ.commonality=63,l.phonemes.s.commonality=47,l.phonemes.d.commonality=42,l.phonemes.l.commonality=39,l.phonemes.i.commonality=36,l.phonemes.k.commonality=31,l.phonemes.ð.commonality=29,l.phonemes.ɛ.commonality=28,l.phonemes.m.commonality=27,l.phonemes.z.commonality=27,l.phonemes.p.commonality=21,l.phonemes.æ.commonality=21,l.phonemes.v.commonality=20,l.phonemes.w.commonality=19,l.phonemes.u.commonality=19,l.phonemes.b.commonality=18,l.phonemes.e.commonality=17,l.phonemes.ʌ.commonality=17,l.phonemes.f.commonality=17,l.phonemes.aɪ.commonality=15,l.phonemes.a.commonality=14,l.phonemes.h.commonality=15,l.phonemes.o.commonality=12,l.phonemes.ɒ.commonality=11,l.phonemes.ŋ.commonality=9,l.phonemes.ʃ.commonality=8,l.phonemes.j.commonality=8,l.phonemes.g.commonality=8,l.phonemes.dʒ.commonality=5,l.phonemes.tʃ.commonality=5,l.phonemes.aʊ.commonality=5,l.phonemes.ʊ.commonality=4,l.phonemes.θ.commonality=4,l.phonemes.ɔɪ.commonality=1,l.phonemes.ʒ.commonality=1,l}class $t{phonemeSets;constructor(){this.phonemeSets=Ot()}}class F{root;pronunciation;speechPart;meaning;constructor(t,n){this.root="",this.pronunciation="",this.speechPart=t,this.meaning=n}}class At{words;constructor(){this.words=[];const t=It();for(let c=0;c<t.length;c++){const m=new F("adjective",t[c]);this.words.push(m)}const n=Nt();for(let c=0;c<n.length;c++){const m=new F("adverb",n[c]);this.words.push(m)}const r=Dt();for(let c=0;c<r.length;c++){const m=new F("article",r[c]);this.words.push(m)}const d=Mt();for(let c=0;c<d.length;c++){const m=new F("interjection",d[c]);this.words.push(m)}const f=Vt();for(let c=0;c<f.length;c++){const m=new F("preposition",f[c]);this.words.push(m)}const p=Qt();for(let c=0;c<p.length;c++){const m=new F("question",p[c]);this.words.push(m)}const _=Ut();for(let c=0;c<_.length;c++){const m=new F("verb",_[c]);this.words.push(m)}const v=Ft();for(let c=0;c<v.length;c++){const m=new F("noun",v[c]);this.words.push(m)}const g=Jt();for(let c=0;c<g.length;c++){const m=new F("number",g[c]);this.words.push(m)}const b=Kt();for(let c=0;c<b.length;c++){const m=new F("pronoun",b[c]);this.words.push(m)}}getWordsBySpeechPart(t){return this.words.filter(n=>n.speechPart==t)}}function It(){return["aromatic","basted","big","bitter","black","blue","brown","chilled","cold","curried","dark","deep","divine","drunk","empty","evil","familiar","fat","flat","frail","fried","full","good","green","grey","honest","hot","light","long","loud","mortal","mysterious","narrow","old","orange","pungent","purple","quiet","raw","rectangular","red","roasted","round","salty","savory","shallow","short","smoked","sober","sour","spicy","spiral","square","steamed","strange","strong","sturdy","sweet","tall","thick","thin","warm","weak","white","wide","yellow","young"]}function Nt(){return["again","now","soon","often","sometimes","always","never","seldom"]}function Dt(){return["a","the"]}function Mt(){return["hello","goodbye","hey","bye","ouch","wow","uh","er","um"]}function Vt(){return["and","as","from","in","of","or","to","will","with"]}function Qt(){return["what","who","how","why","when"]}function Ut(){return["bake","be","belong","bite","break","burn","come","die","drink","eat","fall","fight","find","fish","fly","frown","go","growl","hate","have","hear","hide","hold","hunt","jump","kill","know","laugh","lie","live","lose","love","need","own","roast","run","see","sit","sleep","smell","smile","stand","strike","swallow","swim","taste","throw","walk","want"]}function Ft(){return["afternoon","ale","all","alligator","arm","ash","aunt","axe","bark","bay","beer","beet","bird","blood","boar","bone","breakfast","breast","brother","castle","cat","cat","chest","chicken","claw","cloud","coconut","crime","day","dinner","dog","drink","dungeon","ear","earth","egg","elder","enemy","evening","eye","family","father","feather","fight","finger","fire","fish","flesh","foot","forest","fox","friend","goose","grease","group","gulf","hair","hand","hat","hate","head","hill","horn","horse","house","inn","island","jaw","lake","leaf","leg","liver","louse","love","lunch","man","many","meal","metal","mine","monster","moon","morning","mother","mountain","mouth","name","neck","night","noodle","nose","ocean","parent","path","peace","pepper","person","pie","pig","rabbit","rain","rat","river","robe","rock","root","salt","sand","seed","sibling","sister","skin","sky","smoke","snake","soup","star","stew","stomach","stone","stream","sun","sword","tail","tavern","thumb","tongue","tooth","tree","truth","uncle","valley","war","water","way","wine","woman","word"]}function Jt(){return["zero","one","two","three","four","five","six","seven","eight","nine","ten"]}function Kt(){return["he","she","they","you","we","I"]}class Rt{name;lexicon;phonemeSet;conjugations;wordOrder;constructor(t,n){this.name=t,this.phonemeSet=n,this.conjugations=[],this.lexicon=new At,this.wordOrder=""}}class Xt{phonemes;constructor(){this.phonemes=[]}getPronunciation(){return this.phonemes.map(t=>t.sound).join("")}getTranscription(){return this.phonemes.map(t=>t.transcriptions[0]).join("")}}class Yt{config;constructor(t){this.config=t}generate(){let t=qt(this.config.phonemeSets),n=new Rt("",t);n.wordOrder=Zt(),n.name=Bt(tt(Se.int(4,7),t).getTranscription());for(let r=0;r<n.lexicon.words.length;r++){let d=Se.int(2,7);["article","pronoun"].includes(n.lexicon.words[r].speechPart)&&(d=Se.int(2,3));let f=tt(d,t);n.lexicon.words[r].root=f.getTranscription(),n.lexicon.words[r].pronunciation=f.getPronunciation()}return n}}function Zt(){return Ne([{value:"svo",commonality:10},{value:"sov",commonality:1}]).value}function tt(l,t){let n=Ht(t.getPhonemes()),r=zt(t.getPhonemes()),d="";for(let p=0;p<l;p++)if(p==0&&l==1)d="v";else{let _=qt(["v","c"]);p>0&&(d[p-1]=="v"?_="c":_="v"),d+=_}let f=new Xt;for(let p=0;p<d.length;p++)d[p]=="v"?f.phonemes.push(Ne(r)):f.phonemes.push(Ne(n));return f}function nt(l,t,n){const r=l.slice();return r[5]=t[n],r}function ot(l,t,n){const r=l.slice();return r[5]=t[n],r}function lt(l,t,n){const r=l.slice();return r[5]=t[n],r}function st(l,t,n){const r=l.slice();return r[5]=t[n],r}function at(l,t,n){const r=l.slice();return r[5]=t[n],r}function it(l,t,n){const r=l.slice();return r[5]=t[n],r}function rt(l,t,n){const r=l.slice();return r[5]=t[n],r}function ct(l,t,n){const r=l.slice();return r[5]=t[n],r}function ht(l,t,n){const r=l.slice();return r[5]=t[n],r}function ut(l,t,n){const r=l.slice();return r[5]=t[n],r}function ft(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function mt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function pt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function vt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function gt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function dt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function _t(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function wt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function bt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function Pt(l){let t,n=l[5].root+"",r,d,f=l[5].speechPart+"",p,_,v=l[5].pronunciation+"",g,b,c=l[5].meaning+"",m,P;return{c(){t=S("p"),r=h(n),d=h(" ("),p=h(f),_=h(", /"),g=h(v),b=h('/): "'),m=h(c),P=h('"'),this.h()},l(i){t=x(i,"P",{class:!0});var o=V(t);r=u(o,n),d=u(o," ("),p=u(o,f),_=u(o,", /"),g=u(o,v),b=u(o,'/): "'),m=u(o,c),P=u(o,'"'),o.forEach(W),this.h()},h(){j(t,"class","svelte-4q74qx")},m(i,o){Q(i,t,o),a(t,r),a(t,d),a(t,p),a(t,_),a(t,g),a(t,b),a(t,m),a(t,P)},p(i,o){o&1&&n!==(n=i[5].root+"")&&q(r,n),o&1&&f!==(f=i[5].speechPart+"")&&q(p,f),o&1&&v!==(v=i[5].pronunciation+"")&&q(g,v),o&1&&c!==(c=i[5].meaning+"")&&q(m,c)},d(i){i&&W(t)}}}function en(l){let t,n,r,d="Language Generator",f,p,_="This generates fictional languages. This is mostly useful for debugging.",v,g,b="Generate",c,m,P=l[0].name+"",i,o,J,ve=l[0].name+"",ge,xe,je,K,De="Pronouns",We,de,R,Me="Articles",Be,_e,X,Ve="Prepositions",Ee,we,Y,Qe="Numbers",He,be,Z,Ue="Questions",ze,Pe,ee,Fe="Interjections",Te,qe,te,Je="Adverbs",Le,ke,ne,Ke="Adjectives",Oe,ye,oe,Re="Verbs",Ge,Ce,le,Xe="Nouns",$e,Ae,Ye,se=H(l[0].lexicon.getWordsBySpeechPart("pronoun")),z=[];for(let s=0;s<se.length;s+=1)z[s]=ft(ut(l,se,s));let ae=H(l[0].lexicon.getWordsBySpeechPart("article")),T=[];for(let s=0;s<ae.length;s+=1)T[s]=mt(ht(l,ae,s));let ie=H(l[0].lexicon.getWordsBySpeechPart("preposition")),L=[];for(let s=0;s<ie.length;s+=1)L[s]=pt(ct(l,ie,s));let re=H(l[0].lexicon.getWordsBySpeechPart("number")),O=[];for(let s=0;s<re.length;s+=1)O[s]=vt(rt(l,re,s));let ce=H(l[0].lexicon.getWordsBySpeechPart("question")),G=[];for(let s=0;s<ce.length;s+=1)G[s]=gt(it(l,ce,s));let he=H(l[0].lexicon.getWordsBySpeechPart("interjection")),$=[];for(let s=0;s<he.length;s+=1)$[s]=dt(at(l,he,s));let ue=H(l[0].lexicon.getWordsBySpeechPart("adverb")),A=[];for(let s=0;s<ue.length;s+=1)A[s]=_t(st(l,ue,s));let fe=H(l[0].lexicon.getWordsBySpeechPart("adjective")),I=[];for(let s=0;s<fe.length;s+=1)I[s]=wt(lt(l,fe,s));let me=H(l[0].lexicon.getWordsBySpeechPart("verb")),N=[];for(let s=0;s<me.length;s+=1)N[s]=bt(ot(l,me,s));let pe=H(l[0].lexicon.getWordsBySpeechPart("noun")),D=[];for(let s=0;s<pe.length;s+=1)D[s]=Pt(nt(l,pe,s));return{c(){t=B(),n=S("section"),r=S("h1"),r.textContent=d,f=B(),p=S("p"),p.textContent=_,v=B(),g=S("button"),g.textContent=b,c=B(),m=S("h2"),i=h(P),o=B(),J=S("h3"),ge=h(ve),xe=h(" Dictionary"),je=B(),K=S("h4"),K.textContent=De,We=B();for(let s=0;s<z.length;s+=1)z[s].c();de=B(),R=S("h4"),R.textContent=Me,Be=B();for(let s=0;s<T.length;s+=1)T[s].c();_e=B(),X=S("h4"),X.textContent=Ve,Ee=B();for(let s=0;s<L.length;s+=1)L[s].c();we=B(),Y=S("h4"),Y.textContent=Qe,He=B();for(let s=0;s<O.length;s+=1)O[s].c();be=B(),Z=S("h4"),Z.textContent=Ue,ze=B();for(let s=0;s<G.length;s+=1)G[s].c();Pe=B(),ee=S("h4"),ee.textContent=Fe,Te=B();for(let s=0;s<$.length;s+=1)$[s].c();qe=B(),te=S("h4"),te.textContent=Je,Le=B();for(let s=0;s<A.length;s+=1)A[s].c();ke=B(),ne=S("h4"),ne.textContent=Ke,Oe=B();for(let s=0;s<I.length;s+=1)I[s].c();ye=B(),oe=S("h4"),oe.textContent=Re,Ge=B();for(let s=0;s<N.length;s+=1)N[s].c();Ce=B(),le=S("h4"),le.textContent=Xe,$e=B();for(let s=0;s<D.length;s+=1)D[s].c();this.h()},l(s){xt("svelte-mq0loe",document.head).forEach(W),t=E(s),n=x(s,"SECTION",{class:!0});var e=V(n);r=x(e,"H1",{class:!0,"data-svelte-h":!0}),M(r)!=="svelte-wy8brr"&&(r.textContent=d),f=E(e),p=x(e,"P",{class:!0,"data-svelte-h":!0}),M(p)!=="svelte-1u4cm7r"&&(p.textContent=_),v=E(e),g=x(e,"BUTTON",{class:!0,"data-svelte-h":!0}),M(g)!=="svelte-41x9ys"&&(g.textContent=b),c=E(e),m=x(e,"H2",{class:!0});var y=V(m);i=u(y,P),y.forEach(W),o=E(e),J=x(e,"H3",{class:!0});var Ie=V(J);ge=u(Ie,ve),xe=u(Ie," Dictionary"),Ie.forEach(W),je=E(e),K=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(K)!=="svelte-1bph58e"&&(K.textContent=De),We=E(e);for(let k=0;k<z.length;k+=1)z[k].l(e);de=E(e),R=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(R)!=="svelte-1ni3061"&&(R.textContent=Me),Be=E(e);for(let k=0;k<T.length;k+=1)T[k].l(e);_e=E(e),X=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(X)!=="svelte-nd1e35"&&(X.textContent=Ve),Ee=E(e);for(let k=0;k<L.length;k+=1)L[k].l(e);we=E(e),Y=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(Y)!=="svelte-fzmpg4"&&(Y.textContent=Qe),He=E(e);for(let k=0;k<O.length;k+=1)O[k].l(e);be=E(e),Z=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(Z)!=="svelte-9or4p"&&(Z.textContent=Ue),ze=E(e);for(let k=0;k<G.length;k+=1)G[k].l(e);Pe=E(e),ee=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(ee)!=="svelte-12jbw3z"&&(ee.textContent=Fe),Te=E(e);for(let k=0;k<$.length;k+=1)$[k].l(e);qe=E(e),te=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(te)!=="svelte-5ts5g1"&&(te.textContent=Je),Le=E(e);for(let k=0;k<A.length;k+=1)A[k].l(e);ke=E(e),ne=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(ne)!=="svelte-2u4ffq"&&(ne.textContent=Ke),Oe=E(e);for(let k=0;k<I.length;k+=1)I[k].l(e);ye=E(e),oe=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(oe)!=="svelte-zg1ee0"&&(oe.textContent=Re),Ge=E(e);for(let k=0;k<N.length;k+=1)N[k].l(e);Ce=E(e),le=x(e,"H4",{class:!0,"data-svelte-h":!0}),M(le)!=="svelte-50u9e5"&&(le.textContent=Xe),$e=E(e);for(let k=0;k<D.length;k+=1)D[k].l(e);e.forEach(W),this.h()},h(){document.title="Language Generator | Iron Arachne",j(r,"class","svelte-4q74qx"),j(p,"class","svelte-4q74qx"),j(g,"class","svelte-4q74qx"),j(m,"class","svelte-4q74qx"),j(J,"class","svelte-4q74qx"),j(K,"class","svelte-4q74qx"),j(R,"class","svelte-4q74qx"),j(X,"class","svelte-4q74qx"),j(Y,"class","svelte-4q74qx"),j(Z,"class","svelte-4q74qx"),j(ee,"class","svelte-4q74qx"),j(te,"class","svelte-4q74qx"),j(ne,"class","svelte-4q74qx"),j(oe,"class","svelte-4q74qx"),j(le,"class","svelte-4q74qx"),j(n,"class","main default svelte-4q74qx")},m(s,C){Q(s,t,C),Q(s,n,C),a(n,r),a(n,f),a(n,p),a(n,v),a(n,g),a(n,c),a(n,m),a(m,i),a(n,o),a(n,J),a(J,ge),a(J,xe),a(n,je),a(n,K),a(n,We);for(let e=0;e<z.length;e+=1)z[e]&&z[e].m(n,null);a(n,de),a(n,R),a(n,Be);for(let e=0;e<T.length;e+=1)T[e]&&T[e].m(n,null);a(n,_e),a(n,X),a(n,Ee);for(let e=0;e<L.length;e+=1)L[e]&&L[e].m(n,null);a(n,we),a(n,Y),a(n,He);for(let e=0;e<O.length;e+=1)O[e]&&O[e].m(n,null);a(n,be),a(n,Z),a(n,ze);for(let e=0;e<G.length;e+=1)G[e]&&G[e].m(n,null);a(n,Pe),a(n,ee),a(n,Te);for(let e=0;e<$.length;e+=1)$[e]&&$[e].m(n,null);a(n,qe),a(n,te),a(n,Le);for(let e=0;e<A.length;e+=1)A[e]&&A[e].m(n,null);a(n,ke),a(n,ne),a(n,Oe);for(let e=0;e<I.length;e+=1)I[e]&&I[e].m(n,null);a(n,ye),a(n,oe),a(n,Ge);for(let e=0;e<N.length;e+=1)N[e]&&N[e].m(n,null);a(n,Ce),a(n,le),a(n,$e);for(let e=0;e<D.length;e+=1)D[e]&&D[e].m(n,null);Ae||(Ye=jt(g,"click",l[1]),Ae=!0)},p(s,[C]){if(C&1&&P!==(P=s[0].name+"")&&q(i,P),C&1&&ve!==(ve=s[0].name+"")&&q(ge,ve),C&1){se=H(s[0].lexicon.getWordsBySpeechPart("pronoun"));let e;for(e=0;e<se.length;e+=1){const y=ut(s,se,e);z[e]?z[e].p(y,C):(z[e]=ft(y),z[e].c(),z[e].m(n,de))}for(;e<z.length;e+=1)z[e].d(1);z.length=se.length}if(C&1){ae=H(s[0].lexicon.getWordsBySpeechPart("article"));let e;for(e=0;e<ae.length;e+=1){const y=ht(s,ae,e);T[e]?T[e].p(y,C):(T[e]=mt(y),T[e].c(),T[e].m(n,_e))}for(;e<T.length;e+=1)T[e].d(1);T.length=ae.length}if(C&1){ie=H(s[0].lexicon.getWordsBySpeechPart("preposition"));let e;for(e=0;e<ie.length;e+=1){const y=ct(s,ie,e);L[e]?L[e].p(y,C):(L[e]=pt(y),L[e].c(),L[e].m(n,we))}for(;e<L.length;e+=1)L[e].d(1);L.length=ie.length}if(C&1){re=H(s[0].lexicon.getWordsBySpeechPart("number"));let e;for(e=0;e<re.length;e+=1){const y=rt(s,re,e);O[e]?O[e].p(y,C):(O[e]=vt(y),O[e].c(),O[e].m(n,be))}for(;e<O.length;e+=1)O[e].d(1);O.length=re.length}if(C&1){ce=H(s[0].lexicon.getWordsBySpeechPart("question"));let e;for(e=0;e<ce.length;e+=1){const y=it(s,ce,e);G[e]?G[e].p(y,C):(G[e]=gt(y),G[e].c(),G[e].m(n,Pe))}for(;e<G.length;e+=1)G[e].d(1);G.length=ce.length}if(C&1){he=H(s[0].lexicon.getWordsBySpeechPart("interjection"));let e;for(e=0;e<he.length;e+=1){const y=at(s,he,e);$[e]?$[e].p(y,C):($[e]=dt(y),$[e].c(),$[e].m(n,qe))}for(;e<$.length;e+=1)$[e].d(1);$.length=he.length}if(C&1){ue=H(s[0].lexicon.getWordsBySpeechPart("adverb"));let e;for(e=0;e<ue.length;e+=1){const y=st(s,ue,e);A[e]?A[e].p(y,C):(A[e]=_t(y),A[e].c(),A[e].m(n,ke))}for(;e<A.length;e+=1)A[e].d(1);A.length=ue.length}if(C&1){fe=H(s[0].lexicon.getWordsBySpeechPart("adjective"));let e;for(e=0;e<fe.length;e+=1){const y=lt(s,fe,e);I[e]?I[e].p(y,C):(I[e]=wt(y),I[e].c(),I[e].m(n,ye))}for(;e<I.length;e+=1)I[e].d(1);I.length=fe.length}if(C&1){me=H(s[0].lexicon.getWordsBySpeechPart("verb"));let e;for(e=0;e<me.length;e+=1){const y=ot(s,me,e);N[e]?N[e].p(y,C):(N[e]=bt(y),N[e].c(),N[e].m(n,Ce))}for(;e<N.length;e+=1)N[e].d(1);N.length=me.length}if(C&1){pe=H(s[0].lexicon.getWordsBySpeechPart("noun"));let e;for(e=0;e<pe.length;e+=1){const y=nt(s,pe,e);D[e]?D[e].p(y,C):(D[e]=Pt(y),D[e].c(),D[e].m(n,null))}for(;e<D.length;e+=1)D[e].d(1);D.length=pe.length}},i:Ze,o:Ze,d(s){s&&(W(t),W(n)),U(z,s),U(T,s),U(L,s),U(O,s),U(G,s),U($,s),U(A,s),U(I,s),U(N,s),U(D,s),Ae=!1,Ye()}}}function tn(l,t,n){let r,d,f,p=et(13);function _(){p=et(13),Se.use(Wt(p)),f=new $t,d=new Yt(f),n(0,r=d.generate())}return _(),[r,_]}class rn extends Ct{constructor(t){super(),St(this,t,tn,en,yt,{})}}export{rn as component};
//# sourceMappingURL=18.qR2ojVl7.js.map
