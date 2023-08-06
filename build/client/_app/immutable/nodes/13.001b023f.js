var He=Object.defineProperty;var Ue=(l,s,e)=>s in l?He(l,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):l[s]=e;var le=(l,s,e)=>(Ue(l,typeof s!="symbol"?s+"":s,e),e);import{s as Je,h as Ie,n as Ee,r as Ke}from"../chunks/scheduler.db8c6f43.js";import{S as Qe,i as We,s as q,g as h,m as z,z as Xe,f as p,c as x,h as f,j as L,x as S,n as H,k as c,D as Y,a as D,y as a,E as ue,C as se,o as ae,A as ye,F as $e}from"../chunks/index.06c262ec.js";import{e as he}from"../chunks/each.e59479a4.js";import{c as Ve}from"../chunks/currency.3629a871.js";import{i as De,r as Me}from"../chunks/index.d6e945a3.js";import{b as be,c as U}from"../chunks/index.e0b9de06.js";import{r as ze}from"../chunks/random.7fb76a35.js";import{C as Ye}from"../chunks/fantasy.7019879b.js";import{g as Ze}from"../chunks/premadeconfigs.5202e86f.js";import{d as et,f as tt,b as lt}from"../chunks/patterns.db16459b.js";import{s as st}from"../chunks/index.401ef785.js";function at(l,s,e,o){let r=[],i=[];l=="general"?i=et():i=tt(l);for(let _=0;_<e;_++){let N=De(i).complete(s,o);r.push(N)}return r}function nt(l,s,e){let o=lt();return at(l,o,s,e)}class rt{constructor(s,e,o,r){le(this,"character");le(this,"description");le(this,"wares");le(this,"priceVariance");this.character=s,this.description=e,this.wares=o,this.priceVariance=r}}function je(l,s){let e=Ze();e.ageCategories=["adult"];let r=new Ye(e).generate(),i=De([`${r.firstName} ${r.lastName} is ${be(l)} ${l} merchant.`,`${r.firstName} ${r.lastName}, ${be(r.species.name)} ${r.species.name} ${r.ageCategory.noun}, is ${be(l)} ${l} merchant.`]),_=nt(l,10,s),d=ze.float(.8,1.2);return d>1?i+=" "+U(r.gender.subjectivePronoun)+" charges more than others.":d<1&&(i+=" "+U(r.gender.subjectivePronoun)+" charges less than others."),new rt(r,i,_,d)}function Ae(l,s,e){const o=l.slice();return o[10]=s[e],o}function Be(l,s,e){const o=l.slice();return o[13]=s[e],o}function Fe(l){let s,e=l[13]+"",o;return{c(){s=h("option"),o=z(e),this.h()},l(r){s=f(r,"OPTION",{});var i=L(s);o=H(i,e),i.forEach(p),this.h()},h(){s.__value=l[13],Y(s,s.__value)},m(r,i){D(r,s,i),a(s,o)},p:Ee,d(r){r&&p(s)}}}function Re(l){let s,e=U(l[10].name)+"",o,r,i,_=U(l[10].description)+"",d,N,b,v,k,j="Cost:",E,I=Ve(Math.floor(l[10].value*l[2].priceVariance),!1,!1,!1)+"",w;return{c(){s=h("h4"),o=z(e),r=q(),i=h("p"),d=z(_),N=z("."),b=q(),v=h("p"),k=h("strong"),k.textContent=j,E=q(),w=z(I),this.h()},l(u){s=f(u,"H4",{class:!0});var T=L(s);o=H(T,e),T.forEach(p),r=x(u),i=f(u,"P",{class:!0});var J=L(i);d=H(J,_),N=H(J,"."),J.forEach(p),b=x(u),v=f(u,"P",{class:!0});var m=L(v);k=f(m,"STRONG",{class:!0,"data-svelte-h":!0}),S(k)!=="svelte-fhmlx1"&&(k.textContent=j),E=x(m),w=H(m,I),m.forEach(p),this.h()},h(){c(s,"class","svelte-4q74qx"),c(i,"class","svelte-4q74qx"),c(k,"class","svelte-4q74qx"),c(v,"class","svelte-4q74qx")},m(u,T){D(u,s,T),a(s,o),D(u,r,T),D(u,i,T),a(i,d),a(i,N),D(u,b,T),D(u,v,T),a(v,k),a(v,E),a(v,w)},p(u,T){T&4&&e!==(e=U(u[10].name)+"")&&ae(o,e),T&4&&_!==(_=U(u[10].description)+"")&&ae(d,_),T&4&&I!==(I=Ve(Math.floor(u[10].value*u[2].priceVariance),!1,!1,!1)+"")&&ae(w,I)},d(u){u&&(p(s),p(r),p(i),p(b),p(v))}}}function ot(l){let s,e,o,r="Fantasy Merchant Generator",i,_,d="This generates a fantasy merchant and a list of their wares.",N,b,v,k="Random Seed",j,E,I,w,u,T="Material Rarity Threshold",J,m,y,Te="Common",$,we="Rare",V,Pe="Legendary",fe,A,B,Ne="Type of Goods",_e,O,ve,F,ke="Generate From Seed",pe,R,Oe="Random Seed (and Generate)",de,M,Z=l[2].description+"",ne,me,ee=U(l[2].character.gender.possessivePronoun)+"",re,ge,Ce,K,Se="Stock List",qe,xe,Le,W=he(l[4]),g=[];for(let n=0;n<W.length;n+=1)g[n]=Fe(Be(l,W,n));let X=he(l[2].wares),C=[];for(let n=0;n<X.length;n+=1)C[n]=Re(Ae(l,X,n));return{c(){s=q(),e=h("section"),o=h("h1"),o.textContent=r,i=q(),_=h("p"),_.textContent=d,N=q(),b=h("div"),v=h("label"),v.textContent=k,j=q(),E=h("input"),I=q(),w=h("div"),u=h("label"),u.textContent=T,J=q(),m=h("select"),y=h("option"),y.textContent=Te,$=h("option"),$.textContent=we,V=h("option"),V.textContent=Pe,fe=q(),A=h("div"),B=h("label"),B.textContent=Ne,_e=q(),O=h("select");for(let n=0;n<g.length;n+=1)g[n].c();ve=q(),F=h("button"),F.textContent=ke,pe=q(),R=h("button"),R.textContent=Oe,de=q(),M=h("p"),ne=z(Z),me=q(),re=z(ee),ge=z(" wares include:"),Ce=q(),K=h("h2"),K.textContent=Se,qe=q();for(let n=0;n<C.length;n+=1)C[n].c();this.h()},l(n){Xe("svelte-977j56",document.head).forEach(p),s=x(n),e=f(n,"SECTION",{class:!0});var t=L(e);o=f(t,"H1",{class:!0,"data-svelte-h":!0}),S(o)!=="svelte-1e36sgb"&&(o.textContent=r),i=x(t),_=f(t,"P",{class:!0,"data-svelte-h":!0}),S(_)!=="svelte-ofmwpk"&&(_.textContent=d),N=x(t),b=f(t,"DIV",{class:!0});var G=L(b);v=f(G,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),S(v)!=="svelte-1akft3f"&&(v.textContent=k),j=x(G),E=f(G,"INPUT",{type:!0,name:!0,id:!0,class:!0}),G.forEach(p),I=x(t),w=f(t,"DIV",{class:!0});var oe=L(w);u=f(oe,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),S(u)!=="svelte-rrnuoy"&&(u.textContent=T),J=x(oe),m=f(oe,"SELECT",{name:!0,class:!0});var ie=L(m);y=f(ie,"OPTION",{"data-svelte-h":!0}),S(y)!=="svelte-1wajrme"&&(y.textContent=Te),$=f(ie,"OPTION",{"data-svelte-h":!0}),S($)!=="svelte-5n7ygf"&&($.textContent=we),V=f(ie,"OPTION",{"data-svelte-h":!0}),S(V)!=="svelte-1l5yh5m"&&(V.textContent=Pe),ie.forEach(p),oe.forEach(p),fe=x(t),A=f(t,"DIV",{class:!0});var ce=L(A);B=f(ce,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),S(B)!=="svelte-130nxmy"&&(B.textContent=Ne),_e=x(ce),O=f(ce,"SELECT",{name:!0,class:!0});var Ge=L(O);for(let Q=0;Q<g.length;Q+=1)g[Q].l(Ge);Ge.forEach(p),ce.forEach(p),ve=x(t),F=f(t,"BUTTON",{class:!0,"data-svelte-h":!0}),S(F)!=="svelte-1u7zbd5"&&(F.textContent=ke),pe=x(t),R=f(t,"BUTTON",{class:!0,"data-svelte-h":!0}),S(R)!=="svelte-192mxrq"&&(R.textContent=Oe),de=x(t),M=f(t,"P",{class:!0});var te=L(M);ne=H(te,Z),me=x(te),re=H(te,ee),ge=H(te," wares include:"),te.forEach(p),Ce=x(t),K=f(t,"H2",{class:!0,"data-svelte-h":!0}),S(K)!=="svelte-16g6os4"&&(K.textContent=Se),qe=x(t);for(let Q=0;Q<C.length;Q+=1)C[Q].l(t);t.forEach(p),this.h()},h(){document.title="Fantasy Merchant Generator | Iron Arachne",c(o,"class","svelte-4q74qx"),c(_,"class","svelte-4q74qx"),c(v,"for","seed"),c(v,"class","svelte-4q74qx"),c(E,"type","text"),c(E,"name","seed"),c(E,"id","seed"),c(E,"class","svelte-4q74qx"),c(b,"class","input-group svelte-4q74qx"),c(u,"for","value"),c(u,"class","svelte-4q74qx"),y.__value="50",Y(y,y.__value),$.__value="100",Y($,$.__value),V.__value="10000",Y(V,V.__value),c(m,"name","value"),c(m,"class","svelte-4q74qx"),l[1]===void 0&&Ie(()=>l[8].call(m)),c(w,"class","input-group svelte-4q74qx"),c(B,"for","value"),c(B,"class","svelte-4q74qx"),c(O,"name","value"),c(O,"class","svelte-4q74qx"),l[0]===void 0&&Ie(()=>l[9].call(O)),c(A,"class","input-group svelte-4q74qx"),c(F,"class","svelte-4q74qx"),c(R,"class","svelte-4q74qx"),c(M,"class","svelte-4q74qx"),c(K,"class","svelte-4q74qx"),c(e,"class","fantasy main svelte-4q74qx")},m(n,P){D(n,s,P),D(n,e,P),a(e,o),a(e,i),a(e,_),a(e,N),a(e,b),a(b,v),a(b,j),a(b,E),Y(E,l[3]),a(e,I),a(e,w),a(w,u),a(w,J),a(w,m),a(m,y),a(m,$),a(m,V),ue(m,l[1],!0),a(e,fe),a(e,A),a(A,B),a(A,_e),a(A,O);for(let t=0;t<g.length;t+=1)g[t]&&g[t].m(O,null);ue(O,l[0],!0),a(e,ve),a(e,F),a(e,pe),a(e,R),a(e,de),a(e,M),a(M,ne),a(M,me),a(M,re),a(M,ge),a(e,Ce),a(e,K),a(e,qe);for(let t=0;t<C.length;t+=1)C[t]&&C[t].m(e,null);xe||(Le=[se(E,"input",l[7]),se(m,"change",l[8]),se(O,"change",l[9]),se(F,"click",l[5]),se(R,"click",l[6])],xe=!0)},p(n,[P]){if(P&8&&E.value!==n[3]&&Y(E,n[3]),P&2&&ue(m,n[1]),P&16){W=he(n[4]);let t;for(t=0;t<W.length;t+=1){const G=Be(n,W,t);g[t]?g[t].p(G,P):(g[t]=Fe(G),g[t].c(),g[t].m(O,null))}for(;t<g.length;t+=1)g[t].d(1);g.length=W.length}if(P&17&&ue(O,n[0]),P&4&&Z!==(Z=n[2].description+"")&&ae(ne,Z),P&4&&ee!==(ee=U(n[2].character.gender.possessivePronoun)+"")&&ae(re,ee),P&4){X=he(n[2].wares);let t;for(t=0;t<X.length;t+=1){const G=Ae(n,X,t);C[t]?C[t].p(G,P):(C[t]=Re(G),C[t].c(),C[t].m(e,null))}for(;t<C.length;t+=1)C[t].d(1);C.length=X.length}},i:Ee,o:Ee,d(n){n&&(p(s),p(e)),ye(g,n),ye(C,n),xe=!1,Ke(Le)}}}function it(l,s,e){let o="general",r=50,i=["armor","clothing","general","weapon"],_=je(o,r),d=Me(13);function N(){ze.use(st(d)),e(2,_=je(o,r))}function b(){e(3,d=Me(13)),N()}function v(){d=this.value,e(3,d)}function k(){r=$e(this),e(1,r)}function j(){o=$e(this),e(0,o),e(4,i)}return[o,r,_,d,i,N,b,v,k,j]}class xt extends Qe{constructor(s){super(),We(this,s,it,ot,Je,{})}}export{xt as component};
