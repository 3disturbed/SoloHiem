# SoloHiem → Earthborn of Ymir Audit

Status: Phase 0 implementation baseline (2026-08-01)

## Executive finding

SoloHiem is a playable browser survival/crafting game with a strong reusable simulation core. It is not yet the persistent multiplayer civilisation described by the SDD: production currently runs `GameServer` inside the browser through `LocalSocket`, and valuable state is stored in localStorage/IndexedDB. The safest conversion path is to preserve the ECS, world generation, combat, inventory, crafting, NPC, quest, farming-adjacent and building foundations behind new domain interfaces, then move the same authoritative commands to a remote host later.

## Baseline assumptions

| SDD assumption | Finding |
|---|---|
| Playable world and controller | Confirmed. Seamless chunk world, movement, interaction and 2D/3D render paths exist. |
| Gathering, inventory, crafting, combat, NPCs | Confirmed. These are mature enough to extend. |
| Save data is single-player or host-authoritative | Confirmed. Browser-local `GameServer` is authoritative for one character. |
| Progression is item/biome led | Confirmed. Biome tiers, recipe stations and gear tiers dominate progression. |
| Existing content should be converted | Confirmed. Five biomes, town, bosses, resources, recipes and quests are reusable. |

## System classification

| Current subsystem | Target module | Decision | Notes |
|---|---|---|---|
| ECS and systems | CharactersAndFollowers / CombatAndHeroicContent | Retain | Clear component/system boundaries and server-side mutation flow. |
| `GameServer` command handlers | NetworkingAndAuthority | Wrap | Already validates most valuable actions; transport is presently local. |
| `LocalSocket` | NetworkingAndAuthority | Replace later | Useful offline/private-server adapter, incompatible with shared persistent worlds as the only transport. |
| PlayerRepository + BrowserDatabase | PersistenceAndOfflineSimulation | Migrate | Keep compatibility adapter; add versioned Earthborn state, then introduce remote durable storage/event log. |
| Chunk world/generation | RegionsAndBiomes / ResourcesAndEcology | Extend | Strong seamless-world base. Add settlement ownership, ecology, routes and persistent biome uses. |
| Biome JSON | RegionsAndBiomes | Extend | Stable IDs exist. Add hazards, readiness profiles, heroic rewards and persistent uses. |
| Inventory/equipment/items | InventoryAndItems | Extend | Add instance IDs, provenance, capability tags and ownership history. |
| Recipes/stations/crafting | CraftingAndQuality | Wrap then extend | Server-authoritative inputs/outputs exist. Add profession mastery, quality and domain events. |
| Hunger, food, alchemy | FoodBrewingAndAlchemy | Extend | Existing consumables/minigame need capability-duration and renewable production chains. |
| Land plots/stations/chests | SettlementsAndBuildings | Extend | Foundation for workshops/storage; lacks civic ownership, policies and settlement specialisation. |
| Roads/town overlay | LogisticsAndTrade | Extend | Visual roads exist but do not yet alter travel, wear, spoilage or supply reliability. |
| Quests, bosses, caves | CombatAndHeroicContent | Extend | Convert rewards toward seeds, knowledge, catalysts and bridge materials. |
| Pet/tamer systems | CharactersAndFollowers | Wrap | Can evolve into creature husbandry/follower capability without discarding working battles. |
| NPC jobs/minigames | ApprenticesAndDelegation | Migrate | Current jobs reward the player directly; future jobs must use named trainees, inputs, caps and logs. |
| Town/NordFolk | Dverghiem | Migrate | Physical central settlement is ideal; rename and divide institutions into four walkable quarters. |
| UI panels/world map | Readiness/social discovery | Extend | Add readiness, provenance, directories and commissions without mode-selection screens. |
| Current tests/CI | Cross-domain acceptance | Replace/rebuild | The recent 3D branch removed the previous package/test/workflow harness. New deterministic domain tests are restored in this milestone. |

## Authority and migration risks

1. Browser-local authority is acceptable only as an offline/private compatibility host. Shared Earthborn worlds require a remote authoritative process.
2. Changing storage keys would silently strand existing saves. Branding changes therefore retain the legacy `dwarventamers` storage namespace until an explicit migration tool exists.
3. Existing equipment entries are definition copies, not durable item instances. Provenance must be introduced version-first and survive equip, trade, repair and storage.
4. World chunks are durable but civilisation state has no global transaction boundary. Economically significant operations need idempotency keys and an append-only audit stream.
5. Pillar outputs are currently weakly coupled. Readiness must become the first shared rule engine before biome content expands.

## First vertical slice

The Meadow → Dark Forest slice establishes the intended loop:

- Wild: survey Deepwood routes and gather meadow inputs.
- Hero: defeat Bramblethorn to recover Emberroot seed knowledge.
- Hearth: cultivate Emberroot and prepare expedition rations/warming tonic.
- Crown: establish the East Road supply depot.
- Readiness: evaluate equipment, sustenance, resistance, knowledge and logistics independently.

Gear alone deliberately cannot produce a READY report. The slice is feature-flagged and data-driven so it can be tuned without changing command code.

## Near-term replacement boundary

The browser host remains supported for the current playable build. New Earthborn domain commands, events and rules must avoid DOM or socket dependencies so they can run unchanged in a future remote server. No new valuable state may be authored exclusively by the client UI.
