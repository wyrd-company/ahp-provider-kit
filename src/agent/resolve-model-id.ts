import type { ModelSelection } from '@microsoft/agent-host-protocol';

export function resolveModelId(model: ModelSelection | undefined, fallback: string): string;
export function resolveModelId(model: ModelSelection | undefined, fallback: string | undefined): string | undefined;
export function resolveModelId(model: ModelSelection | undefined, fallback: string | undefined): string | undefined {
  return model?.id ?? fallback;
}
