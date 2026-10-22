/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { SyncDescriptor } from '../../../../../platform/instantiation/common/descriptors.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../../browser/parts/views/viewPane.js';
import { ViewPaneContainer } from '../../../../browser/parts/views/viewPaneContainer.js';
import { IViewletViewOptions } from '../../../../browser/parts/views/viewsViewlet.js';
import { Extensions, IViewContainersRegistry, IViewDescriptorService, IViewsRegistry, ViewContainerLocation } from '../../../../common/views.js';
import { ZERO_AGENTS_VIEW_ID, ZERO_RUN_VIEW_ID, ZERO_VIEW_CONTAINER_ID, ZeroCommandId } from '../../common/zeroAgents.js';
import { zeroViewIcon } from '../zeroIcons.js';

/** Shows the active run as a tree (Task 2.4). Until then: welcome content only. */
export class ZeroRunView extends ViewPane {

	static readonly ID = ZERO_RUN_VIEW_ID;

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	override shouldShowWelcome(): boolean {
		return true;
	}
}

/** Lists detected agents and profiles (Task 2.4). Until then: welcome content only. */
export class ZeroAgentsView extends ViewPane {

	static readonly ID = ZERO_AGENTS_VIEW_ID;

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	override shouldShowWelcome(): boolean {
		return true;
	}
}

export function registerZeroViews(): void {
	const viewContainersRegistry = Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry);
	const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);

	const container = viewContainersRegistry.registerViewContainer({
		id: ZERO_VIEW_CONTAINER_ID,
		title: localize2('zero', "Zero"),
		icon: zeroViewIcon,
		ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [ZERO_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
		storageId: ZERO_VIEW_CONTAINER_ID,
		hideIfEmpty: false,
		order: 6,
	}, ViewContainerLocation.Sidebar);

	viewsRegistry.registerViews([{
		id: ZeroRunView.ID,
		name: localize2('zeroRunView', "Run"),
		containerIcon: zeroViewIcon,
		ctorDescriptor: new SyncDescriptor(ZeroRunView),
		canToggleVisibility: true,
		canMoveView: true,
		order: 1,
	}, {
		id: ZeroAgentsView.ID,
		name: localize2('zeroAgentsView', "Agents"),
		containerIcon: zeroViewIcon,
		ctorDescriptor: new SyncDescriptor(ZeroAgentsView),
		canToggleVisibility: true,
		canMoveView: true,
		order: 2,
	}], container);

	viewsRegistry.registerViewWelcomeContent(ZeroRunView.ID, {
		content: localize(
			{ key: 'zeroRunWelcome', comment: ['{Locked="](command:{0})"}'] },
			"No run yet. Write a goal, pick your agents and let them build it feature by feature.\n[Start a run](command:{0})",
			ZeroCommandId.NewRun
		),
	});

	viewsRegistry.registerViewWelcomeContent(ZeroAgentsView.ID, {
		content: localize(
			{ key: 'zeroAgentsWelcome', comment: ['{Locked="](command:{0})"}'] },
			"Zero looks for coding agents installed on this computer (Claude Code, Codex, OpenCode, Gemini CLI).\n[Rescan agents](command:{0})",
			ZeroCommandId.RescanAgents
		),
	});
}
