import type { StateAction } from '@microsoft/agent-host-protocol';

export interface AgentTurnSink {
  emit(action: StateAction): void;
  fail(error: Error): void;
}
