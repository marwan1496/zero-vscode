/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { ScreenId } from '../../../../../platform/zeroAgents/common/zeroProtocol.js';
import { zeroViewIcon } from '../../common/zeroIcons.js';

export const ZERO_SCREEN_SCHEME = 'zero-screen';

/** An editor tab that shows one of the React screens. */
export abstract class ZeroScreenInput extends EditorInput {

	abstract readonly screen: ScreenId;

	override get capabilities(): EditorInputCapabilities {
		return super.capabilities | EditorInputCapabilities.Singleton | EditorInputCapabilities.Readonly;
	}

	override getIcon(): ThemeIcon {
		return zeroViewIcon;
	}
}

export class ZeroMissionControlInput extends ZeroScreenInput {

	static readonly ID = 'workbench.input.zero.missionControl';

	readonly screen: ScreenId = 'missionControl';
	readonly resource = URI.from({ scheme: ZERO_SCREEN_SCHEME, path: '/mission-control' });

	override get typeId(): string {
		return ZeroMissionControlInput.ID;
	}

	override getName(): string {
		return localize('zeroMissionControl', "Mission Control");
	}

	override matches(other: EditorInput | IUntypedEditorInput): boolean {
		return other instanceof ZeroMissionControlInput;
	}
}
