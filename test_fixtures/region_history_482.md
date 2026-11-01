# Regional history reading examples (#482)

Generated with Node 24.22.2. These are review specimens, not new evidence of historical truth.
The predecessor realms are explicitly invented backstory constrained by the saved present.
Human editorial acceptance of the complete feature remains #485.

## the Duchy of Aedaern

Seed: `history-foundation-affiliated`; configuration: `{"affiliation":"affiliated","generateNeighbors":true}`.

1. The Former Realm of Ediry came into being.
2. This period saw the founding of the Duchy of Aedaern.
3. The Duchy of Aedaern succeeded the Former Realm of Ediry after the older polity came to an end.
4. Silverford was founded at its present site.
5. The Duchy of Aedaern became subordinate to the Kingdom of Aedaern and remains so today.
6. The County of Rehin entered the authority of the Kingdom of Aedaern, a relationship that continues today.

## Calerenwold

Seed: `history-foundation-unaffiliated`; configuration: `{"affiliation":"unaffiliated","generateNeighbors":false}`.

1. House Idreham's household guard came into being.
2. A war between House Idreham's household guard and Brotherhood of the Eternal Throne left their rivalry unresolved.
3. The settlement of Blue Hill began at the site it occupies today.

## the County of Illier

Seed: `5wyedz5q272fz`; configuration: `{"affiliation":"affiliated","generateNeighbors":false}`.

1. Sisters of the Eternal Flame came into being.
2. The Former Realm of Calamor came into being.
3. This period saw the founding of the County of Illier.
4. The Former Realm of Calamor ceased to exist as a polity, leaving the County of Illier as its successor.
5. Kiruth was founded at its present site.
6. The County of Illier entered the authority of the Kingdom of Skyrim, a relationship that continues today.

## Synthetic conflicting claims

Two current realms each retain an unpressed claim concerning the other; neither owns the other
and neither is subordinate. This rule fixture uses history seed `conflicting-claims:482`.

1. This period saw the founding of the Former Realm of Intiea.
2. The Realm of A came into being.
3. A war between the Realm of A and the Realm of B left an unpressed claim unresolved.
4. The Realm of A succeeded the Former Realm of Intiea after the older polity came to an end.

The sparse fixture in `region_history_generation.test.ts` has one unaffiliated settlement and
one current site role. Its entire chronology is one founding at the present site, with no invented
war, ruin, crop, founder or migration. The same suite covers crowded selection, support omissions,
complete predecessor lifecycles and source-removal safety.
