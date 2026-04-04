# Equipment

This forms the basis not just of character equipment, but also all items.

At the moment this library is in a transitional state. The new pattern is entered from the `index.ts` file. Anything not exported by that file is the old pattern.

The new pattern follows the idea of static generation. That is, there is no random generation for initial objects. Instead, mutators can be used to tweak the attributes of those initial objects, and mutators also don't use random generation, but can be randomly selected by generators.
