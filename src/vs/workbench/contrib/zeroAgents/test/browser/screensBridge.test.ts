/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Emitter } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { NullLogger } from '../../../../../platform/log/common/log.js';
import { HostMsg, ZERO_PROTOCOL_VERSION } from '../../../../../platform/zeroAgents/common/zeroProtocol.js';
import { IScreenConnection, IScreenWebview, ScreensBridge } from '../../browser/screensBridge.js';

class FakeWebview implements IScreenWebview {
	readonly sent: HostMsg[] = [];
	private readonly _onMessage: Emitter<{ readonly message: unknown }>;
	readonly onMessage;

	constructor(store: Pick<DisposableStore, 'add'>) {
		this._onMessage = store.add(new Emitter<{ readonly message: unknown }>());
		this.onMessage = this._onMessage.event;
	}

	async postMessage(message: HostMsg): Promise<boolean> {
		this.sent.push(message);
		return true;
	}

	fromScreen(message: unknown): void {
		this._onMessage.fire({ message });
	}
}

suite('Zero - ScreensBridge', () => {

	const store = ensureNoDisposablesAreLeakedInTestSuite();

	function setup() {
		const webview = new FakeWebview(store);
		const bridge = store.add(new ScreensBridge(webview, 'missionControl', new NullLogger()));
		const connections: IScreenConnection[] = [];
		store.add(bridge.onDidConnect(c => connections.push(c)));
		return { webview, bridge, connections };
	}

	test('answers ready with init and ping', () => {
		const { webview } = setup();
		webview.fromScreen({ type: 'ready' });

		assert.strictEqual(webview.sent.length, 2);
		assert.deepStrictEqual(webview.sent[0], { type: 'init', screen: 'missionControl', protocolVersion: ZERO_PROTOCOL_VERSION });
		assert.strictEqual(webview.sent[1].type, 'ping');
	});

	test('connects when the screen answers the ping', () => {
		const { webview, bridge, connections } = setup();
		webview.fromScreen({ type: 'ready' });
		const ping = webview.sent[1];
		assert.ok(ping.type === 'ping');

		webview.fromScreen({ type: 'pong', requestId: ping.requestId, protocolVersion: ZERO_PROTOCOL_VERSION });

		assert.deepStrictEqual(connections, [{ protocolVersion: ZERO_PROTOCOL_VERSION }]);
		assert.deepStrictEqual(bridge.connection, { protocolVersion: ZERO_PROTOCOL_VERSION });
	});

	test('ignores a pong for another request', () => {
		const { webview, bridge, connections } = setup();
		webview.fromScreen({ type: 'ready' });
		webview.fromScreen({ type: 'pong', requestId: 'not-the-ping', protocolVersion: ZERO_PROTOCOL_VERSION });

		assert.deepStrictEqual(connections, []);
		assert.strictEqual(bridge.connection, undefined);
	});

	test('rejects a screen built for another protocol version', () => {
		const { webview, connections } = setup();
		webview.fromScreen({ type: 'ready' });
		const ping = webview.sent[1];
		assert.ok(ping.type === 'ping');

		webview.fromScreen({ type: 'pong', requestId: ping.requestId, protocolVersion: ZERO_PROTOCOL_VERSION + 1 });

		assert.deepStrictEqual(connections, []);
	});

	test('ignores malformed messages', () => {
		const { webview } = setup();
		webview.fromScreen(undefined);
		webview.fromScreen('ready');
		webview.fromScreen({ type: 'pong' });

		assert.deepStrictEqual(webview.sent, []);
	});
});
