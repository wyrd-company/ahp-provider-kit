import type { AgentInfo, SessionConfigSchema, URI } from '@microsoft/agent-host-protocol';

import type { AgentSession } from './agent-session.js';
import type { AgentSessionContext } from './agent-session-context.js';

export interface AgentProvider {
  readonly agent: AgentInfo;
  resolveSessionConfig?(params: {
    workingDirectory?: URI;
    config?: Record<string, unknown>;
  }): Promise<{ schema: SessionConfigSchema; values: Record<string, unknown> }> |
    { schema: SessionConfigSchema; values: Record<string, unknown> };
  createSession(context: AgentSessionContext): Promise<AgentSession> | AgentSession;
}
