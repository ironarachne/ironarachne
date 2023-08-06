import{s as Ge,n as re,r as ke,i as Ne,h as Ie}from"../chunks/scheduler.db8c6f43.js";import{S as Pe,i as we,s as E,g as p,m as B,z as Te,f as C,c as S,h as g,j as N,x as A,n as U,k as h,a as V,y as s,D as ie,C as se,o as J,A as ue,E as ve,e as me,F as He}from"../chunks/index.06c262ec.js";import{e as te}from"../chunks/each.e59479a4.js";import"../chunks/index.e0b9de06.js";import{r as _e}from"../chunks/index.d6e945a3.js";import{H as Re}from"../chunks/human.059a5398.js";import{r as pe}from"../chunks/random.7fb76a35.js";import{R as De,a as Le}from"../chunks/generator.a133b8d8.js";import{s as ge}from"../chunks/index.401ef785.js";function qe(o,t,e){const r=o.slice();return r[15]=t[e],r}function Ce(o,t,e){const r=o.slice();return r[18]=t[e],r}function xe(o,t,e){const r=o.slice();return r[21]=t[e],r}function Oe(o){let t,e,r="Use a saved culture for naming?",m,u,d,n,a,v="Select a saved culture to load",l,_,w,k,G=te(o[4].savedCultures),x=[];for(let c=0;c<G.length;c+=1)x[c]=be(xe(o,G,c));return{c(){t=p("div"),e=p("label"),e.textContent=r,m=E(),u=p("input"),d=E(),n=p("div"),a=p("label"),a.textContent=v,l=E(),_=p("select");for(let c=0;c<x.length;c+=1)x[c].c();this.h()},l(c){t=g(c,"DIV",{class:!0});var b=N(t);e=g(b,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),A(e)!=="svelte-14j9oxd"&&(e.textContent=r),m=S(b),u=g(b,"INPUT",{type:!0,name:!0,id:!0,class:!0}),b.forEach(C),d=S(c),n=g(c,"DIV",{class:!0});var f=N(n);a=g(f,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),A(a)!=="svelte-32ylm8"&&(a.textContent=v),l=S(f),_=g(f,"SELECT",{class:!0});var I=N(_);for(let j=0;j<x.length;j+=1)x[j].l(I);I.forEach(C),f.forEach(C),this.h()},h(){h(e,"for","useSavedCulture"),h(e,"class","svelte-4q74qx"),h(u,"type","checkbox"),h(u,"name","useSavedCulture"),h(u,"id","useSavedCulture"),h(u,"class","svelte-4q74qx"),h(t,"class","input-group svelte-4q74qx"),h(a,"for","savedCulture"),h(a,"class","svelte-4q74qx"),h(_,"class","svelte-4q74qx"),o[0]===void 0&&Ie(()=>o[9].call(_)),h(n,"class","input-group svelte-4q74qx")},m(c,b){V(c,t,b),s(t,e),s(t,m),s(t,u),u.checked=o[1],V(c,d,b),V(c,n,b),s(n,a),s(n,l),s(n,_);for(let f=0;f<x.length;f+=1)x[f]&&x[f].m(_,null);ve(_,o[0],!0),w||(k=[se(u,"change",o[8]),se(_,"change",o[9])],w=!0)},p(c,b){if(b&2&&(u.checked=c[1]),b&16){G=te(c[4].savedCultures);let f;for(f=0;f<G.length;f+=1){const I=xe(c,G,f);x[f]?x[f].p(I,b):(x[f]=be(I),x[f].c(),x[f].m(_,null))}for(;f<x.length;f+=1)x[f].d(1);x.length=G.length}b&17&&ve(_,c[0])},d(c){c&&(C(t),C(d),C(n)),ue(x,c),w=!1,ke(k)}}}function be(o){let t,e=o[21].name+"",r;return{c(){t=p("option"),r=B(e),this.h()},l(m){t=g(m,"OPTION",{});var u=N(t);r=U(u,e),u.forEach(C),this.h()},h(){t.__value=o[21].name,ie(t,t.__value)},m(m,u){V(m,t,u),s(t,r)},p:re,d(m){m&&C(t)}}}function Ee(o){let t,e,r=o[18].name+"",m,u,d,n=o[18].description+"",a;return{c(){t=p("div"),e=p("h4"),m=B(r),u=E(),d=p("p"),a=B(n),this.h()},l(v){t=g(v,"DIV",{class:!0});var l=N(t);e=g(l,"H4",{class:!0});var _=N(e);m=U(_,r),_.forEach(C),u=S(l),d=g(l,"P",{class:!0});var w=N(d);a=U(w,n),w.forEach(C),l.forEach(C),this.h()},h(){h(e,"class","svelte-4q74qx"),h(d,"class","svelte-4q74qx"),h(t,"class","svelte-4q74qx")},m(v,l){V(v,t,l),s(t,e),s(e,m),s(t,u),s(t,d),s(d,a)},p(v,l){l&8&&r!==(r=v[18].name+"")&&J(m,r),l&8&&n!==(n=v[18].description+"")&&J(a,n)},d(v){v&&C(t)}}}function Se(o){let t,e=o[3].pantheon.description+"",r,m,u,d=te(o[3].pantheon.members),n=[];for(let a=0;a<d.length;a+=1)n[a]=ye(qe(o,d,a));return{c(){t=p("p"),r=B(e),m=E();for(let a=0;a<n.length;a+=1)n[a].c();u=me(),this.h()},l(a){t=g(a,"P",{class:!0});var v=N(t);r=U(v,e),v.forEach(C),m=S(a);for(let l=0;l<n.length;l+=1)n[l].l(a);u=me(),this.h()},h(){h(t,"class","svelte-4q74qx")},m(a,v){V(a,t,v),s(t,r),V(a,m,v);for(let l=0;l<n.length;l+=1)n[l]&&n[l].m(a,v);V(a,u,v)},p(a,v){if(v&8&&e!==(e=a[3].pantheon.description+"")&&J(r,e),v&8){d=te(a[3].pantheon.members);let l;for(l=0;l<d.length;l+=1){const _=qe(a,d,l);n[l]?n[l].p(_,v):(n[l]=ye(_),n[l].c(),n[l].m(u.parentNode,u))}for(;l<n.length;l+=1)n[l].d(1);n.length=d.length}},d(a){a&&(C(t),C(m),C(u)),ue(n,a)}}}function ye(o){let t,e,r=o[15].deity.name+"",m,u,d,n=o[15].deity.titles.join(",")+"",a,v,l,_,w="Holy Item:",k,G=o[15].deity.holyItem+"",x,c,b,f,I="Holy Symbol:",j,K=o[15].deity.holySymbol+"",R,M,D,Q=o[15].deity.description+"",L,W;return{c(){t=p("div"),e=p("h4"),m=B(r),u=E(),d=p("p"),a=B(n),v=E(),l=p("p"),_=p("strong"),_.textContent=w,k=E(),x=B(G),c=E(),b=p("p"),f=p("strong"),f.textContent=I,j=E(),R=B(K),M=E(),D=p("p"),L=B(Q),W=E(),this.h()},l(T){t=g(T,"DIV",{class:!0});var y=N(t);e=g(y,"H4",{class:!0});var z=N(e);m=U(z,r),z.forEach(C),u=S(y),d=g(y,"P",{class:!0});var le=N(d);a=U(le,n),le.forEach(C),v=S(y),l=g(y,"P",{class:!0});var Z=N(l);_=g(Z,"STRONG",{class:!0,"data-svelte-h":!0}),A(_)!=="svelte-1v11p99"&&(_.textContent=w),k=S(Z),x=U(Z,G),Z.forEach(C),c=S(y),b=g(y,"P",{class:!0});var X=N(b);f=g(X,"STRONG",{class:!0,"data-svelte-h":!0}),A(f)!=="svelte-i4u5qk"&&(f.textContent=I),j=S(X),R=U(X,K),X.forEach(C),M=S(y),D=g(y,"P",{class:!0});var F=N(D);L=U(F,Q),F.forEach(C),W=S(y),y.forEach(C),this.h()},h(){h(e,"class","svelte-4q74qx"),h(d,"class","svelte-4q74qx"),h(_,"class","svelte-4q74qx"),h(l,"class","svelte-4q74qx"),h(f,"class","svelte-4q74qx"),h(b,"class","svelte-4q74qx"),h(D,"class","svelte-4q74qx"),h(t,"class","svelte-4q74qx")},m(T,y){V(T,t,y),s(t,e),s(e,m),s(t,u),s(t,d),s(d,a),s(t,v),s(t,l),s(l,_),s(l,k),s(l,x),s(t,c),s(t,b),s(b,f),s(b,j),s(b,R),s(t,M),s(t,D),s(D,L),s(t,W)},p(T,y){y&8&&r!==(r=T[15].deity.name+"")&&J(m,r),y&8&&n!==(n=T[15].deity.titles.join(",")+"")&&J(a,n),y&8&&G!==(G=T[15].deity.holyItem+"")&&J(x,G),y&8&&K!==(K=T[15].deity.holySymbol+"")&&J(R,K),y&8&&Q!==(Q=T[15].deity.description+"")&&J(L,Q)},d(T){T&&C(t)}}}function Ae(o){let t,e,r,m="Fantasy Religion Generator",u,d,n="Generate a fictional fantasy religion.",a,v,l,_="Random Seed",w,k,G,x,c,b="Generate From Seed",f,I,j="Random Seed (and Generate)",K,R,M=o[3].name+"",D,Q,L,W=o[3].description+"",T,y,z,le="Realms",Z,X,F,ce="Deities",ae,ne,fe,Y=o[4].savedCultures!==void 0&&o[4].savedCultures.length>0&&Oe(o),ee=te(o[3].realms),P=[];for(let q=0;q<ee.length;q+=1)P[q]=Ee(Ce(o,ee,q));let H=o[3].pantheon&&Se(o);return{c(){t=E(),e=p("section"),r=p("h1"),r.textContent=m,u=E(),d=p("p"),d.textContent=n,a=E(),v=p("div"),l=p("label"),l.textContent=_,w=E(),k=p("input"),G=E(),Y&&Y.c(),x=E(),c=p("button"),c.textContent=b,f=E(),I=p("button"),I.textContent=j,K=E(),R=p("h2"),D=B(M),Q=E(),L=p("p"),T=B(W),y=E(),z=p("h3"),z.textContent=le,Z=E();for(let q=0;q<P.length;q+=1)P[q].c();X=E(),F=p("h3"),F.textContent=ce,ae=E(),H&&H.c(),this.h()},l(q){Te("svelte-3nkg7h",document.head).forEach(C),t=S(q),e=g(q,"SECTION",{class:!0});var i=N(e);r=g(i,"H1",{class:!0,"data-svelte-h":!0}),A(r)!=="svelte-dmd45w"&&(r.textContent=m),u=S(i),d=g(i,"P",{class:!0,"data-svelte-h":!0}),A(d)!=="svelte-1qegzps"&&(d.textContent=n),a=S(i),v=g(i,"DIV",{class:!0});var $=N(v);l=g($,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),A(l)!=="svelte-1akft3f"&&(l.textContent=_),w=S($),k=g($,"INPUT",{type:!0,name:!0,id:!0,class:!0}),$.forEach(C),G=S(i),Y&&Y.l(i),x=S(i),c=g(i,"BUTTON",{class:!0,"data-svelte-h":!0}),A(c)!=="svelte-1u7zbd5"&&(c.textContent=b),f=S(i),I=g(i,"BUTTON",{class:!0,"data-svelte-h":!0}),A(I)!=="svelte-192mxrq"&&(I.textContent=j),K=S(i),R=g(i,"H2",{class:!0});var he=N(R);D=U(he,M),he.forEach(C),Q=S(i),L=g(i,"P",{class:!0});var de=N(L);T=U(de,W),de.forEach(C),y=S(i),z=g(i,"H3",{class:!0,"data-svelte-h":!0}),A(z)!=="svelte-bfry80"&&(z.textContent=le),Z=S(i);for(let oe=0;oe<P.length;oe+=1)P[oe].l(i);X=S(i),F=g(i,"H3",{class:!0,"data-svelte-h":!0}),A(F)!=="svelte-18hxmnh"&&(F.textContent=ce),ae=S(i),H&&H.l(i),i.forEach(C),this.h()},h(){document.title="Religion Generator | Iron Arachne",h(r,"class","svelte-4q74qx"),h(d,"class","svelte-4q74qx"),h(l,"for","seed"),h(l,"class","svelte-4q74qx"),h(k,"type","text"),h(k,"name","seed"),h(k,"id","seed"),h(k,"class","svelte-4q74qx"),h(v,"class","input-group svelte-4q74qx"),h(c,"class","svelte-4q74qx"),h(I,"class","svelte-4q74qx"),h(R,"class","svelte-4q74qx"),h(L,"class","svelte-4q74qx"),h(z,"class","svelte-4q74qx"),h(F,"class","svelte-4q74qx"),h(e,"class","fantasy main svelte-4q74qx")},m(q,O){V(q,t,O),V(q,e,O),s(e,r),s(e,u),s(e,d),s(e,a),s(e,v),s(v,l),s(v,w),s(v,k),ie(k,o[2]),s(e,G),Y&&Y.m(e,null),s(e,x),s(e,c),s(e,f),s(e,I),s(e,K),s(e,R),s(R,D),s(e,Q),s(e,L),s(L,T),s(e,y),s(e,z),s(e,Z);for(let i=0;i<P.length;i+=1)P[i]&&P[i].m(e,null);s(e,X),s(e,F),s(e,ae),H&&H.m(e,null),ne||(fe=[se(k,"input",o[7]),se(c,"click",o[5]),se(I,"click",o[6])],ne=!0)},p(q,[O]){if(O&4&&k.value!==q[2]&&ie(k,q[2]),q[4].savedCultures!==void 0&&q[4].savedCultures.length>0&&Y.p(q,O),O&8&&M!==(M=q[3].name+"")&&J(D,M),O&8&&W!==(W=q[3].description+"")&&J(T,W),O&8){ee=te(q[3].realms);let i;for(i=0;i<ee.length;i+=1){const $=Ce(q,ee,i);P[i]?P[i].p($,O):(P[i]=Ee($),P[i].c(),P[i].m(e,X))}for(;i<P.length;i+=1)P[i].d(1);P.length=ee.length}q[3].pantheon?H?H.p(q,O):(H=Se(q),H.c(),H.m(e,null)):H&&(H.d(1),H=null)},i:re,o:re,d(q){q&&(C(t),C(e)),Y&&Y.d(),ue(P,q),H&&H.d(),ne=!1,ke(fe)}}}function Be(o,t,e){const r=Ne("user");let m=new Re,u,d=!1,n,a=_e(13);pe.use(ge(a));let v=new De,l=new Le(v),_=l.generate();function w(){if(pe.use(ge(a)),m.family===null)throw new Error("Name set does not have a family name generator.");if(m.female===null)throw new Error("Name set does not have a female name generator.");if(m.male===null)throw new Error("Name set does not have a male name generator.");l.config.nameGenerator=m.family,l.config.femaleNameGenerator=m.female,l.config.maleNameGenerator=m.male,d?(k(),n.generatorSet.family!==null&&(l.config.nameGenerator=n.generatorSet.family),n.generatorSet.female!==null&&(l.config.femaleNameGenerator=n.generatorSet.female),n.generatorSet.male!==null&&(l.config.maleNameGenerator=n.generatorSet.male)):(l.config.nameGenerator=m.family,l.config.femaleNameGenerator=m.female,l.config.maleNameGenerator=m.male),e(3,_=l.generate())}function k(){for(let f=0;f<r.savedCultures.length;f++)r.savedCultures[f].name===u&&(n=r.savedCultures[f])}function G(){e(2,a=_e(13)),w()}function x(){a=this.value,e(2,a)}function c(){d=this.checked,e(1,d)}function b(){u=He(this),e(0,u),e(4,r)}return[u,d,a,_,r,w,G,x,c,b]}class We extends Pe{constructor(t){super(),we(this,t,Be,Ae,Ge,{})}}export{We as component};
