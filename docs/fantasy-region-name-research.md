# Fantasy region name research

**Status:** research complete — corpus for review; generator changes not implemented.

**Researched:** 2026-10-12.

## Aim and scope

Give regions without a political affiliation names that feel at home on the front map of a
well-thumbed 1980s fantasy paperback. The target is memorable geographic identity: wild country,
forests, uplands, wastes, marshes, and broad regions. A geographic name can belong to inhabited or
politically claimed land; the reference corpus does **not** assert that these fictional places are
unowned. Exclude country, dynasty, capital, and fortress names as naming models for this purpose.

The companion [JSON corpus](fantasy-region-name-corpus.json) contains **30 published examples**
from six settings and **120 newly coined candidates** in ten landscape groups. Published names
are research references. Candidates explore the forms and tone; they are not a ready-to-import
table, and have not been checked for uniqueness against every existing fictional or real place.

This is a qualitative sample, deliberately weighted toward the requested shelf of fantasy. It
does not measure how frequently any naming form occurs across all 1980s books. Some online maps
and indexes incorporate later books; the source records distinguish those from a directly inspected
1988 map. No claim is made that every label appeared in an original 1980s edition.

## Sources and confidence

| Source                       | Why it belongs                                                                            | What was actually checked                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Raymond E. Feist, Midkemia   | _Magician_ began the series in 1982.                                                      | Entries in the [Midkemian Gazetteer](https://elvandar.crydee.com/names.htm), an [author-approved atlas archive](https://elvandar.crydee.com/). The index includes later novels and games; first appearance of individual names was not established. [Official series context](https://crydee.com/).                                                                                                                                        |
| Terry Brooks, Four Lands     | _The Sword of Shannara_ is a 1977 precursor; _Elfstones_ supplies the 1980s continuation. | A [publisher-associated reread](https://reactormag.com/rereading-the-elfstones-of-shannara-chapters-23-26/) and the [Google Books index for _Sword_](https://books.google.com/books/about/The_Sword_of_Shannara_In_the_Shadow_of_t.html?id=6V4GSXM--48C). No original map inspection. The [publisher page](https://www.randomhousebooks.com/books/19030/DR/) dates its paperback edition to 1983.                                          |
| David Eddings, Belgariad     | A close match for the requested epic-paperback tradition.                                 | [LibraryThing's omnibus place index](https://www.librarything.com/work/1272805), a community-maintained secondary reference. Geographic entries only; weaker evidence than an inspected book map.                                                                                                                                                                                                                                          |
| Dennis L. McKiernan, Mithgar | _The Iron Tower_ started in 1984.                                                         | Two visually inspected [maps hosted with permission](https://mithgar.infinispace.net/maps.html): [world map](https://mithgar.infinispace.net/maps/am_mithgar_l.jpg) and [regional map by Jack R. Cook](https://mithgar.infinispace.net/maps/jc_mithgar_l.jpg). These are later presentations, not proof of first-edition labels. [Contemporary 1984 publication notice](https://fanac.org/fanzines/MT_VOID-Pre_1990/mt_void_19840912.pdf). |
| Tad Williams, Osten Ard      | Late-decade comparison: _The Dragonbone Chair_, 1988.                                     | Visually inspected [author-hosted map](https://www.tadwilliams.com/wp-content/uploads/2014/04/osten-ard-map.jpg), bearing a 1988 copyright and the book title. [Author's map collection](https://www.tadwilliams.com/books/series/mst/osten-ard-maps/), [publication information](https://www.tadwilliams.com/books/series/mst/tdc/).                                                                                                      |
| Dragonlance, Ansalon         | The parallel TSR paperback tradition.                                                     | One geographic label from a [secondary reference entry](https://dragonlance.fandom.com/wiki/Plains_of_Dust). Its political history makes it particularly useful for separating geographic naming from ownership. [1984 novel and setting context](https://en.wikipedia.org/wiki/Dragonlance).                                                                                                                                              |

Brooks, Feist, Eddings, and McKiernan anchor the intended tone. Williams adds useful contrast in
untranslated names and related subregional names. Dragonlance is a small comparator here, not a
large enough sample to characterize that setting's naming style.

## What the sample suggests

These are editorial interpretations of the examples, not claims of authorial intent.

1. **Mix naming forms.** Joined compounds, literal landforms, metaphors, and opaque proper names
   coexist. A map made entirely of adjective-plus-biome names loses that variety.
2. **Use concrete images.** Architecture, bodies, weather, vegetation, and travel hazards provide
   memorable mental pictures. Emotional adjectives alone offer a narrower palette.
3. **Let some places have unexplained names.** A pronounceable proper root need not be a personal
   or family name. Geographic identity does not require an owner, ruler, or founder.
4. **Keep some names plain.** A simple waste or highland label makes an occasional grand metaphor
   more effective. Every name need not imply a curse, catastrophe, or cosmic mystery.
5. **Broaden geographic vocabulary.** Wold, weald, fell, brake, mire, reach, waste, and fastness
   carry more map character than repeatedly spelling out an ecological classification. Their
   meanings still need to fit the mapped place.
6. **Use related names deliberately.** Repeated roots can establish neighboring subregions. Random
   repetition has a different effect and should still be controlled.
7. **Keep labels compact.** One to four words is a useful editorial target for these map labels,
   with longer forms an occasional accent. This is a recommendation, not a measured source statistic.

## Why the current generator feels narrow

`src/lib/regions/regions.ts` assigns an unaffiliated region its name through
`generateRegionGeographicName`, using the isolated `region-name` RNG stream. That helper calls
the shared `generateLandscapeName` in `src/lib/names/landscape_names.ts`.

The whole-region call supplies no directions. Without a dominant culture, it also supplies no
cultural naming patterns. That leaves the descriptive form: one of fourteen mostly quiet,
dreamlike epithets followed by a map-compatible noun. Where no biome or landform has sufficient
support, the fallback noun is Country. Adding more gentle adjectives would enlarge the table but
preserve this structural sameness.

The same shared helper names connected habitat zones, so changing it globally would also change
zone naming. A later implementation needs an explicit decision about whether whole-region names
and zone labels should share the same repertoire and weighting.

## Applying this research

Use the published examples to judge **forms**, rather than loading franchise names into the
production generator. Review the coined candidates as a tone board and vocabulary source.

A useful initial mix to audition for unaffiliated whole regions would be 30% compounds, 25%
epithet-plus-terrain, 20% geographic metaphors, 15% invented geographic roots, and 10%
terrain-of-image forms. Those are proposed editorial weights, not measured frequencies; compare
a fixed-seed batch before deciding. Renormalize over forms that are actually eligible.

Candidate vocabulary falls into three different eligibility classes:

- **Already available evidence:** forest, wetland, desert, grassland, cold biome, hills, mountains,
  and plains can draw on the current biome/landform checks. Preserve their thresholds.
- **Additional evidence required:** coast, riverland, valley, delta, cliff, dune, glacier, and
  numerical or shape claims need explicit rules. A river somewhere on a map is not enough to name
  the entire region a delta. A sevenfold name should not assert seven channels by accident.
- **Folklore decisions:** widows, bells, monsters, ashes, glass, and invented vegetation names may
  be traditional names without literal referents. Decide which can be poetic and which would
  misleadingly imply an ecological, material, or historical fact. Do not add such facts to the
  generated description merely to explain the name.

Several candidates intentionally go beyond the current approved restrictions on species,
resources, landmarks, and shape adjectives in [the landscape naming design](region-landscape-names.md).
They show the desired creative range; accepting the entire candidate list without an eligibility
review would weaken that contract. An invented geographic root also needs a reproducible source
that is distinct from pretending a personal name is a country.

Preserve the existing constraints: caller-owned seeded randomness, explicit batch uniqueness,
map-compatible literal nouns, stable fact IDs and footprints, and verbatim loading of saved or
authored names. Avoid parenthetical numbered names in ordinary output by providing enough variety
and a natural geographic disambiguation strategy.

Implementation should follow a separate accepted design if it introduces new naming styles or
context types. This research document changes no runtime behavior or persisted data.

## Corpus

The sections below list the human-readable corpus. The JSON supplies source IDs, evidence notes,
landscape groups, form classifications for published examples, and eligibility notes for candidates.
The classifications are editorial reading aids, not authoritative biome or political classifications
of the fictional settings. Articles and map capitalization have been normalized where appropriate.

### Published reference names

**Raymond E. Feist — Midkemia**

Dimwood; Green Heart; Grey Towers; High Wold; High Fastness; Grimstone Mountains; Teeth of the World; Mother of Waters.

**Tad Williams — Osten Ard**

Nornfells; Frostmarch; Wealdhelm; Aldheorte; High Thrithing; Meadow Thrithing; Lake Thrithing; Wran.

**Dennis L. McKiernan — Mithgar**

Barrens; Untamed Lands; Steppes of Kood.

**Terry Brooks — Four Lands**

Matted Brakes; Wilderun; Black Oaks; Mist Marsh; Shady Vale; Anar Forests.

**David Eddings — Belgariad**

Wood of the Dryads; Vale of Aldur; Isle of the Winds; Sea of the Winds.

**Dragonlance setting / multiple authors — Ansalon**

Plains of Dust.

### Newly coined candidates

These are proposed names, not quotations from the novels.

**Woodland**

Briarshade; Gloamwood; Thornwake; Hushbough; The Ragged Weald; The Hollow Woods; The Grey Canopy; The Wood of Lost Bells; The Foxglove Wilds; Veldren Wood; Ormath Forest; The Elder Tangle.

**Upland**

The Broken Crown; The Giant’s Stair; The Harrow Peaks; The Iron Fells; The Stormspires; The Grey Ramparts; The Haggard Hills; The Wyrmback; The Heights of Mourning; The Crags of Veyr; The Thunderscar; The Bleak Ridges.

**Grassland**

The Long Wold; The Sere Downs; The Windworn Plains; The Foxglove Sea; The Empty Meadows; The Pale Pastures; The Larkless Fields; The Grass Ocean; The Plains of Ashen Dreams; The Wold of Vareth; The Tallow Downs; The Fallow Vast.

**Wetland**

The Sable Mire; The Drowned Reaches; The Hushfen; The Widow’s Marsh; The Lantern Bogs; The Reedmaze; The Mournwater Fens; The Marsh of Lost Voices; The Crooked Sloughs; The Veylan Mire; The Dim Reeds; The Sinking Country.

**Dryland**

The Cinder Waste; The Thirsting Sands; The Pale Desolation; The Glass Barrens; The Scoured Lands; The Furnace Plain; The Sands of Regret; The Vulture Reach; The Hollow Desert; The Bleached Expanse; The Vaust Wastes; The Last Dunes.

**Coldland**

The Rimewaste; The White Silence; The Shivering Lands; The Frostwold; The Glass Tundra; The Winter Shroud; The Icebound Reaches; The Cold Vast; The Snowfields of Orven; The Veil of Winter; The Hoarfrost Barrens; The Nacre Icefields.

**Coast**

The Ragged Coast; The Widow’s Shore; The Saltward Reaches; The Gullworn Cliffs; The Coast of Lost Lanterns; The Drowned Strand; The Grey Littoral; The Wrecking Shore; The Far Shallows; The Brinewild; The Vaelor Coast; The Tideworn Margin.

**Riverland**

The Siltward Lands; The Weeping Banks; The Reedbound Vale; The Crooked Waters; The Sevenfold Delta; The Floodveil; The River’s Cradle; The Low Reaches; The Vale of Hadrin; The Wandering Channels; The Mudglass Flats; The Waterwoven Country.

**Broad Country**

The Far Hush; The Grey Beyond; The Outer Wilds; The Hollow Reaches; The Ragged Expanse; The Lonesome Vast; The Unremembered Lands; The Duskward Country; The Veiled Reach; The Worn Lands; The Lost Breadth; The Hither Wilds.

**Proper Name Country**

Varneth; Ossarel; Thervane; Caldrith; Eshvar; Velmora; Drauveth; Kelmoran; Sorvane; Maeroth; Nhalven; Orsath.
