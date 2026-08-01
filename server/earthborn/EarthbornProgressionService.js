import InventoryComponent from '../ecs/components/InventoryComponent.js';
import EquipmentComponent from '../ecs/components/EquipmentComponent.js';
import PlayerComponent from '../ecs/components/PlayerComponent.js';
import { ITEM_DB } from '../../shared/ItemTypes.js';
import { MSG } from '../../shared/MessageTypes.js';
import { DARK_FOREST_READINESS } from '../../shared/earthborn/Definitions.js';
import { evaluateReadiness } from '../../shared/earthborn/ReadinessEngine.js';
import { grantCapability, grantKnowledge } from '../../shared/earthborn/ProgressionState.js';

const ARMOUR_SLOTS = ['head', 'body', 'legs', 'feet', 'shield'];

export default class EarthbornProgressionService {
  constructor(gameServer) {
    this.gameServer = gameServer;
  }

  deriveCapabilities(entity) {
    const pc = entity.getComponent(PlayerComponent);
    const inventory = entity.getComponent(InventoryComponent);
    const equipment = entity.getComponent(EquipmentComponent);
    const capabilities = new Set(pc?.earthborn?.capabilities || []);
    for (const knowledge of pc?.earthborn?.knowledge || []) capabilities.add(knowledge);

    const weapon = equipment?.getEquipped('weapon');
    if (weapon && (Number(weapon.tier) || 1) >= 1) capabilities.add('equipment:meadow_weapon');
    const armourPieces = ARMOUR_SLOTS.filter(slot => equipment?.getEquipped(slot)).length;
    if (armourPieces >= 2) capabilities.add('equipment:meadow_armour');

    if (inventory?.countItem('expedition_rations') > 0) capabilities.add('sustenance:expedition_rations');
    if (inventory?.countItem('warming_tonic') > 0) capabilities.add('resistance:warming_tonic');
    return capabilities;
  }

  getStatePayload(entity) {
    const pc = entity.getComponent(PlayerComponent);
    return {
      state: pc?.earthborn,
      readiness: evaluateReadiness(DARK_FOREST_READINESS, this.deriveCapabilities(entity)),
    };
  }

  sync(playerConn, entity, notice = null) {
    if (!this.gameServer.earthbornEnabled) return;
    playerConn.emit(MSG.EARTHBORN_STATE, { ...this.getStatePayload(entity), notice });
  }

  onBossDefeated(enemyEntity, entityManager) {
    if (!this.gameServer.earthbornEnabled) return;
    if (enemyEntity.enemyConfig?.id !== 'bramblethorn') return;
    for (const entity of entityManager.getByTag('player')) {
      const pc = entity.getComponent(PlayerComponent);
      const inventory = entity.getComponent(InventoryComponent);
      if (!pc || !inventory) continue;
      const learned = grantKnowledge(pc.earthborn, 'knowledge:bramblethorn_ecology', {
        discovererId: pc.playerId,
        source: 'hero.bramblethorn',
        worldTimestamp: Date.now(),
      });
      if (learned) {
        inventory.addItem('emberroot_seed', 1);
        inventory.addItem('bramble_resin', 2);
        grantCapability(pc.earthborn, 'seed:emberroot_recovered', {
          actorId: pc.playerId,
          source: 'hero.bramblethorn',
          worldTimestamp: Date.now(),
        });
      }
      const connection = this.gameServer.players.get(pc.playerId);
      if (connection) {
        connection.emit(MSG.INVENTORY_UPDATE, { slots: inventory.serialize().slots });
        this.sync(connection, entity, learned
          ? 'Bramblethorn yielded Emberroot seed and lost ecological knowledge.'
          : null);
      }
    }
  }

  onRecipeCrafted(playerConn, entity, recipeId) {
    if (!this.gameServer.earthbornEnabled) return;
    const pc = entity.getComponent(PlayerComponent);
    if (!pc) return;
    const capabilityByRecipe = {
      cultivate_emberroot: 'crop:emberroot_renewable',
      expedition_rations: 'sustenance:expedition_rations',
      warming_tonic: 'resistance:warming_tonic',
      east_road_depot_charter: 'infrastructure:east_road_depot',
    };
    const capability = capabilityByRecipe[recipeId];
    if (!capability) return;
    grantCapability(pc.earthborn, capability, {
      actorId: pc.playerId,
      recipeId,
      worldTimestamp: Date.now(),
    });
    if (recipeId === 'cultivate_emberroot') {
      grantKnowledge(pc.earthborn, 'knowledge:emberroot_cultivation', {
        discovererId: pc.playerId,
        source: 'hearth.first_emberroot_harvest',
        worldTimestamp: Date.now(),
      });
    }
    this.sync(playerConn, entity, `Civilisation capability established: ${ITEM_DB[recipeId]?.name || capability}`);
  }

  onQuestCompleted(playerConn, entity, questId) {
    if (!this.gameServer.earthbornEnabled) return;
    if (questId !== 'quest_explore_darkforest') return;
    const pc = entity.getComponent(PlayerComponent);
    if (!pc) return;
    const learned = grantKnowledge(pc.earthborn, 'knowledge:deepwood_routes', {
      discovererId: pc.playerId,
      source: 'wild.deepwood_boundary',
      worldTimestamp: Date.now(),
    });
    if (learned) this.sync(playerConn, entity, 'Deepwood routes surveyed. The East Road depot can now be established.');
  }
}
