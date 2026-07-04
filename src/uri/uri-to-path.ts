import { fileURLToPath } from 'node:url';

import type { URI } from '@microsoft/agent-host-protocol';

export function uriToPath(uri: URI): string {
  if (!uri.startsWith('file://')) {
    return uri;
  }
  return fileURLToPath(uri);
}
