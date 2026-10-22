/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js';
import { ILogger } from '../../log/common/log.js';
import { IEnginePingResult, IZeroAgentsService, IZeroEngineModule } from '../common/zeroAgents.js';
import { DetectedAgentDto } from '../common/zeroProtocol.js';

/** Serves `IZeroAgentsService` inside the engine host by delegating to the engine bundle. */
export class ZeroEngineHostService implements IZeroAgentsService {

	declare readonly _serviceBrand: undefined;

	readonly onEngineEvent: Event<unknown> = Event.None;

	constructor(
		private readonly engine: Promise<IZeroEngineModule>,
		private readonly logger: ILogger,
		private readonly hostPid: number,
	) { }

	async ping(): Promise<IEnginePingResult> {
		const engine = await this.engine;
		const result = engine.ping();
		this.logger.info(`ping (engine ${engine.ENGINE_VERSION}, protocol ${result.protocolVersion})`);
		return { ...result, engineVersion: engine.ENGINE_VERSION, hostPid: this.hostPid };
	}

	async detectAgents(): Promise<readonly DetectedAgentDto[]> {
		return (await this.engine).detectAgents();
	}
}
