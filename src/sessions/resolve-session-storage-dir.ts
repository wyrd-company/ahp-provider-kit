import type { URI } from '@microsoft/agent-host-protocol';

import type { AgentSessionContext } from './agent-session-context.js';
import type { SessionStorage } from './session-storage.js';

export function resolveSessionStorageDir(
  sessionStorage: SessionStorage | undefined,
  context: AgentSessionContext,
): URI | undefined {
  if (sessionStorage === undefined) {
    return undefined;
  }

  if (typeof sessionStorage === 'function') {
    return sessionStorage(context);
  }

  return appendUriPathSegment(sessionStorage, sessionUriPathSegment(context.sessionUri));
}

function appendUriPathSegment(root: URI, segment: string): URI {
  return `${root}${root.endsWith('/') ? '' : '/'}${segment}`;
}

function sessionUriPathSegment(sessionUri: URI): string {
  return `session-${encodeUriPathSegment(sessionUri)}`;
}

// Escapes with `_HH` rather than percent-encoding: the resolved value is a URI,
// so `%HH` would read as percent-encoded characters and be decoded (or rejected,
// e.g. by fileURLToPath for %2F) by conformant URI consumers. `_` never passes
// through unescaped, so the encoding stays injective and the output alphabet is
// URI-unreserved end to end.
function encodeUriPathSegment(value: string): string {
  let encoded = '';

  for (const byte of new TextEncoder().encode(value)) {
    const character = String.fromCharCode(byte);
    encoded += isSafePathSegmentCharacter(character)
      ? character
      : `_${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  }

  return encoded;
}

function isSafePathSegmentCharacter(character: string): boolean {
  return /^[A-Za-z0-9.-]$/.test(character);
}
