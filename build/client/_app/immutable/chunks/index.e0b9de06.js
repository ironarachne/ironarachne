var n={};Object.defineProperty(n,"__esModule",{value:!0});var u=n.romanize=n.removeEntry=n.pronoun=z=n.getOrdinal=I=n.title=g=n.uncapitalize=p=n.capitalize=h=n.arrayToPhrase=f=n.article=void 0;function c(e,t=!1){return["honor","honest","herb"].includes(e)?t?`an ${e}`:"an":["a","e","i","o","u"].includes(e.substring(0,1))?t?`an ${e}`:"an":t?`a ${e}`:"a"}var f=n.article=c;function o(e){if(e.length===1)return e[0];if(e.length===2)return e[0]+" and "+e[1];let t="";for(let i=0;i<e.length;i++)i===e.length-1?(e.length>2&&(t+=","),t+=" and "+e[i]):i===0?t=e[i]:t+=", "+e[i];return t}var h=n.arrayToPhrase=o;function s(e){return e[0].toUpperCase()+e.slice(1)}var p=n.capitalize=s;function v(e){return e[0].toLowerCase()+e.slice(1)}var g=n.uncapitalize=v;function X(e){let t=e.split(" "),i="";for(let r=0;r<t.length;r++)r!=0&&["of","the","a"].includes(t[r])?i+=t[r].toLowerCase()+" ":i+=s(t[r])+" ";return i=i.trimEnd(),i}var I=n.title=X;function C(e){if(e>3&&e<21)return"th";switch(e%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}var z=n.getOrdinal=C;function m(e,t){let i="";return e==="female"?t==="subjective"?i="she":(t==="possessive"||t==="objective")&&(i="her"):t==="subjective"?i="he":t==="possessive"?i="his":t==="objective"&&(i="him"),i}n.pronoun=m;function y(e,t){const i=[];for(let r=0;r<t.length;r++)t[r]!=e&&i.push(t[r]);return i}n.removeEntry=y;function _(e){if(isNaN(e))return NaN;const t=String(+e).split(""),i=["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"];let r="",a=3;for(;a--;)if(t.length>0){const l=t.pop();typeof l=="string"&&(r=(i[+l+a*10]||"")+r)}return Array(+t.join("")+1).join("M")+r}u=n.romanize=_;export{h as a,f as b,p as c,z as g,u as r,I as t,g as u};
