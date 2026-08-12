# Music

This library generates a **music style** — the sound of a culture's music, described in terms a
reader can imagine rather than notate: its beat, rhythm, melody, harmony, key, pitch, dynamic, and
timbre.

It is one of the small traits that gives a generated culture texture, alongside its greetings,
taboos, and eating habits.

## Features

- **`generateMusicStyle`** — build a whole style from an `RNG`.
- **`describeMusicStyle`** — turn a style into prose.
- **Parts** — `randomBeat`, `randomRhythm`, `randomMelody`, `randomHarmony`, `randomKey`,
  `randomPitch`, `randomDynamic`, and `randomTimbre`, for callers wanting one aspect rather than a
  full style.

## Usage

```typescript
import { describeMusicStyle, generateMusicStyle } from '$lib/music';

const style = generateMusicStyle(rng);
const description = describeMusicStyle(style, rng);
```

[`$lib/culture`](../culture/README.md) uses this to fill in a culture's `musicStyle`.
