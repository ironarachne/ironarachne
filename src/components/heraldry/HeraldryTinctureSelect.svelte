<script lang="ts">
  import HeraldryPreviewSelect from '$components/heraldry/HeraldryPreviewSelect.svelte';
  import { buildAnyOptionPreviewSvg, PREVIEW_STROKE } from '$lib/heraldry';
  import type { Tincture } from '$lib/heraldry';

  type Props = {
    id: string;
    value: string;
    tinctures: Tincture[];
    includeAny?: boolean;
    labelForValue?: (value: string) => string;
    onchange?: () => void;
  };

  let {
    id,
    value = $bindable(),
    tinctures,
    includeAny = true,
    labelForValue = (optionValue) => optionValue,
    onchange,
  }: Props = $props();

  const previewSize = 16;

  const options = $derived(
    tinctures.map((tincture) => ({
      value: tincture.name,
      label: labelForValue(tincture.name),
    })),
  );

  function previewSvg(optionValue: string, suffix: string): string {
    if (optionValue === 'any') {
      return buildAnyOptionPreviewSvg(previewSize);
    }

    const tincture = tinctures.find((entry) => entry.name === optionValue);
    if (tincture === undefined) {
      return buildAnyOptionPreviewSvg(previewSize);
    }

    if (tincture.hexColor) {
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${previewSize}" height="${previewSize}" viewBox="0 0 ${previewSize} ${previewSize}" aria-hidden="true">` +
        `<rect width="${previewSize}" height="${previewSize}" fill="${tincture.hexColor}" stroke="${PREVIEW_STROKE}" stroke-width="1"/>` +
        `</svg>`
      );
    }

    const patternId = `tincture-preview-${tincture.name}-${suffix}`;
    const pattern = tincture.pattern.replace(`id="${tincture.name}"`, `id="${patternId}"`);

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${previewSize}" height="${previewSize}" viewBox="0 0 ${previewSize} ${previewSize}" aria-hidden="true">` +
      `<defs>${pattern}</defs>` +
      `<rect width="${previewSize}" height="${previewSize}" fill="url(#${patternId})" stroke="${PREVIEW_STROKE}" stroke-width="1"/>` +
      `</svg>`
    );
  }
</script>

<HeraldryPreviewSelect {id} bind:value {options} {includeAny} {previewSvg} {onchange} />
