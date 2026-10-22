/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { registerMainProcessRemoteService } from '../../../../platform/ipc/electron-browser/services.js';
import { IZeroAgentsMainService, ZeroAgentsMainChannelName } from '../../../../platform/zeroAgents/common/zeroAgents.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IZeroAgentsClient } from '../browser/zeroAgentsClient.js';
import { ZeroStartup } from '../browser/zeroStartup.js';
import { NativeZeroAgentsClient } from './zeroAgentsClient.js';

// Zero Code, desktop: the connection to the engine host (docs/02-ARCHITECTURE.md).
// Imported once from workbench.desktop.main.ts (touch point 1, see ZERO_TOUCHPOINTS.md).

import '../browser/zeroAgents.contribution.js';

registerMainProcessRemoteService(IZeroAgentsMainService, ZeroAgentsMainChannelName);
registerSingleton(IZeroAgentsClient, NativeZeroAgentsClient, InstantiationType.Delayed);

registerWorkbenchContribution2(ZeroStartup.ID, ZeroStartup, WorkbenchPhase.AfterRestored);
