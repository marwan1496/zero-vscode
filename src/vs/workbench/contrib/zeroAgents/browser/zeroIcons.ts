/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zero Code Editor contributors.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { localize } from '../../../../nls.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';

/** Placeholder glyph (circle with a slash, as in the mockups) until Zero ships its own icon font glyph. */
export const zeroViewIcon = registerIcon('zero-view-icon', Codicon.circleSlash, localize('zeroViewIcon', "View icon of the Zero view."));
