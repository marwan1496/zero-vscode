/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { raceTimeout } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Client as MessagePortClient } from '../../../../base/parts/ipc/common/ipc.mp.js';
import { acquirePort } from '../../../../base/parts/ipc/electron-browser/ipc.mp.js';
import { ILogger, ILoggerService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IEngineHostStatus, IEnginePingResult, IZeroAgentsMainService, IZeroAgentsService, ZeroAgentsChannelName, ZeroEngineIpc } from '../../../../platform/zeroAgents/common/zeroAgents.js';
import { DetectedAgentDto, ZERO_PROTOCOL_VERSION } from '../../../../platform/zeroAgents/common/zeroProtocol.js';
import { IZeroAgentsClient } from '../browser/zeroAgentsClient.js';
import { getZeroLogger } from '../browser/zeroLog.js';

const CONNECT_TIMEOUT_MS = 20_000;
const PING_TIMEOUT_MS = 10_000;

/**
 * Connects this window to the Zero Engine Host through a message port handed out by the main process
 * (pattern: LocalTerminalBackend and the pty host). Reconnects when the main process restarts the engine host.
 */
export class NativeZeroAgentsClient extends Disposable implements IZeroAgentsClient {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidConnect = this._register(new Emitter<IEnginePingResult>());
	readonly onDidConnect = this._onDidConnect.event;

	private readonly _onDidFail = this._register(new Emitter<void>());
	readonly onDidFail = this._onDidFail.event;

	private readonly connection = this._register(new MutableDisposable<DisposableStore>());
	private proxy: IZeroAgentsService | undefined;
	private connecting: Promise<IEnginePingResult | undefined> | undefined;
	/** Epoch of the engine host this window is connected to; `undefined` before the first connection. */
	private connectedEpoch: number | undefined;
	private wantsConnection = false;
	private readonly logger: ILogger;

	constructor(
		@IZeroAgentsMainService private readonly mainService: IZeroAgentsMainService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@ILoggerService loggerService: ILoggerService,
	) {
		super();
		this.logger = getZeroLogger(loggerService);
		this._register(this.mainService.onDidChangeEngineHost(status => this.onEngineHostStatus(status)));
	}

	connect(): Promise<IEnginePingResult | undefined> {
		this.wantsConnection = true;
		if (!this.connecting) {
			this.connecting = this.doConnect().finally(() => this.connecting = undefined);
		}
		return this.connecting;
	}

	async restartEngine(): Promise<void> {
		// The main process announces the new engine host; onEngineHostStatus reconnects.
		await this.mainService.restartEngine();
	}

	async detectAgents(): Promise<readonly DetectedAgentDto[]> {
		const proxy = this.proxy ?? (await this.connect(), this.proxy);
		if (!proxy) {
			throw new Error('The agent engine is not available.');
		}
		return proxy.detectAgents();
	}

	private onEngineHostStatus(status: IEngineHostStatus): void {
		switch (status.state) {
			case 'running': {
				// The first connection starts the engine host itself; ignore that announcement.
				const isNewHost = this.connectedEpoch === undefined ? !this.connecting : status.epoch > this.connectedEpoch;
				if (this.wantsConnection && isNewHost) {
					this.logger.warn(`[engine] engine host restarted (epoch ${status.epoch}); reconnecting`);
					this.connect();
				}
				break;
			}
			case 'failed':
				this.logger.error('[engine] engine host keeps crashing and was not restarted. Run "Zero: Restart Agent Engine".');
				this.disconnect();
				this._onDidFail.fire();
				break;
			case 'stopped':
				this.disconnect();
				break;
		}
	}

	private disconnect(): void {
		this.proxy = undefined;
		this.connection.clear();
	}

	private async doConnect(): Promise<IEnginePingResult | undefined> {
		this.disconnect();
		const started = Date.now();
		try {
			const port = await raceTimeout(acquirePort(ZeroEngineIpc.createChannel, ZeroEngineIpc.createChannelResult), CONNECT_TIMEOUT_MS);
			if (!port) {
				throw new Error(`no answer from the main process within ${CONNECT_TIMEOUT_MS} ms`);
			}

			const store = new DisposableStore();
			const client = store.add(new MessagePortClient(port, `window:${this.nativeHostService.windowId}`));
			this.connection.value = store;
			const proxy = ProxyChannel.toService<IZeroAgentsService>(client.getChannel(ZeroAgentsChannelName));

			const result = await raceTimeout(proxy.ping(), PING_TIMEOUT_MS);
			if (!result) {
				throw new Error(`the engine host did not answer ping within ${PING_TIMEOUT_MS} ms`);
			}
			if (result.protocolVersion !== ZERO_PROTOCOL_VERSION) {
				throw new Error(`engine speaks protocol ${result.protocolVersion}, the workbench expects ${ZERO_PROTOCOL_VERSION}; run scripts/sync-vscode.mjs`);
			}

			this.proxy = proxy;
			this.connectedEpoch = (await this.mainService.getEngineHostStatus()).epoch;
			this.logger.info(`[engine] connected: ping answered in ${Date.now() - started} ms (engine ${result.engineVersion}, protocol ${result.protocolVersion}, host pid ${result.hostPid}, epoch ${this.connectedEpoch})`);
			this._onDidConnect.fire(result);
			return result;
		} catch (error) {
			this.disconnect();
			this.logger.error(`[engine] could not connect: ${toErrorMessage(error)}`);
			return undefined;
		}
	}
}
