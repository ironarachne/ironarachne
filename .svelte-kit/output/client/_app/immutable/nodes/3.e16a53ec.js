var re=Object.defineProperty;var ae=(s,t,e)=>t in s?re(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var c=(s,t,e)=>(ae(s,typeof t!="symbol"?t+"":t,e),e);import{s as oe,n as V}from"../chunks/scheduler.db8c6f43.js";import{S as ne,i as ie,s as E,g as _,m as N,z as ce,f as w,c as $,h as T,j as G,x as q,n as B,k,a as D,y as p,C as le,o as F,A as he}from"../chunks/index.00caca3d.js";import{e as J}from"../chunks/each.e59479a4.js";import{g as fe}from"../chunks/lodash.46f0247c.js";import{a as K}from"../chunks/index.a9e36f3b.js";import{i as v,r as O,s as te,a as Q,b as X}from"../chunks/index.ca3c12b8.js";import{g as de}from"../chunks/model_numbers.e525655d.js";class se{constructor(){c(this,"weaponTypes");this.weaponTypes=[]}}class ue{constructor(){c(this,"name");c(this,"maker");c(this,"damage");c(this,"effects");c(this,"cosmetics");c(this,"description");this.name="",this.maker="",this.damage="",this.effects=[],this.cosmetics=[],this.description=""}}class pe{constructor(){c(this,"config");this.config=new se}generate(){let t=new ue,e=v(this.config.weaponTypes);return t.damage=e.damageType,t.effects=be(e),t.cosmetics=ge(e),t.name=de()+" "+e.name,t.description=me(t,e),t}}function me(s,t){let e=v(t.bases)+" has ";return e+=K(s.effects)+" and ",e+=K(s.cosmetics)+". It ",e+=s.effects+".",e}function ge(s){let t=[];const e=O.int(1,3);let r=[];for(const i of s.cosmetics)r.push(i.name);r=te(r);for(let i=0;i<e;i++){let h=r.pop(),o;for(const n of s.cosmetics)n.name===h&&(o=n);o!==void 0&&t.push(v(o.options))}return t}function be(s){let t=[];const e=O.int(1,3);let r=[];for(const i of s.effects)r.push(i.name);r=te(r);for(let i=0;i<e;i++){let h=r.pop(),o;for(const n of s.effects)n.name===h&&(o=n);o!==void 0&&t.push(v(o.options))}return t}class ye{constructor(){c(this,"name");c(this,"options");this.name="",this.options=[]}}class ve{constructor(){c(this,"name");c(this,"options");this.name="",this.options=[]}}class xe{constructor(){c(this,"name");c(this,"bases");c(this,"cosmetics");c(this,"effects");c(this,"range");c(this,"hands");c(this,"damageType");this.name="",this.bases=[],this.cosmetics=[],this.effects=[],this.range="",this.hands=0,this.damageType=""}}function m(s,t){let e=new ve;return e.name=s,e.options=t,e}function b(s,t){let e=new ye;return e.name=s,e.options=t,e}function M(s,t,e,r,i,h,o){let n=new xe;return n.name=s,n.bases=t,n.cosmetics=e,n.effects=r,n.range=i,n.hands=h,n.damageType=o,n}const Y=[M("energy rifle",["This rifle","This energy rifle","This blaster rifle","This energy carbine","This carbine"],[b("barrel",["an extended barrel","a short barrel","a grooved barrel"]),b("scope",["advanced sighting","a long scope","a short scope"]),b("stock",["a short stock","a clever stock","a comfortable stock","an extended stock"]),b("trigger",["a hair trigger","a double trigger","a comfortable trigger"])],[m("energy bolt",["fires green bolts","fires blue bolts","fires red bolts","fires yellow bolts","fires purple bolts"]),m("sound",["sounds like a buzzsaw","has a high-pitched whine","emits a rumbling sound"]),m("recoil",["kicks hard","has no recoil","has a slight recoil"]),m("accuracy",["has poor accuracy","has excellent accuracy","uses onboard AI to enhance accuracy","has excellent accuracy"])],"long",2,"energy"),M("energy pistol",["This pistol","This energy pistol","This blaster pistol"],[b("barrel",["an extended barrel","a short barrel","a grooved barrel"]),b("trigger",["a hair trigger","a double trigger","a comfortable trigger"]),b("grip",["a comfortable grip","a synthetic hide grip","a biometric grip"])],[m("energy bolt",["fires green bolts","fires blue bolts","fires red bolts","fires yellow bolts","fires purple bolts"]),m("sound",["is very quiet","has a high-pitched firing sound","emits a low sound when it fires"]),m("recoil",["kicks hard","has no recoil","has a slight recoil"]),m("accuracy",["has poor accuracy","has excellent accuracy","has good accuracy"])],"short",1,"energy"),M("pistol",["This pistol","This revolver","This sidearm"],[b("barrel",["an extended barrel","a short barrel","a grooved barrel"]),b("trigger",["a hair trigger","a comfortable trigger","a sensitive trigger"]),b("grip",["a comfortable grip","a synthetic hide grip","a biometric grip"])],[m("ammunition",["fires light rounds","fires heavy rounds","fires armor-piercing rounds","fires incendiary rounds"]),m("sound",["is very quiet","has a reverberating firing sound","is loud when it fires"]),m("recoil",["kicks hard","has no recoil","has a slight recoil"]),m("accuracy",["has poor accuracy","has excellent accuracy","has good accuracy"])],"short",1,"projectile"),M("rifle",["This rifle","This assault rifle","This sniper rifle","This assault carbine","This carbine"],[b("barrel",["an extended barrel","a short barrel","a grooved barrel"]),b("scope",["advanced sighting","a long scope","a nightvision scope","a short scope"]),b("stock",["a short stock","a clever stock","a comfortable stock","an extended stock","a collapsible stock"]),b("trigger",["a hair trigger","a double trigger","a comfortable trigger"])],[m("ammunition",["fires light rounds","fires heavy rounds","fires armor-piercing rounds","fires anti-vehicular rounds","fires incendiary rounds","fires high explosive rounds"]),m("sound",["sounds like a cannon","has a high-pitched firing sound","echoes when it fires"]),m("recoil",["kicks hard","has no recoil","has a slight recoil"]),m("accuracy",["has poor accuracy","has excellent accuracy","uses onboard AI to enhance accuracy","has excellent accuracy"])],"long",2,"projectile")];class _e{constructor(t,e,r){c(this,"name");c(this,"description");c(this,"models");this.name=t,this.description=e,this.models=r}}class Te{generate(){return ke()}}function ke(){const s=Ee();let t=`${s} `;const e=v(Y);let r=Y.filter(f=>f.name!==e.name);const i=v(r);t+=v([` specializes in ${e.name}s. `,` is known for their ${e.name}s. `]),t+=we(),t+=Ce();let h=[];const o=O.int(3,4);let n=new pe,y=new se;y.weaponTypes=[e],n.config=y;for(let f=0;f<o;f++){let d=n.generate();h.push(d)}y.weaponTypes=[i],n.config=y;const g=O.int(0,2);for(let f=0;f<g;f++){let d=n.generate();h.push(d)}return new _e(s,t,h)}function we(){return v([" They focus exclusively on quality, and their products are very expensive."," They focus heavily on reliability."," They are devoted to profit above all else and their products are lower in quality."," They pride themselves on their workmanship."])}function Ce(){return v([" Their products are widely regarded as the standard to beat."," Their products have a following among bounty hunters and mercenaries."," Their products are well-regarded by military powers."," They sometimes suffer derision because of their attitude."," Their market presence is almost nonexistent."," Some black markets focus exclusively on their products."])}function Ee(){let t=fe(["pvlul","vpvfv"]),r=v(["Heavy Industries","Arms, Limited","Incorporated","Consolidated","Corporation","Applied Sciences"]);return`${t} ${r}`}function Z(s,t,e){const r=s.slice();return r[4]=t[e],r}function ee(s){let t,e,r=s[4].name+"",i,h,o,n=s[4].description+"",y,g;return{c(){t=_("div"),e=_("h3"),i=N(r),h=E(),o=_("p"),y=N(n),g=E(),this.h()},l(f){t=T(f,"DIV",{class:!0});var d=G(t);e=T(d,"H3",{class:!0});var x=G(e);i=B(x,r),x.forEach(w),h=$(d),o=T(d,"P",{class:!0});var C=G(o);y=B(C,n),C.forEach(w),g=$(d),d.forEach(w),this.h()},h(){k(e,"class","svelte-1cxb4fd"),k(o,"class","svelte-1cxb4fd"),k(t,"class","svelte-1cxb4fd")},m(f,d){D(f,t,d),p(t,e),p(e,i),p(t,h),p(t,o),p(o,y),p(t,g)},p(f,d){d&1&&r!==(r=f[4].name+"")&&F(i,r),d&1&&n!==(n=f[4].description+"")&&F(y,n)},d(f){f&&w(t)}}}function $e(s){let t,e,r,i="Arms Manufacturer Generator",h,o,n="This generator produces sci-fi arms manufacturing companies.",y,g,f="Generate",d,x,C=s[0].description+"",P,z,A,R="Models",H,j,U,I=J(s[0].models),u=[];for(let l=0;l<I.length;l+=1)u[l]=ee(Z(s,I,l));return{c(){t=E(),e=_("section"),r=_("h1"),r.textContent=i,h=E(),o=_("p"),o.textContent=n,y=E(),g=_("button"),g.textContent=f,d=E(),x=_("p"),P=N(C),z=E(),A=_("h2"),A.textContent=R,H=E();for(let l=0;l<u.length;l+=1)u[l].c();this.h()},l(l){ce("svelte-1ecg6n2",document.head).forEach(w),t=$(l),e=T(l,"SECTION",{class:!0});var a=G(e);r=T(a,"H1",{class:!0,"data-svelte-h":!0}),q(r)!=="svelte-1wwbb1h"&&(r.textContent=i),h=$(a),o=T(a,"P",{class:!0,"data-svelte-h":!0}),q(o)!=="svelte-1idwd1x"&&(o.textContent=n),y=$(a),g=T(a,"BUTTON",{class:!0,"data-svelte-h":!0}),q(g)!=="svelte-41x9ys"&&(g.textContent=f),d=$(a),x=T(a,"P",{class:!0});var S=G(x);P=B(S,C),S.forEach(w),z=$(a),A=T(a,"H2",{class:!0,"data-svelte-h":!0}),q(A)!=="svelte-s6b5fg"&&(A.textContent=R),H=$(a);for(let L=0;L<u.length;L+=1)u[L].l(a);a.forEach(w),this.h()},h(){document.title="Arms Manufacturer Generator | Iron Arachne",k(r,"class","svelte-1cxb4fd"),k(o,"class","svelte-1cxb4fd"),k(g,"class","svelte-1cxb4fd"),k(x,"class","svelte-1cxb4fd"),k(A,"class","svelte-1cxb4fd"),k(e,"class","scifi main svelte-1cxb4fd")},m(l,W){D(l,t,W),D(l,e,W),p(e,r),p(e,h),p(e,o),p(e,y),p(e,g),p(e,d),p(e,x),p(x,P),p(e,z),p(e,A),p(e,H);for(let a=0;a<u.length;a+=1)u[a]&&u[a].m(e,null);j||(U=le(g,"click",s[1]),j=!0)},p(l,[W]){if(W&1&&C!==(C=l[0].description+"")&&F(P,C),W&1){I=J(l[0].models);let a;for(a=0;a<I.length;a+=1){const S=Z(l,I,a);u[a]?u[a].p(S,W):(u[a]=ee(S),u[a].c(),u[a].m(e,null))}for(;a<u.length;a+=1)u[a].d(1);u.length=I.length}},i:V,o:V,d(l){l&&(w(t),w(e)),he(u,l),j=!1,U()}}}function Ae(s,t,e){let r=Q(13);O.use(X(r));let i=new Te,h=i.generate();function o(){r=Q(13),O.use(X(r)),e(0,h=i.generate())}return[h,o]}class ze extends ne{constructor(t){super(),ie(this,t,Ae,$e,oe,{})}}export{ze as component};
//# sourceMappingURL=3.e16a53ec.js.map
