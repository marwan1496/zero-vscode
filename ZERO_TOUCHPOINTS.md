# Zero touch points

Zero Code Editor keeps its code in new folders (`src/vs/platform/zeroAgents/`,
`src/vs/workbench/contrib/zeroAgents/`, `extensions/theme-defaults/themes/zero-*.json`). Every edit to an
existing VS Code file is listed here, so monthly upstream merges know exactly where conflicts can occur.

Base: VS Code `1.140.0` (branch `upstream`), Zero work on `zero/main`.

Numbers 1–7 follow `docs/09-EDITOR-FORK.md` in the monorepo; 8 and up were added during the build.

| # | File | What | Why |
| --- | --- | --- | --- |
| 1 | `src/vs/workbench/workbench.desktop.main.ts` | `import './contrib/zeroAgents/electron-browser/zeroAgents.contribution.js';` at the end of the contrib imports | Loads all Zero workbench UI (the electron-browser contribution imports the browser one). Desktop only: Zero needs the engine host, which web builds do not have |
| 2 | `src/vs/code/electron-main/app.ts` | Imports; `services.set(IZeroAgentsMainService, new SyncDescriptor(ZeroAgentsMainService, undefined, true))` after the Utility Process Worker service; `mainProcessElectronServer.registerChannel(ZeroAgentsMainChannelName, …)` after the Utility Process Worker channel | Starts and supervises the Zero Engine Host utility process and lets windows talk to the supervisor |
| 8 | `build/filters.ts` | `unicodeFilter`, `indentationFilter`: skip `src/vs/workbench/contrib/zeroAgents/browser/media/screens/**` and `src/vs/platform/zeroAgents/node/vendor/**`. `copyrightFilter`: skip `src/vs/**/zeroAgents/**` and `test/smoke/src/areas/zero/**` | The screens and engine bundles are generated. Zero files carry Zero's own MIT header instead of Microsoft's, checked by #9 |
| 9 | `eslint.config.js` | Extra config block after the main one: `header/header` with the Zero header for `src/vs/**/zeroAgents/**/*.ts` and `test/smoke/src/areas/zero/**/*.ts` | Enforces the Zero copyright header on Zero sources |
| 10 | `.eslint-ignore` | `src/vs/workbench/contrib/zeroAgents/browser/media/screens/**`, `src/vs/platform/zeroAgents/node/vendor/**` | Generated bundles are not linted (also feeds the hygiene `eslintFilter`) |
| 11 | `.eslint-allowed-javascript-files` | `src/vs/workbench/contrib/zeroAgents/browser/media/screens/index.js`, `src/vs/platform/zeroAgents/node/vendor/zero-engine.mjs` | Hygiene blocks new `.js`/`.mjs` files under `src/`; both bundles are built JavaScript (webview script, engine loaded by the engine host) |
| 12 | `test/smoke/src/main.ts` | Import of `./areas/zero/zero.test` and `setupZeroTests(logger)` (desktop only) | The smoke runner has no auto-discovery of areas |
