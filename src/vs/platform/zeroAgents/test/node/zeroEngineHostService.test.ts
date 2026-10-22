/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { NullLogger } from '../../../log/common/log.js';
import { IZeroEngineModule } from '../../common/zeroAgents.js';
import { ZERO_PROTOCOL_VERSION } from '../../common/zeroProtocol.js';
import { ZeroEngineHostService } from '../../node/zeroEngineHostService.js';

const fakeEngine: IZeroEngineModule = {
	ENGINE_VERSION: '9.9.9',
	ping: () => ({ pong: true, protocolVersion: ZERO_PROTOCOL_VERSION }),
	detectAgents: async () => [{ id: 'claude-code', name: 'Claude Code', status: 'ready' }],
};

suite('Zero - ZeroEngineHostService', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('ping adds the engine version and host pid', async () => {
		const service = new ZeroEngineHostService(Promise.resolve(fakeEngine), new NullLogger(), 4242);
		assert.deepStrictEqual(await service.ping(), {
			pong: true,
			protocolVersion: ZERO_PROTOCOL_VERSION,
			engineVersion: '9.9.9',
			hostPid: 4242,
		});
	});

	test('detectAgents delegates to the engine', async () => {
		const service = new ZeroEngineHostService(Promise.resolve(fakeEngine), new NullLogger(), 1);
		assert.deepStrictEqual(await service.detectAgents(), [{ id: 'claude-code', name: 'Claude Code', status: 'ready' }]);
	});

	test('calls fail when the engine bundle could not be loaded', async () => {
		const failed = Promise.reject<IZeroEngineModule>(new Error('bundle missing'));
		failed.catch(() => { /* observed by the calls below */ });
		const service = new ZeroEngineHostService(failed, new NullLogger(), 1);
		await assert.rejects(() => service.ping(), /bundle missing/);
	});
});
