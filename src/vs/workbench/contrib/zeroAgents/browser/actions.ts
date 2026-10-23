/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ZeroCommandId, ZeroContextKeys } from '../common/zeroAgents.js';
import { ZeroMissionControlInput } from './editors/zeroScreenInputs.js';
import { IZeroAgentsClient } from './zeroAgentsClient.js';
import { getZeroLogger } from './zeroLog.js';

const category = localize2('zeroCategory', "Zero");

async function openMissionControl(accessor: ServicesAccessor): Promise<void> {
	await accessor.get(IEditorService).openEditor(new ZeroMissionControlInput(), { pinned: true });
}

class NewRunAction extends Action2 {
	constructor() {
		super({
			id: ZeroCommandId.NewRun,
			title: localize2('zero.newRun', "New Run"),
			category,
			f1: true,
			precondition: ZeroContextKeys.hasRun.negate(),
		});
	}

	// Mission Control's new-run form arrives in Task 2.3.
	async run(accessor: ServicesAccessor): Promise<void> {
		await openMissionControl(accessor);
	}
}

class OpenMissionControlAction extends Action2 {
	constructor() {
		super({
			id: ZeroCommandId.OpenMissionControl,
			title: localize2('zero.openMissionControl', "Open Mission Control"),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		await openMissionControl(accessor);
	}
}

class RescanAgentsAction extends Action2 {
	constructor() {
		super({
			id: ZeroCommandId.RescanAgents,
			title: localize2('zero.rescanAgents', "Rescan Agents"),
			category,
			f1: true,
		});
	}

	// The engine host answers already; real detection arrives in Task 1.5.
	async run(accessor: ServicesAccessor): Promise<void> {
		const logger = getZeroLogger(accessor.get(ILoggerService));
		const notificationService = accessor.get(INotificationService);
		try {
			const agents = await accessor.get(IZeroAgentsClient).detectAgents();
			logger.info(`[agents] engine reported ${agents.length} agents`);
			notificationService.info(localize('zero.rescanAgents.notYet', "Agent detection is not available yet."));
		} catch (error) {
			logger.error(`[agents] rescan failed: ${toErrorMessage(error)}`);
			notificationService.error(localize('zero.rescanAgents.failed', "Could not reach the Zero agent engine."));
		}
	}
}

class RestartEngineAction extends Action2 {
	constructor() {
		super({
			id: ZeroCommandId.RestartEngine,
			title: localize2('zero.restartEngine', "Restart Agent Engine"),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		getZeroLogger(accessor.get(ILoggerService)).info('[engine] restart requested');
		await accessor.get(IZeroAgentsClient).restartEngine();
	}
}

class OpenAgentsAndModelsAction extends Action2 {
	constructor() {
		super({
			id: ZeroCommandId.OpenAgentsAndModels,
			title: localize2('zero.openAgentsAndModels', "Agents and Models"),
			category,
			f1: true,
		});
	}

	// The Agents and Models screen arrives in Task 3.2.
	async run(accessor: ServicesAccessor): Promise<void> {
		accessor.get(INotificationService).info(localize('zero.openAgentsAndModels.notYet', "The Agents and Models screen is not available yet."));
	}
}

export function registerZeroActions(): void {
	registerAction2(NewRunAction);
	registerAction2(OpenMissionControlAction);
	registerAction2(RescanAgentsAction);
	registerAction2(RestartEngineAction);
	registerAction2(OpenAgentsAndModelsAction);
}
