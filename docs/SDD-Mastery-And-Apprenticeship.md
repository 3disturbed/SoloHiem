# Mastery and Apprenticeship Baseline

Professions use stable IDs defined in `data/professions/core.json`. Practice, rank, specialisations, teaching authority and discoveries are separate fields. No fixed class is selected at character creation.

Apprentice performance is capped per dimension. The global ceiling is 0.75 of the associated master's routine performance; invention, first discovery, masterwork creation and civilisation-era advancement remain player-exclusive.

This milestone defines the schema and cap rule only. Offline job execution is deferred until durable world persistence and idempotency storage exist; implementing it against local timers would violate the SDD.
