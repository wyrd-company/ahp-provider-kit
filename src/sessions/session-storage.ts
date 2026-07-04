import type { URI } from '@microsoft/agent-host-protocol';

import type { AgentSessionContext } from './agent-session-context.js';

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
