/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ILogger } from '../../../../platform/log/common/log.js';
import { HostMsg, isScreenMsg, ScreenId, ZERO_PROTOCOL_VERSION } from '../../../../platform/zeroAgents/common/zeroProtocol.js';

/** The part of a webview the bridge needs; lets tests use a fake. */
export interface IScreenWebview {
	readonly onMessage: Event<{ readonly message: unknown }>;
	postMessage(message: HostMsg): Promise<boolean>;
}

export interface IScreenConnection {
	readonly protocolVersion: number;
}

/**
 * Typed messages between a React screen (packages/screens) and the workbench.
 * Handshake: screen sends `ready` → workbench sends `init` and `ping` → screen answers `pong`.
 */
export class ScreensBridge extends Disposable {

	private readonly _onDidConnect = this._register(new Emitter<IScreenConnection>());
	readonly onDidConnect: Event<IScreenConnection> = this._onDidConnect.event;

	private pendingPing: string | undefined;
	private _connection: IScreenConnection | undefined;

	get connection(): IScreenConnection | undefined {
		return this._connection;
	}

	constructor(
		private readonly webview: IScreenWebview,
		private readonly screen: ScreenId,
		private readonly logger: ILogger,
	) {
		super();
		this._register(webview.onMessage(e => this.onMessage(e.message)));
	}

	private onMessage(message: unknown): void {
		if (!isScreenMsg(message)) {
			this.logger.warn(`[screens] ${this.screen}: ignored malformed message`);
			return;
		}
		switch (message.type) {
			case 'ready':
				this._connection = undefined;
				this.pendingPing = generateUuid();
				this.webview.postMessage({ type: 'init', screen: this.screen, protocolVersion: ZERO_PROTOCOL_VERSION });
				this.webview.postMessage({ type: 'ping', requestId: this.pendingPing });
				break;
			case 'pong':
				if (message.requestId !== this.pendingPing) {
					this.logger.warn(`[screens] ${this.screen}: pong for unknown request ${message.requestId}`);
					return;
				}
				this.pendingPing = undefined;
				if (message.protocolVersion !== ZERO_PROTOCOL_VERSION) {
					this.logger.error(`[screens] ${this.screen}: protocol ${message.protocolVersion}, expected ${ZERO_PROTOCOL_VERSION}; run scripts/sync-vscode.mjs`);
					return;
				}
				this._connection = { protocolVersion: message.protocolVersion };
				this.logger.info(`[screens] ${this.screen}: answered ping (protocol ${message.protocolVersion})`);
				this._onDidConnect.fire(this._connection);
				break;
		}
	}
}
