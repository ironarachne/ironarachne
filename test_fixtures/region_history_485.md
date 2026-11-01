# Regional history editorial review (#485)

**Status:** reproducible review specimens. The human editorial decision and reviewed packet fingerprint are recorded in [acceptance evidence](../docs/region-history-acceptance.md).

Reproduce with `npx vite-node scripts/render_region_history_review.ts`. Fixtures reuse the explicit present-support builders from #482, based on the frozen pre-history map. These are fictional backstories compatible with saved present facts, not proof of past events. Historical predecessor names are invented; present inhabitants are not projected into the past.

## sparse

History seed: `history-test`.

Present: one unaffiliated town at its recorded dry-land site; no realms or organizations.

### Event 1 — Founding of Reedford

Reedford was founded at its present site.

Explains: Reedford

Rule: `fantasy:region:history:settlement-founding:v1`. Causes: none recorded.

Saved compatibility observations: settlement, fact.

## crowded

History seed: `history-test`.

Present: eight realms (six subordinate to Realm H), eight towns at recorded sites, ten organizations with five explicit rivalries. The six-event budget cannot cover every input.

### Event 1 — Founding of the Former Realm of Illier

The Former Realm of Illier came into being.

Explains: the Realm of C

Rule: `fantasy:region:history:predecessor-founding:v1`. Causes: none recorded.

Saved compatibility observations: realm, historicalActor.

### Event 2 — Fall of the Former Realm of Illier

The Former Realm of Illier ceased to exist as a polity, leaving the Realm of C as its successor.

Explains: the Realm of C

Rule: `fantasy:region:history:predecessor-fall:v1`. Causes: Founding of the Former Realm of Illier.

Saved compatibility observations: realm, historicalActor.

### Event 3 — War between Order A and Order B

A war between Order A and Order B left their rivalry unresolved.

Explains: Order A; Explains: Order B

Rule: `fantasy:region:history:rivalry-war:v1`. Causes: none recorded.

Saved compatibility observations: organization, organization.

### Event 4 — War between Order E and Order F

A war between Order E and Order F left their rivalry unresolved.

Explains: Order E; Explains: Order F

Rule: `fantasy:region:history:rivalry-war:v1`. Causes: none recorded.

Saved compatibility observations: organization, organization.

### Event 5 — Incorporation of the Realm of A

The Realm of A entered the authority of the Realm of H, a relationship that continues today.

Explains: the Realm of A

Rule: `fantasy:region:history:subordination:v1`. Causes: none recorded.

Saved compatibility observations: realm, realm.

### Event 6 — Incorporation of the Realm of E

The Realm of E became subordinate to the Realm of H and remains so today.

Explains: the Realm of E

Rule: `fantasy:region:history:subordination:v1`. Causes: none recorded.

Saved compatibility observations: realm, realm.

## unaffiliated

History seed: `unaffiliated:485`.

Present: one town at its recorded site and two explicitly rival organizations. No realms, regional authority, or political affiliation.

### Event 1 — Founding of Order B

Order B came into being.

Explains: Order B

Rule: `fantasy:region:history:organization-founding:v1`. Causes: none recorded.

Saved compatibility observations: organization.

### Event 2 — War between Order A and Order B

A war between Order A and Order B left their rivalry unresolved.

Explains: Order A; Explains: Order B

Rule: `fantasy:region:history:rivalry-war:v1`. Causes: none recorded.

Saved compatibility observations: organization, organization.

### Event 3 — Founding of Reedford

The settlement of Reedford began at the site it occupies today.

Explains: Reedford

Rule: `fantasy:region:history:settlement-founding:v1`. Causes: none recorded.

Saved compatibility observations: settlement, fact.

## conflicting-claims

History seed: `conflicting-claims:482`.

Present: Realms A and B each have an unpressed claim concerning the other; neither is subordinate. Claims do not establish ownership.

### Event 1 — Founding of the Former Realm of Intiea

This period saw the founding of the Former Realm of Intiea.

Explains: the Realm of A

Rule: `fantasy:region:history:predecessor-founding:v1`. Causes: none recorded.

Saved compatibility observations: realm, historicalActor.

### Event 2 — Fall of the Former Realm of Intiea

The Former Realm of Intiea ceased to exist as a polity, leaving the Realm of A as its successor.

Explains: the Realm of A

Rule: `fantasy:region:history:predecessor-fall:v1`. Causes: Founding of the Former Realm of Intiea.

Saved compatibility observations: realm, historicalActor.

### Event 3 — Founding of the Realm of B

The Realm of B came into being.

Explains: the Realm of B

Rule: `fantasy:region:history:realm-founding:v1`. Causes: none recorded.

Saved compatibility observations: realm.

### Event 4 — War between the Realm of A and the Realm of B

War between the Realm of A and the Realm of B ended without resolving the claim between them.

Explains: the Realm of B

Rule: `fantasy:region:history:claim-war:v1`. Causes: none recorded.

Saved compatibility observations: realm, realm.

## Review questions

Do the short accounts read coherently, with clear causal order? Are Explains labels useful without implying historical proof? Does the one-event account avoid filler, and does the predecessor founding/fall bundle clearly distinguish the past polity from current realms? Report any sentence that adds unsupported current ownership, destruction, geography, ongoing war, migration, production, a named founder, or current inhabitants acting in the past.
