# Equipment

This forms the basis not just of character equipment, but also all items.

The library follows the idea of static generation. That is, there is no random generation for initial
objects. Instead, mutators can be used to tweak the attributes of those initial objects, and mutators
also don't use random generation, but can be randomly selected by generators.

`index.ts` is the public API. `fantasylist/` holds the static fantasy price list, which is data
rather than generation.
