# Heraldry

This library generates **coats of arms**: a field with a division and optional variation, charges
arranged on it, tinctures for each, an SVG rendering, and the blazon that describes the whole thing
in heraldic language. It is one of the site's oldest and largest libraries, and it is the reason
[`$lib/charges`](../charges/README.md) exists separately — charge artwork is shared with the
non-heraldic emblem systems, while the heraldic grammar lives here.

## The public API is deliberately small

`index.ts` exports only the generator and its config:

```typescript
import {
  generateHeraldry,
  getDefaultHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry';

const arms = generateHeraldry(getDefaultHeraldryGeneratorConfig(rng));

arms.blazon; // 'Azure, a lion rampant or'
arms.device; // the structure the SVG is drawn from
```

Everything else is imported by path — `$lib/heraldry/fields`, `$lib/heraldry/tinctures`,
`$lib/heraldry/variations`, `$lib/heraldry/renderers/svg`, and so on. That keeps a page that only
wants a coat of arms from pulling in the preview builders and the saved-state layer.

## What is in here

- **Model** — `Arms` (a `Device` plus its `blazon`), `Device`, `Field`, `Variation`, and `Charge`
  (a `ChargeGlyph` with a `Tincture`), each with a `render*Blazon` function. The blazon is
  generated from the structure, not stored alongside it.
- **Tables** — `fields.all()`, `variations.all()`, `tinctures.all()`/`ofTypes`, and
  `charge_data`'s `getAllCharges`/`getChargesMatchingAnyTags`, plus `byName` lookups and random
  pickers.
- **Generation** — `generateHeraldry`, `getDefaultHeraldryGeneratorConfig`,
  `generateHeraldryConfig`, `validateHeraldryGeneratorConfig`, and `mergeHeraldryGeneratorConfig`.
- **Rendering** — `renderHeraldryDeviceSvg` in `renderers/svg`, and the small preview builders
  `buildTincturePreviewSvg`, `buildTinctureOptionPreviewSvg`, and `buildFieldDivisionPreviewSvg`
  used to populate pickers.
- **UI options** — `heraldry_ui_options` translates between what a control offers and what the
  generator config wants: `resolveFieldOptions`, `fieldDivisionNameFromOption`,
  `eligibleVariationTinctures`, `buildVariationSlotPreferences`, and friends.
- **Rolling** — `heraldry_roll`'s `rollHeraldry`, `rollHeraldrySnapshot` and
  `readHeraldryGeneratorConfig`: the single path from a seed and a set of options to a coat of
  arms. Assembling the generator config _draws from the RNG_, so this is what makes a seed
  reproduce a device, and it is what a re-roll from a saved artifact's provenance uses.
- **Saved arms** — `toHeraldrySnapshot`/`heraldryFromSnapshot` and the `heraldry` artifact kind.
- **Editing** — `heraldry_editing`'s snapshot-to-snapshot functions, one per part of the device,
  each returning a new snapshot with the blazon rederived.

## Usage

Constrain a run through the config rather than post-processing the result:

```typescript
import { generateHeraldry, getDefaultHeraldryGeneratorConfig } from '$lib/heraldry';
import { getChargesMatchingAnyTags, Fields } from '$lib/heraldry';

const config = getDefaultHeraldryGeneratorConfig(rng);
config.chargeCount = 1;
config.chargeOptions = getChargesMatchingAnyTags(['animal']);
config.fieldOptions = [Fields.byName('per fess')];

const arms = generateHeraldry(config);
```

Then draw it:

```typescript
import { renderHeraldryDeviceSvg } from '$lib/heraldry';

const svg = renderHeraldryDeviceSvg(arms.device, config.width, config.height);
```

The renderer takes an optional trailing `RNG`, used only to namespace the SVG's generated ids. Pass
a seeded one when the markup itself has to be reproducible (golden-image tests do); otherwise it
falls back to a random uid, which is what a page wants when two devices share the document.

## Saving, and editing

A coat of arms is an artifact: it is kept in a project, in the vault, under the `heraldry` kind.
`toHeraldrySnapshot` writes one and `heraldryFromSnapshot` reads it back — the reading half lives in
`heraldry_rehydrate.ts` because it resolves charge names against
[`$lib/charges`](../charges/README.md), which is 18 MB of glyph art, and nothing that merely stores
or validates arms should pay for that.

`heraldry_saved_state.ts` — the per-generator `localStorage` scope this library used to write —
**was retired with #51**. Anything still sitting in `generator.heraldry` in a browser is carried
across by [`$lib/legacy_adoption`](../legacy_adoption/README.md), which holds its own description of
that scope for the purpose.

Editing works on the snapshot rather than on live arms, because the snapshot is what is stored and
what the kind's validator speaks:

```typescript
import { setHeraldryChargeTincture, storedDeviceBlazon } from '$lib/heraldry';

const edited = setHeraldryChargeTincture(snapshot, 0, 'purpure');
edited.blazon === storedDeviceBlazon(edited.device); // always
```

**The blazon is derived after every edit, never typed.** A stored blazon that no longer describes
the device is worse than no blazon at all, so every function in `heraldry_editing` recomputes it —
and leaves the previous one standing in the one case it cannot, which is a device naming a charge
this build no longer has.

Arms are identified by their **blazon** wherever two of them have to be told apart: it is the
canonical description, so two devices with the same blazon are the same arms.
