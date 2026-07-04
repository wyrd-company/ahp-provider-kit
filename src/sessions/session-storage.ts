import type { URI } from '@microsoft/agent-host-protocol';

import type { AgentSessionContext } from '../index.js';

/**
 * Configures where an adapter should persist provider-native session content.
 *
 * When a directory is resolved, the provider SHOULD persist all session content
 * under it via its SDK's native storage mechanism.
 *
 * The directory plus the session's ProviderResumeState MUST be sufficient to
 * resume the session with full content on a different machine or path.
 *
 * Adapters with no native storage lever ignore the option and SHOULD say so in
 * their docs.
 *
 * Precedence: an adapter's explicit store/dir injection option (e.g. a concrete
 * LocalAgentStore instance) wins over sessionStorage; adapters offering both
 * must document that order.
 *
 * A static root MUST be a directory-like URI without query or fragment parts;
 * the per-session segment is appended to its path.
 */
export type SessionStorage = URI | ((context: AgentSessionContext) => URI | undefined);

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
