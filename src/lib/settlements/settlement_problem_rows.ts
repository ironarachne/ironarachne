/**
 * Template rows for {@link generateSettlementProblems}. Wording is generic fantasy, no proper nouns.
 */
export type ProblemRow = { readonly summary: string; readonly detail: string };

/** Shorthand for const arrays. */
const r = (summary: string, detail: string): ProblemRow => ({ summary, detail });

// --- Acute: law and order (low) ---
export const ACUTE_LAW: readonly ProblemRow[] = [
  r(
    'A spree of thefts and night raids has rattled the community.',
    'Guards are stretched thin, and merchants are hiring private watch at ruinous rates.',
  ),
  r(
    'A public brawl outside the courts escalated into a small riot over a disputed will.',
    'The reeve is holding ringleaders in a crowded gaol, and bail hearings are a daily circus.',
  ),
  r(
    'Someone broke the seal on the toll-house strongbox after the fair.',
    'Road captains are stopping wagons, and the council is feuding about who can investigate.',
  ),
  r(
    'A known smuggler was seen drinking with a customs clerk near the wharves.',
    'Rumors of bought silence have turned routine inspections into shoving matches on the quay.',
  ),
  r(
    'A minor noble’s escort clashed with town watch at the gate over precedence.',
    'The magistrate is asking for a neutral arbiter, but both sides are collecting witnesses in back rooms.',
  ),
  r(
    'A string of muggings near the chandlery district has spooked the night market.',
    'Hawkers are closing early, and customers carry sticks who never used to carry anything.',
  ),
  r(
    'A witness in a smuggling case disappeared under suspicious circumstances between shifts.',
    'Jurors are asking to be excused, and the bailiff is posting pairs at the courthouse door.',
  ),
  r(
    'A guild steward’s ledger walked out the window during a wage dispute.',
    'Foremen and journeymen are trading accusations, and a strike has turned two streets sullen and sharp.',
  ),
];

export const ACUTE_LAW_SEVERE: readonly ProblemRow[] = [
  r(
    'Gangs have been dividing streets by day and collecting fees by night.',
    'A curfew is being whispered, but the watch is too few to make it look like anything but fear.',
  ),
  r(
    'A gallows verdict sparked a scuffle that became a day-long shoving war near the well.',
    'Councillors are barricading documents, and outlying farmers are refusing to come in to market.',
  ),
  r(
    'Someone hung a noose on the reeve’s door without leaving a name.',
    'Militia drills are resuming at dawn, and the stable yard is out of good horses to borrow.',
  ),
];

// --- Acute: law and order (high) ---
export const ACUTE_LAW_STRICT: readonly ProblemRow[] = [
  r(
    'A zealous new ordinance tripped a festival tent city into fines everyone says they cannot pay.',
    'Constables are writing tickets in ink that does not match the public notice, and a petition is going door to door.',
  ),
  r(
    'A mistaken arrest in the market has neighbors refusing to vouch for anyone wearing a cap.',
    'The justiciar wants quick closure, but the crowd is asking for a full airing before the moot hall.',
  ),
  r(
    'A new curfew is catching workers between shifts, and a shift bell became a shoving line at a gate.',
    'Dormitory masters and guild stewards are arguing over who is responsible for headcounts after dark.',
  ),
];

// --- Acute: food / hunger ---
export const ACUTE_FOOD: readonly ProblemRow[] = [
  r(
    'A granary fire destroyed much of the late-season store.',
    'The council is rationing flour and has forbidden exports until the next convoy.',
  ),
  r(
    'A convoy of grain is late, and the mill is idle more hours than it grinds.',
    'Bakers are posting smaller loaves, and a line is forming at the almshouse that used to be short.',
  ),
  r(
    'A blight has touched the most exposed fields, and the yield forecast just turned cruel.',
    'Elders are eyeing a second planting they cannot afford, and the seed coffer is already thin.',
  ),
  r(
    'A livestock sickness has quarantined two paddocks, and culls are on the table.',
    'Drovers are selling early at prices that look like a bargain until you weigh the carcass rules.',
  ),
  r(
    'A bridge collapse delayed hay wagons into the coldest week so far.',
    'Fodder is being meted in measures that look honest only if you do not look at the horses.',
  ),
  r(
    'A weevil bloom turned a proud bin into dust in a single week.',
    'Housholders are sifting with candlelight, and some are quietly blending ash into flour out of fear.',
  ),
  r(
    'A sudden price spike in salt has people counting grains at the table they used to take for granted.',
    'Fisher folk are trading gutting favors for a pinch, and the smokehouse is posting limits.',
  ),
  r(
    'A frost warning arrived too late to cover half the community plot rows.',
    'Kinder hands are being sent to forage, and a few are talking about a lean winter by name in daylight.',
  ),
];

export const ACUTE_FOOD_SEVERE: readonly ProblemRow[] = [
  r(
    'Hunger is no longer a rumor: lines are being turned away with empty sacks.',
    'The almshouse is doubling soup and halving hope, and the reeve is asking outlying lords for grace weeks.',
  ),
  r(
    'A public granary key turned up bent, and a council blame game is blocking distribution.',
    'Cooks are being watched at their hearths, and every whisper about hoarding becomes a scuffle at the well.',
  ),
];

// --- Acute: commerce / market ---
export const ACUTE_COMMERCE_LOW: readonly ProblemRow[] = [
  r(
    'A caravan master declared bankruptcy mid-market, and half the stalls are holding paper nobody trusts.',
    'Moneychangers are posting odd rates, and a few are locking shutters at noon on a market day.',
  ),
  r(
    'A customs raid scattered bonded goods across a warehouse floor before labels could be checked.',
    'Merchants are duplicating claims, and the clerk is asking for a dry hall no one can spare.',
  ),
  r(
    'A bridge weight limit went up after a crack was found, and wide wagons are backing up in both directions.',
    'Teamsters are shifting loads by hand, and the toll collector is feuding with a guild about hours.',
  ),
  r(
    'A key weigh-house beam cracked during the busiest week of the season.',
    'Carters are renegotiating on the street, and the market hall is down to a single line that nobody likes.',
  ),
];

export const ACUTE_COMMERCE_HIGH: readonly ProblemRow[] = [
  r(
    'A labor stoppage at a busy yard idled two cranes, and perishable stock is piling in the sun.',
    'Foreman and guild are trading ultimatums, and a secondary market is already forming in side alleys.',
  ),
  r(
    'A stampede of speculative buying emptied a copper bin at the mint office window for an hour.',
    'Clerks are freezing certain receipts, and small holders are howling that big houses jumped the line.',
  ),
  r(
    'A rent fight turned into a public counting of who owns which back workshop.',
    'Land agents are double-booking viewings, and a court date is the only language everyone still shares.',
  ),
  r(
    'A new tariff posted overnight hit importers on goods already moored in the estuary.',
    'Captains are threatening to break bulk elsewhere, and the harbor office is in three shouting meetings at once.',
  ),
];

// --- Acute: public health ---
export const ACUTE_HEALTH: readonly ProblemRow[] = [
  r(
    'A fever is moving house to house faster than the healer can follow.',
    'The well near the tannery is suspected, and people are queuing at the east well under arms.',
  ),
  r(
    'A case of tainted meat forced the inn back kitchen to throw out half a week’s work.',
    'The healer is asking for a cold cellar audit, and the market is posting names with ink that smears in shame.',
  ),
  r(
    'A pox has closed the school and turned the public hall into a triage of blankets and arguments.',
    'Mothers are standing watch in shifts, and the priest is reading last rites in a mask no one had last season.',
  ),
  r(
    'A dung-heap at the tannery edge leached into a drain after a hard rain.',
    'Children with gut cramps are crowding a single bench, and the reeve is ordering trenches before supper.',
  ),
  r(
    'A healer on pilgrimage left no trained substitute, and simple wounds are going bad in days.',
    'Barter for herbs has turned into quiet bidding wars, and a few are asking neighbors for help they never thought they would need.',
  ),
  r(
    'A public bath siphon cracked, and clean water is being carried by bucket in three wards.',
    'Skin itch is the complaint on every lip, and the cistern man is under suspicion he does not deserve.',
  ),
  r(
    'A midden wind shift has everyone blaming the tanner, the pig yard, and the almshouse in one breath.',
    'Cloth masks are appearing on faces that refused them last year, and the apothecary is rationing mint.',
  ),
];

export const ACUTE_HEALTH_SEVERE: readonly ProblemRow[] = [
  r(
    'A bleeding cough has outpaced every bed, chair, and bench the sick ward can set.',
    'The graveyard sexton is asking for a second line, and cart horses are being borrowed for heavier work than hay.',
  ),
  r(
    'A midwife and a healer are pointing at two different water sources, and the town is split by street.',
    'Guards are posted at cistern lids, and a rumor of poison is as dangerous as the fever itself.',
  ),
];

// --- Acute: water / weather / place ---
export const ACUTE_RIVER: readonly ProblemRow[] = [
  r(
    'Silt-choked sluice gates failed during the last hard rain.',
    'Two lower streets are under ankle-deep water, and the mill race may need a full rebuild.',
  ),
  r(
    'An ice jam at the upstream bend sent a late surge that overtopped a low wharf by nightfall.',
    'Sacks floated free, a clerk is counting what can be written off, and a rope crew is working under lanterns.',
  ),
  r(
    'A mill race choked on debris that should have been cleared before the first freeze.',
    'The miller is idling, bakers are nervous, and the weir tender is in a public shouting match with the reeve.',
  ),
  r(
    'A ferry cable frayed; crossings stopped mid-day, and a wedding party is stuck on the wrong bank.',
    'The blacksmith is pacing out chain links, and the toll-keeper is eating blame from every side.',
  ),
  r(
    'A beaver or collapsed bank turned a gentle backwater into a silted pond overnight.',
    'Flat boats are grounded, and fishers are dragging nets in mud that used to be channel.',
  ),
];

export const ACUTE_DRY: readonly ProblemRow[] = [
  r(
    'A dry spring left the main channel so low waders could cross in boots without wetting a knee.',
    'Dredgers are arguing about where to start, and millstones are idling in a sound the town is learning to hate.',
  ),
  r(
    'Upstream users drew hard on shared flow, and the local sluice ran shallow before breakfast.',
    'A water bailiff is posting watches, and a few are quietly moving barrels under roof while tempers are still thin.',
  ),
];

export const ACUTE_COAST: readonly ProblemRow[] = [
  r(
    'A sudden squall parted a fishing fleet, and not every boat is answering signals by nightfall.',
    'Families are lighting roof fires, the harbor office is a crowd, and a priest is reading names in a shaky hand.',
  ),
  r(
    'A run of bad landings has buyers walking away at the wharf, and ice houses are half empty of faith.',
    'Processors are renegotiating in shouts, and a customs clerk is looking for a dry corner to weep in.',
  ),
  r(
    'A red tide stench rolled in with a tide everyone wishes had turned an hour earlier.',
    'Nets are coming up thin and strange, and the smokehouse is refusing certain catches without a written ruling.',
  ),
  r(
    'A barge line snapped in a surging bar; timber is scattered along a shingle the children are already pilfering.',
    'A bonded warehouse is missing labels, and the night watch swears the seals looked honest at dusk.',
  ),
  r(
    'A salt wind cracked roof slates; three leaks turned a wool loft into a dispute over who pays what.',
    'Insurers and owners are reading policy lines by candle, and a catwalk over the quay is closed by rope.',
  ),
];

export const ACUTE_COLD: readonly ProblemRow[] = [
  r(
    'A blizzard line stalled every eastbound coach for two days, and the hay loft is down to a counted stack.',
    'Drovers are burning straw they meant to keep for bedding, and a newborn calf is the town’s unspoken worry.',
  ),
  r(
    'A snap freeze turned mud into glass under hooves, and a loaded sled slid into a byre wall.',
    'The smith is out of the kind of short nails everyone swore they would stock earlier.',
  ),
  r(
    'A frozen canal left barges ice-locked a league short of their contracts.',
    'Teamsters with runners are haggling for rates that did not exist last season, and flour is piling in the wrong yard.',
  ),
  r(
    'A chimney fire in a longhouse row leapt faster than the bucket line could answer.',
    'Families are in borrowed blankets, and the council is already whispering about shared hearths in the guild hall.',
  ),
];

export const ACUTE_HEAT: readonly ProblemRow[] = [
  r(
    'A heat wave turned the public well into a line that shoves by noon and silence by curfew.',
    'Night work is resuming, and a few foremen are asking for water boys they cannot pay in coin.',
  ),
  r(
    'A sunstroke felled a reaper at the edge of a field, and the whole crew sat down in place.',
    'The healer is sending children home from chores, and shade under the lone oak is now a policed place.',
  ),
  r(
    'A tinder-dry stubble field caught from a single spark, and a wind did the rest before anyone could flanks it.',
    'Thatch crews are in demand, and a farmer is in a public hearing about a controlled burn that was not controlled.',
  ),
];

export const ACUTE_HIGHLAND: readonly ProblemRow[] = [
  r(
    'A rockfall closed the main mule pass without warning, and a wedding convoy is stopped mid-slope.',
    'Herders are routing stock along a scree the dogs hate, and a toll collector is out of a job for a week.',
  ),
  r(
    'A late snow masked a gully on a drove road; two wagons are axle-deep, and tempers are worse than weather.',
    'Young hands are spading drifts, and the mule dealer is the busiest soul in a five-mile circle.',
  ),
  r(
    'A shepherds’ argument over a summer fence line turned into a shoving match at the cheese weigh.',
    'Borders are notional up here, and a clerk from below is being asked to draw lines nobody wants permanent.',
  ),
  r(
    'A mine brace cracked after a water vein opened in a new face.',
    'The cap lamp line is a slow shuffle, and the guild is split between shoring and backing out a seam.',
  ),
  r(
    'A scree run buried a bothy used for lambs; the flock is unhurt, the roof is not.',
    'Crofters are hand-clearing, and a neighbor feud about drift paths is flaring in plain sight of the cairn.',
  ),
];

export const ACUTE_URBAN: readonly ProblemRow[] = [
  r(
    'A night fire jumped two narrow lanes, and a tannery vat is the reason the wind cannot be reasoned with.',
    'A bucket chain made strangers of neighbors, and a guild is already arguing about the rebuild line.',
  ),
  r(
    'A tenement stair cracked in the middle, and a court told families to stand outside under slate sky.',
    'The almshouse is out of cots, and a landlord is asking for a bond nobody on that stair has ever seen.',
  ),
  r(
    'A new gate tax caught festival gear already packed for the fair route.',
    'Carters are unrolling rope at the back gate, and a magistrate is reading exemptions by flickering torch.',
  ),
  r(
    'A blocked sewer turned a main crossing into a debate between shovels and law.',
    'Diggers want daylight and wages; shopkeepers want foot traffic; the smell is deciding faster than the council.',
  ),
  r(
    'A roof collapse in a busy yard scattered slate into a market square full of awnings.',
    'A vendor is counting dents, a child is bandaged, and a mason is in everyone’s business before noon.',
  ),
];

export const ACUTE_RURAL: readonly ProblemRow[] = [
  r(
    'A wolf rumor turned every missing chicken into a village court without a gavel.',
    'Traps are set where dogs run free, and a boy with a slingshot is not everyone’s idea of a hero.',
  ),
  r(
    'A boundary oak fell across a plow day line that two families have argued over for a generation.',
    'The sexton is being asked to bless a new cut line, and the reeve is hiding behind paperwork.',
  ),
  r(
    'A byre roof gave way under wet thatch, and a cow is a bargaining chip between cousins.',
    'Hands are mucking in borrowed hats, and the price of straw is a whisper at the crossroads.',
  ),
  r(
    'A new enclosure fence cut a right-of-way a hamlet has used since before anyone wrote it down.',
    'A moot in the field drew more pitchforks than chairs, and a clerk is writing names with shaking ink.',
  ),
];

// --- Acute: economic role ---
export const ACUTE_ECON_AGRARIAN: readonly ProblemRow[] = [
  r(
    'A seasonal hiring fair turned into a price war, and a few hands left without shaking on anything.',
    'Growers are offering meal instead of coin, and a journeyman is asking the guild if that is legal this year.',
  ),
  r(
    'A thresher’s crew found stones in a grain sack meant for the mill, and the whole harvest line stopped.',
    'Accusations are flying downwind, and a magnate’s buyer is in the middle with a list nobody wants to sign.',
  ),
  r(
    'A plow team bolted, threw a share, and turned a long afternoon into a lesson in curses and coin.',
    'The farrier is working past dark, and a seed loan is the only kind word left on one farm.',
  ),
  r(
    'A geese flock ate a new-planted corner clean after a gate latch failed.',
    'A joke about roast bird turned sharp when the neighbor is the one who left the gate unhooked.',
  ),
];

export const ACUTE_ECON_MARKET: readonly ProblemRow[] = [
  r(
    'A stampede at a public auction scattered lots and bidders, and a clerk is reading damage notes by candle.',
    'Appraisers are in three directions at once, and a bailiff is asking for a bigger hall and more rope.',
  ),
  r(
    'A notary’s seal went missing the morning a major debt came due in front of a crowd.',
    'Lawyers and lenders are in the same room, and the only empty chair is the one the debtor fled from.',
  ),
  r(
    'A market-day rumor about adulterated spice emptied a table before noon.',
    'The vendor swears a rival planted dust, and the reeve is asking for a blind tasting nobody trusts.',
  ),
];

export const ACUTE_ECON_INDUSTRIAL: readonly ProblemRow[] = [
  r(
    'A tannery vat failed; half a yard is a slick people are slipping through on their way to vespers.',
    'A bailiff is drawing chalk lines, and a river bailiff is asking if anyone measured what went downstream.',
  ),
  r(
    'A smelter vent cracked during a long pour, and a bloom split wrong on the last swing.',
    'The foreman and the paymaster are in a public circle, and the chain shop is idled until someone signs liability.',
  ),
  r(
    'A grain-dust haze in a storage loft set off a cough that became a work stoppage in an hour.',
    'Brooms are in short supply, and a guild rule about open flame is on everyone’s tongue.',
  ),
  r(
    'A foundry ladle line snapped; metal kissed a stone floor, and a runner lost a sandal and nerve.',
    'The floor is pocked, the schedule is a joke, and the customer still wants a casting by moon.',
  ),
];

export const ACUTE_ECON_EXTRACTIVE: readonly ProblemRow[] = [
  r(
    'A tunnel hit bad air before timber reached the new face, and a cage is a slow, bitter ride today.',
    'A tally master is already counting time lost, and a widow in town is not in the room but is in every glance.',
  ),
  r(
    'A slag slide blocked a chute, and a night team is mucking in light no one would call good.',
    'The cap man wants another brace; the book man wants a cheaper seam; the seam does not care.',
  ),
  r(
    'A pick crew struck a void that swallowed an hour of work and a week of brag.',
    'A surveyor and a cap lamp are in the same bad mood, and timbers are being argued over, not set.',
  ),
  r(
    'A winch sheared, spilling a bin of ore across a path mules use before dawn.',
    'Hooves and ankles are the talk at breakfast, and a replacement part is a week out if the road holds.',
  ),
];

export const ACUTE_ECON_MIXED: readonly ProblemRow[] = [
  r(
    'A morning dispute over who owns a shared quay line turned a mild dock day into a rope-pulling crowd.',
    'A clerk with wet boots is trying to be heard over gulls, and a captain is looking for a second mooring.',
  ),
  r(
    'A new workshop opened beside an old one, and smoke is choosing sides that chimneys did not expect.',
    'A guild wants rules; a freeholder wants air; a neighbor with laundry wants peace.',
  ),
];

// --- Acute: prosperity / size hooks ---
export const ACUTE_PROSPERITY_LOW: readonly ProblemRow[] = [
  r(
    'A parish tithe day turned into a public reckoning of who can pay in what kind.',
    'Leather and honey are in the same basket as coppers, and the reeve is trying not to wince.',
  ),
  r(
    'A roof in the meanest row sprang a leak the night a cold rain arrived.',
    'A bucket brigade of neighbors did what they could, and a child is sleeping in a kitchen that is not their own.',
  ),
];

export const ACUTE_PROSPERITY_HIGH: readonly ProblemRow[] = [
  r(
    'A charitable grant arrived with strings, and a dozen deserving claims cannot all be first.',
    'Clerks are inventing a scoring sheet, and a priest is trying to be fair while everyone watches his hand.',
  ),
  r(
    'A new civic hall is half-built, and every contractor in town is reading the other’s estimate aloud.',
    'A mayor’s speech about unity was drowned by hammering, and a ladder dispute ended in splinters, not law.',
  ),
];

export const ACUTE_POP_LARGE: readonly ProblemRow[] = [
  r(
    'A stampede of rumor in the central square emptied one ward before the watch could unhook a rope line.',
    'Pickpockets are having a good day, and a herald is still trying to read a correction nobody hears.',
  ),
  r(
    'A midden wagon overturned on a high-traffic day, and every lane learned the smell of bad timing.',
    'Street-sweepers are coining a second wage, and a temple is asking for a blessing that covers boots.',
  ),
];

export const ACUTE_POP_SMALL: readonly ProblemRow[] = [
  r(
    'A single family feud between two clans is the whole week’s public business.',
    'The reeve is mediating in a field, the priest is mediating in a kitchen, and both tables have the same bread.',
  ),
  r(
    'A lost bellwether ewe became a day-long search that ended in a laugh and a bill for ale.',
    'Young runners got their adventure, the flock is one short for market math, and the old shepherd is not apologizing.',
  ),
];

// --- Acute: biome / terrain flavor ---
export const ACUTE_BIOME_DRY: readonly ProblemRow[] = [
  r(
    'A dust wind blew through market day, and every eye is weeping a different excuse.',
    'Cloth awnings are straining; vendors are weighting hems; a child is chasing a hat into the common ditch.',
  ),
  r(
    'A well sweep broke in a dry week, and every bucket seems heavier on the return.',
    'A neighbor with a hand pump is a sudden friend, and a line forms before dawn without being told.',
  ),
];

export const ACUTE_BIOME_WET: readonly ProblemRow[] = [
  r(
    'A week of seeping ground turned every cart rut into a moral lesson for horses.',
    'Straw and ash are in short supply, and a tannery cart is the joke nobody wants to walk behind twice.',
  ),
  r(
    'A fog bank smothered the estuary, and a ferry left late into a world without landmarks.',
    'Horn and rope are the only law until the spire reappears, and even then, arguments persist.',
  ),
];

export const ACUTE_TERRAIN_ROUGH: readonly ProblemRow[] = [
  r(
    'A landslip took a few yards of a terrace road, and a surveyor is out with pegs in weather nobody likes.',
    'Widening is a word that needs money, and a tenant with a mule is being asked to wait, politely, in mud.',
  ),
  r(
    'A gully storm cut a new channel through a field that was supposed to be rent-paying in barley.',
    'The landlord is in town with dry boots, and the farmer is in the gully with a borrowed mattock.',
  ),
];

// --- Universal supplements (broad) ---
export const ACUTE_BROAD: readonly ProblemRow[] = [
  r(
    'A traveling preacher arrived with a list of sins, and a fair became a public accounting of consciences.',
    'Booths closed early, confessions ran long, and a tavern is asking for a second night of quiet.',
  ),
  r(
    'A prize ram escaped its pen the morning a judge was to pick the ribbon.',
    'Half the village is in a chase, the other half is taking bets, and a boy with a stick thinks he is in charge.',
  ),
  r(
    'A public clock stopped, and a town that did not know it lived by a bell is suddenly counting shadows.',
    'A bell-ringer and a sexton are not speaking, and noon is a rumor until someone sees a pie cart leave.',
  ),
  r(
    'A maypole rope frayed; the first dance of the year became a tangle, not a turn.',
    'Nobody was hurt, but pride is, and a carpenter is in demand at a time every hand is in the field.',
  ),
];

export const ACUTE_EMERGENCY_FALLBACK: readonly ProblemRow[] = [
  ...ACUTE_FOOD.slice(0, 2),
  ...ACUTE_LAW.slice(0, 2),
  ...ACUTE_HEALTH.slice(0, 2),
  ...ACUTE_RIVER.slice(0, 1),
];

// --- Creeping: law / social friction ---
export const CREEP_LAW: readonly ProblemRow[] = [
  r(
    'Local justice is a patchwork, and the patch is fraying on every edge.',
    'Outlying hamlets are choosing their own reckonings, and the magistrate is asking for scribes the budget does not have.',
  ),
  r(
    'Fines are piling in a chest no one dares to open in public.',
    'A rumor that coin leaves town on quiet horses has the guilds trading whispers, not books.',
  ),
  r(
    'Night patrols are shorter than the alleys they are meant to cover.',
    'Property marks are scuffing off doorposts, and a locksmith is a busier trade than the smith.',
  ),
  r(
    'Witnesses are harder to find than they were a season ago, even for plain daylight quarrels.',
    'People finish stories with shrugs, and a clerk is filling gaps with the word "unknown" too often.',
  ),
];

export const CREEP_FOOD: readonly ProblemRow[] = [
  r(
    'Drought is tightening year by year on outlying fields.',
    'Elders are quietly discussing a shared well project that would cross feuding hamlets.',
  ),
  r(
    'A soil tired from repeat grain is asking for fallow, but rents are not asking for rest.',
    'A few younger hands are already talking about land farther west like it is a promise, not a map.',
  ),
  r(
    'Root cellars are holding less each winter, and the notion of a lean year is a calendar word again.',
    'Householders are bartering more at the gate, and a coin is a rarer sound in the lane at dusk.',
  ),
  r(
    'Commons grazing is a weekly argument, and a fence mended one moon is a fence kicked the next.',
    'A steward from below is writing polite letters that feel like a rope tightening one knot at a time.',
  ),
];

export const CREEP_FOOD_BOUNTIFUL: readonly ProblemRow[] = [
  r(
    'A run of good years left granaries with corners nobody remembers sweeping.',
    'Rats, rot, and a lazy tally are becoming a quiet tax on abundance nobody planned for.',
  ),
  r(
    'Surplus is spoiling in piles while export prices wobble, and a warehouse lease is a fight every quarter.',
    'Merchants are asking for a cartel, and small growers are asking for a fair floor that never comes.',
  ),
];

// --- Creeping: commerce & institutions ---
export const CREEP_COMMERCE_LOW: readonly ProblemRow[] = [
  r(
    'Shop fronts stay shuttered a little longer every morning, and the reason is not always sleep.',
    'Credit is a word spoken softly, and a moneylender is in more kitchens than the priest.',
  ),
  r(
    'A long slump in a staple trade is turning steady jobs into day wages with bad shoulders.',
    'Guild halls are still loud, but the songs are fewer, and apprentices are a rarity worth gossip.',
  ),
];

export const CREEP_COMMERCE_HIGH: readonly ProblemRow[] = [
  r(
    'A building boom is outrunning the masons, and every scaffold looks brave from below.',
    'Stone is late, sand is wrong, and a planner’s map is a prayer more than a promise.',
  ),
  r(
    'Rents in the busy wards climb every contract renewal, and small holders are one bad season from leaving.',
    'A few families already packed for a cousin in another town, and a rooming house is full of strangers with plans.',
  ),
  r(
    'Labor is bidding between yards, and loyalty is a word foremen use when they mean money.',
    'A strike has not started, but a breakfast rumor can idle a quay for an hour for free.',
  ),
];

export const CREEP_HEALTH: readonly ProblemRow[] = [
  r(
    'A slow cough in winter never quite leaves the almshouse hall.',
    'Healers are trading recipes for steam and herb, and a donation box is a polite fiction.',
  ),
  r(
    'Waste runs closer to the well than the old maps admit, and a dry summer could make that obvious.',
    'A mender is being paid in promises to shift a line of pipe nobody wants to name aloud.',
  ),
  r(
    'Teeth and bones are telling a story the young do not like to hear at market.',
    'Cheaper food is a stranger at the next stall, and a grandmother’s warning is a mealtime sermon.',
  ),
  r(
    'Flies in the high heat have turned a midden lane into a ward boundary nobody wants to test.',
    'A night soil cart and a tannery share a wind pattern that neighbors map like weather.',
  ),
];

export const CREEP_BANDITRY: readonly ProblemRow[] = [
  r(
    'Bandit stories used to be jokes; now caravans pay "weather fees" in the pass.',
    'No blood yet on the main road, but muleteers are carrying clubs who never used to.',
  ),
  r(
    'Strangers on the out-road are not offered a cup the way they used to be, not from hate, from habit.',
    'A public notice still reads "hospitality," and the ink is fading faster than the trust.',
  ),
  r(
    'A second toll appears on a stretch nobody voted for, and the coin box answers to a name not in the charter.',
    'A merchant is asking the reeve for soldiers; the reeve is asking a lord the town cannot afford to annoy.',
  ),
];

export const CREEP_CORRUPTION: readonly ProblemRow[] = [
  r(
    'Revenue that should buy stone for walls is vanishing into soft hands.',
    'The clerk’s books balance on paper, but the quarry ledger does not match the gate tolls.',
  ),
  r(
    'A public contract keeps winning bids from a company that shares a roof with a councillor’s cousin.',
    'Objections are filed; hearings are slow; a foundation trench is a mud pit full of good intentions.',
  ),
  r(
    'A post that should turn weekly turns monthly when coin is light and excuses are heavy.',
    'Farmers are timing trips by rumor, not by stamp, and a harvest shrinks while everyone watches.',
  ),
];

export const CREEP_GUILDS: readonly ProblemRow[] = [
  r(
    'Guild jealousies are turning policy into a slow, bitter wrestling match.',
    'A new toll proposed by the weavers has the drovers threatening to route around the town entirely.',
  ),
  r(
    'A journeyman’s oath is a sentence in a town where two guilds want the same street corner.',
    'Apprentices are listening to feuds in corners, and cheap work is leaking in from outside.',
  ),
  r(
    'A standard measure at the market hall is worn smooth enough to lie politely.',
    'A rival yard sent a "coin weight" that disagrees with the hall, and trust is a metal sound now.',
  ),
  r(
    'A new clock on the hall tower is right twice a day, and everyone chooses their favorite twice.',
    'Shift disputes are not about time; they are about who owns the minutes between bells.',
  ),
];

export const CREEP_COAST: readonly ProblemRow[] = [
  r(
    'The water table is turning brackish along the old wells.',
    'Fishers have moved nets upstream; the vegetable plots nearest the estuary are sickly.',
  ),
  r(
    'A wharf pile that used to be checked yearly is on a "when we can" schedule, and the tide is not patient.',
    'A dry barn full of old rope is a museum nobody visits until a storm does.',
  ),
  r(
    'A shingle line has crept, and a net shed that sat dry now wets a floor every new moon.',
    'A clerk is still taxing the shed as if the sea were a rumor.',
  ),
  r(
    'A reef harvest folk swore by is yielding shells that look wrong to grandmothers and right to money.',
    'Buyers in town are asking for a stamp of purity nobody knows how to forge honestly.',
  ),
];

export const CREEP_COLD: readonly ProblemRow[] = [
  r(
    'Harsh winters are outlasting stored hay reserves.',
    'Young families are already splitting for warmer valleys; tax rolls are drifting downward.',
  ),
  r(
    'Ice is staying longer in the cistern each spring, and hooves are paying the price in cracks.',
    'A farrier is a calendar appointment people dread for reasons louder than cost.',
  ),
  r(
    'A longhouse roof line is learning to lean where snow insists every year on sitting.',
    'Timber is dear; cordage is dearer; a patch is a patch until a patch is a prayer.',
  ),
];

export const CREEP_HEAT: readonly ProblemRow[] = [
  r(
    'Midday stillness lasts longer, and the field clock has become a public fiction.',
    'Hired hands want siesta written into a bargain nobody used to have to name.',
  ),
  r(
    'A cistern that once brimmed in spring now needs rationing by midsummer, and a line forms without asking.',
    'A rich house’s well is a neighbor’s gossip, and a poor house’s child is a bucket weight.',
  ),
  r(
    'Brush encroaches on pasture edge where goats used to keep it honest.',
    'A herder and a plowman are in a slow, hot argument that only fence posts understand.',
  ),
];

export const CREEP_RIVER: readonly ProblemRow[] = [
  r(
    'A shifting bar is teaching boatmen new routes that the maps do not know yet.',
    'Dredge plans are a folder thick; river bailiffs are a ledger thin; the channel does what it does.',
  ),
  r(
    'A levee that took a season to build is taking two to maintain, and the budget is a shrug.',
    'A wetter pattern upstream is a letter someone else is writing, and this town is reading it in inches.',
  ),
  r(
    'Mills and fishers are arguing over draw again, and a weir is a line drawn in water.',
    'A child can recite the old compromise; an elder can recite the exceptions.',
  ),
];

export const CREEP_DRY: readonly ProblemRow[] = [
  r(
    'A long dry is teaching everyone the names of springs they used to call "that wet patch."',
    'A shared ditch is a weekly meeting with shovels, and a shared temper is a monthly one.',
  ),
  r(
    'Windbreak trees are not replanting the way a grandfather map promised they would.',
    'Soil is lifting in gusts, and a fence meant to look neat is a fence meant to look alive.',
  ),
];

export const CREEP_HIGHLAND: readonly ProblemRow[] = [
  r(
    'A drove road is mending slower than the hooves that wear it, and a toll is static while stones move.',
    'A younger sibling left for a city job, and a flock count is a quiet grief at supper.',
  ),
  r(
    'A scree field is growing where a meadow used to be patient with sheep.',
    'A cairn moved last spring; a boundary story moved with it, and winter will test both.',
  ),
  r(
    'A small mine’s yield is a polite line on a chart, not a brag, and a brace budget shows it.',
    'Timber for supports is a negotiation with a forest that remembers every axe that lied.',
  ),
];

export const CREEP_URBAN: readonly ProblemRow[] = [
  r(
    'A new ward is rising faster than the wells can be deepened, and a queue is a kind of law.',
    'Chamber pots are a trade on certain stairs, and a night cart is a celebrity nobody wants to meet.',
  ),
  r(
    'A public square repair turned into a debate about which statue gets to look busiest.',
    'Patrons and guilds and priests are in the same ring, and the pigeons are the only agreed owners.',
  ),
  r(
    'Rents climb by stair height, and a garret is a home only if the roof agrees.',
    'A child who slept three to a bed now has a corner of floor and a grudge in daylight.',
  ),
];

export const CREEP_RURAL: readonly ProblemRow[] = [
  r(
    'A younger generation is counting miles to a market town the way their parents counted rows.',
    'A mended gate stays mended; a new song at the fire is a song about leaving.',
  ),
  r(
    'A public woodlot is a shy patch now; everyone takes a little, everyone swears a little.',
    'A warden is a name on a list; an eye is a neighbor who is tired of being one.',
  ),
  r(
    'A hereditary reeve is aging into story faster than into patience.',
    'Minutes at the moot run long; decisions run late; a season does not wait for kinship.',
  ),
];

// --- Creeping: economic role (slow) ---
export const CREEP_ECON_AGRARIAN: readonly ProblemRow[] = [
  r(
    'A rotation argument is a marriage between plow, pasture, and pride.',
    'One field wants rest; a lease wants rent; a ledger wants ink that will not smudge in rain.',
  ),
  r(
    'A seed coffer is a yearly ritual that feels less like plenty and more like a dare.',
    'A new variety arrived with a name too fine for mud, and a trial plot is a small battlefield.',
  ),
];

export const CREEP_ECON_MARKET: readonly ProblemRow[] = [
  r(
    'A market charter renewal is a stack of conditions nobody remembers agreeing to, all at once.',
    'A rival town is whispering a fair date two days earlier, and buyers have wheels.',
  ),
  r(
    'Weights and measures are an education every apprentice gets twice, once from a master, once from a crowd.',
    'A "short scoop" is a story that travels faster than honest grain.',
  ),
  r(
    'A new counting house is hiring clerks with soft hands, and a dock is hiring backs that will not last.',
    'A wage line is a line between pride and a meal, drawn fresh each morning.',
  ),
];

export const CREEP_ECON_INDUSTRIAL: readonly ProblemRow[] = [
  r(
    'Smoke settles in a new pattern, and a laundry line is a border nobody voted for.',
    'A dyer and a baker are in a slow feud measured in rinses and rising bread.',
  ),
  r(
    'A foundry’s night glow is a clock for families who do not work there but cannot sleep for it.',
    'A lull in orders is a quiet that feels louder than a hammer.',
  ),
  r(
    'Waste is finding a downstream neighbor who never signed for it, and a river is a witness.',
    'A sluice that should be clean is a folder of promises on a clerk’s desk.',
  ),
];

export const CREEP_ECON_EXTRACTIVE: readonly ProblemRow[] = [
  r(
    'A seam is thinning, and a tally is learning to be polite in feet instead of cartloads.',
    'A new tunnel is a bet against stone that does not read maps.',
  ),
  r(
    'A slag heap is a landmark children climb until an elder shouts a memory about what shifted last spring.',
    'A cap lamp line is a queue for breath as much as for pay.',
  ),
  r(
    'A company store debt is a winter coat, a week of meals, and a name written twice.',
    'Leaving is a word said in a kitchen; coming back is a word said in a yard.',
  ),
];

export const CREEP_ECON_MIXED: readonly ProblemRow[] = [
  r(
    'A wharf, a field, and a small forge are sharing a lane that was never as wide as hope.',
    'Zoning is a word from below that means "please, not in my puddle."',
  ),
  r(
    'A new tax on wheels hits everybody who has to roll something for a living, which is everybody.',
    'A mule, a dray, and a handcart are in a three-way conversation with the reeve.',
  ),
];

export const CREEP_HUMID: readonly ProblemRow[] = [
  r(
    'A mold bloom in stored cloth is a calendar note nobody wants in ink.',
    'Wool and linen are in argument with air, and a cedar chest is a luxury, not a smell.',
  ),
  r(
    'Insects are earning names that are not kind, and a net is a small mercy over a child’s bed.',
    'A smoke spiral is a ritual, not superstition, until a neighbor swears the bites slowed.',
  ),
];

// --- Creeping: size / politics ---
export const CREEP_PROSPERITY: readonly ProblemRow[] = [
  r(
    'A new coat of paint on a hall cannot hide a beam that creaks in the same place every moot.',
    'A donor wall is a list; a grudge is a subtext; a mason is a hero until the bill lands.',
  ),
  r(
    'A public feast budget shrinks while the guest list swells; hospitality is a math problem with faces.',
    'A head cook and a chamberlain are in a long, dry negotiation measured in hogsheads.',
  ),
];

export const CREEP_POP: readonly ProblemRow[] = [
  r(
    'A line at the well is a daily parliament with no gavel, only buckets.',
    'A cistern plan is a stack of paper; a shovel is a vote that will not wait.',
  ),
  r(
    'A child counts neighbors by door; a grandparent counts them by who still answers a knock.',
    'Empty places at table are a census without ink.',
  ),
];

// --- Broader "never empty" sets ---
export const CREEP_BROAD: readonly ProblemRow[] = [
  r(
    'A hereditary grudge and a new fence post are a recipe for a long, cold harvest.',
    'Mediators are in demand, and a bottle is a fee some cannot pay with coin.',
  ),
  r(
    'A public clock is a promise; a bell is a contract; a broken rope is a sermon.',
    'Time is a town resource, and some are always short.',
  ),
  r(
    'A wandering peddler left a rumor that paid better than his tin.',
    'Truth is a luxury good; gossip is a staple; the market knows both prices.',
  ),
];

export const CREEP_EMERGENCY_FALLBACK: readonly ProblemRow[] = [
  ...CREEP_DRY.slice(0, 1),
  ...CREEP_BANDITRY.slice(0, 2),
  ...CREEP_FOOD.slice(0, 2),
  ...CREEP_HEALTH.slice(0, 1),
  ...CREEP_GUILDS.slice(0, 1),
];
