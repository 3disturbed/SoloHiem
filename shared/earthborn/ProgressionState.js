export const EARTHBORN_STATE_VERSION = 1;

export function createEarthbornState(saved = null) {
  return {
    version: EARTHBORN_STATE_VERSION,
    knowledge: [...new Set(saved?.knowledge || [])],
    capabilities: [...new Set(saved?.capabilities || [])],
    professionProgress: saved?.professionProgress && typeof saved.professionProgress === 'object'
      ? structuredClone(saved.professionProgress)
      : {},
    discoveries: Array.isArray(saved?.discoveries) ? structuredClone(saved.discoveries) : [],
    history: Array.isArray(saved?.history) ? structuredClone(saved.history).slice(-100) : [],
  };
}

export function grantKnowledge(state, knowledgeId, credit = {}) {
  if (!state.knowledge.includes(knowledgeId)) {
    state.knowledge.push(knowledgeId);
    state.discoveries.push({ knowledgeId, ...credit });
    state.history.push({ type: 'KnowledgeObserved', knowledgeId, ...credit });
    return true;
  }
  return false;
}

export function grantCapability(state, capabilityId, credit = {}) {
  if (!state.capabilities.includes(capabilityId)) {
    state.capabilities.push(capabilityId);
    state.history.push({ type: 'CapabilityEstablished', capabilityId, ...credit });
    return true;
  }
  return false;
}
