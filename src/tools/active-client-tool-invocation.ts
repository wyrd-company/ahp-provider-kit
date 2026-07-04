import type { StringOrMarkdown } from '@microsoft/agent-host-protocol';

export interface ActiveClientToolInvocation {
  readonly turnId: string;
  readonly toolCallId: string;
  readonly toolName: string;
  readonly displayName?: string;
  readonly invocationMessage?: StringOrMarkdown;
  readonly toolInput?: string;
  readonly _meta?: Record<string, unknown>;
}
