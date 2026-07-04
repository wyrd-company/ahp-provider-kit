import type { StringOrMarkdown } from '@microsoft/agent-host-protocol';

export function stringOrMarkdown(value: StringOrMarkdown): string {
  return typeof value === 'string' ? value : value.markdown;
}
