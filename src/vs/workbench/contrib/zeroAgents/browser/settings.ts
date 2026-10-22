/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ConfigurationScope, Extensions, IConfigurationPropertySchema, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

// Defaults follow RunSettingsSchema in docs/04-SCHEMAS.md.
function timeout(who: string, defaultMinutes: number): IConfigurationPropertySchema {
	return {
		type: 'number',
		default: defaultMinutes,
		minimum: 1,
		maximum: 180,
		description: localize({ key: 'zero.timeouts', comment: ['{0} is a role or "each check command"'] }, "Minutes before {0} is stopped.", who),
	};
}

export function registerZeroSettings(): void {
	Registry.as<IConfigurationRegistry>(Extensions.Configuration).registerConfiguration({
		id: 'zero',
		title: localize('zeroConfigurationTitle', "Zero"),
		type: 'object',
		properties: {
			'zero.agents.extraPath': {
				type: 'array',
				items: { type: 'string' },
				default: [],
				scope: ConfigurationScope.MACHINE,
				description: localize('zero.agents.extraPath', "Extra folders to search for agent commands, in addition to your login shell's PATH."),
			},
			'zero.terminals.keepAfterRun': {
				type: 'boolean',
				default: true,
				description: localize('zero.terminals.keepAfterRun', "Keep agent terminals open after a run ends."),
			},
			'zero.notifications.level': {
				type: 'string',
				enum: ['all', 'gates', 'none'],
				enumDescriptions: [
					localize('zero.notifications.level.all', "Notify on every run event."),
					localize('zero.notifications.level.gates', "Notify only when a run needs you."),
					localize('zero.notifications.level.none', "Never notify."),
				],
				default: 'gates',
				description: localize('zero.notifications.level', "When Zero shows notifications."),
			},
			'zero.defaults.gate': {
				type: 'string',
				enum: ['off', 'tests', 'standard', 'strict'],
				enumDescriptions: [
					localize('zero.defaults.gate.off', "Run no checks."),
					localize('zero.defaults.gate.tests', "Tests must pass."),
					localize('zero.defaults.gate.standard', "Tests and lint must pass."),
					localize('zero.defaults.gate.strict', "Tests, lint, static analysis and build must pass, and new tests are required."),
				],
				default: 'standard',
				description: localize('zero.defaults.gate', "Test gate for new runs."),
			},
			'zero.defaults.planRounds': {
				type: 'number',
				enum: [1, 2, 3],
				default: 3,
				description: localize('zero.defaults.planRounds', "Maximum plan review rounds for new runs."),
			},
			'zero.defaults.fixRounds': {
				type: 'number',
				enum: [1, 2, 3, 5],
				default: 3,
				description: localize('zero.defaults.fixRounds', "Maximum fix rounds per feature for new runs."),
			},
			'zero.defaults.workspace': {
				type: 'string',
				enum: ['worktree', 'folder'],
				enumDescriptions: [
					localize('zero.defaults.workspace.worktree', "Agents work in a separate git worktree on a new branch."),
					localize('zero.defaults.workspace.folder', "Agents work directly in the project folder."),
				],
				default: 'worktree',
				description: localize('zero.defaults.workspace', "Where agents work in new runs."),
			},
			'zero.timeouts.planner': timeout(localize('zero.role.planner', "the planner"), 20),
			'zero.timeouts.planReviewer': timeout(localize('zero.role.planReviewer', "a plan reviewer"), 15),
			'zero.timeouts.implementer': timeout(localize('zero.role.implementer', "the implementer"), 45),
			'zero.timeouts.featureReviewer': timeout(localize('zero.role.featureReviewer', "the feature reviewer"), 15),
			'zero.timeouts.fixer': timeout(localize('zero.role.fixer', "the fixer"), 30),
			'zero.timeouts.check': timeout(localize('zero.role.check', "each check command"), 15),
		},
	});
}
