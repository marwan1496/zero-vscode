/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, append, Dimension } from '../../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../../base/common/network.js';
import { joinPath } from '../../../../../base/common/resources.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
import { ILoggerService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../../common/editor.js';
import { IEditorGroup } from '../../../../services/editor/common/editorGroupsService.js';
import { asWebviewUri, webviewGenericCspSource } from '../../../webview/common/webview.js';
import { IWebviewElement, IWebviewService } from '../../../webview/browser/webview.js';
import { ScreensBridge } from '../screensBridge.js';
import { getZeroLogger } from '../zeroLog.js';
import { ZeroScreenInput } from './zeroScreenInputs.js';

const screensRoot = FileAccess.asFileUri('vs/workbench/contrib/zeroAgents/browser/media/screens/');

/**
 * Hosts a React screen (packages/screens, synced into media/screens) in a webview.
 * Pattern follows the image carousel editor: one webview element per pane, mounted on first input.
 */
export class ZeroScreenEditor extends EditorPane {

	static readonly ID = 'workbench.editor.zeroScreen';

	private container: HTMLElement | undefined;
	private webview: IWebviewElement | undefined;
	private readonly inputDisposables = this._register(new DisposableStore());

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWebviewService private readonly webviewService: IWebviewService,
		@ILoggerService private readonly loggerService: ILoggerService,
	) {
		super(ZeroScreenEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.container = append(parent, $('.zero-screen-editor'));
	}

	override async setInput(input: ZeroScreenInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void> {
		await super.setInput(input, options, context, token);
		if (token.isCancellationRequested || !this.container) {
			return;
		}

		this.inputDisposables.clear();
		this.container.dataset.zeroBridge = 'connecting';

		if (!this.webview) {
			this.webview = this._register(this.webviewService.createWebviewElement({
				title: input.getName(),
				options: { retainContextWhenHidden: true },
				contentOptions: { allowScripts: true, localResourceRoots: [screensRoot] },
				extension: undefined,
			}));
			this.webview.mountTo(this.container, this.window);
		}

		const bridge = this.inputDisposables.add(new ScreensBridge(this.webview, input.screen, getZeroLogger(this.loggerService)));
		this.inputDisposables.add(bridge.onDidConnect(() => {
			if (this.container) {
				this.container.dataset.zeroBridge = 'connected';
			}
		}));
		this.webview.setHtml(this.renderHtml());
	}

	override clearInput(): void {
		this.inputDisposables.clear();
		super.clearInput();
	}

	override focus(): void {
		super.focus();
		this.webview?.focus();
	}

	override layout(dimension: Dimension): void {
		if (this.container) {
			this.container.style.width = `${dimension.width}px`;
			this.container.style.height = `${dimension.height}px`;
		}
	}

	private renderHtml(): string {
		const nonce = generateUuid();
		const script = asWebviewUri(joinPath(screensRoot, 'index.js')).toString(true);
		const style = asWebviewUri(joinPath(screensRoot, 'index.css')).toString(true);
		const csp = [
			`default-src 'none'`,
			`img-src ${webviewGenericCspSource} data:`,
			`style-src ${webviewGenericCspSource} 'unsafe-inline'`,
			`script-src 'nonce-${nonce}'`,
			`font-src ${webviewGenericCspSource}`,
		].join('; ');
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="${style}">
</head>
<body>
	<div id="root"></div>
	<script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
	}
}
