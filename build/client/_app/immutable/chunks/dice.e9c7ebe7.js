var p=Object.defineProperty;var g=(t,i,e)=>i in t?p(t,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[i]=e;var d=(t,i,e)=>(g(t,typeof i!="symbol"?i+"":i,e),e);import{r as w}from"./random.5c9619ef.js";import"./index.776ff577.js";class n{constructor(){d(this,"d4");d(this,"d6");d(this,"d8");d(this,"d10");d(this,"d12");d(this,"d20");d(this,"d100");d(this,"modifier");d(this,"modifierType");this.d4=0,this.d6=0,this.d8=0,this.d10=0,this.d12=0,this.d20=0,this.d100=0,this.modifier=0,this.modifierType="+"}getAverageResult(){let i=this.getMinResult()+this.getMaxResult();return i=Math.floor(i/2),i}getMaxResult(){let i=0;return i+=this.d4*4,i+=this.d6*6,i+=this.d8*8,i+=this.d10*10,i+=this.d12*12,i+=this.d20*20,i+=this.d100*100,this.modifierType=="*"?i*=this.modifier:this.modifierType=="+"?i+=this.modifier:i-=this.modifier,i}getMinResult(){let i=0;return i+=this.d4,i+=this.d6,i+=this.d8,i+=this.d10,i+=this.d12,i+=this.d20,i+=this.d100,this.modifierType=="*"?i*=this.modifier:this.modifierType=="+"?i+=this.modifier:i-=this.modifier,i}}function M(t){let i="";return t.d100>0&&(i!==""&&(i+="+"),i+=t.d100+"d100"),t.d20>0&&(i!==""&&(i+="+"),i+=t.d20+"d20"),t.d12>0&&(i!==""&&(i+="+"),i+=t.d12+"d12"),t.d10>0&&(i!==""&&(i+="+"),i+=t.d10+"d10"),t.d8>0&&(i!==""&&(i+="+"),i+=t.d8+"d8"),t.d6>0&&(i!==""&&(i+="+"),i+=t.d6+"d6"),t.d4>0&&(i!==""&&(i+="+"),i+=t.d4+"d4"),t.modifier>0&&(i!==""&&(i+="+"),i+=t.modifier),i}function N(t){let i=t;const e=new n;for(;i>=100&&i>0;)i-=100,e.d100++;for(;i>=20&&i>0;)i-=20,e.d20++;for(;i>=12&&i>0;)i-=12,e.d12++;for(;i>=10&&i>0;)i-=10,e.d10++;for(;i>=8&&i>0;)i-=8,e.d8++;for(;i>=6&&i>0;)i-=6,e.d6++;for(;i>=4&&i>0;)i-=4,e.d4++;return e.modifier=i,e}function R(t){let i=[],e="straight",r=[],u=!0,s=0;if(t.includes("+")?(i=t.split("+"),e="added"):t.includes("-")?(i=t.split("-"),e="subtracted"):t.includes("x")?(i=t.split("x"),e="multiplied"):u=!1,u){for(let f=1;f<i.length;f++){let h=i[f].split("d");if(h.length>1){let m=Number(h[0]),a=Number(h[1]);s+=o(m,a)}else s+=Number(i[f])}r=i[0].split("d")}else r=t.split("d");let l=o(Number(r[0]),Number(r[1]));return e=="added"?l+=s:e=="subtracted"?l-=s:e=="multiplied"&&(l*=s),l}function o(t,i){let e=0;for(let r=0;r<t;r++)e+=w.int(1,i);return e}function D(t){const i=new n;return t.d100>0?(i.d100=t.d100,i):t.d20>0?(i.d20=t.d20,i):t.d12>0?(i.d12=t.d12,i):t.d10>0?(i.d10=t.d10,i):t.d8>0?(i.d8=t.d8,i):t.d6>0?(i.d6=t.d6,i):t.d4>0?(i.d4=t.d4,i):(t.modifier>0&&(i.modifier=t.modifier),i)}export{N as a,M as d,R as r,D as s};
//# sourceMappingURL=dice.e9c7ebe7.js.map
