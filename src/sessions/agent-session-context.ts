import type { ModelSelection, URI } from '@microsoft/agent-host-protocol';

import type { ActiveClientTools } from '../tools/active-client-tools.js';
import type { ActiveClientToolSink } from '../tools/active-client-tool-sink.js';

export interface AgentSessionContext {
  readonly sessionUri: URI;
  readonly providerId: string;
  readonly workingDirectory?: URI;
  readonly model?: ModelSelection;
  readonly config?: Record<string, unknown>;
  readonly activeClientId?: string;
  readonly activeClientTools?: ActiveClientTools;
  readonly activeClientToolSink: ActiveClientToolSink;
}
