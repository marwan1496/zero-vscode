/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { pathToFileURL } from 'url';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { FileAccess } from '../../../base/common/network.js';
import { ProxyChannel } from '../../../base/parts/ipc/common/ipc.js';
import { Server as UtilityProcessServer } from '../../../base/parts/ipc/node/ipc.mp.js';
import { localize } from '../../../nls.js';
import { OPTIONS, parseArgs } from '../../environment/node/argv.js';
import { NativeEnvironmentService } from '../../environment/node/environmentService.js';
import { getLogLevel } from '../../log/common/log.js';
import { LoggerService } from '../../log/node/loggerService.js';
import product from '../../product/common/product.js';
import { IProductService } from '../../product/common/productService.js';
import { IZeroEngineModule, ZeroAgentsChannelName } from '../common/zeroAgents.js';
import { ZeroEngineHostService } from './zeroEngineHostService.js';

// Entry point of the Zero Engine Host utility process (docs/09-EDITOR-FORK.md, section 2).
// Started by ZeroAgentsMainService; modelled on the terminal's ptyHostMain.

startZeroEngineHost();

function startZeroEngineHost(): void {
	const disposables = new DisposableStore();
	const server = new UtilityProcessServer();

	const productService: IProductService = { _serviceBrand: undefined, ...product };
	const environmentService = new NativeEnvironmentService(parseArgs(process.argv, OPTIONS), productService);
	const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
	const logger = disposables.add(loggerService.createLogger('zeroEngineHost', { name: localize('zeroEngineHost', "Zero Engine Host") }));

	// The bundle is loaded by URL rather than a static import: it is plain JavaScript built in the monorepo
	// (scripts/sync-vscode.mjs) and typed here by IZeroEngineModule.
	const engineUri = FileAccess.asFileUri('vs/platform/zeroAgents/node/vendor/zero-engine.mjs');
	const engine: Promise<IZeroEngineModule> = import(pathToFileURL(engineUri.fsPath).href);
	engine.then(
		e => logger.info(`engine ${e.ENGINE_VERSION} loaded, host pid ${process.pid}`),
		err => logger.error(`failed to load the engine bundle from ${engineUri.fsPath}: ${err}`)
	);

	// Register synchronously so window connections never race the engine import.
	server.registerChannel(ZeroAgentsChannelName, ProxyChannel.fromService(new ZeroEngineHostService(engine, logger, process.pid), disposables));

	process.once('exit', () => {
		logger.info('engine host exiting');
		disposables.dispose();
	});
}
