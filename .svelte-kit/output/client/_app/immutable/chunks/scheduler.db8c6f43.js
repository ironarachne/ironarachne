function x(){}function k(t,n){for(const e in n)t[e]=n[e];return t}function w(t){return t()}function M(){return Object.create(null)}function j(t){t.forEach(w)}function z(t){return typeof t=="function"}function F(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function P(t){return Object.keys(t).length===0}function E(t,...n){if(t==null){for(const o of n)o(void 0);return x}const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function S(t,n,e){t.$$.on_destroy.push(E(n,e))}function U(t,n,e,o){if(t){const r=y(t,n,e,o);return t[0](r)}}function y(t,n,e,o){return t[1]&&o?k(e.ctx.slice(),t[1](o(n))):e.ctx}function A(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(n.dirty===void 0)return r;if(typeof r=="object"){const a=[],d=Math.max(n.dirty.length,r.length);for(let s=0;s<d;s+=1)a[s]=n.dirty[s]|r[s];return a}return n.dirty|r}return n.dirty}function B(t,n,e,o,r,a){if(r){const d=y(n,e,o,a);t.p(d,r)}}function D(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let o=0;o<e;o++)n[o]=-1;return n}return-1}let i;function _(t){i=t}function f(){if(!i)throw new Error("Function called outside component initialization");return i}function G(t){f().$$.on_mount.push(t)}function H(t){f().$$.after_update.push(t)}function I(t,n){return f().$$.context.set(t,n),n}function J(t){return f().$$.context.get(t)}const l=[],g=[];let u=[];const b=[],m=Promise.resolve();let p=!1;function v(){p||(p=!0,m.then(q))}function K(){return v(),m}function O(t){u.push(t)}const h=new Set;let c=0;function q(){if(c!==0)return;const t=i;do{try{for(;c<l.length;){const n=l[c];c++,_(n),C(n.$$)}}catch(n){throw l.length=0,c=0,n}for(_(null),l.length=0,c=0;g.length;)g.pop()();for(let n=0;n<u.length;n+=1){const e=u[n];h.has(e)||(h.add(e),e())}u.length=0}while(l.length);for(;b.length;)b.pop()();p=!1,h.clear(),_(t)}function C(t){if(t.fragment!==null){t.update(),j(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(O)}}function L(t){const n=[],e=[];u.forEach(o=>t.indexOf(o)===-1?n.push(o):e.push(o)),e.forEach(o=>o()),u=n}export{H as a,g as b,U as c,A as d,I as e,S as f,D as g,O as h,J as i,M as j,q as k,z as l,P as m,x as n,G as o,L as p,i as q,j as r,F as s,K as t,B as u,_ as v,w,l as x,v as y};
//# sourceMappingURL=scheduler.db8c6f43.js.map
