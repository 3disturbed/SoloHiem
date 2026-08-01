export default class DomainEventBus {
  constructor(clock = () => Date.now()) {
    this.clock = clock;
    this.handlers = new Map();
    this.sequence = 0;
  }

  subscribe(type, handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  publish(type, payload = {}, context = {}) {
    const event = Object.freeze({
      id: `${this.clock()}-${++this.sequence}`,
      type,
      worldTimestamp: this.clock(),
      actorId: context.actorId || null,
      partyId: context.partyId || null,
      settlementId: context.settlementId || null,
      location: context.location || null,
      provenanceId: context.provenanceId || null,
      payload: Object.freeze({ ...payload }),
    });
    for (const handler of this.handlers.get(type) || []) handler(event);
    for (const handler of this.handlers.get('*') || []) handler(event);
    return event;
  }
}
