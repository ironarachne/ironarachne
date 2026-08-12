# UI

This library holds the **site-wide modal system**: one piece of shared state describing the modal
currently being shown, and a promise-returning function per modal kind so calling code can `await` a
user's answer instead of threading callbacks through components.

It is the only library that is aware of Svelte — `modal_state.svelte.ts` uses runes for reactive
state — which is why it is a `.svelte.ts` file with a plain `modal.ts` facade over it.

## Features

- **`modalState`** — the reactive state a single `<Modal>` component renders from.
- **Showing a modal** — `showAlertModal`, `showConfirmModal`, and
  `showHeraldryPersistenceModal`, each returning a promise that settles when the user answers.
- **Resolving one** — `resolveActiveAlertModal`, `resolveActiveConfirmModal`, and
  `resolveActiveHeraldryPersistenceModal`, called by the modal component itself.
- **Types** — `ModalState`, `ModalRequest`, `AlertModalStyle`, `ShowAlertModalOptions`,
  `ShowConfirmModalOptions`, `ShowHeraldryPersistenceModalOptions`, and
  `HeraldryPersistenceModalResult`.

## Usage

```typescript
import { showConfirmModal } from '$lib/ui';

const confirmed = await showConfirmModal({
  title: 'Delete this culture?',
  message: 'This cannot be undone.',
});

if (confirmed) {
  deleteSavedCultureByName(culture.name);
}
```

Import from `$lib/ui`, not from `modal_state.svelte` directly. The facade re-exports everything
except `resetModalStateForTests`, which is a test hook rather than public API — that distinction is
the reason the facade exists.
