/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { ZERO_STATUS_ENTRY_ID, ZeroCommandId } from '../common/zeroAgents.js';

/** The "Zero" status bar entry. Run progress, gates and cost are added in Task 2.4. */
export class ZeroStatusBarContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.zeroStatusBar';

	constructor(
		@IStatusbarService statusbarService: IStatusbarService,
	) {
		super();
		const text = localize('zero.status.idle', "Zero");
		this._register(statusbarService.addEntry({
			name: localize('zero.status.name', "Zero"),
			text: `$(zero-view-icon) ${text}`,
			ariaLabel: text,
			tooltip: localize('zero.status.tooltip', "Open Mission Control"),
			command: ZeroCommandId.OpenMissionControl,
		}, ZERO_STATUS_ENTRY_ID, StatusbarAlignment.LEFT, 0));
	}
}
