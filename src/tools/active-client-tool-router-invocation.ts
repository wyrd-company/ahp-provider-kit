import type { ActiveClientToolInvocation } from './active-client-tool-invocation.js';

export interface ActiveClientToolRouterInvocation extends ActiveClientToolInvocation {
  readonly useRegisteredToolDisplayName?: boolean;
}
