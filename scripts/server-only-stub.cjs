/**
 * `server-only` throws unless it is loaded inside a Next server context, which
 * a plain tsx script is not. The modules under test are legitimately
 * server-only; this just lets a Node script import them to verify their output.
 *
 * Used by `pnpm verify:parity`. Never loaded by the app.
 */
const Module = require("node:module");
const load = Module._load;

Module._load = function (request, ...rest) {
  if (request === "server-only") return {};
  return load.call(this, request, ...rest);
};
