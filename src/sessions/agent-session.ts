import type { Message } from '@microsoft/agent-host-protocol';

import type { ActiveClientTools } from '../tools/active-client-tools.js';
import type { AgentTurnSink } from './agent-turn-sink.js';
import type { ProviderResumeState } from './provider-resume-state.js';

export interface AgentSession {
  sendUserMessage(message: Message, sink: AgentTurnSink, signal: AbortSignal, turnId?: string): Promise<void>;
  setActiveClientTools?(activeClientTools: ActiveClientTools | undefined): Promise<void> | void;
  getResumeState?(): Promise<ProviderResumeState | undefined> | ProviderResumeState | undefined;
  cancel?(reason?: string): Promise<void> | void;
  dispose?(): Promise<void> | void;
}
