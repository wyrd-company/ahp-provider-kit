import type { AgentProvider } from './agent-provider.js';
import type { AgentSession } from './agent-session.js';
import type { ResumableAgentSessionContext } from './resumable-agent-session-context.js';

export interface ResumableAgentProvider extends AgentProvider {
  resumeSession(context: ResumableAgentSessionContext): Promise<AgentSession> | AgentSession;
}
