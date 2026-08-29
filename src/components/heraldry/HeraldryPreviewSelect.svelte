<script lang="ts">
  import { buildAnyOptionPreviewSvg } from '$lib/heraldry';

  export type HeraldryPreviewOption = {
    value: string;
    label: string;
  };

  type Props = {
    id: string;
    value: string;
    options: HeraldryPreviewOption[];
    includeAny?: boolean;
    previewSvg: (value: string, idSuffix: string) => string;
    onchange?: () => void;
  };

  let {
    id,
    value = $bindable(),
    options,
    includeAny = true,
    previewSvg,
    onchange,
  }: Props = $props();

  const previewSize = 16;

  let open = $state(false);
  let rootEl: HTMLDivElement | undefined = $state();

  const selectedLabel = $derived(
    value === 'any' ? 'any' : (options.find((entry) => entry.value === value)?.label ?? value),
  );

  function markup(optionValue: string, suffix: string): string {
    if (optionValue === 'any') {
      return buildAnyOptionPreviewSvg(previewSize);
    }
    return previewSvg(optionValue, suffix);
  }

  function selectOption(optionValue: string) {
    value = optionValue;
    open = false;
    onchange?.();
  }

  function toggleOpen() {
    open = !open;
  }

  function closeOnPointerDown(event: PointerEvent) {
    if (rootEl !== undefined && !rootEl.contains(event.target as Node)) {
      open = false;
    }
  }

  $effect(() => {
    if (!open) {
      return;
    }

    document.addEventListener('pointerdown', closeOnPointerDown);
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown);
    };
  });
</script>

<div class="heraldry-preview-select" bind:this={rootEl}>
  <button
    type="button"
    {id}
    class="heraldry-preview-select-trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={toggleOpen}
  >
    <span class="heraldry-preview-select-preview">
      <!-- Renders app-generated markup (no external or user-supplied input). -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html markup(value, `${id}-selected`)}
    </span>
    <span class="heraldry-preview-select-label">{selectedLabel}</span>
    <span class="heraldry-preview-select-chevron" aria-hidden="true">▾</span>
  </button>

  {#if open}
    <ul class="heraldry-preview-select-menu" role="listbox" aria-labelledby={id}>
      {#if includeAny}
        <li role="presentation">
          <button
            type="button"
            role="option"
            class="heraldry-preview-select-option"
            class:heraldry-preview-select-option--selected={value === 'any'}
            aria-selected={value === 'any'}
            onclick={() => selectOption('any')}
          >
            <span class="heraldry-preview-select-preview">
              <!-- Renders app-generated markup (no external or user-supplied input). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html buildAnyOptionPreviewSvg(previewSize)}
            </span>
            <span class="heraldry-preview-select-label">any</span>
          </button>
        </li>
      {/if}
      {#each options as option (option.value)}
        <li role="presentation">
          <button
            type="button"
            role="option"
            class="heraldry-preview-select-option"
            class:heraldry-preview-select-option--selected={value === option.value}
            aria-selected={value === option.value}
            onclick={() => selectOption(option.value)}
          >
            <span class="heraldry-preview-select-preview">
              <!-- Renders app-generated markup (no external or user-supplied input). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html markup(option.value, `${id}-${option.value}`)}
            </span>
            <span class="heraldry-preview-select-label">{option.label}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .heraldry-preview-select {
    position: relative;
    display: inline-block;
    min-width: 12rem;
  }

  .heraldry-preview-select-trigger,
  .heraldry-preview-select-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    font: inherit;
    line-height: 1rem;
    text-align: left;
    background: inherit;
    color: inherit;
    border: 1px solid rgb(255 255 255 / 25%);
  }

  .heraldry-preview-select-trigger {
    padding: 0.25rem;
    cursor: pointer;
  }

  .heraldry-preview-select-menu {
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.125rem);
    left: 0;
    right: 0;
    max-height: 16rem;
    overflow-y: auto;
    margin: 0;
    padding: 0.125rem 0;
    list-style: none;
    background: var(--surface-raised);
    border: 1px solid rgb(255 255 255 / 25%);
    box-shadow: 0 0.25rem 0.75rem rgb(0 0 0 / 35%);
  }

  .heraldry-preview-select-option {
    padding: 0.25rem 0.375rem;
    border: none;
    cursor: pointer;
  }

  .heraldry-preview-select-option:hover,
  .heraldry-preview-select-option--selected {
    background: rgb(255 255 255 / 8%);
  }

  .heraldry-preview-select-preview {
    flex: 0 0 auto;
    display: inline-flex;
    width: 1rem;
    height: 1rem;
  }

  .heraldry-preview-select-preview :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .heraldry-preview-select-label {
    flex: 1 1 auto;
    min-width: 0;
  }

  .heraldry-preview-select-chevron {
    flex: 0 0 auto;
    opacity: 0.7;
    font-size: 0.75rem;
  }
</style>
