export const DARK_FOREST_READINESS = Object.freeze({
  id: 'readiness.dark_forest',
  biomeId: 'darkForest',
  displayName: 'Deepwood readiness',
  unpreparedDangerMultiplier: 2.5,
  requirements: [
    { id: 'equipment', label: 'Meadow expedition gear', weight: 25, all: ['equipment:meadow_weapon', 'equipment:meadow_armour'] },
    { id: 'sustenance', label: 'Long-duration expedition food', weight: 20, all: ['sustenance:expedition_rations'] },
    { id: 'resistance', label: 'Deepwood chill resistance', weight: 20, all: ['resistance:warming_tonic'] },
    { id: 'knowledge', label: 'Deepwood knowledge', weight: 20, all: ['knowledge:bramblethorn_ecology', 'knowledge:deepwood_routes'] },
    { id: 'logistics', label: 'Reliable eastern supply route', weight: 15, all: ['infrastructure:east_road_depot'] },
  ],
});
