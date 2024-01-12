import{s as pa,a as ua,n as mt,r as da,g as ga}from"../chunks/scheduler.5o8iMP-j.js";import{S as va,i as _a,s as T,e as p,t as _,l as ba,d as c,f as C,c as g,a as R,g as ie,b,m as u,p as Ke,h as x,j as l,u as ut,q as Ve,k as H,n as Oe,H as dt,o as ct,v as ft,x as Mt}from"../chunks/index.EoApDFme.js";import{e as me}from"../chunks/each.-oqiv04n.js";import{i as ue,w as ya,r as Re,b as $t,a as Ft,s as Ut}from"../chunks/index.BP-IY3w8.js";import{a as wa,d as Ta,g as Ca,b as ka}from"../chunks/climates.3jvB98a7.js";import{g as Sa}from"../chunks/fantasy.UGyVbBW-.js";import{e as Ea,c as ye}from"../chunks/characters._BTRwP5J.js";import{g as Ga}from"../chunks/premade_configs.c6DHGnq2.js";import{H as ca,a as Ra,r as Na}from"../chunks/svg.qq3ZVfuH.js";import"../chunks/lodash.vCtjnWuh.js";import{g as gt,a as za,c as Ge,b as Da}from"../chunks/generator_sets.4wEwZ6lw.js";import{t as be,c as ot,a as pt}from"../chunks/index.718X_Gn9.js";import{r as Ha}from"../chunks/dice.xzO0DG26.js";function fa(){let a=ue(wa());a.description=Ta(a);let t=ka();t.climate=a;const e=Ca(t);let n={biome:e,climate:a,description:""};return n.description=`${ue(e.descriptions)} ${ue(e.features)}`,n.description+=" "+n.climate.description,n}function Pa(){let a={name:"kingdom",minTiles:10,maxTiles:50,grantedTitle:{femaleTitle:"Queen",maleTitle:"King",femaleHonorific:"Queen",maleHonorific:"King",hasLands:!0,landName:"Kingdom of",precedence:7},commonality:5,isStandalone:!0,parentType:null},t={name:"empire",minTiles:50,maxTiles:100,grantedTitle:{femaleTitle:"Empress",maleTitle:"Emperor",femaleHonorific:"Empress",maleHonorific:"Emperor",hasLands:!0,landName:"Empire of",precedence:8},commonality:5,isStandalone:!0,parentType:null};return[{name:"earldom",minTiles:2,maxTiles:4,grantedTitle:{femaleTitle:"Earl",maleTitle:"Earl",femaleHonorific:"Lady",maleHonorific:"Lord",hasLands:!0,landName:"Earldom of",precedence:2},commonality:5,isStandalone:!1,parentType:a},{name:"county",minTiles:4,maxTiles:6,grantedTitle:{femaleTitle:"Countess",maleTitle:"Count",femaleHonorific:"Countess",maleHonorific:"Count",hasLands:!0,landName:"County of",precedence:3},commonality:20,isStandalone:!1,parentType:a},{name:"barony",minTiles:6,maxTiles:8,grantedTitle:{femaleTitle:"Baroness",maleTitle:"Baron",femaleHonorific:"Baroness",maleHonorific:"Baron",hasLands:!0,landName:"Barony of",precedence:4},commonality:10,isStandalone:!1,parentType:a},{name:"duchy",minTiles:8,maxTiles:10,grantedTitle:{femaleTitle:"Duchess",maleTitle:"Duke",femaleHonorific:"Duchess",maleHonorific:"Duke",hasLands:!0,landName:"Duchy of",precedence:5},commonality:5,isStandalone:!1,parentType:a},{name:"grand duchy",minTiles:10,maxTiles:12,grantedTitle:{femaleTitle:"Grand Duchess",maleTitle:"Grand Duke",femaleHonorific:"Grand Duchess",maleHonorific:"Grand Duke",hasLands:!0,landName:"Grand Duchy of",precedence:6},commonality:2,isStandalone:!1,parentType:a},{name:"principality",minTiles:12,maxTiles:14,grantedTitle:{femaleTitle:"Princess",maleTitle:"Prince",femaleHonorific:"Princess",maleHonorific:"Prince",hasLands:!0,landName:"Principality of",precedence:7},commonality:2,isStandalone:!1,parentType:a},{name:"province",minTiles:12,maxTiles:14,grantedTitle:{femaleTitle:"Governor",maleTitle:"Governor",femaleHonorific:"Governor",maleHonorific:"Governor",hasLands:!0,landName:"Province of",precedence:7},commonality:1,isStandalone:!1,parentType:t},a,t]}function ht(a){let t=ya(a.realmTypes);if(a.nameGeneratorSet.country===null)throw new Error("RealmGenerator requires a country name generator set.");let e=a.nameGeneratorSet.country.generate(1)[0];e=`the ${be(t.name)} of ${e}`;let i=new ca().generate(),m=La(t,a.nameGeneratorSet);return{name:e,adjective:e,description:"",heraldry:i,authority:m,grantedTitle:t.grantedTitle,tiles:[],claims:[],parent:-1,realmType:t}}function Pt(){return{nameGeneratorSet:gt("human",za()),realmTypes:Pa(),mapWidth:40,mapHeight:30,mapTiles:[]}}function La(a,t){let e=Ga();e.ageCategoryNames=["adult"],e.familyNameGenerator=t.family,e.femaleNameGenerator=t.female,e.maleNameGenerator=t.male,e.useAdaptiveNames=!1;let n=Ea(e);n.titles.push(a.grantedTitle);let i=new ca;return n.heraldry=i.generate(),n}const Ia={name:"borough",minSize:1e4,maxSize:19999,sizeClass:"medium",possibleDescriptions:["The buildings here are tall and tightly packed together, with narrow streets winding between them.","This borough is divided into several distinct districts, each with its own unique architecture and atmosphere.","The center of this borough is dominated by a massive marketplace, surrounded by a ring of shops and residences.","There are many factories and mills in this borough, with tall chimneys belching smoke into the air.","The buildings here are mostly made of stone or brick, and are quite ornate and impressive.","The streets of this borough are lined with small shops and stalls, selling all manner of goods.","There are many parks and gardens scattered throughout this borough, offering a welcome respite from the hustle and bustle of city life.","The buildings here are a mix of old and new, with modern high-rises standing next to ancient, crumbling ruins.","This borough is known for its grand architecture, with many magnificent cathedrals and government buildings."]},Oa={name:"city",minSize:2e4,maxSize:49999,sizeClass:"large",possibleDescriptions:["This city is built around a grand castle, with towers that pierce the sky and walls that have withstood the test of time.","The streets of this city are lined with buildings of every shape and size, from towering spires to humble cottages.","This city is a marvel of engineering, with aqueducts, bridges, and tunnels that connect its various districts.","The buildings in this city are a testament to the skill and artistry of its craftsmen, with intricate carvings and decorations adorning their facades.","This city is surrounded by a sturdy wall, with guard towers and gates that keep out unwanted visitors.","The center of this city is dominated by a grand cathedral, with stained-glass windows and soaring arches that inspire awe in all who see them.","The main square of this city is a bustling hub of activity, with market stalls and street performers vying for attention.","The winding alleys of this city are lit by lanterns at night, creating a mysterious and romantic atmosphere.","This city is a patchwork of different architectural styles, with each district showcasing its own unique character and flair."]},Va={name:"hamlet",minSize:10,maxSize:49,sizeClass:"small",possibleDescriptions:["Buildings here are scattered and small, with thatched roofs and walls of rough-hewn timber.","The farms here are clustered together, their fields carefully tended and surrounded by low stone walls.","There are only a handful of farms scattered around a single community building here, which serves as the center of local life.","The hamlet is surrounded by wilderness, with a few clearings where buildings and fields have been established.","The buildings in the hamlet are simple but sturdy, with chimneys belching smoke into the crisp morning air.","This hamlet is situated on a hilltop, with commanding views of the surrounding countryside.","The hamlet consists of a small cluster of houses and barns, with a narrow dirt road leading off into the distance.","There is a small stream running through the hamlet, providing water for the villagers and their crops."]},ja={name:"metropolis",minSize:5e4,maxSize:3e6,sizeClass:"large",possibleDescriptions:["This grand metropolis is a center of culture and learning, with renowned universities and libraries that draw scholars from across the land.","The winding streets of this ancient metropolis are lined with taverns, inns, and shops selling all manner of exotic goods.","Despite its immense size, this metropolis is a tightly-knit community where everyone knows their neighbors and traditions are deeply rooted.","This sprawling metropolis is surrounded by towering walls and fortified gates, protecting it from invaders and marauders.","The grand castle at the heart of this metropolis is the seat of the ruling monarch, and its knights are famed for their valor and chivalry.","This metropolis is a hub of trade and commerce, with bustling markets and guilds that wield immense power.","The streets of this metropolis are lit by torches and lined with ancient stone buildings, some of which have stood for centuries.","This metropolis is renowned for its skilled craftsmen, who produce exquisite works of art and fine weaponry.","The dark alleys and hidden courtyards of this metropolis are home to thieves, assassins, and other unsavory characters.","Despite the challenges it faces, this metropolis is a beacon of hope and civilization in a world full of danger and chaos."]},Ba={name:"town",minSize:500,maxSize:9999,sizeClass:"medium",possibleDescriptions:["There are multiple inns and taverns here, with brightly colored signs swinging in the breeze.","The town is surrounded by fields and orchards, with the smell of ripe fruit and vegetables wafting through the air.","There is a city hall, a town square, and a number of stores and shops, all housed in buildings of stone and wood.","The town is located on the banks of a river, with a busy dock where barges unload their wares.","The buildings in the town are tightly packed together, with narrow streets winding between them.","The town is known for its skilled craftsmen, and their workshops and forges ring with the sound of hammers on metal.","Many farms surround a dense core of community buildings here.","The town is famous for its annual fair, where vendors from all over the kingdom come to sell their wares.","The town is dominated by a tall clock tower, which chimes the hour with a melodious tune.","Despite its size, the town is peaceful and orderly, with a watchful eye kept on outsiders who might cause trouble."]},qa={name:"village",minSize:50,maxSize:499,sizeClass:"small",possibleDescriptions:["There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it. Smoke rises from the chimneys, and the sound of animals can be heard in the distance.","This is a dense collection of farms with a number of communal buildings in the center, including a mill and a chapel. The farms are surrounded by low stone walls to protect them from marauding animals.","A knot of communal buildings marks the center of this village, including a town hall and a small market. The farms radiate out in a rough circle around it, with a stream running through the center of the village.","The village is nestled in a valley, surrounded by rolling hills covered in fields of wheat and barley. A small stream winds through the center of town, and the air is fragrant with the smell of fresh-baked bread.","The village is built on the side of a hill, with narrow paths winding between the houses. The buildings are made of wood and thatch, and are tightly packed together for warmth and protection from the wind.","The village is known for its skilled weavers, and the sound of looms can be heard from many of the houses. The weavers work with colorful threads, creating intricate patterns in their textiles.","Despite its small size, the village has a strong sense of community, with neighbors looking out for one another and coming together for festivals and celebrations throughout the year."]};function Aa(){return[Va,qa,Ba,Ia,Oa,ja]}function Ma(a){const t=Aa();let e=[];for(let n=0;n<t.length;n++)t[n].sizeClass==a&&e.push(t[n]);return e}function $a(a){return ue(a.possibleDescriptions)}function Fa(a){return Re.int(a.minSize,a.maxSize)}function Lt(a){const t=a.nameGenerator!==null?a.nameGenerator.generate(1)[0]:"Settlement",e=ue(Ma(a.size)),n={name:t,category:e,environment:a.environment,description:"",population:Fa(e),prosperity:Ha("2d6")};return n.description=Ka(n),n}function Ua(){let a=fa(),e=gt("fantasy",Ge()).town;return{environment:a,nameGenerator:e,size:"any"}}function Ka(a){let t=ue(["{name} is a {category} of {population} people.","The {category} of {name} has {population} people."]);return t=t.replace("{category}",a.category.name),t=t.replace("{population}",new Intl.NumberFormat().format(a.population)),t=t.replace("{name}",a.name),t+=" "+$a(a.category),t+=" "+Qa(a.prosperity),t+=" "+Wa(),t+=" "+ue(a.environment.biome.features),t}function Qa(a){let t=["The people here","Most people here","Folks here","Most folks here","People here"],e=[];a<4?e=["have little more than what they need to survive","struggle to make ends meet","struggle to have enough to survive"]:a<8?e=["have enough to meet their needs","have just enough to meet their needs","seem to be doing well","have their needs met"]:e=["have more wealth than most","are prosperous","have more than they need"];let n=[];for(let i=0;i<t.length;i++)for(let m=0;m<e.length;m++)n.push(`${t[i]} ${e[m]}.`);return ue(n)}function Wa(){let a=["The people are known for","The people are regarded as","Folk here have a reputation for","People here are regarded as","The folk here are known for","They are known for","They are well known for","They are sometimes known for","Some other places regard the people here as","Some places regard the people here as","Some places regard them as","Some regard them as","Some folks regard them as"],t=["being aloof","being suspicious of others","being suspicious of outsiders","being friendly and open","being friendly but devious","being friendly","being greedy","being altruistic","being trusting","being mistrustful","being miserly","being obsessed with status","being hardworking","being devious","being unfriendly","being trustworthy","being lazy","spending too much time making merry","spending too much time slacking off","working hard","working too hard","being unruly","being belligerent"],e=[];for(let n=0;n<a.length;n++)for(let i=0;i<t.length;i++)e.push(`${a[n]} ${t[i]}.`);return ue(e)}function Kt(a){let t={name:"",environment:{},description:"",dominantCulture:{},settlements:[],mainRealm:0,realms:[],authority:{},organizations:[],settlementTiles:[],terrainTiles:[]},e;a.dominantCulture!=null?(t.dominantCulture=a.dominantCulture,e=t.dominantCulture.generatorSet):e=a.nameGeneratorSet,t.environment=fa(),t.settlements=Ya(t.environment,e),t.organizations=Xa(),t.description=t.environment.description;let n=Pt();n.nameGeneratorSet=e;let i=ht(n);if(t.realms.push(i),t.mainRealm=0,!i.realmType.isStandalone){let o=Pt();if(o.nameGeneratorSet=n.nameGeneratorSet,i.realmType.parentType==null)throw new Error("Realm type has no parent type.");o.realmTypes=[i.realmType.parentType];let h=ht(o);t.realms.push(h),i.parent=1}let m=Re.int(a.minRealms,a.maxRealms);for(let o=0;o<m;o++){if(n.nameGeneratorSet=gt("fantasy",Da()),$t(100)>70){let d=ue(Ge());n.nameGeneratorSet=d}let h=ht(n);if(!h.realmType.isStandalone)if($t(100)>50)h.parent=i.parent;else{let d=Pt();if(h.realmType.parentType==null)throw new Error("Realm type has no parent type.");d.realmTypes=[h.realmType.parentType],d.nameGeneratorSet=n.nameGeneratorSet;let v=ht(d);t.realms.push(v),h.parent=t.realms.length-1}t.realms.push(h)}return t.authority=i.authority,t.name=i.name,t}function Ja(){return{nameGeneratorSet:gt("fantasy",Ge()),dominantCulture:null,mapWidth:40,mapHeight:30,minRealms:2,maxRealms:4}}function Xa(){const a=[],t=Re.int(1,3);for(let e=0;e<t;e++)a.push(Sa());return a}function Ya(a,t){let e=Ua();e.nameGenerator=t.town,e.size="large",e.environment=a;const n=Lt(e),i=Re.int(1,3),m=Re.int(3,5),o=[];n.description+=" This is the capital of the region.",o.push(n);for(let h=0;h<i;h++){e.size="medium";const d=Lt(e);o.push(d)}for(let h=0;h<m;h++){e.size="small";const d=Lt(e);o.push(d)}return o}function Qt(a,t,e){const n=a.slice();return n[19]=t[e],n}function Wt(a,t,e){const n=a.slice();return n[22]=t[e],n}function Jt(a,t,e){const n=a.slice();return n[25]=t[e],n[27]=e,n}function Xt(a,t,e){const n=a.slice();return n[25]=t[e],n[27]=e,n}function Yt(a,t,e){const n=a.slice();return n[29]=t[e],n}function Zt(a,t,e){const n=a.slice();return n[6]=t[e],n}function xt(a){let t,e=a[6].name+"",n;return{c(){t=p("option"),n=_(e),this.h()},l(i){t=g(i,"OPTION",{});var m=R(t);n=b(m,e),m.forEach(c),this.h()},h(){t.__value=a[6].name,Ke(t,t.__value)},m(i,m){x(i,t,m),l(t,n)},p:mt,d(i){i&&c(t)}}}function Za(a){let t,e,n="Use a saved culture for naming?",i,m,o,h,d,v="Select a saved culture to load",y,w,f,E,D=me(a[7].savedCultures),G=[];for(let k=0;k<D.length;k+=1)G[k]=ea(Yt(a,D,k));return{c(){t=p("div"),e=p("label"),e.textContent=n,i=T(),m=p("input"),o=T(),h=p("div"),d=p("label"),d.textContent=v,y=T(),w=p("select");for(let k=0;k<G.length;k+=1)G[k].c();this.h()},l(k){t=g(k,"DIV",{class:!0});var I=R(t);e=g(I,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ie(e)!=="svelte-14j9oxd"&&(e.textContent=n),i=C(I),m=g(I,"INPUT",{type:!0,name:!0,id:!0,class:!0}),I.forEach(c),o=C(k),h=g(k,"DIV",{class:!0});var N=R(h);d=g(N,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ie(d)!=="svelte-32ylm8"&&(d.textContent=v),y=C(N),w=g(N,"SELECT",{class:!0});var S=R(w);for(let j=0;j<G.length;j+=1)G[j].l(S);S.forEach(c),N.forEach(c),this.h()},h(){u(e,"for","useSavedCulture"),u(e,"class","svelte-8c1n7g"),u(m,"type","checkbox"),u(m,"name","useSavedCulture"),u(m,"id","useSavedCulture"),u(m,"class","svelte-8c1n7g"),u(t,"class","input-group svelte-8c1n7g"),u(d,"for","savedCulture"),u(d,"class","svelte-8c1n7g"),u(w,"class","svelte-8c1n7g"),a[0]===void 0&&ua(()=>a[15].call(w)),u(h,"class","input-group svelte-8c1n7g")},m(k,I){x(k,t,I),l(t,e),l(t,i),l(t,m),m.checked=a[1],x(k,o,I),x(k,h,I),l(h,d),l(h,y),l(h,w);for(let N=0;N<G.length;N+=1)G[N]&&G[N].m(w,null);ut(w,a[0],!0),f||(E=[Ve(m,"change",a[14]),Ve(w,"change",a[15])],f=!0)},p(k,I){if(I[0]&2&&(m.checked=k[1]),I[0]&128){D=me(k[7].savedCultures);let N;for(N=0;N<D.length;N+=1){const S=Yt(k,D,N);G[N]?G[N].p(S,I):(G[N]=ea(S),G[N].c(),G[N].m(w,null))}for(;N<G.length;N+=1)G[N].d(1);G.length=D.length}I[0]&129&&ut(w,k[0])},d(k){k&&(c(t),c(o),c(h)),Oe(G,k),f=!1,da(E)}}}function ea(a){let t,e=a[29].name+"",n;return{c(){t=p("option"),n=_(e),this.h()},l(i){t=g(i,"OPTION",{});var m=R(t);n=b(m,e),m.forEach(c),this.h()},h(){t.__value=a[29].name,Ke(t,t.__value)},m(i,m){x(i,t,m),l(t,n)},p:mt,d(i){i&&c(t)}}}function ta(a){let t,e,n=a[4].dominantCulture.name+"",i,m;return{c(){t=p("p"),e=_("The dominant culture here is the "),i=_(n),m=_("."),this.h()},l(o){t=g(o,"P",{class:!0});var h=R(t);e=b(h,"The dominant culture here is the "),i=b(h,n),m=b(h,"."),h.forEach(c),this.h()},h(){u(t,"class","svelte-8c1n7g")},m(o,h){x(o,t,h),l(t,e),l(t,i),l(t,m)},p(o,h){h[0]&16&&n!==(n=o[4].dominantCulture.name+"")&&H(i,n)},d(o){o&&c(t)}}}function aa(a){let t,e,n=be(a[4].name)+"",i,m,o=a[4].realms[a[4].realms[a[4].mainRealm].parent].name+"",h,d,v,y=a[9].render(a[4].realms[a[4].realms[a[4].mainRealm].parent].heraldry.device,20,22)+"",w;return{c(){t=p("div"),e=p("p"),i=_(n),m=_(" is part of "),h=_(o),d=T(),v=new dt(!1),w=_("."),this.h()},l(f){t=g(f,"DIV",{class:!0});var E=R(t);e=g(E,"P",{class:!0});var D=R(e);i=b(D,n),m=b(D," is part of "),h=b(D,o),d=C(D),v=ct(D,!1),w=b(D,"."),D.forEach(c),E.forEach(c),this.h()},h(){v.a=w,u(e,"class","svelte-8c1n7g"),u(t,"class","parent-realm svelte-8c1n7g")},m(f,E){x(f,t,E),l(t,e),l(e,i),l(e,m),l(e,h),l(e,d),v.m(y,e),l(e,w)},p(f,E){E[0]&16&&n!==(n=be(f[4].name)+"")&&H(i,n),E[0]&16&&o!==(o=f[4].realms[f[4].realms[f[4].mainRealm].parent].name+"")&&H(h,o),E[0]&16&&y!==(y=f[9].render(f[4].realms[f[4].realms[f[4].mainRealm].parent].heraldry.device,20,22)+"")&&v.p(y)},d(f){f&&c(t)}}}function na(a){let t,e='<img alt="Ruler heraldry" id="ruler-arms" class="svelte-8c1n7g"/>';return{c(){t=p("div"),t.innerHTML=e,this.h()},l(n){t=g(n,"DIV",{class:!0,"data-svelte-h":!0}),ie(t)!=="svelte-1oepa58"&&(t.innerHTML=e),this.h()},h(){u(t,"class","ruler-arms svelte-8c1n7g")},m(n,i){x(n,t,i)},d(n){n&&c(t)}}}function la(a){let t,e,n,i=a[9].render(a[25].heraldry.device,80,88)+"",m,o,h,d,v=be(a[25].name)+"",y,w,f,E,D=ye(a[25].authority)+"",G,k,I=a[25].authority.name+"",N,S,j=pt(a[25].authority.species.adjective)+"",ne,q,ee=a[25].authority.species.adjective+"",A,de,re=a[25].authority.ageCategory.noun+"",M,ce,fe,O=a[4].realms[a[4].mainRealm].parent==a[27]&&sa(a);return{c(){t=p("div"),e=p("div"),n=new dt(!1),m=T(),o=p("div"),h=p("p"),d=p("strong"),y=_(v),w=T(),f=p("p"),E=_("Ruled by "),G=_(D),k=T(),N=_(I),S=_(", "),ne=_(j),q=T(),A=_(ee),de=T(),M=_(re),ce=_("."),fe=T(),O&&O.c(),this.h()},l(P){t=g(P,"DIV",{class:!0});var B=R(t);e=g(B,"DIV",{class:!0});var oe=R(e);n=ct(oe,!1),oe.forEach(c),m=C(B),o=g(B,"DIV",{class:!0});var K=R(o);h=g(K,"P",{class:!0});var he=R(h);d=g(he,"STRONG",{class:!0});var V=R(d);y=b(V,v),V.forEach(c),he.forEach(c),w=C(K),f=g(K,"P",{class:!0});var z=R(f);E=b(z,"Ruled by "),G=b(z,D),k=C(z),N=b(z,I),S=b(z,", "),ne=b(z,j),q=C(z),A=b(z,ee),de=C(z),M=b(z,re),ce=b(z,"."),z.forEach(c),fe=C(K),O&&O.l(K),K.forEach(c),B.forEach(c),this.h()},h(){n.a=null,u(e,"class","neighbor-arms svelte-8c1n7g"),u(d,"class","svelte-8c1n7g"),u(h,"class","svelte-8c1n7g"),u(f,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","neighbor svelte-8c1n7g")},m(P,B){x(P,t,B),l(t,e),n.m(i,e),l(t,m),l(t,o),l(o,h),l(h,d),l(d,y),l(o,w),l(o,f),l(f,E),l(f,G),l(f,k),l(f,N),l(f,S),l(f,ne),l(f,q),l(f,A),l(f,de),l(f,M),l(f,ce),l(o,fe),O&&O.m(o,null)},p(P,B){B[0]&16&&i!==(i=P[9].render(P[25].heraldry.device,80,88)+"")&&n.p(i),B[0]&16&&v!==(v=be(P[25].name)+"")&&H(y,v),B[0]&16&&D!==(D=ye(P[25].authority)+"")&&H(G,D),B[0]&16&&I!==(I=P[25].authority.name+"")&&H(N,I),B[0]&16&&j!==(j=pt(P[25].authority.species.adjective)+"")&&H(ne,j),B[0]&16&&ee!==(ee=P[25].authority.species.adjective+"")&&H(A,ee),B[0]&16&&re!==(re=P[25].authority.ageCategory.noun+"")&&H(M,re),P[4].realms[P[4].mainRealm].parent==P[27]?O?O.p(P,B):(O=sa(P),O.c(),O.m(o,null)):O&&(O.d(1),O=null)},d(P){P&&c(t),O&&O.d()}}}function sa(a){let t,e=be(a[4].realms[a[4].mainRealm].name)+"",n,i;return{c(){t=p("p"),n=_(e),i=_(" is part of this."),this.h()},l(m){t=g(m,"P",{class:!0});var o=R(t);n=b(o,e),i=b(o," is part of this."),o.forEach(c),this.h()},h(){u(t,"class","svelte-8c1n7g")},m(m,o){x(m,t,o),l(t,n),l(t,i)},p(m,o){o[0]&16&&e!==(e=be(m[4].realms[m[4].mainRealm].name)+"")&&H(n,e)},d(m){m&&c(t)}}}function ra(a){let t,e=a[27]!=a[4].mainRealm&&a[25].parent==-1&&la(a);return{c(){e&&e.c(),t=ft()},l(n){e&&e.l(n),t=ft()},m(n,i){e&&e.m(n,i),x(n,t,i)},p(n,i){n[27]!=n[4].mainRealm&&n[25].parent==-1?e?e.p(n,i):(e=la(n),e.c(),e.m(t.parentNode,t)):e&&(e.d(1),e=null)},d(n){n&&c(t),e&&e.d(n)}}}function ia(a){let t,e,n,i=a[9].render(a[25].heraldry.device,80,88)+"",m,o,h,d,v=be(a[25].name)+"",y,w,f=a[4].realms[a[25].parent].name+"",E,D,G,k=a[9].render(a[4].realms[a[25].parent].heraldry.device,20,22)+"",I,N,S,j,ne=ye(a[25].authority)+"",q,ee,A=a[25].authority.name+"",de,re,M=pt(a[25].authority.species.adjective)+"",ce,fe,O=a[25].authority.species.adjective+"",P,B,oe=a[25].authority.ageCategory.noun+"",K,he;return{c(){t=p("div"),e=p("div"),n=new dt(!1),m=T(),o=p("div"),h=p("p"),d=p("strong"),y=_(v),w=_(", part of "),E=_(f),D=T(),G=new dt(!1),I=_("."),N=T(),S=p("p"),j=_("Ruled by "),q=_(ne),ee=T(),de=_(A),re=_(", "),ce=_(M),fe=T(),P=_(O),B=T(),K=_(oe),he=_("."),this.h()},l(V){t=g(V,"DIV",{class:!0});var z=R(t);e=g(z,"DIV",{class:!0});var we=R(e);n=ct(we,!1),we.forEach(c),m=C(z),o=g(z,"DIV",{class:!0});var ge=R(o);h=g(ge,"P",{class:!0});var $=R(h);d=g($,"STRONG",{class:!0});var Ne=R(d);y=b(Ne,v),Ne.forEach(c),w=b($,", part of "),E=b($,f),D=C($),G=ct($,!1),I=b($,"."),$.forEach(c),N=C(ge),S=g(ge,"P",{class:!0});var Q=R(S);j=b(Q,"Ruled by "),q=b(Q,ne),ee=C(Q),de=b(Q,A),re=b(Q,", "),ce=b(Q,M),fe=C(Q),P=b(Q,O),B=C(Q),K=b(Q,oe),he=b(Q,"."),Q.forEach(c),ge.forEach(c),z.forEach(c),this.h()},h(){n.a=null,u(e,"class","neighbor-arms svelte-8c1n7g"),u(d,"class","svelte-8c1n7g"),G.a=I,u(h,"class","svelte-8c1n7g"),u(S,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","neighbor svelte-8c1n7g")},m(V,z){x(V,t,z),l(t,e),n.m(i,e),l(t,m),l(t,o),l(o,h),l(h,d),l(d,y),l(h,w),l(h,E),l(h,D),G.m(k,h),l(h,I),l(o,N),l(o,S),l(S,j),l(S,q),l(S,ee),l(S,de),l(S,re),l(S,ce),l(S,fe),l(S,P),l(S,B),l(S,K),l(S,he)},p(V,z){z[0]&16&&i!==(i=V[9].render(V[25].heraldry.device,80,88)+"")&&n.p(i),z[0]&16&&v!==(v=be(V[25].name)+"")&&H(y,v),z[0]&16&&f!==(f=V[4].realms[V[25].parent].name+"")&&H(E,f),z[0]&16&&k!==(k=V[9].render(V[4].realms[V[25].parent].heraldry.device,20,22)+"")&&G.p(k),z[0]&16&&ne!==(ne=ye(V[25].authority)+"")&&H(q,ne),z[0]&16&&A!==(A=V[25].authority.name+"")&&H(de,A),z[0]&16&&M!==(M=pt(V[25].authority.species.adjective)+"")&&H(ce,M),z[0]&16&&O!==(O=V[25].authority.species.adjective+"")&&H(P,O),z[0]&16&&oe!==(oe=V[25].authority.ageCategory.noun+"")&&H(K,oe)},d(V){V&&c(t)}}}function oa(a){let t,e=a[27]!=a[4].mainRealm&&a[27]!=a[4].realms[a[4].mainRealm].parent&&a[25].parent!=-1&&ia(a);return{c(){e&&e.c(),t=ft()},l(n){e&&e.l(n),t=ft()},m(n,i){e&&e.m(n,i),x(n,t,i)},p(n,i){n[27]!=n[4].mainRealm&&n[27]!=n[4].realms[n[4].mainRealm].parent&&n[25].parent!=-1?e?e.p(n,i):(e=ia(n),e.c(),e.m(t.parentNode,t)):e&&(e.d(1),e=null)},d(n){n&&c(t),e&&e.d(n)}}}function ha(a){let t,e,n=a[22].name+"",i,m,o,h=a[22].description+"",d;return{c(){t=p("article"),e=p("h5"),i=_(n),m=T(),o=p("p"),d=_(h),this.h()},l(v){t=g(v,"ARTICLE",{class:!0});var y=R(t);e=g(y,"H5",{class:!0});var w=R(e);i=b(w,n),w.forEach(c),m=C(y),o=g(y,"P",{class:!0});var f=R(o);d=b(f,h),f.forEach(c),y.forEach(c),this.h()},h(){u(e,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","svelte-8c1n7g")},m(v,y){x(v,t,y),l(t,e),l(e,i),l(t,m),l(t,o),l(o,d)},p(v,y){y[0]&16&&n!==(n=v[22].name+"")&&H(i,n),y[0]&16&&h!==(h=v[22].description+"")&&H(d,h)},d(v){v&&c(t)}}}function ma(a){let t,e,n=a[19].name+"",i,m,o,h=a[19].description+"",d,v;return{c(){t=p("article"),e=p("h5"),i=_(n),m=T(),o=p("p"),d=_(h),v=T(),this.h()},l(y){t=g(y,"ARTICLE",{class:!0});var w=R(t);e=g(w,"H5",{class:!0});var f=R(e);i=b(f,n),f.forEach(c),m=C(w),o=g(w,"P",{class:!0});var E=R(o);d=b(E,h),E.forEach(c),v=C(w),w.forEach(c),this.h()},h(){u(e,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(t,"class","svelte-8c1n7g")},m(y,w){x(y,t,w),l(t,e),l(e,i),l(t,m),l(t,o),l(o,d),l(t,v)},p(y,w){w[0]&16&&n!==(n=y[19].name+"")&&H(i,n),w[0]&16&&h!==(h=y[19].description+"")&&H(d,h)},d(y){y&&c(t)}}}function xa(a){let t,e,n,i="Region Generator",m,o,h="Generate fantasy regions.",d,v,y,w="Random Seed",f,E,D,G,k,I="Name Set",N,S,j,ne="any",q,ee,A,de="Generate From Seed",re,M,ce="Random Seed (and Generate)",fe,O,P=ot(a[4].name)+"",B,oe,K,he=a[4].description+"",V,z,we,ge,$,Ne,Q=ye(a[5])+"",Qe,vt,je=a[5].firstName+"",We,_t,Be=a[5].lastName+"",Je,bt,ve,Xe,ze,se,qe=ot(a[4].name)+"",Ye,yt,Ae=ye(a[5])+"",Ze,wt,Me=a[5].firstName+"",xe,Tt,$e=a[5].lastName+"",et,Ct,Fe=a[5].description+"",tt,kt,Te,It="Nearby Sovereignties",St,at,Ce,Ot="Nearby Realms",Et,nt,ke,Gt,Ue=a[4].name+"",lt,Rt,st,Se,Vt="Notable Organizations",Nt,zt,jt,De=me(a[8]),W=[];for(let r=0;r<De.length;r+=1)W[r]=xt(Zt(a,De,r));let _e=a[7].savedCultures!==void 0&&a[7].savedCultures.length>0&&Za(a),te=a[4].dominantCulture.name!==void 0&&ta(a),ae=a[4].realms[a[4].mainRealm].parent!=-1&&aa(a),le=a[5].heraldry!==null&&na(),He=me(a[4].realms),J=[];for(let r=0;r<He.length;r+=1)J[r]=ra(Xt(a,He,r));let Pe=me(a[4].realms),X=[];for(let r=0;r<Pe.length;r+=1)X[r]=oa(Jt(a,Pe,r));let Le=me(a[4].settlements),Y=[];for(let r=0;r<Le.length;r+=1)Y[r]=ha(Wt(a,Le,r));let Ie=me(a[4].organizations),Z=[];for(let r=0;r<Ie.length;r+=1)Z[r]=ma(Qt(a,Ie,r));return{c(){t=T(),e=p("section"),n=p("h1"),n.textContent=i,m=T(),o=p("p"),o.textContent=h,d=T(),v=p("div"),y=p("label"),y.textContent=w,f=T(),E=p("input"),D=T(),G=p("div"),k=p("label"),k.textContent=I,N=T(),S=p("select"),j=p("option"),j.textContent=ne;for(let r=0;r<W.length;r+=1)W[r].c();q=T(),_e&&_e.c(),ee=T(),A=p("button"),A.textContent=de,re=T(),M=p("button"),M.textContent=ce,fe=T(),O=p("h2"),B=_(P),oe=T(),K=p("p"),V=_(he),z=T(),te&&te.c(),we=T(),ae&&ae.c(),ge=T(),$=p("h3"),Ne=_("Ruler: "),Qe=_(Q),vt=T(),We=_(je),_t=T(),Je=_(Be),bt=T(),ve=p("div"),le&&le.c(),Xe=T(),ze=p("div"),se=p("p"),Ye=_(qe),yt=_(" is ruled by "),Ze=_(Ae),wt=T(),xe=_(Me),Tt=T(),et=_($e),Ct=_(". "),tt=_(Fe),kt=T(),Te=p("h3"),Te.textContent=It,St=T();for(let r=0;r<J.length;r+=1)J[r].c();at=T(),Ce=p("h3"),Ce.textContent=Ot,Et=T();for(let r=0;r<X.length;r+=1)X[r].c();nt=T(),ke=p("h3"),Gt=_("Notable Settlements in "),lt=_(Ue),Rt=T();for(let r=0;r<Y.length;r+=1)Y[r].c();st=T(),Se=p("h3"),Se.textContent=Vt,Nt=T();for(let r=0;r<Z.length;r+=1)Z[r].c();this.h()},l(r){ba("svelte-1w8gppc",document.head).forEach(c),t=C(r),e=g(r,"SECTION",{class:!0});var s=R(e);n=g(s,"H1",{class:!0,"data-svelte-h":!0}),ie(n)!=="svelte-qth4ep"&&(n.textContent=i),m=C(s),o=g(s,"P",{class:!0,"data-svelte-h":!0}),ie(o)!=="svelte-pq4136"&&(o.textContent=h),d=C(s),v=g(s,"DIV",{class:!0});var F=R(v);y=g(F,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ie(y)!=="svelte-1akft3f"&&(y.textContent=w),f=C(F),E=g(F,"INPUT",{type:!0,name:!0,id:!0,class:!0}),F.forEach(c),D=C(s),G=g(s,"DIV",{class:!0});var rt=R(G);k=g(rt,"LABEL",{for:!0,class:!0,"data-svelte-h":!0}),ie(k)!=="svelte-1mjeby7"&&(k.textContent=I),N=C(rt),S=g(rt,"SELECT",{name:!0,id:!0,class:!0});var Dt=R(S);j=g(Dt,"OPTION",{"data-svelte-h":!0}),ie(j)!=="svelte-1j2tppc"&&(j.textContent=ne);for(let U=0;U<W.length;U+=1)W[U].l(Dt);Dt.forEach(c),rt.forEach(c),q=C(s),_e&&_e.l(s),ee=C(s),A=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),ie(A)!=="svelte-1u7zbd5"&&(A.textContent=de),re=C(s),M=g(s,"BUTTON",{class:!0,"data-svelte-h":!0}),ie(M)!=="svelte-192mxrq"&&(M.textContent=ce),fe=C(s),O=g(s,"H2",{class:!0});var Bt=R(O);B=b(Bt,P),Bt.forEach(c),oe=C(s),K=g(s,"P",{class:!0});var qt=R(K);V=b(qt,he),qt.forEach(c),z=C(s),te&&te.l(s),we=C(s),ae&&ae.l(s),ge=C(s),$=g(s,"H3",{class:!0});var Ee=R($);Ne=b(Ee,"Ruler: "),Qe=b(Ee,Q),vt=C(Ee),We=b(Ee,je),_t=C(Ee),Je=b(Ee,Be),Ee.forEach(c),bt=C(s),ve=g(s,"DIV",{class:!0});var it=R(ve);le&&le.l(it),Xe=C(it),ze=g(it,"DIV",{class:!0});var At=R(ze);se=g(At,"P",{class:!0});var pe=R(se);Ye=b(pe,qe),yt=b(pe," is ruled by "),Ze=b(pe,Ae),wt=C(pe),xe=b(pe,Me),Tt=C(pe),et=b(pe,$e),Ct=b(pe,". "),tt=b(pe,Fe),pe.forEach(c),At.forEach(c),it.forEach(c),kt=C(s),Te=g(s,"H3",{class:!0,"data-svelte-h":!0}),ie(Te)!=="svelte-1d5axrk"&&(Te.textContent=It),St=C(s);for(let U=0;U<J.length;U+=1)J[U].l(s);at=C(s),Ce=g(s,"H3",{class:!0,"data-svelte-h":!0}),ie(Ce)!=="svelte-p9np5t"&&(Ce.textContent=Ot),Et=C(s);for(let U=0;U<X.length;U+=1)X[U].l(s);nt=C(s),ke=g(s,"H3",{class:!0});var Ht=R(ke);Gt=b(Ht,"Notable Settlements in "),lt=b(Ht,Ue),Ht.forEach(c),Rt=C(s);for(let U=0;U<Y.length;U+=1)Y[U].l(s);st=C(s),Se=g(s,"H3",{class:!0,"data-svelte-h":!0}),ie(Se)!=="svelte-11j2hih"&&(Se.textContent=Vt),Nt=C(s);for(let U=0;U<Z.length;U+=1)Z[U].l(s);s.forEach(c),this.h()},h(){document.title="Region Generator | Iron Arachne",u(n,"class","svelte-8c1n7g"),u(o,"class","svelte-8c1n7g"),u(y,"for","seed"),u(y,"class","svelte-8c1n7g"),u(E,"type","text"),u(E,"name","seed"),u(E,"id","seed"),u(E,"class","svelte-8c1n7g"),u(v,"class","input-group svelte-8c1n7g"),u(k,"for","names"),u(k,"class","svelte-8c1n7g"),j.__value="any",Ke(j,j.__value),u(S,"name","names"),u(S,"id","nameSet"),u(S,"class","svelte-8c1n7g"),a[3]===void 0&&ua(()=>a[13].call(S)),u(G,"class","input-group svelte-8c1n7g"),u(A,"class","svelte-8c1n7g"),u(M,"class","svelte-8c1n7g"),u(O,"class","svelte-8c1n7g"),u(K,"class","svelte-8c1n7g"),u($,"class","svelte-8c1n7g"),u(se,"class","svelte-8c1n7g"),u(ze,"class","svelte-8c1n7g"),u(ve,"class","ruler svelte-8c1n7g"),u(Te,"class","svelte-8c1n7g"),u(Ce,"class","svelte-8c1n7g"),u(ke,"class","svelte-8c1n7g"),u(Se,"class","svelte-8c1n7g"),u(e,"class","fantasy main svelte-8c1n7g")},m(r,L){x(r,t,L),x(r,e,L),l(e,n),l(e,m),l(e,o),l(e,d),l(e,v),l(v,y),l(v,f),l(v,E),Ke(E,a[2]),l(e,D),l(e,G),l(G,k),l(G,N),l(G,S),l(S,j);for(let s=0;s<W.length;s+=1)W[s]&&W[s].m(S,null);ut(S,a[3],!0),l(e,q),_e&&_e.m(e,null),l(e,ee),l(e,A),l(e,re),l(e,M),l(e,fe),l(e,O),l(O,B),l(e,oe),l(e,K),l(K,V),l(e,z),te&&te.m(e,null),l(e,we),ae&&ae.m(e,null),l(e,ge),l(e,$),l($,Ne),l($,Qe),l($,vt),l($,We),l($,_t),l($,Je),l(e,bt),l(e,ve),le&&le.m(ve,null),l(ve,Xe),l(ve,ze),l(ze,se),l(se,Ye),l(se,yt),l(se,Ze),l(se,wt),l(se,xe),l(se,Tt),l(se,et),l(se,Ct),l(se,tt),l(e,kt),l(e,Te),l(e,St);for(let s=0;s<J.length;s+=1)J[s]&&J[s].m(e,null);l(e,at),l(e,Ce),l(e,Et);for(let s=0;s<X.length;s+=1)X[s]&&X[s].m(e,null);l(e,nt),l(e,ke),l(ke,Gt),l(ke,lt),l(e,Rt);for(let s=0;s<Y.length;s+=1)Y[s]&&Y[s].m(e,null);l(e,st),l(e,Se),l(e,Nt);for(let s=0;s<Z.length;s+=1)Z[s]&&Z[s].m(e,null);zt||(jt=[Ve(E,"input",a[12]),Ve(S,"change",a[13]),Ve(A,"click",a[10]),Ve(M,"click",a[11])],zt=!0)},p(r,L){if(L[0]&4&&E.value!==r[2]&&Ke(E,r[2]),L[0]&256){De=me(r[8]);let s;for(s=0;s<De.length;s+=1){const F=Zt(r,De,s);W[s]?W[s].p(F,L):(W[s]=xt(F),W[s].c(),W[s].m(S,null))}for(;s<W.length;s+=1)W[s].d(1);W.length=De.length}if(L[0]&264&&ut(S,r[3]),r[7].savedCultures!==void 0&&r[7].savedCultures.length>0&&_e.p(r,L),L[0]&16&&P!==(P=ot(r[4].name)+"")&&H(B,P),L[0]&16&&he!==(he=r[4].description+"")&&H(V,he),r[4].dominantCulture.name!==void 0?te?te.p(r,L):(te=ta(r),te.c(),te.m(e,we)):te&&(te.d(1),te=null),r[4].realms[r[4].mainRealm].parent!=-1?ae?ae.p(r,L):(ae=aa(r),ae.c(),ae.m(e,ge)):ae&&(ae.d(1),ae=null),L[0]&32&&Q!==(Q=ye(r[5])+"")&&H(Qe,Q),L[0]&32&&je!==(je=r[5].firstName+"")&&H(We,je),L[0]&32&&Be!==(Be=r[5].lastName+"")&&H(Je,Be),r[5].heraldry!==null?le||(le=na(),le.c(),le.m(ve,Xe)):le&&(le.d(1),le=null),L[0]&16&&qe!==(qe=ot(r[4].name)+"")&&H(Ye,qe),L[0]&32&&Ae!==(Ae=ye(r[5])+"")&&H(Ze,Ae),L[0]&32&&Me!==(Me=r[5].firstName+"")&&H(xe,Me),L[0]&32&&$e!==($e=r[5].lastName+"")&&H(et,$e),L[0]&32&&Fe!==(Fe=r[5].description+"")&&H(tt,Fe),L[0]&528){He=me(r[4].realms);let s;for(s=0;s<He.length;s+=1){const F=Xt(r,He,s);J[s]?J[s].p(F,L):(J[s]=ra(F),J[s].c(),J[s].m(e,at))}for(;s<J.length;s+=1)J[s].d(1);J.length=He.length}if(L[0]&528){Pe=me(r[4].realms);let s;for(s=0;s<Pe.length;s+=1){const F=Jt(r,Pe,s);X[s]?X[s].p(F,L):(X[s]=oa(F),X[s].c(),X[s].m(e,nt))}for(;s<X.length;s+=1)X[s].d(1);X.length=Pe.length}if(L[0]&16&&Ue!==(Ue=r[4].name+"")&&H(lt,Ue),L[0]&16){Le=me(r[4].settlements);let s;for(s=0;s<Le.length;s+=1){const F=Wt(r,Le,s);Y[s]?Y[s].p(F,L):(Y[s]=ha(F),Y[s].c(),Y[s].m(e,st))}for(;s<Y.length;s+=1)Y[s].d(1);Y.length=Le.length}if(L[0]&16){Ie=me(r[4].organizations);let s;for(s=0;s<Ie.length;s+=1){const F=Qt(r,Ie,s);Z[s]?Z[s].p(F,L):(Z[s]=ma(F),Z[s].c(),Z[s].m(e,null))}for(;s<Z.length;s+=1)Z[s].d(1);Z.length=Ie.length}},i:mt,o:mt,d(r){r&&(c(t),c(e)),Oe(W,r),_e&&_e.d(),te&&te.d(),ae&&ae.d(),le&&le.d(),Oe(J,r),Oe(X,r),Oe(Y,r),Oe(Z,r),zt=!1,da(jt)}}}function en(a,t,e){const n=ga("user");let i,m=!1,o,h=Ft(13),d="any",v=ue(Ge()),y=Ge();Re.use(Ut(h));let w=Ja();w.nameGeneratorSet=v;let f=new Ra,E=Kt(w),D=E.authority;function G(){Re.use(Ut(h)),w.dominantCulture=null,m?(k(),w.dominantCulture=o,e(6,v=o.generatorSet)):d=="any"?e(6,v=ue(Ge())):Ge().forEach(ee=>{ee.name==d&&e(6,v=ee)}),w.nameGeneratorSet=v,e(4,E=Kt(w)),e(5,D=E.authority);let q=f.render(D.heraldry.device,200,220);Na(q,200,220,"ruler-arms")}function k(){for(let q=0;q<n.savedCultures.length;q++)n.savedCultures[q].name===i&&(o=n.savedCultures[q])}function I(){e(2,h=Ft(13)),G()}function N(){h=this.value,e(2,h)}function S(){d=Mt(this),e(3,d),e(8,y)}function j(){m=this.checked,e(1,m)}function ne(){i=Mt(this),e(0,i),e(7,n)}return[i,m,h,d,E,D,v,n,y,f,G,I,N,S,j,ne]}class pn extends va{constructor(t){super(),_a(this,t,en,xa,pa,{},null,[-1,-1])}}export{pn as component};
//# sourceMappingURL=21.xH8fL_g_.js.map
