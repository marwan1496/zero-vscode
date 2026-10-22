/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { DetectedAgentDto, PingResult } from './zeroProtocol.js';

// --- Engine host (utility process) <-> window, over a message port per window ---

/** Channel the engine host serves on every window connection. */
export const ZeroAgentsChannelName = 'zeroAgents';

/** IPC used by a window to ask the main process for a message port to the engine host. */
export const ZeroEngineIpc = {
	createChannel: 'vscode:zeroAgents:createEngineChannel',
	createChannelResult: 'vscode:zeroAgents:createEngineChannelResult',
} as const;

export interface IEnginePingResult extends PingResult {
	readonly engineVersion: string;
	readonly hostPid: number;
}

/**
 * The engine API as seen by a window (docs/02-ARCHITECTURE.md, "Engine <-> workbench service").
 * Grows with the engine; Task 2.1 adds runs, profiles and presets.
 */
export interface IZeroAgentsService {
	readonly _serviceBrand: undefined;
	readonly onEngineEvent: Event<unknown>;
	ping(): Promise<IEnginePingResult>;
	detectAgents(): Promise<readonly DetectedAgentDto[]>;
}

// --- Main process <-> window ---

export const ZeroAgentsMainChannelName = 'zeroAgentsMain';

export const IZeroAgentsMainService = createDecorator<IZeroAgentsMainService>('zeroAgentsMainService');

export interface IEngineHostStatus {
	/** `failed`: crashed too often, waits for a manual restart. */
	readonly state: 'running' | 'stopped' | 'failed';
	/** Increments on every start, so windows can tell a new engine host from the one they know. */
	readonly epoch: number;
}

export interface IZeroAgentsMainService {
	readonly _serviceBrand: undefined;
	readonly onDidChangeEngineHost: Event<IEngineHostStatus>;
	getEngineHostStatus(): Promise<IEngineHostStatus>;
	restartEngine(): Promise<void>;
}

/** What the engine host expects from the vendored engine bundle (`node/vendor/zero-engine.mjs`). */
export interface IZeroEngineModule {
	readonly ENGINE_VERSION: string;
	ping(): PingResult;
	detectAgents(): Promise<readonly DetectedAgentDto[]>;
}
