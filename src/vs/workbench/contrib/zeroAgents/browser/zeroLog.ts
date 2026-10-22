/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ILogger, ILoggerService } from '../../../../platform/log/common/log.js';
import { ZERO_LOGGER_ID } from '../common/zeroAgents.js';

/** The "Zero" log, shown in the Output view. All Zero workbench code logs here. */
export function getZeroLogger(loggerService: ILoggerService): ILogger {
	return loggerService.getLogger(ZERO_LOGGER_ID)
		?? loggerService.createLogger(ZERO_LOGGER_ID, { name: localize('zeroLog', "Zero") });
}
