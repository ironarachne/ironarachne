# Fantasy raw-resource source review ledger

**Status:** accepted review ledger supporting [#364](https://github.com/ironarachne/ironarachne/issues/364).
The human reviewer explicitly approved this ledger and the revised
[source domain model](fantasy-raw-resource-sources.md) on 2026-10-14.
The accepted first-pass source rules are implemented; deferred rows remain outside #364.

## Reading the ledger

Each row describes a raw commodity, a specific producer or deposit, a harvested part, acquisition
mode/method, a proposed habitat or occurrence gate, reviewed uses, food status, and consumer needs.
Linked sources support identity, material use or a stated restriction. Numeric habitat bands,
selection caps and omissions are our proposed fictional-world rules, not measured distributions.
This is a source review, not a claim that future recipe chains have been reviewed or implemented.

**Propose** means the commodity and acquisition distinction have a reference basis and fit the
proposed model. It remains subject to human review, catalog authoring and positive/omission tests.
**Baseline** means retain the existing explicit rule; the row records its boundaries rather than
claiming a new scientific validation. **Defer** means no automatic new regional source in #364;
the row identifies the actual blocker. A deferred entry is not a missing local commodity or an
import requirement.

`C` = cultivation, `H` = husbandry, `A` = apiary, `W` = wild occurrence, `D` = selected deposit.
Multiple modes in one row mean separate versioned source definitions, never a fallback from
missing management to generic wild presence. Biological source IDs take the form
`fantasy:source:<raw-key>:<producer-key>:<mode>:v1`. Deposits use
`fantasy:source:<raw-key>:deposit:v1`. Producer keys are canonical plant IDs or species identities;
scientific names below document the review and must not be inferred from legacy generic labels.

Food status uses the proposal's types: **ordinary** is an ingredient with appropriate handling,
**recipe-required** restricts generated food uses to the listed planned product keys, **not-food**
claims no food use, and **unknown** supplies no reviewed food claim. Planned product keys below
are #365 design candidates, not existing recipes. No unimplemented key makes a regional product.
Even ordinary food does not certify raw consumption, water purity or a safe preservation process.

The review scope is the expansion families and all 21 existing metal-ore entries. Unchanged
timber, gemstones, quarry stones and freshwater/land assessments retain the prior design's
qualified rules. They are not replaced by a generic keyed-material inference. Existing unreviewed
species-derived entries remain catalog possibilities; new keyed food supply is confined to the
explicit producers reviewed here. This does not retroactively change old saves.

## Proposed habitat and support gates

The ranges below evaluate saved land-node temperature in degrees Celsius and normalized moisture.
They are coarse eligibility proxies, not growing-season or water-temperature measurements. All
wild rules require a selected current occurrence. All managed rules require an owned production
fact, reachable local land and saved current support; satisfying a profile never creates supply
by itself. Require habitat/node overlap, not a compatible climate description elsewhere in a
region. Each named gate can expand into separate bank/shore rules where its water requirement
would otherwise be ambiguous.

| Gate                  | Environments; temperature; moisture                | Mandatory extra evidence and support                                                                          |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `reed-margin`         | swamp/grassland/forest; 0–30; 0.6–1                | Actual freshwater bank or lake shore; cutting access                                                          |
| `papyrus-margin`      | swamp; 15–35; 0.6–1                                | Actual freshwater bank or lake shore; no ocean substitution                                                   |
| `temperate-field`     | grassland; 8–25; 0.3–0.7                           | C: cultivable-ground source overlapping production anchor; reachable freshwater; loam/silt                    |
| `cool-field`          | grassland; 5–22; 0.3–0.7                           | C: same support as temperate-field; cultivar/season not simulated                                             |
| `warm-field`          | grassland; 18–30; 0.35–0.75                        | C: same support; no cotton in a cold tundra patch                                                             |
| `temperate-orchard`   | grassland; 8–26; 0.3–0.7                           | C: cultivable ground, freshwater, loam/silt; assertion of an established fruiting planting                    |
| `warm-orchard`        | grassland; 12–30; 0.3–0.6                          | C: same orchard support; no automatic forest tree cultivation                                                 |
| `temperate-woodland`  | forest; 5–25; 0.35–0.8                             | W: exact reviewed plant population; no generic tree-name upgrade                                              |
| `temperate-edge`      | forest/grassland; 5–25; 0.35–0.8                   | W: exact plant; C uses temperate-field instead                                                                |
| `dry-herb`            | grassland; 10–28; 0.3–0.55                         | C: cultivable ground, freshwater, loam/silt; no wet swamp herb rule                                           |
| `wet-willow`          | forest/grassland/swamp; 5–25; 0.5–0.9              | W: exact willow population plus freshwater-margin evidence                                                    |
| `pine-woodland`       | forest; 8–30; 0.3–0.8                              | W: reviewed resin-producing pine; tapping access                                                              |
| `pasture`             | grassland; 5–28; 0.3–0.8                           | H: freshwater and a current reviewed grazing plant population; no arable-source requirement                   |
| `goat-browse`         | forest/mountain; 5–28; 0.3–0.8                     | H: freshwater and reviewed accessible browse/grazing population; matches existing goat environments           |
| `bee-forage`          | forest/grassland; 10–30; 0.3–0.8                   | W: saved colony occurrence; A: owned colony. Both require reviewed flowering forage and accessible freshwater |
| `freshwater-fish`     | forest/grassland/swamp; 5–25; 0.3–1                | W: explicit fish bank/shore occurrence, actual freshwater edge/node and land access                           |
| `freshwater-crayfish` | forest/grassland/swamp; 5–25; 0.4–1                | W: reviewed freshwater species, actual freshwater margin and land access                                      |
| `cool-coast`          | coastal; 5–25; 0.3–1                               | W: explicit coastal-margin occurrence, adjacent ocean and land access; excludes offshore-only occurrences     |
| `warm-coast`          | coastal; 10–30; 0.3–1                              | W: same coast evidence; no freshwater oyster inference                                                        |
| `wild-game`           | Existing species-compatible reviewed land habitats | W: species-specific current occurrence, habitat compatibility and hunting access; no global beast-food rule   |

The existing arable-ground rule additionally limits elevation and accepts a particular soil set.
Managed crop gates must intersect it, not redefine it or turn all fertile land into cropped land.
The freshwater support rule is intentionally conservative; this draft omits crops where the
existing model cannot establish that support even if real rain-fed agriculture could succeed.

Forage is a required dependency, not a commodity inferred from the absence of other vegetation.
The first reviewed support catalog proposes common perennial ryegrass (`Lolium perenne`) and
white clover (`Trifolium repens`) for grazing, with white clover also supporting flowering forage.
Their `temperate-edge` populations are eligible for explicit selection. Keep old generic grass,
wildflower and clover labels descriptive unless an approved alias is genuinely unambiguous.
**Propose** both as identified support populations, rather than edible raw inventory outputs.
[US Forest Service ryegrass review](https://research.fs.usda.gov/feis/species-reviews/lolperp)
supports livestock forage use; [USDA pasture species review](https://www.nrcs.usda.gov/plantmaterials/idpmstn9400.pdf#page=22)
supports white clover pasture use; [NC State white clover](https://plants.ces.ncsu.edu/plants/trifolium-repens/common-name/clover/)
identifies its honeybee forage value. The coarse rules make no balanced-diet claim and do not
simulate forage toxicity, contamination or seasonal shortage. Use ryegrass as the initial grazing
gate; white clover establishes flowering forage and may accompany it, but does not by itself
establish a complete ruminant diet. Generic forest browse remains unreviewed. Goat sources require
reachable reviewed grazing support even where their own production anchor is forest/mountain.
The forage links must resolve before a managed animal or bee source becomes positive.

## Plant fibers

All rows use inventory kind `fiber`. Cotton is a seed-associated input; raw bast stems are not
prepared spinning fiber. New raw identities never match the existing flax-only linen route merely
because they share a textile use.

| Raw key and producer / part                                              | Mode, method and gate                                                         | Uses; food                                  | Decision, consumer and restriction                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reed-stems`; common reed, `Phragmites australis`; stems                 | W / cutting / reed-margin; cutting tool                                       | textile, construction; not-food             | **Baseline** reed matting/thatch identity. [FAO reed uses](https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=8532). No cloth or reed-food inference.                                                                                                                                      |
| `papyrus-stems`; `Cyperus papyrus`; stems                                | W / cutting / papyrus-margin; cutting tool                                    | textile, construction, industrial; not-food | **Baseline** matting; paper-like sheet processing in #365. [Kew papyrus](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A330934-2/general-information). Not every ornamental sedge is papyrus.                                                                               |
| `flax-stems`; `Linum usitatissimum`; stems                               | W / cutting / existing flax rule; C / cutting / temperate-field; cutting tool | textile; not-food                           | **Baseline + Propose** cultivated alternative. Existing prepared-flax/linen chain remains separate from linseed oil. [CFIA flax identity and parts](https://inspection.canada.ca/en/plant-varieties/plants-novel-traits/applicants/directive-94-08/biology-documents/linum-usitatissimum-flax). |
| `cotton-seed-fiber`; `Gossypium hirsutum`; fiber-bearing harvested bolls | C / gathering / warm-field; collection containers                             | textile; not-food                           | **Propose** raw seed cotton, with seed separation before yarn/cloth in #365. Display must retain seeds; this is not already cleaned lint. [FAO cotton](https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=1160). No cottonseed-food output.                                                |
| `hemp-stems`; fiber-crop `Cannabis sativa`; stems                        | C / cutting / temperate-field; cutting tool                                   | textile; not-food                           | **Propose** bast preparation, cordage and hemp cloth in #365. [FAO-associated hemp profile](https://feedipedia.review.fao.org/node/50). No psychoactive, seed-food or medicinal claim from this source definition.                                                                              |
| `nettle-stems`; `Urtica dioica`; mature stems                            | W / cutting / temperate-edge; cutting tool and protective handling equipment  | textile; not-food                           | **Propose** bast preparation and nettle cloth in #365. [Kew nettle material use](https://www.kew.org/read-and-watch/long-live-the-weeds). Nettle foliage is a different part and gets no food claim here.                                                                                       |

Preserve current classification of reed (`plant-fiber/reed`), papyrus (`plant-fiber/papyrus`) and
flax (`plant-fiber/textile`, exact flax name). New cotton/hemp/nettle descriptors use distinct
minor types `seed-cotton`, `hemp-stem`, `nettle-stem`, so generic textile matching cannot invent linen.

## Grains and pulses

Each is a cultivated harvested-seed source, not a crop inferred from pasture, potential arable land
or a grass population. Harvest method is cutting for cereals and gathering for pulses, with cutting
tools/collection containers as applicable. These rows use inventory kind `food`, major type
`plant-food`, and a commodity-specific minor type. They do not match existing meat preservation.

| Raw key and exact producer / part                              | Gate            | Food and planned allowed product keys              | Decision, reference and limit                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `wheat-grain`; `Triticum aestivum`; grain                      | temperate-field | recipe-required: `wheat-bread`, `cooked-wheat`     | **Propose** food; milling intermediate needs its own complete recipe. [Kew wheat](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A332110-2/general-information). Grain is not flour.                                                                                          |
| `barley-grain`; `Hordeum vulgare`; grain                       | temperate-field | recipe-required: `barley-porridge`, `barley-bread` | **Propose** food. Brewing needs malting and full #365 inputs. [FAO-associated barley](https://feedipedia.review.fao.org/node/227). No automatic beer.                                                                                                                                            |
| `oat-grain`; `Avena sativa`; grain                             | cool-field      | recipe-required: `oat-porridge`, `oatcakes`        | **Propose** food; dehulling/preparation belongs in the chain. [FAO oats](https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=481). Oat grain is not a saved grazing population.                                                                                                              |
| `rye-grain`; `Secale cereale`; grain                           | cool-field      | recipe-required: `rye-bread`, `cooked-rye`         | **Propose** food under the same coarse crop model, not a different perennial hybrid. [UMN winter cereal review](https://extension.umn.edu/about/our-stories/news/source-magazine/a-hard-look-at-winter-cereal-crops). No ergot/contamination simulation or safety claim.                         |
| `lentil-seed`; `Lens culinaris`; mature seed                   | temperate-field | recipe-required: `cooked-lentils`                  | **Propose** food. [FAO lentil](https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=7209). Not every legume is a lentil.                                                                                                                                                                      |
| `pea-seed`; garden/field pea, `Pisum sativum`; mature dry seed | cool-field      | recipe-required: `cooked-peas`                     | **Propose** food. [USDA pea identity](https://www.nrcs.usda.gov/plantmaterials/wapmcpg11190.pdf). Excludes sweet pea and separate green-pod products.                                                                                                                                            |
| `common-bean-seed`; `Phaseolus vulgaris`; mature dry seed      | warm-field      | unknown; no generated food chain yet               | **Defer** automatic source until a specific food-preparation rule is reviewed. Generic smoking/drying cannot establish suitability. [FDA bean-toxin basis](https://www.fda.gov/food/chemical-contaminants-pesticides/natural-toxins-food). This remains a reviewed gap, not safe generic pulses. |

Allowed product keys are semantic permissions, not a claim that those recipes are currently safe
or complete. Recipe-required sources can be saved before #365, but cannot become new direct staples
or bypass their required transformations. A nonfood milling intermediate can feed an approved
final chain; it must not independently clear the food restriction. This exposes a consumer-design
gap discussed below.

## Orchard fruit, nuts, vegetables and culinary herbs

All proposed cultivated rows require C facts and gathering, collection containers and any indicated
tool. Ordinary food applies only to the reviewed edible part, never all leaves, seeds or pits.
These use `plant-food/<raw-key>` and inventory kind `food`. Existing mature/orchard status is a coarse
world assertion; sapling age, chilling hours, pollination success and fruiting seasons are not
simulated. None of the orchard rows automatically produces oil, alcohol or preserved provisions.

| Raw key; producer and part                                          | Mode / gate                                             | Uses; food                                                     | Decision, consumer and evidence                                                                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apple-fruit`; `Malus domestica`; fruit flesh                       | C / temperate-orchard                                   | food; ordinary                                                 | **Propose** fresh fruit, cooked/preserved fruit and cider chains later. [NC State apple](https://plants.ces.ncsu.edu/plants/malus-domestica/). Generic wild apple labels require separate review.                                     |
| `pear-fruit`; `Pyrus communis`; fruit flesh                         | C / temperate-orchard                                   | food; ordinary                                                 | **Propose** fruit/preserves. [NC State pear](https://plants.ces.ncsu.edu/plants/pyrus-communis/). No seed product.                                                                                                                    |
| `plum-fruit`; `Prunus domestica`; fruit flesh excluding stone       | C / temperate-orchard                                   | food; ordinary                                                 | **Propose** fruit/preserves. [NC State plum](https://plants.ces.ncsu.edu/plants/prunus-domestica/). Related ornamental cherries are not interchangeable.                                                                              |
| `olive-fruit`; `Olea europaea`; harvested fruit                     | C / warm-orchard                                        | food, industrial; recipe-required: `cured-olives`, `olive-oil` | **Propose** raw input with restricted food use. [Kew olive](https://www.kew.org/plants/olive). Curing/pressing are #365 processing; not ready table olives or oil.                                                                    |
| `grape-fruit`; `Vitis vinifera`; ripe fruit                         | C / warm-orchard                                        | food; ordinary                                                 | **Propose** fruit, raisins and wine routes. Supports/pruning equipment are explicit cultivation assumptions. [NC State grape](https://plants.ces.ncsu.edu/plants/vitis-vinifera/). No wild-vine or fermentation inference.            |
| `hazelnut`; `Corylus avellana`; nut, edible kernel                  | W / temperate-woodland; C / temperate-orchard           | food; ordinary                                                 | **Propose** distinct gathering/cultivation source IDs. Shell removal is handling; shells are not food. [NC State hazel](https://plants.ces.ncsu.edu/plants/corylus-avellana/).                                                        |
| `walnut`; `Juglans regia`; nut, edible kernel                       | C / temperate-orchard                                   | food; ordinary                                                 | **Propose** cultivated source only in this ledger. [NC State walnut](https://plants.ces.ncsu.edu/plants/juglans-regia/). Do not map every walnut species or wild timber occurrence to it.                                             |
| `sweet-chestnut`; `Castanea sativa`; nut, edible kernel             | W / temperate-woodland; C / temperate-orchard           | food; ordinary                                                 | **Propose** separate wild/cultivated sources. [NC State sweet chestnut](https://plants.ces.ncsu.edu/plants/castanea-sativa/). Explicitly excludes horse chestnut.                                                                     |
| `oak-acorn`; `Quercus robur`; acorn                                 | W / temperate-woodland                                  | unknown food                                                   | **Defer** human food and automatic source; preparation review is absent. [NC State oak warnings](https://plants.ces.ncsu.edu/plants/quercus-robur/common-name/common-oak/). No generic oak-to-staple shortcut or livestock-feed rule. |
| `turnip-root`; turnip form of `Brassica rapa`; enlarged root        | C / cool-field; digging tool                            | food; ordinary                                                 | **Propose** crop-specific plant key, not every Brassica rapa form. [UF/IFAS turnip parts](https://gardeningsolutions.ifas.ufl.edu/plants/edibles/vegetables/greens/). Greens are a separate future output.                            |
| `carrot-root`; cultivated `Daucus carota` subsp. `sativus`; taproot | C / cool-field; digging tool; exclude clay-only support | food; ordinary                                                 | **Propose** garden carrot only. [NC State carrot](https://plants.ces.ncsu.edu/plants/daucus-carota-subsp-sativus/). No wild-carrot/umbellifer alias.                                                                                  |
| `cabbage-head`; cabbage form of `Brassica oleracea`; leaf head      | C / cool-field; cutting tool                            | food; ordinary                                                 | **Propose** plant key identifies the cabbage crop. [NC State cabbage](https://stem.plantsforhumanhealth.ncsu.edu/school-gardens/crop-guides/crop-guide-cabbage/). Does not yield cauliflower by species name alone.                   |
| `onion-bulb`; bulb onion form of `Allium cepa`; bulb                | C / temperate-field; digging tool                       | food; ordinary                                                 | **Propose** crop-specific bulb supply. [NC State onion](https://plants.ces.ncsu.edu/plants/allium-cepa/). Generic allium labels remain insufficient.                                                                                  |
| `spearmint-leaf`; `Mentha spicata`; leaves                          | C / temperate-field; cutting tool                       | food; ordinary                                                 | **Propose** culinary herb, not medicine. [NC State spearmint](https://plants.ces.ncsu.edu/plants/mentha-spicata/). Other mint-like plants require their own review.                                                                   |
| `thyme-leaf`; `Thymus vulgaris`; leaves/culinary shoots             | C / dry-herb; cutting tool                              | food; ordinary                                                 | **Propose** culinary herb. [NC State thyme](https://plants.ces.ncsu.edu/plants/thymus-vulgaris/). No generic aromatic-plant substitution.                                                                                             |

Plant IDs may distinguish named crop forms without adding cultivar genetics: `turnip`, `cabbage`
and `bulb-onion` describe the deliberately selected crop, rather than accepting all products from
the taxonomic species. Legacy generic flora descriptions remain readable without acquiring that
crop identity on load.

## Medicinal, dye, resin and tannin plants

These use inventory kind `plant-material`, classification `plant-material/<raw-key>`, and
**not-food**. Medicinal association is evidence of material use in a fictional culture, not a
therapeutic claim. All acquisition uses gathering/cutting, appropriate collection equipment and
the specifically named tool where relevant. Ready dyes, tannin extract, pitch and resin distillates
are processing outputs, not raw products.

| Raw key; exact producer and part                              | Mode / gate / method requirement                                   | Uses            | Decision, consumer and evidence                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `purple-willow-bark`; `Salix purpurea`; bark                  | W / wet-willow / cutting; bark tool                                | medicinal       | **Propose** material association only. [EMA willow identity](https://www.ema.europa.eu/en/medicines/herbal/salicis-cortex). A generic willow timber label does not establish this reviewed species.                                                                                         |
| `yarrow-herb`; `Achillea millefolium`; flowering aerial parts | W / temperate-edge / cutting                                       | medicinal       | **Propose** association only; no dosage or healing effect. [EMA yarrow identity](https://www.ema.europa.eu/en/medicines/herbal/millefolii-herba). Potential flowering source, not a year-round harvest guarantee.                                                                           |
| `calendula-flower`; `Calendula officinalis`; flowers          | C / temperate-field / gathering                                    | medicinal       | **Propose** cultivated flower source. [EMA calendula identity](https://www.ema.europa.eu/en/medicines/herbal/calendulae-flos). No generalized marigold-food claim.                                                                                                                          |
| `woad-leaf`; `Isatis tinctoria`; leaves                       | C / temperate-field / cutting                                      | dye             | **Propose** raw precursor to blue dye. [Cambridge dye trail, woad](https://s3-eu-west-1.amazonaws.com/assets.botanic.cam.ac.uk/wp-content/uploads/2024/06/dyes-trail_04_2024_web.pdf#page=10). Dyeing needs a complete #365 route.                                                          |
| `madder-root`; `Rubia tinctorum`; roots                       | C / temperate-field / gathering; digging tool                      | dye             | **Propose** raw root input. [Cambridge dye trail, madder](https://s3-eu-west-1.amazonaws.com/assets.botanic.cam.ac.uk/wp-content/uploads/2024/06/dyes-trail_04_2024_web.pdf#page=11). Maturity/colour yield not simulated.                                                                  |
| `weld-herb`; `Reseda luteola`; dye-bearing aerial material    | C / temperate-field / cutting                                      | dye             | **Propose** yellow-dye precursor. [Cambridge dye trail, weld](https://s3-eu-west-1.amazonaws.com/assets.botanic.cam.ac.uk/wp-content/uploads/2024/06/dyes-trail_04_2024_web.pdf#page=10). No automatic mordant supply.                                                                      |
| `maritime-pine-resin`; `Pinus pinaster`; crude resin          | W / pine-woodland / gathering; tapping tool and collection vessels | industrial      | **Propose** explicitly tapped source. [FAO pine oleoresin acquisition](https://www.fao.org/4/x5326e/x5326e0a.htm). Pitch/rosin/turpentine belong to #365; generic pine occurrence does not prove this species.                                                                              |
| `english-oak-bark`; `Quercus robur`; bark                     | W / temperate-woodland / cutting; bark tool                        | tanning, dye    | **Propose** raw tannin-bearing bark. [Kew English oak uses](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A304293-2/general-information). Tanning requires hide, preparation and full recipe inputs.                                                                    |
| `oak-gall`; oak plus gall-producing wasp; galls               | W / woodland / gathering                                           | dye, industrial | **Defer** source despite known use: oak presence alone does not establish galls; no reviewed gall-relationship source is saved. [Cambridge oak-gall distinction](https://s3-eu-west-1.amazonaws.com/assets.botanic.cam.ac.uk/wp-content/uploads/2024/06/dyes-trail_04_2024_web.pdf#page=8). |

## Live animal and colony products

Rows here are conditional on reviewed forage support. They do not create positive managed facts
from just the producer's catalog presence. Dairy output is an opportunity from a saved managed
herd; sex counts, lactation stage and a continuous supply are not simulated. The managed rule ID
records that it is a dairy/egg/wool/colony activity, rather than an arbitrary domestication relation.

| Raw key; producer and part                                                                       | Mode / gate / method; requirements                                                                       | Uses; food                     | Decision, consumer and evidence                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sheep-fleece`; new **wool sheep** archetype (`Ovis aries`, explicitly wool-bearing); raw fleece | H / pasture / shearing; shears and handling area                                                         | textile; not-food              | **Propose** scouring/preparation, yarn, felt/cloth in #365. [FAO wool preparation](https://www.fao.org/4/v9384e/v9384e10.htm). A wool-bearing archetype is deliberate; [hair sheep exist](https://www.fao.org/4/x6552e/X6552E06.htm).               |
| `goat-textile-hair`; fiber-selected goat; coat fiber                                             | H / goat-browse / shearing or combing                                                                    | textile; not-food              | **Defer** generic goat output. No saved fiber-producing breed/capability identity, and combing is not in the current proposed method enum. [FAO animal fibers](https://www.fao.org/4/v9384e/v9384e00.htm). Generic fur is not cashmere or mohair.   |
| `camel-textile-hair`; reviewed fiber-bearing camel; coat fiber                                   | H / a reviewed cold-arid gate / combing or shed-hair gathering                                           | textile; not-food              | **Defer** generic desert camel; identity and habitat need narrowing. [FAO camel fiber acquisition](https://www.fao.org/4/v9384e/v9384e10.htm). Do not equate every camel with the reviewed textile source.                                          |
| `cow-milk`; existing cow; milk                                                                   | H / pasture / milking; milking containers                                                                | food; ordinary                 | **Propose** dairy ingredient, not a certified drink. [FAO dairy species](https://www.fao.org/dairy-production-products/production/dairy-animals/). Cheese/butter processing later; wild cow presence yields no milk.                                |
| `goat-milk`; existing goat; milk                                                                 | H / goat-browse / milking; milking containers                                                            | food; ordinary                 | **Propose** separate species source. [FAO dairy species](https://www.fao.org/dairy-production-products/production/dairy-animals/). No milk from wild ibex or arbitrary grazers.                                                                     |
| `sheep-milk`; new wool sheep; milk                                                               | H / pasture / milking; milking containers                                                                | food; ordinary                 | **Propose** explicit dairy opportunity, independently reviewed from wool. [FAO milk composition](https://www.fao.org/dairy-production-products/products/milk-composition/). Neither fleece nor carcass meat alone establishes dairy.                |
| `goose-egg`; existing goose under an explicit domestic egg-production rule; eggs                 | H / pasture / egg-collection; nesting provision and containers                                           | food; ordinary                 | **Propose** managed grazing-based egg opportunity. [FAO goose food eggs](https://www.fao.org/4/y4359e/y4359e0i.htm), [pasture use](https://www.fao.org/4/y4359e/y4359e0b.htm). Coarse forage gate makes no feed-balance or high-production claim.   |
| `chicken-egg`; domestic chicken; eggs                                                            | H / reviewed poultry site / egg-collection                                                               | food; ordinary candidate       | **Defer** source: no supported earlier feed source or omnivorous-forage gate. [FAO poultry feed/egg dependency](https://www.fao.org/4/t0690e/t0690e08.htm). Cannot make crop-derived feed support depend on the same managed pass without redesign. |
| `honeycomb`; new honeybee, `Apis mellifera`; honey-containing comb                               | W or A / bee-forage / colony-harvest; protective gear, collection vessels; A additionally hive provision | food; ordinary                 | **Propose** two distinct source definitions. [FAO wild versus managed colony harvest](https://www.fao.org/4/y5110e/y5110e0b.htm). W requires saved colony form and forage evidence; honey extraction is #365.                                       |
| `wax-bearing-comb`; same honeybee; wax-bearing comb                                              | W or A / bee-forage / colony-harvest; same requirements                                                  | industrial, ornament; not-food | **Propose** raw wax feedstock. [FAO beeswax identity](https://www.fao.org/4/w0076e/w0076e12.htm). Rendered/clean wax and candles are products. Shares colony support with honey; no independent-supply count or quantitative coproduct allocation.  |

Do not add breed simulation merely to clear the deferred hair rows. An explicitly narrower future
species archetype or saved capability could resolve them, but that choice needs human review.
Likewise chicken eggs are deferred for missing support modeling, not because chickens cannot
provide them. Wild nest/egg collection, live plucking and non-honeybee colony products remain excluded.

## Carcass resources

The existing derivation API can still describe many species' possible products. The new reviewed
regional supply set starts with the rows below, using inherited current compatible species/habitat
rules. `W` requires hunting; `H` requires saved managed production and slaughtering. Handling
requirements include appropriate hunting/butchery tools and collection/cleaning equipment.
No stored corpse, kill event or quantity is introduced: these remain potential acquisition facts.

| Raw key; producer / harvested part                               | Source                       | Uses; food; classification                      | Decision, consumer and reference                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cow-meat`; cow / flesh                                          | H / pasture                  | food; ordinary; organic/red_meat                | **Propose** preserve existing beef catalog name; existing raw-meat chains remain qualified. [FAO meat/byproduct separation](https://www.fao.org/4/x6114e/x6114e03.htm).                                                                                                                |
| `goat-meat`; goat / flesh                                        | H / goat-browse              | food; ordinary; organic/red_meat                | **Propose** preserve chevon name. [FAO small-ruminant products](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                            |
| `sheep-meat`; wool sheep / flesh                                 | H / pasture                  | food; ordinary; organic/red_meat                | **Propose** no lamb age-grade claim. [FAO small-ruminant products](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                         |
| `goose-meat`; goose / flesh                                      | H / pasture                  | food; ordinary; organic/poultry                 | **Propose** goose food source distinct from nesting eggs. [FAO goose meat](https://www.fao.org/4/y4359e/y4359e0b.htm).                                                                                                                                                                 |
| `cow-hide`; cow / raw skin                                       | H / pasture                  | textile, industrial; not-food; organic/hide     | **Propose** raw hide, not leather. [FAO byproducts](https://www.fao.org/4/x6552e/X6552E10.htm). Tannin, water and processing in #365.                                                                                                                                                  |
| `goat-hide`; goat / raw skin                                     | H / goat-browse              | textile, industrial; not-food; organic/hide     | **Propose** preserve catalog identity. [FAO byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                                    |
| `sheep-hide`; wool sheep / raw skin                              | H / pasture                  | textile, industrial; not-food; organic/hide     | **Propose** fleece on skin is not a second sheared-fleece yield. [FAO byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                          |
| `cow-bone`; cow / carcass bone                                   | H / pasture                  | industrial, ornament; not-food; organic/bone    | **Propose** bone implements/ornament; no broth or edible bone meal. [FAO carcass composition](https://www.fao.org/4/X6114E/x6114e04.htm).                                                                                                                                              |
| `goat-bone`; goat / carcass bone                                 | H / goat-browse              | industrial, ornament; not-food; organic/bone    | **Propose** same raw-part boundary, separate species ID. [FAO byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                  |
| `sheep-bone`; wool sheep / carcass bone                          | H / pasture                  | industrial, ornament; not-food; organic/bone    | **Propose** raw bone only. [FAO byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                                                |
| `cow-fat`; cow / raw fatty tissue                                | H / pasture                  | industrial, fuel; not-food; organic/raw-fat     | **Propose** feedstock for reviewed tallow/candle/soap routes; not rendered fat. [FAO raw versus processed slaughter fats](https://www.fao.org/4/x9892e/x9892e00.pdf). Food-grade review remains separate.                                                                              |
| `sheep-fat`; wool sheep / raw fatty tissue                       | H / pasture                  | industrial, fuel; not-food; organic/raw-fat     | **Propose** same boundary. [FAO slaughter fats](https://www.fao.org/4/x9892e/x9892e00.pdf). No automatic edible tallow.                                                                                                                                                                |
| `cow-horn`; cow / horn under reviewed horn-bearing source rule   | H / pasture                  | industrial, ornament; not-food; organic/horn    | **Propose** matches existing horn traits; no horns on a contradictory hornless source. [FAO horn byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                               |
| `goat-horn`; goat / horn under reviewed horn-bearing source rule | H / goat-browse              | industrial, ornament; not-food; organic/horn    | **Propose** separate canonical producer link. [FAO horn byproducts](https://www.fao.org/4/x6552e/X6552E10.htm).                                                                                                                                                                        |
| `goose-feather`; goose / carcass feathers                        | H / pasture                  | industrial, ornament; not-food; organic/feather | **Propose** fletching/insulation, with suitability reviewed by recipe. [FAO goose products](https://www.fao.org/4/i1687e/i1687e.pdf). No live plucking.                                                                                                                                |
| `deer-meat`; existing deer archetype / flesh                     | W / wild-game                | food; ordinary; organic/red_meat                | **Propose** explicit game-food source with qualified handling. [USDA venison handling distinction](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-fish/jerky). Does not certify raw meat or generic drying as safe.                                     |
| `deer-hide`; deer / raw skin                                     | W / wild-game                | textile, industrial; not-food                   | **Baseline** existing raw-hide possibility; no leather without processing. Existing species-product identity stays on historical facts.                                                                                                                                                |
| `shed-antler`; antler-bearing deer / detached antler             | W / wild-game / gathering    | industrial, ornament; not-food                  | **Defer** new source: current deer entry lacks antler metadata and presence is not a saved shed-antler occurrence. [FWS shed-antler distinction](https://www.fws.gov/faq/it-legal-collect-shed-antlers-national-wildlife-refuge). No new legal rule is inferred for the fantasy world. |
| `generic-chitin`; arbitrary insect/arachnid / exoskeleton        | W / species-specific habitat | industrial; not-food candidate                  | **Defer** blanket keyed source. Existing body-plan derivation is not a reviewed material capability for every fantasy creature. Review a specific producer and material recipe later.                                                                                                  |
| `generic-scale`; arbitrary scaled animal / skin/scales           | W / species-specific habitat | industrial; not-food candidate                  | **Defer** blanket keyed source; preserve existing catalog API, but do not infer armor/leather performance from scales.                                                                                                                                                                 |

Wild meat expansion beyond the explicitly reviewed deer source still needs food review; it must not
inherit a food flag from `resource_derivable`, `beast`, `dragon` or `monstrosity`. Existing
representative meat recipes can consume retained valid legacy inputs without giving all new
keyed carcass rows a food claim. This ledger intentionally makes the new regional scope narrower
than the old unrestricted derivation API.

## Aquatic resources

New ordinary species entries are preferred to interpreting a generic legacy crab or crayfish as
a particular real species. The named organism's source must assert a compatible accessible margin
occurrence. A species profile saying it can also live offshore does not authorize an offshore
source. Collection/fishing equipment are acquisition assumptions; this design creates no boat.

| Raw key; producer / part                                            | W method and gate                                                                  | Uses; food; classification                           | Decision, consumer and reference                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `perch-flesh`; European perch, `Perca fluviatilis`; flesh           | fishing / freshwater-fish; shore line/net and handling equipment                   | food; ordinary; organic/fish; inventory fish         | **Propose** freshwater shore/bank source. [FAO perch synopsis](https://www.fao.org/inland-fisheries/tools/detail/en/c/1148946/). No lake-only automatic fish claim.                                                                                              |
| `flounder-flesh`; European flounder, `Platichthys flesus`; flesh    | fishing / cool-coast; shore line/net and handling equipment                        | food; ordinary; organic/fish; inventory fish         | **Propose** selected littoral occurrence; limit rule to land-accessible margin. [FAO flounder habitat and fishing](https://www.fao.org/fishery/docs/CDrom/ARTFIMED/ArtFiWeb/descript/Species/PLEPLFLE.HTML). No offshore or estuary-salinity extrapolation.      |
| `noble-crayfish-flesh`; `Astacus astacus`; edible flesh             | shellfish-collection / freshwater-crayfish; collection gear and handling equipment | food; ordinary; animal-food/crayfish; inventory food | **Propose** explicit ordinary crayfish source. [FAO European crustacean food use](https://www.fao.org/fishery/static/eifaac/SubComII/EUROPE/Chapter1.pdf). No chitinous-body-plan insect meat.                                                                   |
| `dungeness-crab-flesh`; Dungeness crab; edible flesh                | shellfish-collection / cool-coast; shore-accessible traps and handling equipment   | food; ordinary; animal-food/crab; inventory food     | **Propose** narrow selected nearshore occurrence, not generic catalog crab. [Alaska Fish and Game profile](https://www.adfg.alaska.gov/static/education/wns/dungeness_crab.pdf). Off-shore beds or boat-dependent access are omitted.                            |
| `blue-mussel-flesh`; `Mytilus edulis`; edible soft tissue           | shellfish-collection / cool-coast; accessible intertidal collection gear           | food; ordinary; animal-food/bivalve; inventory food  | **Propose** margin occurrence, not arbitrary marine presence. [NOAA mussel habitat and food use](https://www.fisheries.noaa.gov/species/blue-mussel). No farm/aquaculture inference.                                                                             |
| `eastern-oyster-flesh`; `Crassostrea virginica`; edible soft tissue | shellfish-collection / warm-coast; accessible margin collection gear               | food; ordinary; animal-food/bivalve; inventory food  | **Propose** reviewed marine/coastal niche only. [NOAA oyster profile](https://www.fisheries.noaa.gov/species/eastern-oyster). No inland freshwater oysters or certified contamination-free harvest.                                                              |
| `herring-flesh`; Atlantic herring; flesh                            | fishing / offshore or specifically qualified shore run                             | food candidate; unknown local access                 | **Defer** generic shore supply; the current model lacks saved shoal/run or offshore access. [NOAA herring](https://www.fisheries.noaa.gov/species/atlantic-herring). Ocean proximity is insufficient.                                                            |
| `brook-trout-flesh`; `Salvelinus fontinalis`; flesh                 | fishing / thermally qualified freshwater                                           | food candidate; unknown local habitat support        | **Defer** detailed cold-water species until a deliberately reviewed thermal proxy or saved water-temperature model exists. [FWS brook trout](https://www.fws.gov/species/brook-trout-salvelinus-fontinalis). Air temperature is not measured stream temperature. |

The first six rows are conservative game rules, not a survey of fish assemblages. Required omission
fixtures include compatible air climate but no actual water, ocean beside a freshwater candidate,
landlocked compatible habitat, stale water evidence and water-only travel paths. The saved origin
needs the exact organism and a water reference as well as the land access anchor.

## Industrial minerals and flux inputs

All new rows require a selected deposit with a specific raw identity. Broad host/process eligibility
permits a procedural choice, never proves occurrence, purity or current extraction. Food status is
**not-food** even for mineral salt: food-grade salt needs its own review/processing permission, not
an unqualified mining claim. Deposits remain bounded by the existing geological selection policy.

| Raw key / mineral identity                                       | Proposed host/process and D acquisition                             | Uses                     | Decision, consumer and source review                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `native-sulfur`; native sulfur                                   | basalt + volcanic/hydrothermal; surface gathering or shallow mining | industrial               | **Propose** selected surface volcanic sulfur occurrence. [USGS volcanic sulfur](https://www.usgs.gov/observatories/hvo/news/volcano-watch-many-forms-sulfur-are-found-kilauea-volcano). No sulfur from any sulfide ore or modern refinery recovery; active fumarole access is not guaranteed. |
| `silica-sand`; reviewed glassmaking-compatible silica-rich sand  | sandstone + sedimentary; surface gathering                          | industrial               | **Propose** distinct selected quality identity. [USGS high-grade silica deposits](https://pubs.usgs.gov/bul/1019h/report.pdf). Generic sand/sandstone remains insufficient; no numerical purity claim.                                                                                        |
| `red-ochre-earth`; selected hematite-bearing pigment earth       | shale/sandstone + sedimentary; surface gathering                    | pigment                  | **Propose** explicit pigment-bearing deposit, not every red rock or iron ore. [USGS oolitic ironstone/ochre association](https://pubs.usgs.gov/bul/b2004/html/bull2004oolitic_ironstones.htm). Grinding/binders in #365.                                                                      |
| `yellow-ochre-earth`; selected hydrated iron-oxide pigment earth | shale/sandstone + sedimentary; surface gathering                    | pigment                  | **Propose** coarse sedimentary pigment occurrence. Same [USGS source](https://pubs.usgs.gov/bul/b2004/html/bull2004oolitic_ironstones.htm). Colours and pigment suitability are selected descriptors, not inferred from prose.                                                                |
| `trona-ore`; trona-bearing raw evaporite                         | evaporite + evaporite; mining                                       | industrial               | **Propose** sodium-carbonate flux precursor. [USGS sodium-carbonate depositional model](https://pubs.usgs.gov/of/1982/0795/report.pdf). Authored nonmarine evaporite deposit choice; not finished soda ash and not inferred from ordinary halite.                                             |
| `potassium-salt-ore`; reviewed sylvite-bearing raw evaporite     | evaporite + evaporite; mining                                       | industrial               | **Propose** distinct additional salt, not edible salt or ready potash ash. [USGS evaporite potash resources](https://www.usgs.gov/publications/potash-a-global-overview-evaporate-related-potash-resources-including-spatial). Recipe must choose appropriate chemistry explicitly.           |
| `limestone`; existing raw quarry limestone                       | limestone host; quarrying                                           | construction, industrial | **Baseline + Propose** explicit industrial use for future lime/glass input. It is not already quicklime. [Existing resource design](region-resources.md).                                                                                                                                     |
| `dolomite-rock`; dolomite rock                                   | dolomite host; quarrying                                            | construction, industrial | **Propose** distinct quarry stone; current geology already names its host. [USGS flux-material use](https://www.usgs.gov/publications/mineral-resource-month-ferrous-slag). Not interchangeable with limestone; detailed glass/metal recipe suitability remains #365 review.                  |
| `salt-ore`; existing halite-like raw salt                        | evaporite + evaporite; mining                                       | industrial               | **Baseline** retain deposit rule, with no automatically food-grade new descriptor. [Existing occurrence table](../src/lib/resources/geological_resources.ts). Preserved-food recipes cannot assume edible salt.                                                                               |
| `gypsum`; existing gypsum                                        | evaporite + evaporite; mining                                       | construction, industrial | **Baseline** raw gypsum, not plaster. [Existing occurrence table](../src/lib/resources/geological_resources.ts).                                                                                                                                                                              |
| `generic-sand`; existing sand                                    | sandstone + sedimentary; gathering                                  | construction             | **Baseline** leave unqualified. [Existing occurrence table](../src/lib/resources/geological_resources.ts). Cannot match silica-sand merely by major type.                                                                                                                                     |
| `wood-ash`; combustion residue                                   | timber combustion, not a geological/wild occurrence                 | industrial candidate     | **Defer to #365 processing**, rather than new raw-resource source. Saved timber and complete fuel/process chain required.                                                                                                                                                                     |
| `alum`; processed mordant salt                                   | reviewed mineral/plant source and transformation                    | industrial candidate     | **Defer** automatic raw alum: no specific reviewed local mineral/formation and transformation chain in this ledger. Dye plants do not produce their own mordants.                                                                                                                             |
| `food-grade-salt`; qualified edible salt                         | reviewed salt refining/source qualification                         | food candidate; unknown  | **Defer** automatic food-grade assignment. Mining halite-like salt does not establish all food qualification. Keep industrial salt useful without granting preservation recipes a food-safe input.                                                                                            |

Tools are explicit gathering/quarry/mining assumptions. Positive fantasy source access still rejects
trace concentration, deep exposure and drilling. Native sulfur generation needs a conservative
extractable-surface rule; active dangerous fumaroles are not automatically safe workable gathering
sites. Raw fat, wax, ash and flux inputs are not substitutes for one another simply because they
have industrial use.

## Every existing metal ore

All rows refer to the existing metal-ore catalog rather than introducing elemental-metal outputs.
Food status is **not-food**; use is **industrial** (and ornament where a later recipe supports it).
Method is mining except separately reviewed future placer gathering. Every usable source still
requires a retained selected workable/rich deposit, current geology and qualified access. Ordinary
mining tools do not establish refining capability. Unsupported hosts/processes below are actual
model gaps; they must not be approximated by arbitrary basalt or a biome.

| Existing entry / raw key          | Occurrence review and decision                                                                                                                                                                                                                                                   | #339 / #365 and limitation                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| iron ore / `iron-ore`             | **Baseline** basalt/shale, volcanic/sedimentary, existing mining rule. [Existing occurrence table](../src/lib/resources/geological_resources.ts).                                                                                                                                | Preserve qualified bloomery chain; ore mineralogy/grade not copied from metal-property table.                        |
| copper ore / `copper-ore`         | **Baseline** granite/basalt + hydrothermal. [Existing design](region-resources.md).                                                                                                                                                                                              | Copper refining and bronze alloying in #365 require full inputs; no automatic bronze.                                |
| tin ore / `tin-ore`               | **Baseline** granite/pegmatite + intrusive/hydrothermal. [USGS tin-associated granite systems](https://pubs.usgs.gov/of/1999/of99-556/).                                                                                                                                         | No tin metal until recipe; both copper and tin needed for bronze.                                                    |
| lead ore / `lead-ore`             | **Baseline** limestone/dolomite + hydrothermal. [USGS polymetallic deposits](https://pubs.usgs.gov/circ/c1178/c1178.pdf).                                                                                                                                                        | No generic lead-bearing household-food claim.                                                                        |
| zinc ore / `zinc-ore`             | **Baseline** limestone/dolomite + hydrothermal. [USGS polymetallic deposits](https://pubs.usgs.gov/circ/c1178/c1178.pdf).                                                                                                                                                        | Zinc metal/brass remain capability-dependent; indium is not a free coproduct.                                        |
| gold ore / `gold-ore`             | **Baseline** schist/gneiss/granite + hydrothermal/placer. [Existing design](region-resources.md).                                                                                                                                                                                | Existing coarse ore rule is not native nugget gold; a placer gathering pathway needs separate review.                |
| silver ore / `silver-ore`         | **Baseline** basalt/granite + hydrothermal. [USGS gold-silver model](https://pubs.usgs.gov/publication/sir20105070Q).                                                                                                                                                            | Refining and ornaments need recipe evidence; native silver not inferred.                                             |
| aluminum ore / `aluminum-ore`     | **Defer**: bauxite needs explicit residual weathering/karst evidence absent from current processes. [USGS bauxite model](https://pubs.usgs.gov/bul/b1693/html/bull20dh.htm).                                                                                                     | Geological blocker precedes the separate advanced-metal refining blocker.                                            |
| platinum ore / `platinum-ore`     | **Defer**: reviewed mafic/ultramafic mineral-system evidence missing. [USGS system assessment](https://www.usgs.gov/centers/gmeg/science/national-assessment-ni-co-v-cr-and-pge-associated-maficultramafic-magmatic?items_per_page=6&page=1).                                    | Granite or ordinary basalt presence is insufficient; no PGE alloy claims.                                            |
| titanium ore / `titanium-ore`     | **Defer**: a reviewed heavy-mineral sand or magmatic concentration identity needs more than current generic gravel/placer support. [USGS heavy-mineral sands](https://pubs.usgs.gov/sir/2010/5070/l/).                                                                           | A rutile/ilmenite source could be useful without titanium-metal refining, but first needs specific occurrence rules. |
| nickel ore / `nickel-ore`         | **Defer**: no reviewed mafic/ultramafic sulfide or lateritic setting. [USGS nickel laterites](https://pubs.usgs.gov/of/2011/1058/).                                                                                                                                              | No arbitrary volcanic-basalt substitution.                                                                           |
| tungsten ore / `tungsten-ore`     | **Propose** narrow granite + hydrothermal vein rule using current vocabulary; not a modeled skarn. [USGS tungsten systems](https://pubs.usgs.gov/sir/2023/5012/sir20235012.pdf).                                                                                                 | Raw source can exist without a fantasy tungsten recipe; no steel improvement inferred.                               |
| molybdenum ore / `molybdenum-ore` | **Propose** granite + intrusive/hydrothermal coarse molybdenite-bearing rule. [USGS porphyry-related systems](https://pubs.usgs.gov/of/1999/of99-556/).                                                                                                                          | No automatic molybdenum alloy or recoverable rhenium.                                                                |
| chromium ore / `chromium-ore`     | **Defer**: chromite-compatible ultramafic/layered setting missing. [USGS mafic/ultramafic assessment](https://www.usgs.gov/centers/gmeg/science/national-assessment-ni-co-v-cr-and-pge-associated-maficultramafic-magmatic?items_per_page=6&page=1).                             | No generic chromium from every metal deposit.                                                                        |
| vanadium ore / `vanadium-ore`     | **Defer**: a reviewed vanadium-bearing magmatic or alternative deposit rule has not been represented. Same [USGS assessment](https://www.usgs.gov/centers/gmeg/science/national-assessment-ni-co-v-cr-and-pge-associated-maficultramafic-magmatic?items_per_page=6&page=1).      | Multiple possible settings are not permission for a blanket shale/iron rule.                                         |
| tantalum ore / `tantalum-ore`     | **Propose** selected tantalum-bearing pegmatite + intrusive rule. [USGS pegmatite commodities](https://pubs.usgs.gov/publication/sir20235082/full).                                                                                                                              | Ordinary pegmatite does not guarantee tantalum; no advanced refining assumed.                                        |
| zirconium ore / `zirconium-ore`   | **Defer**: zircon-bearing heavy-mineral source/sorting evidence not modeled. [USGS zirconium/hafnium](https://www.usgs.gov/centers/national-minerals-information-center/zirconium-and-hafnium-statistics-and-information).                                                       | No generic sand-to-zirconium or gemstone-zircon substitution.                                                        |
| hafnium ore / `hafnium-ore`       | **Defer**: source generally associated with zirconium-bearing minerals; separate automatic deposit would invent a recoverable coproduct. Same [USGS source](https://www.usgs.gov/centers/national-minerals-information-center/zirconium-and-hafnium-statistics-and-information). | Needs reviewed coproduct/mineral identity and separation model.                                                      |
| rhenium ore / `rhenium-ore`       | **Defer**: reviewed molybdenite association does not establish independent usable rhenium supply. [USGS byproduct recovery](https://pubs.usgs.gov/publication/sir20235082/full).                                                                                                 | A molybdenum source is insufficient without concentration/recovery evidence.                                         |
| bismuth ore / `bismuth-ore`       | **Propose** narrow granite + hydrothermal vein source, with explicitly selected bismuth-bearing mineralization. [USGS tungsten/bismuth-bearing systems](https://pubs.usgs.gov/sir/2023/5012/sir20235012.pdf).                                                                    | No automatic bismuth coproduct from every copper/lead vein.                                                          |
| indium ore / `indium-ore`         | **Defer**: generic zinc presence does not identify usable indium-bearing feedstock/recovery. [USGS indium](https://www.usgs.gov/centers/national-minerals-information-center/indium-statistics-and-information).                                                                 | Catalog-only until reviewed source qualification; no second free deposit from zinc.                                  |

This proposes four added ore occurrence rules and records explicit blockers for the remaining ten
previously unsupported ores. It does not defer an otherwise modeled raw ore merely because its
metal needs advanced processing. New regional raw snapshots should retain the original catalog
name/classification while source review notes identify the coarse mineralization model; elemental
conductivity, melting point and density remain catalog metal properties, not saved deposit assays.

## Existing resources retained outside the expansion

The following explicit sources remain supported by their existing per-entry occurrence and access
rules in [the geological table](../src/lib/resources/geological_resources.ts) and
[approved #338 design](region-resources.md). Their identifiers cannot be substituted for a new
ledger commodity by display-name matching:

- Gemstones: quartz, amethyst, garnet, beryl, ruby, sapphire and diamond; retain distinct compatible
  hosts/processes, selected gem deposits and diamond's volcanic-pipe requirement.
- Quarry stone: granite, basalt, limestone, sandstone, slate, marble, quartzite and obsidian;
  retain raw quarry identity, not ashlar/tiles. Dolomite is the proposed additional quarry entry.
- Other raw sources: clay, gravel, coal, crude oil and natural gas. Keep existing trace/deep/drilling
  qualifications and complete petroleum-setting requirements. Oil/gas are not fantasy recipe inputs.
- Timber, water and arable-ground facts: retain their existing structured evidence and limitations.
  A new reviewed medicinal/dye producer does not upgrade an old generic timber identity.

This ledger is additive: existing negative/unknown assessments, edited prose and valid legacy
processing leaves are not rewritten to fit new definitions. Fresh keyed supply must follow the
new source and food gates; retaining an API is not a permission to generate unrestricted new meat.

## Model pressure exposed by concrete entries

### 1. Preparation permission must survive intermediates

Resolved in the proposed [decision 8](fantasy-raw-resource-sources.md#8-carry-preparation-restrictions-through-ingredient-edges)
and [food domain diagrams](fantasy-raw-resource-sources.md#food-policies-saved-edges-and-derived-assessment).
Recipes and saved products declare ingredient/provision policy; saved input edges distinguish
ingredients, processing water and supporting fuel. Preparation restrictions follow ingredient
paths until a reviewed provision step satisfies every participating permission. Flour/dough stay
restricted; prepared bread can enter later dishes. Supporting firewood is checked for access and
availability without being treated as food. A prepared branch cannot clear an unprepared branch
from the same original source.

The pure assessment reads saved policy/source metadata; it is not another persisted food state.
Imports require explicit reviewed descriptors and retain their explanations. Missing legacy
metadata remains unknown for new food decisions without rewriting saved assertions. The revised
model explicitly defers consumed-water qualification, food-grade salt and chemical processing
aids until their particular sources/recipes are reviewed. The [review examples](fantasy-raw-resource-sources.md#food-chain-review-examples)
make these boundaries concrete. The human reviewer approved this persisted-shape extension with
the revised model; it is not a complete practical food-safety model.

### 2. Wild colonies need support links

Saving `occurrenceForm: colony` distinguishes bees from a colony, but does not on its own record
the reviewed forage dependency. A wild honey source must cite specific compatible forage
inhabitants and freshwater evidence in its source reason. Existing FactReason fact/map links can
store that support without another origin variant. Source validation/selection must inspect those
links, not just species name plus colony form. Managed apiaries use explicit production support.

### 3. Fiber breeds and poultry feed remain real gaps

Use a deliberately wool-bearing new species archetype for the first fleece source. Defer goat and
camel textile hair rather than create a hidden breed fact through a generic source name. Defer
chicken eggs until feed or an explicitly reviewed omnivorous-forage capability is modeled. Managed
goose eggs are a coarse opportunity tied to reviewed grazing, not a claim that pasture alone yields
unlimited eggs. No additional production modes or model fields are proposed to clear these gaps.

### 4. Special minerals can remain selected deposit identities

Silica sand, pigment earth, volcanic sulfur and trona can have specific authored deposit rules and
saved raw descriptors within the existing coarse geological model. Quality is a reviewed
qualitative deposit assertion, not measured chemical composition. Rules must narrow host/process
and extraction compatibility and can still omit selection. Adding weathering, ultramafic formations,
heavy-mineral sorting or recoverable coproduct data would need a subsequent domain-model revision.

### 5. Baseline compatibility and the new review boundary must be explicit

The old derivation API invents potential carcass resources for many fantasy species. Preserve its
public behavior and old saves, but do not let that become new food review. New source-qualified
generation needs an allowlist of reviewed definitions, not a fallback to the broad derivation API
whenever the review table is sparse. Compatibility tests must prove that old source identities are
still readable without broadening the new food catalog.

## Verification expectations for every proposed row

Each proposed mode/commodity pair needs its own controlled positive and meaningful omission
fixture. Inherit the model's same-seed, reordered-catalog, bounds, save/migration and editing
contracts, and add the row's particular counterexample: seed cotton versus cleaned lint, cultivar
crop versus species-wide product, wild cow versus dairy herd, raw fat versus rendered/edible fat,
generic pollinator versus forage-supported colony, river water versus perch, generic sand versus
silica sand, and trace coproduct versus an independent workable ore.

Source identity must survive renamed prose, serialize with availability/requirements and be
selected explicitly in downstream leaves. Restriction tests must inspect full processing closure,
not just raw selector strings. Every Defer row needs a catalog-only omission test if its catalog
entry could otherwise leak into generation. Representative seed surveys supplement these fixtures;
they do not replace them or require every commodity in every region.

The human reviewer approved the support gates, species specificity, explicit deferrals and revised
food-chain model on 2026-10-14. The [implementation work items](fantasy-raw-resource-sources.md#implementation-work-items)
were created after that approval. Entries remain review decisions until implemented and verified;
new persisted concepts or changes to deferred model boundaries require further design review.
