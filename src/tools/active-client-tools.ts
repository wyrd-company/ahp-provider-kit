import type { ToolDefinition } from '@microsoft/agent-host-protocol';

export interface ActiveClientTools {
  readonly clientId: string;
  readonly tools: readonly ToolDefinition[];
}
