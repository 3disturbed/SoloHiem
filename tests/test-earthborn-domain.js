import DomainEventBus from '../shared/earthborn/DomainEventBus.js';
import { DARK_FOREST_READINESS } from '../shared/earthborn/Definitions.js';
import { capApprenticePerformance, evaluateReadiness } from '../shared/earthborn/ReadinessEngine.js';
import { createEarthbornState, grantKnowledge } from '../shared/earthborn/ProgressionState.js';
import { ITEM_DB } from '../shared/ItemTypes.js';
import { RECIPE_DB } from '../shared/RecipeTypes.js';

let passed = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`  [PASS] ${message}`);
  passed++;
}

console.log('\nEarthborn Domain Tests');
const gearOnly = evaluateReadiness(DARK_FOREST_READINESS, ['equipment:meadow_weapon', 'equipment:meadow_armour']);
assert(gearOnly.score === 25 && gearOnly.band === 'critical', 'gear alone cannot prepare the next biome');
assert(gearOnly.dangerMultiplier === 2.5, 'unprepared Deepwood retains the extreme danger jump');
const complete = evaluateReadiness(DARK_FOREST_READINESS, DARK_FOREST_READINESS.requirements.flatMap(r => r.all));
assert(complete.score === 100 && complete.band === 'ready', 'cross-pillar preparation reaches READY');
assert(complete.deficiencies.length === 0, 'complete preparation has no deficiencies');
assert(capApprenticePerformance(100, 1) === 75, 'apprentice output never exceeds 75% of master routine output');
assert(capApprenticePerformance(80, 0.5) === 40, 'lower apprentice training remains proportional');
const state = createEarthbornState();
assert(grantKnowledge(state, 'knowledge:test', { discovererId: 'dwarf-1' }), 'first discovery is recorded');
assert(!grantKnowledge(state, 'knowledge:test', { discovererId: 'dwarf-2' }), 'knowledge grants are idempotent');
assert(state.discoveries[0].discovererId === 'dwarf-1', 'first discoverer credit is permanent');
const bus = new DomainEventBus(() => 1000);
let observed = null;
bus.subscribe('SeedRecovered', event => { observed = event; });
bus.publish('SeedRecovered', { seedId: 'emberroot' }, { actorId: 'dwarf-1', settlementId: 'dverghiem' });
assert(observed?.actorId === 'dwarf-1' && observed?.payload.seedId === 'emberroot', 'domain events carry provenance context');
const migrated = createEarthbornState({ knowledge: ['knowledge:legacy'], capabilities: ['legacy:capability'] });
assert(migrated.version === 1 && migrated.knowledge.includes('knowledge:legacy'), 'legacy saves migrate into versioned Earthborn state');
assert(ITEM_DB.emberroot_seed && ITEM_DB.emberroot && ITEM_DB.warming_tonic, 'heroic seed and cultivated Hearth outputs are real inventory items');
assert(RECIPE_DB.cultivate_emberroot && RECIPE_DB.expedition_rations && RECIPE_DB.east_road_depot_charter, 'Hearth cultivation and Crown outputs are craftable recipes');
console.log(`\n  Results: ${passed} passed, 0 failed`);
