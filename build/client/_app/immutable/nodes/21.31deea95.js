import{s as pa,h as ua,n as dt,r as da,i as ga}from"../chunks/scheduler.db8c6f43.js";import{S as va,i as _a,s as T,g as p,m as _,z as ba,f as d,c as C,h as g,j as G,x as he,n as b,k as u,D as Ke,a as x,y as l,E as ct,C as Oe,o as D,A as Le,H as Qe,B as We,e as ft,F as Ft}from"../chunks/index.78ffd87c.js";import{e as me}from"../chunks/each.e59479a4.js";import{i as ue,w as ya,r as Re,c as Mt,a as Ut,b as $t}from"../chunks/index.618f0eea.js";import{a as wa,d as Ta,g as Ca,b as ka}from"../chunks/climates.18cf8221.js";import{g as Sa}from"../chunks/fantasy.1aa70cea.js";import{F as gt,d as Ea,a as $e,t as ye}from"../chunks/characters.8c04fa8c.js";import{g as Ra}from"../chunks/premade_configs.609df83b.js";import{H as ca,a as Ga}from"../chunks/svg.1054ff01.js";import{t as be,c as mt,b as pt}from"../chunks/index.5a95d5f9.js";import{r as za}from"../chunks/dice.7779eac6.js";function fa(){let a=ue(wa());a.description=Ta(a);let t=ka();t.climate=a;const e=Ca(t);let n={biome:e,climate:a,description:""};return n.description=`${ue(e.descriptions)} ${ue(e.features)}`,n.description+=" "+n.climate.description,n}function Na(){let a={name:"kingdom",minTiles:10,maxTiles:50,grantedTitle:{femaleTitle:"Queen",maleTitle:"King",femaleHonorific:"Queen",maleHonorific:"King",hasLands:!0,landName:"Kingdom of",precedence:7},commonality:5,isStandalone:!0,parentType:null},t={name:"empire",minTiles:50,maxTiles:100,grantedTitle:{femaleTitle:"Empress",maleTitle:"Emperor",femaleHonorific:"Empress",maleHonorific:"Emperor",hasLands:!0,landName:"Empire of",precedence:8},commonality:5,isStandalone:!0,parentType:null};return[{name:"earldom",minTiles:2,maxTiles:4,grantedTitle:{femaleTitle:"Earl",maleTitle:"Earl",femaleHonorific:"Lady",maleHonorific:"Lord",hasLands:!0,landName:"Earldom of",precedence:2},commonality:5,isStandalone:!1,parentType:a},{name:"county",minTiles:4,maxTiles:6,grantedTitle:{femaleTitle:"Countess",maleTitle:"Count",femaleHonorific:"Countess",maleHonorific:"Count",hasLands:!0,landName:"County of",precedence:3},commonality:20,isStandalone:!1,parentType:a},{name:"barony",minTiles:6,maxTiles:8,grantedTitle:{femaleTitle:"Baroness",maleTitle:"Baron",femaleHonorific:"Baroness",maleHonorific:"Baron",hasLands:!0,landName:"Barony of",precedence:4},commonality:10,isStandalone:!1,parentType:a},{name:"duchy",minTiles:8,maxTiles:10,grantedTitle:{femaleTitle:"Duchess",maleTitle:"Duke",femaleHonorific:"Duchess",maleHonorific:"Duke",hasLands:!0,landName:"Duchy of",precedence:5},commonality:5,isStandalone:!1,parentType:a},{name:"grand duchy",minTiles:10,maxTiles:12,grantedTitle:{femaleTitle:"Grand Duchess",maleTitle:"Grand Duke",femaleHonorific:"Grand Duchess",maleHonorific:"Grand Duke",hasLands:!0,landName:"Grand Duchy of",precedence:6},commonality:2,isStandalone:!1,parentType:a},{name:"principality",minTiles:12,maxTiles:14,grantedTitle:{femaleTitle:"Princess",maleTitle:"Prince",femaleHonorific:"Princess",maleHonorific:"Prince",hasLands:!0,landName:"Principality of",precedence:7},commonality:2,isStandalone:!1,parentType:a},{name:"province",minTiles:12,maxTiles:14,grantedTitle:{femaleTitle:"Governor",maleTitle:"Governor",femaleHonorific:"Governor",maleHonorific:"Governor",hasLands:!0,landName:"Province of",precedence:7},commonality:1,isStandalone:!1,parentType:t},a,t]}function ut(a){let t=ya(a.realmTypes);if(a.nameGeneratorSet.country===null)throw new Error("RealmGenerator requires a country name generator set.");let e=a.nameGeneratorSet.country.generate(1)[0];e=`the ${be(t.name)} of ${e}`;let r=new ca().generate(),h=Da(t,a.nameGeneratorSet);return{name:e,adjective:e,description:"",heraldry:r,authority:h,grantedTitle:t.grantedTitle,tiles:[],claims:[],parent:-1,realmType:t}}function Pt(){return{nameGeneratorSet:new gt,realmTypes:Na(),mapWidth:40,mapHeight:30,mapTiles:[]}}function Da(a,t){let e=Ra();e.ageCategoryNames=["adult"],e.familyNameGenerator=t.family,e.femaleNameGenerator=t.female,e.maleNameGenerator=t.male,e.useAdaptiveNames=!1;let n=Ea(e);n.titles.push(a.grantedTitle);let r=new ca;return n.heraldry=r.generate(),n}const Ha={name:"borough",minSize:1e4,maxSize:19999,sizeClass:"medium",possibleDescriptions:["The buildings here are tall and tightly packed together, with narrow streets winding between them.","This borough is divided into several distinct districts, each with its own unique architecture and atmosphere.","The center of this borough is dominated by a massive marketplace, surrounded by a ring of shops and residences.","There are many factories and mills in this borough, with tall chimneys belching smoke into the air.","The buildings here are mostly made of stone or brick, and are quite ornate and impressive.","The streets of this borough are lined with small shops and stalls, selling all manner of goods.","There are many parks and gardens scattered throughout this borough, offering a welcome respite from the hustle and bustle of city life.","The buildings here are a mix of old and new, with modern high-rises standing next to ancient, crumbling ruins.","This borough is known for its grand architecture, with many magnificent cathedrals and government buildings."]},Pa={name:"city",minSize:2e4,maxSize:49999,sizeClass:"large",possibleDescriptions:["This city is built around a grand castle, with towers that pierce the sky and walls that have withstood the test of time.","The streets of this city are lined with buildings of every shape and size, from towering spires to humble cottages.","This city is a marvel of engineering, with aqueducts, bridges, and tunnels that connect its various districts.","The buildings in this city are a testament to the skill and artistry of its craftsmen, with intricate carvings and decorations adorning their facades.","This city is surrounded by a sturdy wall, with guard towers and gates that keep out unwanted visitors.","The center of this city is dominated by a grand cathedral, with stained-glass windows and soaring arches that inspire awe in all who see them.","The main square of this city is a bustling hub of activity, with market stalls and street performers vying for attention.","The winding alleys of this city are lit by lanterns at night, creating a mysterious and romantic atmosphere.","This city is a patchwork of different architectural styles, with each district showcasing its own unique character and flair."]},Ia={name:"hamlet",minSize:10,maxSize:49,sizeClass:"small",possibleDescriptions:["Buildings here are scattered and small, with thatched roofs and walls of rough-hewn timber.","The farms here are clustered together, their fields carefully tended and surrounded by low stone walls.","There are only a handful of farms scattered around a single community building here, which serves as the center of local life.","The hamlet is surrounded by wilderness, with a few clearings where buildings and fields have been established.","The buildings in the hamlet are simple but sturdy, with chimneys belching smoke into the crisp morning air.","This hamlet is situated on a hilltop, with commanding views of the surrounding countryside.","The hamlet consists of a small cluster of houses and barns, with a narrow dirt road leading off into the distance.","There is a small stream running through the hamlet, providing water for the villagers and their crops."]},La={name:"metropolis",minSize:5e4,maxSize:3e6,sizeClass:"large",possibleDescriptions:["This grand metropolis is a center of culture and learning, with renowned universities and libraries that draw scholars from across the land.","The winding streets of this ancient metropolis are lined with taverns, inns, and shops selling all manner of exotic goods.","Despite its immense size, this metropolis is a tightly-knit community where everyone knows their neighbors and traditions are deeply rooted.","This sprawling metropolis is surrounded by towering walls and fortified gates, protecting it from invaders and marauders.","The grand castle at the heart of this metropolis is the seat of the ruling monarch, and its knights are famed for their valor and chivalry.","This metropolis is a hub of trade and commerce, with bustling markets and guilds that wield immense power.","The streets of this metropolis are lit by torches and lined with ancient stone buildings, some of which have stood for centuries.","This metropolis is renowned for its skilled craftsmen, who produce exquisite works of art and fine weaponry.","The dark alleys and hidden courtyards of this metropolis are home to thieves, assassins, and other unsavory characters.","Despite the challenges it faces, this metropolis is a beacon of hope and civilization in a world full of danger and chaos."]},Oa={name:"town",minSize:500,maxSize:9999,sizeClass:"medium",possibleDescriptions:["There are multiple inns and taverns here, with brightly colored signs swinging in the breeze.","The town is surrounded by fields and orchards, with the smell of ripe fruit and vegetables wafting through the air.","There is a city hall, a town square, and a number of stores and shops, all housed in buildings of stone and wood.","The town is located on the banks of a river, with a busy dock where barges unload their wares.","The buildings in the town are tightly packed together, with narrow streets winding between them.","The town is known for its skilled craftsmen, and their workshops and forges ring with the sound of hammers on metal.","Many farms surround a dense core of community buildings here.","The town is famous for its annual fair, where vendors from all over the kingdom come to sell their wares.","The town is dominated by a tall clock tower, which chimes the hour with a melodious tune.","Despite its size, the town is peaceful and orderly, with a watchful eye kept on outsiders who might cause trouble."]},ja={name:"village",minSize:50,maxSize:499,sizeClass:"small",possibleDescriptions:["There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it. Smoke rises from the chimneys, and the sound of animals can be heard in the distance.","This is a dense collection of farms with a number of communal buildings in the center, including a mill and a chapel. The farms are surrounded by low stone walls to protect them from marauding animals.","A knot of communal buildings marks the center of this village, including a town hall and a small market. The farms radiate out in a rough circle around it, with a stream running through the center of the village.","The village is nestled in a valley, surrounded by rolling hills covered in fields of wheat and barley. A small stream winds through the center of town, and the air is fragrant with the smell of fresh-baked bread.","The village is built on the side of a hill, with narrow paths winding between the houses. The buildings are made of wood and thatch, and are tightly packed together for warmth and protection from the wind.","The village is known for its skilled weavers, and the sound of looms can be heard from many of the houses. The weavers work with colorful threads, creating intricate patterns in their textiles.","Despite its small size, the village has a strong sense of community, with neighbors looking out for one another and coming together for festivals and celebrations throughout the year."]};function Va(){return[Ia,ja,Oa,Ha,Pa,La]}function Ba(a){const t=Va();let e=[];for(let n=0;n<t.length;n++)t[n].sizeClass==a&&e.push(t[n]);return e}function qa(a){return ue(a.possibleDescriptions)}function Aa(a){return Re.int(a.minSize,a.maxSize)}function It(a){const t=a.nameGenerator!==null?a.nameGenerator.generate(1)[0]:"Settlement",e=ue(Ba(a.size)),n={name:t,category:e,environment:a.environment,description:"",population:Aa(e),prosperity:za("2d6")};return n.description=Ma(n),n}function Fa(){let a=fa(),e=new gt().town;return{environment:a,nameGenerator:e,size:"any"}}function Ma(a){let t=ue(["{name} is a {category} of {population} people.","The {category} of {name} has {population} people."]);return t=t.replace("{category}",a.category.name),t=t.replace("{population}",new Intl.NumberFormat().format(a.population)),t=t.replace("{name}",a.name),t+=" "+qa(a.category),t+=" "+Ua(a.prosperity),t+=" "+$a(),t+=" "+ue(a.environment.biome.features),t}function Ua(a){let t=["The people here","Most people here","Folks here","Most folks here","People here"],e=[];a<4?e=["have little more than what they need to survive","struggle to make ends meet","struggle to have enough to survive"]:a<8?e=["have enough to meet their needs","have just enough to meet their needs","seem to be doing well","have their needs met"]:e=["have more wealth than most","are prosperous","have more than they need"];let n=[];for(let r=0;r<t.length;r++)for(let h=0;h<e.length;h++)n.push(`${t[r]} ${e[h]}.`);return ue(n)}function $a(){let a=["The people are known for","The people are regarded as","Folk here have a reputation for","People here are regarded as","The folk here are known for","They are known for","They are well known for","They are sometimes known for","Some other places regard the people here as","Some places regard the people here as","Some places regard them as","Some regard them as","Some folks regard them as"],t=["being aloof","being suspicious of others","being suspicious of outsiders","being friendly and open","being friendly but devious","being friendly","being greedy","being altruistic","being trusting","being mistrustful","being miserly","being obsessed with status","being hardworking","being devious","being unfriendly","being trustworthy","being lazy","spending too much time making merry","spending too much time slacking off","working hard","working too hard","being unruly","being belligerent"],e=[];for(let n=0;n<a.length;n++)for(let r=0;r<t.length;r++)e.push(`${a[n]} ${t[r]}.`);return ue(e)}function Kt(a){let t={name:"",environment:{},description:"",dominantCulture:{},settlements:[],mainRealm:0,realms:[],authority:{},organizations:[],settlementTiles:[],terrainTiles:[]},e;a.dominantCulture!=null?(t.dominantCulture=a.dominantCulture,e=t.dominantCulture.generatorSet):e=a.nameGeneratorSet,t.environment=fa(),t.settlements=Wa(t.environment,e),t.organizations=Qa(),t.description=t.environment.description;let n=Pt();n.nameGeneratorSet=e;let r=ut(n);if(t.realms.push(r),t.mainRealm=0,!r.realmType.isStandalone){let o=Pt();if(o.nameGeneratorSet=n.nameGeneratorSet,r.realmType.parentType==null)throw new Error("Realm type has no parent type.");o.realmTypes=[r.realmType.parentType];let m=ut(o);t.realms.push(m),r.parent=1}let h=Re.int(a.minRealms,a.maxRealms);for(let o=0;o<h;o++){if(n.nameGeneratorSet=new gt,Mt(100)>70){let c=ue($e());n.nameGeneratorSet=c}let m=ut(n);if(!m.realmType.isStandalone)if(Mt(100)>50)m.parent=r.parent;else{let c=Pt();if(m.realmType.parentType==null)throw new Error("Realm type has no parent type.");c.realmTypes=[m.realmType.parentType],c.nameGeneratorSet=n.nameGeneratorSet;let v=ut(c);t.realms.push(v),m.parent=t.realms.length-1}t.realms.push(m)}return t.authority=r.authority,t.name=r.name,t}function Ka(){return{nameGeneratorSet:new gt,dominantCulture:null,mapWidth:40,mapHeight:30,minRealms:2,maxRealms:4}}function Qa(){const a=[],t=Re.int(1,3);for(let e=0;e<t;e++)a.push(Sa());return a}function Wa(a,t){let e=Fa();e.nameGenerator=t.town,e.size="large",e.environment=a;const n=It(e),r=Re.int(1,3),h=Re.int(3,5),o=[];n.description+=" This is the capital of the region.",o.push(n);for(let m=0;m<r;m++){e.size="medium";const c=It(e);o.push(c)}for(let m=0;m<h;m++){e.size="small";const c=It(e);o.push(c)}return o}function Qt(a,t,e){const n=a.slice();return n[19]=t[e],n}function Wt(a,t,e){const n=a.slice();return n[22]=t[e],n}function Jt(a,t,e){const n=a.slice();return n[25]=t[e],n[27]=e,n}function Xt(a,t,e){const n=a.slice();return n[25]=t[e],n[27]=e,n}function Yt(a,t,e){const n=a.slice();return n[29]=t[e],n}function Zt(a,t,e){const n=a.slice();return n[6]=t[e],n}function xt(a){let t,e=a[6].name+"",n;return{c(){t=p("option"),n=_(e),this.h()},l(r){t=g(r,"OPTION",{});var h=G(t);n=b(h,e),h.forEach(d),this.h()},h(){t.__value=a[6].name,Ke(t,t.__value)},m(r,h){x(r,t,h),l(t,n)},p:dt,d(r){r&&d(t)}}}function Ja(a){let t,e,n="Use a saved culture for naming?",r,h,o,m,c,v="Select a saved culture to load",y,w,f,E,H=me(a[7].savedCultures),R=[];for(let k=0;k<H.length;k+=1)R[k]=ea(Yt(a,H,k));return{c(){t=p("div"),e=p("label"),e.textContent=n,r=T(),h=p("input"),o=T(),m=p("div"),c=p("label"),c.textContent=v,y=T(),w=p("select");for(let k=0;k<R.length;k+=1)R[k].c();this.h()},l(k){t=g(k,"DIV",{class:!0});var L=G(t);e=g(L,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),he(e)!=="svelte-14j9oxd"&&(e.textContent=n),r=C(L),h=g(L,"INPUT",{type:!0,name:!0,id:!0,class:!0}),L.forEach(d),o=C(k),m=g(k,"DIV",{class:!0});var z=G(m);c=g(z,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),he(c)!=="svelte-32ylm8"&&(c.textContent=v),y=C(z),w=g(z,"SELECT",{class:!0});var S=G(w);for(let V=0;V<R.length;V+=1)R[V].l(S);S.forEach(d),z.forEach(d),this.h()},h(){u(e,"for","useSavedCulture"),u(e,"class","svelte-8c1n7g"),u(h,"type","checkbox"),u(h,"name","useSavedCulture"),u(h,"id","useSavedCulture"),u(h,"class","svelte-8c1n7g"),u(t,"class","input-group svelte-8c1n7g"),u(c,"for","savedCulture"),u(c,"class","svelte-8c1n7g"),u(w,"class","svelte-8c1n7g"),a[0]===void 0&&ua(()=>a[15].call(w)),u(m,"class","input-group svelte-8c1n7g")},m(k,L){x(k,t,L),l(t,e),l(t,r),l(t,h),h.checked=a[1],x(k,o,L),x(k,m,L),l(m,c),l(m,y),l(m,w);for(let z=0;z<R.length;z+=1)R[z]&&R[z].m(w,null);ct(w,a[0],!0),f||(E=[Oe(h,"change",a[14]),Oe(w,"change",a[15])],f=!0)},p(k,L){if(L[0]&2&&(h.checked=k[1]),L[0]&128){H=me(k[7].savedCultures);let z;for(z=0;z<H.length;z+=1){const S=Yt(k,H,z);R[z]?R[z].p(S,L):(R[z]=ea(S),R[z].c(),R[z].m(w,null))}for(;z<R.length;z+=1)R[z].d(1);R.length=H.length}L[0]&129&&ct(w,k[0])},d(k){k&&(d(t),d(o),d(m)),Le(R,k),f=!1,da(E)}}}function ea(a){let t,e=a[29].name+"",n;return{c(){t=p("option"),n=_(e),this.h()},l(r){t=g(r,"OPTION",{});var h=G(t);n=b(h,e),h.forEach(d),this.h()},h(){t.__value=a[29].name,Ke(t,t.__value)},m(r,h){x(r,t,h),l(t,n)},p:dt,d(r){r&&d(t)}}}function ta(a){let t,e,n=a[4].dominantCulture.name+"",r,h;return{c(){t=p("p"),e=_("The dominant culture here is the "),r=_(n),h=_("."),this.h()},l(o){t=g(o,"P",{class:!0});var m=G(t);e=b(m,"The dominant culture here is the "),r=b(m,n),h=b(m,"."),m.forEach(d),this.h()},h(){u(t,"class","svelte-8c1n7g")},m(o,m){x(o,t,m),l(t,e),l(t,r),l(t,h)},p(o,m){m[0]&16&&n!==(n=o[4].dominantCulture.name+"")&&D(r,n)},d(o){o&&d(t)}}}function aa(a){let t,e,n=be(a[4].name)+"",r,h,o=a[4].realms[a[4].realms[a[4].mainRealm].parent].name+"",m,c,v,y=a[9].render(a[4].realms[a[4].realms[a[4].mainRealm].parent].heraldry.device,20,22)+"",w;return{c(){t=p("div"),e=p("p"),r=_(n),h=_(" is part of "),m=_(o),c=T(),v=new Qe(!1),w=_("."),this.h()},l(f){t=g(f,"DIV",{class:!0});var E=G(t);e=g(E,"P",{class:!0});var H=G(e);r=b(H,n),h=b(H," is part of "),m=b(H,o),c=C(H),v=We(H,!1),w=b(H,"."),H.forEach(d),E.forEach(d),this.h()},h(){v.a=w,u(e,"class","svelte-8c1n7g"),u(t,"class","parent-realm svelte-8c1n7g")},m(f,E){x(f,t,E),l(t,e),l(e,r),l(e,h),l(e,m),l(e,c),v.m(y,e),l(e,w)},p(f,E){E[0]&16&&n!==(n=be(f[4].name)+"")&&D(r,n),E[0]&16&&o!==(o=f[4].realms[f[4].realms[f[4].mainRealm].parent].name+"")&&D(m,o),E[0]&16&&y!==(y=f[9].render(f[4].realms[f[4].realms[f[4].mainRealm].parent].heraldry.device,20,22)+"")&&v.p(y)},d(f){f&&d(t)}}}function na(a){let t,e,n=a[9].render(a[5].heraldry.device,200,220)+"";return{c(){t=p("div"),e=new Qe(!1),this.h()},l(r){t=g(r,"DIV",{class:!0});var h=G(t);e=We(h,!1),h.forEach(d),this.h()},h(){e.a=null,u(t,"class","ruler-arms svelte-8c1n7g")},m(r,h){x(r,t,h),e.m(n,t)},p(r,h){h[0]&32&&n!==(n=r[9].render(r[5].heraldry.device,200,220)+"")&&e.p(n)},d(r){r&&d(t)}}}function la(a){let t,e,n,r=a[9].render(a[25].heraldry.device,80,88)+"",h,o,m,c,v=be(a[25].name)+"",y,w,f,E,H=ye(a[25].authority)+"",R,k,L=a[25].authority.name+"",z,S,V=pt(a[25].authority.species.adjective)+"",ne,q,se=a[25].authority.species.adjective+"",A,de,re=a[25].authority.ageCategory.noun+"",F,ce,fe,O=a[4].realms[a[4].mainRealm].parent==a[27]&&sa(a);return{c(){t=p("div"),e=p("div"),n=new Qe(!1),h=T(),o=p("div"),m=p("p"),c=p("strong"),y=_(v),w=T(),f=p("p"),E=_("Ruled by "),R=_(H),k=T(),z=_(L),S=_(", "),ne=_(V),q=T(),A=_(se),de=T(),F=_(re),ce=_("."),fe=T(),O&&O.c(),this.h()},l(I){t=g(I,"DIV",{class:!0});var B=G(t);e=g(B,"DIV",{class:!0});var ie=G(e);n=We(ie,!1),ie.forEach(d),h=C(B),o=g(B,"DIV",{class:!0});var K=G(o);m=g(K,"P",{class:!0});var oe=G(m);c=g(oe,"STRONG",{class:!0});var j=G(c);y=b(j,v),j.forEach(d),oe.forEach(d),w=C(K),f=g(K,"P",{class:!0});var N=G(f);E=b(N,"Ruled by "),R=b(N,H),k=C(N),z=b(N,L),S=b(N,", "),ne=b(N,V),q=C(N),A=b(N,se),de=C(N),F=b(N,re),ce=b(N,"."),N.forEach(d),fe=C(K),O&&O.l(K),K.forEach(d),B.forEach(d),this.h()},h(){n.a=null,u(e,"class","neighbor-arms svelte-8c1n7g"),u(c,"class","svelte-8c1n7g"),u(m,"class","svelte-8c1n7g"),u(f,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","neighbor svelte-8c1n7g")},m(I,B){x(I,t,B),l(t,e),n.m(r,e),l(t,h),l(t,o),l(o,m),l(m,c),l(c,y),l(o,w),l(o,f),l(f,E),l(f,R),l(f,k),l(f,z),l(f,S),l(f,ne),l(f,q),l(f,A),l(f,de),l(f,F),l(f,ce),l(o,fe),O&&O.m(o,null)},p(I,B){B[0]&16&&r!==(r=I[9].render(I[25].heraldry.device,80,88)+"")&&n.p(r),B[0]&16&&v!==(v=be(I[25].name)+"")&&D(y,v),B[0]&16&&H!==(H=ye(I[25].authority)+"")&&D(R,H),B[0]&16&&L!==(L=I[25].authority.name+"")&&D(z,L),B[0]&16&&V!==(V=pt(I[25].authority.species.adjective)+"")&&D(ne,V),B[0]&16&&se!==(se=I[25].authority.species.adjective+"")&&D(A,se),B[0]&16&&re!==(re=I[25].authority.ageCategory.noun+"")&&D(F,re),I[4].realms[I[4].mainRealm].parent==I[27]?O?O.p(I,B):(O=sa(I),O.c(),O.m(o,null)):O&&(O.d(1),O=null)},d(I){I&&d(t),O&&O.d()}}}function sa(a){let t,e=be(a[4].realms[a[4].mainRealm].name)+"",n,r;return{c(){t=p("p"),n=_(e),r=_(" is part of this."),this.h()},l(h){t=g(h,"P",{class:!0});var o=G(t);n=b(o,e),r=b(o," is part of this."),o.forEach(d),this.h()},h(){u(t,"class","svelte-8c1n7g")},m(h,o){x(h,t,o),l(t,n),l(t,r)},p(h,o){o[0]&16&&e!==(e=be(h[4].realms[h[4].mainRealm].name)+"")&&D(n,e)},d(h){h&&d(t)}}}function ra(a){let t,e=a[27]!=a[4].mainRealm&&a[25].parent==-1&&la(a);return{c(){e&&e.c(),t=ft()},l(n){e&&e.l(n),t=ft()},m(n,r){e&&e.m(n,r),x(n,t,r)},p(n,r){n[27]!=n[4].mainRealm&&n[25].parent==-1?e?e.p(n,r):(e=la(n),e.c(),e.m(t.parentNode,t)):e&&(e.d(1),e=null)},d(n){n&&d(t),e&&e.d(n)}}}function ia(a){let t,e,n,r=a[9].render(a[25].heraldry.device,80,88)+"",h,o,m,c,v=be(a[25].name)+"",y,w,f=a[4].realms[a[25].parent].name+"",E,H,R,k=a[9].render(a[4].realms[a[25].parent].heraldry.device,20,22)+"",L,z,S,V,ne=ye(a[25].authority)+"",q,se,A=a[25].authority.name+"",de,re,F=pt(a[25].authority.species.adjective)+"",ce,fe,O=a[25].authority.species.adjective+"",I,B,ie=a[25].authority.ageCategory.noun+"",K,oe;return{c(){t=p("div"),e=p("div"),n=new Qe(!1),h=T(),o=p("div"),m=p("p"),c=p("strong"),y=_(v),w=_(", part of "),E=_(f),H=T(),R=new Qe(!1),L=_("."),z=T(),S=p("p"),V=_("Ruled by "),q=_(ne),se=T(),de=_(A),re=_(", "),ce=_(F),fe=T(),I=_(O),B=T(),K=_(ie),oe=_("."),this.h()},l(j){t=g(j,"DIV",{class:!0});var N=G(t);e=g(N,"DIV",{class:!0});var we=G(e);n=We(we,!1),we.forEach(d),h=C(N),o=g(N,"DIV",{class:!0});var ge=G(o);m=g(ge,"P",{class:!0});var M=G(m);c=g(M,"STRONG",{class:!0});var Ge=G(c);y=b(Ge,v),Ge.forEach(d),w=b(M,", part of "),E=b(M,f),H=C(M),R=We(M,!1),L=b(M,"."),M.forEach(d),z=C(ge),S=g(ge,"P",{class:!0});var Q=G(S);V=b(Q,"Ruled by "),q=b(Q,ne),se=C(Q),de=b(Q,A),re=b(Q,", "),ce=b(Q,F),fe=C(Q),I=b(Q,O),B=C(Q),K=b(Q,ie),oe=b(Q,"."),Q.forEach(d),ge.forEach(d),N.forEach(d),this.h()},h(){n.a=null,u(e,"class","neighbor-arms svelte-8c1n7g"),u(c,"class","svelte-8c1n7g"),R.a=L,u(m,"class","svelte-8c1n7g"),u(S,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","neighbor svelte-8c1n7g")},m(j,N){x(j,t,N),l(t,e),n.m(r,e),l(t,h),l(t,o),l(o,m),l(m,c),l(c,y),l(m,w),l(m,E),l(m,H),R.m(k,m),l(m,L),l(o,z),l(o,S),l(S,V),l(S,q),l(S,se),l(S,de),l(S,re),l(S,ce),l(S,fe),l(S,I),l(S,B),l(S,K),l(S,oe)},p(j,N){N[0]&16&&r!==(r=j[9].render(j[25].heraldry.device,80,88)+"")&&n.p(r),N[0]&16&&v!==(v=be(j[25].name)+"")&&D(y,v),N[0]&16&&f!==(f=j[4].realms[j[25].parent].name+"")&&D(E,f),N[0]&16&&k!==(k=j[9].render(j[4].realms[j[25].parent].heraldry.device,20,22)+"")&&R.p(k),N[0]&16&&ne!==(ne=ye(j[25].authority)+"")&&D(q,ne),N[0]&16&&A!==(A=j[25].authority.name+"")&&D(de,A),N[0]&16&&F!==(F=pt(j[25].authority.species.adjective)+"")&&D(ce,F),N[0]&16&&O!==(O=j[25].authority.species.adjective+"")&&D(I,O),N[0]&16&&ie!==(ie=j[25].authority.ageCategory.noun+"")&&D(K,ie)},d(j){j&&d(t)}}}function oa(a){let t,e=a[27]!=a[4].mainRealm&&a[27]!=a[4].realms[a[4].mainRealm].parent&&a[25].parent!=-1&&ia(a);return{c(){e&&e.c(),t=ft()},l(n){e&&e.l(n),t=ft()},m(n,r){e&&e.m(n,r),x(n,t,r)},p(n,r){n[27]!=n[4].mainRealm&&n[27]!=n[4].realms[n[4].mainRealm].parent&&n[25].parent!=-1?e?e.p(n,r):(e=ia(n),e.c(),e.m(t.parentNode,t)):e&&(e.d(1),e=null)},d(n){n&&d(t),e&&e.d(n)}}}function ha(a){let t,e,n=a[22].name+"",r,h,o,m=a[22].description+"",c;return{c(){t=p("article"),e=p("h5"),r=_(n),h=T(),o=p("p"),c=_(m),this.h()},l(v){t=g(v,"ARTICLE",{class:!0});var y=G(t);e=g(y,"H5",{class:!0});var w=G(e);r=b(w,n),w.forEach(d),h=C(y),o=g(y,"P",{class:!0});var f=G(o);c=b(f,m),f.forEach(d),y.forEach(d),this.h()},h(){u(e,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","svelte-8c1n7g")},m(v,y){x(v,t,y),l(t,e),l(e,r),l(t,h),l(t,o),l(o,c)},p(v,y){y[0]&16&&n!==(n=v[22].name+"")&&D(r,n),y[0]&16&&m!==(m=v[22].description+"")&&D(c,m)},d(v){v&&d(t)}}}function ma(a){let t,e,n=a[19].name+"",r,h,o,m=a[19].description+"",c,v;return{c(){t=p("article"),e=p("h5"),r=_(n),h=T(),o=p("p"),c=_(m),v=T(),this.h()},l(y){t=g(y,"ARTICLE",{class:!0});var w=G(t);e=g(w,"H5",{class:!0});var f=G(e);r=b(f,n),f.forEach(d),h=C(w),o=g(w,"P",{class:!0});var E=G(o);c=b(E,m),E.forEach(d),v=C(w),w.forEach(d),this.h()},h(){u(e,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","svelte-8c1n7g")},m(y,w){x(y,t,w),l(t,e),l(e,r),l(t,h),l(t,o),l(o,c),l(t,v)},p(y,w){w[0]&16&&n!==(n=y[19].name+"")&&D(r,n),w[0]&16&&m!==(m=y[19].description+"")&&D(c,m)},d(y){y&&d(t)}}}function Xa(a){let t,e,n,r="Region Generator",h,o,m="Generate fantasy regions.",c,v,y,w="Random Seed",f,E,H,R,k,L="Name Set",z,S,V,ne="any",q,se,A,de="Generate From Seed",re,F,ce="Random Seed (and Generate)",fe,O,I=mt(a[4].name)+"",B,ie,K,oe=a[4].description+"",j,N,we,ge,M,Ge,Q=ye(a[5])+"",Je,vt,je=a[5].firstName+"",Xe,_t,Ve=a[5].lastName+"",Ye,bt,ve,Ze,ze,le,Be=mt(a[4].name)+"",xe,yt,qe=ye(a[5])+"",et,wt,Ae=a[5].firstName+"",tt,Tt,Fe=a[5].lastName+"",at,Ct,Me=a[5].description+"",nt,kt,Te,Lt="Nearby Sovereignties",St,lt,Ce,Ot="Nearby Realms",Et,st,ke,Rt,Ue=a[4].name+"",rt,Gt,it,Se,jt="Notable Organizations",zt,Nt,Vt,Ne=me(a[8]),W=[];for(let i=0;i<Ne.length;i+=1)W[i]=xt(Zt(a,Ne,i));let _e=a[7].savedCultures!==void 0&&a[7].savedCultures.length>0&&Ja(a),ee=a[4].dominantCulture.name!==void 0&&ta(a),te=a[4].realms[a[4].mainRealm].parent!=-1&&aa(a),ae=a[5].heraldry!==null&&na(a),De=me(a[4].realms),J=[];for(let i=0;i<De.length;i+=1)J[i]=ra(Xt(a,De,i));let He=me(a[4].realms),X=[];for(let i=0;i<He.length;i+=1)X[i]=oa(Jt(a,He,i));let Pe=me(a[4].settlements),Y=[];for(let i=0;i<Pe.length;i+=1)Y[i]=ha(Wt(a,Pe,i));let Ie=me(a[4].organizations),Z=[];for(let i=0;i<Ie.length;i+=1)Z[i]=ma(Qt(a,Ie,i));return{c(){t=T(),e=p("section"),n=p("h1"),n.textContent=r,h=T(),o=p("p"),o.textContent=m,c=T(),v=p("div"),y=p("label"),y.textContent=w,f=T(),E=p("input"),H=T(),R=p("div"),k=p("label"),k.textContent=L,z=T(),S=p("select"),V=p("option"),V.textContent=ne;for(let i=0;i<W.length;i+=1)W[i].c();q=T(),_e&&_e.c(),se=T(),A=p("button"),A.textContent=de,re=T(),F=p("button"),F.textContent=ce,fe=T(),O=p("h2"),B=_(I),ie=T(),K=p("p"),j=_(oe),N=T(),ee&&ee.c(),we=T(),te&&te.c(),ge=T(),M=p("h3"),Ge=_("Ruler: "),Je=_(Q),vt=T(),Xe=_(je),_t=T(),Ye=_(Ve),bt=T(),ve=p("div"),ae&&ae.c(),Ze=T(),ze=p("div"),le=p("p"),xe=_(Be),yt=_(" is ruled by "),et=_(qe),wt=T(),tt=_(Ae),Tt=T(),at=_(Fe),Ct=_(". "),nt=_(Me),kt=T(),Te=p("h3"),Te.textContent=Lt,St=T();for(let i=0;i<J.length;i+=1)J[i].c();lt=T(),Ce=p("h3"),Ce.textContent=Ot,Et=T();for(let i=0;i<X.length;i+=1)X[i].c();st=T(),ke=p("h3"),Rt=_("Notable Settlements in "),rt=_(Ue),Gt=T();for(let i=0;i<Y.length;i+=1)Y[i].c();it=T(),Se=p("h3"),Se.textContent=jt,zt=T();for(let i=0;i<Z.length;i+=1)Z[i].c();this.h()},l(i){ba("svelte-1w8gppc",document.head).forEach(d),t=C(i),e=g(i,"SECTION",{class:!0});var s=G(e);n=g(s,"H1",{class:!0,"data-svelte-h":!0}),he(n)!=="svelte-qth4ep"&&(n.textContent=r),h=C(s),o=g(s,"P",{class:!0,"data-svelte-h":!0}),he(o)!=="svelte-pq4136"&&(o.textContent=m),c=C(s),v=g(s,"DIV",{class:!0});var U=G(v);y=g(U,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),he(y)!=="svelte-1akft3f"&&(y.textContent=w),f=C(U),E=g(U,"INPUT",{type:!0,name:!0,id:!0,class:!0}),U.forEach(d),H=C(s),R=g(s,"DIV",{class:!0});var ot=G(R);k=g(ot,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),he(k)!=="svelte-1mjeby7"&&(k.textContent=L),z=C(ot),S=g(ot,"SELECT",{name:!0,id:!0,class:!0});var Dt=G(S);V=g(Dt,"OPTION",{"data-svelte-h":!0}),he(V)!=="svelte-1j2tppc"&&(V.textContent=ne);for(let $=0;$<W.length;$+=1)W[$].l(Dt);Dt.forEach(d),ot.forEach(d),q=C(s),_e&&_e.l(s),se=C(s),A=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),he(A)!=="svelte-1u7zbd5"&&(A.textContent=de),re=C(s),F=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),he(F)!=="svelte-192mxrq"&&(F.textContent=ce),fe=C(s),O=g(s,"H2",{class:!0});var Bt=G(O);B=b(Bt,I),Bt.forEach(d),ie=C(s),K=g(s,"P",{class:!0});var qt=G(K);j=b(qt,oe),qt.forEach(d),N=C(s),ee&&ee.l(s),we=C(s),te&&te.l(s),ge=C(s),M=g(s,"H3",{class:!0});var Ee=G(M);Ge=b(Ee,"Ruler: "),Je=b(Ee,Q),vt=C(Ee),Xe=b(Ee,je),_t=C(Ee),Ye=b(Ee,Ve),Ee.forEach(d),bt=C(s),ve=g(s,"DIV",{class:!0});var ht=G(ve);ae&&ae.l(ht),Ze=C(ht),ze=g(ht,"DIV",{class:!0});var At=G(ze);le=g(At,"P",{class:!0});var pe=G(le);xe=b(pe,Be),yt=b(pe," is ruled by "),et=b(pe,qe),wt=C(pe),tt=b(pe,Ae),Tt=C(pe),at=b(pe,Fe),Ct=b(pe,". "),nt=b(pe,Me),pe.forEach(d),At.forEach(d),ht.forEach(d),kt=C(s),Te=g(s,"H3",{class:!0,"data-svelte-h":!0}),he(Te)!=="svelte-1d5axrk"&&(Te.textContent=Lt),St=C(s);for(let $=0;$<J.length;$+=1)J[$].l(s);lt=C(s),Ce=g(s,"H3",{class:!0,"data-svelte-h":!0}),he(Ce)!=="svelte-p9np5t"&&(Ce.textContent=Ot),Et=C(s);for(let $=0;$<X.length;$+=1)X[$].l(s);st=C(s),ke=g(s,"H3",{class:!0});var Ht=G(ke);Rt=b(Ht,"Notable Settlements in "),rt=b(Ht,Ue),Ht.forEach(d),Gt=C(s);for(let $=0;$<Y.length;$+=1)Y[$].l(s);it=C(s),Se=g(s,"H3",{class:!0,"data-svelte-h":!0}),he(Se)!=="svelte-11j2hih"&&(Se.textContent=jt),zt=C(s);for(let $=0;$<Z.length;$+=1)Z[$].l(s);s.forEach(d),this.h()},h(){document.title="Region Generator | Iron Arachne",u(n,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(y,"for","seed"),u(y,"class","svelte-8c1n7g"),u(E,"type","text"),u(E,"name","seed"),u(E,"id","seed"),u(E,"class","svelte-8c1n7g"),u(v,"class","input-group svelte-8c1n7g"),u(k,"for","names"),u(k,"class","svelte-8c1n7g"),V.__value="any",Ke(V,V.__value),u(S,"name","names"),u(S,"id","nameSet"),u(S,"class","svelte-8c1n7g"),a[3]===void 0&&ua(()=>a[13].call(S)),u(R,"class","input-group svelte-8c1n7g"),u(A,"class","svelte-8c1n7g"),u(F,"class","svelte-8c1n7g"),u(O,"class","svelte-8c1n7g"),u(K,"class","svelte-8c1n7g"),u(M,"class","svelte-8c1n7g"),u(le,"class","svelte-8c1n7g"),u(ze,"class","svelte-8c1n7g"),u(ve,"class","ruler svelte-8c1n7g"),u(Te,"class","svelte-8c1n7g"),u(Ce,"class","svelte-8c1n7g"),u(ke,"class","svelte-8c1n7g"),u(Se,"class","svelte-8c1n7g"),u(e,"class","fantasy main svelte-8c1n7g")},m(i,P){x(i,t,P),x(i,e,P),l(e,n),l(e,h),l(e,o),l(e,c),l(e,v),l(v,y),l(v,f),l(v,E),Ke(E,a[2]),l(e,H),l(e,R),l(R,k),l(R,z),l(R,S),l(S,V);for(let s=0;s<W.length;s+=1)W[s]&&W[s].m(S,null);ct(S,a[3],!0),l(e,q),_e&&_e.m(e,null),l(e,se),l(e,A),l(e,re),l(e,F),l(e,fe),l(e,O),l(O,B),l(e,ie),l(e,K),l(K,j),l(e,N),ee&&ee.m(e,null),l(e,we),te&&te.m(e,null),l(e,ge),l(e,M),l(M,Ge),l(M,Je),l(M,vt),l(M,Xe),l(M,_t),l(M,Ye),l(e,bt),l(e,ve),ae&&ae.m(ve,null),l(ve,Ze),l(ve,ze),l(ze,le),l(le,xe),l(le,yt),l(le,et),l(le,wt),l(le,tt),l(le,Tt),l(le,at),l(le,Ct),l(le,nt),l(e,kt),l(e,Te),l(e,St);for(let s=0;s<J.length;s+=1)J[s]&&J[s].m(e,null);l(e,lt),l(e,Ce),l(e,Et);for(let s=0;s<X.length;s+=1)X[s]&&X[s].m(e,null);l(e,st),l(e,ke),l(ke,Rt),l(ke,rt),l(e,Gt);for(let s=0;s<Y.length;s+=1)Y[s]&&Y[s].m(e,null);l(e,it),l(e,Se),l(e,zt);for(let s=0;s<Z.length;s+=1)Z[s]&&Z[s].m(e,null);Nt||(Vt=[Oe(E,"input",a[12]),Oe(S,"change",a[13]),Oe(A,"click",a[10]),Oe(F,"click",a[11])],Nt=!0)},p(i,P){if(P[0]&4&&E.value!==i[2]&&Ke(E,i[2]),P[0]&256){Ne=me(i[8]);let s;for(s=0;s<Ne.length;s+=1){const U=Zt(i,Ne,s);W[s]?W[s].p(U,P):(W[s]=xt(U),W[s].c(),W[s].m(S,null))}for(;s<W.length;s+=1)W[s].d(1);W.length=Ne.length}if(P[0]&264&&ct(S,i[3]),i[7].savedCultures!==void 0&&i[7].savedCultures.length>0&&_e.p(i,P),P[0]&16&&I!==(I=mt(i[4].name)+"")&&D(B,I),P[0]&16&&oe!==(oe=i[4].description+"")&&D(j,oe),i[4].dominantCulture.name!==void 0?ee?ee.p(i,P):(ee=ta(i),ee.c(),ee.m(e,we)):ee&&(ee.d(1),ee=null),i[4].realms[i[4].mainRealm].parent!=-1?te?te.p(i,P):(te=aa(i),te.c(),te.m(e,ge)):te&&(te.d(1),te=null),P[0]&32&&Q!==(Q=ye(i[5])+"")&&D(Je,Q),P[0]&32&&je!==(je=i[5].firstName+"")&&D(Xe,je),P[0]&32&&Ve!==(Ve=i[5].lastName+"")&&D(Ye,Ve),i[5].heraldry!==null?ae?ae.p(i,P):(ae=na(i),ae.c(),ae.m(ve,Ze)):ae&&(ae.d(1),ae=null),P[0]&16&&Be!==(Be=mt(i[4].name)+"")&&D(xe,Be),P[0]&32&&qe!==(qe=ye(i[5])+"")&&D(et,qe),P[0]&32&&Ae!==(Ae=i[5].firstName+"")&&D(tt,Ae),P[0]&32&&Fe!==(Fe=i[5].lastName+"")&&D(at,Fe),P[0]&32&&Me!==(Me=i[5].description+"")&&D(nt,Me),P[0]&528){De=me(i[4].realms);let s;for(s=0;s<De.length;s+=1){const U=Xt(i,De,s);J[s]?J[s].p(U,P):(J[s]=ra(U),J[s].c(),J[s].m(e,lt))}for(;s<J.length;s+=1)J[s].d(1);J.length=De.length}if(P[0]&528){He=me(i[4].realms);let s;for(s=0;s<He.length;s+=1){const U=Jt(i,He,s);X[s]?X[s].p(U,P):(X[s]=oa(U),X[s].c(),X[s].m(e,st))}for(;s<X.length;s+=1)X[s].d(1);X.length=He.length}if(P[0]&16&&Ue!==(Ue=i[4].name+"")&&D(rt,Ue),P[0]&16){Pe=me(i[4].settlements);let s;for(s=0;s<Pe.length;s+=1){const U=Wt(i,Pe,s);Y[s]?Y[s].p(U,P):(Y[s]=ha(U),Y[s].c(),Y[s].m(e,it))}for(;s<Y.length;s+=1)Y[s].d(1);Y.length=Pe.length}if(P[0]&16){Ie=me(i[4].organizations);let s;for(s=0;s<Ie.length;s+=1){const U=Qt(i,Ie,s);Z[s]?Z[s].p(U,P):(Z[s]=ma(U),Z[s].c(),Z[s].m(e,null))}for(;s<Z.length;s+=1)Z[s].d(1);Z.length=Ie.length}},i:dt,o:dt,d(i){i&&(d(t),d(e)),Le(W,i),_e&&_e.d(),ee&&ee.d(),te&&te.d(),ae&&ae.d(),Le(J,i),Le(X,i),Le(Y,i),Le(Z,i),Nt=!1,da(Vt)}}}function Ya(a,t,e){const n=ga("user");let r,h=!1,o,m=Ut(13),c="any",v=ue($e()),y=$e();Re.use($t(m));let w=Ka();w.nameGeneratorSet=v;let f=new Ga,E=Kt(w),H=E.authority;function R(){Re.use($t(m)),w.dominantCulture=null,h?(k(),w.dominantCulture=o,e(6,v=o.generatorSet)):c=="any"?e(6,v=ue($e())):$e().forEach(q=>{q.name==c&&e(6,v=q)}),w.nameGeneratorSet=v,e(4,E=Kt(w)),e(5,H=E.authority)}function k(){for(let q=0;q<n.savedCultures.length;q++)n.savedCultures[q].name===r&&(o=n.savedCultures[q])}function L(){e(2,m=Ut(13)),R()}function z(){m=this.value,e(2,m)}function S(){c=Ft(this),e(3,c),e(8,y)}function V(){h=this.checked,e(1,h)}function ne(){r=Ft(this),e(0,r),e(7,n)}return[r,h,m,c,E,H,v,n,y,f,R,L,z,S,V,ne]}class mn extends va{constructor(t){super(),_a(this,t,Ya,Xa,pa,{},null,[-1,-1])}}export{mn as component};
//# sourceMappingURL=21.31deea95.js.map
