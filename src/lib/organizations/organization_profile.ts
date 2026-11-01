import type { RNG } from '@ironarachne/rng';
import type { NarrativeCandidate } from '$lib/narrative';
import type { OrganizationReadingSubject } from './organization_reading_types';
import type { Environment } from '$lib/environment';
import type {
  LabeledOrgFacet,
  OrganizationEnvironmentNarrative,
  OrganizationGenre,
  OrganizationProfile,
  OrganizationWorldContext,
  OrganizationWorldContextPreset,
} from './organization_types.js';

type OrgArchetype = {
  id: string;
  /** Uses an explicit singular subject, independent of the proper name. */
  hook: string;
  purpose: string;
  tension: string;
  personalityTraits: LabeledOrgFacet[];
  goal: LabeledOrgFacet;
  weakness: LabeledOrgFacet;
  publicStanding: LabeledOrgFacet;
};

function facet(id: string, label: string): LabeledOrgFacet {
  return { id, label };
}

const ARCHETYPES: ReadonlyMap<string, readonly OrgArchetype[]> = new Map([
  [
    'mercenary_company',
    [
      {
        id: 'vicious',
        purpose: 'intimidate rivals into compliance',
        tension: 'The company often exceeds the violence a contract calls for.',
        hook: '{subject} is a vicious mercenary company with a reputation for excessive violence.',
        personalityTraits: [
          facet('ruthless', 'ruthless in pursuit of victory'),
          facet('fearsome', 'fearsome in the field'),
        ],
        goal: facet('intimidation', 'intimidating rivals into compliance'),
        weakness: facet('excess', 'a tendency to escalate well past the terms of a contract'),
        publicStanding: facet('feared', 'feared more than they are trusted in nearby hamlets'),
      },
      {
        id: 'professional',
        purpose: 'protect its reputation for reliable service',
        tension: 'The company sticks to rigid methods even when a softer approach would work.',
        hook: '{subject} is a merc company that prides itself on its professionalism and integrity.',
        personalityTraits: [
          facet('methodical', 'methodical in planning'),
          facet('discreet', 'discreet with employers'),
        ],
        goal: facet('reputation', 'keeping a name that high pay can rely on'),
        weakness: facet('rigidity', 'rigid where a softer touch might finish the job'),
        publicStanding: facet(
          'respected',
          'respected in wider mercenary markets even when locals stay wary',
        ),
      },
      {
        id: 'reliable_riot',
        purpose: 'secure its next contract and its next cask of wine',
        tension: 'Its members lose discipline as soon as the fighting stops.',
        hook: '{subject} is reliable on the job, though its members are infamous for their celebrations.',
        personalityTraits: [
          facet('dependable', 'dependable on a timeline'),
          facet('loud', 'loud after the coin lands'),
        ],
        goal: facet('contract_success', 'collecting the next contract and the next cask of wine'),
        weakness: facet('indiscipline', 'discipline that frays the moment the fighting stops'),
        publicStanding: facet('ambivalent', 'a source of rowdy stories as much as of safety'),
      },
    ],
  ],
  [
    'trading_company',
    [
      {
        id: 'quality',
        purpose: 'keep premium prices for trusted goods',
        tension: 'The company is slow to drop goods that have fallen out of fashion.',
        hook: '{subject} is noted for the quality of its goods.',
        personalityTraits: [
          facet('meticulous', 'meticulous about provenance'),
          facet('cautious', 'cautious with debt'),
        ],
        goal: facet('margin', 'holding premium margins on trusted stock'),
        weakness: facet('slow_pivot', 'slow to abandon a line when tastes shift'),
        publicStanding: facet(
          'traders_favor',
          'favored by merchants who care about the crate more than the story',
        ),
      },
      {
        id: 'reliable_routes',
        purpose: 'deliver reliably against strict deadlines',
        tension: 'The company resists detours even when that costs goodwill.',
        hook: '{subject} has a reputation for always delivering goods to the intended destination.',
        personalityTraits: [
          facet('punctual', 'punctual on caravans'),
          facet('tight_lipped', 'tight-lipped about routes'),
        ],
        goal: facet('reliability', 'being the name contracts cite when a deadline is law'),
        weakness: facet('inflexible', 'unwilling detours that cost goodwill'),
        publicStanding: facet(
          'trusted_trade',
          'trusted along trade networks more than in tavern gossip',
        ),
      },
      {
        id: 'shady',
        purpose: 'place people who owe it favors in influential positions',
        tension: 'The company relies too heavily on blackmail and quiet threats.',
        hook: '{subject} appears reputable on the surface, but is rumored to be involved in underhanded dealings.',
        personalityTraits: [
          facet('two_faced', 'careful in public, calculating in private'),
          facet('shrewd', 'shrewd with tariffs and favors'),
        ],
        goal: facet('influence', 'placing people who owe the house in key rooms'),
        weakness: facet('leverage', 'over-reliance on blackmail and quiet threats'),
        publicStanding: facet('suspected', 'whispered about more often than they are loved'),
      },
      {
        id: 'rough',
        purpose: 'control routes before rivals can undercut it',
        tension: 'Its bullying creates vendettas that last beyond a trading season.',
        hook: '{subject} often openly uses bullying and strong-arming in its dealings.',
        personalityTraits: [
          facet('intimidating', 'intimidating to smaller traders'),
          facet('pragmatic', 'pragmatic about paperwork'),
        ],
        goal: facet('monopoly_lean', 'locking routes before rivals can undercut them'),
        weakness: facet('backlash', 'inviting vendettas that outlast any single season'),
        publicStanding: facet(
          'mistrusted',
          'bought from when they must be, not when people want to',
        ),
      },
      {
        id: 'variety',
        purpose: 'build many small markets from a broad catalog',
        tension: 'The company lacks depth when a customer needs specialist knowledge.',
        hook: '{subject} deals in a wide variety of goods.',
        personalityTraits: [
          facet('diverse', 'eclectic in inventory'),
          facet('networked', 'connected in many markets'),
        ],
        goal: facet('footprint', 'turning a general catalog into a hundred small niches'),
        weakness: facet('dilution', 'thin expertise when a problem needs a master'),
        publicStanding: facet('known_warehouses', 'known for the warehouse, not the war story'),
      },
    ],
  ],
  [
    'weavers_collective',
    [
      {
        id: 'apprentice',
        purpose: 'pass unwritten weaving recipes to new apprentices',
        tension: "The collective's secrecy invites rumors.",
        hook: '{subject} is known for its patterned goods and long apprenticeships.',
        personalityTraits: [
          facet('patient', 'patient with the loom'),
          facet('proud', 'proud of family patterns'),
        ],
        goal: facet('lineage', 'passing unwritten recipes down the hall'),
        weakness: facet('secrecy', 'silence that invites rumor'),
        publicStanding: facet(
          'guild_respect',
          'respected in guild markets even if travelers find them aloof',
        ),
      },
      {
        id: 'dye_secrets',
        purpose: 'build a reputation for colors rivals cannot copy',
        tension: 'Its ties to dye suppliers could embarrass the collective.',
        hook: 'Some merchants who deal with {subject} never ask where the dyes really come from.',
        personalityTraits: [
          facet('secretive', 'secretive with dye books'),
          facet('fierce', 'fierce about color fastness'),
        ],
        goal: facet('reputation', 'a reputation for color no rival can copy fast enough'),
        weakness: facet('entanglement', 'ties to suppliers that could embarrass the hall'),
        publicStanding: facet('ambivalent', 'admired in cloth halls, watched by tax collectors'),
      },
      {
        id: 'communal',
        purpose: 'keep thread and profit within the collective',
        tension: 'The collective opens its doors only to kin and sponsored newcomers.',
        hook: '{subject} runs communal looms; outsiders pay double for the same thread.',
        personalityTraits: [
          facet('communal', 'communal in production'),
          facet('sharp', 'sharp on pricing for strangers'),
        ],
        goal: facet('solidarity', 'keeping thread and profit inside the company'),
        weakness: facet('nepotism', 'doors that only open to kin and sponsors'),
        publicStanding: facet('local_hero', 'hero to neighbors, a puzzle to the wider fair'),
      },
      {
        id: 'dyers_paper',
        purpose: 'protect its dye recipes as trade secrets',
        tension: 'A single elder forgetting a step could mean losing a recipe.',
        hook: '{subject} trains dyers to keep secret recipes off paper.',
        personalityTraits: [
          facet('disciplined', 'disciplined in oral tradition'),
          facet('cunning', 'cunning in contracts'),
        ],
        goal: facet('trade_secrets', 'defending a palette as intellectual property'),
        weakness: facet('loss', 'catastrophe if a single elder forgets a step'),
        publicStanding: facet(
          'crafty',
          'known as brilliant and slightly unsettling in equal measure',
        ),
      },
    ],
  ],
  [
    'signet_circle',
    [
      {
        id: 'oaths',
        purpose: 'make its seal the authority courts trust',
        tension: "The circle's rigid ceremonies frustrate people in a hurry.",
        hook: '{subject} marks oaths and letters with a single, unmistakable round seal.',
        personalityTraits: [
          facet('formal', 'formal in ceremony'),
          facet('uncompromising', 'uncompromising about a clean impression'),
        ],
        goal: facet('authority', 'being the mark courts cite when a promise must hold'),
        weakness: facet('bureaucracy', 'rigid rites that frustrate the hurried'),
        publicStanding: facet('revered_legal', 'revered in chancery, obscure to the street'),
      },
      {
        id: 'brass_dies',
        purpose: 'defeat forgery through the craft and weight of its seals',
        tension: 'Its brass dies are difficult to move in danger.',
        hook: '{subject} keeps its sigil on brass dies, never in paint alone.',
        personalityTraits: [
          facet('material', 'insistent on physical seals'),
          facet('proud', 'proud of weight and ring'),
        ],
        goal: facet('antiforgery', 'defeating imitation through craft and weight'),
        weakness: facet('portability', 'dies that are hard to move when danger comes'),
        publicStanding: facet('guild_trust', 'trusted by notaries, exotic to the unlettered'),
      },
      {
        id: 'trade_courts',
        purpose: 'use legal precedent to settle new trade agreements',
        tension: "The circle's insularity baffles ordinary traders.",
        hook: '{subject} meets under modest roofs but speaks with old authority in trade courts.',
        personalityTraits: [
          facet('understated', 'understated in dress'),
          facet('learned', 'learned in precedent'),
        ],
        goal: facet('influence', 'wielding old words to settle new deals'),
        weakness: facet('isolation', 'a cloistered air that baffles simple traders'),
        publicStanding: facet('mixed', 'respected in guild hearings, side-eyed in market squares'),
      },
      {
        id: 'initiates',
        purpose: 'keep heraldic literacy alive beyond noble halls',
        tension: 'The circle insists on distinctions the wider world does not always respect.',
        hook: '{subject} teaches initiates the difference between a mark and a blazon.',
        personalityTraits: [
          facet('pedagogical', 'patient with students'),
          facet('stern', 'stern on sloppy strokes'),
        ],
        goal: facet('literate_arms', 'keeping heraldic literacy alive outside noble halls'),
        weakness: facet('naming', 'obsession with distinction the world does not always honor'),
        publicStanding: facet('niche', 'a specialist reputation that intrigues a narrow crowd'),
      },
    ],
  ],
  [
    'wizard_school',
    [
      {
        id: 'hidden',
        purpose: 'keep dangerous magical knowledge from unprepared minds',
        tension: 'The school has become an echo chamber for dangerous theories.',
        hook: '{subject} is a hidden wizard school that avoids contact with the outside world.',
        personalityTraits: [
          facet('reclusive', 'reclusive in policy'),
          facet('guarded', 'guarded in correspondence'),
        ],
        goal: facet('knowledge_safety', 'keeping certain syllables from unprepared minds'),
        weakness: facet('inbreeding_ideas', 'an echo chamber of dangerous theories'),
        publicStanding: facet('mythic', 'more legend than institution to common folk'),
      },
      {
        id: 'noble',
        purpose: 'place its alumni on thrones and in ministries',
        tension: 'The school overlooks talent that cannot pay its fees.',
        hook: '{subject} is a proud institution whose students primarily come from the nobility.',
        personalityTraits: [
          facet('hierarchical', 'hierarchical in seating'),
          facet('groomed', 'groomed for pageantry'),
        ],
        goal: facet('influence', 'placing alumni in thrones and ministries'),
        weakness: facet('class_blind', 'blind to talent that does not pay fees'),
        publicStanding: facet('elite', 'admired in courts, resented in alleys'),
      },
      {
        id: 'experimentation',
        purpose: 'achieve breakthroughs at any cost its charter allows',
        tension: 'A containment accident could bring scandal to the school.',
        hook: 'There are rumors that {subject} sometimes experiments in ways that worry even its own faculty.',
        personalityTraits: [
          facet('inquisitive', 'restlessly inquisitive'),
          facet('ruthless', 'ruthless in ethical lines'),
        ],
        goal: facet('breakthrough', 'breakthroughs at any cost the charter allows'),
        weakness: facet('accidents', 'containment rooms that are always one slip from scandal'),
        publicStanding: facet('dreaded', 'envied in journals, avoided by wise parents'),
      },
      {
        id: 'egalitarian',
        purpose: 'prove that magical genius is not confined to noble bloodlines',
        tension: "Funding and political pressure repeatedly test the school's open admissions.",
        hook: '{subject} is an egalitarian wizard school that accepts new students from every walk of life.',
        personalityTraits: [
          facet('open', 'open in admissions once talent appears'),
          facet('loud', 'loud in debate'),
        ],
        goal: facet('uplift', 'proving genius is not a bloodline product'),
        weakness: facet('funding', 'funding and politics that constantly test the mission'),
        publicStanding: facet('inspiring', 'beloved by common scholars, resented by old houses'),
      },
    ],
  ],
  [
    'holy_order',
    [
      {
        id: 'alms',
        purpose: "protect the church's reputation and feed the poor",
        tension: "The order's ceremonial pomp distracts from decay within the institution.",
        hook: '{subject} marches in glittering processions, collecting tithes and distributing alms in equal measure.',
        personalityTraits: [
          facet('ceremonial', 'ceremonial in public'),
          facet('orderly', 'orderly in ledgers of mercy'),
        ],
        goal: facet('souls', 'protecting the church’s reputation and feeding the poor'),
        weakness: facet('pomp', 'pomp that distracts from rot in the vestry'),
        publicStanding: facet(
          'beloved_suspected',
          'beloved in market squares, viewed with suspicion in taverns',
        ),
      },
      {
        id: 'inquisition_mercy',
        purpose: 'bring every soul in the kingdom to its faith',
        tension: 'The order is divided over what mercy permits.',
        hook: '{subject} is whispered to hunt heretics in the night while publicly preaching mercy.',
        personalityTraits: [
          facet('zealous', 'zealous in doctrine'),
          facet('strategic', 'strategic in silence'),
        ],
        goal: facet('purity', 'a kingdom where every soul faces the right altar'),
        weakness: facet('paranoia', 'splits within the order about what mercy permits'),
        publicStanding: facet('fear', 'fear in alleys, reverence in torchlit squares'),
      },
      {
        id: 'relics',
        purpose: 'keep the power of its relics safely contained',
        tension: 'Some acolytes would trade their piety for a glimpse of the guarded relics.',
        hook: '{subject} keeps ancient relics in vaults the laity are forbidden to see.',
        personalityTraits: [
          facet('custodial', 'devoted to guarded objects'),
          facet('hierarchical', 'hierarchical in who may approach'),
        ],
        goal: facet('sacred_keeping', 'ensuring the power in those vaults does not walk away'),
        weakness: facet('curiosity', 'acolytes who would trade piety for a single glimpse'),
        publicStanding: facet('mythic', 'revered as much as a weapon no one is allowed to draw'),
      },
      {
        id: 'poor_fearful',
        purpose: 'make the palace answer for the suffering of the poor',
        tension: 'Powerful opponents are quietly looking for a pretext to break the order.',
        hook: '{subject} is beloved by the poor and feared by the powerful in equal measure.',
        personalityTraits: [
          facet('charitable', 'charitable in street kitchens'),
          facet('challenging', 'challenging in sermons to the gilded'),
        ],
        goal: facet('moral_ledger', 'turning the street story into a reckoning the palace hears'),
        weakness: facet('enemies', 'powerful names quietly searching for a pretext to break them'),
        publicStanding: facet(
          'saints_and_targets',
          'saints to the hungry, a problem in council chambers',
        ),
      },
    ],
  ],
  [
    'druid_circle',
    [
      {
        id: 'stone_rings',
        purpose: 'bind communities to covenants that outlast kingdoms',
        tension: 'The circle responds slowly to crises in cities.',
        hook: '{subject} convenes at stone rings older than the oldest kingdoms.',
        personalityTraits: [
          facet('ancient', 'grounded in old places'),
          facet('intolerant', 'intolerant of casual trespass'),
        ],
        goal: facet('oath_of_green', 'binding communities to covenants that outlive crowns'),
        weakness: facet('rurality', 'slow to answer when the crisis is in stone walls, not oaks'),
        publicStanding: facet(
          'druid_repute',
          'revered by woodsmen, inconvenient to lords with deeds',
        ),
      },
      {
        id: 'rangers',
        purpose: 'protect boundaries that outsiders do not recognize',
        tension: 'The circle refuses payment from those it associates with forest destruction.',
        hook: 'Rangers trust {subject} with secrets; most merchants find the circle a difficult neighbor.',
        personalityTraits: [
          facet('wild', 'wild in sympathy'),
          facet('suspicious', 'suspicious of axes and plows'),
        ],
        goal: facet('borders', 'holding a line only they can see on a map'),
        weakness: facet('intractable', 'refusing gold that has forest blood on it'),
        publicStanding: facet(
          'polarizing',
          'a fence between reverence and muttered curses in yards',
        ),
      },
      {
        id: 'rivers_roots',
        purpose: 'teach communities that rivers and fields depend on each other',
        tension: 'Its allies want slogans rather than the slow work of repair.',
        hook: '{subject} speaks for rivers and roots with equal authority.',
        personalityTraits: [
          facet('holistic', 'refusing to split water from loam in judgment'),
          facet('fierce', 'fierce when a spring is for sale'),
        ],
        goal: facet(
          'interdependence',
          'teaching a town that a river and a field are the same case',
        ),
        weakness: facet('abstraction', 'allies who want slogans, not slow seasons of repair'),
        publicStanding: facet(
          'prophet_edge',
          'heard as prophetic in lean years, as obstruction in booms',
        ),
      },
      {
        id: 'rites',
        purpose: 'keep old rituals alive as living practices',
        tension: "Fewer people learn the circle's ritual songs with each generation.",
        hook: '{subject} keeps the old rites, even when the cities forget their names.',
        personalityTraits: [
          facet('stubborn', 'stubborn in calendar'),
          facet('literate', 'literate in songs instead of text'),
        ],
        goal: facet('remembrance', 'refusing a world where a ritual is a museum piece only'),
        weakness: facet('fading', 'fewer throats to sing each generation'),
        publicStanding: facet('curiosity', 'romantic to bards, tiresome to tax assessors'),
      },
    ],
  ],
  [
    'noble_house',
    [
      {
        id: 'bloodline',
        purpose: 'ensure its bloodline outlasts its rivals',
        tension: 'The house excludes talented people who lack the right family name.',
        hook: '{subject} answers only to the bloodline that feeds it.',
        personalityTraits: [
          facet('loyal', 'loyal to a name above a code'),
          facet('hierarchical', 'hierarchical in every nod'),
        ],
        goal: facet('line_survival', 'outliving any rival that would unwrite the line'),
        weakness: facet('nepotism', 'talent that never arrives if the name is not already written'),
        publicStanding: facet(
          'respected_resented',
          'respected in court as long as the house stands tall enough',
        ),
      },
      {
        id: 'courtyard',
        purpose: 'make its family a legend others will risk their lives for',
        tension: 'Its members would rather die for honor than retreat.',
        hook: '{subject} drills in the courtyard while poets compose ballads in its name.',
        personalityTraits: [
          facet('performative', 'performative in steel'),
          facet('proud', 'proud in pennants'),
        ],
        goal: facet('myth', 'turning a family into a story others risk themselves to finish'),
        weakness: facet('duel', 'a culture that can die for honor before it can retreat'),
        publicStanding: facet(
          'gallant',
          'gallant in legend, expensive to the towns that supply them',
        ),
      },
      {
        id: 'hedge',
        purpose: 'make attacks on its bloodline too costly to attempt',
        tension: 'The house sustains feuds long after the original affront.',
        hook: '{subject} is a hedge against rivals who would prefer the line extinct.',
        personalityTraits: [
          facet('paranoid', 'sensible paranoia in treaties'),
          facet('sharp', 'sharp in the lists'),
        ],
        goal: facet('deterrent', 'making murder expensive enough to become negotiation'),
        weakness: facet('escalation', 'feuds that outlast the original affront by generations'),
        publicStanding: facet(
          'fearsome',
          'a comfort in war, a problem in any peace with fine print',
        ),
      },
      {
        id: 'proud',
        purpose: 'outshine rival houses in public',
        tension: "The house's reputation protects it only while no cracks show.",
        hook: '{subject} is expensive, proud, and unfailing in public.',
        personalityTraits: [
          facet('proud', 'proud in every receipt'),
          facet('punctilious', 'punctilious in appearances'),
        ],
        goal: facet('prestige', 'a house no rival can outshine in the public eye'),
        weakness: facet('exposure', 'a reputation that is armor until one crack shows'),
        publicStanding: facet(
          'admired_sized_up',
          'admired in galleries, sized up in counting houses',
        ),
      },
    ],
  ],
  [
    'thieves_guild',
    [
      {
        id: 'eyes',
        purpose: 'gather information before the guard can buy it',
        tension: "The guild's trade in rumors can turn against it over a bad debt.",
        hook: 'Stories say {subject} has eyes in every back room of the city.',
        personalityTraits: [
          facet('networked', 'networked in alleys and kitchens'),
          facet('invisible', 'careful in what name they leave'),
        ],
        goal: facet('omniscience', 'information before the guard pays for a tenth of it'),
        weakness: facet('leaks', 'a rumor economy that can turn on a sour debt'),
        publicStanding: facet('legend', 'more fable than office to honest folk'),
      },
      {
        id: 'cruel',
        purpose: 'turn its reputation for justice into freedom to steal',
        tension: 'The guild risks exposure when its members steal from the poor.',
        hook: '{subject} is said to steal from the cruel and corrupt—or at least that is the version told in public.',
        personalityTraits: [
          facet('cynical', 'cynical about altruism in their line'),
          facet('agile', 'agile in alibis'),
        ],
        goal: facet('moral_plunder', 'turning a reputation for justice into a license'),
        weakness: facet('hypocrisy', 'a slip where the hand takes from a smaller pocket'),
        publicStanding: facet(
          'folk_hero_taint',
          'hailed in songs, shunned when purses are counted',
        ),
      },
      {
        id: 'racket',
        purpose: 'control streets that the law neglects',
        tension: 'The guild risks uniting the city against its rackets.',
        hook: '{subject} runs protection with one hand and quiet charity with the other.',
        personalityTraits: [
          facet('pragmatic', 'pragmatic about which sin funds which virtue'),
          facet('muscular', 'muscular in collection'),
        ],
        goal: facet('duopoly', 'owning the street the law pretends it does not see'),
        weakness: facet('civic_war', 'a thin line before the city unites against a common thorn'),
        publicStanding: facet(
          'ambivalent',
          'bought in fear, thanked in the same week by a hungry kitchen',
        ),
      },
      {
        id: 'rumor',
        purpose: 'profit from a balance of fear and curiosity',
        tension: "The guild's reliance on myth leaves it little legal protection when cornered.",
        hook: '{subject} is more rumor than institution, and that suits the guild well.',
        personalityTraits: [
          facet('mysterious', 'mysterious by policy'),
          facet('entertaining', 'entertaining in the tale'),
        ],
        goal: facet('fear_affinity', 'keeping fear and curiosity in balance for profit'),
        weakness: facet('mythic_limits', 'a myth that cannot file a writ when cornered'),
        publicStanding: facet(
          'ghostly',
          'a name that ends conversations when someone coughs the wrong way',
        ),
      },
    ],
  ],
  [
    'corporate_division',
    [
      {
        id: 'blockades',
        purpose: 'outperform its rivals in every jurisdiction',
        tension: 'The division ignores problems it cannot yet measure.',
        hook: '{subject} negotiates in boardrooms and blockades with the same cold patience.',
        personalityTraits: [
          facet('patient', 'patient in process'),
          facet('ruthless', 'ruthless in leverage'),
        ],
        goal: facet('margin', 'a quarter that outshines a rival in every jurisdiction'),
        weakness: facet('kpi_blind', 'blind to anything that is not a chartable number yet'),
        publicStanding: facet('boardroom', 'admired in risk committees, a cipher on the ground'),
      },
      {
        id: 'unforgiving',
        purpose: 'maintain relentless annual growth',
        tension: "Aggressive hiring conceals the division's difficulty retaining staff.",
        hook: '{subject} is the polite face of a parent company that will not forgive a missed quarter.',
        personalityTraits: [
          facet('polished', 'polished in public statements'),
          facet('cruel', 'cruel in internal reviews'),
        ],
        goal: facet('growth', 'relentless annual growth'),
        weakness: facet('churn', 'retention problems masked by aggressive hiring'),
        publicStanding: facet('dread_employees', 'a badge to wear, a shiver in the canteen'),
      },
      {
        id: 'vertical',
        purpose: 'secure a patent and fleet that rivals cannot bypass',
        tension: "The division's isolated specialists struggle with wider emergencies.",
        hook: '{subject} is tasked with a vertical no rival has cracked yet; failures vanish from the org chart.',
        personalityTraits: [
          facet('ambitious', 'hungry for first mover advantage'),
          facet('sterile', 'sterile in empathy'),
        ],
        goal: facet('barrier', 'a patent and a fleet that no one can route around'),
        weakness: facet('silo', 'silo expertise that will not help when a sunflare hits'),
        publicStanding: facet(
          'prestige_risky',
          'prestige with investors, a graveyard in internal memos',
        ),
      },
      {
        id: 'labor_law',
        purpose: 'make its control of labor law an accepted custom',
        tension: "Public resentment focuses on the division's visible representatives.",
        hook: '{subject} has outbid multiple worlds for a narrow lease on local labor law.',
        personalityTraits: [
          facet('legalistic', 'legalistic in fine print'),
          facet('arrogant', 'arrogant in footprint'),
        ],
        goal: facet('regulation_capture', 'owning a clause that becomes culture'),
        weakness: facet('blowback', 'a populace that memorizes a face from a press conference'),
        publicStanding: facet('notorious', 'notorious in newsfeeds, envied in bond markets'),
      },
    ],
  ],
  [
    'colonial_syndicate',
    [
      {
        id: 'policy',
        purpose: "keep control of the dome's air-bill politics",
        tension: 'The syndicate changes its rules to suit the latest decision.',
        hook: '{subject} writes policy on napkins and enforces it with contractors.',
        personalityTraits: [
          facet('improvisational', 'fast with rules'),
          facet('muscular', 'muscular in enforcement'),
        ],
        goal: facet('order', 'a dome where every air bill is a referendum they win'),
        weakness: facet('ad_hoc', 'a constitution that is whatever last night used'),
        publicStanding: facet('pragmatic', 'hated in salons, clung to when the scrubbers fail'),
      },
      {
        id: 'hoa',
        purpose: 'collect fees from legal and illegal trade alike',
        tension: 'The syndicate could face a united populace.',
        hook: 'Depending on who asks, {subject} is either a homeowners body or a black market, often both.',
        personalityTraits: [
          facet('duplicitous', 'two faces, one keycard'),
          facet('savvy', 'savvy in fees'),
        ],
        goal: facet('duopoly', 'taxing the legal and the illegal in one ledger'),
        weakness: facet('civic_trust', 'a populace that might unite on the wrong day'),
        publicStanding: facet('cynical_comfort', 'a comfort in crisis, a villain in any audit'),
      },
      {
        id: 'air',
        purpose: 'charge subscriptions for breathable air',
        tension: 'A cracked seal could turn resentment of the syndicate into a riot.',
        hook: '{subject} securitizes every breath of air; late fees have real teeth here.',
        personalityTraits: [
          facet('extractive', 'extractive in calm voices'),
          facet('bureaucratic', 'bureaucratic in oxygen'),
        ],
        goal: facet('revenue', 'a subscription model for the atmosphere itself'),
        weakness: facet('sabotage', 'one cracked seal away from a riot'),
        publicStanding: facet(
          'indispensable_loathed',
          'loathed, paid anyway until something breaks',
        ),
      },
      {
        id: 'referendum',
        purpose: 'expand its jurisdiction to encompass every vice',
        tension: "The syndicate's constant voting stalls its work.",
        hook: '{subject} is building a world one referendum and one bribe at a time.',
        personalityTraits: [
          facet('political', 'political in hallways and tunnels'),
          facet('cunning', 'cunning in compromise'),
        ],
        goal: facet('jurisdiction', 'a jurisdiction big enough to hold every vice'),
        weakness: facet('inertia', 'a tower that is always voting and never done'),
        publicStanding: facet('fatigue', 'watched by idealists, endured by most'),
      },
    ],
  ],
  [
    'research_institute',
    [
      {
        id: 'decode',
        purpose: 'advance research faster than regulators can follow',
        tension: 'Its funders demand headlines before the proofs are ready.',
        hook: '{subject} publishes in journals most species cannot decode without help.',
        personalityTraits: [
          facet('alien_leaning', 'at home with strange notation'),
          facet('proud', 'proud in impact factors'),
        ],
        goal: facet('frontier', 'pushing a frontier a decade before anyone can regulate it'),
        weakness: facet('funding_eye', 'funders who want a headline before a proof matures'),
        publicStanding: facet('arcane', 'a jewel in a catalog few citizens could parse'),
      },
      {
        id: 'citations',
        purpose: 'secure a leading place in academic rankings',
        tension: 'The institute risks following fashionable research into a dead end.',
        hook: '{subject} runs grant seasons like harvests, with citation counts as the weather report.',
        personalityTraits: [
          facet('competitive', 'competitive in lab coats'),
          facet('networked', 'networked in review boards'),
        ],
        goal: facet('prestige', 'a tower where every season ends in a ranked list'),
        weakness: facet('fads', 'chasing a trendy field into a dead end'),
        publicStanding: facet(
          'admired_aspirations',
          'beloved of grad students, feared by deans in lean years',
        ),
      },
      {
        id: 'trust',
        purpose: 'preserve knowledge beyond the life of any government',
        tension: "The institute's independence lets it pursue work no one wants to hear about.",
        hook: '{subject} is funded by a trust that predates the last three local governments on this rock.',
        personalityTraits: [
          facet('independent', 'independent in charter'),
          facet('eccentric', 'eccentric in taste'),
        ],
        goal: facet('continuity', 'knowledge that lives longer than any elected banner'),
        weakness: facet('irrelevance', 'freedom to study what no one will pay to hear'),
        publicStanding: facet('temple', 'a temple to minds most towns only visit in headlines'),
      },
      {
        id: 'bunker',
        purpose: 'produce findings more valuable in secret than in public',
        tension: 'The institute keeps a troubling containment incident out of its tours.',
        hook: '{subject} is half a university, half a bunker, and the tours end at a painted door.',
        personalityTraits: [
          facet('secretive', 'careful in what visitors may photograph'),
          facet('daring', 'daring in sublevels'),
        ],
        goal: facet('results', 'results that are worth more classified than public'),
        weakness: facet('accident', 'a containment story no tour guide will tell'),
        publicStanding: facet(
          'dreaded_curiosity',
          'dreaded and visited in the same week by the reckless',
        ),
      },
    ],
  ],
  [
    'smuggler_outfit',
    [
      {
        id: 'customs',
        purpose: 'carry cargo that stays off official ledgers',
        tension: 'A thorough patrol inspection could expose the outfit.',
        hook: '{subject} can land where customs is only a polite suggestion.',
        personalityTraits: [
          facet('bold', 'bold on approach vectors'),
          facet('polite', 'polite in bribes phrased as tips'),
        ],
        goal: facet('invisible_hold', 'carrying what ledgers do not need to name'),
        weakness: facet('heat', 'a patrol that finally cares enough to look twice'),
        publicStanding: facet(
          'necessary_vice',
          'cursed in customs, begged when a crop rots in silos',
        ),
      },
      {
        id: 'grain_genes',
        purpose: 'fill every available cubic meter with paying cargo',
        tension: 'One mislabeled crate could end a run.',
        hook: '{subject} moves grain, genes, and guilt with the same hold manifest.',
        personalityTraits: [
          facet('pragmatic', 'pragmatic about cargo categories'),
          facet('cynical', 'cynical about customs oaths'),
        ],
        goal: facet('volume', 'filling every cubic meter that still has a payment attached'),
        weakness: facet('contraband', 'a single mislabeled crate that could end the run'),
        publicStanding: facet('complicit', 'hired on every dock, loved by no ledger'),
      },
      {
        id: 'docking_fee',
        purpose: 'win repeat business from customers who avoid questions',
        tension: 'A rival can undercut the one price the outfit openly publishes.',
        hook: '{subject} is honest about nothing except the docking fee.',
        personalityTraits: [
          facet('candid', 'candid about price'),
          facet('slippery', 'slippery about origin'),
        ],
        goal: facet('repeat_custom', 'repeat business from people who hate asking questions'),
        weakness: facet('price_war', 'a rival who undercuts on the one number they publish'),
        publicStanding: facet('grudging', 'grudgingly paid, quickly forgotten'),
      },
      {
        id: 'family_bounty',
        purpose: 'keep its crew wealthy enough to overlook old grudges',
        tension: "Its members' blood oaths can fail when a bounty is high enough.",
        hook: '{subject} is family until the bounty clears—then the family gets smaller.',
        personalityTraits: [
          facet('clannish', 'clannish on the deck'),
          facet('ruthless', 'ruthless when the heat lands'),
        ],
        goal: facet('survival', 'keeping a crew rich enough to ignore old grudges'),
        weakness: facet('betrayal', 'blood oaths that crack when the reward is high enough'),
        publicStanding: facet('notorious', 'notorious in ports, romantic only in stories'),
      },
    ],
  ],
  [
    'sf_mercenary_outfit',
    [
      {
        id: 'credits_silence',
        purpose: 'finish every job with payment rather than a tribunal',
        tension: 'Clients sometimes demand heroics beyond the contract.',
        hook: '{subject} contracts in stellar credits and hard silence.',
        personalityTraits: [
          facet('professional', 'professional in contract text'),
          facet('terse', 'terse in combat after'),
        ],
        goal: facet('paid_exit', 'every job ending in a transfer, not a tribunal'),
        weakness: facet('liability', 'a client who wants heroics that do not fit the clause'),
        publicStanding: facet(
          'market_reliable',
          'known in merc markets, absent on recruitment posters',
        ),
      },
      {
        id: 'iff',
        purpose: 'make its callsign enough to end a pursuit',
        tension: 'A forged identification signal could implicate an innocent vessel.',
        hook: '{subject} has no flag but its IFF tags say enough.',
        personalityTraits: [
          facet('cryptic', 'cryptic in branding'),
          facet('lethal', 'lethal when the tag is questioned'),
        ],
        goal: facet('recognition', 'being the callsign that ends a pursuit log'),
        weakness: facet('spoofing', 'a counterfeited signal that frames the wrong hull'),
        publicStanding: facet('dreaded', 'dreaded on sensors, invisible in port registry'),
      },
      {
        id: 'regime_survivor',
        purpose: 'outlast governments that neglect to pay',
        tension: "The outfit's reputation follows its ships across political borders.",
        hook: '{subject} survived three regime changes; pay on time and the outfit stays reliable.',
        personalityTraits: [
          facet('adaptable', 'adaptable in allegiance'),
          facet('loyal', 'loyal to coin first'),
        ],
        goal: facet('continuity', 'outlasting governments that forget to pay'),
        weakness: facet('reputation', 'a name that follows a hull across polities'),
        publicStanding: facet(
          'pragmatic',
          'respected by logistics officers, studied by historians',
        ),
      },
      {
        id: 'licensed',
        purpose: 'play competing jurisdictions against each other for room to work',
        tension: 'A vote to harmonize warrants could expose the outfit to extradition.',
        hook: '{subject} is licensed on six worlds and wanted on a seventh.',
        personalityTraits: [
          facet('legalistic', 'clever with papers'),
          facet('bold', 'bold where local law ends'),
        ],
        goal: facet(
          'jurisdiction_arb',
          'playing jurisdictions against one another for room to work',
        ),
        weakness: facet('extradition', 'one vote in a league that suddenly harmonizes warrants'),
        publicStanding: facet('notorious', 'a resume that is half medal, half warrant'),
      },
    ],
  ],
  [
    'starship_squadron',
    [
      {
        id: 'simulators',
        purpose: 'keep its wing ready to launch and win even when exhausted',
        tension: 'Poor funding decisions trade simulator practice against time in actual ships.',
        hook: '{subject} has simulators that smell like ozone and old coffee.',
        personalityTraits: [
          facet('drilled', 'relentlessly drilled'),
          facet('weary', 'weary in a good way'),
        ],
        goal: facet('readiness', 'a wing that can launch tired and still win'),
        weakness: facet('rot', 'funding that trades sim hours for hull hours at the wrong moment'),
        publicStanding: facet(
          'professional',
          'trusted in fleet briefings, mocked in bars that do not fly',
        ),
      },
      {
        id: 'kill_marks',
        purpose: 'build a combat record that discourages the next opponent',
        tension: 'Young pilots mistake simulator experience for combat experience.',
        hook: '{subject} paints kill marks where chaplains cannot see from the pews.',
        personalityTraits: [
          facet('fatalistic', 'fatalistic about vacuum'),
          facet('proud', 'proud in tally'),
        ],
        goal: facet('reputation', 'a scoreboard that keeps the next fight shorter'),
        weakness: facet('overconfidence', 'young sticks who think sims are the whole story'),
        publicStanding: facet('mythic', 'famous in wardrooms, avoided in peace talks'),
      },
      {
        id: 'hull_time',
        purpose: 'keep aging ships dangerous beyond their expected service life',
        tension: 'Metal fatigue can defeat that maintenance during a live intercept.',
        hook: '{subject} rotates hull time like farmers rotate fields.',
        personalityTraits: [
          facet('methodical', 'methodical in maintenance'),
          facet('thrifty', 'thrifty with spall'),
        ],
        goal: facet('long_service', 'keeping old frames dangerous long after their book age'),
        weakness: facet('fatigue', 'metal that finally says no during a live intercept'),
        publicStanding: facet('respected', 'respected by engineers, pitied by accountants'),
      },
      {
        id: 'understrength',
        purpose: 'win fights that its recorded strength suggests it should lose',
        tension: 'The squadron has no reserves if a single skirmish goes badly.',
        hook: '{subject} is understrength on paper, lethal in vacuum.',
        personalityTraits: [facet('lean', 'lean in headcount'), facet('sharp', 'sharp in vector')],
        goal: facet('punch_above', 'making an admiral’s spreadsheet lie about tonnage'),
        weakness: facet('one_loss', 'no depth if a single skirmish goes wrong'),
        publicStanding: facet('legend', 'a legend on tight budgets, a gamble on big days'),
      },
    ],
  ],
]);

const DEFAULT_ARCHETYPES: readonly OrgArchetype[] = [
  {
    id: 'default',
    purpose: 'stay useful to the people funding it',
    tension: 'The organization sometimes takes on more than its command structure can handle.',
    hook: '{subject} pursues its mission with a mix of public ambition and private compromise.',
    personalityTraits: [
      facet('determined', 'determined in pursuit of its aims'),
      facet('adaptive', 'willing to shift tactics when the ground moves'),
    ],
    goal: facet('relevance', 'staying necessary to the people who sign the checks'),
    weakness: facet(
      'overreach',
      'occasionally biting off more than its chain of command can swallow',
    ),
    publicStanding: facet('mixed', 'viewed with a mixture of need and side-eyed caution'),
  },
];

function getArchetypesForKind(kindId: string): readonly OrgArchetype[] {
  return ARCHETYPES.get(kindId) ?? DEFAULT_ARCHETYPES;
}

/**
 * `worldContext` takes precedence over `environment` for narrative. If both are absent,
 * no environment block is added to the profile or description.
 */
export function resolveEnvironmentNarrative(
  _genre: OrganizationGenre,
  _kindId: string,
  worldContext: OrganizationWorldContext | undefined,
  _environment: Environment | undefined,
): OrganizationEnvironmentNarrative | undefined {
  if (worldContext) {
    if (worldContext.kind === 'hint') {
      const t = worldContext.text.trim();
      if (!t) {
        return undefined;
      }
      return { id: 'hint', shortLabel: t };
    }
    return presetToNarrative(worldContext.preset);
  }
  return undefined;
}

const PRESET_NARRATIVES: Readonly<
  Record<OrganizationWorldContextPreset, OrganizationEnvironmentNarrative>
> = {
  desert_route: {
    id: 'desert_route',
    shortLabel: 'long waterless trade routes, staged wells, and salt-hardened caravans',
  },
  coastal: {
    id: 'coastal',
    shortLabel: 'barges, estuaries, and weather that comes off the water',
  },
  mountain_pass: {
    id: 'mountain_pass',
    shortLabel: 'high passes, switchback roads, and short growing seasons in the vales',
  },
  river_trade: {
    id: 'river_trade',
    shortLabel: 'river landings, seasonal floods, and tolls at every major bend',
  },
  tundra: {
    id: 'tundra',
    shortLabel: 'muskeg, ice fog, and supply lines that only move in a narrow season',
  },
  jungle_march: {
    id: 'jungle_march',
    shortLabel: 'mud roads, fevers, and routes defined by the dry weeks between rains',
  },
  void_ledger: {
    id: 'void_ledger',
    shortLabel: 'transfer points, void lanes, and ledgers that live in more than one jurisdiction',
  },
  rim_wilderness: {
    id: 'rim_wilderness',
    shortLabel: 'rim habs, long radio silence, and contracts written against unknown ground',
  },
  dome_sprawl: {
    id: 'dome_sprawl',
    shortLabel: 'sealed domes, stacked habitats, and air bills as political territory',
  },
};

function presetToNarrative(p: OrganizationWorldContextPreset): OrganizationEnvironmentNarrative {
  return PRESET_NARRATIVES[p];
}

export function buildOrganizationProfile(
  rng: RNG,
  kindId: string,
  _name: string,
  options: {
    genre: OrganizationGenre;
    worldContext?: OrganizationWorldContext;
    environment?: Environment;
  },
): OrganizationProfile {
  const list = getArchetypesForKind(kindId);
  const arch = rng.item([...list]);
  const environmentNarrative = resolveEnvironmentNarrative(
    options.genre,
    kindId,
    options.worldContext,
    options.environment,
  );
  return {
    personalityTraits: arch.personalityTraits.map((trait) => ({ ...trait })),
    goal: { ...arch.goal },
    weakness: { ...arch.weakness },
    publicStanding: { ...arch.publicStanding },
    hook: profileHook(arch, kindId),
    environmentNarrative,
  };
}

const SUBJECTS: Readonly<Record<string, string>> = {
  mercenary_company: 'The company',
  trading_company: 'The company',
  weavers_collective: 'The collective',
  signet_circle: 'The circle',
  wizard_school: 'The school',
  holy_order: 'The order',
  druid_circle: 'The circle',
  noble_house: 'The house',
  thieves_guild: 'The guild',
  corporate_division: 'The division',
  colonial_syndicate: 'The syndicate',
  research_institute: 'The institute',
  smuggler_outfit: 'The outfit',
  sf_mercenary_outfit: 'The outfit',
  starship_squadron: 'The squadron',
};

function profileHook(arch: OrgArchetype, kindId: string): string {
  const subject = SUBJECTS[kindId] ?? 'The organization';
  // Embedded noun phrases use lower case; proper names are never verb subjects.
  return arch.hook.startsWith('{subject}')
    ? arch.hook.replace('{subject}', subject)
    : arch.hook.replace('{subject}', subject.toLowerCase());
}

/** Only exact current built-in meanings authorize paraphrase; edited labels remain authored detail. */
export function organizationReadingSubject(
  id: string,
  kindId: string,
  profile: OrganizationProfile,
): OrganizationReadingSubject {
  const subject = SUBJECTS[kindId] ?? 'The organization';
  const candidates: NarrativeCandidate[] = [];
  for (const arch of getArchetypesForKind(kindId)) {
    const add = (
      topic: string,
      importance: NarrativeCandidate['importance'],
      options: string[],
      meaning = topic,
    ) => {
      candidates.push({
        id: `organization:${id}:${arch.id}:${meaning}`,
        topic,
        importance,
        sourceIds: [id],
        templates: [
          {
            id: `organization:${kindId}:${arch.id}:${meaning}`,
            parts: [{ id: 'sentence', options }],
          },
        ],
      });
    };
    if (profile.goal.id === arch.goal.id && profile.goal.label === arch.goal.label)
      add('purpose', 'defining', [
        `${subject} aims to ${arch.purpose}.`,
        `${subject}'s aim is to ${arch.purpose}.`,
      ]);
    if (profile.weakness.id === arch.weakness.id && profile.weakness.label === arch.weakness.label)
      add('tension', 'distinctive', [arch.tension]);
    if (profile.hook === profileHook(arch, kindId))
      add('purpose', 'supporting', [profile.hook], 'hook');
  }
  return { id, candidates };
}

/** Compatibility entry point: no random decisions on read and no syntactic guesses from facet text. */
export function composeOrganizationDescription(
  _memberCount: number,
  profile: OrganizationProfile,
): string {
  const kindId =
    [...ARCHETYPES].find(([, archetypes]) =>
      archetypes.some(
        (arch) =>
          arch.goal.id === profile.goal.id &&
          arch.goal.label === profile.goal.label &&
          arch.weakness.id === profile.weakness.id &&
          arch.weakness.label === profile.weakness.label,
      ),
    )?.[0] ?? 'unknown';
  const subject = organizationReadingSubject('compatibility', kindId, profile);
  return ['purpose', 'tension']
    .flatMap((topic) => {
      const candidate = subject.candidates.find((entry) => entry.topic === topic);
      return candidate ? [candidate.templates[0].parts[0].options[0]] : [];
    })
    .join(' ');
}
