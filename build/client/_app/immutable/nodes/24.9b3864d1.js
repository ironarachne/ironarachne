var rt=Object.defineProperty;var ot=(e,t,a)=>t in e?rt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var f=(e,t,a)=>(ot(e,typeof t!="symbol"?t+"":t,a),a);import{s as mt,n as Qe,r as pt,o as vt,j as Te}from"../chunks/scheduler.4deff733.js";import{S as ct,i as ut,s as y,g as m,z as ft,f as r,c as d,h as p,j as F,x as z,k as i,a as h,y as l,D as Xe,C as Ve,m as G,n as C,o as L,A as ht}from"../chunks/index.2fc1e45c.js";import{e as Ze}from"../chunks/each.e59479a4.js";import{i as Z,r as it,a as xe,b as yt}from"../chunks/index.a1591b4f.js";import{t as dt,b as gt,g as et}from"../chunks/index.bd2dd152.js";import{S as _t,a as St,r as tt}from"../chunks/generator.3bfe35f1.js";import{r as st}from"../chunks/generator.bc8d0f99.js";import{G as ce}from"../chunks/lodash.469a5080.js";class Ot extends ce{constructor(){super(),this.patterns=["pvn","pvnvn","pvnvv","slvnvn","lvfv","lvfvn","tvtv","pvtv+n","pvtv+","pv+c+v","tv+c+v","slv+c+vv","pvnvlv","pvnvlvnv","svnvlvnv","pv+llvlv","pvpvpv+n","slv+c+v+n","slvc+vn","slvc+vnv","slvpvpv","slvpv+pv"]}}class De{constructor(){f(this,"name");f(this,"minSystems");f(this,"maxSystems");f(this,"nameGenerator");this.name="",this.minSystems=0,this.maxSystems=1,this.nameGenerator={}}}class Gt{constructor(){f(this,"name");f(this,"adjective");f(this,"description");f(this,"government");f(this,"capitalSystem");f(this,"capitalPlanet");f(this,"systems");f(this,"primaryGoal");f(this,"technology");f(this,"military");f(this,"culture");f(this,"economy");this.systems=[]}}class Ct{constructor(t){f(this,"config");this.config=t}generate(){let t=new Gt;t.government=Z(this.config.governmentOptions);let a=this.config.nameGenerator.generate(1)[0];t.adjective=a+Z(["n","i","ish"]),t.name=`the ${t.government.nameGenerator.generate(1)[0]} ${a}`,t.description=`${dt(t.name)} is ${gt(t.government.name)} ${t.government.name}.`;let v=Math.max(this.config.minSystems,t.government.minSystems),N=Math.max(this.config.maxSystems,t.government.maxSystems),_=it.int(v,N),o=new St,g=new _t(o),b=0,u=0,P=[];for(let M=0;M<_;M++){let S=g.generate();for(let w=0;w<S.planets.length-1;w++)S.planets[w].is_inhabited&&(b+=S.planets[w].population,u++,P.push([M,w]));t.systems.push(S)}let H=Z(P);return t.capitalSystem=H[0],t.capitalPlanet=H[1],t.primaryGoal=Z(["conquest","to spread their beliefs","to share their knowledge","to always be learning","to always make a profit","to discover new worlds and new people","to bring order","to unite the universe","to unite the universe under their rule","to bring order to the universe","to ever be increasing their knowledge","to learn all the secrets of the universe"]),t.technology=Z(["highly advanced","advanced","comparable","relatively primitive"]),t.military=Z(["well-funded and large","poorly funded but large","poorly funded and small","aggressive","belligerent","cautious","orderly","well-disciplined"]),t.culture=Z(["fragmented","homogeneous","melting pot","controlled","decaying"]),t.economy=Z(["strong","thriving","collapsing","corrupt","growing","shrinking"]),t.description+=` Its capital is ${t.systems[t.capitalSystem].planets[t.capitalPlanet].name} in the ${t.systems[t.capitalSystem].name} system. There are ${t.systems.length} systems under its sway, with ${u} inhabited worlds and a total population of ${Et(b)}.`,t}}function Et(e){const t=new Intl.NumberFormat;return e<1e6?t.format(Math.floor(e/1e3))+" thousand":e<1e9?t.format(e/1e6)+" million":e<1e12?t.format(e/1e9)+" billion":t.format(e/1e12)+" trillion"}function kt(){return[Nt(),Rt(),It(),Pt()]}function Nt(){let e=new De;e.name="empire",e.minSystems=10,e.maxSystems=100;let t=new ce;return t.patterns=["EMPIRE OF","GRAND EMPIRE OF","STAR EMPIRE OF","STELLAR EMPIRE OF"],e.nameGenerator=t,e}function Rt(){let e=new De;e.name="monarchy",e.minSystems=1,e.maxSystems=30;let t=new ce;return t.patterns=["KINGDOM OF","GRAND KINGDOM OF","STAR KINGDOM OF","STELLAR KINGDOM OF","MONARCHY OF","GRAND MONARCHY OF","STAR MONARCHY OF","STELLAR MONARCHY OF"],e.nameGenerator=t,e}function It(){let e=new De;e.name="republic",e.minSystems=1,e.maxSystems=100;let t=new ce;return t.patterns=["REPUBLIC OF","STAR REPUBLIC OF","STELLAR REPUBLIC OF","UNITED REPUBLIC OF","UNITED FEDERATION OF","GRAND REPUBLIC OF"],e.nameGenerator=t,e}function Pt(){let e=new De;e.name="theocracy",e.minSystems=1,e.maxSystems=10;let t=new ce;return t.patterns=["HOLY EMPIRE OF","GRAND HOLY DOMINION OF","HOLY KINGDOM OF","HOLY MONARCHY OF","BLESSED DOMINION OF"],e.nameGenerator=t,e}class bt{constructor(){f(this,"minSystems");f(this,"maxSystems");f(this,"governmentOptions");f(this,"nameGenerator");this.minSystems=-1,this.maxSystems=-1,this.governmentOptions=kt(),this.nameGenerator=new Ot}}function at(e,t,a){const v=e.slice();return v[7]=t[a],v}function lt(e){let t,a=e[0].name+"",v,N,_,o=e[0].description+"",g,b,u,P,H=e[0].primaryGoal+"",M,S,w,E,$,se="Culture:",A,W=e[0].culture+"",J,Q,D,c,I="Economy:",U,k=e[0].economy+"",j,ue,K,x,ze="Military:",Le,ne=e[0].military+"",fe,he,q,ee,We="Technology:",He,ie=e[0].technology+"",ye,de,V,$e,re=e[0].systems[e[0].capitalSystem].name+"",ge,Ue,_e,T,oe=e[0].systems[e[0].capitalSystem].planets[e[0].capitalPlanet].name+"",Se,Be,me=e[0].capitalPlanet+1+"",Oe,pe=et(e[0].capitalPlanet+1)+"",Ge,Ye,ve=e[0].systems[e[0].capitalSystem].planets[e[0].capitalPlanet].populationFriendly+"",Ce,je,Ee,B,ae,Y,ke,Ne,Ke,le=Ze(e[0].systems[e[0].capitalSystem].planets),R=[];for(let s=0;s<le.length;s+=1)R[s]=nt(at(e,le,s));return{c(){t=m("h2"),v=G(a),N=y(),_=m("p"),g=G(o),b=y(),u=m("p"),P=G("Their primary goal is "),M=G(H),S=G("."),w=y(),E=m("p"),$=m("strong"),$.textContent=se,A=y(),J=G(W),Q=y(),D=m("p"),c=m("strong"),c.textContent=I,U=y(),j=G(k),ue=y(),K=m("p"),x=m("strong"),x.textContent=ze,Le=y(),fe=G(ne),he=y(),q=m("p"),ee=m("strong"),ee.textContent=We,He=y(),ye=G(ie),de=y(),V=m("h3"),$e=G("The "),ge=G(re),Ue=G(" System"),_e=y(),T=m("p"),Se=G(oe),Be=G(" is the "),Oe=G(me),Ge=G(pe),Ye=G(" planet in this system. It has a population of "),Ce=G(ve),je=G("."),Ee=y(),B=m("div"),ae=m("div"),Y=m("img"),Ke=y();for(let s=0;s<R.length;s+=1)R[s].c();this.h()},l(s){t=p(s,"H2",{class:!0});var n=F(t);v=C(n,a),n.forEach(r),N=d(s),_=p(s,"P",{class:!0});var O=F(_);g=C(O,o),O.forEach(r),b=d(s),u=p(s,"P",{class:!0});var te=F(u);P=C(te,"Their primary goal is "),M=C(te,H),S=C(te,"."),te.forEach(r),w=d(s),E=p(s,"P",{class:!0});var Re=F(E);$=p(Re,"STRONG",{class:!0,"data-svelte-h":!0}),z($)!=="svelte-ywc3a4"&&($.textContent=se),A=d(Re),J=C(Re,W),Re.forEach(r),Q=d(s),D=p(s,"P",{class:!0});var Ie=F(D);c=p(Ie,"STRONG",{class:!0,"data-svelte-h":!0}),z(c)!=="svelte-ugjvva"&&(c.textContent=I),U=d(Ie),j=C(Ie,k),Ie.forEach(r),ue=d(s),K=p(s,"P",{class:!0});var Pe=F(K);x=p(Pe,"STRONG",{class:!0,"data-svelte-h":!0}),z(x)!=="svelte-kz1usf"&&(x.textContent=ze),Le=d(Pe),fe=C(Pe,ne),Pe.forEach(r),he=d(s),q=p(s,"P",{class:!0});var be=F(q);ee=p(be,"STRONG",{class:!0,"data-svelte-h":!0}),z(ee)!=="svelte-1xfuo96"&&(ee.textContent=We),He=d(be),ye=C(be,ie),be.forEach(r),de=d(s),V=p(s,"H3",{class:!0});var we=F(V);$e=C(we,"The "),ge=C(we,re),Ue=C(we," System"),we.forEach(r),_e=d(s),T=p(s,"P",{class:!0});var X=F(T);Se=C(X,oe),Be=C(X," is the "),Oe=C(X,me),Ge=C(X,pe),Ye=C(X," planet in this system. It has a population of "),Ce=C(X,ve),je=C(X,"."),X.forEach(r),Ee=d(s),B=p(s,"DIV",{class:!0});var Fe=F(B);ae=p(Fe,"DIV",{class:!0});var Je=F(ae);Y=p(Je,"IMG",{alt:!0,src:!0,class:!0}),Je.forEach(r),Ke=d(Fe);for(let qe=0;qe<R.length;qe+=1)R[qe].l(Fe);Fe.forEach(r),this.h()},h(){i(t,"class","svelte-10k9tp6"),i(_,"class","svelte-10k9tp6"),i(u,"class","svelte-10k9tp6"),i($,"class","svelte-10k9tp6"),i(E,"class","svelte-10k9tp6"),i(c,"class","svelte-10k9tp6"),i(D,"class","svelte-10k9tp6"),i(x,"class","svelte-10k9tp6"),i(K,"class","svelte-10k9tp6"),i(ee,"class","svelte-10k9tp6"),i(q,"class","svelte-10k9tp6"),i(V,"class","svelte-10k9tp6"),i(T,"class","svelte-10k9tp6"),i(Y,"alt",ke=e[0].systems[e[0].capitalSystem].stars[0].name+" image"),Te(Y.src,Ne=tt(e[0].systems[e[0].capitalSystem].stars[0],Me,Ae))||i(Y,"src",Ne),i(Y,"class","svelte-10k9tp6"),i(ae,"class","image-container svelte-10k9tp6"),i(B,"class","star-system svelte-10k9tp6")},m(s,n){h(s,t,n),l(t,v),h(s,N,n),h(s,_,n),l(_,g),h(s,b,n),h(s,u,n),l(u,P),l(u,M),l(u,S),h(s,w,n),h(s,E,n),l(E,$),l(E,A),l(E,J),h(s,Q,n),h(s,D,n),l(D,c),l(D,U),l(D,j),h(s,ue,n),h(s,K,n),l(K,x),l(K,Le),l(K,fe),h(s,he,n),h(s,q,n),l(q,ee),l(q,He),l(q,ye),h(s,de,n),h(s,V,n),l(V,$e),l(V,ge),l(V,Ue),h(s,_e,n),h(s,T,n),l(T,Se),l(T,Be),l(T,Oe),l(T,Ge),l(T,Ye),l(T,Ce),l(T,je),h(s,Ee,n),h(s,B,n),l(B,ae),l(ae,Y),l(B,Ke);for(let O=0;O<R.length;O+=1)R[O]&&R[O].m(B,null)},p(s,n){if(n&1&&a!==(a=s[0].name+"")&&L(v,a),n&1&&o!==(o=s[0].description+"")&&L(g,o),n&1&&H!==(H=s[0].primaryGoal+"")&&L(M,H),n&1&&W!==(W=s[0].culture+"")&&L(J,W),n&1&&k!==(k=s[0].economy+"")&&L(j,k),n&1&&ne!==(ne=s[0].military+"")&&L(fe,ne),n&1&&ie!==(ie=s[0].technology+"")&&L(ye,ie),n&1&&re!==(re=s[0].systems[s[0].capitalSystem].name+"")&&L(ge,re),n&1&&oe!==(oe=s[0].systems[s[0].capitalSystem].planets[s[0].capitalPlanet].name+"")&&L(Se,oe),n&1&&me!==(me=s[0].capitalPlanet+1+"")&&L(Oe,me),n&1&&pe!==(pe=et(s[0].capitalPlanet+1)+"")&&L(Ge,pe),n&1&&ve!==(ve=s[0].systems[s[0].capitalSystem].planets[s[0].capitalPlanet].populationFriendly+"")&&L(Ce,ve),n&1&&ke!==(ke=s[0].systems[s[0].capitalSystem].stars[0].name+" image")&&i(Y,"alt",ke),n&1&&!Te(Y.src,Ne=tt(s[0].systems[s[0].capitalSystem].stars[0],Me,Ae))&&i(Y,"src",Ne),n&1){le=Ze(s[0].systems[s[0].capitalSystem].planets);let O;for(O=0;O<le.length;O+=1){const te=at(s,le,O);R[O]?R[O].p(te,n):(R[O]=nt(te),R[O].c(),R[O].m(B,null))}for(;O<R.length;O+=1)R[O].d(1);R.length=le.length}},d(s){s&&(r(t),r(N),r(_),r(b),r(u),r(w),r(E),r(Q),r(D),r(ue),r(K),r(he),r(q),r(de),r(V),r(_e),r(T),r(Ee),r(B)),ht(R,s)}}}function nt(e){let t,a,v,N,_;return{c(){t=m("div"),a=m("img"),_=y(),this.h()},l(o){t=p(o,"DIV",{class:!0});var g=F(t);a=p(g,"IMG",{alt:!0,src:!0,class:!0}),_=d(g),g.forEach(r),this.h()},h(){i(a,"alt",v=e[7].name+" image"),Te(a.src,N=st(e[7],Me,Ae))||i(a,"src",N),i(a,"class","svelte-10k9tp6"),i(t,"class","image-container svelte-10k9tp6")},m(o,g){h(o,t,g),l(t,a),l(t,_)},p(o,g){g&1&&v!==(v=o[7].name+" image")&&i(a,"alt",v),g&1&&!Te(a.src,N=st(o[7],Me,Ae))&&i(a,"src",N)},d(o){o&&r(t)}}}function wt(e){let t,a,v,N="Star Nation Generator",_,o,g="Generate a star nation.",b,u,P,H="Random Seed",M,S,w,E,$="Generate From Seed",se,A,W="Random Seed (and Generate)",J,Q,D,c=e[0]&&lt(e);return{c(){t=y(),a=m("section"),v=m("h1"),v.textContent=N,_=y(),o=m("p"),o.textContent=g,b=y(),u=m("div"),P=m("label"),P.textContent=H,M=y(),S=m("input"),w=y(),E=m("button"),E.textContent=$,se=y(),A=m("button"),A.textContent=W,J=y(),c&&c.c(),this.h()},l(I){ft("svelte-1s6fia1",document.head).forEach(r),t=d(I),a=p(I,"SECTION",{class:!0});var k=F(a);v=p(k,"H1",{class:!0,"data-svelte-h":!0}),z(v)!=="svelte-1d0dl3g"&&(v.textContent=N),_=d(k),o=p(k,"P",{class:!0,"data-svelte-h":!0}),z(o)!=="svelte-1x31don"&&(o.textContent=g),b=d(k),u=p(k,"DIV",{class:!0});var j=F(u);P=p(j,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),z(P)!=="svelte-1akft3f"&&(P.textContent=H),M=d(j),S=p(j,"INPUT",{type:!0,name:!0,id:!0,class:!0}),j.forEach(r),w=d(k),E=p(k,"BUTTON",{class:!0,"data-svelte-h":!0}),z(E)!=="svelte-1u7zbd5"&&(E.textContent=$),se=d(k),A=p(k,"BUTTON",{class:!0,"data-svelte-h":!0}),z(A)!=="svelte-192mxrq"&&(A.textContent=W),J=d(k),c&&c.l(k),k.forEach(r),this.h()},h(){document.title="Star Nation Generator | Iron Arachne",i(v,"class","svelte-10k9tp6"),i(o,"class","svelte-10k9tp6"),i(P,"for","seed"),i(P,"class","svelte-10k9tp6"),i(S,"type","text"),i(S,"name","seed"),i(S,"id","seed"),i(S,"class","svelte-10k9tp6"),i(u,"class","input-group svelte-10k9tp6"),i(E,"class","svelte-10k9tp6"),i(A,"class","svelte-10k9tp6"),i(a,"class","scifi main svelte-10k9tp6")},m(I,U){h(I,t,U),h(I,a,U),l(a,v),l(a,_),l(a,o),l(a,b),l(a,u),l(u,P),l(u,M),l(u,S),Xe(S,e[1]),l(a,w),l(a,E),l(a,se),l(a,A),l(a,J),c&&c.m(a,null),Q||(D=[Ve(S,"input",e[4]),Ve(E,"click",e[2]),Ve(A,"click",e[3])],Q=!0)},p(I,[U]){U&2&&S.value!==I[1]&&Xe(S,I[1]),I[0]?c?c.p(I,U):(c=lt(I),c.c(),c.m(a,null)):c&&(c.d(1),c=null)},i:Qe,o:Qe,d(I){I&&(r(t),r(a)),c&&c.d(),Q=!1,pt(D)}}}const Me=64,Ae=64;function Ft(e,t,a){let v,N,_,o=xe(13);function g(){it.use(yt(o)),a(0,_=N.generate())}function b(){a(1,o=xe(13)),g()}vt(()=>{v=new bt,N=new Ct(v),b()});function u(){o=this.value,a(1,o)}return[_,o,g,b,u]}class Yt extends ct{constructor(t){super(),ut(this,t,Ft,wt,mt,{})}}export{Yt as component};
//# sourceMappingURL=24.9b3864d1.js.map
