import type { SessionState } from '@microsoft/agent-host-protocol';

import type { AgentSessionContext } from './agent-session-context.js';
import type { ProviderResumeState } from './provider-resume-state.js';

export interface ResumableAgentSessionContext extends AgentSessionContext {
  readonly state: SessionState;
  readonly resumeState?: ProviderResumeState;
}
