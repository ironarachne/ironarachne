import{s as ie,a as ce,n as F}from"../chunks/scheduler.5o8iMP-j.js";import{S as re,i as he,s as I,e as m,l as ue,d as g,f as H,c as w,a as A,g as M,m as _,p as ee,h as P,j as r,u as te,q as fe,n as oe,t as R,b as W,x as pe}from"../chunks/index.EoApDFme.js";import{e as z}from"../chunks/each.-oqiv04n.js";import{c as de,a as ve}from"../chunks/currency.ZMcWCrAz.js";class B{title;items;constructor(e,t){this.title=e,this.items=t}}class n{name;cost;constructor(e,t){this.name=e,this.cost=t}}class q{name;materialType;materialAmount;constructor(e,t,l){this.name=e,this.materialType=t,this.materialAmount=l}}function me(){return[new B("Books and Education",[new n("book",1344),new n("fencing instruction (1 month)",480),new n("monastery instruction (1 year)",1920),new n("university instruction (1 year)",2880)]),new B("Clothing",we()),new B("Drinks",[new n("ale, cheap (1 gallon)",3),new n("ale, cheap (1 mug)",1),new n("ale, good (1 gallon)",6),new n("ale, good (1 mug)",2),new n("beer, cheap (1 gallon)",8),new n("beer, cheap (1 mug)",2),new n("beer, good (1 gallon)",24),new n("beer, good (1 mug)",4),new n("mead, cheap (1 gallon)",10),new n("mead, cheap (1 mug)",3),new n("mead, good (1 gallon)",28),new n("mead, good (1 mug)",5),new n("wine, cheap (1 gallon)",12),new n("wine, cheap (1 mug)",2),new n("wine, good (1 gallon)",32),new n("wine, good (1 mug)",6)]),new B("Livestock",[new n("chicken",2),new n("cow",480),new n("goat",57),new n("goose",24),new n("ox",584),new n("pig",144),new n("sheep",68)]),new B("Mounts",[new n("draught horse",480),new n("riding horse",2400),new n("war horse",19200)]),new B("Property",[new n("castle",5616e3),new n("church",115200),new n("cottage",1920),new n("craftsman's house",9600),new n("merchant's house",31680),new n("row house",4800)]),new B("Tools",[new n("anvil",240),new n("augur",12),new n("axe",20),new n("bellows",360),new n("chisel",16),new n("hammer",32),new n("shovel",8),new n("spade",4),new n("spinning wheel",40),new n("vice",176),new n("yoke",96)])]}function we(){const s=[new q("shirt","cloth",2),new q("tunic","cloth",3),new q("shoes","cloth",.75),new q("boots","cloth",1),new q("tall boots","leather",1.2),new q("dress","cloth",5),new q("layered dress","cloth",12),new q("leggings","cloth",2.2),new q("trews","cloth",2),new q("trousers","cloth",2.5),new q("belt","leather",.5),new q("half-circle cloak","cloth",3),new q("full-circle cloak","cloth",6),new q("cape","cloth",2),new q("cap","cloth",1),new q("floppy hat","cloth",1.2),new q("cavalier hat","leather",1.5),new q("muffin hat","cloth",2),new q("capitano hat","cloth",1.4)];let e=[];for(let t=0;t<s.length;t++)e.push(new n(s[t].name+", cheap",Q(s[t].materialType,s[t].materialAmount,"cheap")),new n(s[t].name+", fine",Q(s[t].materialType,s[t].materialAmount,"fine")),new n(s[t].name+", courtly",Q(s[t].materialType,s[t].materialAmount,"courtly")));return e}function Q(s,e,t){let l=e;return s=="cloth"?l=l:l=l*2,t=="cheap"?l=l:t=="fine"?l*=2:l*=3,l*=e*24,Math.floor(l+8)}function le(s,e,t){const l=s.slice();return l[5]=e[t],l}function ne(s,e,t){const l=s.slice();return l[8]=e[t],l}function _e(s){let e,t='<ul class="svelte-4q74qx"><li class="svelte-4q74qx">f: farthing</li> <li class="svelte-4q74qx">d: pence (worth 4 farthings)</li> <li class="svelte-4q74qx">s: shilling (worth 12 pence)</li> <li class="svelte-4q74qx">c: crown (worth 5 shillings)</li> <li class="svelte-4q74qx">£: pound (worth 20 shillings)</li></ul>';return{c(){e=m("div"),e.innerHTML=t,this.h()},l(l){e=w(l,"DIV",{class:!0,"data-svelte-h":!0}),M(e)!=="svelte-1t92v6l"&&(e.innerHTML=t),this.h()},h(){_(e,"class","svelte-4q74qx")},m(l,i){P(l,e,i)},d(l){l&&g(e)}}}function ge(s){let e,t='<ul class="svelte-4q74qx"><li class="svelte-4q74qx">cp: copper piece</li> <li class="svelte-4q74qx">sp: silver piece (worth 10 copper pieces)</li> <li class="svelte-4q74qx">ep: electrum piece (worth 50 copper pieces, rare)</li> <li class="svelte-4q74qx">gp: gold piece (worth 10 silver pieces)</li> <li class="svelte-4q74qx">pp: platinum piece (worth 10 gold pieces, rare)</li></ul>';return{c(){e=m("div"),e.innerHTML=t,this.h()},l(l){e=w(l,"DIV",{class:!0,"data-svelte-h":!0}),M(e)!=="svelte-16gv19w"&&(e.innerHTML=t),this.h()},h(){_(e,"class","svelte-4q74qx")},m(l,i){P(l,e,i)},d(l){l&&g(e)}}}function qe(s){let e,t=s[3](s[8].cost)+"",l;return{c(){e=m("td"),l=R(t),this.h()},l(i){e=w(i,"TD",{class:!0});var f=A(e);l=W(f,t),f.forEach(g),this.h()},h(){_(e,"class","svelte-4q74qx")},m(i,f){P(i,e,f),r(e,l)},p:F,d(i){i&&g(e)}}}function xe(s){let e,t=s[2](s[8].cost)+"",l;return{c(){e=m("td"),l=R(t),this.h()},l(i){e=w(i,"TD",{class:!0});var f=A(e);l=W(f,t),f.forEach(g),this.h()},h(){_(e,"class","svelte-4q74qx")},m(i,f){P(i,e,f),r(e,l)},p:F,d(i){i&&g(e)}}}function se(s){let e,t,l=s[8].name+"",i,f,p;function E(d,x){if(d[0]==="D&D currency")return xe;if(d[0]==="English currency")return qe}let b=E(s),c=b&&b(s);return{c(){e=m("tr"),t=m("td"),i=R(l),f=I(),c&&c.c(),p=I(),this.h()},l(d){e=w(d,"TR",{class:!0});var x=A(e);t=w(x,"TD",{class:!0});var y=A(t);i=W(y,l),y.forEach(g),f=H(x),c&&c.l(x),p=H(x),x.forEach(g),this.h()},h(){_(t,"class","svelte-4q74qx"),_(e,"class","svelte-4q74qx")},m(d,x){P(d,e,x),r(e,t),r(t,i),r(e,f),c&&c.m(e,null),r(e,p)},p(d,x){b===(b=E(d))&&c?c.p(d,x):(c&&c.d(1),c=b&&b(d),c&&(c.c(),c.m(e,p)))},d(d){d&&g(e),c&&c.d()}}}function ae(s){let e,t,l=s[5].title+"",i,f,p,E,b='<tr class="svelte-4q74qx"><th class="svelte-4q74qx">Name</th> <th class="svelte-4q74qx">Cost</th></tr>',c,d,x,y=z(s[5].items),h=[];for(let v=0;v<y.length;v+=1)h[v]=se(ne(s,y,v));return{c(){e=m("div"),t=m("h2"),i=R(l),f=I(),p=m("table"),E=m("thead"),E.innerHTML=b,c=I(),d=m("tbody");for(let v=0;v<h.length;v+=1)h[v].c();x=I(),this.h()},l(v){e=w(v,"DIV",{class:!0});var T=A(e);t=w(T,"H2",{class:!0});var a=A(t);i=W(a,l),a.forEach(g),f=H(T),p=w(T,"TABLE",{class:!0});var C=A(p);E=w(C,"THEAD",{class:!0,"data-svelte-h":!0}),M(E)!=="svelte-yjjehb"&&(E.innerHTML=b),c=H(C),d=w(C,"TBODY",{class:!0});var $=A(d);for(let L=0;L<h.length;L+=1)h[L].l($);$.forEach(g),C.forEach(g),x=H(T),T.forEach(g),this.h()},h(){_(t,"class","svelte-4q74qx"),_(E,"class","svelte-4q74qx"),_(d,"class","svelte-4q74qx"),_(p,"class","svelte-4q74qx"),_(e,"class","equipment-list svelte-4q74qx")},m(v,T){P(v,e,T),r(e,t),r(t,i),r(e,f),r(e,p),r(p,E),r(p,c),r(p,d);for(let a=0;a<h.length;a+=1)h[a]&&h[a].m(d,null);r(e,x)},p(v,T){if(T&15){y=z(v[5].items);let a;for(a=0;a<y.length;a+=1){const C=ne(v,y,a);h[a]?h[a].p(C,T):(h[a]=se(C),h[a].c(),h[a].m(d,null))}for(;a<h.length;a+=1)h[a].d(1);h.length=y.length}},d(v){v&&g(e),oe(h,v)}}}function ye(s){let e,t,l,i="Fantasy Equipment Lists",f,p,E=`This page is meant to be a comprehensive list of equipment for fantasy
    games. It will be updated over time, so keep checking back for new
    entries.`,b,c,d=`Where possible, I've based the prices off of historical data rather than
    fantasy sources. 1 copper coin is treated as equivalent to 1 farthing.`,x,y,h,v="Currency Type",T,a,C,$="D&D currency",L,U="English currency",Y,j,G,X;function Z(u,O){if(u[0]==="D&D currency")return ge;if(u[0]==="English currency")return _e}let S=Z(s),D=S&&S(s),V=z(s[1]),k=[];for(let u=0;u<V.length;u+=1)k[u]=ae(le(s,V,u));return{c(){e=I(),t=m("section"),l=m("h1"),l.textContent=i,f=I(),p=m("p"),p.textContent=E,b=I(),c=m("p"),c.textContent=d,x=I(),y=m("div"),h=m("label"),h.textContent=v,T=I(),a=m("select"),C=m("option"),C.textContent=$,L=m("option"),L.textContent=U,Y=I(),D&&D.c(),j=I();for(let u=0;u<k.length;u+=1)k[u].c();this.h()},l(u){ue("svelte-gt714g",document.head).forEach(g),e=H(u),t=w(u,"SECTION",{class:!0});var o=A(t);l=w(o,"H1",{class:!0,"data-svelte-h":!0}),M(l)!=="svelte-kzggkr"&&(l.textContent=i),f=H(o),p=w(o,"P",{class:!0,"data-svelte-h":!0}),M(p)!=="svelte-17k04rr"&&(p.textContent=E),b=H(o),c=w(o,"P",{class:!0,"data-svelte-h":!0}),M(c)!=="svelte-cfiutn"&&(c.textContent=d),x=H(o),y=w(o,"DIV",{class:!0});var N=A(y);h=w(N,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),M(h)!=="svelte-1eu2x3y"&&(h.textContent=v),T=H(N),a=w(N,"SELECT",{name:!0,class:!0});var J=A(a);C=w(J,"OPTION",{"data-svelte-h":!0}),M(C)!=="svelte-k5a4x5"&&(C.textContent=$),L=w(J,"OPTION",{"data-svelte-h":!0}),M(L)!=="svelte-4cwnnn"&&(L.textContent=U),J.forEach(g),N.forEach(g),Y=H(o),D&&D.l(o),j=H(o);for(let K=0;K<k.length;K+=1)k[K].l(o);o.forEach(g),this.h()},h(){document.title="Fantasy Equipment Lists | Iron Arachne",_(l,"class","svelte-4q74qx"),_(p,"class","svelte-4q74qx"),_(c,"class","svelte-4q74qx"),_(h,"for","currency"),_(h,"class","svelte-4q74qx"),C.__value="D&D currency",ee(C,C.__value),L.__value="English currency",ee(L,L.__value),_(a,"name","currency"),_(a,"class","svelte-4q74qx"),s[0]===void 0&&ce(()=>s[4].call(a)),_(y,"class","input-group svelte-4q74qx"),_(t,"class","fantasy main svelte-4q74qx")},m(u,O){P(u,e,O),P(u,t,O),r(t,l),r(t,f),r(t,p),r(t,b),r(t,c),r(t,x),r(t,y),r(y,h),r(y,T),r(y,a),r(a,C),r(a,L),te(a,s[0],!0),r(t,Y),D&&D.m(t,null),r(t,j);for(let o=0;o<k.length;o+=1)k[o]&&k[o].m(t,null);G||(X=fe(a,"change",s[4]),G=!0)},p(u,[O]){if(O&1&&te(a,u[0]),S!==(S=Z(u))&&(D&&D.d(1),D=S&&S(u),D&&(D.c(),D.m(t,j))),O&15){V=z(u[1]);let o;for(o=0;o<V.length;o+=1){const N=le(u,V,o);k[o]?k[o].p(N,O):(k[o]=ae(N),k[o].c(),k[o].m(t,null))}for(;o<k.length;o+=1)k[o].d(1);k.length=V.length}},i:F,o:F,d(u){u&&(g(e),g(t)),D&&D.d(),oe(k,u),G=!1,X()}}}function be(s,e,t){let l="D&D currency",i=me();function f(b){return de(b,!1,!1)}function p(b){return ve(b)}function E(){l=pe(this),t(0,l)}return[l,i,f,p,E]}class De extends re{constructor(e){super(),he(this,e,be,ye,ie,{})}}export{De as component};
//# sourceMappingURL=11.klNfXYhU.js.map
