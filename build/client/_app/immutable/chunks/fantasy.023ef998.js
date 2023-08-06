var S=Object.defineProperty;var N=(r,n,e)=>n in r?S(r,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[n]=e;var i=(r,n,e)=>(N(r,typeof n!="symbol"?n+"":n,e),e);import{i as s}from"./index.d6e945a3.js";import{r as g}from"./random.7fb76a35.js";import{C as u,F as v}from"./fantasy.7019879b.js";import{g as p}from"./premadeconfigs.5202e86f.js";import{c as y,i as T,d as w}from"./svg.e229a4ca.js";import"./index.e0b9de06.js";class m{constructor(n,e,o,a,t,c,l){i(this,"femaleTitle");i(this,"maleTitle");i(this,"femaleHonorific");i(this,"maleHonorific");i(this,"hasLands");i(this,"landName");i(this,"precedence");this.femaleTitle=n,this.maleTitle=e,this.femaleHonorific=o,this.maleHonorific=a,this.hasLands=t,this.landName=c,this.precedence=l}getTitle(n){return n==="female"?this.femaleTitle:this.maleTitle}getHonorific(n){return n==="female"?this.femaleHonorific:this.maleHonorific}hasHigherPrecedenceThan(n){return this.precedence>n}hasLowerPrecedenceThan(n){return this.precedence<n}}class d{constructor(n,e,o){i(this,"title");i(this,"inferiors");i(this,"superior");i(this,"classification");i(this,"ageGroupName");this.title=n,this.inferiors=[],this.superior=null,this.classification=e,this.ageGroupName=o}addInferior(n){this.inferiors.push(n)}}class C{constructor(n,e,o,a,t,c,l,h,f){i(this,"name");i(this,"minSize");i(this,"maxSize");i(this,"leaderTitle");i(this,"randomName");i(this,"randomDescription");i(this,"randomLeadership");i(this,"getRanks");i(this,"heraldryConfig");this.name=n,this.minSize=e,this.maxSize=o,this.leaderTitle=a,this.randomName=t,this.randomDescription=c,this.randomLeadership=l,this.getRanks=h,this.heraldryConfig=f}}function G(){let r=new y;return r.chargeCount=s([0,1]),r.chargeOptions=T(["weapon","armor","aggressive"],w()),new C("mercenary company",20,80,"captain",function(){const e=s(["Black","Blood","Burning","Crimson","Free","Gilded","Golden","Iron","Red","Silver","White"]),o=s(["Axes","Army","Bears","Blades","Coins","Company","Dragons","Giants","Lords","Pikes","Sentinels","Swords","Wolves","Wyverns"]);return"The "+e+" "+o},function(){return s(["{name} is a vicious mercenary company with a reputation for excessive violence.","{name} is a merc company that prides itself on its professionalism and integrity.","{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though."])},function(){let e=p();e.ageCategories=["adult"];const a=new u(e).generate(),t=this.getRanks();return a.titles.push(t.title),a},function(){const e=new d(new m("Captain","Captain","Captain","Captain",!1,"",0),"military","adult"),o=new d(new m("Lieutenant","Lieutenant","Lieutenant","Lieutenant",!1,"",1),"military","adult"),a=new d(new m("Sergeant","Sergeant","Sergeant","Sergeant",!1,"",2),"military","adult"),t=new d(new m("Mercenary","Mercenary","","",!1,"",3),"military","adult");return a.addInferior(t),o.addInferior(a),e.addInferior(o),e},r)}function x(){let r=new y;return r.chargeCount=s([0,1]),r.chargeOptions=T(["coin","money","trade"],w()),new C("trading company",30,200,"proprietor",function(){return s([{name:"generic",randomName:function(){const t=s(["Dynasty","Gilded","Luxury"]),c=s(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return t+" "+c}},{name:"geographic",randomName:function(){const a=s(["North","West","South","East"]),t=s(["Wind","Sea","Mountain","Ocean"]),c=s(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return a+" "+t+" "+c}},{name:"family",randomName:function(){const a=new v;if(a.family===null)throw new Error("Family name generator not found.");const t=a.family.generate(100),c=s(t),l=s([" Brothers"," & Sons"," & Son"," Family",""]),h=s(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return c+" "+l+" "+h}}]).randomName()},function(){return s(["The {name} is noted for the quality of their goods.","The {name} has a reputation for always delivering goods to their intended destination.","The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.","The {name} often openly uses bullying and strong-arming in their dealings.","The {name} deals in a wide variety of goods."])},function(){let e=p();e.ageCategories=["adult"];const a=new u(e).generate(),t=this.getRanks();return a.titles.push(t.title),a},function(){const e=new d(new m("Proprietor","Proprietor","","",!1,"",0),"commercial","adult"),o=new d(new m("Manager","Manager","","",!1,"",1),"commercial","adult"),a=new d(new m("Employee","Employee","","",!1,"",2),"commercial","adult");return o.addInferior(a),e.addInferior(o),e},r)}function z(){let r=new y;return r.chargeCount=s([0,1]),r.chargeOptions=T(["book","magic","monster"],w()),new C("wizard school",100,600,"headmaster",function(){const e=s(["School","Academy","College"]),a=s([{generate:function(){return s(["Witchcraft","Wizardry","Sorcery","Mysticism"])}},{generate:function(){const t=["Arcane","Mystical","Eldritch","Occult"],c=["Arts","Sciences","Paths","Ways","Secrets"];return s(t)+" "+s(c)}}]);return"The "+e+" of "+a.generate()},function(){return s(["{name} is a hidden wizard school that avoids contact with the outside world.","{name} is a proud institution whose students primarily come from the nobility.","{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.","{name} is an egalitarian wizard school that accepts new students from every walk of life."])},function(){let e=p();e.ageCategories=["elderly"];const a=new u(e).generate(),t=this.getRanks();return a.titles.push(t.title),a},function(){const e=new d(new m("Headmaster","Headmaster","Headmaster","Headmaster",!1,"",0),"arcane","elderly"),o=new d(new m("Professor","Professor","Professor","Professor",!1,"",1),"arcane","adult"),a=new d(new m("Student","Student","","",!1,"",2),"arcane","young adult");return o.addInferior(a),e.addInferior(o),e},r)}class H{constructor(n,e,o,a,t,c){i(this,"name");i(this,"organizationType");i(this,"description");i(this,"memberCount");i(this,"leadership");i(this,"notableMembers");i(this,"ranks");i(this,"heraldry");this.name=n,this.organizationType=e,this.description=o,this.memberCount=a,this.leadership=t,this.notableMembers=[],this.ranks=c}getRanksOfTier(n){const e=[],o=this.ranks;if(n===0)return[o];let a=o.inferiors;for(let t=0;t<n;t++){let c=[];for(let l=0;l<a.length;l++)a[l].title.precedence===n&&e.push(a[l]),c=c.concat(a[l].inferiors);a=c}return e}}function j(){const r=I(),n=g.int(r.minSize,r.maxSize),e=new H(r.randomName(),r,r.randomDescription(),n,r.randomLeadership(),r.getRanks());return e.description=e.description.replace("{name}",e.name),e.description+=" It has "+e.memberCount+" members. ",e.description+=M(),e.notableMembers=R(e),e.leadership.description="They are led by "+e.leadership.getHonorific()+" "+e.leadership.firstName+" "+e.leadership.lastName+". "+e.leadership.description,e}function R(r){let n=1,e=r.ranks;const o=[];let a=e.inferiors.length;for(;a>0;)n++,e=e.inferiors[0],a=e.inferiors.length;if(n<=1)return[];for(let t=0;t<n;t++){const c=r.getRanksOfTier(t);let l=1;if(t==1?l=g.int(2,4):t==2&&(l=g.int(1,3)),t>0)for(let h=0;h<l;h++){let f=s(c),b=p();b.ageCategories=[f.ageGroupName];let k=new u(b).generate();k.titles.push(f.title),o.push(k)}}return o}function M(){return s(["They enjoy a surprising amount of local popularity.","They are not terribly popular locally.","They're disliked by the local population.","They're fairly popular locally but relatively unknown in the wider region.","While locals are ambivalent about them, they are fairly popular in the wider region.","The locals actively hate them."])}function L(){const r=G(),n=x(),e=z();return[r,n,e]}function I(){return s(L())}export{m as T,j as g};
