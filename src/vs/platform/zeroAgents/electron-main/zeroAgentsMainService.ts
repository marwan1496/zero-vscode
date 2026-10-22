/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IpcMainEvent } from 'electron';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { deepClone } from '../../../base/common/objects.js';
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { NullTelemetryService } from '../../telemetry/common/telemetryUtils.js';
import { UtilityProcess } from '../../utilityProcess/electron-main/utilityProcess.js';
import { MAX_AUTO_RESTARTS, recordEngineHostCrash } from '../common/engineHostRestartPolicy.js';
import { IEngineHostStatus, IZeroAgentsMainService, ZeroEngineIpc } from '../common/zeroAgents.js';

/**
 * Starts and supervises the Zero Engine Host utility process and hands every window a message port to it.
 * Modelled on ElectronPtyHostStarter.
 */
export class ZeroAgentsMainService extends Disposable implements IZeroAgentsMainService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeEngineHost = this._register(new Emitter<IEngineHostStatus>());
	readonly onDidChangeEngineHost = this._onDidChangeEngineHost.event;

	private engineHost: UtilityProcess | undefined;
	private readonly engineHostDisposables = this._register(new MutableDisposable<DisposableStore>());
	private status: IEngineHostStatus = { state: 'stopped', epoch: 0 };
	private crashTimes: readonly number[] = [];
	private shuttingDown = false;

	constructor(
		@ILogService private readonly logService: ILogService,
		@ILifecycleMainService private readonly lifecycleMainService: ILifecycleMainService,
		@IEnvironmentMainService private readonly environmentMainService: IEnvironmentMainService,
	) {
		super();

		validatedIpcMain.on(ZeroEngineIpc.createChannel, (e, nonce) => this.onWindowConnection(e, nonce));
		this._register(toDisposable(() => validatedIpcMain.removeHandler(ZeroEngineIpc.createChannel)));

		// Task 2.1: ask the engine to pause active runs before it is stopped.
		this._register(this.lifecycleMainService.onWillShutdown(() => {
			this.shuttingDown = true;
			this.stop();
		}));
	}

	async getEngineHostStatus(): Promise<IEngineHostStatus> {
		return this.status;
	}

	async restartEngine(): Promise<void> {
		this.logService.info('[zero] restarting the engine host on request');
		this.crashTimes = [];
		this.stop();
		this.start();
	}

	private onWindowConnection(e: IpcMainEvent, nonce: string): void {
		if (this.status.state === 'failed') {
			// Windows reconnect after a manual restart.
			return;
		}
		const engineHost = this.engineHost ?? this.start();
		const port = engineHost.connect();

		// The window may have closed while the engine host was starting.
		if (e.sender.isDestroyed()) {
			port.close();
			return;
		}
		e.sender.postMessage(ZeroEngineIpc.createChannelResult, nonce, [port]);
	}

	private start(): UtilityProcess {
		const store = new DisposableStore();
		const engineHost = store.add(new UtilityProcess(this.logService, NullTelemetryService, this.lifecycleMainService));
		store.add(engineHost.onExit(e => this.onExit(engineHost, e.code)));
		this.engineHost = engineHost;
		this.engineHostDisposables.value = store;

		engineHost.start({
			type: 'zeroEngineHost',
			name: 'zero-engine-host',
			entryPoint: 'vs/platform/zeroAgents/node/zeroEngineHostMain',
			args: ['--logsPath', this.environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath],
			// Task 1.5: resolve the user's login-shell environment so agent CLIs are found on PATH.
			env: { ...deepClone(process.env) },
		});

		this.setStatus({ state: 'running', epoch: this.status.epoch + 1 });
		return engineHost;
	}

	private stop(): void {
		const engineHost = this.engineHost;
		if (!engineHost) {
			return;
		}
		// Clear first so onExit knows this exit was intended.
		this.engineHost = undefined;
		engineHost.kill();
		this.engineHostDisposables.clear();
		this.setStatus({ state: 'stopped', epoch: this.status.epoch });
	}

	private onExit(engineHost: UtilityProcess, code: number): void {
		if (engineHost !== this.engineHost) {
			return; // stopped on purpose
		}
		this.engineHost = undefined;
		this.engineHostDisposables.clear();

		if (this.shuttingDown) {
			return;
		}

		const decision = recordEngineHostCrash(this.crashTimes, Date.now());
		this.crashTimes = decision.crashTimes;
		if (!decision.restart) {
			this.logService.error(`[zero] engine host exited (code ${code}) ${this.crashTimes.length} times in 5 minutes; not restarting`);
			this.setStatus({ state: 'failed', epoch: this.status.epoch });
			return;
		}

		this.logService.warn(`[zero] engine host exited unexpectedly (code ${code}); restarting (${this.crashTimes.length}/${MAX_AUTO_RESTARTS})`);
		this.start();
	}

	private setStatus(status: IEngineHostStatus): void {
		this.status = status;
		this._onDidChangeEngineHost.fire(status);
	}
}
