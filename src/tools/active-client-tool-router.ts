import type { ToolCallResult, ToolDefinition } from '@microsoft/agent-host-protocol';

import type { ActiveClientTools } from './active-client-tools.js';
import type { ActiveClientToolRouterInvocation } from './active-client-tool-router-invocation.js';
import type { ActiveClientToolRouterOptions } from './active-client-tool-router-options.js';

export class ActiveClientToolRouter {
  private activeClientTools: ActiveClientTools | undefined;

  constructor(private readonly options: ActiveClientToolRouterOptions) {
    this.activeClientTools = options.activeClientTools;
  }

  setActiveClientTools(activeClientTools: ActiveClientTools | undefined): void {
    this.activeClientTools = activeClientTools;
  }

  get snapshot(): ActiveClientTools | undefined {
    return this.activeClientTools;
  }

  get tools(): readonly ToolDefinition[] | undefined {
    return this.activeClientTools?.tools;
  }

  findTool(toolName: string): ToolDefinition | undefined {
    return this.activeClientTools?.tools.find(candidate => candidate.name === toolName);
  }

  async reportInvocation(invocation: ActiveClientToolRouterInvocation): Promise<ToolCallResult> {
    const tool = this.findTool(invocation.toolName);
    const inferredDisplayName = invocation.useRegisteredToolDisplayName === false
      ? invocation.toolName
      : tool?.title ?? invocation.toolName;

    return this.options.sink.reportInvocation({
      turnId: invocation.turnId,
      toolCallId: invocation.toolCallId,
      toolName: invocation.toolName,
      displayName: invocation.displayName ?? inferredDisplayName,
      invocationMessage: invocation.invocationMessage ?? inferredDisplayName,
      toolInput: invocation.toolInput,
      ...(invocation._meta ? { _meta: invocation._meta } : {}),
    });
  }
}
