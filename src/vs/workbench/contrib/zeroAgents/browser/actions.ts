/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ZeroCommandId, ZeroContextKeys } from '../common/zeroAgents.js';
import { ZeroMissionControlInput } from './editors/zeroScreenInputs.js';
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

	// Agent detection runs in the engine host (Tasks 0.4 and 1.5).
	async run(accessor: ServicesAccessor): Promise<void> {
		getZeroLogger(accessor.get(ILoggerService)).info('[agents] rescan requested; agent detection is not available yet');
		accessor.get(INotificationService).info(localize('zero.rescanAgents.notYet', "Agent detection is not available yet."));
	}
}

export function registerZeroActions(): void {
	registerAction2(NewRunAction);
	registerAction2(OpenMissionControlAction);
	registerAction2(RescanAgentsAction);
}
