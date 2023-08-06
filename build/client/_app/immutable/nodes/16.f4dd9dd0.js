var Qe=Object.defineProperty;var Xe=(e,t,n)=>t in e?Qe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var b=(e,t,n)=>(Xe(e,typeof t!="symbol"?t+"":t,n),n);import{s as Ye,h as Ne,n as me,r as Ze}from"../chunks/scheduler.db8c6f43.js";import{S as $e,i as et,s as S,g as u,m as V,z as tt,f as x,c as j,h as g,j as M,x as R,n as J,k as d,D as $,a as fe,y as h,E as de,C as se,o as Te,A as Re,F as Le}from"../chunks/index.06c262ec.js";import{e as we}from"../chunks/each.e59479a4.js";import{g as Ue,b as nt,a as at}from"../chunks/domains.259b7e72.js";import{b as Ve}from"../chunks/index.e0b9de06.js";import{i as K,r as Pe}from"../chunks/index.d6e945a3.js";import{g as ot}from"../chunks/invented.fe3e7ecd.js";import{r as st}from"../chunks/random.7fb76a35.js";import{s as rt}from"../chunks/index.401ef785.js";function it(){return ot(["cvpv","vc+vc","gvcvc","cvDAR","cvcDRING","cApERI","cvcAcI","cApERv","cvs'gARvc"])}class a{constructor(t,n,o){b(this,"description");b(this,"objectTypes");b(this,"tags");this.description=t,this.objectTypes=n,this.tags=o}}function lt(e,t){const n=[];for(let o=0;o<e.length;o++)e[o].objectTypes.includes(t)&&n.push(e[o]);return n}function ht(e,t){const n=[];for(let o=0;o<e.length;o++)e[o].tags.includes(t)&&n.push(e[o]);return n}class Z{constructor(t,n,o,c,r){b(this,"name");b(this,"body");b(this,"head");b(this,"ornamentation");b(this,"categories");this.name=t,this.body=n,this.head=o,this.ornamentation=c,this.categories=r}}class f{constructor(t,n){b(this,"name");b(this,"category");this.name=t,this.category=n}}function ct(){return[new Z("wooden","wood","wood","soft metal",["staff","bow","crossbow"]),new Z("wood and metal","wood","hard metal","soft metal",["staff","club","hammer","polearm","scythe","mace","spear"]),new Z("metal","hard metal","hard metal","soft metal",["sword","knife","dagger","axe","hammer","flail","armor"]),new Z("leather","leather","leather","leather",["whip","armor"]),new Z("leather and metal","leather","hard metal","soft metal",["whip","armor"]),new Z("wood and stone","wood","stone","soft metal",["hammer"])]}function dt(){return[new f("copper","soft metal"),new f("bronze","hard metal"),new f("brass","soft metal"),new f("silver","soft metal"),new f("gold","soft metal"),new f("iron","hard metal"),new f("steel","hard metal"),new f("oak","wood"),new f("elm","wood"),new f("cedar","wood"),new f("pine","wood"),new f("ironwood","wood"),new f("maple","wood"),new f("teak","wood"),new f("leather","leather"),new f("crystal","gemstone"),new f("granite","stone"),new f("sandstone","stone"),new f("shale","stone"),new f("ruby","gemstone"),new f("sapphire","gemstone")]}function wt(e){const t=ct(),n=[];for(let o=0;o<t.length;o++)t[o].categories.includes(e)&&n.push(t[o]);return n}function mt(e){const t=dt(),n=[];for(let o=0;o<t.length;o++)t[o].category==e&&n.push(t[o]);return n}function ft(e){const t=wt(e);return K(t)}function Ee(e){const t=mt(e);return K(t)}class ut{constructor(t,n,o,c){b(this,"name");b(this,"description");b(this,"weaponType");b(this,"effect");this.name=t,this.description=n,this.weaponType=o,this.effect=c}}class i{constructor(t,n,o){b(this,"name");b(this,"hands");b(this,"category");this.name=t,this.hands=n,this.category=o}}function Fe(e,t){if(t=="any"){const z=Ue();t=K(z)}if(e=="any"){const z=Je();e=K(z)}const n=gt(),o=vt(e),c=K(o),r=ft(e),m=Ee(r.body),k=Ee(r.head),H=Ee(r.ornamentation);let p=lt(n,e);p=ht(p,t);const v=pt(t),T=K(v);let w=K(p).description.replace("{head}",k.name);w=w.replace("{ornamentation}",H.name);const E=it();let ee=Ve(m.name)+` ${m.name} ${c.name} `;return ee+=w,new ut(E,ee,c.name,T)}function gt(){const e=["sword","axe","knife","dagger","scythe"],t=["sword","dagger"],n=["staff","spear","polearm"],o=["hammer","mace","club"],c=["hammer","mace"],r=["staff","bow","crossbow","club","spear","polearm","scythe","mace","hammer"],m=["staff"],k=["whip"],H=[new a("topped with a {head} wing",m,["air","wing","bird"]),new a("topped with a cluster of carved {head} wings",m,["air","wing","bird"]),new a("carved with sunrises in relief",o,["air","the sun","dawn","good"]),new a("with a {ornamentation} hilt engraved with a sunrise",t,["air","the sun","dawn"]),new a("with a {ornamentation} hilt engraved with a starlit sky",t,["stars","night","air"]),new a("with a {ornamentation} hilt engraved with a crescent moon",t,["the moon","night"]),new a("with a {ornamentation} hilt engraved with a cloud",t,["cloud","air"]),new a("with a {ornamentation} hilt engraved with a thunderbolt",t,["thunder","storm"]),new a("with two tails ending in barbs",k,["animals","monsters","war"]),new a("with three tails ending in barbs",k,["animals","monsters","war"]),new a("with nine tails ending in barbs",k,["animals","monsters","war"]),new a("with a wickedly serrated blade",e,["war","evil","hate","destruction"]),new a("with a blade engraved in malevolent runes",e,["war","evil","hate","demons","revenge"]),new a("with a multicolored blade",e,["art","chaos"]),new a("carved with sunrises in relief",r,["sky","the sun","dawn","good"]),new a("carved with an erupting volcano",r,["fire","destruction"]),new a("carved with depictions of many beasts",r,["animals","forest"]),new a("carved with a large, ornate tree",r,["forest","nature"]),new a("carved with leaves",r,["autumn","forest","nature"]),new a("with a {ornamentation} hilt engraved with a scale",t,["justice","balance","trade"]),new a("with several tails that seem to shimmer and shift",k,["chaos","trickery"]),new a("with a blade that seems to shimmer and shift",e,["chaos","trickery"]),new a("with a {head} head decorated with an eight-pointed star made of {ornamentation}",c,["chaos"]),new a("with a blade enshrouded in darkness",e,["darkness","evil","fear","hate","thieves"]),new a("with a skull-shaped head made of {head}",c,["death","evil","fear"]),new a("with a {ornamentation} hilt shaped like a skull",t,["death","evil","fear"]),new a("with a {head} blade that looks like a perpetually-moving sea of demons",e,["demons","evil"]),new a("carved with a setting sun laid in {ornamentation}",r,["dusk","darkness"]),new a("topped with a {head} head carved with a mountain in relief",c,["earth"]),new a("carved with a scene of people dancing",r,["fertility","music"]),new a("carved with a scene of a couple entwined",r,["fertility","love"]),new a("with a {head} blade carved with dancing flames",e,["fire"]),new a("whose top is a {head} carving of a fox",m,["foxes","animals"]),new a("with a carving of a resplendent sun in {ornamentation}",r,["good","the sun","life","summer"]),new a("engraved with a scene of a harvest",e,["harvests"]),new a("with carvings of radiant light throughout the shaft",r,["healing","good","light","hope","life"]),new a("engraved with hands outstretched",e,["hope","healing","good","mercy"]),new a("carved with horses running",r,["horses"]),new a("engraved with a horse's head",e,["horses"]),new a("with a {head} blade engraved with a blindfolded face",e,["justice"]),new a("with a carving of a stag",r,["forest","hunting"]),new a("with many intricate paintings of books",m,["knowledge"]),new a("stained with symbols of books",r,["knowledge"]),new a("shaped like many intertwined tongues",m,["language"]),new a("covered in engravings of open mouths",e,["language"]),new a("bearing an engraving of a sword laying on a book",e,["law"]),new a("carved in the shape of many intertwined vines",m,["life","nature","plants"]),new a("inlaid in {ornamentation} with many lightning bolts",e,["lightning","thunder"]),new a("inlaid in {ornamentation} with heart symbols",e,["love"]),new a("ornamented with {ornamentation} on the hilt",t,["love"]),new a("ornamented with intertwined {ornamentation} lines running up and down the shaft",n,["luck"]),new a("topped with a {head} six-sided die inlaid with {ornamentation}",c,["luck"]),new a("bearing a carving of an open hand",r,["mercy"]),new a("intricately painted with scenes of musicians playing",r,["music"]),new a("with a {ornamentation} crown on the hilt",t,["nobility"]),new a("carved with roaring waves",r,["oceans","water"]),new a("engraved with stylized waves",e,["oceans","water","rivers"]),new a("wrapped in {ornamentation} wire",n,["persistence"]),new a("covered in carvings of flowers inlaid with {ornamentation}",r,["spring","nature","plants"]),new a("engraved with shields inlaid with {ornamentation}",e,["protection"]),new a("topped with a {ornamentation} flower",c,["spring","nature","plants"]),new a("engraved with a symbol of a fist",e,["strength","war"]),new a("topped with a {head} head in the shape of a fist",c,["strength","war"]),new a("covered in carvings of crescent moons",r,["the moon","night"]),new a("with an hourglass inlaid in the hilt",t,["time"]),new a("with an hourglass carved into the shaft",n,["time"]),new a("with engravings of coins on the blade",e,["trade"]),new a("carved with a symbol of a man on horseback",r,["travel"]),new a("inlaid in {ornamentation} with snowflakes",e,["winter"]),new a("carved with an open book",r,["wisdom","knowledge"]),new a("engraved with an open eye",e,["wisdom"])],p=[{method:"carved with",objects:r},{method:"engraved with",objects:e},{method:"painted with",objects:r},{method:"stained to resemble",objects:r},{method:"with a {ornamentation} hilt engraved with",objects:t},{method:"with a {ornamentation} hilt shaped like",objects:t},{method:"woven to resemble",objects:["whip"]},{method:"with {head} tips cast to resemble",objects:["flail"]}],v=at();for(let T=0;T<v.length;T++)for(let A=0;A<p.length;A++)for(let w=0;w<v[T].holySymbols.length;w++){const E=new a(p[A].method+" "+Ve(v[T].holySymbols[w])+" "+v[T].holySymbols[w],p[A].objects,[v[T].name]);H.push(E)}return H}function pt(e){const t=nt(e);return t.weaponEffects.concat(t.otherEffects)}function Je(){const e=Ke(),t=[];for(let n=0;n<e.length;n++)t.includes(e[n].category)||t.push(e[n].category);return t}function Ke(){return[new i("short sword","1H","sword"),new i("long sword","1H","sword"),new i("broadsword","1H","sword"),new i("greatsword","2H","sword"),new i("bastard sword","1H","sword"),new i("scimitar","1H","sword"),new i("falchion","1H","sword"),new i("rapier","1H","sword"),new i("cutlass","1H","sword"),new i("war scythe","2H","scythe"),new i("sickle","1H","scythe"),new i("morningstar","1H","mace"),new i("mace","1H","mace"),new i("dagger","1H","dagger"),new i("kukri","1H","dagger"),new i("knife","1H","knife"),new i("hunting knife","1H","knife"),new i("long bow","2H","bow"),new i("shortbow","2H","bow"),new i("quarterstaff","2H","staff"),new i("staff","2H","staff"),new i("spear","2H","spear"),new i("short spear","1H","spear"),new i("broad axe","1H","axe"),new i("battle axe","1H","axe"),new i("throwing axe","1H","axe"),new i("double-bladed axe","1H","axe"),new i("crossbow","2H","crossbow"),new i("hand crossbow","1H","crossbow"),new i("war hammer","1H","hammer"),new i("maul","1H","hammer"),new i("great maul","2H","hammer"),new i("club","1H","club"),new i("heavy club","1H","club"),new i("great club","2H","club"),new i("whip","1H","whip"),new i("trident","2H","spear"),new i("flail","1H","flail"),new i("war flail","1H","flail"),new i("halberd","2H","polearm"),new i("pole axe","2H","polearm")]}function vt(e){const t=Ke(),n=[];for(let o=0;o<t.length;o++)t[o].category==e&&n.push(t[o]);return n}function We(e,t,n){const o=e.slice();return o[11]=t[n],o}function Be(e,t,n){const o=e.slice();return o[11]=t[n],o}function Ge(e){let t,n=e[11]+"",o;return{c(){t=u("option"),o=V(n),this.h()},l(c){t=g(c,"OPTION",{});var r=M(t);o=J(r,n),r.forEach(x),this.h()},h(){t.__value=e[11],$(t,t.__value)},m(c,r){fe(c,t,r),h(t,o)},p:me,d(c){c&&x(t)}}}function ze(e){let t,n=e[11]+"",o;return{c(){t=u("option"),o=V(n),this.h()},l(c){t=g(c,"OPTION",{});var r=M(t);o=J(r,n),r.forEach(x),this.h()},h(){t.__value=e[11],$(t,t.__value)},m(c,r){fe(c,t,r),h(t,o)},p:me,d(c){c&&x(t)}}}function bt(e){let t,n,o,c="Magic Weapon Generator",r,m,k="This generates a unique magical weapon.",H,p,v,T="Theme",A,w,E,ee="any",z,L,P,Se="Category",ue,C,O,je="any",ge,F,W,Ae="Random Seed",pe,D,ve,B,De="Generate From Seed",be,G,Ie="Random Seed (and Generate)",_e,Q,te=e[3].name+"",re,ye,N,ne=e[3].description+"",ie,ke,ae=e[3].effect+"",le,He,xe,Me,X=we(e[4]),_=[];for(let l=0;l<X.length;l+=1)_[l]=Ge(Be(e,X,l));let Y=we(e[5]),y=[];for(let l=0;l<Y.length;l+=1)y[l]=ze(We(e,Y,l));return{c(){t=S(),n=u("section"),o=u("h1"),o.textContent=c,r=S(),m=u("p"),m.textContent=k,H=S(),p=u("div"),v=u("label"),v.textContent=T,A=S(),w=u("select"),E=u("option"),E.textContent=ee;for(let l=0;l<_.length;l+=1)_[l].c();z=S(),L=u("div"),P=u("label"),P.textContent=Se,ue=S(),C=u("select"),O=u("option"),O.textContent=je;for(let l=0;l<y.length;l+=1)y[l].c();ge=S(),F=u("div"),W=u("label"),W.textContent=Ae,pe=S(),D=u("input"),ve=S(),B=u("button"),B.textContent=De,be=S(),G=u("button"),G.textContent=Ie,_e=S(),Q=u("h2"),re=V(te),ye=S(),N=u("p"),ie=V(ne),ke=V(". It "),le=V(ae),He=V("."),this.h()},l(l){tt("svelte-13os42b",document.head).forEach(x),t=j(l),n=g(l,"SECTION",{class:!0});var s=M(n);o=g(s,"H1",{class:!0,"data-svelte-h":!0}),R(o)!=="svelte-11honkk"&&(o.textContent=c),r=j(s),m=g(s,"P",{class:!0,"data-svelte-h":!0}),R(m)!=="svelte-ffqwwi"&&(m.textContent=k),H=j(s),p=g(s,"DIV",{class:!0});var I=M(p);v=g(I,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),R(v)!=="svelte-1ho886c"&&(v.textContent=T),A=j(I),w=g(I,"SELECT",{name:!0,id:!0,class:!0});var Ce=M(w);E=g(Ce,"OPTION",{"data-svelte-h":!0}),R(E)!=="svelte-1j2tppc"&&(E.textContent=ee);for(let U=0;U<_.length;U+=1)_[U].l(Ce);Ce.forEach(x),I.forEach(x),z=j(s),L=g(s,"DIV",{class:!0});var he=M(L);P=g(he,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),R(P)!=="svelte-4738v6"&&(P.textContent=Se),ue=j(he),C=g(he,"SELECT",{name:!0,id:!0,class:!0});var qe=M(C);O=g(qe,"OPTION",{"data-svelte-h":!0}),R(O)!=="svelte-1j2tppc"&&(O.textContent=je);for(let U=0;U<y.length;U+=1)y[U].l(qe);qe.forEach(x),he.forEach(x),ge=j(s),F=g(s,"DIV",{class:!0});var ce=M(F);W=g(ce,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),R(W)!=="svelte-1akft3f"&&(W.textContent=Ae),pe=j(ce),D=g(ce,"INPUT",{type:!0,name:!0,id:!0,class:!0}),ce.forEach(x),ve=j(s),B=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),R(B)!=="svelte-1u7zbd5"&&(B.textContent=De),be=j(s),G=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),R(G)!=="svelte-192mxrq"&&(G.textContent=Ie),_e=j(s),Q=g(s,"H2",{class:!0});var Oe=M(Q);re=J(Oe,te),Oe.forEach(x),ye=j(s),N=g(s,"P",{class:!0});var oe=M(N);ie=J(oe,ne),ke=J(oe,". It "),le=J(oe,ae),He=J(oe,"."),oe.forEach(x),s.forEach(x),this.h()},h(){document.title="Magic Weapon Generator | Iron Arachne",d(o,"class","svelte-4q74qx"),d(m,"class","svelte-4q74qx"),d(v,"for","theme"),d(v,"class","svelte-4q74qx"),E.__value="any",$(E,E.__value),d(w,"name","theme"),d(w,"id","theme"),d(w,"class","svelte-4q74qx"),e[1]===void 0&&Ne(()=>e[8].call(w)),d(p,"class","input-group svelte-4q74qx"),d(P,"for","category"),d(P,"class","svelte-4q74qx"),O.__value="any",$(O,O.__value),d(C,"name","category"),d(C,"id","category"),d(C,"class","svelte-4q74qx"),e[0]===void 0&&Ne(()=>e[9].call(C)),d(L,"class","input-group svelte-4q74qx"),d(W,"for","seed"),d(W,"class","svelte-4q74qx"),d(D,"type","text"),d(D,"name","seed"),d(D,"id","seed"),d(D,"class","svelte-4q74qx"),d(F,"class","input-group svelte-4q74qx"),d(B,"class","svelte-4q74qx"),d(G,"class","svelte-4q74qx"),d(Q,"class","svelte-4q74qx"),d(N,"class","svelte-4q74qx"),d(n,"class","fantasy main svelte-4q74qx")},m(l,q){fe(l,t,q),fe(l,n,q),h(n,o),h(n,r),h(n,m),h(n,H),h(n,p),h(p,v),h(p,A),h(p,w),h(w,E);for(let s=0;s<_.length;s+=1)_[s]&&_[s].m(w,null);de(w,e[1],!0),h(n,z),h(n,L),h(L,P),h(L,ue),h(L,C),h(C,O);for(let s=0;s<y.length;s+=1)y[s]&&y[s].m(C,null);de(C,e[0],!0),h(n,ge),h(n,F),h(F,W),h(F,pe),h(F,D),$(D,e[2]),h(n,ve),h(n,B),h(n,be),h(n,G),h(n,_e),h(n,Q),h(Q,re),h(n,ye),h(n,N),h(N,ie),h(N,ke),h(N,le),h(N,He),xe||(Me=[se(w,"change",e[8]),se(C,"change",e[9]),se(D,"input",e[10]),se(B,"click",e[6]),se(G,"click",e[7])],xe=!0)},p(l,[q]){if(q&16){X=we(l[4]);let s;for(s=0;s<X.length;s+=1){const I=Be(l,X,s);_[s]?_[s].p(I,q):(_[s]=Ge(I),_[s].c(),_[s].m(w,null))}for(;s<_.length;s+=1)_[s].d(1);_.length=X.length}if(q&18&&de(w,l[1]),q&32){Y=we(l[5]);let s;for(s=0;s<Y.length;s+=1){const I=We(l,Y,s);y[s]?y[s].p(I,q):(y[s]=ze(I),y[s].c(),y[s].m(C,null))}for(;s<y.length;s+=1)y[s].d(1);y.length=Y.length}q&33&&de(C,l[0]),q&4&&D.value!==l[2]&&$(D,l[2]),q&8&&te!==(te=l[3].name+"")&&Te(re,te),q&8&&ne!==(ne=l[3].description+"")&&Te(ie,ne),q&8&&ae!==(ae=l[3].effect+"")&&Te(le,ae)},i:me,o:me,d(l){l&&(x(t),x(n)),Re(_,l),Re(y,l),xe=!1,Ze(Me)}}}function _t(e,t,n){let o=Ue().sort(),c=Je().sort(),r="any",m="any",k=Pe(13),H=Fe(r,m);function p(){st.use(rt(k)),n(3,H=Fe(r,m)),n(3,H.description=H.name+" is "+H.description,H)}function v(){n(2,k=Pe(13)),p()}v();function T(){m=Le(this),n(1,m),n(4,o)}function A(){r=Le(this),n(0,r),n(5,c)}function w(){k=this.value,n(2,k)}return[r,m,k,H,o,c,p,v,T,A,w]}class At extends $e{constructor(t){super(),et(this,t,_t,bt,Ye,{})}}export{At as component};
