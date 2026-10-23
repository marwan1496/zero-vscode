/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ZeroCommandId } from './zeroAgents.js';
import { zeroViewIcon } from './zeroIcons.js';

const button = (title: string, command: string) => `[${title}](command:${command})`;

// Images arrive with the polish task (4.6); until then the steps use the built-in empty media.
const noMedia = { type: 'markdown', path: 'empty' } as const;

/**
 * "Get started with Zero Code" (docs/08-WORKBENCH-UI.md, Walkthrough). Added first to the built-in
 * walkthroughs in welcomeGettingStarted/common/gettingStartedContent.ts (ZERO_TOUCHPOINTS.md #6), which makes
 * it the featured one opened on first start. Shaped like `BuiltinGettingStartedCategory`; not typed by it to
 * avoid an import cycle with that file.
 */
export const zeroWalkthrough = {
	id: 'ZeroCodeGetStarted',
	title: localize('zero.walkthrough.title', "Get started with Zero Code"),
	description: localize('zero.walkthrough.description', "Find your coding agents, pick a team and let them build your goal feature by feature"),
	isFeatured: true,
	icon: zeroViewIcon,
	when: '!isWeb',
	walkthroughPageTitle: localize('zero.walkthrough.pageTitle', "Get started with Zero Code"),
	content: {
		type: 'steps' as const,
		steps: [
			{
				id: 'zeroFindAgents',
				title: localize('zero.walkthrough.findAgents.title', "Find your agents"),
				description: localize(
					'zero.walkthrough.findAgents.description',
					"Zero works with the coding agents you already have, such as Claude Code, Codex, OpenCode and Gemini CLI.\n{0}",
					button(localize('zero.walkthrough.findAgents.button', "Find agents"), ZeroCommandId.RescanAgents)
				),
				completionEvents: [`onCommand:${ZeroCommandId.RescanAgents}`],
				media: noMedia,
			},
			{
				id: 'zeroAddProfile',
				title: localize('zero.walkthrough.addProfile.title', "Add a model or profile"),
				description: localize(
					'zero.walkthrough.addProfile.description',
					"Pick which model each agent uses, or add an API key for a model you call directly.\n{0}",
					button(localize('zero.walkthrough.addProfile.button', "Open Agents and Models"), ZeroCommandId.OpenAgentsAndModels)
				),
				completionEvents: [`onCommand:${ZeroCommandId.OpenAgentsAndModels}`],
				media: noMedia,
			},
			{
				id: 'zeroOpenFolder',
				title: localize('zero.walkthrough.openFolder.title', "Open a project folder"),
				description: localize(
					'zero.walkthrough.openFolder.description',
					"Agents work in a copy of your project (a git worktree), so you can keep coding while they build.\n{0}",
					button(localize('zero.walkthrough.openFolder.button', "Open folder"), 'workbench.action.files.openFolder')
				),
				when: 'workspaceFolderCount == 0',
				completionEvents: ['onCommand:workbench.action.files.openFolder', 'onCommand:workbench.action.files.openFileFolder'],
				media: noMedia,
			},
			{
				id: 'zeroFirstRun',
				title: localize('zero.walkthrough.firstRun.title', "Start your first run"),
				description: localize(
					'zero.walkthrough.firstRun.description',
					"Write a goal, choose who plans, reviews and builds, and approve the plan.\n{0}",
					button(localize('zero.walkthrough.firstRun.button', "Start a run"), ZeroCommandId.NewRun)
				),
				completionEvents: [`onCommand:${ZeroCommandId.NewRun}`],
				media: noMedia,
			},
		],
	},
};
