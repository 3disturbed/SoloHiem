# ADR 0001: Preserve the browser host as a compatibility adapter

Decision: retain `LocalSocket` and browser persistence for the current playable build, but place all new Earthborn rules in transport-agnostic shared modules.

Reason: removing the working local host before a remote persistent host exists would discard stable foundations and break saves. Treating it as the final multiplayer authority would violate the SDD.

Consequence: Earthborn state is versioned and migration-safe now. Shared-world networking, accounts and durable event storage remain an explicit replacement boundary.
