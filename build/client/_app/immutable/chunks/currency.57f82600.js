import"./index.776ff577.js";function g(p,n,s,i=!0){let f=0,l=0,m=0,o=0,u=0,r=0;for(r+=p;r>0;)if(r>=1e3&&s)u++,r-=1e3;else if(r>=100)o++,r-=100;else if(r>=50&&n)m++,r-=50;else if(r>=10)l++,r-=10;else{f=r;break}let e="",t=new Intl.NumberFormat;return u>0&&(e+=t.format(u)+" pp ",!i)||o>0&&(e+=t.format(o)+" gp ",!i)||m>0&&(e+=t.format(m)+" ep ",!i)||l>0&&(e+=t.format(l)+" sp ",!i)||f>0&&(e+=t.format(f)+" cp "),e.trim()}export{g as v};
//# sourceMappingURL=currency.57f82600.js.map
