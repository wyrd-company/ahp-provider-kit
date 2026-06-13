import { fileURLToPath } from 'node:url';

import type {
  AgentInfo,
  Message,
  ModelSelection,
  SessionConfigSchema,
  SessionState,
  StateAction,
  StringOrMarkdown,
  ToolCallResult,
  ToolDefinition,
  URI,
} from '@microsoft/agent-host-protocol';

export interface AgentTurnSink {
  emit(action: StateAction): void;
  fail(error: Error): void;
}

export interface ActiveClientTools {
  readonly clientId: string;
  readonly tools: readonly ToolDefinition[];
}

export interface ActiveClientToolInvocation {
  readonly turnId: string;
  readonly toolCallId: string;
  readonly toolName: string;
  readonly displayName?: string;
  readonly invocationMessage?: StringOrMarkdown;
  readonly toolInput?: string;
  readonly _meta?: Record<string, unknown>;
}

export interface ActiveClientToolSink {
  reportInvocation(invocation: ActiveClientToolInvocation): Promise<ToolCallResult>;
}

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

export interface ResumableAgentSessionContext extends AgentSessionContext {
  readonly state: SessionState;
}

export interface AgentSession {
  sendUserMessage(message: Message, sink: AgentTurnSink, signal: AbortSignal, turnId?: string): Promise<void>;
  setActiveClientTools?(activeClientTools: ActiveClientTools | undefined): Promise<void> | void;
  cancel?(reason?: string): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

export interface AgentProvider {
  readonly agent: AgentInfo;
  resolveSessionConfig?(params: {
    workingDirectory?: URI;
    config?: Record<string, unknown>;
  }): Promise<{ schema: SessionConfigSchema; values: Record<string, unknown> }> |
    { schema: SessionConfigSchema; values: Record<string, unknown> };
  createSession(context: AgentSessionContext): Promise<AgentSession> | AgentSession;
}

export interface ResumableAgentProvider extends AgentProvider {
  resumeSession(context: ResumableAgentSessionContext): Promise<AgentSession> | AgentSession;
}

export interface SingleModelAgentInfoOptions {
  readonly providerId: string;
  readonly displayName: string;
  readonly description: string;
  readonly defaultModel: string;
}

export function singleModelAgentInfo(options: SingleModelAgentInfoOptions): AgentInfo {
  return {
    provider: options.providerId,
    displayName: options.displayName,
    description: options.description,
    models: [
      {
        id: options.defaultModel,
        provider: options.providerId,
        name: options.defaultModel,
      },
    ],
  };
}

export function resolveModelId(model: ModelSelection | undefined, fallback: string): string;
export function resolveModelId(model: ModelSelection | undefined, fallback: string | undefined): string | undefined;
export function resolveModelId(model: ModelSelection | undefined, fallback: string | undefined): string | undefined {
  return model?.id ?? fallback;
}

export function uriToPath(uri: URI): string {
  if (!uri.startsWith('file://')) {
    return uri;
  }
  return fileURLToPath(uri);
}

export function markdownPartId(turnId: string): string {
  return `${turnId}:markdown`;
}

export function markdownPart(turnId: string, partId = markdownPartId(turnId)): StateAction {
  return {
    type: 'session/responsePart',
    turnId,
    part: {
      kind: 'markdown',
      id: partId,
      content: '',
    },
  } as StateAction;
}

export class MarkdownTurnEmitter {
  private emitted = false;

  constructor(
    private readonly sink: AgentTurnSink,
    readonly turnId: string,
    readonly partId: string = markdownPartId(turnId),
  ) {}

  get partEmitted(): boolean {
    return this.emitted;
  }

  ensurePart(): void {
    if (this.emitted) {
      return;
    }
    this.emitted = true;
    this.sink.emit(markdownPart(this.turnId, this.partId));
  }

  emitDelta(content: string): void {
    if (!content) {
      return;
    }
    this.ensurePart();
    this.sink.emit({
      type: 'session/delta',
      turnId: this.turnId,
      partId: this.partId,
      content,
    } as StateAction);
  }

  complete(): void {
    this.ensurePart();
    this.sink.emit({
      type: 'session/turnComplete',
      turnId: this.turnId,
    } as StateAction);
  }
}

export interface ActiveClientToolRouterOptions {
  readonly activeClientTools?: ActiveClientTools;
  readonly sink: ActiveClientToolSink;
}

export interface ActiveClientToolRouterInvocation extends ActiveClientToolInvocation {
  readonly useRegisteredToolDisplayName?: boolean;
}

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

export function stringOrMarkdown(value: StringOrMarkdown): string {
  return typeof value === 'string' ? value : value.markdown;
}
