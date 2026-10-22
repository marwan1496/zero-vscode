/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Application, Logger } from '../../../../automation';
import { installAllHandlers } from '../../utils';

export function setup(logger: Logger) {
	describe('Zero', () => {

		// Shared before/after handling
		installAllHandlers(logger);

		it('shows the Zero view container and status bar entry', async function () {
			const app = this.app as Application;
			await app.code.waitForElement('.activitybar .action-item a[aria-label^="Zero"]');
			await app.code.waitForElement('footer[id="workbench.parts.statusbar"] .statusbar-item[id="zero.status"]');
		});

		it('opens Mission Control and the screen answers ping', async function () {
			const app = this.app as Application;
			await app.workbench.quickaccess.runCommand('zero.openMissionControl');
			await app.workbench.editors.waitForTab('mission-control');
			await app.code.waitForElement('.zero-screen-editor[data-zero-bridge="connected"]');
		});
	});
}
