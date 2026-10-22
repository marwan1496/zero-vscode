/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { MAX_AUTO_RESTARTS, recordEngineHostCrash, RESTART_WINDOW_MS } from '../../common/engineHostRestartPolicy.js';

suite('Zero - engine host restart policy', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('restarts up to the limit within the window', () => {
		let crashTimes: readonly number[] = [];
		for (let i = 1; i <= MAX_AUTO_RESTARTS; i++) {
			const decision = recordEngineHostCrash(crashTimes, i * 1000);
			assert.strictEqual(decision.restart, true, `crash ${i}`);
			crashTimes = decision.crashTimes;
		}
		const decision = recordEngineHostCrash(crashTimes, (MAX_AUTO_RESTARTS + 1) * 1000);
		assert.strictEqual(decision.restart, false);
	});

	test('forgets crashes older than the window', () => {
		const old = [0, 1000, 2000];
		const decision = recordEngineHostCrash(old, RESTART_WINDOW_MS + 2000);
		assert.deepStrictEqual(decision.crashTimes, [RESTART_WINDOW_MS + 2000]);
		assert.strictEqual(decision.restart, true);
	});
});
