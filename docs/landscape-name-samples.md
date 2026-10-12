# Landscape name review samples

Generated 2026-10-12 from the approved repertoire. These are actual outputs, not hand-picked
illustrations. Each row is a separate three-name batch using the seed `landscape-review:<label>:<scope>`,
with the listed nouns, no directions or culture, and empty initial naming history. Regions may use
bare roots; zones retain a terrain cue. Repeated generic terrain words are intentional.

| Landscape     | Eligible nouns                    | Region names                                                               | Zone names                                                                                   |
| ------------- | --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Forest        | Woods                             | Lorarinweald; the Hollow Forest; Elaselweald                               | the Nameless Weald; Kardrel Forest; the Enchanted Weald                                      |
| Open hills    | Grasslands, Hills, Heights, Downs | Varorel Grasslands; the Wraithbound Grass Sea; Kelgar Wold                 | Ororinwold; Dorvar Heights; the Unhallowed Heights                                           |
| Flat plains   | Plains                            | the Accursed Flatlands; Sarenorwold; the Mournful Flatlands                | the Sullen Flatlands; Hardren Flatlands; Talaroswold                                         |
| Desert        | Desert                            | the Desert of Ivanor; the Desolation of Karvel; the Furnace of Kardren     | Torrathsands; Selalen Sands; Harvanewaste                                                    |
| Wetland       | Wetlands                          | the Forsaken Marshes; the Enchanted Marshes; the Marshes of Velanor        | the Mire of the Sunken Choir; Araros Mire; Selamor Wetlands                                  |
| Tundra        | Tundra                            | the Sorrowful Coldlands; the Cradle of Saranor; the Shivering Cold Barrens | Varinorrime; Oralinrime; the Tundra of the White Silence                                     |
| Icefields     | Icefields                         | Kelven Icefields; the Hidden Icefields; Calavenrime                        | the Lonesome Frozen Reaches; Aremarrime; the Frostfields of the Winter Crown                 |
| Mountains     | Mountains                         | the Knuckles of Morden; Beldrelcrags; the Ramparts of Kargorn              | the Forlorn Crags; the Range of the Grey Ramparts; the Sorrowful Range                       |
| Unknown biome | Country                           | Sarondreach; Elinorreach; the Veil of Aralin                               | the Country of the Far Hush; the Wilds of the Grey Beyond; the Reaches of the Hollow Expanse |
| Mixed country | Reaches                           | Aremarlands; Calalin Country; the Vast of Varanor                          | the Ragged Wilds; Kelvel Wilds; the Ill-Starred Lands                                        |

## Fresh-seed variety

Each fixture below makes 200 independent calls in region scope with one noun, no culture or
directions, and empty history, using seeds `quality:<noun>:<index>` (index 0–199). The unit tests
require at least 180 distinct names and coverage of all five creative forms. Those are bounded
regression measurements; aesthetics also need human judgment.

| Noun      | Distinct names / 200 | Compound | Descriptive | Metaphor | Toponym | Of-phrase |
| --------- | -------------------: | -------: | ----------: | -------: | ------: | --------: |
| Woods     |                  183 |       58 |          52 |       45 |      31 |        14 |
| Hills     |                  187 |       63 |          51 |       44 |      22 |        20 |
| Plains    |                  180 |       58 |          37 |       57 |      34 |        14 |
| Desert    |                  188 |       62 |          41 |       42 |      35 |        20 |
| Wetlands  |                  192 |       55 |          47 |       49 |      29 |        20 |
| Tundra    |                  185 |       55 |          60 |       34 |      27 |        24 |
| Icefields |                  184 |       64 |          59 |       33 |      26 |        18 |
| Mountains |                  188 |       53 |          49 |       48 |      32 |        18 |
| Country   |                  184 |       57 |          49 |       43 |      27 |        24 |
