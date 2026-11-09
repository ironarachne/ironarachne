# Architecture decision records

Write an ADR when future contributors need to know why a durable boundary, storage contract,
or integration strategy exists. Use an existing design document for a full proposal or domain
model, and link it from the ADR. Keep routine implementation choices in the code or PR.

Copy the [template](template.md) to the next available four-digit number and a short kebab-case
title, such as `0004-example-decision.md`. Add it to the index and review it with the change.
Use `Proposed` while under review and `Accepted` once adopted. For a reversal or replacement,
write a new record, mark the earlier one `Superseded`, and link the two in both directions.
Keep the old rationale available.

## Index

- [0001. Store workshop work locally in IndexedDB](0001-local-workshop-storage.md)
- [0002. Share tool components across routes and workshop panels](0002-shared-tool-components.md)
- [0003. Separate common facts from ruleset mechanics](0003-ruleset-qualified-mechanics.md)
