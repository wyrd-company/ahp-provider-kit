import type { ToolCallResult } from '@microsoft/agent-host-protocol';

import type { ActiveClientToolInvocation } from './active-client-tool-invocation.js';

export interface ActiveClientToolSink {
  reportInvocation(invocation: ActiveClientToolInvocation): Promise<ToolCallResult>;
}
