# Circular Progression Implementation

Earthborn progression is evaluated through capabilities, not a universal level. Profiles live in `data/readiness/`; the deterministic evaluator lives in `shared/earthborn/ReadinessEngine.js`.

The first profile targets the Dark Forest and weights five pillars:

- Equipment: meadow weapon and armour capability.
- Sustenance: renewable expedition food.
- Hazard countermeasure: warming tonic.
- Knowledge: Bramblethorn ecology and surveyed Deepwood routes.
- Logistics: East Road supply depot.

Scores communicate preparation; they do not create invisible walls. At low readiness the player can still enter, but the profile exposes a target danger multiplier and concrete recommendations. Later combat/exposure systems should consume the same report rather than add biome-specific conditionals.

Feature flag: `earthborn.circularProgression` in `data/featureFlags.json`.
