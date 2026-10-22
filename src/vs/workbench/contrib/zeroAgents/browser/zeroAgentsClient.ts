/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IEnginePingResult } from '../../../../platform/zeroAgents/common/zeroAgents.js';
import { DetectedAgentDto } from '../../../../platform/zeroAgents/common/zeroProtocol.js';

export const IZeroAgentsClient = createDecorator<IZeroAgentsClient>('zeroAgentsClient');

/**
 * The window's connection to the Zero Engine Host. The desktop implementation lives in
 * `electron-browser/zeroAgentsClient.ts` (it needs a message port from the main process).
 */
export interface IZeroAgentsClient {
	readonly _serviceBrand: undefined;

	/** Fires after every successful (re)connection, with the engine's ping answer. */
	readonly onDidConnect: Event<IEnginePingResult>;

	/** Fires when the engine host crashed too often and waits for a manual restart. */
	readonly onDidFail: Event<void>;

	/** Connects (or reconnects) to the engine host and pings it. `undefined` when that fails. */
	connect(): Promise<IEnginePingResult | undefined>;

	restartEngine(): Promise<void>;

	detectAgents(): Promise<readonly DetectedAgentDto[]>;
}
