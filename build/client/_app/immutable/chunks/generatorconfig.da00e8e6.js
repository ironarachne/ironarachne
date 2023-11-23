var E=Object.defineProperty;var j=(s,e,t)=>e in s?E(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var a=(s,e,t)=>(j(s,typeof e!="symbol"?e+"":e,t),t);import{i as h,c as $,s as b,r as y}from"./index.ca3c12b8.js";import{b as N,c as f,a as w,u as S}from"./index.a9e36f3b.js";import"./index.00caca3d.js";import{l as u,c as q}from"./characters.ca960b34.js";import{D as J,a as O}from"./domains.4adff5bb.js";import{g as A}from"./premade_configs.f4c12be1.js";import"./lodash.46f0247c.js";import{g as P,c as C,a as M}from"./generator_sets.aadb63f7.js";class F{constructor(e,t,n,r){a(this,"noun");a(this,"target");a(this,"verb");a(this,"strength");this.noun=e,this.verb=t,this.target=n,this.strength=r}}class H{constructor(e){a(this,"strength");this.strength=e}generate(){let e="",t="";return this.strength==-1?(e=h(["dislikes","distrusts","mistrusts","is annoyed by"]),t="enemy"):this.strength==-2?(e=h(["fears","hates","loathes","can't stand"]),t="enemy"):this.strength==0?(e=h(["is intrigued by","is ambivalent towards","is neutral towards","is suspicious of"]),t="acquaintance"):this.strength==1?(e=h(["likes","is amused by","enjoys the company of","enjoys","trusts"]),t="friend"):(e=h(["loves","deeply trusts","adores"]),t="friend"),new F(t,e,0,this.strength)}}class k{constructor(){a(this,"primary");a(this,"secondaries");this.primary=new J,this.secondaries=[]}}class R{constructor(){a(this,"name");a(this,"description");a(this,"personalityTraits");a(this,"appearanceTraits");this.name="",this.description="",this.personalityTraits=[],this.appearanceTraits=[]}}class x{constructor(){a(this,"name");a(this,"species");a(this,"gender");a(this,"ageCategory");a(this,"domains");a(this,"titles");a(this,"realm");a(this,"description");a(this,"personalityTraits");a(this,"personality");a(this,"appearance");a(this,"holyItem");a(this,"holySymbol");a(this,"isAlive");this.name="",this.species=u,this.gender=u.genders[0],this.ageCategory=u.ageCategories[0],this.domains=new k,this.titles=[],this.realm=new R,this.description="",this.personality="",this.personalityTraits=[],this.appearance="",this.holyItem="",this.holySymbol="",this.isAlive=!0}describe(){const e=this.species.adjective,t=this.gender.pronouns.subjective;let n="god";const r=[];r.push(this.domains.primary.name);for(let o=0;o<this.domains.secondaries.length;o++)r.push(this.domains.secondaries[o].name);this.gender.name==="female"&&(n="goddess");let i=`${this.name} appears as ${N(e)} ${e} ${this.ageCategory.noun}.`;return i+=` ${f(t)} has ${this.appearance}. ${this.personality}.`,i+=` ${this.name} is the ${n} of ${w(r)}.`,i+=` ${f(t)} resides in ${S(this.realm.name)}.`,i}}function I(s,e,t,n,r,i){let o=new x;return o.name=s,o.species=e,o.gender=t,o.ageCategory=n,o.domains=i,o.realm=r,o}class z{constructor(e){a(this,"config");this.config=e}generate(){let e=[],t=[];const n=q(this.config.characterGeneratorConfig);if(this.config.maleNameGenerator===null)throw new Error("male name generator not set");if(this.config.femaleNameGenerator===null)throw new Error("female name generator not set");let r=this.config.femaleNameGenerator.generate(1)[0];n.gender.name=="male"&&(r=this.config.maleNameGenerator.generate(1)[0]);let i=h(this.config.realms);if(i===void 0)throw new Error("realm is undefined");let o=I(r,n.species,n.gender,n.ageCategory,i,this.config.domainSet);e=this.config.domainSet.primary.holyItems,t=this.config.domainSet.primary.holySymbols,o.holyItem=h(e),o.holySymbol=h(t);const m=$(100),l=n.physicalTraits;let d=[];for(let c=0;c<l.length;c++)d.push(l[c].description);if(m>80){let c=h(o.realm.appearanceTraits);if(c===void 0)throw console.log(JSON.stringify(o.realm)),new Error("realm appearance trait is undefined");d.push(c.phrase)}return o.personalityTraits=n.personalityTraits,o.personality=L(o),o.appearance=w(d),o.description=o.describe(),o}}function L(s){let e=[];for(let t=0;t<s.personalityTraits.length;t++)e.push(s.personalityTraits[t].descriptor);return f(s.gender.pronouns.subjective)+" is "+w(e)}class W{constructor(){a(this,"domainSet");a(this,"realms");a(this,"characterGeneratorConfig");a(this,"femaleNameGenerator");a(this,"maleNameGenerator");let e=A();this.realms=[],this.domainSet=new k,this.characterGeneratorConfig=e;let t=P("human",C());this.femaleNameGenerator=t.female,this.maleNameGenerator=t.male}}class B{constructor(e){a(this,"config");this.config=e}generate(){let e=new k;if(this.config.domains=b(this.config.domains),this.config.domains.length<this.config.numberOfDomains)throw new Error("Not enough domains in domain generator config for the requested number of domains.");let t=this.config.domains.pop();if(t!==void 0)e.primary=t;else throw new Error("No primary domain found.");for(let n=0;n<this.config.numberOfDomains;n++){const r=this.config.domains.pop();if(r===void 0)throw new Error("No secondary domain found.");e.secondaries.push(r)}return e}}class V{constructor(){a(this,"numberOfDomains");a(this,"domains");this.numberOfDomains=1,this.domains=JSON.parse(JSON.stringify(O))}}class _{constructor(){a(this,"name");a(this,"description");a(this,"members");a(this,"leader");this.name="",this.description="",this.members=[],this.leader=-1}}class K{constructor(){a(this,"deity");a(this,"relationships");this.deity=new x,this.relationships=[]}}class Q{constructor(e){a(this,"config");this.config=e}generate(){let e=new _,t=new W;t.characterGeneratorConfig.speciesOptions=this.config.speciesOptions,t.realms=this.config.realms,t.femaleNameGenerator=this.config.femaleNameGenerator,t.maleNameGenerator=this.config.maleNameGenerator;const n=y.int(this.config.minDeities,this.config.maxDeities),r=X(n);for(let m=0;m<r.length;m++){let l=new K;t.domainSet=r[m];let c=new z(t).generate();l.deity=c,e.members.push(l)}let i=new H(0),o=y.int(1,3);for(let m=0;m<o;m++)for(let l=0;l<e.members.length;l++){i.strength=y.int(-2,2);const d=y.int(0,e.members.length-1);if(d!=l){let c=!1;for(let p=0;p<e.members[l].relationships.length;p++)e.members[l].relationships[p].target==d&&(c=!0);if(!c){let p=i.generate();p.target=d,e.members[l].relationships.push(p);let v=i.generate();v.target=l,e.members[d].relationships.push(v)}}}if(e.members.length>1)for(let m=0;m<e.members.length;m++){let l=[];for(let c=0;c<e.members[m].relationships.length;c++)l.push(U(e.members[m].relationships[c],e.members[e.members[m].relationships[c].target].deity.name));const d=" "+e.members[m].deity.name+" "+w(l)+".";e.members[m].deity.description+=d}return e}}function U(s,e){return h([`${s.verb} ${e}`])}function X(s){let e=new V,t=new B(e),n=[],r=b(JSON.parse(JSON.stringify(e.domains)));for(let i=0;i<s;i++){let o=[];for(let l=0;l<t.config.numberOfDomains+1;l++)o.push(r.pop());t.config.domains=o;let m=t.generate();n.push(m)}return n}class Y{constructor(){a(this,"domains");a(this,"realms");a(this,"minDeities");a(this,"maxDeities");a(this,"speciesOptions");a(this,"femaleNameGenerator");a(this,"maleNameGenerator");this.domains=JSON.parse(JSON.stringify(O)),this.realms=[],this.speciesOptions=[u],this.minDeities=1,this.maxDeities=16;let e=P("fantasy",M());this.femaleNameGenerator=e.female,this.maleNameGenerator=e.male}}function Z(s,e){const t=[];for(let n=0;n<s.length;n++)for(let r=0;r<e.length;r++)s[n].tags.includes(e[r])&&t.push(s[n]);return t}const ee=[{phrase:"six feathered wings",bodyPart:"wings",tags:["sky"]},{phrase:"four feathered wings",bodyPart:"wings",tags:["sky"]},{phrase:"two large feathered wings",bodyPart:"wings",tags:["sky","dreamlike"]},{phrase:"large leathery wings",bodyPart:"wings",tags:["sky","death"]},{phrase:"a lion's tail'",bodyPart:"tail",tags:["earth","forest"]},{phrase:"a whip-like tail",bodyPart:"tail",tags:["earth","death"]},{phrase:"two tails",bodyPart:"tail",tags:["alien"]},{phrase:"the horns of a goat",bodyPart:"horns",tags:["earth","forest"]},{phrase:"the horns of a ram",bodyPart:"horns",tags:["earth","forest"]},{phrase:"the antlers of a stag",bodyPart:"horns",tags:["forest"]},{phrase:"the antlers of a deer",bodyPart:"horns",tags:["forest","surreal"]},{phrase:"short, pointed horns",bodyPart:"horns",tags:["earth","death"]},{phrase:"tall, straight horns",bodyPart:"horns",tags:["earth","death"]},{phrase:"glowing blue eyes",bodyPart:"eyes",tags:["water"]},{phrase:"glowing yellow eyes",bodyPart:"eyes",tags:["sky","water"]},{phrase:"glowing red eyes",bodyPart:"eyes",tags:["earth","death","alien"]},{phrase:"glowing orange eyes",bodyPart:"eyes",tags:["earth","sky"]},{phrase:"glowing green eyes",bodyPart:"eyes",tags:["earth","forest"]},{phrase:"glowing purple eyes",bodyPart:"eyes",tags:["death","alien"]},{phrase:"eyes that burn with an inner fire",bodyPart:"eyes",tags:["sky"]},{phrase:"four eyes",bodyPart:"eyes",tags:["alien"]},{phrase:"six eyes",bodyPart:"eyes",tags:["alien"]},{phrase:"eight eyes",bodyPart:"eyes",tags:["alien"]},{phrase:"no eyes",bodyPart:"eyes",tags:["death","alien"]},{phrase:"reptilian eyes",bodyPart:"eyes",tags:["forest","earth"]},{phrase:"scales instead of skin",bodyPart:"skin",tags:["earth","forest"]},{phrase:"skin that glows faintly",bodyPart:"skin",tags:["sky"]},{phrase:"skin made of living rock",bodyPart:"skin",tags:["earth"]},{phrase:"blue skin",bodyPart:"skin",tags:["water"]},{phrase:"green skin",bodyPart:"skin",tags:["water"]},{phrase:"crystalline skin",bodyPart:"skin",tags:["earth"]},{phrase:"translucent grey skin",bodyPart:"skin",tags:["death"]},{phrase:"dull grey skin",bodyPart:"skin",tags:["death"]},{phrase:"skin covered in leaves",bodyPart:"skin",tags:["forest"]},{phrase:"skin made of star-lit blackness",bodyPart:"skin",tags:["alien"]},{phrase:"iridescent skin",bodyPart:"skin",tags:["alien","surreal"]},{phrase:"eight tentacles",bodyPart:"tentacles",tags:["alien"]},{phrase:"six tentacles",bodyPart:"tentacles",tags:["alien"]},{phrase:"four tentacles",bodyPart:"tentacles",tags:["alien"]},{phrase:"the head of a lion",bodyPart:"head",tags:["forest"]},{phrase:"the head of a bear",bodyPart:"head",tags:["forest"]},{phrase:"the head of a dragon",bodyPart:"head",tags:["earth","forest"]},{phrase:"the head of a swan",bodyPart:"head",tags:["sky","water"]},{phrase:"the head of a deer",bodyPart:"head",tags:["forest"]},{phrase:"the head of a cat",bodyPart:"head",tags:["earth","desert"]},{phrase:"the head of a wolf",bodyPart:"head",tags:["earth","forest"]},{phrase:"twelve feathered wings",bodyPart:"wings",tags:["sky","dreamlike"]},{phrase:"bat-like wings",bodyPart:"wings",tags:["night","moon"]},{phrase:"insect-like wings",bodyPart:"wings",tags:["earth","forest"]},{phrase:"crystal-clear wings",bodyPart:"wings",tags:["sky","surreal"]},{phrase:"feathered wings that shimmer",bodyPart:"wings",tags:["sky","water"]},{phrase:"a serpent's tail",bodyPart:"tail",tags:["earth","water"]},{phrase:"a tail with a bioluminescent tip",bodyPart:"tail",tags:["water","surreal"]},{phrase:"three tails",bodyPart:"tail",tags:["surreal"]},{phrase:"twisted horns with glowing runes",bodyPart:"horns",tags:["magic","surreal"]},{phrase:"curved horns with gemstone inlays",bodyPart:"horns",tags:["earth","wealth"]},{phrase:"feathery antlers with ethereal wisps",bodyPart:"horns",tags:["forest","dreamlike"]},{phrase:"horns that emit a haunting melody",bodyPart:"horns",tags:["earth","music"]},{phrase:"pearlescent eyes that change colors",bodyPart:"eyes",tags:["sky","water"]},{phrase:"eyes with galaxies swirling within",bodyPart:"eyes",tags:["sky","cosmic"]},{phrase:"eyes that see into other dimensions",bodyPart:"eyes",tags:["surreal","alien"]},{phrase:"eyes with a mesmerizing hypnotic gaze",bodyPart:"eyes",tags:["magic","surreal"]},{phrase:"eyes that mirror the emotions of others",bodyPart:"eyes",tags:["empathy","surreal"]},{phrase:"eyes that emit sparks of lightning",bodyPart:"eyes",tags:["storm","electricity"]},{phrase:"eyes on flexible stalks",bodyPart:"eyes",tags:["alien","surreal"]},{phrase:"molten lava-like skin",bodyPart:"skin",tags:["volcano","fire"]},{phrase:"shimmering opalescent skin",bodyPart:"skin",tags:["sky","water"]},{phrase:"butterfly wings with shifting patterns",bodyPart:"wings",tags:["dream","surreal"]},{phrase:"floating ethereal wings of light",bodyPart:"wings",tags:["dream","surreal"]},{phrase:"wings made of iridescent mist",bodyPart:"wings",tags:["dream","surreal"]},{phrase:"feathers that change color with emotions",bodyPart:"wings",tags:["dream","empathy"]},{phrase:"a tail of shimmering stardust",bodyPart:"tail",tags:["dream","cosmic"]},{phrase:"tail that trails rainbows as you move",bodyPart:"tail",tags:["dream","surreal"]},{phrase:"a tail with glowing constellations",bodyPart:"tail",tags:["dream","cosmic"]},{phrase:"horns that emit soft, soothing melodies",bodyPart:"horns",tags:["dream","music"]},{phrase:"horns adorned with floating gemstones",bodyPart:"horns",tags:["dream","surreal"]},{phrase:"horns that sparkle like starlight",bodyPart:"horns",tags:["dream","cosmic"]},{phrase:"eyes that reflect the landscapes of dreams",bodyPart:"eyes",tags:["dream","surreal"]},{phrase:"eyes with ever-changing patterns of light",bodyPart:"eyes",tags:["dream","surreal"]},{phrase:"eyes that shimmer like enchanted pools",bodyPart:"eyes",tags:["dream","water"]},{phrase:"skin that shifts like flowing watercolors",bodyPart:"skin",tags:["dream","surreal"]},{phrase:"skin that glows softly with inner thoughts",bodyPart:"skin",tags:["dream","empathy"]},{phrase:"skin covered in delicate, luminescent vines",bodyPart:"skin",tags:["dream","forest"]},{phrase:"skin that shimmers like a mirage",bodyPart:"skin",tags:["dream","desert"]},{phrase:"skin that resembles the surface of a nebula",bodyPart:"skin",tags:["dream","cosmic"]},{phrase:"skin that changes texture with emotions",bodyPart:"skin",tags:["dream","empathy"]},{phrase:"a head crowned with floating ethereal flames",bodyPart:"head",tags:["dream","fire"]},{phrase:"a head with a halo of radiant energy",bodyPart:"head",tags:["dream","surreal"]},{phrase:"fiery wings with ember-like feathers",bodyPart:"wings",tags:["fire","heat"]},{phrase:"wings that resemble molten lava flows",bodyPart:"wings",tags:["fire","earth"]},{phrase:"smoldering wings that leave trails of sparks",bodyPart:"wings",tags:["fire","surreal"]},{phrase:"earthen wings with intricate rock formations",bodyPart:"wings",tags:["earth","mountain"]},{phrase:"wings made of intertwined vines and roots",bodyPart:"wings",tags:["earth","forest"]},{phrase:"crystalline wings that shimmer like gemstones",bodyPart:"wings",tags:["earth","jewel"]},{phrase:"a tail with a fiery, flickering tip",bodyPart:"tail",tags:["fire","surreal"]},{phrase:"tail adorned with rugged, earthy textures",bodyPart:"tail",tags:["earth","mountain"]},{phrase:"tail with geode-like patterns and colors",bodyPart:"tail",tags:["earth","jewel"]},{phrase:"horns that resemble twisting flames",bodyPart:"horns",tags:["fire","heat"]},{phrase:"horns made of sturdy, petrified wood",bodyPart:"horns",tags:["earth","forest"]},{phrase:"horns with patterns reminiscent of ancient runes",bodyPart:"horns",tags:["earth","magic"]},{phrase:"eyes that flicker like burning embers",bodyPart:"eyes",tags:["fire","heat"]},{phrase:"eyes with deep, earthy hues like rich soil",bodyPart:"eyes",tags:["earth","nature"]},{phrase:"eyes that reflect the molten core of the earth",bodyPart:"eyes",tags:["earth","cosmic"]},{phrase:"skin that glows with inner fire",bodyPart:"skin",tags:["fire","surreal"]},{phrase:"skin with a texture resembling cracked earth",bodyPart:"skin",tags:["earth","desert"]},{phrase:"skin covered in intricate, glowing tribal patterns",bodyPart:"skin",tags:["earth","magic"]},{phrase:"a head crowned with blazing, fiery tendrils",bodyPart:"head",tags:["fire","surreal"]},{phrase:"a head with rugged, stone-like features",bodyPart:"head",tags:["earth","mountain"]},{phrase:"a head adorned with gemstone-encrusted horns",bodyPart:"head",tags:["earth","jewel"]}];function ae(s){return Z(ee,s.appearanceTags)}class g{constructor(e,t,n,r,i){a(this,"name");a(this,"nameOptions");a(this,"appearanceTags");a(this,"personalityTags");a(this,"descriptionOptions");this.name=e,this.nameOptions=t,this.appearanceTags=n,this.personalityTags=r,this.descriptionOptions=i}}const te=[new g("sky",["The Eternal Heavens","The Heavens Above","Heaven","The Sky","The Heavens","The Celestial Realm","The Empyrean","The Firmament"],["sky","clouds","sun","moon","stars","rainbows","light"],["mercurial","caring","wise","flexible","majestic","powerful","graceful","serene"],["Far above the mortal world, {name} is a realm of light and splendor.","{name} is a realm of light and beauty, where celestial beings roam.","The skies of {name} are awash with vibrant colors and shimmering stars."]),new g("earth",["The Earth","The Mortal Realm","The Material Plane","The Mundane World","The Physical Plane","The Human World"],["earth","mountains","rivers","forests","deserts","oceans","caves","valleys"],["stable","stubborn","physical","grounded","tenacious","reliable","practical"],["{name} is where mortals reside, going about their daily lives.","{name} is the home of all mortal beings, full of bustling cities and quiet countryside."]),new g("forest",["The Forest","The Eternal Forest","The Divine Forest","The Sylvan Realm","The Verdant Wilds","The Green Domain"],["forest","trees","plants","animals","rivers","mountains"],["caring","stable","peaceful","graceful","majestic","wise","mystical"],["Hidden far from the mortal world, {name} is deep and mysterious, full of secrets and ancient magic.","{name} is an infinite forest of beauty and mystery, where the spirits of the wild roam free.","The forests of {name} are alive with the sound of birdsong and rustling leaves."]),new g("underworld",["The Underworld","The Afterlife","The Kingdom of Death","The Great Beyond","The Netherworld","The Land of the Dead"],["death","shadow","bones","ghosts","souls","void"],["angry","brooding","peaceful","wise","merciful","judgmental","powerful"],["{name} is where souls go to rest after death, guided by the spirits of the departed.","{name} is a realm of perpetual darkness where the dead rest forever, watched over by the reapers of the underworld.","The halls of {name} are filled with the whispers of the dead, their spirits forever lingering in the shadows."]),new g("ocean",["The Vast Sea","The Sea","The Endless Ocean","The Divine Sea","The Ever-Changing Tides","The Fathomless Depths","The Coral Kingdom","The Ocean of Storms"],["water","salt","waves","foam","currents","whirlpools","tides","depths"],["mercurial","aloof","cruel","flexible","violent","majestic","mysterious"],["{name} is a realm apart from mortal seas, full of life and infinitely deep.","The deep and restless waters of {name} hide many secrets.","Beneath the surface of {name} lies a kingdom of wonder and terror."]),new g("mountain",["The Great Mountain","The Mountain","The Divine Mountain","The Endless Peak","The Celestial Summit","The Sky-Splitting Colossus","The Stone Sentinel","The Cradle of the Gods"],["earth","rock","stone","ice","snow","summit","peak","valley"],["aloof","wise","physical","stable","majestic","immovable","mysterious"],["{name} is far larger than any mountain of the mortal world.","{name} is covered in lush forests and cascading waterfalls, a towering paradise.","Beneath the peaks and valleys of {name} lies a realm of fire and darkness."]),new g("void",["The Nameless Void","The Endless Void","The Void","The Dark Beyond","The Endless Dark","The Abyss","The Great Emptiness","The Eternal Nothingness"],["alien","darkness","emptiness","silence","cold","nothingness","absence"],["alien","clever","unknowable","silent","watchful","impenetrable"],["{name} is home to things unknowable and alien.","There are mysteries in {name} that no mortal can hope to perceive, let alone understand.","{name} is a realm of eternal darkness and emptiness, where the very fabric of reality is twisted and distorted."]),new g("dream",["The Realm of Dreams","The Dreamlands","The Land of Nod","The Ethereal Plane","The Realm of Imagination","The World of Sleep"],["ethereal","fantastical","dreamlike","otherworldly","surreal","shimmering"],["mysterious","whimsical","fickle","curious","enigmatic","playful"],["{name} is a place where the impossible becomes reality and where the line between dreams and waking life is blurred.","The ethereal beauty of {name} is home to creatures born of pure imagination and fantasy.","In {name}, the landscape constantly shifts and changes, shaped by the whims of the dreamers who call it home.","The dreamscape of {name} is a realm of infinite possibilities, where anything can happen and nothing is truly impossible.","{name} is a place where the innermost thoughts and desires of mortals manifest into reality, for better or for worse.","Those who journey into {name} often find themselves caught in a never-ending cycle of dreams and nightmares."])];function se(s,e,t,n){let r=new R;return r.name=s,r.description=e,r.personalityTraits=t,r.appearanceTraits=n,r}class re{constructor(e){a(this,"config");this.config=e}generate(){const e=[],t=this.config.numberOfRealms;let n=JSON.parse(JSON.stringify(te));n=b(n);for(let r=0;r<t;r++){const i=n.pop();if(typeof i=="object"){const o=h(i.nameOptions),m=ae(i);if(m.length<1)throw new Error(`No appearance traits found for realm concept ${i.name}.`);let l=h(i.descriptionOptions).replace("{name}",S(o));l=f(l);const d=se(o,l,[],m);e.push(d)}}return e}}class ie{constructor(){a(this,"numberOfRealms");a(this,"requireDualistic");this.numberOfRealms=2,this.requireDualistic=!1}}class ne{constructor(e){a(this,"name");a(this,"description");a(this,"realms");a(this,"pantheon");this.name=e,this.description="",this.realms=[],this.pantheon=null}}class Pe{constructor(e){a(this,"config");this.config=e}generate(){let e=new ie;const n=new re(e).generate(),r=h(this.config.categories),i=new ne(this.config.nameGenerator.generate(1)[0]);if(i.realms=n,r.hasDeities){let o=new Y;o.realms=n,o.speciesOptions=this.config.deitySpeciesOptions,o.minDeities=r.minDeities,o.maxDeities=r.maxDeities,o.femaleNameGenerator=this.config.femaleNameGenerator,o.maleNameGenerator=this.config.maleNameGenerator;let l=new Q(o).generate();if(l.description=r.description,i.pantheon=l,r.hasLeader){i.pantheon.leader=y.int(0,i.pantheon.members.length-1);let d="Queen of the Gods";i.pantheon.members[i.pantheon.leader].deity.gender.name==="male"&&(d="King of the Gods"),i.pantheon.members[i.pantheon.leader].deity.titles.push(d),i.pantheon.description+=` ${i.pantheon.members[i.pantheon.leader].deity.name} is the ${d}.`}}return i.pantheon!==null?i.description=i.pantheon.description+" "+D()+" "+f(G())+".":i.description=r.description+" "+D()+" "+f(G())+".",i}}function G(){let s=h(["{follower} gather in {place} for {service}","{follower} congregate in {place} to be led in {service} by {leader}","{follower} meet in {place} to engage in {service} and hear from {leader}","At {place}, {follower} come together for {service} led by {leader}","Join {follower} at {place} for {service} and fellowship with {leader}","{follower} assemble in {place} to participate in {service} and share with {leader}","{follower} unite at {place} for {service} and to learn from {leader}","At {place}, {follower} come together to seek guidance and wisdom from {leader} through {service}"]);const e=h(["adherents","believers","disciples","devotees","faithful","followers","pilgrims","worshippers","zealots"]),t=h(["temples","churches","mosques","synagogues","chapels","shrines","sanctuaries","meeting halls","community centers","outdoor arenas"]),n=h(["silent meditation","guided meditation","chanting","prayer","sacrament","communion","worship","ritual dance","ritual music","structured recitation","spontaneous sharing","teachings and discussions","ritual sacrifice"]),r=h(["priest","priestess","minister","shaman","spiritual guide","community leader","wise elder","prophet","guru","ascended master","enlightened one","mystic","oracle"]);return s=s.replace("{follower}",e).replace("{place}",t).replace("{service}",n).replace("{leader}",N(r)+" "+r),s}function D(){let s=h(["Regular gatherings happen once a week.","Regular gatherings happen daily.","Regular gatherings happen once a month.","Weekly gatherings take place every {weekday}.","They come together every {weekday} for a time of {service}.","Their community meets {frequency} for {service} at {time}.","Their gatherings occur {frequency}, bringing {follower} together for {service}.","They gather {frequency} at {place} for {service} and {activity}.","Every {weekday} they gather for {service}, followed by {activity}.","Their gatherings happen {frequency} at {place} and feature {service}, {activity}, and food/drink.","People are invited to the {occasion} gathering, where they partake in {service} and {activity}."]);return s=s.replace("{weekday}",h(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"])).replace("{frequency}",h(["weekly","bi-weekly","monthly","quarterly","annually"])).replace("{follower}",h(["worshipers","devotees","believers","faithful","followers","pilgrims"])).replace("{service}",h(["prayer","worship","meditation","reflection","ritual","sermon","teaching"])).replace("{time}",h(["sunrise","midday","sunset","evening","night"])).replace("{place}",h(["the temple","the church","the mosque","the synagogue","the chapel","the shrine","the sanctuary","the meeting hall"])).replace("{activity}",h(["fellowship","conversation","sharing","food and drink","community service","study"])).replace("{occasion}",h(["special","holiday","festive","solemn"])),s}class T{constructor(){a(this,"name");a(this,"description");a(this,"hasDeities");a(this,"hasLeader");a(this,"minDeities");a(this,"maxDeities");this.name="",this.description="",this.hasDeities=!1,this.hasLeader=!1,this.minDeities=0,this.maxDeities=0}}class oe extends T{constructor(){super(),this.name="monotheism",this.description="This religion "+h(["has a single all-powerful god","is monotheistic"])+".",this.hasDeities=!0,this.minDeities=1,this.maxDeities=1}}class he extends T{constructor(){super(),this.name="polytheism",this.description="This religion "+h(["has several gods","is polytheistic"])+".",this.hasDeities=!0,this.hasLeader=!0,this.minDeities=2,this.maxDeities=16}}class le extends T{constructor(){super(),this.name="shamanism",this.description="This religion is shamanistic."}}function me(){return[new oe,new he,new le]}function ke(s,e){for(let t=0;t<e.length;t++)if(e[t].name===s)return e[t];throw new Error(`No religion category found with name ${s}.`)}class Te{constructor(){a(this,"categories");a(this,"deitySpeciesOptions");a(this,"nameGenerator");a(this,"femaleNameGenerator");a(this,"maleNameGenerator");this.categories=me(),this.deitySpeciesOptions=[u];let e=P("human",C());this.nameGenerator=e.family,this.femaleNameGenerator=e.female,this.maleNameGenerator=e.male}}export{Te as R,Pe as a,me as b,ke as c};
//# sourceMappingURL=generatorconfig.da00e8e6.js.map
