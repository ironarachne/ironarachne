# Equipment

This forms the basis not just of character equipment, but also all items.

The library follows the idea of static generation. That is, there is no random generation for initial
objects. Instead, mutators can be used to tweak the attributes of those initial objects, and mutators
also don't use random generation, but can be randomly selected by generators.

`index.ts` is the public API. `fantasylist/` holds the static fantasy price list, which is data
rather than generation.

## The `item` artifact kind

An item is a durable artifact, and `/fantasy/equipment-generator` and `/fantasy/weapon` share the
one kind — decision 1 of [docs/readiness-objects.md](../../../docs/readiness-objects.md), because
two kinds for one payload shape would split a user's gear across two vault entries, each openable
by only one of the two tools that made it. The provenance's tool path says which rolled it.

- **`item_snapshot.ts`** — `ItemSnapshot` and the codec. The **composition is stored**: `material`,
  `refinement`, `enchantment` and `decoration` are kept as the records they are, not folded into the
  description, or an editor could only rewrite prose. What is dropped is what generation _used_ —
  `allowedMaterialTypes`, `weaponType`, `armorType` — and what belongs to something else,
  `containerId`.
- **`item_artifact_kind.ts`** — the kind, its version, and a validator that normalises rather than
  refuses: an unrecognised rarity or density becomes the default, and a composition part that is
  not a record is dropped, but an item with no name or a non-numeric value is rejected.
- **`item_roll.ts`** — the one path from a seed. `itemSeed(seed, index)` is how one press's list
  gives each card a seed that re-rolls _that_ item.
- **`item_editing.ts`** — the setters, none of which recompute anything. Changing the material does
  not re-multiply the value, and no setter rewrites the description; `describeItem` offers the
  generated wording as an explicit command.
- **`item_presentation.ts`** — the sheet, and the Markdown and PDF written from it, for one item or
  for a whole press.

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
