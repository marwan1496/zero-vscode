/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ZeroCommandId } from '../common/zeroAgents.js';
import { IZeroAgentsClient } from './zeroAgentsClient.js';

/**
 * Connects the window to the engine host once the workbench is restored (docs/08-WORKBENCH-UI.md, "Startup").
 * Task 2.1 adds agent detection, run restore and event fan-out.
 */
export class ZeroStartup extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'zero.startup';

	constructor(
		@IZeroAgentsClient client: IZeroAgentsClient,
		@INotificationService notificationService: INotificationService,
		@ICommandService commandService: ICommandService,
	) {
		super();

		this._register(client.onDidFail(() => {
			notificationService.prompt(
				Severity.Error,
				localize('zero.engineFailed', "The Zero agent engine stopped working and was not restarted."),
				[{
					label: localize('zero.restartEngine.button', "Restart engine"),
					run: () => commandService.executeCommand(ZeroCommandId.RestartEngine),
				}]
			);
		}));

		client.connect();
	}
}
