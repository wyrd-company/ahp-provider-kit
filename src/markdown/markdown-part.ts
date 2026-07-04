import type { StateAction } from '@microsoft/agent-host-protocol';

import { markdownPartId } from './markdown-part-id.js';

export function markdownPart(turnId: string, partId = markdownPartId(turnId)): StateAction {
  return {
    type: 'session/responsePart',
    turnId,
    part: {
      kind: 'markdown',
      id: partId,
      content: '',
    },
  } as StateAction;
}
