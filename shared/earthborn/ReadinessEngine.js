export const READINESS_BANDS = Object.freeze([
  { min: 85, id: 'ready', label: 'READY' },
  { min: 65, id: 'prepared', label: 'PREPARED' },
  { min: 40, id: 'low', label: 'LOW' },
  { min: 0, id: 'critical', label: 'CRITICAL' },
]);

function normaliseCapabilities(capabilities) {
  if (capabilities instanceof Set) return capabilities;
  return new Set(Array.isArray(capabilities) ? capabilities : []);
}

export function evaluateReadiness(profile, capabilities) {
  if (!profile || !Array.isArray(profile.requirements)) {
    throw new TypeError('A readiness profile with requirements is required');
  }
  const available = normaliseCapabilities(capabilities);
  const satisfied = [];
  const deficiencies = [];
  let score = 0;
  let maximumScore = 0;

  for (const requirement of profile.requirements) {
    const weight = Math.max(0, Number(requirement.weight) || 0);
    const required = Array.isArray(requirement.all) ? requirement.all : [];
    const missing = required.filter(capability => !available.has(capability));
    maximumScore += weight;
    if (missing.length === 0) {
      score += weight;
      satisfied.push({ id: requirement.id, label: requirement.label, weight });
    } else {
      deficiencies.push({
        id: requirement.id,
        label: requirement.label,
        weight,
        missing,
        recommendedAction: requirement.recommendedAction || null,
      });
    }
  }

  const percent = maximumScore > 0 ? Math.round((score / maximumScore) * 100) : 0;
  const band = READINESS_BANDS.find(entry => percent >= entry.min) || READINESS_BANDS.at(-1);
  return {
    profileId: profile.id,
    biomeId: profile.biomeId,
    displayName: profile.displayName,
    score: percent,
    band: band.id,
    bandLabel: band.label,
    satisfied,
    deficiencies,
    dangerMultiplier: percent >= 85 ? 1 : Number(profile.unpreparedDangerMultiplier) || 1,
  };
}

export function capApprenticePerformance(masterPerformance, requestedRatio = 0.75) {
  const master = Math.max(0, Number(masterPerformance) || 0);
  const ratio = Math.max(0, Math.min(0.75, Number(requestedRatio) || 0));
  return master * ratio;
}
