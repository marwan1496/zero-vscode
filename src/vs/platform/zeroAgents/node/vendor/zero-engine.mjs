// ../protocol/src/index.ts
var ZERO_PROTOCOL_VERSION = 1;

// src/index.ts
var ENGINE_VERSION = "0.0.0";
function ping() {
  return { pong: true, protocolVersion: ZERO_PROTOCOL_VERSION };
}
async function detectAgents() {
  return [];
}
export {
  ENGINE_VERSION,
  detectAgents,
  ping
};
