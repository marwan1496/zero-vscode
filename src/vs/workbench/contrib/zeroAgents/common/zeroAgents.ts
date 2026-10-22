/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { localize } from '../../../../nls.js';

export const ZERO_VIEW_CONTAINER_ID = 'workbench.view.zero';
export const ZERO_RUN_VIEW_ID = 'zero.run';
export const ZERO_AGENTS_VIEW_ID = 'zero.agents';

export const ZERO_STATUS_ENTRY_ID = 'zero.status';
export const ZERO_LOGGER_ID = 'zero';

export const enum ZeroCommandId {
	NewRun = 'zero.newRun',
	OpenMissionControl = 'zero.openMissionControl',
	RescanAgents = 'zero.rescanAgents',
	RestartEngine = 'zero.restartEngine',
}

export const ZeroContextKeys = {
	hasRun: new RawContextKey<boolean>('zero.hasRun', false, localize('zero.hasRun', "Whether the current folder has an active Zero run")),
	runPhase: new RawContextKey<string>('zero.runPhase', '', localize('zero.runPhase', "Phase of the active Zero run")),
	gateWaiting: new RawContextKey<boolean>('zero.gateWaiting', false, localize('zero.gateWaiting', "Whether the active Zero run waits for the user")),
	featureStatus: new RawContextKey<string>('zero.featureStatus', '', localize('zero.featureStatus', "Status of the selected Zero feature")),
};
