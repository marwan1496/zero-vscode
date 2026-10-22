/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { EditorExtensions, IEditorFactoryRegistry, IEditorSerializer } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { registerZeroActions } from './actions.js';
import { ZeroScreenEditor } from './editors/zeroScreenEditor.js';
import { ZeroMissionControlInput } from './editors/zeroScreenInputs.js';
import { registerZeroSettings } from './settings.js';
import { ZeroStatusBarContribution } from './statusBar.js';
import { registerZeroViews } from './views/zeroViews.js';

// Zero Code: the agent system built into the workbench (docs/08-WORKBENCH-UI.md).
// Loaded by ../electron-browser/zeroAgents.contribution.ts, which adds the engine host connection.

registerZeroViews();
registerZeroActions();
registerZeroSettings();

registerWorkbenchContribution2(ZeroStatusBarContribution.ID, ZeroStatusBarContribution, WorkbenchPhase.BlockRestore);

// --- Screens (webview editors running packages/screens) ---

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(ZeroScreenEditor, ZeroScreenEditor.ID, localize('zeroScreenEditor', "Zero")),
	[new SyncDescriptor(ZeroMissionControlInput)]
);

class ZeroMissionControlInputSerializer implements IEditorSerializer {
	canSerialize(): boolean {
		return true;
	}

	serialize(): string {
		return '';
	}

	deserialize(): EditorInput {
		return new ZeroMissionControlInput();
	}
}

Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory)
	.registerEditorSerializer(ZeroMissionControlInput.ID, ZeroMissionControlInputSerializer);
