# Zero touch points

Zero Code Editor keeps its code in new folders (`src/vs/platform/zeroAgents/`,
`src/vs/workbench/contrib/zeroAgents/`, `extensions/theme-defaults/themes/zero-*.json`). Every edit to an
existing VS Code file is listed here, so monthly upstream merges know exactly where conflicts can occur.

Base: VS Code `1.140.0` (branch `upstream`), Zero work on `zero/main`.

Numbers 1–7 follow `docs/09-EDITOR-FORK.md` in the monorepo; 8 and up were added during the build.

| # | File | What | Why |
| --- | --- | --- | --- |
| 1 | `src/vs/workbench/workbench.desktop.main.ts` | `import './contrib/zeroAgents/browser/zeroAgents.contribution.js';` at the end of the contrib imports | Loads all Zero workbench UI. Desktop only: Zero needs the engine host, which web builds do not have |
| 8 | `build/filters.ts` | `unicodeFilter`, `indentationFilter`: skip `src/vs/workbench/contrib/zeroAgents/browser/media/screens/**`. `copyrightFilter`: skip `src/vs/**/zeroAgents/**` and `test/smoke/src/areas/zero/**` | The screens bundle is generated (minified React). Zero files carry Zero's own MIT header instead of Microsoft's, checked by #9 |
| 9 | `eslint.config.js` | Extra config block after the main one: `header/header` with the Zero header for `src/vs/**/zeroAgents/**/*.ts` and `test/smoke/src/areas/zero/**/*.ts` | Enforces the Zero copyright header on Zero sources |
| 10 | `.eslint-ignore` | `src/vs/workbench/contrib/zeroAgents/browser/media/screens/**` | Generated bundle is not linted (also feeds the hygiene `eslintFilter`) |
| 11 | `.eslint-allowed-javascript-files` | `src/vs/workbench/contrib/zeroAgents/browser/media/screens/index.js` | Hygiene blocks new `.js` files under `src/`; the screens bundle has to be JavaScript for the webview |
| 12 | `test/smoke/src/main.ts` | Import of `./areas/zero/zero.test` and `setupZeroTests(logger)` (desktop only) | The smoke runner has no auto-discovery of areas |
