/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Automatic restarts allowed within {@link RESTART_WINDOW_MS} before giving up (docs/02-ARCHITECTURE.md). */
export const MAX_AUTO_RESTARTS = 3;
export const RESTART_WINDOW_MS = 5 * 60 * 1000;

export interface IRestartDecision {
	/** Crash times inside the window, including this one. */
	readonly crashTimes: readonly number[];
	readonly restart: boolean;
}

/** Records an unexpected engine host exit at `now` and decides whether to restart it. */
export function recordEngineHostCrash(previousCrashTimes: readonly number[], now: number): IRestartDecision {
	const crashTimes = [...previousCrashTimes.filter(t => now - t < RESTART_WINDOW_MS), now];
	return { crashTimes, restart: crashTimes.length <= MAX_AUTO_RESTARTS };
}
