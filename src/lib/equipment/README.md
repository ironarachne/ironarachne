# Equipment

This forms the basis not just of character equipment, but also all items.

The library follows the idea of static generation. That is, there is no random generation for initial
objects. Instead, mutators can be used to tweak the attributes of those initial objects, and mutators
also don't use random generation, but can be randomly selected by generators.

`index.ts` is the public API. `fantasylist/` holds the static fantasy price list, which is data
rather than generation.

## The fantasy price lists

`fantasylist/` is the data: twenty-three titled lists of `{ name, cost }`, where `cost` is in
copper pieces. `price_lists.ts` is everything done with it, and it is the whole of what
`/fantasy/equipment` renders:

- **`PRICE_CURRENCIES`** — the currencies the lists can be read in, each carrying a display
  currency system, the copper-to-base-unit rate, and a key derived from that system. They are
  display systems rather than `$lib/currency`'s own because `valueToString` spends every
  denomination it is given: electrum, platinum and the guinea are absent so that no price can be
  quoted in one, which is also why the key can be derived rather than written out and left to
  drift. One copper piece is one farthing, which is the claim `baseUnitPerCopper` holds.
- **`formatCost`** — one cost in one currency, and `Free` rather than the empty string for an item
  that costs nothing. Three of them do.
- **`filterEquipmentLists`** / **`countEquipmentItems`** — the page's search over five hundred rows,
  dropping a list with nothing left in it rather than showing an empty table.
- **`priceListDocument`** and **`priceListToMarkdown`** / **`priceListToText`** — the reference
  arranged for reading, and the two exports written from it. The page renders the same document, so
  what is on screen and what is downloaded cannot disagree.
