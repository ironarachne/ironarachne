var N=Object.defineProperty;var k=(n,t,e)=>t in n?N(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var s=(n,t,e)=>(k(n,typeof t!="symbol"?t+"":t,e),e);import{c as u,o as H}from"./characters.ca960b34.js";import{g as p}from"./premade_configs.f4c12be1.js";import{i,r as h}from"./index.ca3c12b8.js";import{f as y,j as g,b as T}from"./svg.7088cc52.js";import"./index.00caca3d.js";import"./lodash.46f0247c.js";import{g as S,b as v}from"./generator_sets.aadb63f7.js";import"./index.a9e36f3b.js";class c{constructor(t,e,a){s(this,"title");s(this,"inferiors");s(this,"superior");s(this,"classification");s(this,"ageGroupNames");this.title=t,this.inferiors=[],this.superior=null,this.classification=e,this.ageGroupNames=a}addInferior(t){this.inferiors.push(t)}}class C{constructor(t,e,a,r,o,l,m,d,f){s(this,"name");s(this,"minSize");s(this,"maxSize");s(this,"leaderTitle");s(this,"randomName");s(this,"randomDescription");s(this,"randomLeadership");s(this,"getRanks");s(this,"heraldryConfig");this.name=t,this.minSize=e,this.maxSize=a,this.leaderTitle=r,this.randomName=o,this.randomDescription=l,this.randomLeadership=m,this.getRanks=d,this.heraldryConfig=f}}function x(){let n=new y;return n.chargeCount=i([0,1]),n.chargeOptions=g(["weapon","armor","aggressive"],T()),new C("mercenary company",20,80,"captain",function(){const e=i(["Black","Blood","Burning","Crimson","Free","Gilded","Golden","Iron","Red","Silver","White"]),a=i(["Axes","Army","Bears","Blades","Coins","Company","Dragons","Giants","Lords","Pikes","Sentinels","Swords","Wolves","Wyverns"]);return"The "+e+" "+a},function(){return i(["{name} is a vicious mercenary company with a reputation for excessive violence.","{name} is a merc company that prides itself on its professionalism and integrity.","{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though."])},function(){let e=p();e.ageCategoryNames=["adult"];const a=u(e),r=this.getRanks();return a.titles.push(r.title),a},function(){const e=new c({femaleTitle:"Captain",maleTitle:"Captain",femaleHonorific:"Captain",maleHonorific:"Captain",hasLands:!1,landName:"",precedence:0},"military",["adult"]),a=new c({femaleTitle:"Lieutenant",maleTitle:"Lieutenant",femaleHonorific:"Lieutenant",maleHonorific:"Lieutenant",hasLands:!1,landName:"",precedence:1},"military",["adult"]),r=new c({femaleTitle:"Sergeant",maleTitle:"Sergeant",femaleHonorific:"Sergeant",maleHonorific:"Sergeant",hasLands:!1,landName:"",precedence:2},"military",["adult"]),o=new c({femaleTitle:"Mercenary",maleTitle:"Mercenary",femaleHonorific:"",maleHonorific:"",hasLands:!1,landName:"",precedence:3},"military",["adult"]);return r.addInferior(o),a.addInferior(r),e.addInferior(a),e},n)}function L(){let n=new y;return n.chargeCount=i([0,1]),n.chargeOptions=g(["coin","money","trade"],T()),new C("trading company",30,200,"proprietor",function(){return i([{name:"generic",randomName:function(){const o=i(["Dynasty","Gilded","Luxury"]),l=i(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return o+" "+l}},{name:"geographic",randomName:function(){const r=i(["North","West","South","East"]),o=i(["Wind","Sea","Mountain","Ocean"]),l=i(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return r+" "+o+" "+l}},{name:"family",randomName:function(){const r=S("fantasy",v());if(r.family===null)throw new Error("Family name generator not found.");const o=r.family.generate(100),l=i(o),m=i([" Brothers"," & Sons"," & Son"," Family",""]),d=i(["Trading Company","Traders","Navigation Company","Trade Company","Trade and Navigation Company"]);return l+" "+m+" "+d}}]).randomName()},function(){return i(["The {name} is noted for the quality of their goods.","The {name} has a reputation for always delivering goods to their intended destination.","The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.","The {name} often openly uses bullying and strong-arming in their dealings.","The {name} deals in a wide variety of goods."])},function(){let e=p();e.ageCategoryNames=["adult"];const a=u(e),r=this.getRanks();return a.titles.push(r.title),a},function(){const e=new c({femaleTitle:"Proprietor",maleTitle:"Proprietor",femaleHonorific:"",maleHonorific:"",hasLands:!1,landName:"",precedence:0},"commercial",["adult"]),a=new c({femaleTitle:"Manager",maleTitle:"Manager",femaleHonorific:"",maleHonorific:"",hasLands:!1,landName:"",precedence:1},"commercial",["adult"]),r=new c({femaleTitle:"Employee",maleTitle:"Employee",femaleHonorific:"",maleHonorific:"",hasLands:!1,landName:"",precedence:2},"commercial",["adult"]);return a.addInferior(r),e.addInferior(a),e},n)}function z(){let n=new y;return n.chargeCount=i([0,1]),n.chargeOptions=g(["book","magic","monster"],T()),new C("wizard school",100,600,"headmaster",function(){const e=i(["School","Academy","College"]),r=i([{generate:function(){return i(["Witchcraft","Wizardry","Sorcery","Mysticism"])}},{generate:function(){const o=["Arcane","Mystical","Eldritch","Occult"],l=["Arts","Sciences","Paths","Ways","Secrets"];return i(o)+" "+i(l)}}]);return"The "+e+" of "+r.generate()},function(){return i(["{name} is a hidden wizard school that avoids contact with the outside world.","{name} is a proud institution whose students primarily come from the nobility.","{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.","{name} is an egalitarian wizard school that accepts new students from every walk of life."])},function(){let e=p();e.ageCategoryNames=["elderly"];const a=u(e),r=this.getRanks();return a.titles.push(r.title),a},function(){const e=new c({femaleTitle:"Headmaster",maleTitle:"Headmaster",femaleHonorific:"Headmaster",maleHonorific:"Headmaster",hasLands:!1,landName:"",precedence:0},"arcane",["elderly"]),a=new c({femaleTitle:"Professor",maleTitle:"Professor",femaleHonorific:"Professor",maleHonorific:"Professor",hasLands:!1,landName:"",precedence:1},"arcane",["adult","elderly"]),r=new c({femaleTitle:"Student",maleTitle:"Student",femaleHonorific:"",maleHonorific:"",hasLands:!1,landName:"",precedence:2},"arcane",["teenager","young adult"]);return a.addInferior(r),e.addInferior(a),e},n)}class R{constructor(t,e,a,r,o,l){s(this,"name");s(this,"organizationType");s(this,"description");s(this,"memberCount");s(this,"leadership");s(this,"notableMembers");s(this,"ranks");s(this,"heraldry");this.name=t,this.organizationType=e,this.description=a,this.memberCount=r,this.leadership=o,this.notableMembers=[],this.ranks=l}getRanksOfTier(t){const e=[],a=this.ranks;if(t===0)return[a];let r=a.inferiors;for(let o=0;o<t;o++){let l=[];for(let m=0;m<r.length;m++)r[m].title.precedence===t&&e.push(r[m]),l=l.concat(r[m].inferiors);r=l}return e}}function q(){const n=O(),t=h.int(n.minSize,n.maxSize),e=new R(n.randomName(),n,n.randomDescription(),t,n.randomLeadership(),n.getRanks());return e.description=e.description.replace("{name}",e.name),e.description+=" It has "+e.memberCount+" members. ",e.description+=M(),e.notableMembers=G(e),e.leadership.description="They are led by "+H(e.leadership)+" "+e.leadership.firstName+" "+e.leadership.lastName+". "+e.leadership.description,e}function G(n){let t=1,e=n.ranks;const a=[];let r=e.inferiors.length;for(;r>0;)t++,e=e.inferiors[0],r=e.inferiors.length;if(t<=1)return[];for(let o=0;o<t;o++){const l=n.getRanksOfTier(o);let m=1;if(o==1?m=h.int(2,4):o==2&&(m=h.int(1,3)),o>0)for(let d=0;d<m;d++){let f=i(l),b=p();b.ageCategoryNames=f.ageGroupNames;let w=u(b);w.titles.push(f.title),a.push(w)}}return a}function M(){return i(["They enjoy a surprising amount of local popularity.","They are not terribly popular locally.","They're disliked by the local population.","They're fairly popular locally but relatively unknown in the wider region.","While locals are ambivalent about them, they are fairly popular in the wider region.","The locals actively hate them."])}function I(){const n=x(),t=L(),e=z();return[n,t,e]}function O(){return i(I())}export{q as g};
//# sourceMappingURL=fantasy.c9225331.js.map
